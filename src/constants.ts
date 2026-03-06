// Environment variable keys
export const ENV_RUSTYPASTE_URL = "RUSTYPASTE_URL";
export const ENV_RUSTYPASTE_AUTH_TOKEN = "RUSTYPASTE_AUTH_TOKEN";

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

    const authToken = process.env[ENV_RUSTYPASTE_AUTH_TOKEN];

    if (!authToken) {
        throw new Error(
            `${ENV_RUSTYPASTE_AUTH_TOKEN} environment variable is required.`
        );
    }

    return { serverUrl: serverUrl.replace(/\/+$/, ""), authToken };
}
