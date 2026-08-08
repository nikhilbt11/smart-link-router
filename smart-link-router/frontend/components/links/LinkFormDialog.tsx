"use client";

import { useState, type FormEvent } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { ApiError } from "@/lib/api";
import { createLink, updateLink, type Link, type LinkInput } from "@/lib/services/linkService";

const ALIAS_REGEX = /^[a-zA-Z0-9-_]+$/;

interface LinkFormDialogProps {
  link?: Link;
  onClose: () => void;
  onSaved: (link: Link) => void;
}

interface FormState {
  alias: string;
  iosUrl: string;
  androidUrl: string;
  desktopUrl: string;
  title: string;
  isActive: boolean;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.alias.trim()) {
    errors.alias = "Alias is required.";
  } else if (!ALIAS_REGEX.test(form.alias.trim())) {
    errors.alias = "Alias may only contain letters, numbers, hyphens, and underscores.";
  }

  if (!form.iosUrl.trim()) {
    errors.iosUrl = "iOS URL is required.";
  } else if (!isValidHttpUrl(form.iosUrl.trim())) {
    errors.iosUrl = "Enter a valid http(s) URL.";
  }

  if (!form.androidUrl.trim()) {
    errors.androidUrl = "Android URL is required.";
  } else if (!isValidHttpUrl(form.androidUrl.trim())) {
    errors.androidUrl = "Enter a valid http(s) URL.";
  }

  if (!form.desktopUrl.trim()) {
    errors.desktopUrl = "Desktop/fallback URL is required.";
  } else if (!isValidHttpUrl(form.desktopUrl.trim())) {
    errors.desktopUrl = "Enter a valid http(s) URL.";
  }

  return errors;
}

export default function LinkFormDialog({ link, onClose, onSaved }: LinkFormDialogProps) {
  const isEditMode = Boolean(link);
  const [form, setForm] = useState<FormState>({
    alias: link?.alias ?? "",
    iosUrl: link?.iosUrl ?? "",
    androidUrl: link?.androidUrl ?? "",
    desktopUrl: link?.desktopUrl ?? "",
    title: link?.title ?? "",
    isActive: link?.isActive ?? true,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload: LinkInput = {
      alias: form.alias.trim().toLowerCase(),
      iosUrl: form.iosUrl.trim(),
      androidUrl: form.androidUrl.trim(),
      desktopUrl: form.desktopUrl.trim(),
      isActive: form.isActive,
      ...(form.title.trim() && { title: form.title.trim() }),
    };

    setIsSubmitting(true);
    try {
      const saved = isEditMode && link ? await updateLink(link._id, payload) : await createLink(payload);
      onSaved(saved);
      onClose();
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title={isEditMode ? "Edit Smart Link" : "Create Smart Link"} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <Input
            label="Alias"
            value={form.alias}
            onChange={(event) => updateField("alias", event.target.value)}
            placeholder="my-app"
            required
          />
          {fieldErrors.alias && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.alias}</p>
          )}
        </div>

        <Input
          label="Title (optional)"
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          placeholder="My App"
        />

        <div>
          <Input
            label="iOS URL"
            value={form.iosUrl}
            onChange={(event) => updateField("iosUrl", event.target.value)}
            placeholder="https://apps.apple.com/..."
            required
          />
          {fieldErrors.iosUrl && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.iosUrl}</p>
          )}
        </div>

        <div>
          <Input
            label="Android URL"
            value={form.androidUrl}
            onChange={(event) => updateField("androidUrl", event.target.value)}
            placeholder="https://play.google.com/..."
            required
          />
          {fieldErrors.androidUrl && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.androidUrl}</p>
          )}
        </div>

        <div>
          <Input
            label="Desktop / Fallback URL"
            value={form.desktopUrl}
            onChange={(event) => updateField("desktopUrl", event.target.value)}
            placeholder="https://example.com"
            required
          />
          {fieldErrors.desktopUrl && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.desktopUrl}</p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => updateField("isActive", event.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
          />
          Active
        </label>

        {submitError && <ErrorMessage message={submitError} />}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditMode ? "Save Changes" : "Create Link"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
