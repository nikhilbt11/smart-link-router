import { api } from "@/lib/api";

export interface Link {
  _id: string;
  alias: string;
  iosUrl: string;
  androidUrl: string;
  desktopUrl: string;
  title?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LinkInput {
  alias: string;
  iosUrl: string;
  androidUrl: string;
  desktopUrl: string;
  title?: string;
  isActive?: boolean;
}

export function getLinks(): Promise<Link[]> {
  return api.get<Link[]>("/api/links");
}

export function getLink(id: string): Promise<Link> {
  return api.get<Link>(`/api/links/${id}`);
}

export function createLink(data: LinkInput): Promise<Link> {
  return api.post<Link>("/api/links", data);
}

export function updateLink(id: string, data: Partial<LinkInput>): Promise<Link> {
  return api.put<Link>(`/api/links/${id}`, data);
}

export function deleteLink(id: string): Promise<null> {
  return api.delete<null>(`/api/links/${id}`);
}
