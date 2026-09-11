import type { ReactNode } from "react";

type TopBarProps = {
  children?: ReactNode;
};

/** App header. Left side is reserved for a future title/buttons. */
export function TopBar({ children }: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 bg-background px-4 dark:border-neutral-800">
      <div />
      <div className="flex items-center gap-2">{children}</div>
    </header>
  );
}
