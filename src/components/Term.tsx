import { FC } from "react";
import { LambdaExpr } from "../lambda/ast";
import { BetaReducibleTerm } from "./ReducibleTerm";
import { performReduction } from "../lambda/semantics";

const chainBindings = (
  expr: LambdaExpr & { type: "lambda" },
): [bindings: string[], body: LambdaExpr] => {
  if (expr.body.type !== "lambda") {
    return [[expr.binding], expr.body];
  }

  const [bindings, body] = chainBindings(expr.body);
  return [[expr.binding, ...bindings], body];
};

export const LambdaTerm: FC<{
  expr: LambdaExpr;
  onReduction: (e: LambdaExpr) => void;
}> = ({ expr, onReduction }) => {
  switch (expr.type) {
    case "var":
      return expr.name;

    case "lambda": {
      const [bindings, body] = chainBindings(expr);
      const bindingsJ = bindings.join(" ");
      const bodyT = (
        <LambdaTerm
          expr={body}
          onReduction={(body) => {
            const uncurried = bindings.reduceRight(
              (body, binding): LambdaExpr => ({
                type: "lambda",
                binding,
                body,
              }),
              body,
            );

            onReduction(uncurried);
          }}
        />
      );

      return (
        <>
          λ{bindingsJ}.{bodyT}
        </>
      );
    }

    case "appl": {
      const f = optionalParens(
        expr.f.type === "lambda",
        <LambdaTerm
          expr={expr.f}
          onReduction={(f) => {
            onReduction({
              type: "appl",
              x: expr.x,
              f,
            });
          }}
        />,
      );

      const x = optionalParens(
        expr.x.type !== "var",
        <LambdaTerm
          expr={expr.x}
          onReduction={(x) => {
            onReduction({
              type: "appl",
              x,
              f: expr.f,
            });
          }}
        />,
      );

      const content = (
        <>
          {f} {x}
        </>
      );

      if (expr.f.type === "lambda") {
        const f = expr.f;
        return (
          <BetaReducibleTerm
            onClick={() => {
              const red = performReduction(f, expr.x);
              onReduction(red);
            }}
          >
            {content}
          </BetaReducibleTerm>
        );
      }

      return content;
    }
  }
};

function optionalParens(putParens: boolean, elem: JSX.Element) {
  if (putParens) {
    return <>({elem})</>;
  } else {
    return elem;
  }
}
