"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Dices } from "lucide-react";
import { JoinForm } from "@/components/home/JoinForm";
import { CreateGamePane } from "@/components/home/CreateGamePane";

function HomeContent() {
  const searchParams = useSearchParams();
  const initialHash = searchParams.get("hash") ?? "";
  const notFound = searchParams.get("error") === "not-found";
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <main className="flex min-h-dvh flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Dices size={40} aria-hidden="true" />
          <h1 className="text-2xl font-bold">Roll the Dice</h1>
        </div>

        {notFound && (
          <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
            That game no longer exists.
          </p>
        )}

        <JoinForm initialHash={initialHash} />
      </div>

      <div className="flex flex-col items-center px-6 pb-10">
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="w-full max-w-sm rounded-2xl bg-neutral-900 px-8 py-5 text-lg font-semibold text-white shadow-lg transition active:scale-95 dark:bg-neutral-100 dark:text-neutral-900"
        >
          Create game
        </button>
      </div>

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
