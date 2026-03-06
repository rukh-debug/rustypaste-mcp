import * as fs from "node:fs";

// Environment variable keys
export const ENV_RUSTYPASTE_URL = "RUSTYPASTE_URL";
export const ENV_RUSTYPASTE_AUTH_TOKEN = "RUSTYPASTE_AUTH_TOKEN";
export const ENV_RUSTYPASTE_AUTH_TOKEN_FILE = "RUSTYPASTE_AUTH_TOKEN_FILE";

// Limits
export const CHARACTER_LIMIT = 25000;

/**
 * Reads and validates the rustypaste configuration from environment.
 */
export function getConfig(): { serverUrl: string; authToken: string } {
    const serverUrl = process.env[ENV_RUSTYPASTE_URL];

    if (!serverUrl) {
        throw new Error(
            `${ENV_RUSTYPASTE_URL} environment variable is required. ` +
            `Example: https://paste.example.com`
        );
    }

    let authToken = process.env[ENV_RUSTYPASTE_AUTH_TOKEN];
    const authTokenFile = process.env[ENV_RUSTYPASTE_AUTH_TOKEN_FILE];

    if (!authToken && authTokenFile) {
        try {
            authToken = fs.readFileSync(authTokenFile, "utf-8").trim();
        } catch (error) {
            throw new Error(`Failed to read auth token from file at ${authTokenFile}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    if (!authToken) {
        throw new Error(
            `You must provide either the ${ENV_RUSTYPASTE_AUTH_TOKEN} or ${ENV_RUSTYPASTE_AUTH_TOKEN_FILE} environment variable.`
        );
    }

    return { serverUrl: serverUrl.replace(/\/+$/, ""), authToken };
}
