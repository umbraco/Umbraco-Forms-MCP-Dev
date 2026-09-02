import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import queryAnalyticsOverviewTool from "../post/query-analytics-overview.js";

// The API requires startDate/endDate even though the tool schema documents
// them as optional. A short fixed window keeps the test deterministic and
// keeps date-bucketed responses (e.g. submissions-by-day) small.
const TEST_START_DATE = "2026-08-20T00:00:00+00:00";
const TEST_END_DATE = "2026-08-26T00:00:00+00:00";

describe("query-analytics-overview", () => {
  setupTestEnvironment();

  it("should return an analytics overview using default metrics and dimensions", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await queryAnalyticsOverviewTool.handler(
      {
        formId: undefined,
        filter: undefined,
        startDate: TEST_START_DATE,
        endDate: TEST_END_DATE,
        timeZone: undefined,
        sort: undefined,
        metrics: ["entries", "workflowCount", "workflowErrors", "storeRecords"],
        dimensions: ["formId", "formName"],
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
