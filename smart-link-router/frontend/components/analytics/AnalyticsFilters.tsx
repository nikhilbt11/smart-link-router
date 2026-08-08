"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Link } from "@/lib/services/linkService";

interface AnalyticsFiltersProps {
  links: Link[];
  selectedLinkId: string;
  onSelectLink: (linkId: string) => void;
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onQuickRange: (daysBack: number) => void;
  onClearDates: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function AnalyticsFilters({
  links,
  selectedLinkId,
  onSelectLink,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onQuickRange,
  onClearDates,
  onRefresh,
  isRefreshing,
}: AnalyticsFiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4 sm:flex-row sm:flex-wrap sm:items-end dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col gap-1">
        <label htmlFor="analytics-link-filter" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Link
        </label>
        <select
          id="analytics-link-filter"
          value={selectedLinkId}
          onChange={(event) => onSelectLink(event.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        >
          <option value="all">All Links</option>
          {links.map((link) => (
            <option key={link._id} value={link._id}>
              {link.title || link.alias}
            </option>
          ))}
        </select>
      </div>

      <Input label="From" type="date" value={fromDate} onChange={(event) => onFromDateChange(event.target.value)} />
      <Input label="To" type="date" value={toDate} onChange={(event) => onToDateChange(event.target.value)} />

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={() => onQuickRange(0)}>
          Today
        </Button>
        <Button type="button" variant="secondary" onClick={() => onQuickRange(6)}>
          Last 7 days
        </Button>
        <Button type="button" variant="secondary" onClick={() => onQuickRange(29)}>
          Last 30 days
        </Button>
        <Button type="button" variant="secondary" onClick={onClearDates}>
          Clear
        </Button>
      </div>

      <Button type="button" onClick={onRefresh} disabled={isRefreshing} className="sm:ml-auto">
        {isRefreshing ? "Refreshing..." : "Refresh"}
      </Button>
    </div>
  );
}
