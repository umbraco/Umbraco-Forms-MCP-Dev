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
    name: 'forms-data',
    displayName: 'Forms Data',
    description: 'Manage form data sources and their configurations',
    collections: ['data-source']
  },
    {
    name: 'all',
    displayName: 'All',
    description: 'All Umbraco Forms management tools',
    collections: ['data-source']
  },
    {
    name: 'form-design',
    displayName: 'Form Design',
    description: 'Create and manage forms, fields, folders, and media',
    collections: ['form', 'field-type', 'folder', 'media']
  },
    {
    name: 'data-sources',
    displayName: 'Data Sources',
    description: 'Manage data sources and prevalue sources for form fields',
    collections: ['data-source', 'data-source-type', 'prevalue-source', 'prevalue-source-type']
  },
    {
    name: 'submissions',
    displayName: 'Submissions',
    description: 'View and manage form submission records and workflows',
    collections: ['record', 'workflow-type']
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
