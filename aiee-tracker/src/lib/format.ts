// Format helpers for dates. Use the user's locale and timezone — fine for now
// since AIEE staff are presumably all in Arizona. Revisit if we ever serve
// users in different timezones (would want to store/display the event's
// originating timezone explicitly).

const dateFmt = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});

const timeFmt = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

export function formatEventDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return dateFmt.format(d);
}

export function formatEventTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return timeFmt.format(d);
}

export function formatEventWhen(
  startsAt: string | null | undefined,
  endsAt?: string | null
): string {
  if (!startsAt) return "—";
  const start = new Date(startsAt);
  const datePart = dateFmt.format(start);
  const startTime = timeFmt.format(start);
  if (!endsAt) return `${datePart} · ${startTime}`;
  const end = new Date(endsAt);
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();
  if (sameDay) {
    return `${datePart} · ${startTime} – ${timeFmt.format(end)}`;
  }
  return `${datePart} ${startTime} – ${dateFmt.format(end)} ${timeFmt.format(end)}`;
}

// Convert a timestamp (e.g. from Postgres timestamptz) into the
// `YYYY-MM-DDTHH:MM` shape that <input type="datetime-local"> wants.
// The output is in the user's local timezone.
export function toDatetimeLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}
