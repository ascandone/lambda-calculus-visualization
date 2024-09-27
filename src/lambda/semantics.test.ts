import { expect, test } from "vitest";
import { performReduction } from "./semantics";
import { unsafeParse } from "./parser";
import { LambdaExpr } from "./ast";

test("simple case", () => {
  const out = reductionStep(String.raw`(\x.x) t`);

  expect(out).toEqual(unsafeParse(`t`));
});

test("in appl", () => {
  const out = reductionStep(String.raw`(\x.a x) t`);

  expect(out).toEqual(unsafeParse(`a t`));
});

test("in lambda", () => {
  const out = reductionStep(String.raw`(\x.\y.x) t`);

  expect(out).toEqual(unsafeParse(String.raw`\y.t`));
});

function reductionStep(src: string): LambdaExpr {
  const parsed = unsafeParse(src);
  if (parsed.type === "appl" && parsed.f.type === "lambda") {
    return performReduction(parsed.f, parsed.x);
  }
  return parsed;
}
