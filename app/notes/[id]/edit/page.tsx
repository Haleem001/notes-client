"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/lib/auth-context";
import { getNotes, updateNote, type Note, type ApiError } from "@/app/lib/api";
import NoteForm from "@/app/components/NoteForm";

export default function EditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [noteId, setNoteId] = useState<string | null>(null);
  const [note, setNote] = useState<Note | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Resolve async params
  useEffect(() => {
    params.then(({ id }) => setNoteId(id));
  }, [params]);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.replace("/sign-in");
  }, [user, authLoading, router]);

  // Fetch note list and find matching note
  useEffect(() => {
    if (!noteId || authLoading || !user) return;
    setIsFetching(true);
    setFetchError(null);
    getNotes()
      .then((notes) => {
        const found = notes.find((n) => n._id === noteId);
        if (!found) setFetchError("Note not found.");
        else setNote(found);
      })
      .catch((err: ApiError) => {
        if (err.statusCode === 401) { logout(); router.replace("/sign-in"); }
        else setFetchError(err.message ?? "Failed to load note.");
      })
      .finally(() => setIsFetching(false));
  }, [noteId, authLoading, user, logout, router]);

  async function handleUpdate(data: { title: string; content: string }) {
    if (!noteId) return;
    await updateNote(noteId, { title: data.title, content: data.content || undefined });
    router.push("/notes");
  }

  // Full-page loading
  if (authLoading || (isFetching && !fetchError)) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return null;

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
              Edit note
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1 }}>
        <div className="page-container" style={{ maxWidth: 640 }}>
          {fetchError ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="error-banner" role="alert">{fetchError}</div>
              <Link
                href="/notes"
                style={{ fontSize: "0.875rem", color: "var(--color-mint-dark)", textDecoration: "none" }}
              >
                ← Back to notes
              </Link>
            </div>
          ) : note ? (
            <NoteForm
              initialTitle={note.title}
              initialContent={note.content ?? ""}
              onSubmit={handleUpdate}
              submitLabel="Save changes"
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}
