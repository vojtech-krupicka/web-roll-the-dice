import type { ReactNode } from "react";

type TopBarProps = {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
};

/** App header with three slots: settings/left, game title/center, actions/right. */
export function TopBar({ left, center, right }: TopBarProps) {
  return (
    <header className="relative z-[5] grid shrink-0 grid-cols-3 items-center px-4 pt-3 pb-1.5">
      <div className="flex items-center justify-start gap-2">{left}</div>
      <div className="flex items-center justify-center gap-2 overflow-hidden">{center}</div>
      <div className="flex items-center justify-end gap-2">{right}</div>
    </header>
  );
}
