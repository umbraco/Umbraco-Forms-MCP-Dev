import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
} from "./setup.js";
import getMemberLinkablePropertiesTool from "../get/get-member-linkable-properties.js";
import listFieldTypesTool from "../../field-type/get/list-field-types.js";
import { validateToolResponse } from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-member-linkable-properties", () => {
  setupTestEnvironment();

  it("should return all linkable member properties when no fieldTypeId is supplied", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getMemberLinkablePropertiesTool.handler({ fieldTypeId: undefined }, context);

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should filter linkable member properties by fieldTypeId", async () => {
    const context = createMockRequestHandlerExtra();

    const fieldTypesResult = await listFieldTypesTool.handler({}, context);
    const fieldTypes = validateToolResponse(listFieldTypesTool, fieldTypesResult) as {
      items: Array<{ id: string }>;
    };
    const fieldTypeId = fieldTypes.items[0].id;

    const result = await getMemberLinkablePropertiesTool.handler({ fieldTypeId }, context);

    expect(createSnapshotResult(result, fieldTypeId)).toMatchSnapshot();
  });

  it("should return error for an invalid fieldTypeId", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getMemberLinkablePropertiesTool.handler(
      { fieldTypeId: "not-a-guid" },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
