-- SIMPLIFIED SUPABASE MIGRATION - Run this if the previous script failed

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (to avoid conflicts)
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS threads CASCADE;
DROP TABLE IF EXISTS funnels CASCADE;

-- Create videos table
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    text TEXT DEFAULT '',
    images JSONB DEFAULT '[]'::jsonb,
    theme TEXT NOT NULL,
    duration INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'processing',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    output_location TEXT,
    error TEXT
);

-- Create threads table
CREATE TABLE threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic TEXT NOT NULL,
    style TEXT NOT NULL,
    thread_length INTEGER NOT NULL,
    platform TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'generating',
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    error TEXT
);

-- Create funnels table
CREATE TABLE funnels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    template_id TEXT,
    html_content TEXT DEFAULT '',
    css_styles TEXT DEFAULT '',
    published_url TEXT,
    subdomain TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    analytics JSONB DEFAULT '{"views": 0, "conversions": 0, "conversionRate": 0}'::jsonb,
    seo JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (allow all operations for now)
CREATE POLICY "Allow all on videos" ON videos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on threads" ON threads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on funnels" ON funnels FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data
INSERT INTO videos (title, text, theme, duration, status) 
VALUES ('Sample Video', 'This is a test video', 'minimal', 30, 'completed');

-- Verify tables were created
SELECT 'Migration completed successfully!' as message;
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name IN ('videos', 'threads', 'funnels')
ORDER BY table_name, ordinal_position;