import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-2xl py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          Smart Link Router
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          Create one short link per app or campaign, and send every visitor to the right
          destination automatically &mdash; the App Store on iOS, Google Play on Android, and
          your website everywhere else.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/blog"
            className="inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 sm:w-auto dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Read the Blog
          </Link>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-md bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 sm:w-auto dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
