-- Create Enum for User Roles
-- Ensure pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create Enum for User Roles (safe if already exists)
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
		CREATE TYPE user_role AS ENUM ('mahasiswa', 'panitia', 'admin');
	END IF;
END$$;

-- Create Enum for Event Status (safe if already exists)
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
		CREATE TYPE event_status AS ENUM ('draft', 'pending_verification', 'published', 'rejected', 'completed', 'cancelled');
	END IF;
END$$;

-- Safely add pending_verification and rejected if enum was already created with fewer values
ALTER TYPE event_status ADD VALUE IF NOT EXISTS 'pending_verification' BEFORE 'published';
ALTER TYPE event_status ADD VALUE IF NOT EXISTS 'rejected' AFTER 'published';

-- Create Enum for Registration Status (safe if already exists)
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registration_status') THEN
		CREATE TYPE registration_status AS ENUM ('registered', 'attended', 'cancelled');
	END IF;
END$$;