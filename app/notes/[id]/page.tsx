"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/lib/auth-context";
import { getNotes, deleteNote, type Note, type ApiError } from "@/app/lib/api";

export default function NoteViewPage({
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Resolve async params
  useEffect(() => {
    params.then(({ id }) => setNoteId(id));
  }, [params]);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.replace("/sign-in");
  }, [user, authLoading, router]);

  // Fetch note
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
        if (err.statusCode === 401) {
          logout();
          router.replace("/sign-in");
        } else {
          setFetchError(err.message ?? "Failed to load note.");
        }
      })
      .finally(() => setIsFetching(false));
  }, [noteId, authLoading, user, logout, router]);

  async function handleDelete() {
    if (!noteId) return;
    setIsDeleting(true);
    try {
      await deleteNote(noteId);
      router.push("/notes");
    } catch {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  // Format dates
  function formatDate(iso: string) {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  }

  // Loading
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

      {/* ── Nav ── */}
      <header className="app-nav">
        <div className="app-nav-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/notes" aria-label="Back to notes" className="btn-icon" style={{ marginLeft: -4 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--color-text)" }}>
              Note
            </span>
          </div>

          {/* Actions — only shown when note loaded */}
          {note && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Link
                href={`/notes/${noteId}/edit`}
                className="btn-ghost"
                style={{ padding: "7px 14px", fontSize: "0.8125rem", textDecoration: "none" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </Link>
              <button
                className="btn-ghost"
                onClick={() => setShowDeleteConfirm(true)}
                style={{ padding: "7px 14px", fontSize: "0.8125rem", color: "var(--color-error)", borderColor: "rgba(192,57,43,0.25)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{ flex: 1 }}>
        <div className="page-container" style={{ maxWidth: 680 }}>

          {fetchError ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="error-banner" role="alert">{fetchError}</div>
              <Link href="/notes" style={{ fontSize: "0.875rem", color: "var(--color-mint-dark)", textDecoration: "none" }}>
                ← Back to notes
              </Link>
            </div>
          ) : note ? (
            <div
              style={{
                background: "#fff",
                border: "1.5px solid var(--color-border)",
                borderRadius: 20,
                padding: "36px 40px",
                boxShadow: "0 2px 12px rgba(45,58,53,0.07), 0 6px 28px rgba(123,191,156,0.09)",
              }}
            >
              {/* Title */}
              <h1
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  color: "var(--color-text)",
                  lineHeight: 1.3,
                  letterSpacing: "-0.02em",
                  marginBottom: 12,
                }}
              >
                {note.title}
              </h1>

              {/* Meta */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px 20px",
                  marginBottom: note.content ? 28 : 0,
                  paddingBottom: note.content ? 20 : 0,
                  borderBottom: note.content ? "1px solid var(--color-border)" : "none",
                }}
              >
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Created {formatDate(note.createdAt)}
                </span>
                {note.updatedAt !== note.createdAt && (
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edited {formatDate(note.updatedAt)}
                  </span>
                )}
              </div>

              {/* Body */}
              {note.content ? (
                <div
                  style={{
                    fontSize: "1rem",
                    color: "var(--color-text)",
                    lineHeight: 1.75,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {note.content}
                </div>
              ) : (
                <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>
                  No content — this note is title-only.
                </p>
              )}
            </div>
          ) : null}
        </div>
      </main>

      {/* ── Delete confirmation modal ── */}
      {showDeleteConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(30,45,39,0.35)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 20,
          }}
          onClick={() => !isDeleting && setShowDeleteConfirm(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "28px 28px 24px",
              maxWidth: 360,
              width: "100%",
              boxShadow: "0 8px 40px rgba(45,58,53,0.18)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-dialog-title" style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-text)", marginBottom: 8 }}>
              Delete this note?
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: 1.55, marginBottom: 24 }}>
              <strong style={{ color: "var(--color-text)" }}>&ldquo;{note?.title}&rdquo;</strong> will be permanently deleted. This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                className="btn-ghost"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  borderRadius: 10,
                  padding: "9px 16px",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "#fff",
                  border: "none",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  background: "linear-gradient(135deg, #e05252 0%, #c0392b 100%)",
                  boxShadow: "0 2px 8px rgba(192,57,43,0.30)",
                  opacity: isDeleting ? 0.65 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {isDeleting && <span className="spinner-sm" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
