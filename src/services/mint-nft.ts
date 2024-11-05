import { fundedWallet, recipientWallet } from "../services/wallets";
import { createCollection, mintNFT, transferNFT } from "../services/nft";

/**
 * Mint and transfer an NFT.
 */
async function mintAndTransferNFT(): Promise<void> {
    const fundingKeypair = fundedWallet.load();
    const recipientKeypair = recipientWallet.load();
    const recipientAddress = recipientWallet.getAddress(recipientKeypair);

    console.log("\x1b[36m--------------------------------\x1b[0m");
    console.log(`\x1b[32mNFT Operations\x1b[0m`);
    console.log("\x1b[36m--------------------------------\x1b[0m");

    // Create a new NFT collection
    console.log("\x1b[36m--------------------------------\x1b[0m");
    console.log("\x1b[32mCreating NFT Collection\x1b[0m");
    console.log("\x1b[36m--------------------------------\x1b[0m");

    const collectionResult = await createCollection(
        fundingKeypair,
        "My NFT Collection",
        "A collection created using the Sui TypeScript SDK"
    );

    if (!collectionResult.success || !collectionResult.collection) {
        console.error("Failed to create collection:", collectionResult.error);
        return;
    }

    console.table({
        "Collection ID": collectionResult.collection.id,
        "Collection Name": collectionResult.collection.name,
        "Collection Description": collectionResult.collection.description,
    });

    console.log("\x1b[36m--------------------------------\x1b[0m");
    console.log(`\x1b[32mMinting NFT\x1b[0m`);
    console.log("\x1b[36m--------------------------------\x1b[0m");

    // Mint NFT
    const mintResult = await mintNFT(
        fundingKeypair,
        "My First NFT",
        "NFT created using the Sui TypeScript SDK",
        "https://img.freepik.com/free-psd/nft-cryptocurrency-3d-illustration_1419-2742.jpg?t=st=1730738706~exp=1730742306~hmac=c70105ce801ea52a29e6e6f02aa371a1b3d60e8a8234462f7ccbcc35338acd4f&w=1480"
    );

    if (!mintResult.success || !mintResult.nft) {
        console.error("Failed to mint NFT:", mintResult.error);
        return;
    }

    console.table({
        "NFT ID": mintResult.nft.id,
        "NFT Name": mintResult.nft.name,
        "NFT Description": mintResult.nft.description,
        "NFT URL": mintResult.nft.url,
    });

    // Transfer the NFT
    console.log("\x1b[36m--------------------------------\x1b[0m");
    console.log(`\x1b[32mTransferring NFT to recipient...\x1b[0m`);
    console.log("\x1b[36m--------------------------------\x1b[0m");

    const transferResult = await transferNFT(
        mintResult.nft.id,
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

mintAndTransferNFT().catch((err) => {
    console.error("Error in NFT operations:", err);
});
