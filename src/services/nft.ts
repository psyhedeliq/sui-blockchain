import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import {
    CollectionCreationResult,
    NFTMintResult,
    TransactionResult,
} from "../types/types";
import { Transaction } from "@mysten/sui/transactions";
import { suiClient } from "../config/config";
import { bcs } from "@mysten/sui/bcs";

/**
 * Mint a new NFT
 * @param creator - The keypair of the creator
 * @param name - The name of the NFT
 * @param description - The description of the NFT
 * @param url - The URL of the NFT
 * @returns The result of the NFT minting
 */
export async function mintNFT(
    creator: Ed25519Keypair,
    name: string,
    description: string,
    url: string
): Promise<NFTMintResult> {
    try {
        const packageObj = await suiClient.getObject({
            id: "0x2",
            options: { showContent: true },
        });

        console.log("--------------------------------");
        console.log({
            "Package Object": packageObj,
        });
        console.log("--------------------------------");

        const txb = new Transaction();
        txb.setGasBudget(100000000);

        // //Call the NFT mint function from the NFT package
        // const mintCall = txb.moveCall({
        //     target: "0x2::devnet_nft::mint",
        //     arguments: [
        //         txb.pure.string(name),
        //         txb.pure.string(description),
        //         txb.pure.string(url),
        //     ],
        // });

        // Convert strings to vector<u8> (byte arrays)
        const nameBytes = Array.from(Buffer.from(name, "utf8"));
        const descriptionBytes = Array.from(Buffer.from(description, "utf8"));
        const urlBytes = Array.from(Buffer.from(url, "utf8"));

        // Convert each byte to a TransactionArgument ('u8')
        const nameArgs = nameBytes.map((byte) => txb.pure("u8", byte));
        const descriptionArgs = descriptionBytes.map((byte) =>
            txb.pure("u8", byte)
        );
        const urlArgs = urlBytes.map((byte) => txb.pure("u8", byte));

        // Call the NFT mint function from the NFT package using makeMoveVec
        txb.moveCall({
            target: "0x2::devnet_nft::mint",
            arguments: [
                txb.makeMoveVec({ elements: nameArgs }),
                txb.makeMoveVec({ elements: descriptionArgs }),
                txb.makeMoveVec({ elements: urlArgs }),
            ],
        });

        console.log("--------------------------------");
        console.log({
            "Transaction details": txb,
        });
        console.log("--------------------------------");

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

        console.log("Transaction Result:", JSON.stringify(result, null, 2));

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

export async function transferNFT(
    nftId: string,
    fromKeypair: Ed25519Keypair,
    toAddress: string
): Promise<TransactionResult> {
    try {
        const tx = new Transaction();
        tx.setGasBudget(100000000);

        // Transfer the NFT
        tx.transferObjects([tx.object(nftId)], toAddress);

        const result = await suiClient.signAndExecuteTransaction({
            transaction: tx,
            signer: fromKeypair,
        });

        await suiClient.waitForTransaction({
            digest: result.digest,
        });

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

// /**
//  * Create a new NFT Collection
//  * @param creator - The keypair of the creator
//  * @param name - The name of the collection
//  * @param description - The description of the collection
//  * @returns The result of the collection creation
//  */
// export async function createCollection(
//     creator: Ed25519Keypair,
//     name: string,
//     description: string
// ): Promise<CollectionCreationResult> {
//     try {
//         const tx = new Transaction();
//         tx.setGasBudget(50000000);

//         // Convert strings to vector<u8>
//         const nameBytes = Array.from(Buffer.from(name, "utf8"));
//         const descriptionBytes = Array.from(Buffer.from(description, "utf8"));

//         // Wrap each byte as a 'u8' TransactionArgument
//         const nameArgs = nameBytes.map((byte) => tx.pure("u8", byte));
//         const descriptionArgs = descriptionBytes.map((byte) =>
//             tx.pure("u8", byte)
//         );

//         // Call the collection creation function
//         tx.moveCall({
//             target: "0x2::devnet_nft::create_collection",
//             arguments: [
//                 tx.makeMoveVec({ elements: nameArgs }),
//                 tx.makeMoveVec({ elements: descriptionArgs }),
//             ],
//         });

//         console.log("--------------------------------");
//         console.log({
//             "Transaction details": tx,
//         });
//         console.log("--------------------------------");

//         const result = await suiClient.signAndExecuteTransaction({
//             transaction: tx,
//             signer: creator,
//             options: {
//                 showEffects: true,
//                 showEvents: true,
//                 showObjectChanges: true,
//             },
//             requestType: "WaitForLocalExecution",
//         });

//         console.log("Transaction Result:", JSON.stringify(result, null, 2));

//         if (result.effects?.status?.status !== "success") {
//             throw new Error(
//                 result.effects?.status?.error || "Transaction failed"
//             );
//         }

//         // Log the created objects for debugging
//         if (result.effects.created && result.effects.created.length > 0) {
//             console.log(
//                 "Created Objects:",
//                 JSON.stringify(result.effects.created, null, 2)
//             );
//         }

//         // Find the created collection object from the transaction effects
//         const createdObjectRef = result.effects.created?.[0]?.reference;
//         if (!createdObjectRef) {
//             throw new Error("No objects were created in the transaction");
//         }

//         if (!createdObjectRef) {
//             throw new Error(
//                 "Could not find created Collection ID in transaction response"
//             );
//         }

//         // Fetch the full object to get its type
//         const createdObject = await suiClient.getObject({
//             id: createdObjectRef.objectId,
//             options: {
//                 showType: true,
//                 showOwner: true,
//                 showContent: true,
//             },
//         });

//         if (!createdObject || !createdObject.data) {
//             throw new Error("Failed to fetch the created collection object");
//         }

//         const objectType = createdObject.data.type ?? "";

//         if (!objectType.startsWith("0x2::nft::Collection")) {
//             throw new Error(`Unexpected object type: ${objectType}`);
//         }

//         return {
//             success: true,
//             digest: result.digest,
//             collection: {
//                 id: createdObject.data.objectId,
//                 name,
//                 description,
//             },
//         };
//     } catch (error) {
//         console.error("Error creating collection:", error);
//         return {
//             success: false,
//             error: (error as Error).message,
//         };
//     }
// }
