import { MIST_PER_SUI } from "@mysten/sui/utils";
import { suiClient } from "../config";
import { CoinBalance } from "@mysten/sui/dist/cjs/client";

/**
 * Get the balance of an address.
 * @param address - The address to get the balance of.
 * @returns A promise that resolves to a CoinBalance.
 */
export async function getBalance(address: string): Promise<CoinBalance> {
    return await suiClient.getBalance({
        owner: address,
    });
}

/**
 * Convert a balance from MIST to SUI.
 * @param balance - The balance object returned from the Sui client.
 * @returns The balance amount in SUI as a number.
 */
export function convertMistToSui(balance: any): number {
    return Number.parseInt(balance.totalBalance) / Number(MIST_PER_SUI);
}

/**
 * Get the balance in MIST (smallest unit of SUI).
 * @param balance - The balance object returned from the Sui client.
 * @returns The balance amount in MIST as a number.
 */
export function getMistBalance(balance: any): number {
    return Number.parseInt(balance.totalBalance);
}
