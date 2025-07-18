import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://odvwvfmsckkaqefdurvt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kdnd2Zm1zY2trYXFlZmR1cnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTU5NzgsImV4cCI6MjA2ODQzMTk3OH0.IjEbeRRldOI8Hej5BVNIJz7SSxTxB2g0DZoF7G2HVRk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)