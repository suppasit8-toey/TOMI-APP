import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// 15 Guaranteed, distinct valid Unsplash Image URLs for Architecture/Film
const images = [
  'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?q=80&w=2070&auto=format&fit=crop', // Glass modern
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2070&auto=format&fit=crop', // Suburb house
  'https://images.unsplash.com/photo-1522066547608-6ce56c70030c?q=80&w=2070&auto=format&fit=crop', // Building reflection
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop', // Abstract structure
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop', // Condo interior
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070&auto=format&fit=crop', // Luxury pool house
  'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop', // Office meeting room window
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=2070&auto=format&fit=crop', // Window film tint concept
  'https://images.unsplash.com/photo-1541882196657-36e2cc4ea4d8?q=80&w=2070&auto=format&fit=crop', // Tinted car window 
  'https://images.unsplash.com/photo-1511452810414-25de12ea66c7?q=80&w=2070&auto=format&fit=crop', // Modern architecture glass
  'https://images.unsplash.com/photo-1580828343064-fde4cad202d0?q=80&w=2070&auto=format&fit=crop', // Skyscraper
  'https://images.unsplash.com/photo-1616137684079-05cc586d6ca1?q=80&w=2070&auto=format&fit=crop', // Clean interior living
  'https://images.unsplash.com/photo-1577717903930-1b2c45e69e4f?q=80&w=2070&auto=format&fit=crop', // Blue glass pattern
  'https://images.unsplash.com/photo-1627956711902-1850d99ff9ef?q=80&w=2070&auto=format&fit=crop', // Sun reflection through class
  'https://images.unsplash.com/photo-1549488344-c6cc267e7275?q=80&w=2070&auto=format&fit=crop', // Sports car tint
];

async function run() {
  const { data, error } = await supabase.from('service_catalog').select('id, title').order('created_at', { ascending: true });
  if (!data || error) return console.log('Error', error);

  for (let i = 0; i < data.length; i++) {
    const img = images[i % images.length];
    await supabase.from('service_catalog').update({ image_url: img }).eq('id', data[i].id);
    console.log('Fixed', data[i].title);
  }
}
run();
