import { configureApiClient, initializeUmbracoFetch } from "@umbraco-cms/mcp-server-sdk";
import { setupTestEnvironment, createMockRequestHandlerExtra } from "@umbraco-cms/mcp-server-sdk/testing";
import { getUmbracoFormsManagementAPI } from "../../../api/generated/umbracoFormsManagementApi.js";
import { UMBRACO_TARGET_MAJOR } from "../../../../config/umbraco-target.generated.js";
import getServerInfoTool from "../get/get-server-info.js";

initializeUmbracoFetch({
  baseUrl: process.env.UMBRACO_BASE_URL!,
  clientId: process.env.UMBRACO_CLIENT_ID!,
  clientSecret: process.env.UMBRACO_CLIENT_SECRET!,
});
configureApiClient(() => getUmbracoFormsManagementAPI());

describe("get-server-info", () => {
  setupTestEnvironment();

  it("should return the connected Umbraco version", async () => {
    const result = await (getServerInfoTool.handler as any)({}, createMockRequestHandlerExtra());

    expect(result.isError).toBeFalsy();
    // The suite runs against the demo site this line targets.
    expect(result.structuredContent.version).toMatch(new RegExp(`^${UMBRACO_TARGET_MAJOR}\\.\\d+\\.\\d+`));
  });
});
