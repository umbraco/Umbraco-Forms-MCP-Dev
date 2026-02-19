/**
 * Server Configuration
 *
 * Extends the base Umbraco MCP config with custom fields
 * for the Umbraco Forms MCP server.
 */

import {
  getServerConfig,
  type ConfigFieldDefinition,
  type UmbracoServerConfig,
} from "@umbraco-cms/mcp-server-sdk";

// ============================================================================
// Custom Config Interface
// ============================================================================

export interface FormsCustomConfig {
  /** Disable MCP server chaining (useful for testing or isolated deployments) */
  disableMcpChaining?: boolean;
  /** API key for the Umbraco Forms Delivery API */
  formsApiKey?: string;
}

// ============================================================================
// Custom Field Definitions
// ============================================================================

const customFields: ConfigFieldDefinition[] = [
  {
    name: "disableMcpChaining",
    envVar: "DISABLE_MCP_CHAINING",
    cliFlag: "disable-mcp-chaining",
    type: "boolean",
  },
  {
    name: "formsApiKey",
    envVar: "UMBRACO_FORMS_API_KEY",
    cliFlag: "umbraco-forms-api-key",
    type: "string",
  },
];

// ============================================================================
// Config Loading
// ============================================================================

export interface ServerConfig {
  /** Base Umbraco MCP configuration */
  umbraco: UmbracoServerConfig;
  /** Custom configuration for this server */
  custom: FormsCustomConfig;
}

let cachedConfig: ServerConfig | null = null;

/**
 * Load server configuration from CLI arguments and environment variables.
 */
export function loadServerConfig(isStdioMode: boolean): ServerConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const { config, custom } = getServerConfig(isStdioMode, {
    additionalFields: customFields,
  });

  cachedConfig = {
    umbraco: config,
    custom: custom as FormsCustomConfig,
  };

  return cachedConfig;
}

/**
 * Clear cached config (useful for testing)
 */
export function clearConfigCache(): void {
  cachedConfig = null;
}
