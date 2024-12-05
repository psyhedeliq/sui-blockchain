import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import fs from "fs";
import path from "path";
import { GAS_BUDGET, NETWORK, suiClient } from "../config/config";
import { loadPackageId, savePackageId } from "../config/package-config";
import {
    ParsedJson,
    StorageData,
    StorageFields,
    StorageResult,
} from "../interfaces/interfaces";
import { compileMovePackage } from "../util/move-compiler";

// Store the package ID after deploying the storage package
export let STORAGE_PACKAGE_ID: string | null = loadPackageId();

/**
 * Deploys the storage package and returns the package ID.
 * @param creator - The keypair of the creator.
 * @returns The package ID of the deployed storage package.
 */
export async function deployStoragePackage(
    creator: Ed25519Keypair
): Promise<string> {
    try {
        const movePath = path.join(__dirname, "../move/storage");

        // Compile the Move code to deploy the NFT package/contract
        try {
            await compileMovePackage(movePath);
        } catch (error) {
            console.error("Error compiling Move code:", error);
            throw new Error("Failed to compile Move code in Storage package");
        }

        // Read the compiled bytecode
        const compiledBytes = fs.readFileSync(
            path.join(
                movePath,
                "build/storage_app/bytecode_modules/immutable_storage.mv"
            )
        );

        // Create a new transaction object
        const txb = new Transaction();
        // Set a gas budget for the transaction
        txb.setGasBudget(GAS_BUDGET); // amount in MIST

        // Publish the compiled bytecode to the Sui network
        // upgradeCap stands for "upgrade capability" and is a standard pattern in Sui
        const [upgradeCap] = txb.publish({
            modules: [Array.from(compiledBytes)],
            dependencies: [
                "0x1", // MoveStdlib - Core Move language features
                "0x2", // Sui Framework - Sui's built-in modules - Sui-specific features
            ],
        });

        txb.transferObjects(
            [upgradeCap], // The upgrade capability object that controls upgrade rights
            txb.pure.address(creator.toSuiAddress()) // The creator's address
        );

        const result = await suiClient.signAndExecuteTransaction({
            transaction: txb,
            signer: creator,
            options: {
                showEvents: true,
                showEffects: true,
            },
            requestType: "WaitForLocalExecution",
        });

        if (result.effects?.status?.status !== "success") {
            throw new Error(
                result.effects?.status?.error ||
                    "Failed to deploy storage package"
            );
        }

        // Find the package object (owner field will be Immutable)
        const packageObject = result.effects?.created?.find(
            (obj) => obj.owner === "Immutable"
        );

        if (!packageObject?.reference?.objectId) {
            throw new Error(
                "Could not find package ID in storage deployment transaction response"
            );
        }

        STORAGE_PACKAGE_ID = packageObject.reference.objectId;
        savePackageId(STORAGE_PACKAGE_ID);
        return STORAGE_PACKAGE_ID;
    } catch (error) {
        console.error("Error deploying storage package:", error);
        throw error;
    }
}

/**
 * Stores immutable data on the blockchain.
 * @param data - The data to be stored.
 * @param dataType - The type of the data.
 * @param creator - The keypair of the creator.
 * @returns The result of the storage operation.
 */
export async function storeImmutableData(
    data: string,
    dataType: string,
    creator: Ed25519Keypair
): Promise<StorageResult> {
    try {
        const txb = new Transaction();
        txb.setGasBudget(GAS_BUDGET); // amount in MIST

        // Call our custom storage contract
        txb.moveCall({
            target: `${STORAGE_PACKAGE_ID}::immutable_storage::store_data`,
            arguments: [txb.pure.string(data), txb.pure.string(dataType)],
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
            throw new Error(result.effects?.status?.error || "Storage failed");
        }

        console.log("\x1b[32m--------------------------------");
        console.table({
            Status: "Success ✅",
            "Transaction Digest": result.digest,
            "View the transaction at": `https://${NETWORK}.suivision.xyz/txblock/${result.digest}`,
        });
        console.log("--------------------------------\x1b[0m");

        // Get the storage data from events
        const storageEvent = result.events?.[0];
        const parsedJson = storageEvent?.parsedJson as ParsedJson;
        const storageData = {
            id: parsedJson?.id ?? "",
            data: data,
            timestamp: Number(storageEvent?.timestampMs ?? Date.now()),
            dataType: dataType,
            creator: creator.toSuiAddress(),
        };

        return {
            success: true,
            digest: result.digest,
            effects: result.effects,
            events: result.events,
            storageData,
        };
    } catch (error) {
        return {
            success: false,
            error: (error as Error).message,
        };
    }
}

/**
 * Retrieves immutable data from the blockchain using the object ID.
 * @param objectId - The ID of the object containing the data.
 * @returns The data stored in the object, or null if the object is not found or does not contain data.
 */
export async function retrieveImmutableData(
    objectId: string
): Promise<StorageData | null> {
    try {
        const object = await suiClient.getObject({
            id: objectId,
            options: {
                showContent: true,
            },
        });

        if (!object.data?.content) {
            return null;
        }

        // Because object.data.content is of type SuiParsedData
        const parsedData = object.data.content as unknown as {
            fields: StorageFields;
        };

        const fields = parsedData.fields;

        return {
            id: objectId,
            data: fields.data ?? "",
            timestamp: Number(fields.timestamp),
            dataType: fields.data_type ?? "",
            creator: fields.creator ?? "",
        };
    } catch (error) {
        console.error("Error retrieving data:", error);
        return null;
    }
}
