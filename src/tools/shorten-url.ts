import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RustypasteClient } from "../services/api-client.js";

const InputSchema = z.object({
    url: z
        .string()
        .url("Must be a valid URL")
        .describe("The long URL to shorten"),
});

type Input = z.infer<typeof InputSchema>;

export function registerShortenUrl(server: McpServer): void {
    server.registerTool(
        "rustypaste_shorten_url",
        {
            title: "Shorten URL",
            description: `Shorten a long URL using rustypaste.

Creates a short redirect URL that points to the original long URL.

Args:
  - url (string): The URL to shorten (must be a valid URL)

Returns:
  The shortened URL.

Examples:
  - Shorten a link: url="https://example.com/very/long/path/to/resource?with=params"`,
            inputSchema: InputSchema,
            annotations: {
                readOnlyHint: false,
                destructiveHint: false,
                idempotentHint: false,
                openWorldHint: true,
            },
        },
        async (params: Input) => {
            try {
                const client = new RustypasteClient();
                const result = await client.shortenUrl(params.url);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `✅ URL shortened!\n\nShort URL: ${result.url}\nOriginal:  ${params.url}`,
                        },
                    ],
                };
            } catch (error) {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text" as const,
                            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                };
            }
        }
    );
}
