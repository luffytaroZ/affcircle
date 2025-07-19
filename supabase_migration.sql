-- ================================================================
-- SUPABASE DATABASE MIGRATION
-- Migration from MongoDB to PostgreSQL
-- ================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 1. VIDEOS TABLE
-- Replaces the 'videos' MongoDB collection
-- ================================================================
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    text TEXT DEFAULT '',
    images JSONB DEFAULT '[]'::jsonb,
    theme TEXT NOT NULL CHECK (theme IN ('minimal', 'corporate', 'storytelling', 'modern', 'creative', 'professional', 'elegant', 'cinematic')),
    duration INTEGER NOT NULL CHECK (duration IN (15, 30, 60)),
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    output_location TEXT,
    error TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX idx_videos_theme ON videos(theme);

-- ================================================================
-- 2. THREADS TABLE  
-- Replaces the 'threads' MongoDB collection
-- ================================================================
CREATE TABLE threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic TEXT NOT NULL,
    style TEXT NOT NULL CHECK (style IN ('engaging', 'educational', 'storytelling', 'professional', 'viral')),
    thread_length INTEGER NOT NULL CHECK (thread_length >= 1 AND thread_length <= 20),
    platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'instagram')),
    status TEXT NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    error TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_threads_status ON threads(status);
CREATE INDEX idx_threads_created_at ON threads(created_at DESC);
CREATE INDEX idx_threads_platform ON threads(platform);

-- ================================================================
-- 3. FUNNELS TABLE
-- Replaces the 'funnels' MongoDB collection  
-- ================================================================
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

-- Create indexes for better performance
CREATE INDEX idx_funnels_is_published ON funnels(is_published);
CREATE INDEX idx_funnels_created_at ON funnels(created_at DESC);
CREATE INDEX idx_funnels_subdomain ON funnels(subdomain) WHERE subdomain IS NOT NULL;

-- ================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- Security policies for multi-tenant access
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;

-- Videos policies - Allow all operations for now (can be restricted later)
CREATE POLICY "Videos are viewable by everyone" ON videos FOR SELECT USING (true);
CREATE POLICY "Videos are insertable by everyone" ON videos FOR INSERT WITH CHECK (true);
CREATE POLICY "Videos are updatable by everyone" ON videos FOR UPDATE USING (true);
CREATE POLICY "Videos are deletable by everyone" ON videos FOR DELETE USING (true);

-- Threads policies - Allow all operations for now (can be restricted later)
CREATE POLICY "Threads are viewable by everyone" ON threads FOR SELECT USING (true);
CREATE POLICY "Threads are insertable by everyone" ON threads FOR INSERT WITH CHECK (true);
CREATE POLICY "Threads are updatable by everyone" ON threads FOR UPDATE USING (true);
CREATE POLICY "Threads are deletable by everyone" ON threads FOR DELETE USING (true);

-- Funnels policies - Allow all operations for now (can be restricted later)
CREATE POLICY "Funnels are viewable by everyone" ON funnels FOR SELECT USING (true);
CREATE POLICY "Funnels are insertable by everyone" ON funnels FOR INSERT WITH CHECK (true);
CREATE POLICY "Funnels are updatable by everyone" ON funnels FOR UPDATE USING (true);
CREATE POLICY "Funnels are deletable by everyone" ON funnels FOR DELETE USING (true);

-- ================================================================
-- 5. TRIGGER FOR UPDATED_AT TIMESTAMP
-- Automatically update the updated_at field on funnels
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_funnels_updated_at 
    BEFORE UPDATE ON funnels 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 6. SAMPLE DATA (OPTIONAL - for testing)
-- ================================================================

-- Insert a sample video record
INSERT INTO videos (title, text, theme, duration, status) 
VALUES ('Sample Video', 'This is a sample video for testing', 'minimal', 30, 'completed');

-- Insert a sample thread record
INSERT INTO threads (topic, style, thread_length, platform, status, content) 
VALUES ('AI and Future of Work', 'professional', 5, 'linkedin', 'completed', 'Sample thread content here');

-- Insert a sample funnel record
INSERT INTO funnels (name, description, template_id) 
VALUES ('Sample Funnel', 'A sample funnel for testing', 'template-1');

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================

-- Show table summaries
SELECT 'videos' as table_name, COUNT(*) as record_count FROM videos
UNION ALL
SELECT 'threads' as table_name, COUNT(*) as record_count FROM threads  
UNION ALL
SELECT 'funnels' as table_name, COUNT(*) as record_count FROM funnels;