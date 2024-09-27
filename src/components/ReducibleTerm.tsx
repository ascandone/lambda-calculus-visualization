import { createContext, FC, ReactNode, useContext } from "react";

const colors = ["blue", "emerald", "fuchsia", "lime"] as const;
export type Color = (typeof colors)[number];

const ColorIdContext = createContext<number>(0);

function getColors(color: Color): string {
  switch (color) {
    case "blue":
      return "bg-blue-50 hoverable-snippet__blue border-blue-400";

    case "lime":
      return "bg-lime-50 hoverable-snippet__lime border-lime-400";

    case "fuchsia":
      return "bg-fuchsia-50 hoverable-snippet__fuchsia border-fuchsia-400";

    case "emerald":
      return "bg-emerald-50 hoverable-snippet__emerald border-emerald-400";
  }
}

export const Pre: FC<{ children: ReactNode }> = ({ children }) => (
  <pre className="text-5xl text-zinc-800">{children}</pre>
);

function getColorByIndex(index: number): Color {
  return colors[index % colors.length];
}

export const BetaReducibleTerm: FC<{ children: ReactNode; color?: Color }> = ({
  children,
  color: defaultColor,
}) => {
  const thisId = useContext(ColorIdContext);

  const color = defaultColor ?? getColorByIndex(thisId);
  return (
    <span className="inline-flex">
      <span
        className={`
        cursor-pointer hoverable-snippet
        rounded-xl pb-1.5 mb-1.5
        transitition-colors duration-100 ease-in-out
        border-b-4 ${getColors(color)}
      `}
      >
        <ColorIdContext.Provider value={thisId + 1}>
          {children}
        </ColorIdContext.Provider>
      </span>
    </span>
  );
};
