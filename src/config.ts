import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { getFaucetHost } from "@mysten/sui/faucet";

/**
 * Configuration for network connections.
 */

// Define the network (e.g., 'testnet', 'devnet', or custom URL)
export const NETWORK = "devnet";

// Get the fullnode URL for the network
const rpcUrl = getFullnodeUrl(NETWORK);

// Create a SuiClient instance pointing to the desired network
export const suiClient = new SuiClient({ url: rpcUrl });

// Get the faucet host for the network
export const faucetHost = getFaucetHost(NETWORK);
