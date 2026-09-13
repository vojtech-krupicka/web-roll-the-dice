"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { JoinForm } from "@/components/home/JoinForm";
import { CreateGamePane } from "@/components/home/CreateGamePane";

function HomeContent() {
  const searchParams = useSearchParams();
  const initialHash = searchParams.get("hash") ?? "";
  const notFound = searchParams.get("error") === "not-found";
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <main className="flex min-h-dvh flex-col items-center px-6 pt-20 pb-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <svg
          width="60"
          height="60"
          viewBox="0 0 100 100"
          aria-hidden="true"
          className="drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]"
        >
          <polygon
            points="50,4 89.8,27 89.8,73 50,96 10.2,73 10.2,27"
            fill="var(--color-panel-inset)"
            stroke="var(--color-accent-cyan)"
            strokeWidth="3"
          />
          <text
            x="50"
            y="53"
            textAnchor="middle"
            dominantBaseline="central"
            className="font-mono font-bold"
            fontSize="26"
            fill="#67e8f9"
          >
            20
          </text>
        </svg>
        <h1 className="text-xl font-bold tracking-[0.08em]">ROLL THE DICE</h1>
        <p className="text-sm text-muted">Enter a game code to join the table</p>
      </div>

      {notFound && (
        <p role="alert" className="mt-4 text-sm font-medium text-red-400">
          That game no longer exists.
        </p>
      )}

      <div className="mt-8 w-full max-w-sm">
        <JoinForm initialHash={initialHash} />
      </div>

      <div className="mt-6 flex w-full max-w-sm items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-semibold tracking-[0.08em] text-faint">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={() => setCreateOpen(true)}
        className="mt-5 flex w-full max-w-sm items-center justify-center gap-2 rounded-full border-[1.5px] border-accent-cyan/40 bg-accent-cyan/[0.06] py-3.5 text-[15px] font-bold text-accent-cyan transition active:scale-95"
      >
        <Plus size={16} aria-hidden="true" />
        Create New Game
      </button>

      <div className="flex-1" />
      <p className="pt-8 text-xs text-faint">Built for tabletop nights 🎲</p>

      {createOpen && <CreateGamePane onDismiss={() => setCreateOpen(false)} />}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
