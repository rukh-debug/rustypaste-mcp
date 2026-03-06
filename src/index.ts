#!/usr/bin/env node
/**
 * Rustypaste MCP Server
 *
 * Provides LLM agents with tools to interact with a rustypaste instance:
 * file uploads, text pastes, URL shortening, one-shot links, and remote uploads.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerPasteText } from "./tools/paste-text.js";
import { registerUploadFile } from "./tools/upload-file.js";
import { registerUploadFileWithExpiry } from "./tools/upload-with-expiry.js";
import { registerOneshotFile } from "./tools/oneshot-file.js";
import { registerOneshotUrl } from "./tools/oneshot-url.js";
import { registerShortenUrl } from "./tools/shorten-url.js";
import { registerUploadRemote } from "./tools/upload-remote.js";

// Create the MCP server
const server = new McpServer({
    name: "rustypaste-mcp-server",
    version: "1.0.0",
});

// Register all tools
registerPasteText(server);
registerUploadFile(server);
registerUploadFileWithExpiry(server);
registerOneshotFile(server);
registerOneshotUrl(server);
registerShortenUrl(server);
registerUploadRemote(server);

// Start with stdio transport
async function main(): Promise<void> {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("rustypaste-mcp-server running via stdio");
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
