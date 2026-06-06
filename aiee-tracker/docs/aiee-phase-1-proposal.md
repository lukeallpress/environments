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

**Current demo URL:** https://aiee-tracker.vercel.app
**Current code repo:** github.com/lukeallpress/aiee-tracker (under Luke's personal GitHub account)

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
- **Relationship ownership** (Andi's ask):
  - Which AIEE staffer owns the relationship with each partner org.
  - Which contact at the partner org is AIEE's primary point of contact.
  - Both surfaced on the org detail page and filterable.

### 4. UX edits from demo feedback

- Polish across the existing org / contact / event / interaction screens based on the feedback session.
- Whatever small refinements come up as AIEE staff start using the tracker with real data loaded in.

### Deliverables

- The live tracker with all of AIEE's current partner data imported and verified.
- AIEE staff onboarded — sign-in working for everyone on the allowlist, plus a walkthrough call.

### Timeline

About 2–3 weeks from kickoff to delivery, depending on how quickly we can iterate on the imported data.

### Payment

- $3,000 total, invoiced 100% on completion.
- Invoiced as an individual.

---

## What's not included in Phase 1

The following came up in feedback and demo conversations but are explicitly out of scope for this contract. Each can be quoted separately as a follow-on phase when AIEE is ready. No pricing yet — those will be scoped individually.

### Phase 2 — Vendors, reporting, engagement scoring

- A separate "vendors / consultants" category, kept structurally distinct from coalition partners so vendor activity doesn't appear in coalition dashboards or counts.
- Engagement scoring per organization, with "cooling" and "warming" lists to flag relationships that need attention.
- Reporting and dashboards: engagement over time, sector breakdowns, exports.

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

## Hosting, accounts, and ongoing costs

The tracker uses two third-party hosted services:

- **Supabase** — database, auth, storage.
- **Vercel** — web app hosting at https://aiee-tracker.vercel.app.

### Where things live today

Right now, both services and the GitHub code repo are under **my personal accounts**. That's how the demo got built quickly. Nothing AIEE pays for yet, but it also means the tool depends on my accounts staying active.

### Two paths going forward — AIEE picks

**Option A — Keep hosting under my accounts.**
Simplest. The tracker stays where it is, I keep the lights on, and AIEE has nothing to set up or pay providers directly. AIEE pays me a small monthly maintenance fee to cover the hosting bills + admin time. Pros: zero friction. Cons: AIEE doesn't own the infrastructure; if I get hit by a bus, someone has to migrate it.

**Option B — Move hosting to AIEE's own accounts.**
AIEE creates its own Supabase and Vercel accounts (free, takes maybe 30 minutes), I redeploy the tracker under those accounts, AIEE pays the providers directly going forward. Pros: AIEE controls the infrastructure and the data. Cons: a bit more setup at the start, and AIEE staff need to handle the occasional billing notification.

If AIEE wants Option B, I'll handle the migration and walk you through what to click — included in Phase 1 at no extra charge.

### Expected monthly hosting cost (under Option B)

For AIEE's scale (5–10 staff users, dozens to a few hundred orgs and contacts):

- **$0/month** today on the free tiers.
- **~$25/month** once you want the tool to feel production-dependable. The Supabase Pro plan ($25/mo) is the main thing — it keeps the database from being auto-paused after inactivity, which is the biggest free-tier annoyance. Vercel's free tier should be enough for a long while.
- **~$45/month** if you also move Vercel to its Pro plan ($20/mo), which is mainly worth it once you want team ownership or more analytics.

See the separate hosting cost document I sent for the full breakdown.

### Optional one-time / annual cost

- **Custom domain** (e.g., `tracker.aiee.org`) — roughly $12–15/year through any registrar AIEE picks. Skip this and the tracker just lives at the `aiee-tracker.vercel.app` URL.

### Codebase ownership

The code currently lives in my personal GitHub repo. AIEE doesn't need to own it for the tracker to work — but if AIEE does want the code under its own GitHub organization for any reason, transferring the repo is straightforward and I'll handle it. Most likely AIEE doesn't care, since the running app is what matters.

---

## Acceptance

To move forward:

1. Reply confirming acceptance and any scope adjustments.
2. Indicate whether you want hosting Option A (under my accounts) or Option B (under AIEE's accounts).
3. We kick off, and I invoice $3,000 on completion.

Happy to talk through any of this on a call before signing.

— Luke
