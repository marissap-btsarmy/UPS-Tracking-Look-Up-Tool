# WorldShip Cost Lookup — Setup Guide

## What this app does
- **Search page** (`/`): Anyone on your team enters a tracking number and sees the shipment cost instantly
- **Admin page** (`/admin`): Password-protected page where you upload a fresh WorldShip CSV to update the data

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
  zone            TEXT,
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

## Step 2 — Deploy to Vercel

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
| `ADMIN_PASSWORD` | A password you choose for the /admin page |

6. Click **Deploy** — Vercel gives you a URL like `https://worldship-lookup.vercel.app`

---

## Step 3 — Load your first batch of data

1. Open WorldShip on your shipping computer
2. Go to **Tools → Export/Import Data → Create/Edit Export File**
3. Set Data Type to **Shipment History**, choose your date range
4. Include: Tracking Number, Ship Date, Service Type, Weight, Zone, Published Charge, Negotiated Charge, Recipient Name
5. Save as CSV
6. Go to `https://your-app.vercel.app/admin`
7. Enter your admin password, upload the CSV — done!

---

## Daily update workflow

Each day (or whenever you want fresh data):
1. Export the latest CSV from WorldShip
2. Go to `/admin`, upload the file
3. The app automatically adds new shipments and updates any that already exist

---

## Sharing with your team

Just send them the Vercel URL (e.g. `https://worldship-lookup.vercel.app`).
No login needed to search — only the `/admin` page requires the password.
