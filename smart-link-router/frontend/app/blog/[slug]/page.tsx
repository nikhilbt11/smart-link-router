import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import FeaturedImage from "@/components/blogs/FeaturedImage";
import MarkdownRenderer from "@/components/blogs/MarkdownRenderer";
import { ApiError } from "@/lib/api";
import { getPublishedBlogBySlug } from "@/lib/services/blogService";

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

const getPostBySlugCached = cache(async (slug: string) => {
  return getPublishedBlogBySlug(slug);
});

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;

  try {
    const post = await getPostBySlugCached(slug);
    const description = toPlainExcerpt(post.content);

    return {
      title: `${post.title} | Smart Link Router Blog`,
      description,
      openGraph: {
        title: post.title,
        description,
        type: "article",
        images: post.featuredImage ? [{ url: post.featuredImage }] : undefined,
      },
    };
  } catch {
    return {
      title: "Blog Post | Smart Link Router",
      description: "Read the latest Smart Link Router blog post.",
    };
  }
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;

  let post;
  try {
    post = await getPostBySlugCached(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <Link href="/blog" className="inline-block text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100">
        ← Back to Blog
      </Link>

      <article className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-950">
        <header>
          <h1 className="text-3xl font-semibold leading-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">{post.title}</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            By {post.author}
            {post.publishedAt ? ` • ${formatDate(post.publishedAt)}` : ""}
          </p>
        </header>

        <div className="mt-6">
          <FeaturedImage
            src={post.featuredImage}
            alt={post.title}
            className="h-56 w-full sm:h-80"
            placeholderClassName="h-56 w-full sm:h-80"
          />
        </div>

        <div className="mt-8">
          <MarkdownRenderer content={post.content} />
        </div>
      </article>
    </div>
  );
}
