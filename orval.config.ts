import { defineConfig } from "orval";
import { orvalImportFixer } from "@umbraco-cms/mcp-server-sdk";

/**
 * Orval Configuration
 *
 * This generates TypeScript API clients from OpenAPI specs.
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
      target: "./src/umbraco-api/api/forms-management-swagger.json",
      validation: false,
    },
    output: {
      mode: "split",
      clean: true,
      target: "./src/umbraco-api/api/generated/api",
      schemas: "./src/umbraco-api/api/generated/schemas",
      client: "axios",
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
      target: "./src/umbraco-api/api/forms-management-swagger.json",
      validation: false,
    },
    output: {
      mode: "split",
      client: "zod",
      target: "./src/umbraco-api/api/generated/",
      fileExtension: ".zod.ts",
    },
  },

  // Delivery API client generation (for form submissions / record creation)
  umbracoFormsDeliveryApi: {
    input: {
      target: "./src/umbraco-api/api/forms-delivery-swagger.json",
      validation: false,
    },
    output: {
      mode: "split",
      clean: true,
      target: "./src/umbraco-api/api/delivery/api",
      schemas: "./src/umbraco-api/api/delivery/schemas",
      client: "axios",
      override: {
        mutator: {
          path: "./src/umbraco-api/api/delivery-client.ts",
          name: "deliveryInstance",
        },
      },
    },
    hooks: {
      afterAllFilesWrite: orvalImportFixer,
    },
  },

  // Delivery API Zod schema generation
  umbracoFormsDeliveryApiZod: {
    input: {
      target: "./src/umbraco-api/api/forms-delivery-swagger.json",
      validation: false,
    },
    output: {
      mode: "split",
      client: "zod",
      target: "./src/umbraco-api/api/delivery/",
      fileExtension: ".zod.ts",
    },
  },
});
