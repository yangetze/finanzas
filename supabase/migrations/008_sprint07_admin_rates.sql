-- Migration: 008_sprint07_admin_rates
-- Sprint: 07 — Admin-only exchange rates & is_admin flag
-- Adds is_admin boolean to users table; grants admin role to yangetze+ro@gmail.com
-- Affected tables: users

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

UPDATE users SET is_admin = true WHERE email = 'yangetze+ro@gmail.com';
