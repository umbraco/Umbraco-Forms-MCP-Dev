/**
 * Cloudflare Worker Entry Point
 *
 * Hosted MCP server deployment for Cloudflare Workers.
 * Uses the same tool collections as the stdio entry point (index.ts)
 * but runs over Streamable HTTP with OAuth authentication.
 *
 * Includes in-process chaining to the CMS MCP server — CMS tools
 * are bundled into the same Worker and proxied under the "cms:" prefix.
 *
 * NOTE: This file is built by wrangler (not tsup) because it uses
 * Wrangler virtual modules (`agents/mcp`, `@cloudflare/workers-oauth-provider`).
 *
 * Deployment:
 *   npx wrangler dev     # Local development
 *   npx wrangler deploy  # Production deployment
 *
 * See wrangler.toml for configuration.
 */

// Wrangler virtual modules (resolved at wrangler build time)
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import OAuthProvider from "@cloudflare/workers-oauth-provider";

// Hosted MCP building blocks
import {
  createDefaultHandler,
  createWorkerExport,
  createPerRequestServer,
  getServerOptions,
  type HostedMcpEnv,
  type AuthProps,
} from "@umbraco-cms/mcp-hosted";

// Import Forms tool collections
import { collections, allModes, allModeNames, allSliceNames } from "./collections.js";

// Import the Orval-generated API client
import { getUmbracoFormsManagementAPI } from "./umbraco-api/api/generated/umbracoFormsManagementApi.js";

// Import CMS collections for in-process chaining
import {
  collections as cmsCollections,
  allModes as cmsModes,
  allModeNames as cmsModeNames,
  allSliceNames as cmsSliceNames,
} from "@umbraco-cms/mcp-dev/collections";

// MCP chaining
import { createMcpClientManager, discoverProxiedTools, parseProxiedToolName } from "@umbraco-cms/mcp-server-sdk";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

// ============================================================================
// MCP Chaining — CMS tools via in-process transport
// ============================================================================

const mcpClientManager = createMcpClientManager();

mcpClientManager.registerServer({
  transport: "in-process",
  name: "cms",
  collections: cmsCollections,
  modeRegistry: cmsModes,
  allModeNames: cmsModeNames,
  allSliceNames: cmsSliceNames,
  proxyTools: true,
});

// ============================================================================
// Server Configuration
// ============================================================================

const options = {
  name: "umbraco-forms-mcp",
  version: "17.0.0",
  collections,
  modeRegistry: allModes,
  allModeNames,
  allSliceNames,
  clientFactory: () => getUmbracoFormsManagementAPI(),
  authOptions: { showReauthButton: true },
};

const serverOptions = getServerOptions(options);

// ============================================================================
// McpAgent Durable Object
// ============================================================================

/**
 * Durable Object class for stateful MCP sessions.
 * Each MCP client connection gets its own instance.
 * Wrangler resolves `McpAgent` from the `agents/mcp` virtual module.
 */
export class UmbracoFormsMcpAgent extends McpAgent<HostedMcpEnv, unknown, AuthProps> {
  server!: McpServer;

  async init() {
    this.server = await createPerRequestServer(
      serverOptions,
      this.env,
      this.props!
    );

    // Register proxied CMS tools on this server instance
    try {
      const proxiedTools = await discoverProxiedTools(mcpClientManager);

      for (const pt of proxiedTools) {
        this.server.registerTool(
          pt.prefixedName,
          {
            description: `[Proxied from ${pt.serverName}] ${pt.originalTool.description || "No description"}`,
          },
          async (args: Record<string, unknown>): Promise<CallToolResult> => {
            const { serverName, toolName } = parseProxiedToolName(pt.prefixedName);
            const result = await mcpClientManager.callTool(serverName, toolName, args);
            return result as CallToolResult;
          }
        );
      }
    } catch (error) {
      console.error("Warning: Failed to discover proxied CMS tools:", error);
    }
  }
}

// ============================================================================
// Worker Export
// ============================================================================

const provider = new OAuthProvider({
  apiRoute: "/mcp",
  apiHandler: UmbracoFormsMcpAgent.serve("/mcp", { binding: "MCP_AGENT" }),
  defaultHandler: createDefaultHandler(options) as any,
  authorizeEndpoint: "/authorize",
  tokenEndpoint: "/token",
  clientRegistrationEndpoint: "/register",
});

export default createWorkerExport(provider, options);
