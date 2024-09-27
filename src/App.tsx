import { FC, useState } from "react";
import { unsafeParse } from "./lambda/parser";
import { LambdaTerm } from "./components/Term";
import { BetaReducibleTerm, Pre } from "./components/ReducibleTerm";

const s = String.raw`(\x y z. x z (y z))`;
const k = String.raw`(\u v. u)`;
// const i = String.raw`(\t . t)`;
// const comb = String.raw`(${s} (${k} ${s})) ${k}`;
const comb = String.raw`${s} ${k} ${k}`;

const App: FC = () => (
  <div className="px-4 mx-auto w-full h-screen bg-gray-50">
    <div className="h-24"></div>
    <div className="mx-auto flex justify-center">
      <RenderTermList src={comb} />
      {/* <RenderTermList src={String.raw`(\x y. (\a.a) b)`} /> */}
    </div>
  </div>
);

export const RenderTermList: FC<{ src: string }> = ({ src }) => {
  const [terms, setTerms] = useState(() => [unsafeParse(src)]);

  return (
    <div className="flex flex-col gap-y-12">
      {terms.map((term, index) => (
        <Pre key={index}>
          <LambdaTerm
            expr={term}
            onReduction={(newExpr) => {
              setTerms([...terms.slice(0, index + 1), newExpr]);
            }}
          />
        </Pre>
      ))}
    </div>
  );
};

export const RenderTerm: FC<{ src: string }> = ({ src }) => {
  const [term, setTerm] = useState(() => unsafeParse(src));

  return (
    <LambdaTerm
      expr={term}
      onReduction={(newExpr) => {
        setTerm(newExpr);
      }}
    />
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
