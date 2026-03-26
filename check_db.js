const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://nmnhppigarhbimklkjal.supabase.co', 'sb_publishable_QxXb7Z5uLSSaXE3jyd8zcQ_h6Uix7Tx');

async function test() {
  const { data, error } = await supabase.from('film_models').select('*');
  console.log('models:', data?.length, 'error:', error);
}
test();
