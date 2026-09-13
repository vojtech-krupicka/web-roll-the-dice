"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CopyButton } from "@/components/ui/CopyButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DialogShell, type DialogBottomNav } from "@/components/ui/DialogShell";
import { deleteGameAction, leaveGameAction, updateGameAction } from "@/app/actions";
import { PasswordInput } from "@/components/ui/PasswordInput";

const inputClass =
  "w-full rounded-xl border border-border bg-panel px-4 py-3 text-[15px] outline-none focus:border-border-strong placeholder:text-faint";

type GameEditPaneProps = {
  hash: string;
  name: string;
  hasPassword: boolean;
  bottomNav: DialogBottomNav;
  onNameChange: (name: string) => void;
  onPasswordChanged: () => void;
  onDismiss: () => void;
};

/** Full-screen game settings pane: rename, change password, delete, leave. */
export function GameEditPane({
  hash,
  name,
  hasPassword,
  bottomNav,
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
    <DialogShell title="Game settings" bottomNav={bottomNav} onDismiss={onDismiss}>
      <div className="flex items-center justify-center gap-2">
        <span className="font-mono text-2xl font-bold tracking-[0.2em] text-[#67e8f9] uppercase">{hash}</span>
        <CopyButton value={hash} />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <label className="text-[10px] font-bold tracking-[0.1em] text-faint">NAME</label>
        <input value={nameInput} onChange={(event) => setNameInput(event.target.value)} className={inputClass} />

        <label className="mt-2 text-[10px] font-bold tracking-[0.1em] text-faint">CHANGE PASSWORD</label>
        {hasPassword && (
          <PasswordInput
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="Current password"
            className={inputClass}
          />
        )}
        <PasswordInput
          value={newPassword}
          onChange={setNewPassword}
          placeholder="New password"
          className={inputClass}
        />
        <PasswordInput
          value={repeatNewPassword}
          onChange={setRepeatNewPassword}
          placeholder="Repeat new password"
          className={inputClass}
        />

        {saveError && (
          <p role="alert" className="text-sm font-medium text-red-400">
            {saveError}
          </p>
        )}
        {savedFlash && <p className="text-sm font-medium text-emerald-400">Saved.</p>}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !nameInput.trim()}
          className="cta-gradient mt-2 rounded-full py-3 text-[15px] font-bold text-[#0a0b14] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save
        </button>
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6">
        <button
          type="button"
          onClick={() => setLeaveConfirmOpen(true)}
          className="rounded-full border border-border-strong py-3 text-[15px] font-semibold text-muted transition hover:bg-white/5"
        >
          Leave game
        </button>

        <div className="flex flex-col gap-2">
          {hasPassword && (
            <PasswordInput
              value={deletePassword}
              onChange={setDeletePassword}
              placeholder="Password"
              className={inputClass}
            />
          )}
          {deleteError && (
            <p role="alert" className="text-sm font-medium text-red-400">
              {deleteError}
            </p>
          )}
          <button
            type="button"
            onClick={() => setDeleteConfirmOpen(true)}
            disabled={hasPassword && !deletePassword}
            className="rounded-full bg-red-500/90 py-3 text-[15px] font-bold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
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
    </DialogShell>
  );
}
