"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
