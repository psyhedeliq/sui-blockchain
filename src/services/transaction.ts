import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { MIST_PER_SUI } from "@mysten/sui/utils";
import { NETWORK, suiClient } from "../config/config";
import { TransactionResult } from "../interfaces/interfaces";

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

        // Split coins from gas object and specify amount to transfer
        // txb.pure.u64() ensures proper type conversion for blockchain
        const [coin] = txb.splitCoins(txb.gas, [
            txb.pure.u64(BigInt(amountInMist)),
        ]);

        // Transfer the split coin to recipient address
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

        // Log success and transaction details
        console.log("\x1b[32m--------------------------------");
        console.table({
            Status: "Success ✅",
            "Transaction Digest": result.digest,
            "View the transaction at": `https://${NETWORK}.suivision.xyz/txblock/${result.digest}`,
        });
        console.log("--------------------------------\x1b[0m");

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
