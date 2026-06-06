"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setStatus("error");
      setError(error.message);
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-md bg-nau-navy-50 border border-nau-navy/20 p-4 text-sm">
        <p className="font-medium text-nau-navy">Check your inbox.</p>
        <p className="text-ink-muted mt-1">
          We sent a sign-in link to <span className="font-medium">{email}</span>. It will
          expire in an hour.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-nau-gold focus:border-nau-navy"
          placeholder="you@nau.edu"
        />
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-md bg-nau-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-nau-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nau-gold disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {status === "sending" ? "Sending link…" : "Send sign-in link"}
      </button>
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
