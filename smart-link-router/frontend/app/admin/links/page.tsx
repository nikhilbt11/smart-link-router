"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import ErrorMessage from "@/components/ui/ErrorMessage";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import LinkTable from "@/components/links/LinkTable";
import LinkFormDialog from "@/components/links/LinkFormDialog";
import { ApiError } from "@/lib/api";
import { getLinks, deleteLink as deleteLinkRequest, type Link } from "@/lib/services/linkService";

type FormTarget = Link | "new" | null;

export default function AdminLinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<Link | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadLinks = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getLinks();
      setLinks(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/login");
        return;
      }
      setLoadError(err instanceof ApiError ? err.message : "Failed to load smart links.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Standard fetch-on-mount: loadLinks sets loading/error/data state once the request settles.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLinks();
  }, [loadLinks]);

  function handleSaved(saved: Link) {
    setLinks((prev) => {
      const exists = prev.some((item) => item._id === saved._id);
      return exists ? prev.map((item) => (item._id === saved._id ? saved : item)) : [saved, ...prev];
    });
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setActionError(null);
    try {
      await deleteLinkRequest(deleteTarget._id);
      setLinks((prev) => prev.filter((item) => item._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/login");
        return;
      }
      setActionError(err instanceof ApiError ? err.message : "Failed to delete the smart link.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Smart Links</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Create device-aware links and manage where each one points.
          </p>
        </div>
        <Button onClick={() => setFormTarget("new")}>Create Smart Link</Button>
      </div>

      {actionError && <ErrorMessage message={actionError} />}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : loadError ? (
        <ErrorMessage message={loadError} />
      ) : links.length === 0 ? (
        <EmptyState
          title="No smart links yet"
          description="Create your first smart link to start routing visitors by device."
          action={<Button onClick={() => setFormTarget("new")}>Create your first smart link</Button>}
        />
      ) : (
        <LinkTable
          links={links}
          onEdit={(link) => setFormTarget(link)}
          onDelete={(link) => setDeleteTarget(link)}
        />
      )}

      {formTarget && (
        <LinkFormDialog
          link={formTarget === "new" ? undefined : formTarget}
          onClose={() => setFormTarget(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Smart Link"
          message={`Are you sure you want to delete "${deleteTarget.alias}"? This action cannot be undone.`}
          confirmLabel="Delete"
          isConfirming={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
