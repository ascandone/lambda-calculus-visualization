import { AliasDefinition, LambdaExpr } from "./ast";

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
        body: substitute(
          expr.binding,
          { type: "var", name: freshVar },
          expr.body,
        ),
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

export function autoreduce(expr: LambdaExpr): LambdaExpr | undefined {
  switch (expr.type) {
    case "var":
      return undefined;

    case "lambda": {
      const red = autoreduce(expr.body);
      if (red !== undefined) {
        return {
          type: "lambda",
          binding: expr.binding,
          body: red,
        };
      }

      return undefined;
    }

    case "appl": {
      if (expr.f.type === "lambda") {
        return performReduction(expr.f, expr.x);
      }

      const fRed = autoreduce(expr.f);
      if (fRed !== undefined) {
        return {
          type: "appl",
          f: fRed,
          x: expr.x,
        };
      }

      const xRed = autoreduce(expr.x);
      if (xRed !== undefined) {
        return {
          type: "appl",
          f: expr.f,
          x: xRed,
        };
      }

      return undefined;
    }
  }
}

export function unalias(
  aliases: AliasDefinition[],
  expr: LambdaExpr,
): LambdaExpr {
  switch (expr.type) {
    case "var": {
      const lookup = aliases.find((alias) => alias.name === expr.name);
      if (lookup === undefined) {
        return expr;
      }
      return lookup.value;
    }

    case "appl": {
      return {
        type: "appl",
        f: unalias(aliases, expr.f),
        x: unalias(aliases, expr.x),
      };
    }

    case "lambda":
      return {
        type: "lambda",
        binding: expr.binding,
        body: unalias(aliases, expr.body),
      };
  }
}

export function containsBoundAliases(
  aliases: AliasDefinition[],
  expr: LambdaExpr,
): boolean {
  switch (expr.type) {
    case "var": {
      return aliases.some((alias) => alias.name === expr.name);
    }

    case "appl": {
      return (
        containsBoundAliases(aliases, expr.f) ||
        containsBoundAliases(aliases, expr.x)
      );
    }

    case "lambda":
      return containsBoundAliases(aliases, expr.body);
  }
}
