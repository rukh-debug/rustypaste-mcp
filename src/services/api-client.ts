import axios, { AxiosError } from "axios";
import FormData from "form-data";
import * as fs from "node:fs";
import * as path from "node:path";
import { getConfig } from "../constants.js";
import type { RustypasteResult } from "../types.js";

/**
 * Client for the rustypaste API.
 * All methods return the URL string from the server response.
 */
export class RustypasteClient {
    private serverUrl: string;
    private authToken: string;

    constructor() {
        const config = getConfig();
        this.serverUrl = config.serverUrl;
        this.authToken = config.authToken;
    }

    /**
     * Send a multipart/form-data POST to the rustypaste server.
     */
    private async post(
        form: FormData,
        extraHeaders: Record<string, string> = {}
    ): Promise<RustypasteResult> {
        try {
            const response = await axios.post(this.serverUrl, form, {
                headers: {
                    ...form.getHeaders(),
                    Authorization: this.authToken,
                    ...extraHeaders,
                },
                timeout: 60000,
                // rustypaste returns the URL as plain text
                responseType: "text",
                // Prevent axios from parsing JSON
                transformResponse: [(data: string) => data],
            });

            const url = (response.data as string).trim();
            return { url };
        } catch (error) {
            throw this.wrapError(error);
        }
    }

    /**
     * Upload text content as a paste.
     */
    async pasteText(content: string, filename?: string): Promise<RustypasteResult> {
        const form = new FormData();
        const buffer = Buffer.from(content, "utf-8");
        form.append("file", buffer, {
            filename: filename || "paste.txt",
            contentType: "text/plain",
        });
        return this.post(form);
    }

    /**
     * Upload a file from disk.
     */
    async uploadFile(filePath: string): Promise<RustypasteResult> {
        this.validateFilePath(filePath);
        const form = new FormData();
        form.append("file", fs.createReadStream(filePath), {
            filename: path.basename(filePath),
        });
        return this.post(form);
    }

    /**
     * Upload a file from disk with an expiry duration.
     * @param expiry e.g. "10min", "1h", "1d"
     */
    async uploadFileWithExpiry(
        filePath: string,
        expiry: string
    ): Promise<RustypasteResult> {
        this.validateFilePath(filePath);
        const form = new FormData();
        form.append("file", fs.createReadStream(filePath), {
            filename: path.basename(filePath),
        });
        return this.post(form, { expire: expiry });
    }

    /**
     * Upload a file as a one-shot (single-view) link.
     */
    async oneshotFile(filePath: string): Promise<RustypasteResult> {
        this.validateFilePath(filePath);
        const form = new FormData();
        form.append("oneshot", fs.createReadStream(filePath), {
            filename: path.basename(filePath),
        });
        return this.post(form);
    }

    /**
     * Create a one-shot URL redirect (viewable only once).
     */
    async oneshotUrl(url: string): Promise<RustypasteResult> {
        const form = new FormData();
        form.append("oneshot_url", url);
        return this.post(form);
    }

    /**
     * Shorten a URL.
     */
    async shortenUrl(url: string): Promise<RustypasteResult> {
        const form = new FormData();
        form.append("url", url);
        return this.post(form);
    }

    /**
     * Upload a file from a remote URL.
     */
    async uploadRemote(url: string): Promise<RustypasteResult> {
        const form = new FormData();
        form.append("remote", url);
        return this.post(form);
    }

    // ── Helpers ──────────────────────────────────────────────

    private validateFilePath(filePath: string): void {
        const resolved = path.resolve(filePath);
        if (!fs.existsSync(resolved)) {
            throw new Error(
                `File not found: ${resolved}. Please provide an absolute path to an existing file.`
            );
        }
        const stat = fs.statSync(resolved);
        if (!stat.isFile()) {
            throw new Error(
                `Path is not a file: ${resolved}. Directories cannot be uploaded.`
            );
        }
    }

    private wrapError(error: unknown): Error {
        if (error instanceof AxiosError) {
            if (error.response) {
                const status = error.response.status;
                const body =
                    typeof error.response.data === "string"
                        ? error.response.data.trim()
                        : JSON.stringify(error.response.data);
                switch (status) {
                    case 401:
                        return new Error(
                            `Authentication failed (401). Check your RUSTYPASTE_AUTH_TOKEN. Server: ${body}`
                        );
                    case 403:
                        return new Error(
                            `Forbidden (403). The server rejected the request. Server: ${body}`
                        );
                    case 413:
                        return new Error(
                            `File too large (413). The server rejected the upload. Server: ${body}`
                        );
                    case 429:
                        return new Error(
                            `Rate limited (429). Too many requests — try again later.`
                        );
                    default:
                        return new Error(
                            `Rustypaste API error (${status}): ${body}`
                        );
                }
            } else if (error.code === "ECONNABORTED") {
                return new Error(
                    `Request timed out. The server at ${this.serverUrl} did not respond in time.`
                );
            } else if (error.code === "ECONNREFUSED") {
                return new Error(
                    `Connection refused. Is rustypaste running at ${this.serverUrl}?`
                );
            }
        }
        return error instanceof Error
            ? error
            : new Error(`Unexpected error: ${String(error)}`);
    }
}
