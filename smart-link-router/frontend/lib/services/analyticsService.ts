import { api } from "@/lib/api";

export interface PlatformDistribution {
  iOS: number;
  Android: number;
  Desktop: number;
  Other: number;
}

export interface TimeSeriesPoint {
  date: string;
  clicks: number;
}

export interface TopLink {
  linkId: string;
  alias: string;
  title?: string;
  clicks: number;
}

export interface GlobalSummary {
  totalClicks: number;
  platformDistribution: PlatformDistribution;
  timeSeries: TimeSeriesPoint[];
  topLinks: TopLink[];
}

export interface LinkSummary {
  totalClicks: number;
  platformDistribution: PlatformDistribution;
  timeSeries: TimeSeriesPoint[];
}

export interface AnalyticsEvent {
  _id: string;
  timestamp: string;
  platform: string;
  deviceType?: string | null;
  browser?: string | null;
  country?: string | null;
  referrer?: string | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface LinkEventsResult {
  events: AnalyticsEvent[];
  pagination: Pagination;
}

export interface DateRangeParams {
  from?: string;
  to?: string;
}

function toQueryString(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string | number] => entry[1] !== undefined && entry[1] !== ""
  );
  if (entries.length === 0) return "";
  const search = new URLSearchParams(entries.map(([key, value]) => [key, String(value)]));
  return `?${search.toString()}`;
}

export function getGlobalSummary(params: DateRangeParams = {}): Promise<GlobalSummary> {
  return api.get<GlobalSummary>(`/api/analytics/summary${toQueryString({ ...params })}`);
}

export function getLinkSummary(linkId: string, params: DateRangeParams = {}): Promise<LinkSummary> {
  return api.get<LinkSummary>(`/api/analytics/summary/${linkId}${toQueryString({ ...params })}`);
}

export function getLinkEvents(
  linkId: string,
  params: DateRangeParams & { page?: number; limit?: number } = {}
): Promise<LinkEventsResult> {
  return api.get<LinkEventsResult>(`/api/analytics/${linkId}${toQueryString({ ...params })}`);
}
