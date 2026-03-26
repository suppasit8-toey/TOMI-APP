const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://nmnhppigarhbimklkjal.supabase.co', 'sb_publishable_QxXb7Z5uLSSaXE3jyd8zcQ_h6Uix7Tx');

async function test() {
  const { data, error } = await supabase
      .from('film_models')
      .select(`
        *,
        supplier_film_prices (
          id, price, cost_per_meter, supplier_id,
          suppliers (name)
        )
      `);
  console.log('models:', data, 'error:', error);
}
test();
