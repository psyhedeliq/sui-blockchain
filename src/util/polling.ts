import { CoinBalance } from "@mysten/sui/dist/cjs/client";
import { convertMistToSui, getBalance } from "../services/balance";

/**
 * Polls for balance changes on an address, for up to 1 minute by default.
 * @param address - The address to check balance for
 * @param initialBalance - The initial balance to compare against
 * @param attempts - Number of polling attempts (default: 6)
 * @param interval - Time between attempts in ms (default: 10000)
 * @returns boolean indicating if balance changed
 */
export async function pollForBalanceChange(
    address: string,
    initialBalance: CoinBalance,
    attempts: number = 6,
    interval: number = 10000
): Promise<boolean> {
    for (let i = 0; i < attempts; i++) {
        const newBalance = await getBalance(address);
        if (convertMistToSui(newBalance) !== convertMistToSui(initialBalance)) {
            return true;
        }
        if (i < attempts - 1) {
            await new Promise((resolve) => setTimeout(resolve, interval));
        }
    }
    return false;
}
