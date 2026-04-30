-- MULTI-TENANT ARCHITECTURE INITIALIZATION

-- 1. Enable UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Organization Master Table
CREATE TABLE IF NOT EXISTS organization (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Initialize Meena's Beauty Parlour (Default Tenant)
-- This provides the unique ID you requested for Meena's.
INSERT INTO organization (name, slug) 
VALUES ('Meena''s Beauty Parlour', 'meenas-beauty')
ON CONFLICT (slug) DO NOTHING;

-- 4. Unified Migration: Add org_id to all operational tables
DO $$
DECLARE
    meena_id UUID;
BEGIN
    SELECT id INTO meena_id FROM organization WHERE slug = 'meenas-beauty' LIMIT 1;

    -- Add org_id to 'booking'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'booking' AND column_name = 'org_id') THEN
        ALTER TABLE booking ADD COLUMN org_id UUID REFERENCES organization(id);
        UPDATE booking SET org_id = meena_id;
        ALTER TABLE booking ALTER COLUMN org_id SET NOT NULL;
    END IF;

    -- Add org_id to 'service'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service' AND column_name = 'org_id') THEN
        ALTER TABLE service ADD COLUMN org_id UUID REFERENCES organization(id);
        UPDATE service SET org_id = meena_id;
        ALTER TABLE service ALTER COLUMN org_id SET NOT NULL;
    END IF;

    -- Add org_id to 'staff'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff' AND column_name = 'org_id') THEN
        ALTER TABLE staff ADD COLUMN org_id UUID REFERENCES organization(id);
        UPDATE staff SET org_id = meena_id;
        ALTER TABLE staff ALTER COLUMN org_id SET NOT NULL;
    END IF;

    -- Add org_id to 'payment'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment' AND column_name = 'org_id') THEN
        ALTER TABLE payment ADD COLUMN org_id UUID REFERENCES organization(id);
        UPDATE payment SET org_id = meena_id;
        ALTER TABLE payment ALTER COLUMN org_id SET NOT NULL;
    END IF;
END $$;

-- 5. Performance Optimization
CREATE INDEX IF NOT EXISTS idx_booking_org_id ON booking(org_id);
CREATE INDEX IF NOT EXISTS idx_service_org_id ON service(org_id);
CREATE INDEX IF NOT EXISTS idx_staff_org_id ON staff(org_id);
CREATE INDEX IF NOT EXISTS idx_payment_org_id ON payment(org_id);
