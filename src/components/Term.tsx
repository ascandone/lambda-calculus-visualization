import { FC } from "react";
import { LambdaExpr } from "../lambda/ast";
import { BetaReducibleTerm } from "./ReducibleTerm";
import { performReduction } from "../lambda/semantics";

const chainBindings = (
  expr: LambdaExpr & { type: "lambda" },
): [bindings: string[], body: LambdaExpr] => {
  if (expr.body.type !== "lambda") {
    return [expr.bindings, expr.body];
  }

  const [bindings, body] = chainBindings(expr.body);
  return [expr.bindings.concat(bindings), body];
};

export const LambdaTerm: FC<{ expr: LambdaExpr }> = ({ expr }) => {
  switch (expr.type) {
    case "var":
      return expr.name;

    case "lambda": {
      const [bindings, body] = chainBindings(expr);
      const bindingsJ = bindings.join(" ");
      const bodyT = <LambdaTerm expr={body} />;

      return (
        <>
          λ{bindingsJ}.{bodyT}
        </>
      );
    }

    case "appl": {
      const f = optionalParens(
        expr.f.type === "lambda",
        <LambdaTerm expr={expr.f} />,
      );

      const x = optionalParens(
        expr.x.type !== "var",
        <LambdaTerm expr={expr.x} />,
      );

      const content = (
        <>
          {f} {x}
        </>
      );

      if (expr.f.type === "lambda") {
        const lambda = expr.f;

        const handleReduction = () => {
          performReduction(lambda, expr.x);
        };

        return (
          <BetaReducibleTerm onClick={handleReduction}>
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
