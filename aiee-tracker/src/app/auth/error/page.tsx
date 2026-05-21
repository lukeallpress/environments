import Link from "next/link";

const REASONS: Record<string, string> = {
  missing_code: "The sign-in link was missing required info. Try requesting a new one.",
  no_user: "We couldn't verify your account. Try requesting a new sign-in link.",
  not_allowlisted:
    "That email isn't on the AIEE staff allowlist. If you should have access, ask an admin to add you.",
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const message =
    (reason && REASONS[reason]) ||
    reason ||
    "Something went wrong signing you in.";

  return (
    <main className="flex-1 grid place-items-center px-4 py-16">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-sm p-8 text-center">
        <h1 className="text-2xl section-rule mb-6">Sign-in problem</h1>
        <p className="text-ink-muted mb-6">{message}</p>
        <Link
          href="/login"
          className="inline-block rounded-md bg-nau-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-nau-navy-700"
        >
          Back to sign-in
        </Link>
      </div>
    </main>
  );
}
