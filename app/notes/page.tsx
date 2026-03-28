"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/lib/auth-context";
import { getNotes, deleteNote, type Note, type ApiError } from "@/app/lib/api";

// ── Skeleton loader ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      style={{
        background: "#fff",
        border: "1.5px solid var(--color-border)",
        borderRadius: 16,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div className="skeleton" style={{ height: 16, width: "70%" }} />
      <div className="skeleton" style={{ height: 13, width: "100%" }} />
      <div className="skeleton" style={{ height: 13, width: "80%" }} />
      <div className="skeleton" style={{ height: 11, width: "35%", marginTop: 4 }} />
    </div>
  );
}

// ── Note card ────────────────────────────────────────────────────────────────

function NoteCard({
  note,
  onDelete,
  isDeleting,
}: {
  note: Note;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const date = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(note.updatedAt));

  return (
    <article
      className="note-card"
      style={{
        opacity: isDeleting ? 0.45 : 1,
        pointerEvents: isDeleting ? "none" : undefined,
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* Clickable body → note view */}
      <Link
        href={`/notes/${note._id}`}
        style={{ display: "block", padding: "18px 18px 0", textDecoration: "none" }}
      >
        <h2
          style={{
            fontSize: "0.9375rem",
            fontWeight: 600,
            color: "var(--color-text)",
            lineHeight: 1.4,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            marginBottom: note.content ? 8 : 0,
          }}
        >
          {note.title}
        </h2>
        {note.content && (
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--color-text-muted)",
              lineHeight: 1.6,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {note.content}
          </p>
        )}
      </Link>

      {/* Footer: date + action buttons */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px 12px 18px" }}>
        <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
          {date}
        </p>
        {/* Stop propagation so clicks don't navigate */}
        <div
          className="note-card-actions"
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            href={`/notes/${note._id}/edit`}
            aria-label={`Edit "${note.title}"`}
            className="btn-icon"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </Link>
          <button
            onClick={() => onDelete(note._id)}
            aria-label={`Delete "${note.title}"`}
            className="btn-icon danger"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "72px 20px", gap: 16, textAlign: "center" }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: "var(--color-mint-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--color-mint-dark)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 12h6M9 16h6M7 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2h-2M9 3h6a1 1 0 110 2H9a1 1 0 010-2z" />
        </svg>
      </div>
      <div>
        <p style={{ fontWeight: 600, color: "var(--color-text)", fontSize: "1rem" }}>
          No notes yet
        </p>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: 4 }}>
          Create your first note to get started.
        </p>
      </div>
      <button onClick={onNew} className="btn-primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Create a note
      </button>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export default function NotesPage() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) router.replace("/sign-in");
  }, [user, authLoading, router]);

  const fetchNotes = useCallback(async () => {
    setIsFetching(true);
    setFetchError(null);
    try {
      const data = await getNotes();
      setNotes(data);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.statusCode === 401) {
        logout();
        router.replace("/sign-in");
      } else {
        setFetchError(apiErr.message ?? "Failed to load notes.");
      }
    } finally {
      setIsFetching(false);
    }
  }, [logout, router]);

  useEffect(() => {
    if (!authLoading && user) fetchNotes();
  }, [authLoading, user, fetchNotes]);

  async function handleDelete(id: string) {
    setNotes((prev) => prev.filter((n) => n._id !== id));
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await deleteNote(id);
    } catch {
      fetchNotes(); // rollback
    } finally {
      setDeletingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
  }

  // Full-page spinner while auth resolves
  if (authLoading) {
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
          <div className="nav-brand">
            <div className="nav-logo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 12h6M9 16h6M7 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2h-2M9 3h6a1 1 0 110 2H9a1 1 0 010-2z" />
              </svg>
            </div>
            <span className="nav-logo-text">Notes</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", display: "none" }} className="sm:block">
              {user.name}
            </span>
            <button
              className="btn-ghost"
              onClick={() => { logout(); router.push("/sign-in"); }}
              style={{ padding: "7px 14px", fontSize: "0.8125rem" }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ flex: 1 }}>
        <div className="page-container">

          {/* Title row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text)" }}>
                My Notes
              </h1>
              {!isFetching && notes.length > 0 && (
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: 2 }}>
                  {notes.length} {notes.length === 1 ? "note" : "notes"}
                </p>
              )}
            </div>
            <Link href="/notes/new">
              <button className="btn-primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New note
              </button>
            </Link>
          </div>

          {/* Error */}
          {fetchError && (
            <div style={{ marginBottom: 20 }}>
              <div className="error-banner" role="alert">{fetchError}</div>
              <button
                onClick={fetchNotes}
                style={{ marginTop: 8, fontSize: "0.875rem", color: "var(--color-mint-dark)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Skeleton */}
          {isFetching && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Empty */}
          {!isFetching && !fetchError && notes.length === 0 && (
            <EmptyState onNew={() => router.push("/notes/new")} />
          )}

          {/* Grid */}
          {!isFetching && notes.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {notes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onDelete={handleDelete}
                  isDeleting={deletingIds.has(note._id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
