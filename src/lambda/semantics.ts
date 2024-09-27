import { LambdaExpr, Program } from "./ast";

function substitute(
  binding: string,
  with_: LambdaExpr,
  expr: LambdaExpr,
): LambdaExpr {
  switch (expr.type) {
    case "var":
      return expr.name === binding ? with_ : expr;

    case "appl":
      return {
        type: "appl",
        f: substitute(binding, with_, expr.f),
        x: substitute(binding, with_, expr.x),
      };

    case "lambda": {
      if (isFree(expr.binding, with_)) {
        return {
          type: "lambda",
          binding: expr.binding,
          body: substitute(binding, with_, expr.body),
        };
      }

      const freshVar = expr.binding + "'";
      return substitute(binding, with_, {
        type: "lambda",
        binding: freshVar,
        body: substitute(binding, { type: "var", name: freshVar }, expr.body),
      });
    }
  }
}

function isFree(v: string, expr: LambdaExpr): boolean {
  switch (expr.type) {
    case "var":
      return v !== expr.name;

    case "appl":
      return isFree(v, expr.f) && isFree(v, expr.x);

    case "lambda":
      return v !== expr.binding || isFree(v, expr.body);
  }
}

export function performReduction(
  f: LambdaExpr & { type: "lambda" },
  arg: LambdaExpr,
): LambdaExpr {
  return substitute(f.binding, arg, f.body);
}

export function unalias(program: Program): LambdaExpr {
  function helper(expr: LambdaExpr): LambdaExpr {
    switch (expr.type) {
      case "var": {
        const lookup = program.aliases.find(
          (alias) => alias.name === expr.name,
        );
        if (lookup === undefined) {
          return expr;
        }
        return lookup.value;
      }

      case "appl": {
        return {
          type: "appl",
          f: helper(expr.f),
          x: helper(expr.x),
        };
      }

      case "lambda":
        return {
          type: "lambda",
          binding: expr.binding,
          body: helper(expr.body),
        };
    }
  }

  return helper(program.expr);
}
