import { describe, expect, test } from "vitest";
import { performReduction, unalias } from "./semantics";
import { unsafeParse } from "./parser";
import { LambdaExpr } from "./ast";

describe("reductions", () => {
  test("simple case", () => {
    const out = reductionStep(String.raw`(\x.x) t`);

    expect(out).toEqual(unsafeParse(`t`).expr);
  });

  test("in appl", () => {
    const out = reductionStep(String.raw`(\x.a x) t`);

    expect(out).toEqual(unsafeParse(`a t`).expr);
  });

  test("in lambda", () => {
    const out = reductionStep(String.raw`(\x.\y.x) t`);

    expect(out).toEqual(unsafeParse(String.raw`\y.t`).expr);
  });

  test("capturing", () => {
    const out = reductionStep(String.raw`(\ x t . t x) t`);

    expect(out).toMatchInlineSnapshot(`
      {
        "binding": "t'",
        "body": {
          "f": {
            "name": "t'",
            "type": "var",
          },
          "type": "appl",
          "x": {
            "name": "t",
            "type": "var",
          },
        },
        "type": "lambda",
      }
    `);
  });
});

function reductionStep(src: string): LambdaExpr {
  const parsed = unsafeParse(src).expr;
  if (parsed.type === "appl" && parsed.f.type === "lambda") {
    return performReduction(parsed.f, parsed.x);
  }
  return parsed;
}

describe("aliases substitution", () => {
  test("substitute when found", () => {
    const program = unsafeParse(String.raw`let A = a in \e . f A`);

    expect(unalias(program.aliases, program.expr)).toEqual<LambdaExpr>(
      unsafeParse(String.raw`\e. f a`).expr,
    );
  });
});
