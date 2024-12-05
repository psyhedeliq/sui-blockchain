/**
* This module implements a simple storage on the Sui blockchain
* It includes storing and retrieving functions for creating and managing data
* Package: storage_app
*   - The package name defined in Move.toml that contains this module
*   - Used as the address prefix for the module (storage_app::immutable_storage)
*
* Module: immutable_storage
*   - The module name that implements the storage functionality
*   - Contains the core storage struct and functions for storing and retrieving data
*/
module storage_app::immutable_storage {
    /**
    * Import the object module from the Sui framework
    * - Self: Allows direct use of functions within the object module
    * - UID: Unique identifier type for Sui objects, required for all on-chain objects
    */
    use sui::object::{Self, UID};

    /**
    * Import the transfer module to enable object transfers
    * This module provides functionality to make objects immutable and transfer them
    */
    use sui::transfer;

    /**
    * Import the transaction context module
    * - Self: Allows direct use of functions within the tx_context module
    * - TxContext: Provides transaction context including sender information and object creation
    */
    use sui::tx_context::{Self, TxContext};

    /**
    * Import the string module from the standard library
    * - Self: Allows direct use of functions within the string module
    * - String: Provides string manipulation capabilities
    */
    use std::string::{Self, String};

    /**
    * Import the event module from the Sui framework
    * This module is used to emit events, which are logs that can be used to track state changes
    */
    use sui::event;

    /**
    * Define a structure to represent a storage item
    * This structure has the 'key' and 'store' abilities, meaning it can be used as a key in a map and stored in the global state
    */
    struct StorageItem has key, store {
        id: UID,
        data: String,
        timestamp: u64,
        version: u8,
        data_type: String,
        creator: address,
        // is_deleted: bool
    }

    /**
    * Define an event structure for when a storage item is created
    * This structure has 'copy' and 'drop' abilities, meaning it can be copied and dropped
    */
    struct StorageCreated has copy, drop {
        id: address,
        data_type: String,
        timestamp: u64
    }

    /**
    * Public entry function to store data
    * This function is called to store data on the blockchain
    */
    public entry fun store_data(
        data: vector<u8>, // Data to be stored, passed as a vector of bytes
        data_type: vector<u8>, // Type of the data, passed as a vector of bytes
        ctx: &mut TxContext // Reference to the transaction context
    ) {
        let sender = tx_context::sender(ctx); // Get the sender's address from the transaction context
        let timestamp = tx_context::epoch(ctx); // Get the current epoch from the transaction context

        // Create a new storage item with the provided data and metadata
        let storage = StorageItem {
            id: object::new(ctx), // Generate a new unique identifier for the storage item
            data: string::utf8(data), // Convert the data to a UTF-8 string
            timestamp, // Use the current epoch as the timestamp
            version: 1, // Initial version number
            data_type: string::utf8(data_type), // Convert the data type to a UTF-8 string
            creator: sender, // Set the creator's address
            // is_deleted: false // Set the is_deleted flag to false
        };

        // Emit an event to signal that a new storage item has been created
        // The event includes the unique address of the storage item, the data type, and the timestamp
        event::emit(
            StorageCreated {
                id: object::uid_to_address(&storage.id), // Convert the UID of the storage item to an address for the event
                data_type: string::utf8(data_type), // Convert the data type from bytes to a UTF-8 string for the event
                timestamp // Use the current epoch as the timestamp for the event
            }
        );

        // Make the storage object immutable and store it on the blockchain
        // This ensures that the data cannot be modified after creation, preserving its integrity
        // transfer::transfer(storage, sender);
        // transfer::share_object(storage);
        transfer::freeze_object(storage);
    }

    // const E_NOT_AUTHORIZED: u64 = 0;

    // public entry fun delete_data(
    //     storage: &mut StorageItem,
    //     ctx: &mut TxContext
    // ) {
    //     let sender = tx_context::sender(ctx);
    //     assert!(
    //         sender == storage.creator,
    //         E_NOT_AUTHORIZED
    //     );

    //     // Mark as deleted
    //     storage.is_deleted = true;
    // }
}
