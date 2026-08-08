"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function CopySmartLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      if (!navigator?.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can fail (permissions, insecure context, etc.) —
      // fail silently rather than crash the page.
      setCopied(false);
    }
  }

  return (
    <Button type="button" variant="secondary" onClick={handleCopy} aria-label={`Copy smart link ${url}`}>
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
}
