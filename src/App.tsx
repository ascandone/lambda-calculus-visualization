import { FC, useState } from "react";
import { BetaReducibleTerm, TermsList } from "./components/ReducibleTerm";
import { LambdaExpr } from "./lambda/ast";
import { Editor } from "./components/Editor";

const App: FC = () => {
  const [term, setTerm] = useState<LambdaExpr | undefined>(undefined);

  return term === undefined ? (
    <Editor onSubmitTerm={setTerm} />
  ) : (
    <div className="px-4 mx-auto w-full">
      <div className="mx-auto flex justify-center py-32">
        <TermsList term={term} />
      </div>
    </div>
  );
};

export const Example: FC = () => {
  return (
    <>
      λ k z.(
      <BetaReducibleTerm color="emerald">
        λk.(λx.a b (
        <BetaReducibleTerm color="fuchsia">(λ x.x) z</BetaReducibleTerm>))
      </BetaReducibleTerm>{" "}
      <BetaReducibleTerm color="blue">
        (λx.z y<sup>1</sup>) y)
      </BetaReducibleTerm>{" "}
      a z
    </>
  );
};

export default App;
