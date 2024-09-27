import { expect, test } from "vitest";
import { Program, unsafeParse } from "./parser";

test("var", () => {
  const parsed = unsafeParse("x");

  expect(parsed).toEqual<Program>({
    aliases: [],
    expr: {
      type: "var",
      name: "x",
    },
  });
});

test("comments", () => {
  const parsed = unsafeParse(`
    // example comment
x
// another trailing comment
`);

  expect(parsed).toEqual<Program>({
    aliases: [],
    expr: {
      type: "var",
      name: "x",
    },
  });
});

test("parens", () => {
  const parsed = unsafeParse("(x)");

  expect(parsed).toEqual<Program>({
    aliases: [],
    expr: {
      type: "var",
      name: "x",
    },
  });
});

test("lambda", () => {
  const parsed = unsafeParse(String.raw`\x.x`);

  expect(parsed).toEqual<Program>({
    aliases: [],
    expr: {
      type: "lambda",
      binding: "x",
      body: {
        type: "var",
        name: "x",
      },
    },
  });
});

test("lambda with greek char", () => {
  const parsed = unsafeParse(String.raw`λx.x`);

  expect(parsed).toEqual<Program>({
    aliases: [],
    expr: {
      type: "lambda",
      binding: "x",
      body: {
        type: "var",
        name: "x",
      },
    },
  });
});

test("application", () => {
  const parsed = unsafeParse(`x y`);

  expect(parsed).toEqual<Program>({
    aliases: [],
    expr: {
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

  expect(parsed.expr).toMatchInlineSnapshot(`
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

  expect(parsed.expr).toMatchInlineSnapshot(`
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

  expect(parsed.expr).toMatchInlineSnapshot(`
    {
      "binding": "x",
      "body": {
        "binding": "y",
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

  expect(parsed.expr).toMatchInlineSnapshot(`
    {
      "binding": "x",
      "body": {
        "binding": "y",
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

test("nested lambda sugar (2)", () => {
  const s1 = unsafeParse(String.raw`\x. (\t.t x)`);
  const s2 = unsafeParse(String.raw`\x t. t x`);
  expect(s1).toEqual(s2);
});

test("iif", () => {
  const parsed = unsafeParse(String.raw`(\x.x)(\y.y)`);

  expect(parsed.expr).toMatchInlineSnapshot(`
    {
      "f": {
        "binding": "x",
        "body": {
          "name": "x",
          "type": "var",
        },
        "type": "lambda",
      },
      "type": "appl",
      "x": {
        "binding": "y",
        "body": {
          "name": "y",
          "type": "var",
        },
        "type": "lambda",
      },
    }
  `);
});

test("aliases", () => {
  const parsed = unsafeParse(`
let A = x in y
`);

  expect(parsed).toEqual<Program>({
    aliases: [
      {
        name: "A",
        value: {
          type: "var",
          name: "x",
        },
      },
    ],
    expr: {
      type: "var",
      name: "y",
    },
  });
});
