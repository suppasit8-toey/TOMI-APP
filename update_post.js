const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://nmnhppigarhbimklkjal.supabase.co', 'sb_publishable_QxXb7Z5uLSSaXE3jyd8zcQ_h6Uix7Tx');

async function run() {
  const slug = 'ติดฟิล์มเซรามิคใส-50-ประชาสำราญ';
  const { data, error } = await supabase.from('portfolio_posts').select('*').eq('slug', slug).single();
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  console.log('Found post:', data.title);
  
  const updateData = {
    film_model: 'ULTIMATE 50',
    film_specs: 'TSER 57%, VLT 51%, IRR 91%, UV 99%, รับประกัน 7 ปี'
  };
  
  const { error: updateError } = await supabase.from('portfolio_posts').update(updateData).eq('id', data.id);
  if (updateError) {
    console.error('Error updating:', updateError);
  } else {
    console.log('Successfully updated post!');
  }
}

run();
