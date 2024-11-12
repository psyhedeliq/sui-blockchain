import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { getFaucetHost } from "@mysten/sui/faucet";

/**
 * Configuration for network connections.
 */

// Define the network (e.g., 'testnet', 'devnet', or custom URL)
export const NETWORK = "devnet";

// Get the fullnode URL for the network
const version = getFullnodeUrl(NETWORK);
console.log("\x1b[32m--------------------------------");
console.log(`'Sui Version:', ${version}`);
console.log("--------------------------------\x1b[0m");

// Create a SuiClient instance pointing to the desired network
export const suiClient = new SuiClient({ url: version });

// Get the faucet host for the network
export const faucetHost = getFaucetHost(NETWORK);
console.log("\x1b[32m--------------------------------");
console.log(`'Faucet Host:', ${faucetHost}`);
console.log("--------------------------------\x1b[0m");

// Define the gas budget for transactions
export const GAS_BUDGET = 1000000000; // 1 SUI or 1000000000 MIST
