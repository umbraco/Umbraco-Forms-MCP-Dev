import { defineConfig } from "orval";
import { orvalImportFixer } from "./orval-import-fixer.js";

export const UmbFormsDeliveryApiOrvalConfig = defineConfig({
  "umbraco-forms-delivery-api": {
    input: {
      target: "http://localhost:17813/umbraco/swagger/forms-delivery/swagger.json",
      validation: false,
    },
    output: {
      mode: "split",
      clean: false,
      target: "./src/umbraco-api/api/generated/umbracoFormsDeliveryApi.ts",
      schemas: "./src/umbraco-api/api/schemas",
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
  "umbraco-forms-delivery-api-zod": {
    input: {
      target: "http://localhost:17813/umbraco/swagger/forms-delivery/swagger.json",
      validation: false,
    },
    output: {
      mode: "split",
      client: "zod",
      target: "./src/umbraco-api/api/generated/umbracoFormsDeliveryApi.zod.ts",
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
