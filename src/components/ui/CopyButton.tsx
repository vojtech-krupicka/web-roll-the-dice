"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type CopyButtonProps = {
  value: string;
  className?: string;
};

/** A small button that copies `value` to the clipboard, with a brief confirmation. */
export function CopyButton({ value, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can fail (permissions, insecure context) — silently ignore.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy to clipboard"
      className={`flex items-center justify-center rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900 ${className ?? ""}`}
    >
      {copied ? <Check size={18} className="text-green-600 dark:text-green-500" /> : <Copy size={18} />}
    </button>
  );
}
