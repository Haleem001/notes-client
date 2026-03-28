"use client";

import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  id: string;
}

export default function Textarea({
  label,
  error,
  id,
  className = "",
  ...rest
}: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-[var(--color-text)]"
      >
        {label}
      </label>
      <textarea
        id={id}
        {...rest}
        className={`
          w-full rounded-xl border px-4 py-2.5 text-sm bg-[var(--color-cream)] text-[var(--color-text)]
          placeholder:text-[var(--color-text-muted)] resize-none
          outline-none transition-all duration-200
          ${
            error
              ? "border-[var(--color-error)] focus:ring-2 focus:ring-[var(--color-error)]/40"
              : "border-[var(--color-border)] focus:border-[var(--color-mint-dark)] focus:ring-2 focus:ring-[var(--color-mint-dark)]/30"
          }
          ${className}
        `}
      />
      {error && (
        <p className="text-xs text-[var(--color-error)] mt-0.5">{error}</p>
      )}
    </div>
  );
}
