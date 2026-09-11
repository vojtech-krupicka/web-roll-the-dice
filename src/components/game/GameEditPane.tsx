"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { CopyButton } from "@/components/ui/CopyButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteGameAction, leaveGameAction, updateGameAction } from "@/app/actions";

const inputClass =
  "rounded-xl border border-neutral-300 bg-transparent px-4 py-3 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:focus:border-neutral-400";

type GameEditPaneProps = {
  hash: string;
  name: string;
  hasPassword: boolean;
  onNameChange: (name: string) => void;
  onPasswordChanged: () => void;
  onDismiss: () => void;
};

/** Full-screen game settings pane: rename, change password, delete, leave. */
export function GameEditPane({
  hash,
  name,
  hasPassword,
  onNameChange,
  onPasswordChanged,
  onDismiss,
}: GameEditPaneProps) {
  const router = useRouter();
  const [nameInput, setNameInput] = useState(name);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatNewPassword, setRepeatNewPassword] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    const result = await updateGameAction(hash, {
      name: nameInput,
      currentPassword,
      newPassword,
      repeatNewPassword,
    });
    setSaving(false);

    if (!result.ok) {
      setSaveError(result.error);
      return;
    }

    onNameChange(nameInput.trim());
    if (newPassword) onPasswordChanged();
    setCurrentPassword("");
    setNewPassword("");
    setRepeatNewPassword("");
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }

  async function handleDeleteConfirmed() {
    setDeleteConfirmOpen(false);
    setDeleteError(null);
    const result = await deleteGameAction(hash, deletePassword);
    if (!result.ok) {
      setDeleteError(result.error);
      return;
    }
    router.push("/");
  }

  async function handleLeaveConfirmed() {
    await leaveGameAction(hash);
    router.push("/");
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-background px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
          Game settings
        </h2>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close"
          className="rounded-full p-1 text-neutral-500 transition hover:bg-neutral-100 dark:hover:bg-neutral-900"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="text-3xl font-bold tracking-[0.3em] uppercase">{hash}</span>
        <CopyButton value={hash} />
      </div>

      <div className="mx-auto mt-6 flex w-full max-w-sm flex-col gap-3">
        <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Name</label>
        <input value={nameInput} onChange={(event) => setNameInput(event.target.value)} className={inputClass} />

        <label className="mt-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          Change password
        </label>
        {hasPassword && (
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder="Current password"
            className={inputClass}
          />
        )}
        <input
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder="New password"
          className={inputClass}
        />
        <input
          type="password"
          value={repeatNewPassword}
          onChange={(event) => setRepeatNewPassword(event.target.value)}
          placeholder="Repeat new password"
          className={inputClass}
        />

        {saveError && (
          <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
            {saveError}
          </p>
        )}
        {savedFlash && <p className="text-sm font-medium text-green-600 dark:text-green-500">Saved.</p>}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !nameInput.trim()}
          className="mt-2 rounded-xl bg-neutral-900 px-5 py-3 font-semibold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          Save
        </button>
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-sm flex-col gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => setLeaveConfirmOpen(true)}
          className="rounded-xl border border-neutral-300 px-5 py-3 font-semibold transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          Leave game
        </button>

        <div className="flex flex-col gap-2">
          {hasPassword && (
            <input
              type="password"
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              placeholder="Password"
              className={inputClass}
            />
          )}
          {deleteError && (
            <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
              {deleteError}
            </p>
          )}
          <button
            type="button"
            onClick={() => setDeleteConfirmOpen(true)}
            disabled={hasPassword && !deletePassword}
            className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete game
          </button>
        </div>
      </div>

      {leaveConfirmOpen && (
        <ConfirmDialog
          title="Leave game?"
          message="You can rejoin later with the game hash."
          confirmLabel="Leave"
          danger
          onConfirm={handleLeaveConfirmed}
          onCancel={() => setLeaveConfirmOpen(false)}
        />
      )}

      {deleteConfirmOpen && (
        <ConfirmDialog
          title="Delete this game?"
          message="This permanently deletes the game and its players. This cannot be undone."
          confirmLabel="Delete"
          danger
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeleteConfirmOpen(false)}
        />
      )}
    </div>
  );
}
