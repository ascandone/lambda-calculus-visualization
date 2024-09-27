import { FC, ReactNode, useState } from "react";
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
        return (
          <StatefulBetaReducibleTerm f={expr.f} arg={expr.x}>
            {content}
          </StatefulBetaReducibleTerm>
        );
      }

      return content;
    }
  }
};

type ReductionState =
  | { type: "INITIAL"; f: LambdaExpr & { type: "lambda" }; arg: LambdaExpr }
  | { type: "APPLIED"; result: LambdaExpr };

const StatefulBetaReducibleTerm: FC<{
  f: LambdaExpr & { type: "lambda" };
  arg: LambdaExpr;
  children: ReactNode;
}> = ({ f, arg, children }) => {
  const [state, setState] = useState<ReductionState>({
    type: "INITIAL",
    f,
    arg,
  });

  switch (state.type) {
    case "INITIAL": {
      return (
        <BetaReducibleTerm
          onClick={() =>
            setState({
              type: "APPLIED",
              result: performReduction(f, arg),
            })
          }
        >
          {children}
        </BetaReducibleTerm>
      );
    }

    case "APPLIED":
      return <LambdaTerm expr={state.result} />;
  }
};

function optionalParens(putParens: boolean, elem: JSX.Element) {
  if (putParens) {
    return <>({elem})</>;
  } else {
    return elem;
  }
}
