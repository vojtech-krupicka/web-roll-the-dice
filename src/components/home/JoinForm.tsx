"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { checkGameAction, joinGameWithPasswordAction } from "@/app/actions";
import { PasswordInput } from "@/components/ui/PasswordInput";

type Stage = "hash" | "password";

const passwordInputClass =
  "w-full rounded-xl border border-border bg-panel-inset px-4 py-3 text-[15px] outline-none focus:border-border-strong disabled:opacity-60";

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
    <div className="flex w-full flex-col gap-5 rounded-3xl border border-border bg-panel p-5">
      <div>
        <label className="mb-2 block text-[10px] font-bold tracking-[0.1em] text-faint">
          GAME CODE
        </label>
        <input
          value={hash}
          onChange={(event) => resetToHashStage(event.target.value)}
          placeholder="NYX7K"
          maxLength={5}
          disabled={stage === "password"}
          className="w-full rounded-xl border-[1.5px] border-accent-cyan/45 bg-panel-inset px-4 py-3.5 text-center font-mono text-lg font-bold tracking-[0.22em] text-[#67e8f9] uppercase outline-none placeholder:text-faint disabled:opacity-60"
        />
      </div>

      {stage === "password" && (
        <div>
          <label className="mb-2 block text-[10px] font-bold tracking-[0.1em] text-faint">
            PASSWORD
          </label>
          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="Password"
            className={passwordInputClass}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm font-medium text-red-400">
          {error}
        </p>
      )}

      {stage === "hash" ? (
        <button
          type="button"
          onClick={handleJoin}
          disabled={pending || hash.trim().length !== 5}
          className="cta-gradient flex items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-bold text-[#0a0b14] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Join Game
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      ) : (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => resetToHashStage(hash)}
            className="flex-1 rounded-full border border-border-strong py-3.5 text-[15px] font-semibold text-muted transition hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmPassword}
            disabled={pending || !password}
            className="cta-gradient flex-1 rounded-full py-3.5 text-[15px] font-bold text-[#0a0b14] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Join Game
          </button>
        </div>
      )}
    </div>
  );
}
