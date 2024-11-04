import * as path from "path";
import { createWallet } from "./base";

// Define the path for the keypairs
const KEYPAIRS_DIR = path.join(__dirname, "../..", "keypairs");

// Create the funded wallet
export const fundedWallet = createWallet(
    path.join(KEYPAIRS_DIR, "funding_keypair.json")
);

// Create the recipient wallet
export const recipientWallet = createWallet(
    path.join(KEYPAIRS_DIR, "recipient_keypair.json")
);
