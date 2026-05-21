# AIEE Coalition Tracker — Project Plan

A web app for the Arizona Institute for Education and the Economy (AIEE) at NAU to track coalition member organizations, contacts, events, attendance, interactions, and engagement trends over time.

**Status**: scoping. No code yet. Pending the engagement-theory doc and confirmation of the items in "Open Questions" below.

---

## 1. Project at a glance

- **Users who log in**: 5–10 AIEE staff (NAU email addresses, magic-link auth).
- **Records tracked**: ~50 partner orgs, growing; contacts under each org; ongoing event series; notes/interactions.
- **Why now**: AIEE is growing too fast to track everyone via spreadsheets; need engagement trends over time.
- **What it replaces**: ad-hoc spreadsheets; deliberately *not* Salesforce (too heavy).
- **Form factor**: responsive web app, mobile-first. Staff often add notes from their phone after a meeting.

---

## 2. Tech stack & hosting

| Layer | Choice | Cost |
|---|---|---|
| Framework | Next.js 15 (App Router, TypeScript) | — |
| UI | Tailwind CSS + shadcn/ui components | — |
| DB + Auth + Storage | Supabase (Postgres, magic-link auth, row-level security) | Free tier covers it |
| Hosting | Vercel (deploys from GitHub on push) | Free tier covers it |
| Repo | New `lukeallpress/aiee-tracker` (you'll create when ready); scaffolded here until then | — |
| Domain | Skip — use `*.vercel.app` URL initially | $0 |

**Day-one cost: $0.** Upgrade trigger: ~50k monthly auth events or 500MB DB (years away at this size).

---

## 3. Visual style

Extracted from the AZ GenAI Guidance cover (AIEE / NAU branding). Hex values are best-guesses to confirm against the official NAU brand guide.

### Colors
| Token | Hex (proposed) | Use |
|---|---|---|
| `--nau-navy` | `#002E5D` | Primary; nav bars, headings, primary buttons |
| `--nau-gold` | `#FFC72C` | Accent; highlights, active states, dividers |
| `--accent-cyan` | `#4FB4E5` | Secondary accent (the bright connector dots on the cover) |
| `--ink` | `#0F172A` | Body text |
| `--surface` | `#FFFFFF` | Cards / surfaces |
| `--surface-muted` | `#F4F6FB` | Page background |

### Typography
- **Headings**: a humanist serif (the cover uses something like Source Serif Pro / PT Serif). Proposed: **Source Serif 4** (free, Google Fonts).
- **Body & UI**: clean grotesque sans. Proposed: **Inter** (free, Google Fonts).
- Italic serif for tag-line / hero text ("A Balanced Perspective" pattern).

### Motifs
- Gold horizontal rule under section headings (matches the gold underline below the cover title).
- Subtle circuit-board-style backdrop only on hero / section headers — never on dense data screens.
- Card-based layout with soft shadows; navy headers on cards.
- AIEE logo (stacked triangle + NAU wordmark) lives top-left in the app shell.

### Density & vibe
Institutional but modern. Generous whitespace on landing/marketing surfaces; dense, table-friendly on data screens (data screens prioritize information over decoration).

---

## 4. Users, roles, auth

- **One role to start**: `staff`. All 5–10 AIEE users can see/edit everything. We can add `admin` vs `viewer` later if needed; not worth the complexity now.
- **Auth**: Supabase magic-link email. User enters their NAU email → gets a link → click → in. No passwords.
- **Allowlist**: app rejects sign-in attempts from emails not on a `staff_allowlist` table that one of you can edit from the admin screen. Prevents drive-by signups.
- **Audit**: every create/update/delete writes an `audit_log` row (who, when, what changed). Cheap insurance.

---

## 5. Data model

Per your guidance: contacts are **scoped to one org**. If a person moves orgs, that's a brand-new contact record (no cross-org history stitching). Events are **series-based** (a series is a parent; individual occurrences hang off it).

```
organizations
  id, name, type (district/charter/nonprofit/agency/industry/...),
  district, county, address, website, status (active/inactive/prospect),
  notes, created_at, created_by, ...

contacts
  id, org_id (FK), first_name, last_name, email, phone, title,
  role_tags (text[]),  -- e.g. {"superintendent","board-member"}
  status (active/inactive), notes, created_at, ...

event_series
  id, name, description, cadence (one-off/monthly/quarterly/...),
  owner_user_id, created_at

events
  id, series_id (nullable FK), name, starts_at, ends_at,
  location, format (in-person/virtual/hybrid), description, notes

event_attendance
  event_id, contact_id, status (invited/registered/attended/no-show),
  role_at_event (attendee/speaker/host/...), notes
  PK (event_id, contact_id)

interactions             -- "we had a memorable conversation"-style notes
  id, target_type (org|contact), target_id, occurred_at,
  channel (email/call/meeting/text/...), summary, follow_up_at,
  authored_by_user_id, created_at

tags                     -- free-form labels you can apply across the system
  id, label, color
tag_links
  tag_id, target_type (org|contact|event), target_id

staff_allowlist
  email (PK), added_by_user_id, added_at

audit_log
  id, actor_user_id, action, table_name, row_id, diff (jsonb), at
```

### Trends-over-time
Engagement trends are SQL views on top of `event_attendance` + `interactions`, grouped by org/contact and bucketed by month/quarter. Specific scoring formula pending the engagement-theory doc (§7).

### Why no shared "person" table
You explicitly chose strict org-scoped contacts. The cost: cross-career queries ("show me Jane's full history") aren't possible. The benefit: simpler model, no contact-deduplication problem, no "is Jane@OrgA the same Jane as Jane@OrgB?" UX. Recorded so the trade-off isn't forgotten.

---

## 6. Screens (responsive, mobile-first)

| Screen | Mobile | Desktop |
|---|---|---|
| **Sign in** | Email field → "magic link sent" confirmation | Same |
| **Dashboard** | Stacked cards: recent interactions, upcoming events, "needs follow-up" | 3-column grid of same |
| **Orgs list** | Searchable card list with district/county chips | Searchable table; column sort/filter |
| **Org detail** | Tabs: Overview / Contacts / Events / Interactions / Notes | Same, sidebar layout |
| **Contact detail** | Profile card + interaction timeline | Same, two-column |
| **Events list** | Grouped by series, expandable | Table grouped by series |
| **Event detail** | Attendee list + bulk "mark attended" toggle | Same, plus bulk-add contacts modal |
| **Bulk attendance entry** | Mobile: tap-to-toggle list; designed for in-room check-in | Desktop: same + filter/search |
| **Interaction quick-add** | Floating "+" → org/contact picker → note field. Optimized for after-meeting capture on phone. | Same modal |
| **Reports** | Static cards (engagement over time per org) | Same + filters + CSV export |
| **Admin** | Manage staff allowlist, tags | Same |

Notable mobile UX details:
- Quick-add interaction lives behind a persistent FAB (floating action button). Two taps from anywhere to log a touchpoint.
- Bulk event check-in is the one screen designed *primarily* for mobile (staff at the event with a phone).
- Tables collapse to cards under ~640px.

---

## 7. Engagement scoring — **PLACEHOLDER** ⚠

Pending your engagement-theory doc. Until then, working assumption:

> Engagement score per org per quarter = weighted sum of (events attended × event weight) + (interactions × channel weight) + (active contacts × small constant). Time-decayed.

This will be a Postgres view or materialized view, recomputable on demand. Final formula goes here once the doc lands.

---

## 8. Build phases

Each phase is independently shippable.

**Phase 0 — Foundations** (no user-visible features)
- Repo scaffold (Next.js + Tailwind + shadcn + Supabase client)
- Auth (magic link + staff allowlist)
- Empty schema in Supabase, migrations checked in
- App shell with AIEE branding + nav

**Phase 1 — Orgs & contacts**
- CRUD for orgs and contacts
- Search, filter, tag
- Org detail page with tabs

**Phase 2 — Events & attendance**
- Series + events CRUD
- Mobile-first bulk attendance UI
- Event detail screen

**Phase 3 — Interactions**
- Quick-add FAB
- Interaction timeline on org/contact pages
- Follow-up reminders (just a queryable "due" list, no notifications)

**Phase 4 — Engagement & reports**
- Implement scoring per the theory doc
- Per-org / per-contact trend charts
- CSV export

**Phase 5 — Polish**
- Audit log viewer
- Tag management
- Empty/error states + accessibility pass

---

## 9. Open questions / blockers

1. **Engagement-theory doc** — needed for Phase 4 (not blocking Phase 0–3).
2. **Official NAU/AIEE brand colors & logo file** — proposed hex values above are best-guesses; want to confirm against the brand guide. A vector logo file (SVG/PDF) would let me put it in the app header.
3. **GitHub repo** — when you create `lukeallpress/aiee-tracker`, I'll move the scaffold there. Until then it lives in `aiee-tracker/` on the `claude/mobile-engagement-tracker-LEks8` branch of `lukeallpress/environments`.
4. **Vercel + Supabase accounts** — you'll need to create these (free) under `lallpress@aguafria.org` and add me as a collaborator when we get to Phase 0 deploy.
5. **Confirm**: only AIEE staff log in. Coalition members/contacts are records, not users. (Stated, just want to lock it in.)

---

## 10. Open items the friend asked about that we should remember

From the original request:
- "track attendance at events, engagement, add notes if we have memorable conversations" → covered (events, attendance, interactions).
- "usual database tags like district, county, role" → org has district/county columns; role_tags on contacts; freeform tag system on top.
- "understand trends of engagement over time" → Phase 4.
- "this would probably be something we start seriously thinking about this summer" → Phase 0–2 are a few days of work each; can be live before summer's out.
