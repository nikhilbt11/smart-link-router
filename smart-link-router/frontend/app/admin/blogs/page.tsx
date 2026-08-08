"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import ErrorMessage from "@/components/ui/ErrorMessage";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import BlogListTable from "@/components/blogs/BlogListTable";
import BlogFormDialog from "@/components/blogs/BlogFormDialog";
import { ApiError } from "@/lib/api";
import {
  deleteBlog,
  getBlog,
  getBlogs,
  updateBlog,
  type BlogPost,
  type BlogStatus,
} from "@/lib/services/blogService";

type FormTarget = { mode: "create" } | { mode: "edit"; id: string } | null;

export default function AdminBlogsPage() {
  const router = useRouter();

  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [editingBlog, setEditingBlog] = useState<BlogPost | undefined>(undefined);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isPublishingId, setIsPublishingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadBlogs = useCallback(async () => {
    setIsLoadingList(true);
    setListError(null);
    try {
      const result = await getBlogs({ page: 1, limit: 50 });
      setBlogs(result.posts);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/login");
        return;
      }
      setListError(err instanceof ApiError ? err.message : "Failed to load blog posts.");
    } finally {
      setIsLoadingList(false);
    }
  }, [router]);

  useEffect(() => {
    // Standard fetch-on-mount: loadBlogs controls list loading/error/data state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBlogs();
  }, [loadBlogs]);

  async function handleOpenEdit(id: string) {
    setActionError(null);
    setFormTarget({ mode: "edit", id });
    setIsLoadingEdit(true);
    try {
      const data = await getBlog(id);
      setEditingBlog(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/login");
        return;
      }
      setActionError(err instanceof ApiError ? err.message : "Failed to load blog details.");
      setFormTarget(null);
    } finally {
      setIsLoadingEdit(false);
    }
  }

  function handleOpenCreate() {
    setActionError(null);
    setEditingBlog(undefined);
    setIsLoadingEdit(false);
    setFormTarget({ mode: "create" });
  }

  function handleCloseForm() {
    setFormTarget(null);
    setEditingBlog(undefined);
    setIsLoadingEdit(false);
  }

  function handleSaved(saved: BlogPost) {
    setBlogs((prev) => {
      const existingIndex = prev.findIndex((item) => item._id === saved._id);
      if (existingIndex === -1) return [saved, ...prev];
      const copy = [...prev];
      copy[existingIndex] = saved;
      return copy;
    });
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setActionError(null);
    setIsDeletingId(deleteTarget._id);
    try {
      await deleteBlog(deleteTarget._id);
      setBlogs((prev) => prev.filter((item) => item._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/login");
        return;
      }
      setActionError(err instanceof ApiError ? err.message : "Failed to delete blog post.");
    } finally {
      setIsDeletingId(null);
    }
  }

  async function handleTogglePublish(blog: BlogPost) {
    const nextStatus: BlogStatus = blog.status === "published" ? "draft" : "published";
    setActionError(null);
    setIsPublishingId(blog._id);
    try {
      const saved = await updateBlog(blog._id, { status: nextStatus });
      setBlogs((prev) => prev.map((item) => (item._id === blog._id ? saved : item)));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/login");
        return;
      }
      setActionError(err instanceof ApiError ? err.message : "Failed to update publish state.");
    } finally {
      setIsPublishingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Blog CMS</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Create, edit, publish, and manage public blog posts.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>Create Blog Post</Button>
      </div>

      {actionError && <ErrorMessage message={actionError} />}

      {isLoadingList ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : listError ? (
        <ErrorMessage message={listError} />
      ) : blogs.length === 0 ? (
        <EmptyState
          title="No blog posts yet"
          description="Create your first blog post and publish it when ready."
          action={<Button onClick={handleOpenCreate}>Create your first post</Button>}
        />
      ) : (
        <BlogListTable
          blogs={blogs}
          onEdit={handleOpenEdit}
          onDelete={setDeleteTarget}
          onTogglePublish={handleTogglePublish}
          isDeletingId={isDeletingId}
          isPublishingId={isPublishingId}
        />
      )}

      {formTarget && (
        <BlogFormDialog
          blog={formTarget.mode === "edit" ? editingBlog : undefined}
          isLoadingInitial={formTarget.mode === "edit" && isLoadingEdit}
          onClose={handleCloseForm}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Blog Post"
          message={`Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          isConfirming={isDeletingId === deleteTarget._id}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
