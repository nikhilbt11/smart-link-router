"use client";

import { useState } from "react";

interface FeaturedImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  placeholderClassName?: string;
}

export default function FeaturedImage({
  src,
  alt,
  className = "",
  placeholderClassName = "",
}: FeaturedImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`grid place-items-center rounded-md bg-zinc-100 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400 ${placeholderClassName}`}
      >
        No Image
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`rounded-md object-cover ${className}`}
      loading="lazy"
    />
  );
}
