#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";
import dotenv from "dotenv";

// Silence library logs on stdout
const originalLog = console.log;
console.log = console.error;
dotenv.config();
console.log = originalLog;

const API_KEY = process.env.WALLET_API_TOKEN;
const BASE_URL = "https://rest.budgetbakers.com/wallet/v1/api";

if (!API_KEY) {
  console.error("Error: WALLET_API_TOKEN environment variable is not set.");
  process.exit(1);
}

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    Accept: "application/json",
  },
});

async function makeRequest(method: string, endpoint: string, params?: any) {
  try {
    const response = await client.request({
      method,
      url: endpoint,
      params,
    });
    return response.data;
  } catch (error: any) {
    return {
      error: error.response?.statusText || error.message,
      details: error.response?.data,
    };
  }
}

const server = new McpServer({
  name: "budgetbakers-wallet-mcp",
  version: "1.0.0",
});

// --- Accounts Tool ---
server.tool("list_accounts", {}, async () => {
  const data = await makeRequest("GET", "accounts");
  if (Array.isArray(data)) {
    const slimAccounts = data.map((a: any) => ({
      id: a.id,
      name: a.name,
      balance: a.balance,
      currency: a.currency,
      type: a.accountType
    }));
    return { content: [{ type: "text", text: JSON.stringify({ accounts: slimAccounts }, null, 2) }] };
  }
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

// --- Records (Transactions) Tool ---
server.tool(
  "list_records",
  {
    limit: z.number().optional().default(30),
    accountId: z.string().optional(),
    recordDate: z.string().optional().describe("Date filter (e.g., 'gte.2024-01-01')"),
    note: z.string().optional().describe("Fuzzy match (e.g., 'contains-i.pizza')"),
  },
  async (args) => {
    const data = await makeRequest("GET", "records", args);
    if (Array.isArray(data)) {
      const slimRecords = data.map((r: any) => ({
        id: r.id,
        amount: r.amount,
        currency: r.currency,
        date: r.recordDate,
        note: r.note,
        category: r.categoryName,
        account: r.accountName
      }));
      return { content: [{ type: "text", text: JSON.stringify({ records: slimRecords }, null, 2) }] };
    }
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// --- Categories Tool ---
server.tool("list_categories", {}, async () => {
  const data = await makeRequest("GET", "categories");
  if (Array.isArray(data)) {
    const slimCategories = data.map((c: any) => ({
      id: c.id,
      name: c.name,
      type: c.categoryType
    }));
    return { content: [{ type: "text", text: JSON.stringify({ categories: slimCategories }, null, 2) }] };
  }
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

// --- Usage Tool ---
server.tool("get_api_usage", {}, async () => {
  const data = await makeRequest("GET", "api-usage/stats");
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
