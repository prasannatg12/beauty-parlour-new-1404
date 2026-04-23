-- Migration: Add sent_in_whatsapp column to existing booking table
-- Run this if you already have the booking table created

ALTER TABLE booking
ADD COLUMN sent_in_whatsapp BOOLEAN DEFAULT false;

-- Add index for cron job queries
CREATE INDEX idx_booking_sent_in_whatsapp ON booking(sent_in_whatsapp) WHERE sent_in_whatsapp = false;
