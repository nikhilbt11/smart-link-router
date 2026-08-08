import Link from "next/link";

export default function BlogPostNotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 text-center sm:px-6">
      <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">404</p>
      <h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">Post not found</h1>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        The blog post you are looking for is unavailable.
      </p>
      <Link
        href="/blog"
        className="mt-6 inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Back to Blog
      </Link>
    </div>
  );
}
