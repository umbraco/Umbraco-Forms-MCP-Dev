import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  createSnapshotResult,
  DataSourceBuilder,
} from "./setup.js";
import getDataSourceWizardScaffoldTool from "../get/get-data-source-wizard-scaffold.js";

const TEST_NAME = "_Test Data Source Wizard Scaffold";

describe("get-data-source-wizard-scaffold", () => {
  setupTestEnvironment();

  let builder: DataSourceBuilder;

  afterEach(async () => {
    if (builder) await builder.delete();
  });

  it("should return the wizard scaffold for a data source", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new DataSourceBuilder().withName(TEST_NAME).create();

    const result = await getDataSourceWizardScaffoldTool.handler(
      { dataSourceId: builder.getId() },
      context,
    );

    // "dataSourceGuid" is the client-generated random id from the builder, not a field
    // the SDK's built-in id normalization recognizes — normalize it manually so the
    // snapshot doesn't flake between runs.
    const structuredContent = result.structuredContent as
      | { dataSourceGuid?: string }
      | undefined;
    const normalized = {
      ...result,
      structuredContent: structuredContent
        ? { ...structuredContent, dataSourceGuid: "00000000-0000-0000-0000-000000000000" }
        : structuredContent,
    };

    expect(createSnapshotResult(normalized)).toMatchSnapshot();
  });

  it("should return error for a non-existent data source id", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await getDataSourceWizardScaffoldTool.handler(
      { dataSourceId: "00000000-0000-0000-0000-000000000000" },
      context,
    );

    expect(result.isError).toBe(true);
  });
});
