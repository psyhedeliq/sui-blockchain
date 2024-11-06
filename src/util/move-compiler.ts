import { execSync } from "child_process";

/**
 * Compiles a Move package.
 * @param packagePath - The path to the Move package.
 * @returns void
 */
export async function compileMovePackage(packagePath: string): Promise<void> {
    try {
        console.log("Compiling Move package...");
        execSync("sui move build", {
            cwd: packagePath,
            stdio: "inherit", // This will show the compilation output in real-time
        });
        console.log("Compilation successful");
    } catch (error) {
        console.error("Error compiling Move code:", error);
        throw new Error("Failed to compile Move code");
    }
}
