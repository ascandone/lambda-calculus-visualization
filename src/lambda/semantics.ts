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
        binding: body.binding,
        body: substitute(binding, arg, body.body),
      };
  }
}

export function performReduction(
  f: LambdaExpr & { type: "lambda" },
  arg: LambdaExpr,
): LambdaExpr {
  return substitute(f.binding, arg, f.body);
}
