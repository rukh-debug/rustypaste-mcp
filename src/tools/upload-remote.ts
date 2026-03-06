import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RustypasteClient } from "../services/api-client.js";

const InputSchema = z.object({
    url: z
        .string()
        .url("Must be a valid URL")
        .describe("The remote file URL to upload to rustypaste"),
});

type Input = z.infer<typeof InputSchema>;

export function registerUploadRemote(server: McpServer): void {
    server.registerTool(
        "rustypaste_upload_remote",
        {
            title: "Upload from Remote URL",
            description: `Upload a file from a remote URL to rustypaste.

The rustypaste server fetches the file from the provided URL and hosts it.
Useful for mirroring or re-hosting remote resources.

Args:
  - url (string): The remote file URL to fetch and upload (must be a valid URL)

Returns:
  The rustypaste URL for the uploaded file.

Examples:
  - Mirror an image: url="https://example.com/photo.jpg"
  - Re-host a file: url="https://cdn.example.com/release-v1.2.tar.gz"`,
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
                const result = await client.uploadRemote(params.url);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `✅ Remote file uploaded!\n\nURL: ${result.url}\nSource: ${params.url}`,
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
