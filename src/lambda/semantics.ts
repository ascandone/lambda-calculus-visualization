import { LambdaExpr } from "./ast";

function substitute(
  binding: string,
  arg: LambdaExpr,
  body: LambdaExpr,
): LambdaExpr {
  switch (body.type) {
    case "var":
      return body.name === binding ? arg : body;

    case "appl":
      return {
        type: "appl",
        f: substitute(binding, arg, body.f),
        x: substitute(binding, arg, body.x),
      };

    case "lambda":
      return {
        type: "lambda",
        bindings: body.bindings,
        body: substitute(binding, arg, body.body),
      };
  }
}

export function performReduction(
  f: LambdaExpr & { type: "lambda" },
  arg: LambdaExpr,
): LambdaExpr {
  if (f.bindings.length === 0) {
    throw new Error("[unrechable] no bindings");
  }

  if (f.bindings.length > 1) {
    throw new Error("TODO many bindings");
  }

  const binding = f.bindings[0];
  return substitute(binding, arg, f.body);
}
