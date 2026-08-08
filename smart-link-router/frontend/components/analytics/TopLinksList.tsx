"use client";

import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { API_BASE_URL } from "@/lib/api";
import type { TopLink } from "@/lib/services/analyticsService";

interface TopLinksListProps {
  topLinks: TopLink[];
  onSelectLink: (linkId: string) => void;
}

export default function TopLinksList({ topLinks, onSelectLink }: TopLinksListProps) {
  if (topLinks.length === 0) {
    return (
      <EmptyState
        title="No link activity yet"
        description="Top-performing links will appear here once clicks are recorded."
      />
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {topLinks.map((link, index) => {
          const smartUrl = `${API_BASE_URL}/l/${link.alias}`;
          return (
            <li key={link.linkId} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => onSelectLink(link.linkId)}
                  className="truncate text-left text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                >
                  {index + 1}. {link.title || link.alias}
                </button>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400" title={smartUrl}>
                  {smartUrl}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                {link.clicks} clicks
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
