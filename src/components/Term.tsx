import { FC } from "react";
import { LambdaExpr } from "../lambda/ast";
import { BetaReducibleTerm } from "./ReducibleTerm";

export const LambdaTerm: FC<{ expr: LambdaExpr }> = ({ expr }) => {
  switch (expr.type) {
    case "var":
      return expr.name;

    case "lambda": {
      const bindings = expr.bindings.join(" ");
      const body = <LambdaTerm expr={expr.body} />;

      return (
        <>
          λ{bindings}.{body}
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
        return <BetaReducibleTerm>{content}</BetaReducibleTerm>;
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
