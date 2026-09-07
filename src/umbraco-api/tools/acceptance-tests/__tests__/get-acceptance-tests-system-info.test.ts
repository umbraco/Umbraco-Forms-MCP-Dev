import { getStructuredContent } from "@umbraco-cms/mcp-server-sdk/testing";
import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getAcceptanceTestsSystemInfoTool from "../get/get-acceptance-tests-system-info.js";

describe("get-acceptance-tests-system-info", () => {
  setupTestEnvironment();

  it("should return host system information", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getAcceptanceTestsSystemInfoTool.handler({}, context);
    const { isLinux, isMacOS, isWindows, ...rest } = getStructuredContent(
      result,
    ) as { isLinux: boolean; isMacOS: boolean; isWindows: boolean };

    // The host OS varies by machine (CI runs Linux, local dev may be macOS/Windows), so it's
    // asserted here as an invariant rather than baked into the snapshot.
    expect([isLinux, isMacOS, isWindows].filter(Boolean)).toHaveLength(1);

    expect(
      createSnapshotResult({ ...result, structuredContent: rest }),
    ).toMatchSnapshot();
  });
});
