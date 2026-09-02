import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getMediaByPathTool from "../get/get-media-by-path.js";

// A real media item's virtual path from the "Sample Images" folder seeded on this
// instance (Umbraco's demo starter media library). There is no media-creation tool
// in this collection, so the happy path relies on media already existing.
const TEST_MEDIA_PATH = "/media/0ofdvcwj/chairs-lamps.jpg";

describe("get-media-by-path", () => {
  setupTestEnvironment();

  it("should return the media item for a known virtual path", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getMediaByPathTool.handler({ path: TEST_MEDIA_PATH }, context);

    expect(createSnapshotResult(result, (result.structuredContent as { id?: string })?.id)).toMatchSnapshot();
  });

  it("should return an error for a non-existent path", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getMediaByPathTool.handler(
      { path: "/media/does-not-exist/nope.jpg" },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
