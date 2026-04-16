-- Database Setup Script for BidHub
-- Run this script as a PostgreSQL superuser (e.g., postgres)

-- Create database
CREATE DATABASE bidhub;

-- Create user (if not exists)
-- Note: Replace 'strongpassword' with a secure password
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'bidhub_user') THEN
        CREATE ROLE bidhub_user WITH LOGIN PASSWORD 'strongpassword';
    END IF;
END
$$;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE bidhub TO bidhub_user;

-- Connect to bidhub database
\c bidhub

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO bidhub_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO bidhub_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO bidhub_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO bidhub_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO bidhub_user;
