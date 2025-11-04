-- WorkTimer Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  pause_duration INTEGER DEFAULT 0 NOT NULL, -- durée de pause en secondes
  total_duration INTEGER, -- durée totale en secondes (calculée)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_category_id ON sessions(category_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Since there's no authentication, we allow all operations
-- In a production environment with auth, you would restrict this
CREATE POLICY "Allow all on categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);

-- Function to automatically calculate total_duration when end_time is set
CREATE OR REPLACE FUNCTION calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.total_duration = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INTEGER - COALESCE(NEW.pause_duration, 0);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate duration
DROP TRIGGER IF EXISTS trigger_calculate_session_duration ON sessions;
CREATE TRIGGER trigger_calculate_session_duration
  BEFORE INSERT OR UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_session_duration();

-- Insert some default categories for testing
INSERT INTO categories (name, color) VALUES
  ('Développement', '#3b82f6'),
  ('Réunions', '#ef4444'),
  ('Formation', '#10b981'),
  ('Documentation', '#f59e0b')
ON CONFLICT DO NOTHING;
