"use client";

interface ErrorAlertProps {
  message: string;
}

export default function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-[var(--color-error)]/30 bg-[var(--color-error-bg)] px-4 py-3 text-sm text-[var(--color-error)]"
    >
      {message}
    </div>
  );
}
