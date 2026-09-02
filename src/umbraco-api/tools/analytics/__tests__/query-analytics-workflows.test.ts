import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import queryAnalyticsWorkflowsTool from "../post/query-analytics-workflows.js";

// The API requires startDate/endDate even though the tool schema documents
// them as optional. A short fixed window keeps the test deterministic.
const TEST_START_DATE = "2026-08-20T00:00:00+00:00";
const TEST_END_DATE = "2026-08-26T00:00:00+00:00";

describe("query-analytics-workflows", () => {
  setupTestEnvironment();

  it("should return workflow run analytics using default metrics and dimensions", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await queryAnalyticsWorkflowsTool.handler(
      {
        formId: undefined,
        filter: undefined,
        startDate: TEST_START_DATE,
        endDate: TEST_END_DATE,
        timeZone: undefined,
        sort: undefined,
        metrics: ["triggered", "success", "failures"],
        dimensions: ["workflowId", "workflowName"],
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
