/* eslint-disable @typescript-eslint/no-unused-vars */
import type { MatchResult } from "ohm-js";
import grammar from "./parser/grammar.ohm-bundle";
import { LambdaExpr } from "./ast";

const semantics = grammar.createSemantics();

semantics.addOperation<LambdaExpr>("expr()", {
  Exp_abs(_fn, params, _arrow, body): LambdaExpr {
    return {
      type: "lambda",
      bindings: params.children.map((p) => p.sourceString),
      body: body.expr(),
    };
  },

  Appl_appl(f, x): LambdaExpr {
    return {
      type: "appl",
      f: f.expr(),
      x: x.expr(),
    };
  },

  Exp_paren(_l, arg1, _r) {
    return arg1.expr();
  },

  ident(_l, _ns): LambdaExpr {
    return {
      type: "var",
      name: this.sourceString,
    };
  },
});

semantics.addOperation<LambdaExpr>("parse()", {
  MAIN_expr(a) {
    return a.expr();
  },
});

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; matchResult: MatchResult };

export function parse(input: string): ParseResult<LambdaExpr> {
  const matchResult = grammar.match(input);
  if (matchResult.failed()) {
    return { ok: false, matchResult };
  }

  return { ok: true, value: semantics(matchResult).parse() };
}

export function unsafeParse(input: string): LambdaExpr {
  const res = parse(input);
  if (res.ok) {
    return res.value;
  }

  throw new Error(res.matchResult.message!);
}
