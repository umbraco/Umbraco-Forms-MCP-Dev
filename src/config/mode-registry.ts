/**
 * Tool Mode Registry
 *
 * Defines tool modes that group tools by domain/functionality.
 * Modes map to collections, allowing users to enable groups of related tools.
 *
 * This is the SINGLE SOURCE OF TRUTH for mode definitions in this project.
 */

import type { ToolModeDefinition } from "@umbraco-cms/mcp-server-sdk";

/**
 * Tool mode definitions for this project.
 *
 * Each mode groups related tool collections together.
 * Users can enable modes in their config to include all tools in those collections.
 *
 * @example
 * ```typescript
 * // In server config
 * {
 *   toolModes: ['content', 'media']  // Enables all tools in content and media collections
 * }
 * ```
 */
export const toolModes: ToolModeDefinition[] = [
  {
    name: 'umbraco-server',
    displayName: 'Umbraco Server',
    description: 'Server information and status from the Umbraco Management API',
    collections: ['umbraco-server']
  },
    {
    name: 'forms-management-all',
    displayName: 'All Forms Management Tools',
    description: 'All 21 Forms Management collections combined',
    collections: ['acceptance-tests', 'analytics', 'config', 'data-source', 'data-source-type', 'email-template', 'export', 'field-type', 'folder', 'form', 'form-template', 'licensing', 'media', 'member', 'picker', 'prevalue-source', 'prevalue-source-type', 'record', 'theme', 'updates', 'workflow-type']
  },
  {
    name: 'forms-authoring',
    displayName: 'Forms Authoring',
    description: 'Build and structure forms: forms, templates, field types, pickers, folders, themes',
    collections: ['form', 'form-template', 'field-type', 'picker', 'folder', 'theme']
  },
  {
    name: 'data-sources',
    displayName: 'Data Sources',
    description: 'Dynamic prevalue and data sources used to populate form fields',
    collections: ['data-source', 'data-source-type', 'prevalue-source', 'prevalue-source-type']
  },
  {
    name: 'submissions',
    displayName: 'Submissions & Analytics',
    description: 'Read and act on submitted form records, and query submission analytics',
    collections: ['record', 'analytics', 'workflow-type']
  },
  {
    name: 'admin',
    displayName: 'Forms Admin',
    description: 'Server-wide Forms configuration, licensing, updates, members, email templates, and export/import',
    collections: ['config', 'licensing', 'updates', 'member', 'email-template', 'export', 'acceptance-tests', 'media']
  },
];

/**
 * All mode definitions (alias for toolModes).
 */
export const allModes: ToolModeDefinition[] = [...toolModes];

/**
 * All valid mode names for configuration validation.
 */
export const allModeNames: readonly string[] = toolModes.map(m => m.name);

/**
 * Valid mode name type.
 */
export type ToolModeName = typeof allModeNames[number];
