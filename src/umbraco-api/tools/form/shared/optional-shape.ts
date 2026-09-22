/**
 * Marks selected keys of a generated Zod shape as optional.
 *
 * Orval derives required/optional from the OpenAPI spec, and the Forms spec
 * marks almost every `FormDesign` property as required — including the ones a
 * caller cannot meaningfully decide (`path`, `created`, `nodeId`) and the ones
 * that only need *a* value rather than a particular one (`pagingDetailsFormat`,
 * `indicator`). Requiring them pushes the caller into fetching a scaffold purely
 * to copy boilerplate back out of it.
 *
 * The API still requires those properties on the wire; the tool backfills them
 * before the call (see `withFormDesignDefaults`). This only relaxes what the
 * *model* has to supply.
 */

import type { ZodOptional, ZodRawShape, ZodType } from "zod";

export type WithOptionalKeys<
  Shape extends ZodRawShape,
  Keys extends keyof Shape,
> = {
  [K in keyof Shape]: K extends Keys ? ZodOptional<Shape[K]> : Shape[K];
};

export function makeOptional<
  Shape extends ZodRawShape,
  const Keys extends readonly (keyof Shape & string)[],
>(shape: Shape, keys: Keys): WithOptionalKeys<Shape, Keys[number]> {
  // Zod 4 types a raw shape as a readonly map of the internal `$ZodType`, which
  // does not expose `.optional()`. The values are always full `ZodType`
  // instances at runtime, so narrow locally and keep the precise public return
  // type above.
  const relaxed = { ...shape } as unknown as Record<string, ZodType>;
  for (const key of keys) {
    const schema = relaxed[key];
    if (schema) relaxed[key] = schema.optional();
  }
  return relaxed as unknown as WithOptionalKeys<Shape, Keys[number]>;
}
