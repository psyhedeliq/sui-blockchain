import { fundedWallet, recipientWallet } from "./wallets";
import { getMistBalance, convertMistToSui, getBalance } from "./balance";
import { transferSui } from "./transaction";

/**
 * Transfer SUI to the recipient.
 */
async function transferSuiToRecipient(): Promise<void> {
    const fundingKeypair = fundedWallet.load();
    const recipientKeypair = recipientWallet.load();
    const recipientAddress = recipientWallet.getAddress(recipientKeypair);

    // Initial amount to transfer up to 9 SUI, because of the faucet mount of SUI
    // dispensed of 10 SUI per call plus the 0.01 SUI cost per call.
    // This can be increased once you have more funds.
    const amountInSui = 1;
    console.log("\x1b[36m--------------------------------\x1b[0m");
    console.log(`\x1b[32mTransferring ${amountInSui} SUI\x1b[0m`);
    console.log("\x1b[36m--------------------------------\x1b[0m");

    if (amountInSui <= 0) {
        throw new Error("Transfer amount must be greater than zero.");
    }

    const result = await transferSui(
        amountInSui,
        fundingKeypair,
        recipientAddress
    );

    if (!result.success) {
        console.error("Transfer failed:", result.error);
        return;
    }

    // Show final balances
    const finalBalance = await getBalance(recipientAddress);
    console.table({
        "Final recipient balance": convertMistToSui(finalBalance) + " SUI",
        "Final recipient balance in MIST":
            getMistBalance(finalBalance) + " MIST",
    });
}

transferSuiToRecipient().catch((err) => {
    console.error("Error in SUI transfer operations:", err);
});
