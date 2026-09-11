"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkGameAction, joinGameWithPasswordAction } from "@/app/actions";
import { PasswordInput } from "@/components/ui/PasswordInput";

type Stage = "hash" | "password";

const inputClass =
  "rounded-xl border border-neutral-300 bg-transparent px-4 py-3 text-base outline-none focus:border-neutral-500 disabled:opacity-60 dark:border-neutral-700 dark:focus:border-neutral-400";

type JoinFormProps = {
  initialHash?: string;
};

/** Hash input + Join button; reveals a password field for protected games. */
export function JoinForm({ initialHash = "" }: JoinFormProps) {
  const router = useRouter();
  const [hash, setHash] = useState(initialHash);
  const [stage, setStage] = useState<Stage>("hash");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function resetToHashStage(nextHash: string) {
    setHash(nextHash);
    setStage("hash");
    setPassword("");
    setError(null);
  }

  async function handleJoin() {
    const trimmed = hash.trim().toLowerCase();
    if (!trimmed) return;

    setPending(true);
    setError(null);
    const result = await checkGameAction(trimmed);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.data.hasPassword) {
      setStage("password");
    } else {
      router.push(`/g/${trimmed}?welcome=1`);
    }
  }

  async function handleConfirmPassword() {
    const trimmed = hash.trim().toLowerCase();
    setPending(true);
    setError(null);
    const result = await joinGameWithPasswordAction(trimmed, password);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/g/${trimmed}?welcome=1`);
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex gap-2">
        <input
          value={hash}
          onChange={(event) => resetToHashStage(event.target.value)}
          placeholder="Game hash"
          maxLength={5}
          disabled={stage === "password"}
          className={`flex-1 text-center text-lg tracking-[0.3em] uppercase ${inputClass}`}
        />
        {stage === "hash" && (
          <button
            type="button"
            onClick={handleJoin}
            disabled={pending || !hash.trim()}
            className="rounded-xl bg-neutral-900 px-5 py-3 font-semibold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
          >
            Join
          </button>
        )}
      </div>

      {stage === "password" && (
        <div className="flex flex-col gap-2">
          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="Password"
            className={inputClass}
          />
          <button
            type="button"
            onClick={handleConfirmPassword}
            disabled={pending || !password}
            className="rounded-xl bg-neutral-900 px-5 py-3 font-semibold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
          >
            Confirm
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
