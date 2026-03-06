import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RustypasteClient } from "../services/api-client.js";

const InputSchema = z.object({
    file_path: z
        .string()
        .min(1, "File path must not be empty")
        .describe("Absolute path to the file to upload"),
});

type Input = z.infer<typeof InputSchema>;

export function registerUploadFile(server: McpServer): void {
    server.registerTool(
        "rustypaste_upload_file",
        {
            title: "Upload File",
            description: `Upload a local file to rustypaste and get a shareable URL.

Reads a file from disk and uploads it to the rustypaste server.
Supports any file type. The returned URL can be shared to download the file.

Args:
  - file_path (string): Absolute path to the file (e.g. "/home/user/doc.pdf")

Returns:
  The URL of the uploaded file.

Examples:
  - Upload an image: file_path="/home/user/screenshot.png"
  - Upload a document: file_path="/tmp/report.pdf"`,
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
                const result = await client.uploadFile(params.file_path);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `✅ File uploaded successfully!\n\nURL: ${result.url}`,
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
