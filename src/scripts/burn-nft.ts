import fs from "fs";
import path from "path";
import { fundedWallet } from "../services/wallets";
import { burnNFT, getNFTById } from "../services/nft";

/**
 * Burns the last minted NFT.
 * @returns void
 */
async function burnLastMintedNFT(): Promise<void> {
    const fundingKeypair = fundedWallet.load();

    // Read the last minted NFT data
    const nftDataPath = path.join(__dirname, "../data/last-minted-nft.json");
    if (!fs.existsSync(nftDataPath)) {
        console.error(
            "No NFT data found. Please run the mint-nft script first."
        );
        return;
    }

    const nftData = JSON.parse(fs.readFileSync(nftDataPath, "utf-8"));

    // Verify the NFT exists and is owned by the funding keypair
    const nft = await getNFTById(nftData.id);
    if (!nft || nft.owner !== fundingKeypair.toSuiAddress()) {
        console.error("NFT not found or not owned by the funding keypair");
        return;
    }

    console.log("\x1b[36m--------------------------------\x1b[0m");
    console.log(`\x1b[32mBurning NFT...\x1b[0m`);
    console.log("\x1b[36m--------------------------------\x1b[0m");

    const burnResult = await burnNFT(nftData.id, fundingKeypair);

    if (!burnResult.success) {
        console.error("Failed to burn NFT:", burnResult.error);
        return;
    }

    // Remove the NFT data file since it's now burned
    fs.unlinkSync(nftDataPath);

    console.log("\x1b[36m--------------------------------\x1b[0m");
    console.log(`\x1b[32mNFT burned successfully\x1b[0m`);
    console.log("\x1b[36m--------------------------------\x1b[0m");
}

burnLastMintedNFT().catch((err) => {
    console.error("Error in NFT burn operation:", err);
});
