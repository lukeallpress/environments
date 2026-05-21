export const metadata = { title: "Dashboard · AIEE Coalition Tracker" };

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl section-rule inline-block">Dashboard</h1>
        <p className="text-ink-muted mt-3 text-sm">
          Phase 0 scaffold. Real widgets land in later phases.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <PlaceholderCard title="Cooling orgs" body="Coming in Phase 4 — orgs whose 90-day engagement is dropping." />
        <PlaceholderCard title="Upcoming events" body="Coming in Phase 2 — next 30 days across all series." />
        <PlaceholderCard title="Needs follow-up" body="Coming in Phase 3 — interactions flagged with a follow-up date." />
      </div>
    </div>
  );
}

function PlaceholderCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
      <h2 className="text-lg section-rule inline-block mb-3">{title}</h2>
      <p className="text-sm text-ink-muted">{body}</p>
    </div>
  );
}
