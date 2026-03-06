import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RustypasteClient } from "../services/api-client.js";

const InputSchema = z.object({
    file_path: z
        .string()
        .min(1, "File path must not be empty")
        .describe("Absolute path to the file to upload as a one-shot"),
});

type Input = z.infer<typeof InputSchema>;

export function registerOneshotFile(server: McpServer): void {
    server.registerTool(
        "rustypaste_oneshot_file",
        {
            title: "One-Shot File Upload",
            description: `Upload a file as a one-shot link — it can only be viewed/downloaded once.

After the first access, the file is automatically deleted from the server.
Useful for sharing sensitive or temporary files securely.

Args:
  - file_path (string): Absolute path to the file (e.g. "/home/user/secret.txt")

Returns:
  The one-shot URL. The file will be deleted after the first download.

Examples:
  - Share a secret: file_path="/tmp/credentials.txt"
  - One-time image share: file_path="/home/user/photo.jpg"`,
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
                const result = await client.oneshotFile(params.file_path);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `✅ One-shot file uploaded!\n\n⚠️ This link will expire after a single view.\n\nURL: ${result.url}`,
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
