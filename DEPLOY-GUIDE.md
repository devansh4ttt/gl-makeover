# Gorgeous Look Makeover (G L Makeover) — Production Deployment Guide

Everything runs on **₹0/month** using Cloudflare Workers (Static Assets) + Cloudflare D1 SQLite. No external database, no S3 bucket, and zero exposed API keys.

## 1. Exact GitHub Repository Layout
Unzip `gl-makeover-production.zip` and place the inner files directly at the root of a new **Private** GitHub repository (e.g., `gl-makeover`):

```text
gl-makeover/
├── package.json
├── wrangler.jsonc
├── DEPLOY-GUIDE.md
├── src/
│   └── worker.js
└── public/
    ├── index.html
    ├── 404.html
    └── assets/
        ├── app.js
        ├── admin.js
        ├── scene3d.js
        ├── styles.css
        └── photos/
            ├── 01-hero-bridal-velvet.webp
            ├── 02-hd-bridal-window.webp
            ├── 03-airbrush-ivory-bride.webp
            ├── 04-reception-smoky-glam.webp
            ├── 05-engagement-rose-glam.webp
            ├── 06-haldi-dewy-floral.webp
            ├── 07-bridal-floral-bun.webp
            ├── 08-party-sider-sage.webp
            ├── 09-bridal-veil-draping.webp
            └── 10-vanity-atelier-kit.webp
```

## 2. Create the D1 Database (1 Minute)
1. Open **Cloudflare Dashboard → Storage & Databases → D1 SQL Database → Create**.
2. Name it **`gl-makeover-db`** and click **Create**.
3. Copy the **Database ID** and replace `REPLACE_WITH_YOUR_D1_DATABASE_ID` inside **`wrangler.jsonc`**.
*(All 10 D1 tables, makeup packages, add-ons, photos, and bride reviews auto-seed on the very first visit—no manual SQL required.)*

## 3. Deploy & Save Admin Password Secret (2 Minutes)
1. In **Cloudflare Dashboard → Workers & Pages → Create → Import a repository**, select `gl-makeover` and click **Save and Deploy**.
2. Open the deployed Worker → **Settings → Variables and Secrets → Add** → add a **Secret**:
   - **Variable name:** `ADMIN_PASSWORD`
   - **Value:** Choose a strong password (12+ characters).
3. Click **Deploy**.

## 4. 1-Second Live Verification
1. Open `https://<your-url>/api/v1/health` and confirm `{"ok":true,"version":"1.0.0","db":true,"admin":true}`.
2. Open `https://<your-url>/#/admin`, sign in with `ADMIN_PASSWORD`, and test:
   - Marking a busy wedding date in **Slot Calendar** and checking `#/booking`
   - Editing makeup packages, styling add-ons, Sider rate, or toggling the **Live Offer**
   - Uploading a real bride photo from your phone to **Home**, **About Us**, or **Bridal Lookbook**
3. Submit a test booking on `#/booking` to confirm the formatted WhatsApp brief opens to **`+91 63078 55239`** and logs in **Analytics & Brides**.
