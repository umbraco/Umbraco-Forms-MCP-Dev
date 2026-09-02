/**
 * Eval Test Setup
 *
 * Configures the eval test framework for this MCP server.
 * This runs before any tests via setupFilesAfterEnv in jest.config.ts.
 */

import path from "path";
import { configureEvals, ClaudeModels } from "@umbraco-cms/mcp-server-sdk/evals";

// Configure the eval framework for this MCP server.
//
// This project has no MSW mock handlers for the Forms Management API
// (src/mocks/ only has the template's generic "example" mocks), so evals
// run against the real, live Umbraco instance — same credentials and same
// instance the integration tests (__tests__/) already use.
configureEvals({
  // Path to the built MCP server
  mcpServerPath: path.resolve(process.cwd(), "dist/index.js"),

  // MCP server name (used in tool name prefixes like mcp__forms-mcp-server__tool-name)
  mcpServerName: "forms-mcp-server",

  // Environment variables for the MCP server — real credentials, real instance.
  serverEnv: {
    DISABLE_MCP_CHAINING: "true",
    UMBRACO_CLIENT_ID: process.env.UMBRACO_CLIENT_ID || "",
    UMBRACO_CLIENT_SECRET: process.env.UMBRACO_CLIENT_SECRET || "",
    UMBRACO_BASE_URL: process.env.UMBRACO_BASE_URL || "",
  },

  // Test defaults
  defaultModel: ClaudeModels.Haiku,
  defaultMaxTurns: 10,
  defaultMaxBudgetUsd: 0.25,
  defaultTimeoutMs: 60000,
});
