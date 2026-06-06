# AIEE Partner Tracker — Phase 1 Proposal

**Prepared by:** Luke Allpress
**Email:** lukeallpress@gmail.com
**Phone:** 253-232-3941
**Address:** 6825 N 130th Dr, Glendale AZ 85307

**Prepared for:** Arizona Institute for Education and the Economy
**Date:** June 6, 2026

---

## Overview

This proposal covers Phase 1 of the AIEE Partner Tracker — the custom web app demoed recently. Phase 1 is about getting AIEE's existing partner data into the tracker and refining the interface based on demo feedback. After Phase 1, AIEE will have a working internal tool that staff can use day-to-day to manage organizations, contacts, events, and interactions.

This proposal is for Phase 1 only. Future phases (vendors, engagement scoring, event management with email, etc.) are listed at the bottom for context but are not included in this contract or this price.

---

## Phase 1 scope — $3,000

### 1. Data migration from spreadsheet

- Import AIEE's existing partner spreadsheet into the tracker: organizations, contacts, sectors, roles, and existing notes.
- Map spreadsheet columns to the tracker's data model. Clean up duplicates and inconsistencies during the import.
- Build a reusable CSV import tool and a CSV export tool so AIEE can add or pull data later without my involvement.

### 2. Sectors as a first-class concept

- Treat "sectors" as a built-in part of the tracker (rather than just freeform tags), since this came up repeatedly in feedback.
- Apply sector tags to imported organizations as part of the migration.
- One-click "copy email list" for filtered groups — e.g., one click to grab every industry org's contact emails for pasting into Mailchimp or your email client.

### 3. Organization detail enhancements

- Add an "engagement status" field on organizations (e.g., onboarding, agreement signed, active partner) — distinct from the existing active/prospect status.
- Add a "coalition member vs. just talking to" distinction so orgs like Chandler showing up at meetings but not formal partners can be tracked without skewing coalition counts.
- Surface the most recent interaction date on the org detail page.
- Add a "primary relationship" field — which AIEE staffer owns the relationship with this partner.

### 4. UX edits from demo feedback

- Polish across the existing org / contact / event / interaction screens based on the feedback session.
- Whatever small refinements come up as AIEE staff start using the tracker with real data loaded in.

### Deliverables

- The live tracker with all of AIEE's current partner data imported and verified.
- AIEE staff onboarded — sign-in working for everyone on the allowlist, plus a walkthrough call.
- All code remains in AIEE's GitHub repository. AIEE owns the codebase outright.

### Timeline

About 2–3 weeks from kickoff to delivery, depending on how quickly we can iterate on the imported data.

### Payment

- 50% ($1,500) on acceptance of this proposal.
- 50% ($1,500) on delivery.
- Invoiced as an individual.

---

## What's not included in Phase 1

The following came up in feedback and demo conversations but are explicitly out of scope for this contract. Each can be quoted separately as a follow-on phase when AIEE is ready. No pricing yet — those will be scoped individually.

### Phase 2 — Vendors, reporting, engagement scoring

- A separate "vendors / consultants" category, kept structurally distinct from coalition partners so vendor activity doesn't appear in coalition dashboards or counts.
- Engagement scoring per organization, with "cooling" and "warming" lists to flag relationships that need attention.
- Reporting and dashboards: engagement over time, sector breakdowns, exports.
- "Relationship ownership" tracking inside AIEE and with partners (Andi's request).

### Phase 3 — Event management, including emailing

- Generate invite lists from sector / tag combinations ("invite all coalition schools and all nonprofits").
- Send event invitations from the tracker directly.
- RSVP landing pages so attendees can register or decline themselves, with statuses updating automatically.
- Newsletter sending to whole-group or filtered audiences.
- Light email tracking (opens, replies) attached to the interaction record.

### Other potential phases — not yet scoped

- API connections to AIEE's other systems.
- Partner-facing features (logins for coalition members to view or interact with each other, similar to civic roundtable tools).

---

## Hosting and ongoing costs (paid by AIEE, not part of this fee)

The tracker uses two third-party hosted services. AIEE owns these accounts and pays the providers directly. No markup, no resale through me.

- **Supabase** — database, auth, storage.
- **Vercel** — web app hosting.

Expected monthly cost:

- **$0/month** today on the free tiers.
- **~$25–$50/month** once AIEE wants the tool to feel production-dependable (mainly so the Supabase database doesn't pause after inactivity).

See the separate hosting cost document for full detail on what drives those numbers.

Optional one-time / annual cost AIEE may want:

- **Custom domain** (e.g., `tracker.aiee.org` or similar) — roughly $12–15/year through any registrar AIEE picks. Skip this and the tracker just lives at a `*.vercel.app` URL.

---

## Acceptance

To move forward:

1. Reply confirming acceptance and any scope adjustments.
2. I'll send the initial $1,500 invoice.
3. We kick off as soon as it's paid.

Happy to talk through any of this on a call before signing.

— Luke
