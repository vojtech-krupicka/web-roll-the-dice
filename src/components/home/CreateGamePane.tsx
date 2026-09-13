"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGameAction } from "@/app/actions";
import { PasswordInput } from "@/components/ui/PasswordInput";

const inputClass =
  "w-full rounded-xl border border-border bg-panel-inset px-4 py-3 text-[15px] outline-none focus:border-border-strong placeholder:text-faint";

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
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-6"
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-panel p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-[10px] font-bold tracking-[0.1em] text-faint uppercase">
          Create game
        </h3>

        <div className="mt-4 flex flex-col gap-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Game name"
            className={inputClass}
          />
          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="Password (optional)"
            className={inputClass}
          />
          <PasswordInput
            value={repeatPassword}
            onChange={setRepeatPassword}
            placeholder="Repeat password"
            className={inputClass}
          />
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-red-400">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleCreate}
          disabled={pending || !name.trim()}
          className="cta-gradient mt-5 w-full rounded-full py-3.5 text-[15px] font-bold text-[#0a0b14] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Create
        </button>
      </div>
    </div>
  );
}
