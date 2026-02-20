-- Fix RLS and permissions for Galatea AI
-- Run this in Supabase SQL Editor to resolve 406 Not Acceptable errors

-- Disable Row Level Security on both tables
ALTER TABLE agent_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE agent_outputs DISABLE ROW LEVEL SECURITY;

-- Grant full permissions to all roles
GRANT ALL ON TABLE agent_projects TO anon, authenticated, service_role;
GRANT ALL ON TABLE agent_outputs TO anon, authenticated, service_role;
