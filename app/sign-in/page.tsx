"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth-context";
import type { ApiError } from "@/app/lib/api";

export default function SignInPage() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  function validate() {
    const errs: typeof fieldErrors = {};
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    return errs;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setIsLoading(true);
    try {
      await signIn(email, password);
      router.push("/notes");
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message ?? "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "var(--color-cream)" }}
    >
      <div className="w-full" style={{ maxWidth: 400 }}>

        {/* Brand header */}
        <div className="flex flex-col items-center gap-4 text-center mb-7">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #a8d5ba 0%, #5da87e 100%)" }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 12h6M9 16h6M7 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2h-2M9 3h6a1 1 0 110 2H9a1 1 0 010-2z"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h1
              className="text-[1.6rem] font-bold tracking-tight"
              style={{ color: "var(--color-text)" }}
            >
              Welcome back
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Sign in to access your notes
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="auth-card">
          {/* Server/API error */}
          {error && (
            <div
              role="alert"
              className="rounded-xl px-4 py-3 text-sm mb-5"
              style={{
                background: "var(--color-error-bg)",
                border: "1px solid rgba(192,57,43,0.25)",
                color: "var(--color-error)",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="signin-email"
                className="text-sm font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                Email
              </label>
              <input
                id="signin-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((p) => ({ ...p, email: undefined }));
                }}
                className={`auth-input${fieldErrors.email ? " error" : ""}`}
              />
              {fieldErrors.email && (
                <p className="text-xs" style={{ color: "var(--color-error)" }}>
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="signin-password"
                className="text-sm font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                Password
              </label>
              <input
                id="signin-password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((p) => ({ ...p, password: undefined }));
                }}
                className={`auth-input${fieldErrors.password ? " error" : ""}`}
              />
              {fieldErrors.password && (
                <p className="text-xs" style={{ color: "var(--color-error)" }}>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading} className="auth-btn mt-1">
              {isLoading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Sign in
            </button>
          </form>
        </div>

        {/* Footer */}
        <p
          className="mt-6 text-center text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-semibold hover:underline"
            style={{ color: "var(--color-mint-dark)" }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
