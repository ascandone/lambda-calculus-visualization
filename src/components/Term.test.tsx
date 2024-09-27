/// <reference types="vite/client" />
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { unsafeParse } from "../lambda/parser";
import { LambdaTerm } from "./Term";
import "@testing-library/jest-dom/vitest";

describe("render terms the first time", () => {
  function checkRender(src: string, expected = src) {
    const term = unsafeParse(replaceLambdas(src));
    const node = render(<LambdaTerm expr={term} />);

    expect(node.baseElement).toHaveTextContent(replaceLambdas(expected));
  }

  test("var", () => {
    checkRender("x");
  });

  test("remove redundant parens", () => {
    checkRender("( x )", "x");
  });

  test("simple lambda", () => {
    checkRender(String.raw`\x y.x`);
  });

  test("simple appl", () => {
    checkRender(`x y`);
  });

  test("nested appl with no parens", () => {
    checkRender(`x y z`);
  });

  test("remove redundant parens", () => {
    checkRender(`(x y) z`, `x y z`);
  });

  test("nested appl with parens", () => {
    checkRender(`x (y z)`);
  });

  test("preserve parens when applying to lambda", () => {
    checkRender(String.raw`f (\a.a)`);
  });

  test("do not put parens in lambda body", () => {
    checkRender(String.raw`\x y.x y`);
  });

  test("put parens when lambda on the left", () => {
    checkRender(String.raw`(\x.x) y`);
  });
});

afterEach(() => {
  cleanup();
});

function replaceLambdas(src: string) {
  return src.replace("\\", "λ");
}
