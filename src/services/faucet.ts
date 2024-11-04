import { requestSuiFromFaucetV0 } from "@mysten/sui/faucet";
import { faucetHost } from "../config";
import { getBalance, convertMistToSui } from "./balance";

export async function fundAccountFromFaucet(address: string): Promise<boolean> {
    const balanceBeforeFunding = await getBalance(address);

    try {
        const response = await requestSuiFromFaucetV0({
            host: faucetHost,
            recipient: address,
        });

        if (!response?.error) {
            console.log("--------------------------------");
            console.log(`Requested funds from faucet for address ${address}`);
            console.log("--------------------------------");
        } else {
            throw new Error(`Faucet error: ${response.error}`);
        }

        // Wait for funds. It can take up to 1 minute to get the coin.
        let funded = false;
        for (let i = 0; i < 6; i++) {
            const newBalance = await getBalance(address);
            if (
                convertMistToSui(newBalance) !==
                convertMistToSui(balanceBeforeFunding)
            ) {
                funded = true;
                break;
            }
            if (i < 5) {
                await new Promise((resolve) => setTimeout(resolve, 10000));
            }
        }

        if (!funded) {
            console.log("Timed out waiting for funds");
        }

        return funded;
    } catch (error) {
        console.error("Error funding account:", error);
        return false;
    }
}
