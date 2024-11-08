import fs from "fs";
import path from "path";
import { deployStoragePackage, storeImmutableData } from "../services/storage";
import { fundedWallet } from "../services/wallets";

/**
 * Deploys the storage package and stores data on the blockchain.
 * @returns void
 */
async function deployAndStoreData(): Promise<void> {
    const fundingKeypair = fundedWallet.load();

    console.log("\x1b[36m--------------------------------\x1b[0m");
    console.log(`\x1b[32mDeploying storage package...\x1b[0m`);
    console.log("\x1b[36m--------------------------------\x1b[0m");

    const packageId = await deployStoragePackage(fundingKeypair);
    console.log("Package deployed with ID:", packageId);

    // Example data to store
    const proofData = {
        type: "credential",
        issuer: "DID:example:123",
        timestamp: Date.now(),
        proof: "base64EncodedProof...",
    };

    console.log("\x1b[36m--------------------------------\x1b[0m");
    console.log(`\x1b[32mStoring data on-chain...\x1b[0m`);
    console.log("\x1b[36m--------------------------------\x1b[0m");

    const result = await storeImmutableData(
        JSON.stringify(proofData),
        "credential",
        fundingKeypair
    );

    if (!result.success) {
        console.error("Failed to store data:", result.error);
        return;
    }

    const objectId = result.storageData?.id;
    if (objectId) {
        fs.writeFileSync(
            path.join(__dirname, "../data/stored-data-object-id.json"),
            JSON.stringify({ objectId }, null, 2)
        );
        console.log("\x1b[36m--------------------------------\x1b[0m");
        console.log(`\x1b[32mObject ID saved to file: ${objectId}\x1b[0m`);
        console.log("\x1b[36m--------------------------------\x1b[0m");
    } else {
        console.error("Failed to retrieve object ID");
    }

    console.log("\x1b[36m--------------------------------\x1b[0m");
    console.log("\x1b[32mData stored successfully!\x1b[0m");
    console.log("\x1b[36m--------------------------------\x1b[0m");

    console.table({
        "Transaction digest:": result.digest,
    });
}

deployAndStoreData().catch((err) => {
    console.error("Error in deployment or storage operation:", err);
});
