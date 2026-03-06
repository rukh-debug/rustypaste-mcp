import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RustypasteClient } from "../services/api-client.js";

const InputSchema = z.object({
    file_path: z
        .string()
        .min(1, "File path must not be empty")
        .describe("Absolute path to the file to upload"),
    expiry: z
        .string()
        .min(1, "Expiry must not be empty")
        .describe(
            "Expiry duration string (e.g. '10min', '1h', '1d', '1w'). " +
            "Supported units: s/sec, min, h/hour, d/day, w/week, M/month"
        ),
});

type Input = z.infer<typeof InputSchema>;

export function registerUploadFileWithExpiry(server: McpServer): void {
    server.registerTool(
        "rustypaste_upload_file_with_expiry",
        {
            title: "Upload File with Expiry",
            description: `Upload a local file to rustypaste with an expiration time.

The file will be available at the returned URL until the expiry time elapses,
after which it is automatically deleted from the server.

Args:
  - file_path (string): Absolute path to the file (e.g. "/home/user/doc.pdf")
  - expiry (string): How long the file should be available (e.g. "10min", "1h", "1d", "1w")

Returns:
  The URL of the uploaded file.

Examples:
  - Upload for 1 hour: file_path="/tmp/log.txt", expiry="1h"
  - Upload for 7 days: file_path="/home/user/img.png", expiry="7d"`,
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
                const result = await client.uploadFileWithExpiry(
                    params.file_path,
                    params.expiry
                );
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `✅ File uploaded with expiry (${params.expiry})!\n\nURL: ${result.url}`,
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
