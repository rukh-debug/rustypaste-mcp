# rustypaste-mcp-server

An MCP server that wraps the [rustypaste](https://github.com/orhun/rustypaste) API.

## Tools

| Tool | Description |
|------|-------------|
| `rustypaste_paste_text` | Upload text content and get a shareable URL |
| `rustypaste_upload_file` | Upload a local file by path |
| `rustypaste_upload_file_with_expiry` | Upload a file with auto-deletion after a duration |
| `rustypaste_oneshot_file` | Upload a file as a single-view link |
| `rustypaste_oneshot_url` | Create a single-use URL redirect |
| `rustypaste_shorten_url` | Shorten a long URL |
| `rustypaste_upload_remote` | Fetch a remote URL and host it on rustypaste |

## Setup

Add the following to your MCP client configuration (e.g., `~/.config/claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "rustypaste": {
      "command": "npx",
      "args": [
        "-y",
        "@myusername/rustypaste-mcp"
      ],
      "env": {
        "RUSTYPASTE_URL": "https://paste.example.com",
        "RUSTYPASTE_AUTH_TOKEN_FILE": "/absolute/path/to/token.txt"
      }
    }
  }
}
```

*Note: You can alternatively use `"RUSTYPASTE_AUTH_TOKEN": "<your-token-here>"` instead of `RUSTYPASTE_AUTH_TOKEN_FILE` if you prefer to provide the token directly.*

## License

MIT
