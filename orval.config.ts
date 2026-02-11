import { defineConfig } from "orval";
import { orvalImportFixer } from "@umbraco-cms/mcp-server-sdk";

/**
 * Orval Configuration
 *
 * This generates TypeScript API clients from OpenAPI specs.
 *
 * The template includes a sample OpenAPI spec (src/umbraco-api/api/openapi.yaml) that
 * demonstrates the patterns. Replace it with your add-on's spec.
 *
 * Example OpenAPI spec sources:
 * - Local file: "./src/umbraco-api/api/openapi.yaml"
 * - Local Umbraco: "http://localhost:44391/umbraco/swagger/management/swagger.json"
 * - Remote URL: "https://api.example.com/swagger.json"
 */
export default defineConfig({
  // Main API client generation
  umbracoFormsManagementApi: {
    input: {
      // Use the included example OpenAPI spec
      // Replace with your add-on's spec path or URL
      target: "https://localhost:44374/umbraco/swagger/forms-management/swagger.json",
      validation: false,
    },
    output: {
      target: "./src/umbraco-api/api/generated/umbracoFormsManagementApi.ts",
      client: "axios",
      mode: "single",
      clean: false,
      override: {
        mutator: {
          path: "./src/umbraco-api/api/client.ts",
          name: "customInstance",
        },
      },
    },
    hooks: {
      afterAllFilesWrite: orvalImportFixer,
    },
  },

  // Zod schema generation for validation
  umbracoFormsManagementApiZod: {
    input: {
      target: "https://localhost:44374/umbraco/swagger/forms-management/swagger.json",
      validation: false,
    },
    output: {
      target: "./src/umbraco-api/api/generated/umbracoFormsManagementApi.zod.ts",
      client: "zod",
      mode: "single",
      clean: false,
    },
  },
});
