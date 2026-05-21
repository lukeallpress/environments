import { PageHeader, EmptyState } from "@/components/ui/page-header";

export const metadata = { title: "Events · AIEE Coalition Tracker" };

export default function EventsPage() {
  return (
    <div>
      <PageHeader title="Events" subtitle="Coming in Phase 2." />
      <EmptyState
        title="Events land in Phase 2"
        body="Event series, individual occurrences, and a mobile-first bulk attendance check-in. Stay tuned."
      />
    </div>
  );
}
