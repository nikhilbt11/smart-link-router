"use client";

import { useMemo } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import CopySmartLinkButton from "@/components/links/CopySmartLinkButton";
import { API_BASE_URL } from "@/lib/api";
import type { Link } from "@/lib/services/linkService";

interface LinkTableProps {
  links: Link[];
  onEdit: (link: Link) => void;
  onDelete: (link: Link) => void;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function TruncatedUrl({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={url}
      className="block max-w-45 truncate text-sm text-zinc-600 hover:underline dark:text-zinc-400"
    >
      {url}
    </a>
  );
}

export default function LinkTable({ links, onEdit, onDelete }: LinkTableProps) {
  const rows = useMemo(
    () => links.map((link) => ({ ...link, smartUrl: `${API_BASE_URL}/l/${link.alias}` })),
    [links]
  );

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto rounded-lg border border-zinc-200 md:block dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Smart Link</th>
              <th scope="col" className="px-4 py-3 font-medium">iOS</th>
              <th scope="col" className="px-4 py-3 font-medium">Android</th>
              <th scope="col" className="px-4 py-3 font-medium">Desktop</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 font-medium">Created</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map((link) => (
              <tr key={link._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-900 dark:text-zinc-50">{link.title || link.alias}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <a
                      href={link.smartUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={link.smartUrl}
                      className="max-w-40 truncate text-xs text-zinc-500 hover:underline dark:text-zinc-400"
                    >
                      {link.smartUrl}
                    </a>
                    <CopySmartLinkButton url={link.smartUrl} />
                  </div>
                </td>
                <td className="px-4 py-3"><TruncatedUrl url={link.iosUrl} /></td>
                <td className="px-4 py-3"><TruncatedUrl url={link.androidUrl} /></td>
                <td className="px-4 py-3"><TruncatedUrl url={link.desktopUrl} /></td>
                <td className="px-4 py-3">
                  <Badge variant={link.isActive ? "success" : "neutral"}>
                    {link.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                  {formatDate(link.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => onEdit(link)} aria-label={`Edit ${link.alias}`}>
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => onDelete(link)} aria-label={`Delete ${link.alias}`}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {rows.map((link) => (
          <div
            key={link._id}
            className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium text-zinc-900 dark:text-zinc-50">{link.title || link.alias}</div>
                <a
                  href={link.smartUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.smartUrl}
                  className="mt-0.5 block truncate text-xs text-zinc-500 hover:underline dark:text-zinc-400"
                >
                  {link.smartUrl}
                </a>
              </div>
              <Badge variant={link.isActive ? "success" : "neutral"}>
                {link.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <dl className="mt-3 space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 font-medium">iOS</dt>
                <dd className="truncate" title={link.iosUrl}>{link.iosUrl}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 font-medium">Android</dt>
                <dd className="truncate" title={link.androidUrl}>{link.androidUrl}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 font-medium">Desktop</dt>
                <dd className="truncate" title={link.desktopUrl}>{link.desktopUrl}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 font-medium">Created</dt>
                <dd>{formatDate(link.createdAt)}</dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
              <CopySmartLinkButton url={link.smartUrl} />
              <Button variant="secondary" onClick={() => onEdit(link)} aria-label={`Edit ${link.alias}`}>
                Edit
              </Button>
              <Button variant="danger" onClick={() => onDelete(link)} aria-label={`Delete ${link.alias}`}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
