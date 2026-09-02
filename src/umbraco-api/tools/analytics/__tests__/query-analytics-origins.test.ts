import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import queryAnalyticsOriginsTool from "../post/query-analytics-origins.js";

// The API requires startDate/endDate even though the tool schema documents
// them as optional. A short fixed window keeps the test deterministic.
const TEST_START_DATE = "2026-08-20T00:00:00+00:00";
const TEST_END_DATE = "2026-08-26T00:00:00+00:00";

describe("query-analytics-origins", () => {
  setupTestEnvironment();

  it("should return submission origins broken down by page/URL using default metrics and dimensions", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await queryAnalyticsOriginsTool.handler(
      {
        formId: undefined,
        filter: undefined,
        startDate: TEST_START_DATE,
        endDate: TEST_END_DATE,
        timeZone: undefined,
        sort: undefined,
        metrics: ["entries"],
        dimensions: ["pageId", "pageName", "pageUrl"],
        ascending: true,
        page: 1,
        pageSize: 50,
        includeSubpages: true,
      },
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
