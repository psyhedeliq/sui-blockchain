import { Ed25519Keypair } from "@mysten/sui/dist/cjs/keypairs/ed25519";
import { getAddress, fundedWallet, recipientWallet } from "./wallet";
import { getFaucetHost, requestSuiFromFaucetV0 } from "@mysten/sui/faucet";
import { NETWORK, suiClient } from "./config";
import { MIST_PER_SUI } from "@mysten/sui/utils";
import { Transaction } from "@mysten/sui/transactions";

/**
 * Main function to run the program.
 */
async function main() {
    // Load or create a keypair for the funding account
    let fundingKeypair: Ed25519Keypair;

    try {
        fundingKeypair = fundedWallet.load();
    } catch (err) {
        console.log((err as Error).message);
        console.log("Creating a new keypair...");
        fundingKeypair = fundedWallet.create();
    }

    // Load or create a keypair for the recipient account
    let recipientKeypair: Ed25519Keypair;
    try {
        recipientKeypair = recipientWallet.load();
    } catch (err) {
        console.log((err as Error).message);
        console.log("Creating a new keypair...");
        recipientKeypair = recipientWallet.create();
    }

    // Get the wallet address for the funded account
    const fundingAddress = fundedWallet.getAddress(fundingKeypair);
    console.log(`Funded Wallet Address: ${fundingAddress}`);

    // Get the wallet address for the recipient account
    const recipientAddress = getAddress(recipientKeypair);
    console.log(`Recipient Wallet Address: ${recipientAddress}`);

    // Convert MIST to Sui
    const balance = (balance: any) => {
        return Number.parseInt(balance.totalBalance) / Number(MIST_PER_SUI);
    };

    // Check the balance before funding
    const balanceBeforeFunding = await suiClient.getBalance({
        owner: fundingAddress,
    });
    console.log(`Balance before funding: ${balance(balanceBeforeFunding)} SUI`);

    // Fund the account via faucet
    try {
        // requestSuiFromFaucetV0
        const response = await requestSuiFromFaucetV0({
            host: getFaucetHost(NETWORK),
            recipient: fundingAddress,
        });
        if (!response?.error) {
            console.log(
                `Requested funds from faucet for address ${fundingAddress}`
            );
        } else {
            throw new Error(`Faucet error: ${response.error}`);
        }
    } catch (err) {
        console.error("Error requesting funds from faucet:", err);
        return;
    }

    // Wait for up to 1 minute. It can take up to 1 minute to get the coin.
    console.log("Waiting for funds...");
    let funded = false;
    for (let i = 0; i < 6; i++) {
        const newBalance = await suiClient.getBalance({
            owner: fundingAddress,
        });
        if (balance(newBalance) !== balance(balanceBeforeFunding)) {
            funded = true;
            console.log("Funds received!");
            break;
        }
        if (i < 5) {
            console.log("Still waiting...");
            await new Promise((resolve) => setTimeout(resolve, 10000));
        }
    }
    if (!funded) {
        console.log("Timed out waiting for funds");
    }

    // Check the balance after funding
    const balanceAfterFunding = await suiClient.getBalance({
        owner: fundingAddress,
    });
    console.log(`Balance after funding: ${balance(balanceAfterFunding)} SUI`);

    // Check the balance of the recipient account
    const recipientBalance = await suiClient.getBalance({
        owner: recipientAddress,
    });
    console.log(`Recipient balance: ${balance(recipientBalance)} SUI`);

    // Log balances in MIST
    console.log(
        `Funded balance in MIST: ${Number.parseInt(
            balanceAfterFunding.totalBalance
        )}`
    );
    console.log(
        `Recipient balance in MIST: ${Number.parseInt(
            recipientBalance.totalBalance
        )}`
    );

    // Create a new transaction
    const tx = new Transaction();

    // Set the amount to transfer
    const amountInSui = 30;
    const amountInMist = Number(MIST_PER_SUI) * amountInSui;
    console.log(`Amount to transfer: ${amountInSui} SUI`);

    // Split the gas coin
    const [coin] = tx.splitCoins(tx.gas, [amountInMist]);

    // Transfer the coin to the recipient
    tx.transferObjects([coin], recipientAddress);

    // Sign and execute the transaction
    const result = await suiClient.signAndExecuteTransaction({
        transaction: tx,
        signer: fundingKeypair,
    });

    // Wait for the transaction to be finalized
    const transaction = await suiClient.waitForTransaction({
        digest: result.digest,
        options: {
            showEvents: true,
            showObjectChanges: true,
        },
    });

    console.log(`Transaction: ${JSON.stringify(transaction, null, 2)}`);

    // Check the balance of the recipient account after the transaction
    const recipientBalanceAfter = await suiClient.getBalance({
        owner: recipientAddress,
    });
    console.log(
        `Recipient balance after transaction: ${balance(
            recipientBalanceAfter
        )} SUI`
    );

    // Log recipient balance in MIST
    console.log(
        `Recipient balance in MIST: ${Number.parseInt(
            recipientBalanceAfter.totalBalance
        )} MIST`
    );
}

main().catch((err) => {
    console.error("Error in main:", err);
});
