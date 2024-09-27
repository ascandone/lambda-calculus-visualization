import { FC, ReactNode } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export type MenuButtonProps = {
  children: ReactNode;
};

export const MenuButton: FC<MenuButtonProps> = ({ children }) => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>
      <button
        className={`
            border border-transparent outline-none hover:border-slate-300
            shadow-transparent hover:shadow rounded-lg
            transition-all duration-150 ease-in-out
        `}
      >
        <EllipsisIcon />
      </button>
    </DropdownMenu.Trigger>

    <DropdownMenu.Portal>
      <DropdownMenu.Content
        collisionPadding={{ left: 20 }}
        className="min-w-[220px] bg-white rounded-md p-1.5 shadow-xl border will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade"
        sideOffset={5}
      >
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
);

export const MenuItem: FC<{
  children: ReactNode;
  onClick: VoidFunction;
  disabled?: boolean;
}> = ({ children, onClick, disabled }) => (
  <DropdownMenu.Item
    disabled={disabled}
    onClick={onClick}
    className={`
        group text-lg leading-none text-zinc-600 rounded
        flex items-center h-10 relative px-4
        select-none outline-none
        data-[disabled]:text-zinc-400 data-[disabled]:pointer-events-none
        data-[highlighted]:bg-zinc-100
    `}
  >
    {children}
  </DropdownMenu.Item>
);

const EllipsisIcon: FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-8 text-slate-700"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
    />
  </svg>
);
