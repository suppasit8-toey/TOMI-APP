import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedCatalog() {
  const item = {
    slug: 'ติดฟิล์มกรองแสงรามอินทรา',
    title: 'ติดฟิล์มกรองแสงรามอินทรา | บริการระดับพรีเมียม',
    short_description: 'เย็นสบายมั่นใจทุกเส้นทางกับบริการติดฟิล์มกรองแสงรถยนต์และอาคารระดับพรีเมียมย่านรามอินทรา โดย TOMI FILM',
    keywords: 'ติดฟิล์มกรองแสงรามอินทรา, ฟิล์มกรองแสงรถยนต์ กรุงเทพ, ร้านติดฟิล์มรถยนต์, ฟิล์มอาคารวัชรพล',
    image_url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2070&auto=format&fit=crop',
    content: `
      <h2>บริการติดฟิล์มกรองแสงรามอินทรา</h2>
      <p>เย็นสบายมั่นใจทุกเส้นทางกับบริการติดฟิล์มกรองแสงรถยนต์ระดับพรีเมียมย่านรามอินทรา TOMI FILM คือคำตอบสำหรับทุกความต้องการของคุณเจ้าของรถและเจ้าของบ้านทุกท่าน</p>
      <ul>
        <li><strong>ฟิล์มกรองแสงคุณภาพสูง:</strong> คัดสรรแบรนด์ชั้นนำระดับโลก ป้องกันความร้อนและรังสี UV ได้อย่างดีเยี่ยม</li>
        <li><strong>ทีมช่างผู้เชี่ยวชาญ:</strong> ผ่านการฝึกอบรมมาอย่างดี มีประสบการณ์และความชำนาญสูง</li>
        <li><strong>บริการที่เหนือกว่า:</strong> ให้คำปรึกษาและออกแบบตามการใช้งานจริง พร้อมการรับประกันคุณภาพ</li>
      </ul>
      <p>เราพร้อมมอบประสบการณ์ที่เหนือระดับให้กับรถทุกรุ่นทุกยี่ห้อ รวมถึงบ้านและอาคารสำนักงาน ไม่ร้อน ขับรถสบาย อยู่บ้านเย็นใจ</p>
    `,
    brand_label: 'TOMI FILM',
    category_label: 'ฟิล์มกรองแสงรถยนต์และอาคาร'
  };

  const { data, error } = await supabase
    .from('service_catalog')
    .upsert(item, { onConflict: 'slug' });

  if (error) {
    console.error('Error seeding catalog:', error);
  } else {
    console.log('Successfully seeded catalog item: ติดฟิล์มกรองแสงรามอินทรา');
  }
}

seedCatalog();
