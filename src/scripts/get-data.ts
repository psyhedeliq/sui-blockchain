import fs from "fs";
import path from "path";
import { retrieveImmutableData } from "../services/storage";

/**
 * Retrieves data from the blockchain using the object ID stored in a JSON file.
 * @returns void
 */
async function retrieveData(): Promise<void> {
    try {
        const objectIdPath = path.join(
            __dirname,
            "../data/stored-data-object-id.json"
        );

        // Read the object ID from the JSON file
        const { objectId } = JSON.parse(fs.readFileSync(objectIdPath, "utf-8"));

        // Retrieve the data from the blockchain using the object ID
        const data = await retrieveImmutableData(objectId);
        if (data) {
            console.log(`\x1b[32mRetrieved data:\x1b[0m`);
            console.log("\x1b[36m--------------------------------\x1b[0m");
            console.log({
                id: data.id,
                data: JSON.parse(data.data),
                timestamp: data.timestamp,
                dataType: data.dataType,
                creator: data.creator,
            });
            console.log("\x1b[36m--------------------------------\x1b[0m");
        } else {
            console.error("No data found for the given object ID.");
        }
    } catch (error) {
        console.error("Error retrieving data:", error);
    }
}

retrieveData().catch((err) => {
    console.error("Error in data retrieval:", err);
});
