const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://nmnhppigarhbimklkjal.supabase.co';
const supabaseKey = 'sb_publishable_QxXb7Z5uLSSaXE3jyd8zcQ_h6Uix7Tx';
const supabase = createClient(supabaseUrl, supabaseKey);

const expected = [
  'id', 'hero_title', 'hero_subtitle', 'about_text',
  'contact_phone', 'contact_line_id', 'contact_facebook',
  'hero_image_url', 'about_image_url',
  'service1_image_url', 'service2_image_url', 'service3_image_url',
  'services_tag', 'services_title',
  'service1_title', 'service1_desc',
  'service2_title', 'service2_desc',
  'service3_title', 'service3_desc',
  'trust_stat1_value', 'trust_stat1_label', 'trust_stat1_title',
  'trust_stat2_value', 'trust_stat2_label', 'trust_stat2_title',
  'trust_stat3_value', 'trust_stat3_label', 'trust_stat3_title',
  'trust_stat4_value', 'trust_stat4_label', 'trust_stat4_title',
  'cta_title', 'cta_subtitle',
  'footer_description',
  'seo_title', 'seo_description',
  'updated_at'
];

async function checkColumns() {
  const { data, error } = await supabase.from('landing_page_content').select('*').limit(1).single();
  if (data) {
    const existing = Object.keys(data);
    const missing = expected.filter(col => !existing.includes(col));
    console.log('---CHECK_REPORT---');
    if (missing.length === 0) {
      console.log('All expected columns exist.');
    } else {
      console.log('MISSING_COLUMNS:' + missing.join(', '));
    }
    console.log('EXISTING_COUNT:' + existing.length);
    console.log('---END_REPORT---');
  } else {
    console.error('ERROR:' + error.message);
  }
}
checkColumns();
