import { FC } from "react";
import { LambdaExpr } from "../lambda/ast";
import { BetaReducibleTerm } from "./ReducibleTerm";

export const LambdaTerm: FC<{ expr: LambdaExpr }> = ({ expr }) => {
  switch (expr.type) {
    case "var":
      return <BetaReducibleTerm>{expr.name}</BetaReducibleTerm>;

    case "lambda": {
      const bindings = expr.bindings.join(" ");
      const body = <LambdaTerm expr={expr.body} />;

      return (
        <BetaReducibleTerm>
          λ{bindings}.{body}
        </BetaReducibleTerm>
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

      return (
        <BetaReducibleTerm
          color={expr.f.type === "lambda" ? "blue" : undefined}
        >
          {f} {x}
        </BetaReducibleTerm>
      );
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
