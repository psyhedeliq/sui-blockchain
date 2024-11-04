import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { MIST_PER_SUI } from "@mysten/sui/utils";
import { suiClient } from "../config";
import { TransactionResult } from "../types/types";

export async function transferSui(
    amount: number,
    fromKeypair: Ed25519Keypair,
    toAddress: string
): Promise<TransactionResult> {
    try {
        const tx = new Transaction();
        const amountInMist = Number(MIST_PER_SUI) * amount;

        const [coin] = tx.splitCoins(tx.gas, [amountInMist]);
        tx.transferObjects([coin], toAddress);

        const result = await suiClient.signAndExecuteTransaction({
            transaction: tx,
            signer: fromKeypair,
        });

        const transaction = await suiClient.waitForTransaction({
            digest: result.digest,
            options: {
                showEvents: true,
                showObjectChanges: true,
            },
        });

        console.log("--------------------------------");
        console.log(`Transaction: ${JSON.stringify(transaction, null, 2)}`);
        console.log("--------------------------------");

        return {
            success: true,
            digest: result.digest,
        };
    } catch (error) {
        return {
            success: false,
            error: (error as Error).message,
        };
    }
}
