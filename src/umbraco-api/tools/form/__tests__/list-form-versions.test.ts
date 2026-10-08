import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  validateToolResponse,
  FormBuilder,
} from "./setup.js";
import { renameForm } from "./helpers/form-versions-test-helper.js";
import listFormVersionsTool from "../get/list-form-versions.js";

const TEST_NAME = "_Test List Form Versions";

describe("list-form-versions", () => {
  setupTestEnvironment();

  let builder: FormBuilder | undefined;

  afterEach(async () => {
    await builder?.delete();
    builder = undefined;
  });

  it("should list a version per save, most recent first", async () => {
    const context = createMockRequestHandlerExtra();
    builder = await new FormBuilder().withName(TEST_NAME).create();
    await renameForm(builder.getId(), `${TEST_NAME} Renamed`);

    const result = await listFormVersionsTool.handler({ id: builder.getId() } as never, context);

    const data = validateToolResponse(listFormVersionsTool, result);
    expect(data.items.map((version) => version.name)).toEqual([`${TEST_NAME} Renamed`, TEST_NAME]);
    expect(data.items.every((version) => version.form.id === builder!.getId())).toBe(true);
  });

  it("should return an error for an unknown form", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await listFormVersionsTool.handler(
      { id: "00000000-0000-0000-0000-000000000001" } as never,
      context,
    );

    expect(result.isError).toBe(true);
  });
});
