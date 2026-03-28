"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth-context";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      router.replace("/notes");
    } else {
      router.replace("/sign-in");
    }
  }, [user, isLoading, router]);

  // Show a centered spinner while deciding where to go
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-cream)]">
      <div className="w-8 h-8 border-4 border-[var(--color-mint)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
