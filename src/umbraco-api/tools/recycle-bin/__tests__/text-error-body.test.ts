/**
 * The permanent-delete endpoints answer a refusal with a plain-text body; it
 * must reach the MCP client as an object, or the call fails at the protocol
 * level instead of returning the message.
 */

import type { ProblemDetails } from "@umbraco-cms/mcp-server-sdk";
import { textErrorBodyAsProblemDetails } from "../shared/text-error-body.js";

describe("textErrorBodyAsProblemDetails", () => {
  it("should wrap a plain-text error body as ProblemDetails", () => {
    const text = "The form is not in the recycle bin, so it cannot be permanently deleted. Trash it first.";

    expect(textErrorBodyAsProblemDetails(text as unknown as ProblemDetails)).toEqual({
      status: 400,
      title: "Bad Request",
      detail: text,
    });
  });

  it("should pass ProblemDetails through untouched", () => {
    const problem: ProblemDetails = { status: 404, title: "Not Found", detail: "" };

    expect(textErrorBodyAsProblemDetails(problem)).toBe(problem);
  });
});
