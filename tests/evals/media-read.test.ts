/**
 * Media Read Eval Test
 *
 * Verifies an LLM agent can use the "media" collection's single read-only
 * tool correctly. There is no media-creation or media-listing tool in this
 * collection, so this test relies on a real, known-good media virtual path
 * seeded on the connected instance (Umbraco's demo starter media library) —
 * the same path the integration test in
 * src/umbraco-api/tools/media/__tests__/get-media-by-path.test.ts uses.
 */

import { describe, it } from "@jest/globals";
import {
  runScenarioTest,
  setupConsoleMock,
  getDefaultTimeoutMs,
} from "@umbraco-cms/mcp-server-sdk/evals";

const TEST_MEDIA_PATH = "/media/0ofdvcwj/chairs-lamps.jpg";

describe("Media Read Operations", () => {
  setupConsoleMock();

  const timeout = getDefaultTimeoutMs();

  it(
    "should look up a known media item by its virtual path",
    runScenarioTest({
      prompt: `Look up the Umbraco media item at the virtual path "${TEST_MEDIA_PATH}".
Then say "MEDIA ITEM RETRIEVED" followed by its media type and whether it is trashed.`,
      tools: ["get-media-by-path"],
      requiredTools: ["get-media-by-path"],
      successPattern: "MEDIA ITEM RETRIEVED",
      verbose: true,
    }),
    timeout
  );
});
