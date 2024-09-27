import { FC } from "react";
import { unsafeParse } from "./lambda/parser";
import { LambdaTerm } from "./components/Term";
import { BetaReducibleTerm, Pre } from "./components/ReducibleTerm";

const App: FC = () => (
  <div className="px-4 mx-auto w-full h-screen bg-gray-50">
    <div className="h-24"></div>
    <div className="mx-auto flex justify-center">
      <Pre>
        <RenderTerm src="(\x. (\u v. u) y) s ((\x.x y) (k y))" />
        {/* <Example /> */}
      </Pre>
    </div>
  </div>
);

export const RenderTerm: FC<{ src: string }> = ({ src }) => {
  const term = unsafeParse(src);

  return <LambdaTerm expr={term} />;
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
