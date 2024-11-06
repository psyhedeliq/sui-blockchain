import fs from "fs";
import path from "path";
import { deployNFTPackage, mintNFT, NFT_PACKAGE_ID } from "../services/nft";
import { fundedWallet } from "../services/wallets";

/**
 * Mint an NFT.
 * @returns void
 */
async function mintNFTOnly(): Promise<void> {
    const fundingKeypair = fundedWallet.load();

    console.log("\x1b[36m--------------------------------\x1b[0m");
    console.log(`\x1b[32mNFT Operations\x1b[0m`);
    console.log("\x1b[36m--------------------------------\x1b[0m");

    let packageId;
    if (!NFT_PACKAGE_ID) {
        console.log("\x1b[36m--------------------------------\x1b[0m");
        console.log(`\x1b[32mDeploying NFT Package\x1b[0m`);
        console.log("\x1b[36m--------------------------------\x1b[0m");

        packageId = await deployNFTPackage(fundingKeypair);
        console.log("Package deployed with ID:", packageId);
    }

    const nftPackageId = NFT_PACKAGE_ID! ?? packageId;

    console.log("\x1b[36m--------------------------------\x1b[0m");
    console.log(`\x1b[32mMinting NFT\x1b[0m`);
    console.log("\x1b[36m--------------------------------\x1b[0m");

    // Mint NFT
    const mintResult = await mintNFT(
        nftPackageId,
        fundingKeypair,
        "My First NFT",
        "NFT created using the Sui TypeScript SDK",
        "https://img.freepik.com/free-psd/nft-cryptocurrency-3d-illustration_1419-2742.jpg"
    );

    if (!mintResult.success || !mintResult.nft) {
        console.error("Failed to mint NFT:", mintResult.error);
        return;
    }

    // Save the NFT ID to a file for later use
    const nftData = {
        id: mintResult.nft.id,
        name: mintResult.nft.name,
        description: mintResult.nft.description,
        url: mintResult.nft.url,
    };

    fs.writeFileSync(
        path.join(__dirname, "../data/last-minted-nft.json"),
        JSON.stringify(nftData, null, 2)
    );

    console.table({
        "NFT ID": mintResult.nft.id,
        "NFT Name": mintResult.nft.name,
        "NFT Description": mintResult.nft.description,
        "NFT URL": mintResult.nft.url,
    });
}

mintNFTOnly().catch((err) => {
    console.error("Error in NFT operations:", err);
});
