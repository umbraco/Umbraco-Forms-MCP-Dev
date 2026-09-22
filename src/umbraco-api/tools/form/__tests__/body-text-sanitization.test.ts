/**
 * Regression tests for the input sanitiser applied to form-design bodies.
 *
 * The SDK's default `withInputSanitization` rejects `?`, `&` and `%XX` in every
 * string, which is right for URL path/query segments and wrong for a form
 * design — it made a field labelled "What is your name?" impossible to create.
 * Body tools use `withBodyDecorators` instead (see `shared/body-text.ts`).
 *
 * These tests pin both halves of that change: the characters that must now be
 * accepted, and the ones that must still be refused.
 */

import {
  setupTestEnvironment,
  createMockRequestHandlerExtra,
  getStructuredContent,
  FormTestHelper,
} from "./setup.js";
import createSimpleFormTool from "../post/create-simple-form.js";
import getFormByIdTool from "../get/get-form-by-id.js";
import type { FormDesign } from "../../../api/generated/umbracoFormsManagementApi.js";

const TEST_NAME = "_Test Body Text Sanitization";

describe("form body text sanitization", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await FormTestHelper.cleanup(TEST_NAME);
  });

  it("should accept question marks, ampersands and percent-encoding in free text", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await createSimpleFormTool.handler(
      {
        name: TEST_NAME,
        messageOnSubmit: "Thanks & goodbye!",
        fields: [
          { label: "What is your name?", type: "text", required: true },
          {
            label: "Amount",
            type: "number",
            // A decimal-optional pattern — the '?' here is what used to fail.
            pattern: "^[0-9]+([.,][0-9]{1,2})?$",
            invalidErrorMessage: "Use at most two decimals",
          },
          {
            label: "Terms",
            type: "richText",
            bodyText: '<a href="/terms%20and%20conditions">Terms</a>',
          },
        ],
      } as never,
      context,
    );

    expect(result.isError).toBeFalsy();

    const found = await FormTestHelper.findByName(TEST_NAME);
    expect(found).toBeDefined();

    const design = getStructuredContent(
      await getFormByIdTool.handler(
        { id: found!.id, applyDictionaryTranslations: undefined },
        context,
      ),
    ) as unknown as FormDesign;

    const fields = design.pages.flatMap((page) =>
      page.fieldSets.flatMap((fieldSet) =>
        fieldSet.containers.flatMap((container) => container.fields),
      ),
    );

    expect(fields.map((field) => field.caption)).toContain("What is your name?");
    expect(fields.map((field) => field.regex)).toContain(
      "^[0-9]+([.,][0-9]{1,2})?$",
    );
    expect(design.messageOnSubmit).toBe("Thanks & goodbye!");
  });

  it("should still reject control characters", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await createSimpleFormTool.handler(
      {
        name: TEST_NAME,
        // \x07 (bell) — never legitimate in a label.
        fields: [{ label: `Bad${String.fromCharCode(7)}Label`, type: "text" }],
      } as never,
      context,
    );

    expect(result.isError).toBe(true);
  });

  it("should still reject path traversal sequences", async () => {
    const context = createMockRequestHandlerExtra();

    const result = await createSimpleFormTool.handler(
      {
        name: TEST_NAME,
        fields: [
          {
            label: "Sneaky",
            type: "richText",
            bodyText: '<a href="../../secrets">x</a>',
          },
        ],
      } as never,
      context,
    );

    expect(result.isError).toBe(true);
  });
});
