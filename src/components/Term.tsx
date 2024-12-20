import {
  createContext,
  FC,
  memo,
  ReactNode,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  AliasDefinition,
  LambdaExpr,
  type Program as ProgramT,
} from "../lambda/ast";
import {
  BetaReducibleTerm,
  GlobalSelectionContext,
  Pre,
  SelectionState,
} from "./ReducibleTerm";
import {
  autoreduce,
  canonicalize,
  containsBoundAliases,
  performReduction,
  toSki,
  unalias,
} from "../lambda/semantics";
import { MenuButton, MenuItem, Separator } from "./MenuButton";

export const AliasesContext = createContext<AliasDefinition[]>([]);

const chainBindings = (
  expr: LambdaExpr & { type: "lambda" },
): [bindings: string[], body: LambdaExpr] => {
  if (expr.body.type !== "lambda") {
    return [[expr.binding], expr.body];
  }

  const [bindings, body] = chainBindings(expr.body);
  return [[expr.binding, ...bindings], body];
};

function counTrailingQuotes(name: string) {
  let trailingQuotes = 0;
  for (let i = name.length - 1; i >= 0; i--) {
    if (name[i] === "'") {
      trailingQuotes++;
    } else {
      break;
    }
  }
  return trailingQuotes;
}

function handleSup(name: string) {
  const trailingQuotes = counTrailingQuotes(name);

  if (trailingQuotes === 0) {
    return name;
  } else {
    return (
      <>
        {name.replace(/'/g, "")}
        <sub>{trailingQuotes}</sub>
      </>
    );
  }
}

export const LambdaTerm: FC<{
  expr: LambdaExpr;
  onReduction: (e: LambdaExpr) => void;
}> = ({ expr, onReduction }) => {
  const id = useId();
  const [globalSelection, setGlobalSelection] = useContext(
    GlobalSelectionContext,
  );

  const aliases = useContext(AliasesContext);

  const selectionState = ((): SelectionState => {
    if (globalSelection === undefined) {
      return "none";
    }
    return globalSelection === id ? "selected" : "unselected";
  })();

  switch (expr.type) {
    case "var": {
      const isAlias = /[A-Z]/.test(expr.name[0]);

      if (!isAlias || aliases.every((a) => a.name !== expr.name)) {
        return handleSup(expr.name);
      }

      function handleClick() {
        const red = unalias(aliases, expr);
        setGlobalSelection(id);
        onReduction(red);
      }

      return (
        <BetaReducibleTerm
          selectionState={selectionState}
          onClick={handleClick}
        >
          {expr.name}
        </BetaReducibleTerm>
      );
    }

    case "lambda": {
      const [bindings, body] = chainBindings(expr);
      const bindingsJ = bindings.map(handleSup).reduce((prev, curr) => (
        <>
          {prev} {curr}
        </>
      ));
      const bodyT = (
        <LambdaTerm
          expr={body}
          onReduction={(body) => {
            const uncurried = bindings.reduceRight(
              (body, binding): LambdaExpr => ({
                type: "lambda",
                binding,
                body,
              }),
              body,
            );

            onReduction(uncurried);
          }}
        />
      );

      return (
        <>
          λ{bindingsJ}.{bodyT}
        </>
      );
    }

    case "appl": {
      const f = optionalParens(
        expr.f.type === "lambda",
        <LambdaTerm
          expr={expr.f}
          onReduction={(f) => {
            onReduction({
              type: "appl",
              x: expr.x,
              f,
            });
          }}
        />,
      );

      const x = optionalParens(
        expr.x.type !== "var",
        <LambdaTerm
          expr={expr.x}
          onReduction={(x) => {
            onReduction({
              type: "appl",
              x,
              f: expr.f,
            });
          }}
        />,
      );

      const content = (
        <>
          {f} {x}
        </>
      );

      if (expr.f.type === "lambda") {
        const f = expr.f;

        return (
          <BetaReducibleTerm
            selectionState={selectionState}
            onClick={() => {
              const red = performReduction(f, expr.x);
              setGlobalSelection(id);
              onReduction(red);
            }}
          >
            {content}
          </BetaReducibleTerm>
        );
      }

      return content;
    }
  }
};

function optionalParens(putParens: boolean, elem: JSX.Element) {
  if (putParens) {
    return <>({elem})</>;
  } else {
    return elem;
  }
}

let currentId = 0;
function freshId() {
  return (currentId++).toString();
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

const FAST_FORWARD_MAX_STEPS_NUMBER = 20;

export const Program: FC<{ program: ProgramT }> = ({ program }) => {
  const [terms, setTerms] = useState<[string, LambdaExpr][]>(() => [
    [freshId(), program.expr],
  ]);

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }, [terms]);

  return (
    <AliasesContext.Provider value={program.aliases}>
      <div className="flex flex-col gap-y-14">
        {terms.map(([id, term], index) => (
          <StepRow
            key={id}
            aliases={program.aliases}
            index={index}
            setTerms={setTerms}
            term={term}
          />
        ))}
      </div>
    </AliasesContext.Provider>
  );
};

const StepRow: FC<{
  term: LambdaExpr;
  aliases: AliasDefinition[];
  index: number;
  setTerms: (
    terms: (terms: [string, LambdaExpr][]) => [string, LambdaExpr][],
  ) => void;
}> = memo(({ term, aliases, setTerms, index }) => {
  const ref = useRef<HTMLPreElement | null>(null);

  function handleSubstituteAliases() {
    setTerms((terms) => {
      const previous = terms.slice(0, index);
      const substitutedTerm = unalias(aliases, term);
      return [...previous, [freshId(), term], [freshId(), substitutedTerm]];
    });
  }

  function handleCanonicalize() {
    setTerms((terms) => {
      const previous = terms.slice(0, index);
      const canonical = canonicalize(term);
      return [...previous, [freshId(), canonical]];
    });
  }

  function handleFastForward() {
    setTerms((terms) => {
      const newTerms = terms.slice(0, index + 1);

      if (containsBoundAliases(aliases, term)) {
        term = unalias(aliases, term);
        newTerms.push([freshId(), term]);
      }

      for (let i = 0; i < FAST_FORWARD_MAX_STEPS_NUMBER; i++) {
        const red = autoreduce(term);
        if (red === undefined) {
          break;
        }

        newTerms.push([freshId(), red]);
        term = red;
      }

      return newTerms;
    });
  }

  function handleExpressAsSki() {
    setTerms((terms) => {
      const previous = terms.slice(0, index);
      const canonical = toSki(term);
      return [...previous, [freshId(), canonical]];
    });
  }

  function handleDelete() {
    setTerms((terms) => terms.slice(0, index));
  }

  function handleReduction(index: number, newExpr: LambdaExpr) {
    setTerms((terms) => [...terms.slice(0, index + 1), [freshId(), newExpr]]);
  }

  function handleCopyToClipboard() {
    const content = ref.current?.textContent ?? undefined;
    if (content === undefined) {
      return;
    }

    navigator.clipboard.writeText(content);
  }

  const containsBoundAliases_ = containsBoundAliases(aliases, term);

  const isReducible = containsBoundAliases_ || autoreduce(term) !== undefined;

  return (
    <div className="flex items-start gap-x-6">
      <div className="my-2">
        <MenuButton>
          <MenuItem disabled={!isReducible} onClick={handleFastForward}>
            Fast forward
          </MenuItem>

          <MenuItem
            disabled={!containsBoundAliases_}
            onClick={handleSubstituteAliases}
          >
            Substitute all aliases
          </MenuItem>
          <MenuItem onClick={handleCanonicalize}>Simplify bindings</MenuItem>

          <MenuItem onClick={handleExpressAsSki}>
            Express as SKI combinators
          </MenuItem>

          <Separator />

          <MenuItem onClick={handleCopyToClipboard}>Copy to clipboard</MenuItem>
          <MenuItem
            variant="danger"
            disabled={index === 0}
            onClick={handleDelete}
          >
            Delete step
          </MenuItem>
        </MenuButton>
      </div>

      <Appear>
        <Pre ref={ref}>
          <LambdaTerm
            expr={term}
            onReduction={(expr) => handleReduction(index, expr)}
          />
        </Pre>
      </Appear>
    </div>
  );
});
