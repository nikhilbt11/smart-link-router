"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import Skeleton from "@/components/ui/Skeleton";
import ErrorMessage from "@/components/ui/ErrorMessage";
import EmptyState from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import SummaryCards from "@/components/analytics/SummaryCards";
import TimeSeriesChart from "@/components/analytics/TimeSeriesChart";
import PlatformDistributionChart from "@/components/analytics/PlatformDistributionChart";
import TopLinksList from "@/components/analytics/TopLinksList";
import RecentEventsTable from "@/components/analytics/RecentEventsTable";
import AnalyticsFilters from "@/components/analytics/AnalyticsFilters";
import { ApiError } from "@/lib/api";
import { getLinks, type Link as LinkModel } from "@/lib/services/linkService";
import {
  getGlobalSummary,
  getLinkSummary,
  getLinkEvents,
  type GlobalSummary,
  type LinkSummary,
  type AnalyticsEvent,
  type Pagination,
} from "@/lib/services/analyticsService";

const ALL_LINKS = "all";

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoUtc(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

export default function AdminAnalyticsPage() {
  const router = useRouter();

  const [links, setLinks] = useState<LinkModel[]>([]);
  const [selectedLinkId, setSelectedLinkId] = useState(ALL_LINKS);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [summary, setSummary] = useState<GlobalSummary | LinkSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [eventsPagination, setEventsPagination] = useState<Pagination | null>(null);
  const [eventsPage, setEventsPage] = useState(1);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleUnauthorized = useCallback(
    (err: unknown): boolean => {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/login");
        return true;
      }
      return false;
    },
    [router]
  );

  const fetchSummary = useCallback(
    async (linkId: string, from: string, to: string) => {
      setIsLoadingSummary(true);
      setSummaryError(null);
      try {
        const params = { from: from || undefined, to: to || undefined };
        const data = linkId === ALL_LINKS ? await getGlobalSummary(params) : await getLinkSummary(linkId, params);
        setSummary(data);
      } catch (err) {
        if (handleUnauthorized(err)) return;
        setSummaryError(err instanceof ApiError ? err.message : "Failed to load analytics.");
      } finally {
        setIsLoadingSummary(false);
      }
    },
    [handleUnauthorized]
  );

  const fetchEvents = useCallback(
    async (linkId: string, from: string, to: string, page: number) => {
      if (linkId === ALL_LINKS) {
        setEvents([]);
        setEventsPagination(null);
        return;
      }
      setIsLoadingEvents(true);
      setEventsError(null);
      try {
        const data = await getLinkEvents(linkId, { page, from: from || undefined, to: to || undefined });
        setEvents(data.events);
        setEventsPagination(data.pagination);
      } catch (err) {
        if (handleUnauthorized(err)) return;
        setEventsError(err instanceof ApiError ? err.message : "Failed to load recent events.");
      } finally {
        setIsLoadingEvents(false);
      }
    },
    [handleUnauthorized]
  );

  useEffect(() => {
    // One-time load on mount (link list for the filter + default "All Links" summary).
    // Every subsequent load is triggered explicitly by a user action (select/quick-range/refresh),
    // never automatically, so this effect intentionally runs once and directly kicks off fetches.
    getLinks()
      .then(setLinks)
      .catch((err) => handleUnauthorized(err));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSummary(ALL_LINKS, "", "");
    fetchEvents(ALL_LINKS, "", "", 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSelectLink(linkId: string) {
    setSelectedLinkId(linkId);
    setEventsPage(1);
    fetchSummary(linkId, fromDate, toDate);
    fetchEvents(linkId, fromDate, toDate, 1);
  }

  function handleQuickRange(daysBack: number) {
    const nextFrom = daysAgoUtc(daysBack);
    const nextTo = todayUtc();
    setFromDate(nextFrom);
    setToDate(nextTo);
    setEventsPage(1);
    fetchSummary(selectedLinkId, nextFrom, nextTo);
    fetchEvents(selectedLinkId, nextFrom, nextTo, 1);
  }

  function handleClearDates() {
    setFromDate("");
    setToDate("");
    setEventsPage(1);
    fetchSummary(selectedLinkId, "", "");
    fetchEvents(selectedLinkId, "", "", 1);
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    await Promise.all([
      fetchSummary(selectedLinkId, fromDate, toDate),
      fetchEvents(selectedLinkId, fromDate, toDate, eventsPage),
    ]);
    setIsRefreshing(false);
  }

  function handleEventsPageChange(page: number) {
    setEventsPage(page);
    fetchEvents(selectedLinkId, fromDate, toDate, page);
  }

  const selectedLink = links.find((link) => link._id === selectedLinkId);
  const isAllLinks = selectedLinkId === ALL_LINKS;
  const topLinks = isAllLinks && summary && "topLinks" in summary ? summary.topLinks : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Analytics</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Monitor smart-link performance and traffic. Showing:{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {isAllLinks ? "All Links" : `Analytics for: ${selectedLink?.title || selectedLink?.alias || "…"}`}
          </span>
        </p>
      </div>

      <AnalyticsFilters
        links={links}
        selectedLinkId={selectedLinkId}
        onSelectLink={handleSelectLink}
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onQuickRange={handleQuickRange}
        onClearDates={handleClearDates}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {summaryError && <ErrorMessage message={summaryError} />}

      {isLoadingSummary ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        summary && <SummaryCards totalClicks={summary.totalClicks} platformDistribution={summary.platformDistribution} />
      )}

      {!isLoadingSummary && summary && summary.totalClicks === 0 && (
        <EmptyState
          title="No analytics data yet"
          description="Analytics will appear here once visitors use your smart links."
        />
      )}

      {!isLoadingSummary && summary && summary.totalClicks > 0 && (
        <>
          <Card>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Clicks Over Time</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{summary.totalClicks} total clicks</p>
            <div className="mt-4">
              <TimeSeriesChart data={summary.timeSeries} />
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Platform Distribution</h2>
            <div className="mt-4">
              <PlatformDistributionChart distribution={summary.platformDistribution} total={summary.totalClicks} />
            </div>
          </Card>

          {isAllLinks ? (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Top Links</h2>
                <NextLink href="/admin/links" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
                  Manage links →
                </NextLink>
              </div>
              <TopLinksList topLinks={topLinks} onSelectLink={handleSelectLink} />
            </div>
          ) : (
            <div>
              <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">Recent Events</h2>
              <RecentEventsTable
                events={events}
                pagination={eventsPagination}
                isLoading={isLoadingEvents}
                error={eventsError}
                onPageChange={handleEventsPageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
