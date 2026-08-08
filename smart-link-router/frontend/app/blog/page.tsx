import type { Metadata } from "next";
import Link from "next/link";
import FeaturedImage from "@/components/blogs/FeaturedImage";
import { getPublishedBlogs, type BlogPost } from "@/lib/services/blogService";

function toPlainExcerpt(markdown: string, maxLength = 160): string {
  const cleaned = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[#>*_~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength).trim()}...`;
}

function formatDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

export const metadata: Metadata = {
  title: "Blog | Smart Link Router",
  description: "Insights, updates and articles about smart links and analytics.",
  openGraph: {
    title: "Blog | Smart Link Router",
    description: "Insights, updates and articles about smart links and analytics.",
    type: "website",
  },
};

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
    >
      <FeaturedImage
        src={post.featuredImage}
        alt={post.title}
        className="h-48 w-full"
        placeholderClassName="h-48 w-full"
      />
      <div className="space-y-3 p-5">
        <div>
          <h2 className="line-clamp-2 text-lg font-semibold text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-50 dark:group-hover:text-zinc-200">
            {post.title}
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            By {post.author}
            {post.publishedAt ? ` • ${formatDate(post.publishedAt)}` : ""}
          </p>
        </div>
        <p className="line-clamp-3 text-sm text-zinc-600 dark:text-zinc-300">{toPlainExcerpt(post.content)}</p>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Read More →</p>
      </div>
    </Link>
  );
}

export default async function BlogIndexPage() {
  const result = await getPublishedBlogs({ page: 1, limit: 50 });
  const posts = result.posts;

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Blog</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-900 sm:text-4xl dark:text-zinc-50">Insights, updates and articles.</h1>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No published posts yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
