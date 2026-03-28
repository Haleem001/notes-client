"use client";

import type { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  isLoading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  isLoading,
  disabled,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none";

  const variants = {
    primary:
      "bg-[var(--color-mint-dark)] text-white hover:bg-[var(--color-mint)] focus-visible:ring-[var(--color-mint-dark)] active:scale-[0.98]",
    ghost:
      "bg-transparent text-[var(--color-mint-dark)] hover:bg-[var(--color-mint-subtle)] focus-visible:ring-[var(--color-mint-dark)] active:scale-[0.98]",
    danger:
      "bg-transparent text-[var(--color-error)] hover:bg-[var(--color-error-bg)] focus-visible:ring-[var(--color-error)] active:scale-[0.98]",
  };

  return (
    <button
      {...rest}
      disabled={disabled || isLoading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
