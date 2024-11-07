import fs from "fs";
import path from "path";
import { PackageConfig } from "../interfaces/interfaces";

const CONFIG_PATH = path.join(__dirname, "../data/package-config.json");

/**
 * Save the package ID to the configuration file
 * @param packageId - The ID of the deployed package
 */
export function savePackageId(packageId: string): void {
    const config: PackageConfig = { NFT_PACKAGE_ID: packageId };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

/**
 * Load the package ID from the configuration file
 * @returns The ID of the deployed package or null if not found
 */
export function loadPackageId(): string | null {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const config: PackageConfig = JSON.parse(
                fs.readFileSync(CONFIG_PATH, "utf-8")
            );
            return config.NFT_PACKAGE_ID;
        }
    } catch (error) {
        console.error("Error loading package ID:", error);
    }
    return null;
}
