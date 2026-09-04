// Loads .env, so the transformer below can ask the connected Umbraco which
// version it is (it needs UMBRACO_BASE_URL / UMBRACO_CLIENT_ID /
// UMBRACO_CLIENT_SECRET, which live there rather than in the shell).
import "./src/load-env.js";

import { defineConfig, type HookFunction } from "orval";
import {
  orvalImportFixer,
  relaxUntypedArrays,
  postProcessZodFiles,
  createUmbracoTargetMajorTransformer,
} from "@umbraco-cms/mcp-server-sdk/orval";

/**
 * Stamps the Umbraco major version this server targets into a generated
 * constant.
 *
 * The value comes from one place: an authenticated
 * `GET /umbraco/management/api/v1/server/information` against the instance in
 * `.env`. It cannot come from the spec — every Umbraco spec hard-codes
 * `info.version` to the literal string `"Latest"` — and there is deliberately
 * no option, env var or fallback for asserting it by hand, because a value
 * nothing reported is a value nobody revisits (Umbraco-MCP-Base#220).
 *
 * So `npm run generate` needs `UMBRACO_BASE_URL`, `UMBRACO_CLIENT_ID` and
 * `UMBRACO_CLIENT_SECRET` — the same three the server itself runs on, which
 * `init`/`discover` sets up. Without them it fails rather than guessing.
 *
 * It sits in orval's input-transformer slot not because it needs the spec (it
 * ignores it) but because that slot runs as part of the same invocation that
 * generates the client — so the constant and the tools cannot drift apart. A
 * separate step could be skipped; this cannot.
 *
 * The committed `umbraco-target.generated.ts` is a *placeholder* so a fresh
 * scaffold compiles before anyone has generated anything. It says so in its own
 * doc comment. Your first `npm run generate` replaces it with a real value.
 */
const stampTargetMajor = createUmbracoTargetMajorTransformer({
  outputPath: "./src/config/umbraco-target.generated.ts",
});

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
 * - Local Umbraco 18+: "http://localhost:44391/umbraco/openapi/management.json"
 * - Local Umbraco 17:  "http://localhost:44391/umbraco/swagger/management/swagger.json"
 * - Remote URL: "https://api.example.com/openapi.json"
 *
 * Umbraco 18 emits OpenAPI 3.1; this config uses orval 8 with workarounds for a
 * few Umbraco-specific quirks (see relax-untyped-arrays.ts and zod-post-process.ts).
 */
export default defineConfig({
  // Main API client generation
  umbracoFormsManagementApi: {
    input: {
      // Use the included example OpenAPI spec
      // Replace with your add-on's spec path or URL
      target: "https://localhost:44390/umbraco/openapi/forms-management.json",
      unsafeDisableValidation: true,
      override: {
        // Transformers compose. `stampTargetMajor` leaves the spec untouched —
        // it only writes src/config/umbraco-target.generated.ts as a side
        // effect of running at generation time. It is async (it may call the
        // instance); orval awaits input transformers, so returning the promise
        // is correct.
        transformer: (spec) => stampTargetMajor(relaxUntypedArrays(spec)),
      },
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
      afterAllFilesWrite: orvalImportFixer as HookFunction,
    },
  },

  // Zod schema generation for validation
  umbracoFormsManagementApiZod: {
    input: {
      target: "https://localhost:44390/umbraco/openapi/forms-management.json",
      unsafeDisableValidation: true,
      override: {
        transformer: relaxUntypedArrays,
      },
    },
    output: {
      target: "./src/umbraco-api/api/generated/umbracoFormsManagementApi.zod.ts",
      client: "zod",
      mode: "single",
      clean: false,
      override: {
        zod: {
          dateTimeOptions: {
            local: true,
            offset: true,
          },
          coerce: {
            query: ["number", "boolean"],
          },
        },
      },
    },
    hooks: {
      // Keep the generated zod surface stable across the orval 7 -> 8 upgrade.
      afterAllFilesWrite: postProcessZodFiles as HookFunction,
    },
  },

  // Forms Delivery API client generation.
  //
  // Unlike the Management API, the Delivery API has no discoverable
  // /umbraco/openapi/*.json endpoint on the instance — it's a small,
  // stable public surface (get a form definition, submit an entry) that
  // Umbraco Forms ships as a fixed spec, so it's checked in locally rather
  // than fetched live. It also authenticates differently (an `Api-Key`
  // header, not OAuth), hence the separate `deliveryInstance` mutator in
  // `./src/umbraco-api/api/delivery-client.ts`.
  umbracoFormsDeliveryApi: {
    input: {
      target: "./src/umbraco-api/api/forms-delivery-swagger.json",
      unsafeDisableValidation: true,
    },
    output: {
      target: "./src/umbraco-api/api/generated/umbracoFormsDeliveryApi.ts",
      client: "axios",
      mode: "single",
      clean: false,
      override: {
        mutator: {
          path: "./src/umbraco-api/api/delivery-client.ts",
          name: "deliveryInstance",
        },
      },
    },
    hooks: {
      afterAllFilesWrite: orvalImportFixer as HookFunction,
    },
  },

  umbracoFormsDeliveryApiZod: {
    input: {
      target: "./src/umbraco-api/api/forms-delivery-swagger.json",
      unsafeDisableValidation: true,
    },
    output: {
      target: "./src/umbraco-api/api/generated/umbracoFormsDeliveryApi.zod.ts",
      client: "zod",
      mode: "single",
      clean: false,
      override: {
        zod: {
          dateTimeOptions: {
            local: true,
            offset: true,
          },
          coerce: {
            query: ["number", "boolean"],
          },
        },
      },
    },
    hooks: {
      afterAllFilesWrite: postProcessZodFiles as HookFunction,
    },
  },
});
