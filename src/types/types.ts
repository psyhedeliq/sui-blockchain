import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

export interface Wallet {
    keypairPath: string;
    create: () => Ed25519Keypair;
    load: () => Ed25519Keypair;
    getAddress: (keypair: Ed25519Keypair) => string;
}

export interface TransactionResult {
    success: boolean;
    error?: string;
    digest?: string;
}
