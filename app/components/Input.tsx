"use client";

import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  id: string;
}

export default function Input({
  label,
  error,
  id,
  className = "",
  ...rest
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-[var(--color-text)]"
      >
        {label}
      </label>
      <input
        id={id}
        {...rest}
        className={`
          w-full rounded-xl border px-4 py-2.5 text-sm bg-[var(--color-cream)] text-[var(--color-text)]
          placeholder:text-[var(--color-text-muted)]
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
