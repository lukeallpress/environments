import { PageHeader, Card } from "@/components/ui/page-header";
import { OrgForm } from "@/components/forms/org-form";
import { createOrganization } from "../actions";

export const metadata = { title: "New organization · AIEE Coalition Tracker" };

export default function NewOrgPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="New organization"
        subtitle="Add a partner org to the coalition."
      />
      <Card className="p-6">
        <OrgForm
          action={createOrganization}
          cancelHref="/orgs"
          submitLabel="Create organization"
        />
      </Card>
    </div>
  );
}
