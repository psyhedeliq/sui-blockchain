import { MIST_PER_SUI } from "@mysten/sui/utils";
import { suiClient } from "../config";
import { CoinBalance } from "@mysten/sui/dist/cjs/client";

export async function getBalance(address: string): Promise<CoinBalance> {
    return await suiClient.getBalance({
        owner: address,
    });
}

export function convertMistToSui(balance: any): number {
    return Number.parseInt(balance.totalBalance) / Number(MIST_PER_SUI);
}

export function getMistBalance(balance: any): number {
    return Number.parseInt(balance.totalBalance);
}
