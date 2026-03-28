"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/lib/auth-context";
import { createNote } from "@/app/lib/api";
import NoteForm from "@/app/components/NoteForm";

export default function NewNotePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/sign-in");
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
      </div>
    );
  }

  async function handleCreate(data: { title: string; content: string }) {
    await createNote({ title: data.title, content: data.content || undefined });
    router.push("/notes");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--color-cream)" }}>

      {/* Nav */}
      <header className="app-nav">
        <div className="app-nav-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link
              href="/notes"
              aria-label="Back to notes"
              className="btn-icon"
              style={{ marginLeft: -4 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--color-text)" }}>
              New note
            </span>
          </div>
        </div>
      </header>

      {/* Form */}
      <main style={{ flex: 1 }}>
        <div className="page-container" style={{ maxWidth: 640 }}>
          <NoteForm onSubmit={handleCreate} submitLabel="Create note" />
        </div>
      </main>
    </div>
  );
}
