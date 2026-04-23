# WhatsApp Booking Notification Setup Guide

This guide explains how to set up the automated WhatsApp booking notification system.

## Overview

When a user books an appointment through the booking form, a cron job automatically:
1. Checks for new bookings where `sent_in_whatsapp = false`
2. Sends a WhatsApp message to the customer with booking details
3. Updates the booking record to mark `sent_in_whatsapp = true`

The cron job runs every 5 minutes.

## Prerequisites

### 1. Database Setup

If you're creating the booking table for the first time, run:
```bash
# In Supabase SQL Editor
# Copy and paste the contents of supabase_booking_table.sql
```

If you already have the booking table, add the new column:
```bash
# In Supabase SQL Editor
# Copy and paste the contents of supabase_add_whatsapp_column.sql
```

### 2. Twilio Setup

1. Create a Twilio account at https://www.twilio.com/
2. Get your WhatsApp Sandbox number from Twilio Console
3. Copy your credentials:
   - Account SID
   - Auth Token

### 3. Environment Variables

Add these to your `.env` file (locally) and Vercel environment settings:

```env
# Twilio credentials
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token

# Supabase credentials
SUPABASE_URL=https://vyllwlydzfgehihtomyg.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# Vercel Cron Secret (generate a random token)
VERCEL_CRON_SECRET=your_random_secret_token
```

## Setup Steps

### Step 1: Update the Database

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Create a new query and run the migration:

```sql
ALTER TABLE booking
ADD COLUMN sent_in_whatsapp BOOLEAN DEFAULT false;

CREATE INDEX idx_booking_sent_in_whatsapp ON booking(sent_in_whatsapp) WHERE sent_in_whatsapp = false;
```

### Step 2: Set Up Twilio

1. Sign up at Twilio: https://www.twilio.com/
2. Verify your phone number
3. Get a WhatsApp Sandbox number
4. Save your Account SID and Auth Token

### Step 3: Deploy to Vercel

1. Push your code to GitHub/GitLab
2. Connect your repository to Vercel
3. Add environment variables in Vercel Dashboard:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `VERCEL_CRON_SECRET` (any random string)

### Step 4: Enable Cron Job

The cron job is already configured in `vercel.json`:
```json
"crons": [
  {
    "path": "/api/cron/sendBookingWhatsApp",
    "schedule": "*/5 * * * *"
  }
]
```

This runs every 5 minutes (`*/5 * * * *` in cron syntax).

## Files Created/Modified

- `supabase_booking_table.sql` - Initial table creation with `sent_in_whatsapp` column
- `supabase_add_whatsapp_column.sql` - Migration to add column to existing table
- `api/cron/sendBookingWhatsApp.ts` - Vercel serverless function that sends WhatsApp messages
- `vercel.json` - Updated with cron job configuration
- `src/services/bookingWhatsAppCron.ts` - Node.js cron service (for local development)

## How It Works

### Flow:
1. User submits booking form → saved to `booking` table with `sent_in_whatsapp = false`
2. Cron job runs every 5 minutes
3. Queries for all bookings with `sent_in_whatsapp = false`
4. For each unsent booking:
   - Sends WhatsApp message to customer
   - Updates `sent_in_whatsapp = true` on success
5. Logs results

### Message Format:
```
Hello {customer_name},

Thank you for booking with Meena's Beauty Parlour!

📋 Booking Details:
Service: {service_name}
Preferred Time: {preferred_time}
Notes: {notes}

We will confirm your appointment shortly. If you have any questions, feel free to reach out to us.

Best regards,
Meena's Beauty Parlour
```

## Testing Locally

### Option 1: Using the Node.js Cron Service

```typescript
// In your main.tsx or App.tsx
import { startBookingWhatsAppCron } from "./services/bookingWhatsAppCron";

// Start the cron job
startBookingWhatsAppCron();
```

### Option 2: Manual Testing

Call the API endpoint directly:
```bash
curl -X GET http://localhost:3000/api/cron/sendBookingWhatsApp \
  -H "x-vercel-cron: your_secret_token"
```

## Troubleshooting

### Issue: "Unauthorized" error
- Check that `VERCEL_CRON_SECRET` is set correctly in environment variables

### Issue: WhatsApp messages not sending
- Verify Twilio credentials are correct
- Check that the customer's phone number is in E.164 format (e.g., +919XXXXXXXXX)
- Ensure Twilio WhatsApp is enabled on your account

### Issue: Cron job not running
- Check Vercel Dashboard → Settings → Cron Jobs
- Verify environment variables are set in Vercel
- Check Vercel logs for errors

## Monitoring

Monitor cron job executions in Vercel:
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Cron Jobs
4. View logs and execution history

## Customization

### Change Cron Schedule

Edit `vercel.json`:
```json
"crons": [
  {
    "path": "/api/cron/sendBookingWhatsApp",
    "schedule": "0 9 * * *"  // Runs at 9 AM daily
  }
]
```

Cron syntax: `minute hour day month weekday`
- `*/5 * * * *` = Every 5 minutes
- `0 9 * * *` = At 9:00 AM daily
- `0 9 * * 1` = At 9:00 AM every Monday

### Customize WhatsApp Message

Edit the message template in `api/cron/sendBookingWhatsApp.ts`:
```typescript
const messageBody = `...your custom message...`;
```

## Support

For issues with:
- **Twilio**: https://support.twilio.com/
- **Vercel**: https://vercel.com/support
- **Supabase**: https://supabase.com/docs
