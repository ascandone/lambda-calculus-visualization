import { FC, useCallback, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { parse } from "../lambda/parser";
import { Program } from "../lambda/ast";

export type EditorProps = {
  value: string;
  setValue: (value: string) => void;
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

const EVENT_RUN = "RUN_EDITOR";

export const Editor: FC<EditorProps> = ({
  onSubmit: onSubmitTerm,
  value,
  setValue,
}) => {
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
    <div className="h-full">
      <div className="fixed bottom-6 right-10 z-10">
        <RunBtn onClick={evaluateTerm} />
      </div>

      <MonacoEditor
        language="fsharp"
        className="h-full"
        height="100%"
        defaultValue={value}
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
          fontSize: 24,
          lineNumbers: "off",
          bracketPairColorization: { enabled: false },
          scrollBeyondLastLine: false,
          overviewRulerBorder: false,
          fontFamily: "Noto sans mono",
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
