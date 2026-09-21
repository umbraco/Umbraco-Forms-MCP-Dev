/**
 * Regression tests for the body-appropriate sanitiser.
 *
 * The SDK's default `withInputSanitization` rejects `?`, `&` and `%XX` in every
 * string because most tool inputs are identifiers interpolated into a URL. Form
 * designs are not: a field labelled "What is your name?" and a validation regex
 * containing `?` are ordinary content, and rejecting them made creating an
 * ordinary form impossible.
 *
 * These tests pin both halves of that trade — what must now be allowed through,
 * and what must still be blocked — so the rules can't quietly revert or widen.
 */

import { withBodyTextSanitization } from "../body-text.js";

type Handler = (args: Record<string, unknown>, context: unknown) => Promise<unknown>;

/** Wraps a pass-through tool so the sanitiser can be driven directly. */
function sanitized() {
  const seen: Record<string, unknown>[] = [];
  const tool = {
    name: "probe",
    description: "probe",
    inputSchema: undefined,
    handler: (async (args: Record<string, unknown>) => {
      seen.push(args);
      return { ok: true };
    }) as unknown as Handler,
  } as any;

  const decorated = withBodyTextSanitization(tool);
  return {
    call: (args: Record<string, unknown>) =>
      (decorated.handler as unknown as Handler)(args, {}),
    seen,
  };
}

describe("withBodyTextSanitization", () => {
  describe("permits content that the URL-oriented sanitiser rejected", () => {
    it.each([
      ["a question mark in a label", { caption: "What is your name?" }],
      ["an ampersand in a message", { messageOnSubmit: "Thanks & bye" }],
      ["a regex containing ?", { pattern: "^\\d+(\\.\\d{1,2})?$" }],
      ["percent-encoding in rich text", { html: '<a href="/a%20b">link</a>' }],
      ["a query string in body copy", { bodyText: "See /search?q=forms&page=2" }],
    ])("should allow %s", async (_label, args) => {
      const { call } = sanitized();
      await expect(call(args)).resolves.toEqual({ ok: true });
    });

    it("should allow these when nested deep inside a design", async () => {
      const { call } = sanitized();

      await expect(
        call({
          pages: [
            {
              fieldSets: [
                { containers: [{ fields: [{ caption: "Do you agree?" }] }] },
              ],
            },
          ],
        }),
      ).resolves.toEqual({ ok: true });
    });
  });

  describe("still rejects what matters for a JSON body", () => {
    // The sanitiser runs before the handler and throws synchronously rather
    // than returning a rejected promise, so the handler never sees the input.

    it("should reject a control character, naming the field", () => {
      const { call, seen } = sanitized();

      expect(() => call({ caption: "bad\u0007value" })).toThrow(
        /Field 'caption' contains control characters/,
      );
      expect(seen).toHaveLength(0);
    });

    it("should reject path traversal", () => {
      const { call } = sanitized();

      expect(() => call({ razorViewFilePath: "../../etc/passwd" })).toThrow(
        /razorViewFilePath/,
      );
    });

    it("should report the full path of a nested offender", () => {
      // A design nests four levels deep; the message has to say where.
      const { call } = sanitized();

      expect(() =>
        call({ pages: [{ fieldSets: [{ caption: "../../secret" }] }] }),
      ).toThrow(/pages\[0\]\.fieldSets\[0\]\.caption/);
    });
  });

  it("should pass the original arguments through untouched", async () => {
    const { call, seen } = sanitized();
    const args = { name: "Contact us?", pages: [{ caption: "Page & more" }] };

    await call(args);

    expect(seen[0]).toEqual(args);
  });

  it("should ignore non-string leaves", async () => {
    const { call } = sanitized();

    await expect(
      call({ count: 3, enabled: true, missing: null, absent: undefined }),
    ).resolves.toEqual({ ok: true });
  });
});
