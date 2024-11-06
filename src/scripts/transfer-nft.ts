import fs from "fs";
import path from "path";
import { transferNFT } from "../services/nft";
import { fundedWallet, recipientWallet } from "../services/wallets";

/**
 * Transfers an NFT to the recipient.
 * @param nftId - The ID of the NFT to transfer.
 * @returns void
 */
async function transferLastMintedNFT(): Promise<void> {
    const fundingKeypair = fundedWallet.load();
    const recipientKeypair = recipientWallet.load();
    const recipientAddress = recipientWallet.getAddress(recipientKeypair);

    // Read the last minted NFT data
    const nftDataPath = path.join(__dirname, "../data/last-minted-nft.json");
    if (!fs.existsSync(nftDataPath)) {
        console.error("No NFT data found. Please mint an NFT first.");
        return;
    }

    const nftData = JSON.parse(fs.readFileSync(nftDataPath, "utf-8"));

    console.log("\x1b[36m--------------------------------\x1b[0m");
    console.log(`\x1b[32mTransferring NFT to recipient...\x1b[0m`);
    console.log("\x1b[36m--------------------------------\x1b[0m");

    const transferResult = await transferNFT(
        nftData.id,
        fundingKeypair,
        recipientAddress
    );

    if (!transferResult.success) {
        console.error("Failed to transfer NFT:", transferResult.error);
        return;
    }

    console.log("\x1b[36m--------------------------------\x1b[0m");
    console.log(`\x1b[32mNFT transferred successfully\x1b[0m`);
    console.log("\x1b[36m--------------------------------\x1b[0m");
}

transferLastMintedNFT().catch((err) => {
    console.error("Error in NFT transfer:", err);
});
