-- Create the booking table in Supabase
CREATE TABLE booking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  service VARCHAR(255) NOT NULL,
  preferred_time VARCHAR(255) NOT NULL,
  notes TEXT,
  created_by VARCHAR(255) NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_by VARCHAR(255) NOT NULL,
  updated_on TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_in_whatsapp BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Add an index on created_on for faster queries
CREATE INDEX idx_booking_created_on ON booking(created_on DESC);

-- Optional: Add an index on phone for searching by phone number
CREATE INDEX idx_booking_phone ON booking(phone);

-- Add an index on sent_in_whatsapp for cron job queries
CREATE INDEX idx_booking_sent_in_whatsapp ON booking(sent_in_whatsapp) WHERE sent_in_whatsapp = false;

-- Enable Row Level Security (RLS)
ALTER TABLE booking ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert bookings
CREATE POLICY "Allow public inserts" ON booking
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to select bookings (optional, for viewing)
CREATE POLICY "Allow public read" ON booking
  FOR SELECT
  USING (true);
