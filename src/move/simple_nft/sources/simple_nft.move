/**
* This module implements a simple NFT (Non-Fungible Token) on the Sui blockchain
* It includes minting and transferring functions for creating and managing NFTs
* Package: tutorial
*   - The package name defined in Move.toml that contains this module
*   - Used as the address prefix for the module (tutorial::simple_nft)
*
* Module: simple_nft
*   - The module name that implements the NFT functionality
*   - Contains the core NFT struct and functions for mintingransferring
*/
module tutorial::simple_nft {
    /**
    * Import object module from Sui framework
    * - Self: Allows us to use object module functions directly
    * - UID: Unique identifier type for Sui objects, required for all on-chain objects
    */
    use sui::object::{Self, UID};

    /**
    * Import transfer module to enable NFT transfers between addresses
    * This provides the core transfer functionality for our NFT
    */
    use sui::transfer;

    /**
    * Import transaction context module
    * - Self: Allows direct use of tx_context functions
    * - TxContext: Provides transaction context including sender info and object creation
    */
    use sui::tx_context::{Self, TxContext};

    /**
    * Import String type from standard library
    * Used for storing NFT metadata (name, description, URL) as strings
    */
    use std::string::String;

    /**
    * The SimpleNFT struct represents a non-fungible token with the following:
    *
    * Capabilities:
    * - key: allows the object to be stored on-chain
    * - store: enables direct transfer between addresses using Sui's transfer module
    *
    * Fields:
    * - id: the unique identifier of the NFT
    * - name: the name of the NFT
    * - description: the description of the NFT
    * - url: the URL of the NFT
    */
    struct SimpleNFT has key, store {
        id: UID,
        name: String,
        description: String,
        url: String,
    }

    /**
    * The mint function creates a new NFT with the given name, description, and URL.
    * @param name - The name of the NFT
    * @param description - The description of the NFT
    * @param url - The URL of the NFT
    * @param ctx - The transaction context
    * @returns The newly minted NFT
    */
    public fun mint(
        name: String,
        description: String,
        url: String,
        ctx: &mut TxContext
    ): SimpleNFT {
        SimpleNFT {
            id: object::new(ctx),
            name,
            description,
            url,
        }
    }

    /**
    * The mint_and_transfer function creates a new NFT and transfers it to the sender.
    * @param name - The name of the NFT
    * @param description - The description of the NFT
    * @param url - The URL of the NFT
    * @param ctx - The transaction context
    */
    public entry fun mint_and_transfer(
        name: String,
        description: String,
        url: String,
        ctx: &mut TxContext
    ) {
        let nft = mint(name, description, url, ctx);
        transfer::transfer(nft, tx_context::sender(ctx))
    }

    /**
    * The burn function deletes (permanently destroys) the NFT from the sender's account.
    * Can only be called by the NFT owner
    * @param nft - The NFT to be burned
    */
    public entry fun burn(nft: SimpleNFT) {
        let SimpleNFT {id, name: _, description: _, url: _} = nft;
        object::delete(id)
    }
}
// TODO: Implement the delete_data function
// public entry fun delete_data(
//     storage: StorageItem,
//     ctx: &mut TxContext
// ) {
//     let sender = tx_context::sender(ctx);
//     assert!(sender == storage.creator, 0); // Ensure only creator can delete

//     // Destructure the storage item
//     let StorageItem {
//         id,
//         data: _,
//         timestamp: _,
//         version: _,
//         data_type: _,
//         creator: _
//     } = storage;

//     // Explicitly delete the UID
//     object::delete(id);
//     // Other fields are dropped automatically
// }
