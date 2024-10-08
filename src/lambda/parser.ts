/* eslint-disable @typescript-eslint/no-unused-vars */
import type { MatchResult } from "ohm-js";
import grammar from "./parser/grammar.ohm-bundle";
import { AliasDefinition, LambdaExpr, Program } from "./ast";

const semantics = grammar.createSemantics();

semantics.addOperation<LambdaExpr>("expr()", {
  Exp_abs(_fn, params, _arrow, body): LambdaExpr {
    return params.children.reduceRight(
      (prev, param): LambdaExpr => ({
        type: "lambda",
        binding: param!.sourceString,
        body: prev,
      }),
      body.expr(),
    );
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

  aliasIdent(_l, _ns): LambdaExpr {
    return {
      type: "var",
      name: this.sourceString,
    };
  },
});

semantics.addOperation<AliasDefinition>("alias()", {
  AliasDecl(_let, ident, bindings, _eq, appl, _in): AliasDefinition {
    const params = bindings.children.map((binding) => binding.sourceString);
    const value: LambdaExpr = params.reduceRight(
      (body, binding): LambdaExpr => ({
        type: "lambda",
        binding,
        body,
      }),
      appl.expr() as LambdaExpr,
    );
    return {
      name: ident.sourceString,
      value,
    };
  },
});

semantics.addOperation<Program>("parse()", {
  MAIN(aliases, e): Program {
    return {
      aliases: aliases.children.map((e) => e.alias()),
      expr: e.expr(),
    };
  },
});

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; matchResult: MatchResult };

export function parse(input: string): ParseResult<Program> {
  const matchResult = grammar.match(input);
  if (matchResult.failed()) {
    return { ok: false, matchResult };
  }

  return { ok: true, value: semantics(matchResult).parse() };
}

export function unsafeParse(input: string): Program {
  const res = parse(input);
  if (res.ok) {
    return res.value;
  }

  throw new Error(res.matchResult.message!);
}
