const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://nmnhppigarhbimklkjal.supabase.co', 'sb_publishable_QxXb7Z5uLSSaXE3jyd8zcQ_h6Uix7Tx');

async function run() {
  const { data, error } = await supabase.from('portfolio_posts').select('id, title, film_model, film_specs');
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  data.forEach(p => {
    console.log(`[${p.id}] ${p.title} - Model: ${p.film_model} - Specs: ${p.film_specs?.substring(0,20)}...`);
  });
}

run();
