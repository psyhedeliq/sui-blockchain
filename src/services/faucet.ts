import { requestSuiFromFaucetV0 } from "@mysten/sui/faucet";
import { faucetHost } from "../config/config";
import { pollForBalanceChange } from "../util/polling";
import { getBalance } from "./balance";

/**
 * Fund an account from the faucet.
 * @param address - The address to fund.
 * @returns A promise that resolves to a boolean indicating success.
 */
export async function fundAccountFromFaucet(address: string): Promise<boolean> {
    const balanceBeforeFunding = await getBalance(address);

    try {
        const response = await requestSuiFromFaucetV0({
            host: faucetHost,
            recipient: address,
        });

        if (!response?.error) {
            console.log("\x1b[36m--------------------------------\x1b[0m");
            console.log(
                `\x1b[32mRequested funds from faucet for address: ${address}\x1b[0m`
            );
            console.log("\x1b[36m--------------------------------\x1b[0m");
        } else {
            throw new Error(`Faucet error: ${response.error}`);
        }

        // Wait for funds. It can take up to 1 minute to get the coin.
        let funded = await pollForBalanceChange(address, balanceBeforeFunding);

        if (!funded) {
            console.log("Timed out waiting for funds");
        }

        return funded;
    } catch (error) {
        console.error("Error funding account:", error);
        return false;
    }
}
