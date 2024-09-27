import { FC, useCallback, useEffect, useState } from "react";
import { BetaReducibleTerm, TermsList } from "./components/ReducibleTerm";
import { Editor, EditorProps } from "./components/Editor";
import { Program } from "./lambda/ast";
import { unalias } from "./lambda/semantics";

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

const App: FC = () => {
  const [program, setProgram] = useState<Program | undefined>(undefined);

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
            <TermsList term={unalias(program)} />
          </div>
        </div>
      );

    default:
      return <Editor onSubmit={handleSubmit} />;
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
