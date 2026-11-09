import type { ReactNode } from "react";

type Tone = "neutral" | "active" | "prospect" | "inactive" | "accent";

const TONES: Record<Tone, string> = {
  neutral: "bg-nau-navy-50 text-nau-navy",
  active: "bg-emerald-50 text-success border border-emerald-200",
  prospect: "bg-amber-50 text-amber-800 border border-amber-200",
  inactive: "bg-slate-100 text-slate-600 border border-slate-200",
  accent: "bg-[color:var(--accent-cyan)]/15 text-nau-navy",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone: Tone =
    status === "active"
      ? "active"
      : status === "prospect"
        ? "prospect"
        : status === "inactive"
          ? "inactive"
          : "neutral";
  return <Badge tone={tone}>{status}</Badge>;
}
