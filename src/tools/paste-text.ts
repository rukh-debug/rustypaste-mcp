import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RustypasteClient } from "../services/api-client.js";

const InputSchema = z.object({
    content: z
        .string()
        .min(1, "Content must not be empty")
        .describe("The text content to paste"),
    filename: z
        .string()
        .optional()
        .describe(
            "Optional filename for the paste (e.g. 'notes.md'). Defaults to 'paste.txt'"
        ),
});

type Input = z.infer<typeof InputSchema>;

export function registerPasteText(server: McpServer): void {
    server.registerTool(
        "rustypaste_paste_text",
        {
            title: "Paste Text",
            description: `Upload text content to rustypaste and get a shareable URL.

Use this to paste code snippets, notes, logs, or any text content.
The text is uploaded as a file and a URL is returned.

Args:
  - content (string): The text to paste (required, non-empty)
  - filename (string, optional): Name for the paste file (default: "paste.txt")

Returns:
  The URL of the created paste.

Examples:
  - Paste a log excerpt: content="error at line 42: null pointer"
  - Paste code with a name: content="def main(): ...", filename="app.py"`,
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
                const result = await client.pasteText(params.content, params.filename);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `✅ Paste created successfully!\n\nURL: ${result.url}`,
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
