import { defineConfig } from "orval";
import { orvalImportFixer } from "./orval-import-fixer.js";

export const UmbFormsManagementApiOrvalConfig = defineConfig({
  "umbraco-forms-management-api": {
    input: {
      target: "http://localhost:17813/umbraco/swagger/forms-management/swagger.json",
      validation: false,
    },
    output: {
      mode: "split",
      clean: true,
      target: "./src/umbraco-api/api/generated/umbracoFormsManagementApi.ts",
      schemas: "./src/umbraco-api/api/schemas",
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
  "umbraco-forms-management-api-zod": {
    input: {
      target: "http://localhost:17813/umbraco/swagger/forms-management/swagger.json",
      validation: false,
    },
    output: {
      mode: "split",
      client: "zod",
      target: "./src/umbraco-api/api/generated/umbracoFormsManagementApi.zod.ts",
      fileExtension: ".zod.ts",
      override: {
        zod: {
          dateTimeOptions: {
            local: true,
            offset: true,
          },
          coerce: {
            query: ["number", "boolean"],
          },
          generate: {
            param: true,
            query: true,
            header: true,
            body: true,
            response: true,
          },
        },
      },
    },
  },
});
