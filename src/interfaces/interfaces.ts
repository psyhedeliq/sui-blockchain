import {
    SuiObjectData,
    SuiTransactionBlockResponse,
    TransactionEffects,
} from "@mysten/sui/dist/cjs/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { NFTFields } from "../types/types";

/**
 * Define the Wallet interface
 */
export interface Wallet {
    keypairPath: string;
    create: () => Ed25519Keypair;
    load: () => Ed25519Keypair;
    getAddress: (keypair: Ed25519Keypair) => string;
}

/**
 * Define the TransactionResult interface
 */
export interface TransactionResult {
    success: boolean;
    digest?: string;
    error?: string;
    effects?: TransactionEffects;
    events?: SuiTransactionBlockResponse["events"];
    objectChanges?: SuiTransactionBlockResponse["objectChanges"];
}

/**
 * Define the NFT interface
 */
export interface NFT {
    id: string;
    name: string;
    description: string;
    url: string;
}

/**
 * Define the NFTMintResult interface
 */
export interface NFTMintResult extends TransactionResult {
    nft?: NFT;
}

/**
 * Define the CollectionCreationResult interface
 */
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

/**
 * Define the content structure for Move objects
 */
export interface NFTMoveObject extends SuiObjectData {
    content:
        | {
              dataType: "moveObject";
              fields: NFTFields;
              type: string;
              hasPublicTransfer: boolean;
          }
        | null
        | undefined;
}
