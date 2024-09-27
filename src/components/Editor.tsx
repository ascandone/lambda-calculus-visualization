import { FC, useCallback, useEffect, useState } from "react";
import { LambdaExpr } from "../lambda/ast";
import { parse } from "../lambda/parser";
import MonacoEditor from "@monaco-editor/react";

export type EditorProps = {
  onSubmitTerm: (term: LambdaExpr) => void;
};

const RunBtn: FC<{ onClick: VoidFunction }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="bg-zinc-800 text-white rounded-lg w-64 py-2 text-lg shadow-xl"
  >
    Evaluate
  </button>
);

const DEFAULT_VALUE = String.raw`(\x. x x) (\x. x x)`;

const EVENT_RUN = "RUN_EDITOR";

export const Editor: FC<EditorProps> = ({ onSubmitTerm }) => {
  const [value, setValue] = useState(DEFAULT_VALUE);

  const evaluateTerm = useCallback(() => {
    const parsed = parse(value);

    if (parsed.ok) {
      onSubmitTerm(parsed.value);
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

      {/* <div className="px-12 py-5 text-slate-600">
        <p>
          Cmd-k to run. Lorem ipsum, dolor sit amet consectetur adipisicing
          elit. Reprehenderit molestias dignissimos natus aut laboriosam eum
          neque animi deleniti! Exercitationem mollitia, suscipit odit placeat
          laudantium molestiae nesciunt sed amet quasi eligendi!
        </p>
      </div> */}

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
