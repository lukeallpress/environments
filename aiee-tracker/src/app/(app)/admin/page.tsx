import { PageHeader, EmptyState } from "@/components/ui/page-header";

export const metadata = { title: "Admin · AIEE Coalition Tracker" };

export default function AdminPage() {
  return (
    <div>
      <PageHeader title="Admin" subtitle="Coming in Phase 5." />
      <EmptyState
        title="Admin screens land in Phase 5"
        body="Staff allowlist management, tag management, engagement weight tuning, audit log viewer."
      />
    </div>
  );
}
