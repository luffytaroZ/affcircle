import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://paftomwunpnqjnhurpfo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZnRvbXd1bnBucWpuaHVycGZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNjY3MzQsImV4cCI6MjA2Nzg0MjczNH0.xE9eApLWD-vwyhXH4W6E8iYhsy1uTP4MaaUzUAWwYrQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)