/**
 * Unit tests for `makeOptional`.
 *
 * The behaviour that matters most here is the silent one: a key that isn't in
 * the shape is skipped without error. That is deliberate — but it means a
 * renamed FormDesign property would quietly stop being relaxed and become
 * required for the caller again. The test below pins the behaviour; the guard
 * that catches it happening for real lives in schema-contract.test.ts.
 */

import { z } from "zod";
import { makeOptional } from "../optional-shape.js";

const shape = {
  name: z.string(),
  path: z.string(),
  nodeId: z.number(),
};

describe("makeOptional", () => {
  it("should make the named keys accept undefined", () => {
    const relaxed = makeOptional(shape, ["path", "nodeId"]);

    expect(relaxed.path.safeParse(undefined).success).toBe(true);
    expect(relaxed.nodeId.safeParse(undefined).success).toBe(true);
  });

  it("should leave unnamed keys required", () => {
    const relaxed = makeOptional(shape, ["path"]);

    expect(relaxed.name.safeParse(undefined).success).toBe(false);
  });

  it("should keep validating the underlying type of a relaxed key", () => {
    const relaxed = makeOptional(shape, ["nodeId"]);

    expect(relaxed.nodeId.safeParse(42).success).toBe(true);
    expect(relaxed.nodeId.safeParse("not a number").success).toBe(false);
  });

  it("should not mutate the shape it was given", () => {
    makeOptional(shape, ["path"]);

    expect(shape.path.safeParse(undefined).success).toBe(false);
  });

  it("should skip a key the shape does not have, without throwing", () => {
    // Documents the silent no-op that schema-contract.test.ts guards against.
    const relaxed = makeOptional(shape, ["notAKey" as keyof typeof shape & string]);

    expect(Object.keys(relaxed).sort()).toEqual(["name", "nodeId", "path"]);
    expect(relaxed.name.safeParse(undefined).success).toBe(false);
  });

  it("should return every original key", () => {
    const relaxed = makeOptional(shape, ["path"]);

    expect(Object.keys(relaxed).sort()).toEqual(Object.keys(shape).sort());
  });
});
