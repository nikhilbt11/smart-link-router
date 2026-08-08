"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Skeleton from "@/components/ui/Skeleton";
import MarkdownRenderer from "@/components/blogs/MarkdownRenderer";
import { ApiError } from "@/lib/api";
import {
  createBlog,
  updateBlog,
  type BlogPost,
  type BlogStatus,
  type BlogWriteInput,
} from "@/lib/services/blogService";

interface BlogFormDialogProps {
  blog?: BlogPost;
  isLoadingInitial?: boolean;
  onClose: () => void;
  onSaved: (blog: BlogPost) => void;
}

interface FormState {
  title: string;
  slug: string;
  featuredImage: string;
  author: string;
  content: string;
  status: BlogStatus;
}

const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
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

  if (!form.title.trim()) {
    errors.title = "Title is required.";
  }

  if (!form.slug.trim()) {
    errors.slug = "Slug is required.";
  } else if (!SLUG_REGEX.test(form.slug.trim())) {
    errors.slug = "Slug may only include lowercase letters, numbers, and hyphens.";
  }

  if (form.featuredImage.trim() && !isValidHttpUrl(form.featuredImage.trim())) {
    errors.featuredImage = "Featured image must be a valid http(s) URL.";
  }

  if (!form.author.trim()) {
    errors.author = "Author is required.";
  }

  if (!form.content.trim()) {
    errors.content = "Content is required.";
  }

  return errors;
}

function getInitialForm(blog?: BlogPost): FormState {
  return {
    title: blog?.title ?? "",
    slug: blog?.slug ?? "",
    featuredImage: blog?.featuredImage ?? "",
    author: blog?.author ?? "",
    content: blog?.content ?? "",
    status: blog?.status ?? "draft",
  };
}

export default function BlogFormDialog({ blog, isLoadingInitial = false, onClose, onSaved }: BlogFormDialogProps) {
  const isEditMode = Boolean(blog);
  const [form, setForm] = useState<FormState>(getInitialForm(blog));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Reset form whenever a different blog is loaded into the editor.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(getInitialForm(blog));
  }, [blog]);

  const publicUrl = useMemo(() => `/blog/${form.slug.trim() || "your-slug"}`, [form.slug]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleGenerateSlug() {
    const generated = toSlug(form.title);
    updateField("slug", generated);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload: BlogWriteInput = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      author: form.author.trim(),
      content: form.content,
      status: form.status,
      ...(form.featuredImage.trim() && { featuredImage: form.featuredImage.trim() }),
    };

    setIsSubmitting(true);
    try {
      const saved = isEditMode && blog ? await updateBlog(blog._id, payload) : await createBlog(payload);
      onSaved(saved);
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setSubmitError("This slug is already in use. Please choose a unique slug.");
      } else {
        setSubmitError(err instanceof ApiError ? err.message : "Failed to save blog post.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      title={isEditMode ? "Edit Blog Post" : "Create Blog Post"}
      onClose={onClose}
      panelClassName="max-w-5xl"
    >
      {isLoadingInitial ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-52 w-full" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Input
                label="Title"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="How Smart Links Improve Conversion"
                required
              />
              {fieldErrors.title && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.title}</p>}
            </div>

            <div className="space-y-1">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    label="Slug"
                    value={form.slug}
                    onChange={(event) => updateField("slug", event.target.value.toLowerCase())}
                    placeholder="smart-link-conversion"
                    required
                  />
                </div>
                <Button type="button" variant="secondary" onClick={handleGenerateSlug} className="mb-0.5 h-10.5 px-3">
                  Generate
                </Button>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Public URL: {publicUrl}</p>
              {fieldErrors.slug && <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.slug}</p>}
            </div>

            <div>
              <Input
                label="Featured Image URL (optional)"
                value={form.featuredImage}
                onChange={(event) => updateField("featuredImage", event.target.value)}
                placeholder="https://images.example.com/blog-cover.jpg"
              />
              {fieldErrors.featuredImage && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.featuredImage}</p>
              )}
            </div>

            <div>
              <Input
                label="Author"
                value={form.author}
                onChange={(event) => updateField("author", event.target.value)}
                placeholder="Jane Doe"
                required
              />
              {fieldErrors.author && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.author}</p>}
            </div>

            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</span>
              <select
                value={form.status}
                onChange={(event) => updateField("status", event.target.value as BlogStatus)}
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>

            <div className="md:col-span-2">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Content (Markdown)</span>
                <textarea
                  value={form.content}
                  onChange={(event) => updateField("content", event.target.value)}
                  rows={12}
                  className="w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  placeholder="# Heading\n\nWrite your post in Markdown..."
                  required
                />
              </label>
              {fieldErrors.content && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fieldErrors.content}</p>}
            </div>

            <div className="md:col-span-2">
              <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Live Preview</p>
              <div className="max-h-96 overflow-y-auto rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
                {form.content.trim() ? (
                  <MarkdownRenderer content={form.content} />
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Start writing Markdown to preview your post.</p>
                )}
              </div>
            </div>
          </div>

          {submitError && <ErrorMessage message={submitError} />}

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditMode ? "Save Changes" : "Create Post"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
