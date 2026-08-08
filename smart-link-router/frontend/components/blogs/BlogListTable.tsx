"use client";

import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import type { BlogPost } from "@/lib/services/blogService";

interface BlogListTableProps {
  blogs: BlogPost[];
  onEdit: (blogId: string) => void;
  onDelete: (blog: BlogPost) => void;
  onTogglePublish: (blog: BlogPost) => void;
  isPublishingId: string | null;
  isDeletingId: string | null;
}

function formatDate(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

function StatusBadge({ status }: { status: BlogPost["status"] }) {
  if (status === "published") {
    return (
      <Badge variant="success">
        Published
      </Badge>
    );
  }
  return (
    <Badge variant="warning">
      Draft
    </Badge>
  );
}

export default function BlogListTable({
  blogs,
  onEdit,
  onDelete,
  onTogglePublish,
  isPublishingId,
  isDeletingId,
}: BlogListTableProps) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 md:block">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">Author</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">Created</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">Published</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {blogs.map((blog) => (
              <tr key={blog._id} className="align-top">
                <td className="max-w-xs px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">{blog.title}</td>
                <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">/{blog.slug}</td>
                <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{blog.author}</td>
                <td className="px-4 py-3 text-sm"><StatusBadge status={blog.status} /></td>
                <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{formatDate(blog.createdAt)}</td>
                <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{formatDate(blog.publishedAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => onEdit(blog._id)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={isPublishingId === blog._id}
                      onClick={() => onTogglePublish(blog)}
                    >
                      {isPublishingId === blog._id ? "Saving..." : blog.status === "published" ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      variant="danger"
                      disabled={isDeletingId === blog._id}
                      onClick={() => onDelete(blog)}
                    >
                      {isDeletingId === blog._id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {blogs.map((blog) => (
          <article key={blog._id} className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{blog.title}</h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">/{blog.slug}</p>
              </div>
              <StatusBadge status={blog.status} />
            </div>

            <dl className="mt-3 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between gap-3">
                <dt>Author</dt>
                <dd className="text-right">{blog.author}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Created</dt>
                <dd>{formatDate(blog.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Published</dt>
                <dd>{formatDate(blog.publishedAt)}</dd>
              </div>
            </dl>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Button variant="secondary" className="px-2" onClick={() => onEdit(blog._id)}>
                Edit
              </Button>
              <Button
                variant="ghost"
                className="px-2"
                disabled={isPublishingId === blog._id}
                onClick={() => onTogglePublish(blog)}
              >
                {isPublishingId === blog._id ? "Saving..." : blog.status === "published" ? "Unpublish" : "Publish"}
              </Button>
              <Button
                variant="danger"
                className="px-2"
                disabled={isDeletingId === blog._id}
                onClick={() => onDelete(blog)}
              >
                {isDeletingId === blog._id ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
