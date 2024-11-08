import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import fs from "fs";
import path from "path";
import { GAS_BUDGET, suiClient } from "../config/config";
import { loadPackageId, savePackageId } from "../config/package-config";
import {
    NFTMintResult,
    NFTMoveObject,
    TransactionResult,
} from "../interfaces/interfaces";
import { compileMovePackage } from "../util/move-compiler";

// Store the package ID after deploying the NFT package
export let NFT_PACKAGE_ID: string | null = loadPackageId();

/**
 * How to handle gas in production:
 * Query the network's current gas price instead of using fixed values [await suiClient.getReferenceGasPrice()]
 * Calculate the budget based on the actual transaction complexity
 * Handle gas-related errors properly
 * This is important because:
 * - Gas prices can fluctuate based on network conditions
 * - Fixed gas budgets might be too high (wasteful) or too low (fail)
 * - Different transactions require different amounts of gas
 */

/**
 * Deploys an NFT package.
 * @param creator - The keypair of the creator.
 * @returns The ID of the deployed package.
 */
export async function deployNFTPackage(
    creator: Ed25519Keypair
): Promise<string> {
    try {
        const movePath = path.join(__dirname, "../move/simple_nft");

        // Compile the Move code to deploy the NFT package/contract
        try {
            await compileMovePackage(movePath);
        } catch (error) {
            console.error("Error compiling Move code:", error);
            throw new Error("Failed to compile Move code in NFT package");
        }

        // Read the compiled bytecode
        const compiledBytes = fs.readFileSync(
            path.join(
                movePath,
                "build/simple_nft/bytecode_modules/simple_nft.mv"
            )
        );

        // Create a new transaction object
        const txb = new Transaction();
        // Set a gas budget for the transaction
        txb.setGasBudget(GAS_BUDGET); // amount in MIST

        // Publish the compiled bytecode to the Sui network
        // upgradeCap stands for "upgrade capability" and is a standard pattern in Sui
        const [upgradeCap] = txb.publish({
            modules: [Array.from(compiledBytes)], // Convert compiled Move bytecode to an array format required by the SDK
            dependencies: [
                "0x1", // MoveStdlib - Core Move language features
                "0x2", // Sui Framework - Sui's built-in modules - Sui-specific features
            ],
        });

        // Transfer the upgrade cap to the publisher
        // This capability allows the publisher to upgrade the package later
        // Without this, the package would be immutable
        txb.transferObjects(
            [upgradeCap], // The upgrade capability object that controls upgrade rights
            txb.pure.address(creator.toSuiAddress()) // The creator's address
        );

        const result = await suiClient.signAndExecuteTransaction({
            transaction: txb,
            signer: creator,
            options: {
                showEvents: true,
                showObjectChanges: true,
                showEffects: true,
            },
            requestType: "WaitForLocalExecution",
        });

        if (result.effects?.status?.status !== "success") {
            throw new Error(
                result.effects?.status?.error || "Failed to publish package"
            );
        }

        // Find the package object (owner field will be Immutable)
        const packageObject = result.effects?.created?.find(
            (obj) => obj.owner === "Immutable"
        );

        if (!packageObject?.reference?.objectId) {
            throw new Error(
                "Could not find package ID in NFT deployment transaction response"
            );
        }

        // Store the package ID, not the upgrade cap ID
        NFT_PACKAGE_ID = packageObject.reference.objectId;
        savePackageId(NFT_PACKAGE_ID!);
        return NFT_PACKAGE_ID!;
    } catch (error) {
        console.error("Error deploying NFT package:", error);
        throw error;
    }
}

/**
 * Mint a new NFT
 * @param creator - The keypair of the creator
 * @param name - The name of the NFT
 * @param description - The description of the NFT
 * @param url - The URL of the NFT
 * @returns The result of the NFT minting
 */
export async function mintNFT(
    packageId: string,
    creator: Ed25519Keypair,
    name: string,
    description: string,
    url: string
): Promise<NFTMintResult> {
    try {
        const txb = new Transaction();
        // Set a gas budget for the transaction
        txb.setGasBudget(GAS_BUDGET); // amount in MIST

        /**
         * The minting process uses moveCall to interact with our Move contract:
         * Calls the mint_and_transfer function from our package
         * Uses txb.pure.string() to properly format Move string arguments
         * The NFT is automatically transferred to the creator's address by the Move code
         */
        txb.moveCall({
            target: `${packageId}::simple_nft::mint_and_transfer`, // The target function in the Move contract
            arguments: [
                txb.pure.string(name),
                txb.pure.string(description),
                txb.pure.string(url),
            ],
        });

        const result = await suiClient.signAndExecuteTransaction({
            transaction: txb,
            signer: creator,
            options: {
                showEffects: true,
                showEvents: true,
                showObjectChanges: true,
            },
            requestType: "WaitForLocalExecution",
        });

        if (result.effects?.status?.status !== "success") {
            throw new Error(
                result.effects?.status?.error || "Transaction failed"
            );
        }

        // Find the created NFT object from the transaction effects
        const createdObject = result.effects?.created?.[0];

        if (!createdObject?.reference) {
            throw new Error(
                "Could not find created NFT ID in transaction response"
            );
        }

        return {
            success: true,
            digest: result.digest,
            nft: {
                id: createdObject.reference.objectId,
                name,
                description,
                url,
            },
        };
    } catch (error) {
        return {
            success: false,
            error: (error as Error).message,
        };
    }
}

/**
 * Transfers an NFT to the recipient.
 * @param nftId - The ID of the NFT to transfer.
 * @param fromKeypair - The keypair of the sender.
 * @param recipientAddress - The address of the recipient.
 */
export async function transferNFT(
    nftId: string,
    fromKeypair: Ed25519Keypair,
    recipientAddress: string
): Promise<TransactionResult> {
    try {
        const txb = new Transaction();
        // Set a gas budget for the transaction
        txb.setGasBudget(GAS_BUDGET); // amount in MIST

        /**
         * The transfer implementation:
         * Our NFT has the store capability
         * We can use Sui's built-in transfer module
         * No need for custom Move functions for transfer
         */
        txb.transferObjects(
            [txb.object(nftId)], // The NFT object to transfer
            txb.pure.address(recipientAddress) // The recipient's address
        );

        const result = await suiClient.signAndExecuteTransaction({
            transaction: txb,
            signer: fromKeypair,
            options: {
                showEffects: true,
                showEvents: true,
                showObjectChanges: true,
            },
            requestType: "WaitForLocalExecution",
        });

        if (result.effects?.status?.status !== "success") {
            throw new Error(result.effects?.status?.error || "Transfer failed");
        }

        return {
            success: true,
            digest: result.digest,
            effects: result.effects,
            events: result.events,
            objectChanges: result.objectChanges,
        };
    } catch (error) {
        console.error("Error transferring NFT:", error);
        return {
            success: false,
            error: (error as Error).message,
        };
    }
}

/**
 * Retrieves an NFT by its ID.
 * @param nftId - The ID of the NFT to retrieve.
 * @returns The NFT object or null if not found.
 */
export async function getNFTById(nftId: string): Promise<NFTMoveObject | null> {
    try {
        const object = await suiClient.getObject({
            id: nftId,
            options: {
                showContent: true,
                showType: true,
                showOwner: true,
            },
        });

        if (
            object.data?.content?.dataType === "moveObject" &&
            object.data?.content?.type.includes("::simple_nft::SimpleNFT")
        ) {
            // Add owner information to the returned object
            const owner = object.data.owner;
            let ownerAddress: string | null = null;

            if (owner && typeof owner === "object") {
                if ("AddressOwner" in owner) {
                    ownerAddress = owner.AddressOwner;
                } else if ("ObjectOwner" in owner) {
                    ownerAddress = owner.ObjectOwner;
                }
                // Shared ownership is handled as null
            }

            return {
                ...object.data,
                owner: ownerAddress,
            } as NFTMoveObject;
        }
        return null;
    } catch (error) {
        console.error("Error fetching NFT:", error);
        return null;
    }
}

/**
 * Burns (permanently destroys) an NFT.
 * @param nftId - The ID of the NFT to burn.
 * @param owner - The keypair of the owner.
 * @returns The result of the NFT burning.
 */
export async function burnNFT(
    nftId: string,
    owner: Ed25519Keypair
): Promise<TransactionResult> {
    try {
        // Verify that the NFT exists and is owned by the sender
        const nft = await getNFTById(nftId);
        if (!nft || nft.owner !== owner.toSuiAddress()) {
            throw new Error("NFT not found or not owned by the sender");
        }

        const txb = new Transaction();
        txb.setGasBudget(GAS_BUDGET); // amount in MIST

        // Call the burn function from the Move contract
        txb.moveCall({
            target: `${NFT_PACKAGE_ID}::simple_nft::burn`,
            arguments: [txb.object(nftId)],
        });

        const result = await suiClient.signAndExecuteTransaction({
            transaction: txb,
            signer: owner,
            options: {
                showEffects: true,
                showEvents: true,
                showObjectChanges: true,
            },
            requestType: "WaitForLocalExecution",
        });

        if (result.effects?.status?.status !== "success") {
            throw new Error(result.effects?.status?.error || "Burn failed");
        }

        return {
            success: true,
            digest: result.digest,
        };
    } catch (error) {
        return {
            success: false,
            error: (error as Error).message,
        };
    }
}
