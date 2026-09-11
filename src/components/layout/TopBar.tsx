import type { ReactNode } from "react";

type TopBarProps = {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
};

/** App header with three slots: settings/left, game title/center, actions/right. */
export function TopBar({ left, center, right }: TopBarProps) {
  return (
    <header className="grid h-14 shrink-0 grid-cols-3 items-center border-b border-neutral-200 bg-background px-4 dark:border-neutral-800">
      <div className="flex items-center justify-start gap-2">{left}</div>
      <div className="flex items-center justify-center gap-2 overflow-hidden">{center}</div>
      <div className="flex items-center justify-end gap-2">{right}</div>
    </header>
  );
}
