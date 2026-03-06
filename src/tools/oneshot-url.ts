import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RustypasteClient } from "../services/api-client.js";

const InputSchema = z.object({
    url: z
        .string()
        .url("Must be a valid URL")
        .describe("The URL to create a one-shot redirect for"),
});

type Input = z.infer<typeof InputSchema>;

export function registerOneshotUrl(server: McpServer): void {
    server.registerTool(
        "rustypaste_oneshot_url",
        {
            title: "One-Shot URL Redirect",
            description: `Create a one-shot URL redirect — the link expires after a single visit.

Wraps a URL in a one-time redirect. After the first person clicks it,
the redirect is deleted from the server.

Args:
  - url (string): The target URL to wrap (must be a valid URL)

Returns:
  The one-shot redirect URL.

Examples:
  - One-time link: url="https://example.com/sensitive-doc"`,
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
                const result = await client.oneshotUrl(params.url);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `✅ One-shot URL created!\n\n⚠️ This redirect will expire after a single visit.\n\nURL: ${result.url}`,
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
