import { LoginForm } from "./login-form";
import { BrandMark } from "@/components/brand-mark";

export const metadata = { title: "Sign in · AIEE Coalition Tracker" };

export default function LoginPage() {
  return (
    <main className="flex-1 grid place-items-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center">
          <BrandMark size="lg" />
        </div>
        <div className="bg-surface border border-border rounded-xl shadow-sm p-8">
          <h1 className="text-2xl section-rule mb-6">Sign in</h1>
          <p className="text-ink-muted text-sm mb-6">
            Enter your AIEE staff email. We&apos;ll send you a one-time sign-in link.
          </p>
          <LoginForm />
        </div>
        <p className="text-xs text-ink-muted mt-4 text-center">
          Sign-in is restricted to allowlisted AIEE staff emails.
        </p>
      </div>
    </main>
  );
}
