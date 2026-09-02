import { setupTestEnvironment, createMockRequestHandlerExtra, createSnapshotResult } from "./setup.js";
import { validateToolResponse } from "@umbraco-cms/mcp-server-sdk/testing";
import validateFormFieldSettingsTool from "../post/validate-form-field-settings.js";
import listFieldTypesTool from "../../field-type/get/list-field-types.js";

describe("validate-form-field-settings", () => {
  setupTestEnvironment();

  it("should validate a field's settings against a real field type", async () => {
    const context = createMockRequestHandlerExtra();

    const fieldTypesResult = await listFieldTypesTool.handler({}, context);
    const fieldTypes = validateToolResponse(listFieldTypesTool, fieldTypesResult) as {
      items: Array<{ id: string }>;
    };
    const fieldTypeId = fieldTypes.items[0].id;

    const result = await validateFormFieldSettingsTool.handler(
      {
        id: fieldTypeId,
        caption: "_Test Field Caption",
        alias: "testFieldAlias",
        settings: {},
        allowedUploadTypes: undefined,
      },
      context,
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should return an error for a non-existent field type id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await validateFormFieldSettingsTool.handler(
      {
        id: "00000000-0000-0000-0000-000000000000",
        caption: "_Test Field Caption",
        alias: "testFieldAlias",
        settings: {},
        allowedUploadTypes: undefined,
      },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
