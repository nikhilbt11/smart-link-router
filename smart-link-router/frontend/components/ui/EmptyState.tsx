import type { ReactNode } from "react";

export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-zinc-300 py-12 text-center dark:border-zinc-700">
      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{title}</p>
        {description && <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}
