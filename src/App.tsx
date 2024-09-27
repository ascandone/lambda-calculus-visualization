import { FC, useCallback, useEffect, useState } from "react";
import { BetaReducibleTerm, Program } from "./components/ReducibleTerm";
import { Editor, EditorProps } from "./components/Editor";
import { type Program as ProgramT } from "./lambda/ast";

const useRouter = () => {
  // hack to re-render the component
  const [, setCounter] = useState(0);
  const refresh = useCallback(() => {
    setCounter((counter) => counter + 1);
  }, [setCounter]);

  useEffect(() => {
    window.addEventListener("popstate", refresh);
    return () => window.removeEventListener("popstate", refresh);
  }, [refresh]);

  return {
    location: window.location,
    push(url: string) {
      history.pushState("", "", url);
      refresh();
    },
    redirect(url: string) {
      history.replaceState("", "", url);
      refresh();
    },
  };
};

const DEFAULT_VALUE = String.raw`// Press cmd-Enter or ctrl-Enter to evaluate

// variables are written with lowercase chars
// lambda are written using the "\binding.body" syntax
// you can use the "\x y.body" syntax as a sugar for "\x.\y.body"

// You can define top-level (non recursive) aliases using uppercase identifiers
// be sure the alias ends with the "in" keyword
let S x y z = x z (y z) in // "let C x = y" is sugar for "let C = \x.y"
let K u v = u in
let I t = t in

// here's the term we are going to evaluate
S (K S) K
`;

const App: FC = () => {
  const [value, setValue] = useState(DEFAULT_VALUE);
  const [program, setProgram] = useState<ProgramT | undefined>(undefined);

  const router = useRouter();
  const handleSubmit: EditorProps["onSubmit"] = (program) => {
    setProgram(program);
    router.push("/steps");
  };

  useEffect(() => {
    if (router.location.pathname === "/steps" && program === undefined) {
      router.redirect("/");
    }
  }, [router, program]);

  switch (router.location.pathname) {
    case "/steps":
      if (program === undefined) {
        return null;
      }

      return (
        <div className="px-4 mx-auto w-full">
          <div className="mx-auto flex justify-center py-32">
            <Program program={program} />
          </div>
        </div>
      );

    default:
      return (
        <Editor onSubmit={handleSubmit} value={value} setValue={setValue} />
      );
  }
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
