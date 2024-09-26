import { FC, ReactNode } from "react";

export type Color = "blue" | "red" | "lime" | "fuchsia" | "emerald";

function getColors(color: Color): string {
  switch (color) {
    case "blue":
      return "bg-blue-50 hoverable-snippet__blue border-blue-400";

    case "red":
      return "bg-red-50 hoverable-snippet__red border-red-400";

    case "lime":
      return "bg-lime-50 hoverable-snippet__lime border-lime-400";

    case "fuchsia":
      return "bg-fuchsia-50 hoverable-snippet__fuchsia border-fuchsia-400";

    case "emerald":
      return "bg-emerald-50 hoverable-snippet__emerald border-emerald-400";
  }
}

export const BetaReducibleTerm: FC<{ children: ReactNode; color?: Color }> = ({
  children,
  color,
}) => {
  const coloring = color === undefined ? "" : `border-b-4  ${getColors(color)}`;

  return (
    <button onClick={() => {}} className="inline-flex flex-col cursor-pointer">
      <pre
        className={`
          inline whitespace-pre text-5xl text-zinc-800 hoverable-snippet cursor-pointer
          rounded-xl pb-1.5 mb-1.5 w-full hoverable-snippet
          ${coloring}
        `}
      >
        {children}
      </pre>
    </button>
  );
};
