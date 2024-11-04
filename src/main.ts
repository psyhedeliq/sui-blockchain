import { fundedWallet, recipientWallet } from "./services/wallets";
import { getMistBalance } from "./services/balance";
import { convertMistToSui } from "./services/balance";
import { fundAccountFromFaucet } from "./services/faucet";
import { getBalance } from "./services/balance";
import { transferSui } from "./services/transaction";

/**
 * Main function to run the program.
 */
async function main(): Promise<void> {
    // Load wallets
    const fundingKeypair = fundedWallet.load();
    const recipientKeypair = recipientWallet.load();

    // Get addresses
    const fundingAddress = fundedWallet.getAddress(fundingKeypair);
    const recipientAddress = recipientWallet.getAddress(recipientKeypair);

    console.table({
        "Funded Wallet Address": fundingAddress,
        "Recipient Wallet Address": recipientAddress,
    });

    // Get balances before funding
    const fundedBalance = await getBalance(fundingAddress);
    const recipientBalance = await getBalance(recipientAddress);

    console.table({
        "Funded balance before funding":
            convertMistToSui(fundedBalance) + " SUI",
        "Recipient balance before funding":
            convertMistToSui(recipientBalance) + " SUI",
    });

    // Fund account. Each call funds the account with 10 SUI.
    // Each call costs 0.01 SUI.
    const funded = await fundAccountFromFaucet(fundingAddress);
    if (!funded) {
        console.error("Failed to fund account");
        return;
    }

    // Get balances after funding
    const fundedBalanceAfterFunding = await getBalance(fundingAddress);
    const recipientBalanceAfterFunding = await getBalance(recipientAddress);

    console.table({
        "Funded balance after funding":
            convertMistToSui(fundedBalanceAfterFunding) + " SUI",
        "Recipient balance after funding":
            convertMistToSui(recipientBalanceAfterFunding) + " SUI",
    });

    // Perform transfer
    // Initial amount to transfer up to 9 SUI, because of the faucet mount of SUI dispensed of 10 SUI per call plus the 0.01 SUI cost per call. This can be increased once you have more funds.
    const amountInSui = 9;
    console.log("--------------------------------");
    console.log(`Transferring ${amountInSui} SUI`);
    console.log("--------------------------------");

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

main().catch((err) => {
    console.error("Error in main:", err);
});
