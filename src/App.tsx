import { FC } from "react";
import { BetaReducibleTerm } from "./components/ReducibleTerm";

const App: FC = () => (
  <div className="px-4 mx-auto w-full h-screen bg-gray-50">
    <div className="h-24"></div>
    <div className="mx-auto max-w-screen-md flex justify-center">
      <BetaReducibleTerm>
        λ k z.(
        <BetaReducibleTerm color="emerald">
          λk.(λx.a b (
          <BetaReducibleTerm color="fuchsia">(λ x.x) z</BetaReducibleTerm>))
        </BetaReducibleTerm>{" "}
        <BetaReducibleTerm color="blue">
          (λx.z y<sup>1</sup>) y)
        </BetaReducibleTerm>{" "}
        a z
      </BetaReducibleTerm>
    </div>
  </div>
);

export default App;
