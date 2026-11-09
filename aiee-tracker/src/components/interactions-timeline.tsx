import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { INTERACTION_CHANNELS } from "@/lib/db/types";
import type { Interaction, InteractionChannel } from "@/lib/db/types";
import { formatEventDate, formatEventTime } from "@/lib/format";

type Row = Pick<
  Interaction,
  "id" | "occurred_at" | "channel" | "summary" | "follow_up_at"
>;

const CHANNEL_LABELS: Record<InteractionChannel, string> = Object.fromEntries(
  INTERACTION_CHANNELS.map((c) => [c.value, c.label])
) as Record<InteractionChannel, string>;

export function InteractionsTimeline({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-ink-muted py-2">
        No interactions logged yet.
      </p>
    );
  }
  return (
    <ol className="space-y-4">
      {rows.map((i) => {
        const overdue =
          i.follow_up_at && new Date(i.follow_up_at) < new Date();
        return (
          <li key={i.id} className="border-l-2 border-nau-gold/60 pl-4">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <p className="text-xs uppercase tracking-wide text-ink-muted">
                {formatEventDate(i.occurred_at)} · {formatEventTime(i.occurred_at)}
                <span className="ml-2 inline-block">
                  <Badge tone="accent">
                    {CHANNEL_LABELS[i.channel] ?? i.channel}
                  </Badge>
                </span>
              </p>
              <Link
                href={`/interactions/${i.id}`}
                className="text-xs font-medium text-nau-navy hover:underline"
              >
                Open
              </Link>
            </div>
            <p className="text-sm text-ink mt-1 whitespace-pre-wrap">
              {i.summary}
            </p>
            {i.follow_up_at && (
              <p
                className={`text-xs mt-2 ${
                  overdue ? "text-danger font-medium" : "text-ink-muted"
                }`}
              >
                {overdue ? "Overdue — " : "Follow up by "}
                {formatEventDate(i.follow_up_at)}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
