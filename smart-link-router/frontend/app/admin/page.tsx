"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import Card from "@/components/ui/Card";

const SECTIONS = [
  { href: "/admin/links", title: "Links", description: "Create and manage smart links." },
  { href: "/admin/analytics", title: "Analytics", description: "Review click activity per link." },
  { href: "/admin/blogs", title: "Blogs", description: "Write, edit, and publish posts." },
];

export default function AdminHomePage() {
  const { admin } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Signed in as <span className="font-medium text-zinc-700 dark:text-zinc-300">{admin?.email}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="h-full transition-colors hover:border-zinc-400 dark:hover:border-zinc-600">
              <h2 className="font-medium text-zinc-900 dark:text-zinc-50">{section.title}</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{section.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
