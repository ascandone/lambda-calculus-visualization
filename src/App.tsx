import { FC, useState } from "react";
import { BetaReducibleTerm, TermsList } from "./components/ReducibleTerm";
import { Editor } from "./components/Editor";
import { Program } from "./lambda/ast";
import { unalias } from "./lambda/semantics";

const App: FC = () => {
  const [program, setProgram] = useState<Program | undefined>(undefined);

  return program === undefined ? (
    <Editor onSubmit={setProgram} />
  ) : (
    <div className="px-4 mx-auto w-full">
      <div className="mx-auto flex justify-center py-32">
        <TermsList term={unalias(program)} />
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
