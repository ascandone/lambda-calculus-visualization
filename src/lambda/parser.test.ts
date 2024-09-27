import { expect, test } from "vitest";
import { parse, ParseResult, unsafeParse } from "./parser";
import { LambdaExpr } from "./ast";

test("var", () => {
  const parsed = parse("x");

  expect(parsed).toEqual<ParseResult<LambdaExpr>>({
    ok: true,
    value: {
      type: "var",
      name: "x",
    },
  });
});

test("parens", () => {
  const parsed = parse("(x)");

  expect(parsed).toEqual<ParseResult<LambdaExpr>>({
    ok: true,
    value: {
      type: "var",
      name: "x",
    },
  });
});

test("lambda", () => {
  const parsed = parse(String.raw`\x.x`);

  expect(parsed).toEqual<ParseResult<LambdaExpr>>({
    ok: true,
    value: {
      type: "lambda",
      bindings: ["x"],
      body: {
        type: "var",
        name: "x",
      },
    },
  });
});

test("application", () => {
  const parsed = parse(`x y`);

  if (!parsed.ok) {
    throw new Error(parsed.matchResult.message);
  }

  expect(parsed).toEqual<ParseResult<LambdaExpr>>({
    ok: true,
    value: {
      type: "appl",
      f: {
        type: "var",
        name: "x",
      },
      x: {
        type: "var",
        name: "y",
      },
    },
  });
});

test("application twice", () => {
  const parsed = unsafeParse(`x y z`);

  expect(parsed).toMatchInlineSnapshot(`
    {
      "f": {
        "f": {
          "name": "x",
          "type": "var",
        },
        "type": "appl",
        "x": {
          "name": "y",
          "type": "var",
        },
      },
      "type": "appl",
      "x": {
        "name": "z",
        "type": "var",
      },
    }
  `);
});

test("parens changes application prec", () => {
  const parsed = unsafeParse(`x (y z)`);

  expect(parsed).toMatchInlineSnapshot(`
    {
      "f": {
        "name": "x",
        "type": "var",
      },
      "type": "appl",
      "x": {
        "f": {
          "name": "y",
          "type": "var",
        },
        "type": "appl",
        "x": {
          "name": "z",
          "type": "var",
        },
      },
    }
  `);
});

test("nested lambda prec", () => {
  const parsed = unsafeParse(String.raw`\x . \ y. x`);

  expect(parsed).toMatchInlineSnapshot(`
    {
      "bindings": [
        "x",
      ],
      "body": {
        "bindings": [
          "y",
        ],
        "body": {
          "name": "x",
          "type": "var",
        },
        "type": "lambda",
      },
      "type": "lambda",
    }
  `);
});

test("nested lambda sugar", () => {
  const parsed = unsafeParse(String.raw`\x y. x`);

  expect(parsed).toMatchInlineSnapshot(`
    {
      "bindings": [
        "x",
        "y",
      ],
      "body": {
        "name": "x",
        "type": "var",
      },
      "type": "lambda",
    }
  `);
});

test("iif", () => {
  const parsed = unsafeParse(String.raw`(\x.x)(\y.y)`);

  expect(parsed).toMatchInlineSnapshot(`
    {
      "f": {
        "bindings": [
          "x",
        ],
        "body": {
          "name": "x",
          "type": "var",
        },
        "type": "lambda",
      },
      "type": "appl",
      "x": {
        "bindings": [
          "y",
        ],
        "body": {
          "name": "y",
          "type": "var",
        },
        "type": "lambda",
      },
    }
  `);
});
