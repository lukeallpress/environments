import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/button";

export const metadata = { title: "Dashboard · AIEE Coalition Tracker" };

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ count: orgCount }, { count: contactCount }] = await Promise.all([
    supabase.from("organizations").select("*", { count: "exact", head: true }),
    supabase.from("contacts").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle="Phase 1: orgs and contacts CRUD is live. Events, interactions, and engagement coming next."
        actions={<LinkButton href="/orgs/new">+ New organization</LinkButton>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Organizations" value={orgCount ?? 0} href="/orgs" />
        <StatCard label="Contacts" value={contactCount ?? 0} href="/contacts" />
        <StatCard label="Engagement score" value="—" hint="Phase 4" />
      </div>

      <Card className="p-5">
        <h2 className="text-lg section-rule inline-block mb-3">What&apos;s next</h2>
        <ul className="text-sm space-y-2 text-ink-muted list-disc pl-5">
          <li>Phase 2 — Event series and attendance, with a mobile-first bulk check-in screen.</li>
          <li>Phase 3 — Interactions and the floating quick-add for after-meeting capture.</li>
          <li>Phase 4 — Engagement scoring, cooling/warming lists, trend charts.</li>
          <li>Phase 5 — Audit log viewer, tag management, polish.</li>
        </ul>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  hint,
}: {
  label: string;
  value: string | number;
  href?: string;
  hint?: string;
}) {
  const inner = (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="text-3xl font-serif text-nau-navy mt-1">{value}</p>
      {hint && <p className="text-xs text-ink-muted mt-1">{hint}</p>}
    </Card>
  );
  return href ? (
    <Link href={href} className="block hover:[&>div]:bg-nau-navy-50/40 transition">
      {inner}
    </Link>
  ) : (
    inner
  );
}
