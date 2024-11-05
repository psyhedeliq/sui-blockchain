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

export interface NFT {
    id: string;
    name: string;
    description: string;
    url: string;
}

export interface NFTMintResult extends TransactionResult {
    nft?: NFT;
}

export interface CollectionCreationResult {
    success: boolean;
    digest?: string;
    collection?: {
        id: string;
        name: string;
        description: string;
    };
    error?: string;
}
