import { api } from "@/lib/api";

export type BlogStatus = "draft" | "published";

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  author: string;
  content: string;
  status: BlogStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface BlogListResponse {
  posts: BlogPost[];
  pagination: Pagination;
}

export interface BlogWriteInput {
  title: string;
  slug?: string;
  featuredImage?: string;
  author: string;
  content: string;
  status?: BlogStatus;
}

interface ListOptions {
  page?: number;
  limit?: number;
}

function toQueryString(options?: ListOptions): string {
  if (!options) return "";

  const params = new URLSearchParams();
  if (options.page !== undefined) params.set("page", String(options.page));
  if (options.limit !== undefined) params.set("limit", String(options.limit));

  return params.toString() ? `?${params.toString()}` : "";
}

export function getBlogs(options?: ListOptions): Promise<BlogListResponse> {
  return api.get<BlogListResponse>(`/api/blogs${toQueryString(options)}`);
}

export function getBlog(id: string): Promise<BlogPost> {
  return api.get<BlogPost>(`/api/blogs/${id}`);
}

export function createBlog(data: BlogWriteInput): Promise<BlogPost> {
  return api.post<BlogPost>("/api/blogs", data);
}

export function updateBlog(id: string, data: Partial<BlogWriteInput>): Promise<BlogPost> {
  return api.put<BlogPost>(`/api/blogs/${id}`, data);
}

export function deleteBlog(id: string): Promise<null> {
  return api.delete<null>(`/api/blogs/${id}`);
}

export function getPublishedBlogs(options?: ListOptions): Promise<BlogListResponse> {
  return api.get<BlogListResponse>(`/api/blogs/published${toQueryString(options)}`);
}

export function getPublishedBlogBySlug(slug: string): Promise<BlogPost> {
  return api.get<BlogPost>(`/api/blogs/slug/${encodeURIComponent(slug)}`);
}
