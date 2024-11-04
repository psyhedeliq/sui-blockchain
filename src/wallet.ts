import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import * as fs from "fs";
import * as path from "path";

// Define the paths to store the keypairs
export const FUNDING_KEYPAIR_PATH = path.join(
    __dirname,
    "funding_keypair.json"
);
export const RECIPIENT_KEYPAIR_PATH = path.join(
    __dirname,
    "recipient_keypair.json"
);

/**
 * Create a new keypair and save it to a file.
 * @returns {Ed25519Keypair} The generated keypair.
 */
export function createNewKeypair(keypairPath: string): Ed25519Keypair {
    const keypair = new Ed25519Keypair();

    // Save the secret key as base64
    const exportedKeypair = {
        secretKey: keypair.getSecretKey(),
        publicKey: keypair.getPublicKey(),
    };

    // Save the keypair to a file
    fs.writeFileSync(keypairPath, JSON.stringify(exportedKeypair, null, 2));
    console.log(`Keypair created and saved to ${keypairPath}`);
    return keypair;
}

/**
 * Load a keypair from a file.
 * @returns {Ed25519Keypair} The loaded keypair.
 */
export function loadKeypair(keypairPath: string): Ed25519Keypair {
    if (!fs.existsSync(keypairPath)) {
        console.log("Keypair file not found. Creating a new keypair...");
        return createNewKeypair(keypairPath);
    }

    try {
        // Read the keypair from the file
        const keypairData = JSON.parse(fs.readFileSync(keypairPath, "utf8"));
        // Create a new keypair from the secret key
        const keypair = Ed25519Keypair.fromSecretKey(keypairData.secretKey);
        console.log(`Keypair loaded from ${keypairPath}`);

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
 * A wallet object for the funding account.
 */
export const fundedWallet = {
    keypairPath: FUNDING_KEYPAIR_PATH,
    create: () => createNewKeypair(FUNDING_KEYPAIR_PATH),
    load: () => loadKeypair(FUNDING_KEYPAIR_PATH),
    getAddress: (keypair: Ed25519Keypair) => getAddress(keypair),
};

/**
 * A wallet object for the recipient.
 */
export const recipientWallet = {
    keypairPath: RECIPIENT_KEYPAIR_PATH,
    create: () => createNewKeypair(RECIPIENT_KEYPAIR_PATH),
    load: () => loadKeypair(RECIPIENT_KEYPAIR_PATH),
    getAddress: (keypair: Ed25519Keypair) => getAddress(keypair),
};
