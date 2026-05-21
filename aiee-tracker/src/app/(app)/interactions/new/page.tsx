import { PageHeader, EmptyState } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/button";

export const metadata = { title: "New interaction · AIEE Coalition Tracker" };

// The mobile FAB on the app shell links here. Placeholder until Phase 3.
export default function NewInteractionPage() {
  return (
    <div>
      <PageHeader title="Log interaction" subtitle="Coming in Phase 3." />
      <EmptyState
        title="Quick-add coming soon"
        body="This is where the mobile floating button will drop you to log a touchpoint with an org or contact."
        action={<LinkButton href="/dashboard" variant="secondary">Back to dashboard</LinkButton>}
      />
    </div>
  );
}
