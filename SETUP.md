# WorldShip Cost Lookup — Setup Guide

## What this app does
- **Login page** (`/login`): Everything below requires signing in with a Supabase Auth account — there's no public access or self sign-up
- **Search page** (`/`): Signed-in teammates enter a tracking number and see the shipment cost instantly
- **Admin page** (`/admin`): Any signed-in user can upload a fresh WorldShip CSV to update the data

---

## Step 1 — Set up the database (Supabase)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New project**, give it a name (e.g. "worldship-lookup"), set a database password, click **Create project**
3. Once created, click **SQL Editor** in the left sidebar
4. Paste and run this SQL to create the shipments table:

```sql
CREATE TABLE shipments (
  id              BIGSERIAL PRIMARY KEY,
  tracking_number TEXT UNIQUE,
  ship_date       TEXT,
  service_type    TEXT,
  weight          TEXT,
  negotiated_charge DECIMAL(10,2),
  published_charge  DECIMAL(10,2),
  recipient_name  TEXT,
  imported_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shipments_tracking ON shipments (tracking_number);

-- Allow anyone to read (search), but only server can write
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON shipments FOR SELECT USING (true);
```

5. Go to **Project Settings → API** and copy:
   - **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → this is `SUPABASE_SERVICE_ROLE_KEY` (keep this secret)

---

## Step 2 — Create login accounts

This app has no public sign-up — you create an account for each teammate who needs access:

1. In Supabase, go to **Authentication → Users → Add user**
2. Enter their email and a temporary password, and tick **Auto Confirm User** (so they don't need to click an email link)
3. Share the email/password with them — they can change the password later via **Authentication → Users** if needed
4. Optional but recommended: go to **Authentication → Providers → Email** and turn **off** "Allow new users to sign up", since accounts should only be created by an admin

---

## Step 3 — Deploy to Vercel

1. Go to [github.com](https://github.com) and create a free account (if you don't have one)
2. Create a new repository called `worldship-lookup` and upload all these project files
3. Go to [vercel.com](https://vercel.com), sign up with your GitHub account
4. Click **Add New → Project**, select the `worldship-lookup` repository
5. Before clicking Deploy, click **Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |

6. Click **Deploy** — Vercel gives you a URL like `https://worldship-lookup.vercel.app`

---

## Step 4 — Load your first batch of data

1. Open WorldShip on your shipping computer
2. Go to **Tools → Export/Import Data → Create/Edit Export File**
3. Set Data Type to **Shipment History**, choose your date range
4. Include: Tracking Number, Ship Date, Service Type, Weight, Zone, Published Charge, Negotiated Charge, Recipient Name
5. Save as CSV
6. Go to `https://your-app.vercel.app`, sign in, then go to `/admin`
7. Upload the CSV — done!

---

## Daily update workflow

Each day (or whenever you want fresh data):
1. Export the latest CSV from WorldShip
2. Go to `/admin`, upload the file
3. The app automatically adds new shipments and updates any that already exist

---

## Sharing with your team

Send them the Vercel URL (e.g. `https://worldship-lookup.vercel.app`) plus the login
you created for them in Step 2. Everyone needs an account — there's no public access.
