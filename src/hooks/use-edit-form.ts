import { useState } from "react";

import { confirm } from "@/lib/confirm";

/**
 * State + handlers for an inline "view / edit" detail form: an `editing` toggle,
 * a `busy` flag, an `error` string, and save / cancel / delete flows. `initial`
 * is the canonical value from the loaded entity — the draft is seeded from it
 * whenever editing starts or is cancelled.
 */
export function useEditForm<T>({
  initial,
  validate,
  onSave,
  onDelete,
  deleteMessage,
}: {
  initial: T;
  validate?: (values: T) => boolean;
  onSave: (values: T) => Promise<void>;
  onDelete?: () => Promise<void>;
  deleteMessage?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<T>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEditing() {
    setValues(initial);
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setValues(initial);
    setError(null);
    setEditing(false);
  }

  async function save() {
    setError(null);
    setBusy(true);
    try {
      await onSave(values);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!onDelete) return;
    if (deleteMessage && !(await confirm(deleteMessage))) return;
    setError(null);
    setBusy(true);
    try {
      await onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return {
    editing,
    values,
    setValues,
    startEditing,
    cancel,
    save,
    remove,
    busy,
    error,
    canSave: validate ? validate(values) : true,
  };
}
