// Must be set before any TLS connections
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import "dotenv/config";
import https from "node:https";
import { initializeUmbracoFetch } from "@umbraco-cms/mcp-server-sdk";

// Directly configure the global HTTPS agent to accept self-signed certs
https.globalAgent.options.rejectUnauthorized = false;

// Initialize the SDK fetch client with dummy credentials for unit tests.
// MSW intercepts all HTTP requests, so these values are never used.
initializeUmbracoFetch({
  baseUrl: process.env.UMBRACO_BASE_URL || "http://localhost:44391",
  clientId: process.env.UMBRACO_CLIENT_ID || "test-client",
  clientSecret: process.env.UMBRACO_CLIENT_SECRET || "test-secret",
});
