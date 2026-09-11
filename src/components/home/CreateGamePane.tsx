"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGameAction } from "@/app/actions";

const inputClass =
  "rounded-xl border border-neutral-300 bg-transparent px-4 py-3 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:focus:border-neutral-400";

type CreateGamePaneProps = {
  onDismiss: () => void;
};

/** Popup form for creating a new game: name + optional password. */
export function CreateGamePane({ onDismiss }: CreateGamePaneProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleCreate() {
    setPending(true);
    setError(null);
    const result = await createGameAction(name, password, repeatPassword);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/g/${result.data.hash}?welcome=1`);
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-6"
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-background p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-sm font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
          Create game
        </h3>

        <div className="mt-4 flex flex-col gap-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Game name"
            className={inputClass}
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password (optional)"
            className={inputClass}
          />
          <input
            type="password"
            value={repeatPassword}
            onChange={(event) => setRepeatPassword(event.target.value)}
            placeholder="Repeat password"
            className={inputClass}
          />
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleCreate}
          disabled={pending || !name.trim()}
          className="mt-5 w-full rounded-xl bg-neutral-900 px-5 py-3 font-semibold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          Create
        </button>
      </div>
    </div>
  );
}
