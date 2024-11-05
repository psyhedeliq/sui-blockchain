import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { MIST_PER_SUI } from "@mysten/sui/utils";
import { NETWORK, suiClient } from "../config/config";
import { TransactionResult } from "../types/types";

/**
 * Transfer SUI from one wallet to another.
 * @param amount - The amount of SUI to transfer.
 * @param fromKeypair - The keypair of the sender.
 * @param toAddress - The address of the recipient.
 * @returns A promise that resolves to a TransactionResult.
 */
export async function transferSui(
    amount: number,
    fromKeypair: Ed25519Keypair,
    toAddress: string
): Promise<TransactionResult> {
    try {
        const txb = new Transaction();
        const amountInMist = Number(MIST_PER_SUI) * amount;

        // const [coin] = tx.splitCoins(tx.gas, [amountInMist]);
        // tx.transferObjects([coin], toAddress);

        const [coin] = txb.splitCoins(txb.gas, [
            txb.pure.u64(BigInt(amountInMist)),
        ]);
        txb.transferObjects([coin], txb.pure.address(toAddress));

        const result = await suiClient.signAndExecuteTransaction({
            transaction: txb,
            signer: fromKeypair,
            options: {
                showEffects: true,
                showEvents: true,
                showObjectChanges: true,
            },
            requestType: "WaitForLocalExecution",
        });

        console.log("--------------------------------");
        console.log(`Transaction: ${JSON.stringify(result, null, 2)}`);
        console.log("--------------------------------");

        // Display the transaction URL on the Devnet Sui Explorer
        console.log("--------------------------------");
        console.table({
            "View the transaction at": `https://${NETWORK}.suivision.xyz/txblock/${result.digest}`,
        });
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
