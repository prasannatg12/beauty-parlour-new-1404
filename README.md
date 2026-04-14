# Meena's Beauty Parlour - Website

A complete single-page beauty salon website with contact and booking email functionality.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Email: Nodemailer with Gmail SMTP (port 587)

## Project Structure

```
artifacts/
├── meenas-beauty/        ← Frontend (React + Vite)
│   └── src/
│       ├── components/   ← All page sections
│       ├── data/
│       │   └── site.json ← All website content (edit this!)
│       └── App.tsx
└── api-server/           ← Backend (Express)
    └── src/
        └── routes/
            └── email.ts  ← Email API endpoints
```

## Environment Variables (Required)

Set these in your environment before running:

```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-char-app-password
```

### How to get Gmail App Password:
1. Go to: https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to: https://myaccount.google.com/apppasswords
4. Create a new App Password → copy the 16-character code
5. Use that as EMAIL_PASS (spaces optional)

## Running Locally

```bash
# Install dependencies
pnpm install

# Start API server (terminal 1)
cd artifacts/api-server
PORT=8080 pnpm run dev

# Start frontend (terminal 2)
cd artifacts/meenas-beauty
PORT=3000 BASE_PATH=/ pnpm run dev
```

## API Endpoints

- `POST /api/contact` — sends contact inquiry email
  - Body: `{ name, phone, message }`

- `POST /api/booking` — sends appointment booking email
  - Body: `{ name, phone, service, preferredTime }`

Both send email to: prasannatgpixmonks@gmail.com

## Customisation

Edit `artifacts/meenas-beauty/src/data/site.json` to update:
- Salon name, phone, address, hours
- Services list and pricing
- Offers/packages
- Customer reviews
