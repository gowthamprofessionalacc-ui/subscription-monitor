const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://yldapugdzchplbefhmsn.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZGFwdWdkemNocGxiZWZobXNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxOTI2ODEsImV4cCI6MjA4NTc2ODY4MX0.Ye8L0zqfECv9A1m2uMCx4FzUZD-ULkALQtaIUy-Xk8A';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZGFwdWdkemNocGxiZWZobXNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE5MjY4MSwiZXhwIjoyMDg1NzY4NjgxfQ.KQcOAwHIGA1Hy1ucZEiAs6GfwlKCm3RnM_iynOcUrHw';

// Client for public operations (respects RLS)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for backend operations (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

module.exports = { supabase, supabaseAdmin };
