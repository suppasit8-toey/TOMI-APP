const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://nmnhppigarhbimklkjal.supabase.co', 'sb_publishable_QxXb7Z5uLSSaXE3jyd8zcQ_h6Uix7Tx');

const specMap = {
  // CARBON FILM SERIES
  'ONYX BLACK 40': 'TSER 54%, VLT 34%, IRR 54%, UV 99%, รับประกัน 5 ปี',
  'ONYX BLACK 60': 'TSER 58%, VLT 17%, IRR 54%, UV 99%, รับประกัน 5 ปี',
  'ONYX BLACK 80': 'TSER 60%, VLT 5%, IRR 54%, UV 99%, รับประกัน 5 ปี',
  
  // CERAMIC FILM SERIES
  'ULTIMATE BLUE 70': 'TSER 48%, VLT 70%, IRR 91%, UV 99%, รับประกัน 7 ปี',
  'ULTIMATE 50': 'TSER 57%, VLT 51%, IRR 91%, UV 99%, รับประกัน 7 ปี',
  'ULTIMATE BLACK 40': 'TSER 62%, VLT 33%, IRR 92%, UV 99%, รับประกัน 7 ปี',
  'ULTIMATE BLACK 60': 'TSER 65%, VLT 19%, IRR 92%, UV 99%, รับประกัน 7 ปี',
  'ULTIMATE BLACK 80': 'TSER 72%, VLT 5%, IRR 95%, UV 100%, รับประกัน 7 ปี',
};

async function run() {
  const { data: posts, error } = await supabase.from('portfolio_posts').select('id, title, film_model, film_specs');
  if (error) {
    console.error('Error fetching posts:', error);
    return;
  }
  
  let updatedCount = 0;
  for (const p of posts) {
    if (p.film_model && specMap[p.film_model]) {
      const newSpecs = specMap[p.film_model];
      if (p.film_specs !== newSpecs) {
        console.log(`Updating [${p.title}] (${p.film_model}) -> ${newSpecs}`);
        const { error: updateError } = await supabase.from('portfolio_posts').update({ film_specs: newSpecs }).eq('id', p.id);
        if (updateError) {
          console.error(`Failed to update ${p.id}:`, updateError);
        } else {
          updatedCount++;
        }
      }
    }
  }
  console.log(`Finished updating ${updatedCount} posts.`);
}

run();
