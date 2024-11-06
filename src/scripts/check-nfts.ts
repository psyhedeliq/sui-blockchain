import { SuiObjectResponse } from "@mysten/sui/client";
import { suiClient } from "../config/config";
import { NFTMoveObject } from "../interfaces/interfaces";
import { recipientWallet } from "../services/wallets";

/**
 * Check NFTs owned by the recipient address
 * @returns void
 */
async function checkRecipientNFTs(): Promise<void> {
    const recipientKeypair = recipientWallet.load();
    const recipientAddress = recipientWallet.getAddress(recipientKeypair);

    try {
        // Query the Sui network for all objects owned by the recipient address
        // You can also filter by type:
        // filter: {
        //     StructType: "0x2::coin::Coin"
        // },
        const objects = await suiClient.getOwnedObjects({
            owner: recipientAddress,
            options: {
                showType: true,
                showContent: true,
            },
        });

        // Filter the objects to only include our SimpleNFT type
        const nfts = objects.data.filter((obj: SuiObjectResponse) => {
            const data = obj.data;
            return data?.type?.includes("simple_nft::SimpleNFT");
        });

        // If no NFTs are found, log a message and return
        if (nfts.length === 0) {
            console.log("No NFTs found for this address");
            return;
        }

        console.log("\x1b[36m--------------------------------\x1b[0m");
        console.log(`\x1b[32mFound ${nfts.length} NFT(s):\x1b[0m`);
        console.log("\x1b[36m--------------------------------\x1b[0m");

        // Iterate through each NFT object
        nfts.forEach((nft: SuiObjectResponse, index) => {
            // Cast the data to our custom NFTMoveObject type for proper typing
            const data = nft.data as NFTMoveObject;
            // Verify this is a Move object (not a package or other type)
            if (data?.content?.dataType === "moveObject") {
                console.log("\x1b[36m--------------------------------\x1b[0m");
                console.log(`NFT #${index + 1}:`);
                console.table({
                    "Object ID": data.objectId, // The ID of the NFT object
                    Type: data.type, // Full type path
                    Name: data.content.fields.name,
                    Description: data.content.fields.description,
                    URL: data.content.fields.url,
                    "Public Transfer": data.content.hasPublicTransfer, // Whether the NFT can be transferred
                });
            }
        });
    } catch (error) {
        console.error("Error checking NFTs:", error);
    }
}

checkRecipientNFTs().catch((err) => {
    console.error("Error checking NFTs:", err);
});
