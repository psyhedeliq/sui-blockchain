import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import * as fs from "fs";
import { Wallet } from "../../interfaces/interfaces";

/**
 * Create a new keypair and save it to a file.
 * @returns {Ed25519Keypair} The generated keypair.
 */
export function createNewKeypair(keypairPath: string): Ed25519Keypair {
    const keypair = new Ed25519Keypair();

    // Export the keypair
    const exportedKeypair = {
        secretKey: keypair.getSecretKey(),
        publicKey: keypair.getPublicKey(),
    };

    // Save the keypair to a file
    fs.writeFileSync(keypairPath, JSON.stringify(exportedKeypair, null, 2));
    console.log("\x1b[36m--------------------------------\x1b[0m");
    console.log(`\x1b[32mKeypair created and saved to ${keypairPath}\x1b[0m`);
    console.log("\x1b[36m--------------------------------\x1b[0m");

    return keypair;
}

/**
 * Load a keypair from a file.
 * @returns {Ed25519Keypair} The loaded keypair.
 */
export function loadKeypair(keypairPath: string): Ed25519Keypair {
    if (!fs.existsSync(keypairPath)) {
        console.log("\x1b[36m--------------------------------\x1b[0m");
        console.log(
            `\x1b[32mKeypair file not found. Creating a new keypair...\x1b[0m`
        );
        console.log("\x1b[36m--------------------------------\x1b[0m");
        return createNewKeypair(keypairPath);
    }

    try {
        // Read the keypair from the file
        const keypairData = JSON.parse(fs.readFileSync(keypairPath, "utf8"));

        // Create a new keypair from the secret key
        const keypair = Ed25519Keypair.fromSecretKey(keypairData.secretKey);
        console.log("\x1b[36m--------------------------------\x1b[0m");
        console.log(`\x1b[32mKeypair loaded from ${keypairPath}\x1b[0m`);
        console.log("\x1b[36m--------------------------------\x1b[0m");

        return keypair;
    } catch (error) {
        console.error("Error loading keypair:", error);
        throw error;
    }
}

/**
 * Get the Sui address from a keypair.
 * @param {Ed25519Keypair} keypair - The keypair to get the address from.
 * @returns {string} The Sui address.
 */
export function getAddress(keypair: Ed25519Keypair): string {
    return keypair.getPublicKey().toSuiAddress();
}

/**
 * Create a wallet object.
 * @param {string} keypairPath - The path to the keypair file.
 * @returns {Wallet} The wallet object.
 */
export function createWallet(keypairPath: string): Wallet {
    return {
        keypairPath,
        create: () => createNewKeypair(keypairPath),
        load: () => loadKeypair(keypairPath),
        getAddress: (keypair: Ed25519Keypair) => getAddress(keypair),
    };
}
