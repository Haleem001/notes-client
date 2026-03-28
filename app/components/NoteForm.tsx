"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface NoteFormProps {
  initialTitle?: string;
  initialContent?: string;
  onSubmit: (data: { title: string; content: string }) => Promise<void>;
  submitLabel: string;
}

export default function NoteForm({
  initialTitle = "",
  initialContent = "",
  onSubmit,
  submitLabel,
}: NoteFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | undefined>();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setTitleError("Title is required");
      return;
    }
    setTitleError(undefined);
    setIsLoading(true);
    try {
      await onSubmit({ title: title.trim(), content: content.trim() });
    } catch (err) {
      const apiErr = err as { message?: string };
      setError(apiErr.message ?? "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {error && (
        <div className="error-banner" role="alert">{error}</div>
      )}

      {/* Title */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label htmlFor="note-title" className="field-label">Title</label>
        <input
          id="note-title"
          type="text"
          placeholder="Give your note a title…"
          value={title}
          autoFocus
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError) setTitleError(undefined);
          }}
          className={`field-input${titleError ? " error" : ""}`}
        />
        {titleError && (
          <p style={{ fontSize: "0.8125rem", color: "var(--color-error)", marginTop: 5 }}>{titleError}</p>
        )}
      </div>

      {/* Content */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label htmlFor="note-content" className="field-label">
          Content <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>(optional)</span>
        </label>
        <textarea
          id="note-content"
          placeholder="Write your note here…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="field-textarea"
        />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 4 }}>
        <button type="submit" disabled={isLoading} className="btn-primary" style={{ padding: "10px 20px" }}>
          {isLoading && <span className="spinner-sm" />}
          {submitLabel}
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => router.push("/notes")}
          className="btn-ghost"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
