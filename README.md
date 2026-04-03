# BudgetBakers Wallet MCP Server

An implementation of the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) for BudgetBakers Wallet using the standard REST API.

## Prerequisites

1.  **Wallet API Token**: Obtain yours from the [Wallet Web App](https://web.budgetbakers.com/) under `Settings > API Tokens`.
2.  **Node.js**: Version 16 or higher installed.

## Local Configuration (Claude Desktop)

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "wallet-custom": {
      "command": "node",
      "args": ["/Volumes/ExternalSSD/Expenses/budgetbakers-wallet-mcp/dist/index.js"],
      "env": {
        "WALLET_API_TOKEN": "YOUR_REST_API_TOKEN"
      }
    }
  }
}
```

## Available Tools

- `list_accounts`: List all bank accounts and cash wallets with balances.
- `list_records`: List transactions with optional filters (`recordDate`, `note`, `accountId`).
- `list_categories`: List all transaction categories.
- `get_api_usage`: Check your current API quota.

## License
MIT
