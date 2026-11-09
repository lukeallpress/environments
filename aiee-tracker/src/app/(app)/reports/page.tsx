import { PageHeader, EmptyState } from "@/components/ui/page-header";

export const metadata = { title: "Reports · AIEE Coalition Tracker" };

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" subtitle="Coming in Phase 4." />
      <EmptyState
        title="Reports land in Phase 4"
        body="Engagement-over-time per org, cooling/warming lists, CSV exports."
      />
    </div>
  );
}
