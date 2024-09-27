import { FC, useCallback, useEffect, useState } from "react";
import { Editor, EditorProps } from "./components/Editor";
import { type Program as ProgramT } from "./lambda/ast";
import { Program } from "./components/Term";

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

// lambdas are written using the "\binding.body" syntax
// "\x y.body" is sugar for "\x.\y.body"

// You can define top-level aliases using uppercase identifiers
let I t = t in // <- this is the same as "let I = \t . t"
let S x y z = x z (y z) in
let K u v = u in

S (K S) K

// source: https://github.com/ascandone/lambda-calculus-visualization
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
          <div className="mx-auto max-w-screen-2xl px-2 py-16">
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

export default App;
