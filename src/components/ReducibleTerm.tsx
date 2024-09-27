import classNames from "classnames";
import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { LambdaExpr, type Program as ProgramT } from "../lambda/ast";
import { AliasesContext, LambdaTerm } from "./Term";

const colors = ["blue", "emerald", "fuchsia", "lime"] as const;
export type Color = (typeof colors)[number];

const ColorIdContext = createContext<number>(0);

export const GlobalSelectionContext = createContext<
  [state: string | undefined, setState: (newState: string) => void]
>([undefined, () => {}]);

function getColors(color: Color, selectionState: SelectionState): string {
  switch (color) {
    case "blue":
      return classNames("hoverable-snippet__blue border-blue-400", {
        "bg-blue-200": selectionState === "selected",
        "bg-blue-50": selectionState === "none",
      });

    case "lime":
      return classNames("hoverable-snippet__lime border-lime-400", {
        "bg-lime-200": selectionState === "selected",
        "bg-lime-50": selectionState === "none",
      });

    case "fuchsia":
      return classNames("hoverable-snippet__fuchsia border-fuchsia-400", {
        "bg-fuchsia-200": selectionState === "selected",
        "bg-fuchsia-50": selectionState === "none",
      });

    case "emerald":
      return classNames("hoverable-snippet__emerald border-emerald-400", {
        "bg-emerald-200": selectionState === "selected",
        "bg-emerald-50": selectionState === "none",
      });
  }
}

export const Pre: FC<{ children: ReactNode }> = ({ children }) => {
  const [selected, setSelected] = useState<string | undefined>(undefined);

  return (
    <GlobalSelectionContext.Provider value={[selected, setSelected]}>
      <pre className="whitespace-pre-wrap text-5xl text-zinc-800">
        {children}
      </pre>
    </GlobalSelectionContext.Provider>
  );
};

function getColorByIndex(index: number): Color {
  return colors[index % colors.length];
}

export type SelectionState = "none" | "selected" | "unselected";

export const BetaReducibleTerm: FC<{
  children: ReactNode;
  color?: Color;
  onClick?: VoidFunction;
  selectionState?: SelectionState;
}> = ({ children, color: defaultColor, onClick, selectionState = "none" }) => {
  const thisId = useContext(ColorIdContext);

  const color = defaultColor ?? getColorByIndex(thisId);

  const selectionCls = ((): string => {
    switch (selectionState) {
      case "none":
        return "";

      case "selected":
        return "";

      case "unselected":
        return "border-dashed";
    }
  })();

  return (
    <span
      className="inline-flex"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <span
        className={`
        cursor-pointer hoverable-snippet
        rounded-lg pb-1.5 mb-1.5
        transitition-colors duration-100 ease-in-out
        border-b-4
        ${getColors(color, selectionState)} ${selectionCls}
      `}
      >
        <ColorIdContext.Provider value={thisId + 1}>
          {children}
        </ColorIdContext.Provider>
      </span>
    </span>
  );
};

function freshId() {
  return Date.now().toString();
}

const Appear: FC<{ children: ReactNode; immediate?: boolean }> = ({
  children,
  immediate = false,
}) => {
  const [rendered, setRendered] = useState(immediate);

  useEffect(() => {
    requestAnimationFrame(() => {
      setRendered(true);
    });
  }, []);

  return (
    <div
      className={`transition-all duration-200 relative ease-in-out ${rendered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}
    >
      {children}
    </div>
  );
};

export const Program: FC<{ program: ProgramT }> = ({ program }) => {
  const [terms, setTerms] = useState<[string, LambdaExpr][]>([
    [freshId(), program.expr],
  ]);

  return (
    <AliasesContext.Provider value={program.aliases}>
      <div className="flex flex-col gap-y-14">
        {terms.map(([id, term], index) => (
          <Appear key={id} immediate={index === 0}>
            <Pre>
              <LambdaTerm
                expr={term}
                onReduction={(newExpr) => {
                  setTerms([
                    ...terms.slice(0, index + 1),
                    [freshId(), newExpr],
                  ]);
                }}
              />
            </Pre>
          </Appear>
        ))}
      </div>
    </AliasesContext.Provider>
  );
};
