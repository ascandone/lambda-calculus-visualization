import { describe, expect, test } from "vitest";
import {
  autoreduce,
  canonicalize,
  containsBoundAliases,
  idToChar,
  isFree,
  performReduction,
  unalias,
} from "./semantics";
import { unsafeParse } from "./parser";
import { LambdaExpr } from "./ast";

describe("isFree", () => {
  test("var", () => {
    const out = isFree("a", unsafeParse(String.raw`a`).expr);
    expect(out).toBe(true);
  });

  test("free var in lambda", () => {
    const out = isFree("a", unsafeParse(String.raw`\x. a`).expr);
    expect(out).toBe(true);
  });

  test("bound var in lambda", () => {
    const out = isFree("a", unsafeParse(String.raw`\a. a`).expr);
    expect(out).toBe(false);
  });

  test("in appl (left)", () => {
    const out = isFree("a", unsafeParse(String.raw`\u . a u`).expr);
    expect(out).toBe(true);
  });

  test("in appl (right)", () => {
    const out = isFree("a", unsafeParse(String.raw`\u . u a`).expr);
    expect(out).toBe(true);
  });

  test("in appl (not found)", () => {
    const out = isFree("a", unsafeParse(String.raw`x y`).expr);
    expect(out).toBe(false);
  });
});

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

describe("autoreduce", () => {
  test("when reduction is top-level", () => {
    const out = autoreduce(unsafeParse(String.raw`(\x.x) t`).expr);
    expect(out).toEqual(unsafeParse(`t`).expr);
  });

  test("when reduction is nested in lambda", () => {
    const out = autoreduce(unsafeParse(String.raw`\u . (\x.x) t`).expr);
    expect(out).toEqual(unsafeParse(String.raw`\u . t`).expr);
  });

  test("when reduction is nested in appl arg", () => {
    const out = autoreduce(unsafeParse(String.raw`f ((\x.x) t)`).expr);
    expect(out).toEqual(unsafeParse(String.raw`f t`).expr);
  });

  test("when reduction is nested in appl f", () => {
    const out = autoreduce(unsafeParse(String.raw`((\x.x) t) u`).expr);
    expect(out).toEqual(unsafeParse(String.raw`t u`).expr);
  });

  test("when there is not reduction", () => {
    const out = autoreduce(unsafeParse(String.raw`f (a (\x.x) t)`).expr);
    expect(out).toEqual(undefined);
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

  test("check bound aliases when found", () => {
    const program = unsafeParse(String.raw`let A = a in \e . f A`);

    expect(containsBoundAliases(program.aliases, program.expr)).toBe(true);
  });

  test("check bound aliases when not found", () => {
    const program = unsafeParse(String.raw`let A = a in \e . f U`);

    expect(containsBoundAliases(program.aliases, program.expr)).toBe(false);
  });
});

describe("canonicalize", () => {
  test("id to char", () => {
    expect(idToChar(0)).toEqual("a");
    expect(idToChar(1)).toEqual("b");
    expect(idToChar(25)).toEqual("z");

    expect(idToChar(26)).toEqual("a'");
    expect(idToChar(27)).toEqual("b'");

    expect(idToChar(26 + 26)).toEqual("a''");
  });

  test("unary", () => {
    const program = unsafeParse(String.raw`\ x . x x`);

    expect(canonicalize(program.expr)).toEqual<LambdaExpr>(
      unsafeParse(String.raw`\ a . a a`).expr,
    );
  });

  test("when no fresh binding appears as free", () => {
    const program = unsafeParse(String.raw`\ x y z . y x x`);

    expect(canonicalize(program.expr)).toEqual<LambdaExpr>(
      unsafeParse(String.raw`\ a b c . b a a`).expr,
    );
  });

  test("when fresh bindings are already used", () => {
    const program = unsafeParse(String.raw`\ x. x a b x`);

    expect(canonicalize(program.expr)).toEqual<LambdaExpr>(
      unsafeParse(String.raw`\ c . c a b c`).expr,
    );
  });
});
