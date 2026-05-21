import { PageHeader, EmptyState } from "@/components/ui/page-header";

export const metadata = { title: "Interactions · AIEE Coalition Tracker" };

export default function InteractionsPage() {
  return (
    <div>
      <PageHeader title="Interactions" subtitle="Coming in Phase 3." />
      <EmptyState
        title="Interactions land in Phase 3"
        body="Quick-add touchpoints with org/contact picker, timeline view, follow-up reminders. The mobile FAB will land here too."
      />
    </div>
  );
}
