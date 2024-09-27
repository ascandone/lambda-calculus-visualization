import { FC, useCallback, useEffect, useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import { parse } from "../lambda/parser";
import { Program } from "../lambda/ast";

export type EditorProps = {
  onSubmit: (term: Program) => void;
};

const RunBtn: FC<{ onClick: VoidFunction }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="bg-zinc-800 text-white rounded-lg w-64 py-2 text-lg shadow-xl hover:bg-zinc-950 transition-colors duration-75"
  >
    Evaluate
  </button>
);

const DEFAULT_VALUE = String.raw`// Press cmd-Enter or ctrl-Enter to evaluate

// variables are written with lowercase chars
// lambda are written using the "\binding.body" syntax
// you can use the "\x y.body" syntax as a sugar for "\x.\y.body"

// You can define top-level (non recursive) aliases using uppercase identifiers
// be sure the alias ends with the "in" keyword
let S x y z = x y z in // "let C x = y" is sugar for "let C = \x.y"
let K u v = u in
let I t = t in

// here's the term we are going to evaluate
S (K S) K
`;

const EVENT_RUN = "RUN_EDITOR";

export const Editor: FC<EditorProps> = ({ onSubmit: onSubmitTerm }) => {
  const [value, setValue] = useState(DEFAULT_VALUE);

  const evaluateTerm = useCallback(() => {
    const parsed = parse(value);

    if (parsed.ok) {
      onSubmitTerm(parsed.value);
    } else {
      alert("Error: " + parsed.matchResult.message);
    }
  }, [onSubmitTerm, value]);

  useEffect(() => {
    window.addEventListener(EVENT_RUN, evaluateTerm);
    return () => {
      window.removeEventListener(EVENT_RUN, evaluateTerm);
    };
  }, [evaluateTerm]);

  return (
    <div className="w-full h-full">
      <div className="px-4 py-4 fixed bottom-4 right-4 z-10">
        <RunBtn onClick={evaluateTerm} />
      </div>

      <MonacoEditor
        language="fsharp"
        className="h-full p-4"
        height="100%"
        defaultValue={DEFAULT_VALUE}
        onChange={(e) => setValue(e ?? "")}
        onMount={(editor, monaco) => {
          editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
            () => {
              window.dispatchEvent(new CustomEvent(EVENT_RUN));
            },
          );
        }}
        options={{
          fontSize: 32,
          lineNumbers: "off",
          bracketPairColorization: { enabled: false },
          scrollBeyondLastLine: false,
          overviewRulerBorder: false,
          fontFamily: "Inconsolata",
          folding: true,
          guides: {
            indentation: false,
          },
          minimap: {
            enabled: false,
          },
          quickSuggestions: false,
        }}
      />
    </div>
  );
};
