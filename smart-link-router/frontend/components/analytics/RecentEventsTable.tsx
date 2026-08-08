"use client";

import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Button from "@/components/ui/Button";
import type { AnalyticsEvent, Pagination } from "@/lib/services/analyticsService";

interface RecentEventsTableProps {
  events: AnalyticsEvent[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
}

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RecentEventsTable({
  events,
  pagination,
  isLoading,
  error,
  onPageChange,
}: RecentEventsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) return <ErrorMessage message={error} />;

  if (events.length === 0) {
    return <EmptyState title="No recent events" description="Clicks on this link will show up here." />;
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Time</th>
              <th scope="col" className="px-4 py-3 font-medium">Platform</th>
              <th scope="col" className="px-4 py-3 font-medium">Device</th>
              <th scope="col" className="px-4 py-3 font-medium">Browser</th>
              <th scope="col" className="px-4 py-3 font-medium">Country</th>
              <th scope="col" className="px-4 py-3 font-medium">Referrer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {events.map((event) => (
              <tr key={event._id}>
                <td className="px-4 py-3 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                  {formatTimestamp(event.timestamp)}
                </td>
                <td className="px-4 py-3">{event.platform}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{event.deviceType ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{event.browser ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{event.country ?? "Unknown"}</td>
                <td
                  className="max-w-40 truncate px-4 py-3 text-zinc-600 dark:text-zinc-400"
                  title={event.referrer ?? undefined}
                >
                  {event.referrer ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="mt-3 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={pagination.page >= pagination.pages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
