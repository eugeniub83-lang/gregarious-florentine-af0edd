# Strongco Fire Safety — FSER Form App

A complete production-ready Next.js application for Strongco Fire Safety with a multi-step FSER form, PDF generation, and email delivery.

## Features

- Next.js 14 App Router
- Tailwind CSS styling
- React Hook Form + Zod validation
- Multi-step form with local draft saving
- PDF generation via `pdf-lib`
- Gmail SMTP email delivery via Nodemailer
- Secure server actions for backend email logic
- Production-ready for Vercel deployment

## Install

```bash
cd strongco-fire-safety
npm install
```

## Environment

Create `.env.local` in `strongco-fire-safety`:

```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
```

## Run locally

```bash
npm run dev
```

Open `http://localhost:3000`

## Build

```bash
npm run build
```

## Deploy to Vercel

1. Import the `strongco-fire-safety` project into Vercel.
2. Add environment variables in Vercel:
   - `SMTP_USER`
   - `SMTP_PASS`
   - `SMTP_HOST`
   - `SMTP_PORT`
3. Deploy the project.

A `vercel.json` file is included for Vercel automatic deployment.

## Notes

- Use an App Password for Gmail if 2FA is enabled.
- The site keeps a draft in localStorage.
- The PDF is generated server-side and attached to email.
