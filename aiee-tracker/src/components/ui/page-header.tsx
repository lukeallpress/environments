import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-3xl section-rule inline-block">{title}</h1>
        {subtitle && (
          <p className="text-ink-muted mt-3 text-sm">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-surface border border-border rounded-xl shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="p-10 text-center">
      <h3 className="text-lg font-semibold text-nau-navy mb-2">{title}</h3>
      {body && <p className="text-sm text-ink-muted mb-4">{body}</p>}
      {action && <div className="inline-flex">{action}</div>}
    </Card>
  );
}
