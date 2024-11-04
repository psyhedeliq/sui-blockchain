import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { getFaucetHost } from "@mysten/sui/faucet";

// const NETWORK = "testnet";
export const NETWORK = "devnet";

const rpcUrl = getFullnodeUrl(NETWORK);

export const suiClient = new SuiClient({ url: rpcUrl });

export const faucetHost = getFaucetHost(NETWORK);
