
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars: any = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listTables() {
  // Try a generic query first
  const { data, error } = await supabase.rpc('get_tables');
  if (error) {
     console.log("RPC get_tables failed, trying direct select");
     const { data: data2, error: error2 } = await supabase.from('blog_posts').select('*').limit(1);
     console.log("Query blog_posts error:", error2);
  } else {
     console.log("Tables:", data);
  }
}

listTables();
