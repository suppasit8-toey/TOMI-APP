import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Fix dotenv loading specifically for .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE URL or KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const imagePool = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1541882196657-36e2cc4ea4d8?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2069&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522066547608-6ce56c70030c?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1627956711902-1850d99ff9ef?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1616137684079-05cc586d6ca1?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1577717903930-1b2c45e69e4f?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580828343064-fde4cad202d0?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1528615378274-17c45dca8aeb?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2070&auto=format&fit=crop',
];

async function updateImages() {
  console.log('Fetching catalogs...');
  const { data, error } = await supabase.from('service_catalog').select('id, slug');
  
  if (error) {
    console.error('Error fetching catalogs:', error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('No items found.');
    process.exit(0);
  }

  console.log(`Found ${data.length} catalogs.`);
  
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const imageUrl = imagePool[i % imagePool.length];
    
    console.log(`Updating [${i+1}/${data.length}] ${item.slug.substring(0, 20)}...`);
    const { error: updErr } = await supabase
      .from('service_catalog')
      .update({ image_url: imageUrl })
      .eq('id', item.id);
      
    if (updErr) {
      console.error(`Failed to update ${item.slug}:`, updErr.message);
    }
  }
  
  console.log('Finished updating ALL images successfully!');
  process.exit(0);
}

updateImages();
