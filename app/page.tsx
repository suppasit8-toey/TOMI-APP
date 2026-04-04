import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRight, ShieldCheck, Thermometer, FacebookLogo, Phone, ChatCircleDots,
  Drop, Eye, Medal, ArrowUpRight, CheckCircle, Star, Buildings, House,
  Car, Wrench, ClockCountdown, Leaf, SunDim, Lock, Quotes, MapPin,
  CaretDown, Lightning, Handshake, Certificate, ListNumbers, Article
} from '@phosphor-icons/react/dist/ssr';
import { supabase } from '@/lib/supabase';
import AnimatedSection from '@/components/AnimatedSection';
import CounterAnimation from '@/components/CounterAnimation';
import LandingNavbar from '@/components/LandingNavbar';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  let seoTitle = 'TOMI FILM — บริการติดตั้งฟิล์มอาคารพรีเมียม กรุงเทพฯ';
  let seoDesc = 'TOMI FILM ผู้เชี่ยวชาญติดตั้งฟิล์มกันความร้อน ฟิล์มกรองแสง ฟิล์มนิรภัย สำหรับบ้าน อาคารสำนักงาน และรถยนต์ รับประกันยาวนาน ช่างมืออาชีพ ประเมินฟรี';
  try {
    const { data } = await supabase.from('landing_page_content').select('seo_title,seo_description').eq('id','00000000-0000-0000-0000-000000000001').single();
    if (data?.seo_title) seoTitle = data.seo_title;
    if (data?.seo_description) seoDesc = data.seo_description;
  } catch {}
  return {
    title: seoTitle,
    description: seoDesc,
    keywords: 'ฟิล์มกันความร้อน,ฟิล์มอาคาร,ติดฟิล์ม,TOMI FILM,ฟิล์มเซรามิค,ฟิล์มรถยนต์,กรุงเทพ',
    openGraph: { title: seoTitle, description: seoDesc, type: 'website', locale: 'th_TH' },
    twitter: { card: 'summary_large_image', title: seoTitle, description: seoDesc },
  };
}

export default async function LandingPage() {
  let content = {
    hero_title: 'TOMI FILM บริการติดตั้งฟิล์มอาคารพรีเมียม',
    hero_subtitle: 'ลดความร้อน ประหยัดพลังงาน ปกป้องสิ่งที่คุณรักด้วยฟิล์มคุณภาพสูง',
    about_text: 'TOMI FILM ก่อตั้งด้วยความมุ่งมั่นที่จะนำเสนอนวัตกรรมฟิล์มกรองแสงที่ดีที่สุดให้กับผู้ใช้งาน ไม่ว่าจะเป็นฟิล์มเซรามิคกันความร้อนสูง ฟิล์มใสสะท้อนแสง หรือฟิล์มปกป้องความเป็นส่วนตัว เราคัดสรรแบรนด์ฟิล์มชั้นนำและใช้ช่างที่มีความชำนาญสูง',
    contact_phone: '099-999-9999',
    contact_line_id: '@tomifilm.th',
    contact_facebook: 'https://facebook.com/tomifilm',
    hero_image_url: '',
    about_image_url: '',
    service1_image_url: '',
    service2_image_url: '',
    service3_image_url: '',
    services_tag: 'WHY CHOOSE US?',
    services_title: 'OUR SERVICES',
    service1_title: 'กันความร้อน 99%',
    service1_desc: 'ป้องกันรังสี IR และ UV อย่างมีประสิทธิภาพ ลดอุณหภูมิภายในอาคาร ประหยัดค่าไฟทันที',
    service2_title: 'ลดแสงจ้า ถนอมสายตา',
    service2_desc: 'กรองแสงแดดสะท้อน ชมวิวภายนอกได้ชัดเจนและสบายตาตลอดทั้งวัน',
    service3_title: 'รับประกันยาวนาน',
    service3_desc: 'ติดตั้งโดยช่างผู้เชี่ยวชาญ รับประกันคุณภาพฟิล์มและการติดตั้ง ไม่หลุดลอก ไม่พอง',
    trust_stat1_value: '10', trust_stat1_label: 'ปี+', trust_stat1_title: 'ประสบการณ์',
    trust_stat2_value: '1000', trust_stat2_label: '+', trust_stat2_title: 'โครงการ',
    trust_stat3_value: '99', trust_stat3_label: '%', trust_stat3_title: 'กันความร้อน',
    trust_stat4_value: '24/7', trust_stat4_label: '', trust_stat4_title: 'บริการ',
    cta_title: 'พร้อมเปลี่ยนอาคารของคุณให้เย็นสบายขึ้น?',
    cta_subtitle: 'ไม่ว่าคุณจะต้องการฟิล์มกันความร้อน ฟิล์มกรองแสง หรือฟิล์มนิรภัย เราพร้อมให้คำปรึกษาและแนะนำฟิล์มที่เหมาะสมที่สุดสำหรับคุณ ปรึกษาฟรี ไม่มีค่าใช้จ่าย',
    footer_description: 'ผู้เชี่ยวชาญด้านฟิล์มกรองแสงอาคาร บ้าน สำนักงาน และรถยนต์ ด้วยประสบการณ์กว่า 10 ปี',
  };

  let blogPosts: { id: string; title: string; slug: string; excerpt: string; cover_image_url: string; category: string; created_at: string }[] = [];

  try {
    const { data } = await supabase.from('landing_page_content').select('*').eq('id','00000000-0000-0000-0000-000000000001').single();
    if (data) content = { ...content, ...data };
  } catch {}

  try {
    const { data } = await supabase.from('blog_posts').select('id,title,slug,excerpt,cover_image_url,category,created_at').eq('published', true).order('created_at', { ascending: false }).limit(3);
    if (data) blogPosts = data;
  } catch {}

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'TOMI FILM',
    description: 'บริการติดตั้งฟิล์มกันความร้อน ฟิล์มกรองแสง ฟิล์มนิรภัย สำหรับอาคาร บ้าน สำนักงาน และรถยนต์',
    telephone: content.contact_phone,
    url: 'https://tomifilm.co.th',
    sameAs: [content.contact_facebook],
    address: { '@type': 'PostalAddress', addressRegion: 'กรุงเทพมหานคร', addressCountry: 'TH' },
    openingHours: 'Mo-Sa 08:00-18:00',
    priceRange: '฿฿',
  };

  const stat1Num = parseFloat(content.trust_stat1_value.replace(/,/g,'')) || 0;
  const stat2Num = parseFloat(content.trust_stat2_value.replace(/,/g,'')) || 0;
  const stat3Num = parseFloat(content.trust_stat3_value.replace(/,/g,'')) || 0;

  return (
    <div className="min-h-screen font-sans overflow-x-hidden bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ─── NAVBAR ─── */}
      <LandingNavbar />

      {/* ═══ 1. HERO ═══ */}
      <section className="pt-[72px] bg-white">
        <div className="grid md:grid-cols-2 min-h-[calc(100vh-72px)]">
          <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-16 md:py-0">
            <div className="max-w-xl">
              <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-black/30 mb-6 animate-fade-in-up">Premium Window Film</p>
              <h1 className="text-[36px] sm:text-[44px] lg:text-[56px] font-extrabold tracking-tight leading-[1.05] text-black uppercase animate-fade-in-up animation-delay-100" style={{ animationDelay: '100ms' }}>
                {content.hero_title}
              </h1>
              <p className="mt-6 text-black/40 text-base sm:text-lg leading-relaxed font-light animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                {content.hero_subtitle}
              </p>
              <div className="mt-10 flex flex-wrap gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <a href="#contact" className="group inline-flex items-center gap-2 px-8 py-3.5 text-[12px] font-bold tracking-[0.2em] uppercase bg-black text-white hover:bg-black/80 transition-all hover:scale-105">
                  ขอใบเสนอราคาฟรี <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="#services" className="group inline-flex items-center gap-2 px-8 py-3.5 text-[12px] font-bold tracking-[0.2em] uppercase border border-black/15 text-black/60 hover:border-black/40 hover:text-black transition-all">
                  ดูบริการ
                </a>
              </div>
            </div>
          </div>
          <div className="relative bg-black/5 min-h-[400px] md:min-h-0 overflow-hidden">
            {content.hero_image_url ? (
              <img src={content.hero_image_url} alt="TOMI FILM" className="absolute inset-0 w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-[2s]" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f35] to-[#0d1020] flex items-center justify-center">
                <div className="text-center">
                  <div className="grid grid-cols-2 gap-2 w-20 h-20 mx-auto mb-6 opacity-30">
                    {[0,1,2,3].map(i => <div key={i} className="bg-white rounded-[4px] animate-float" style={{ animationDelay: `${i*0.5}s` }} />)}
                  </div>
                  <div className="font-extrabold tracking-[0.5em] text-2xl text-white/60 uppercase">TOMI FILM</div>
                  <div className="mt-2 text-[9px] tracking-[0.5em] uppercase text-white/20 font-bold">Window Film Expert</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ 2. TRUST BAR ═══ */}
      <section className="bg-white border-y border-black/10">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-black/10">
            {[
              { title: content.trust_stat1_title, val: stat1Num, label: content.trust_stat1_label, raw: content.trust_stat1_value },
              { title: content.trust_stat2_title, val: stat2Num, label: content.trust_stat2_label, raw: content.trust_stat2_value },
              { title: content.trust_stat3_title, val: stat3Num, label: content.trust_stat3_label, raw: content.trust_stat3_value },
              { title: content.trust_stat4_title, val: 0, label: content.trust_stat4_label, raw: content.trust_stat4_value },
            ].map((item, i) => (
              <div key={i} className="py-10 sm:py-14 px-4 sm:px-8 text-center">
                <div className="text-[11px] tracking-[0.3em] uppercase text-black/30 font-bold mb-2">{item.title}</div>
                <div className="flex items-baseline justify-center gap-1">
                  {item.val > 0 ? (
                    <>
                      <CounterAnimation to={item.val} duration={2000} className="text-4xl sm:text-5xl font-black text-black tracking-tight" />
                      <span className="text-lg font-bold text-black/30">{item.label}</span>
                    </>
                  ) : (
                    <span className="text-4xl sm:text-5xl font-black text-black tracking-tight">{item.raw}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3. SERVICES ═══ */}
      <section id="services" className="bg-[#111318] text-white py-20 sm:py-28">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <AnimatedSection className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
            <div>
              <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-white/30 mb-3">{content.services_tag}</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase leading-[1.1]">
                {content.services_title.split(' ').map((w,i) => <span key={i}>{w}<br /></span>)}
              </h2>
            </div>
            <a href="#contact" className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors self-start sm:self-auto">
              ปรึกษาฟรี <ArrowRight weight="bold" />
            </a>
          </AnimatedSection>

          <AnimatedSection stagger className="grid md:grid-cols-3 gap-5">
            {[
              { title: content.service1_title, desc: content.service1_desc, img: content.service1_image_url, Icon: Thermometer, grad: 'from-blue-900/30 to-blue-950/50' },
              { title: content.service2_title, desc: content.service2_desc, img: content.service2_image_url, Icon: Eye, grad: 'from-slate-800/30 to-slate-900/50' },
              { title: content.service3_title, desc: content.service3_desc, img: content.service3_image_url, Icon: ShieldCheck, grad: 'from-indigo-900/30 to-indigo-950/50' },
            ].map((s, i) => (
              <div key={i} className="reveal group bg-white/[0.04] border border-white/[0.06] overflow-hidden hover:bg-white/[0.07] hover:-translate-y-1 transition-all duration-500">
                <div className="h-52 bg-white/[0.03] overflow-hidden">
                  {s.img ? (
                    <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${s.grad} flex items-center justify-center`}>
                      <s.Icon className="text-5xl text-white/15" weight="thin" />
                    </div>
                  )}
                </div>
                <div className="p-6 sm:p-8">
                  <h3 className="text-lg font-bold uppercase tracking-wide mb-2">{s.title}</h3>
                  <p className="text-white/35 text-sm leading-relaxed font-light">{s.desc}</p>
                </div>
              </div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ 4. SERVICE SCOPE ═══ */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <AnimatedSection className="text-center mb-14">
            <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-black/30 mb-3">SCOPE OF WORK</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase text-black leading-[1.1]">รับติดตั้งทุกประเภท</h2>
            <p className="mt-4 text-black/35 text-base font-light max-w-lg mx-auto">ไม่ว่าจะเป็นบ้าน คอนโด อาคารสำนักงาน หรือรถยนต์ เรามีทีมงานพร้อมบริการ</p>
          </AnimatedSection>
          <AnimatedSection stagger className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { Icon: House, title: 'บ้านพักอาศัย', desc: 'บ้านเดี่ยว ทาวน์โฮม บ้านแฝด' },
              { Icon: Buildings, title: 'อาคารสำนักงาน', desc: 'ออฟฟิศ คอนโด อาคารพาณิชย์' },
              { Icon: Car, title: 'รถยนต์', desc: 'ฟิล์มกรองแสงรถยนต์ทุกรุ่น' },
              { Icon: Wrench, title: 'งานโปรเจกต์', desc: 'โรงงาน โรงแรม ห้างสรรพสินค้า' },
            ].map((item, i) => (
              <div key={i} className="reveal group px-6 py-8 sm:py-10 border border-black/[0.06] bg-black/[0.01] hover:bg-black hover:text-white transition-all duration-500 text-center">
                <div className="text-black/20 group-hover:text-white/60 transition-colors mb-4 flex justify-center">
                  <item.Icon weight="regular" className="text-3xl sm:text-4xl" />
                </div>
                <h3 className="text-sm sm:text-base font-bold uppercase tracking-wide mb-1.5">{item.title}</h3>
                <p className="text-black/35 group-hover:text-white/35 text-xs sm:text-sm font-light transition-colors">{item.desc}</p>
              </div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ 5. FILM TYPES ═══ */}
      <section id="film-types" className="bg-[#111318] text-white py-20 sm:py-28">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <AnimatedSection className="text-center mb-14">
            <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-white/30 mb-3">OUR PRODUCTS</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase leading-[1.1]">ประเภทฟิล์ม</h2>
            <p className="mt-4 text-white/30 text-base font-light max-w-lg mx-auto">เราคัดสรรฟิล์มคุณภาพสูงจากแบรนด์ชั้นนำระดับโลก ตอบโจทย์ทุกความต้องการ</p>
          </AnimatedSection>
          <AnimatedSection stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { Icon: Thermometer, name: 'ฟิล์มเซรามิคกันความร้อน', features: ['ลดความร้อนสูงสุด 99%','ไม่บดบังทัศนวิสัย','ทนทาน ไม่ซีดจาง'], tag: 'Best Seller' },
              { Icon: SunDim, name: 'ฟิล์มกรองแสง UV', features: ['กรอง UV 99.9%','ป้องกันเฟอร์นิเจอร์ซีดจาง','ลดอุณหภูมิภายใน'], tag: null },
              { Icon: Lock, name: 'ฟิล์มนิรภัย', features: ['ป้องกันกระจกแตก','เพิ่มความปลอดภัย','กันขโมย กันระเบิด'], tag: null },
              { Icon: Eye, name: 'ฟิล์มกระจกสะท้อน', features: ['มองไม่เห็นจากภายนอก','ให้ความเป็นส่วนตัว','ดีไซน์โมเดิร์น'], tag: null },
              { Icon: Leaf, name: 'ฟิล์มประหยัดพลังงาน', features: ['ลดค่าไฟ 30-50%','ใส่ใจสิ่งแวดล้อม','คืนทุนภายใน 2 ปี'], tag: 'ECO' },
              { Icon: Drop, name: 'ฟิล์มกันน้ำ กันฝ้า', features: ['ป้องกันความชื้น','เหมาะกับห้องน้ำ','ทำความสะอาดง่าย'], tag: null },
            ].map((film, i) => (
              <div key={i} className="reveal group relative bg-white/[0.04] border border-white/[0.06] p-6 sm:p-8 hover:bg-white/[0.08] hover:-translate-y-1 transition-all duration-500">
                {film.tag && <span className="absolute top-4 right-4 text-[9px] tracking-[0.2em] uppercase font-black bg-white text-black px-2.5 py-1">{film.tag}</span>}
                <div className="text-white/30 mb-4"><film.Icon weight="regular" className="text-2xl" /></div>
                <h3 className="text-base sm:text-lg font-bold uppercase tracking-wide mb-4">{film.name}</h3>
                <ul className="space-y-2">
                  {film.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-white/35 text-sm font-light">
                      <CheckCircle weight="fill" className="text-white/20 text-sm shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ 6. WHY US ═══ */}
      <section className="bg-white py-20 sm:py-28 border-t border-black/5">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <AnimatedSection animation="reveal-left">
              <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-black/30 mb-4">WHY US?</p>
              <h2 className="text-3xl sm:text-4xl md:text-[44px] font-extrabold tracking-tight uppercase leading-[1.1] text-black mb-6">
                ทำไมต้อง<br />TOMI FILM?
              </h2>
              <p className="text-black/40 text-base leading-loose font-light max-w-lg">
                เราไม่ได้แค่ติดฟิล์ม เราให้โซลูชั่นที่ตอบโจทย์ทุกความต้องการอย่างครบวงจร ด้วยมาตรฐานระดับสากลและทีมงานที่คุณวางใจได้
              </p>
            </AnimatedSection>
            <AnimatedSection animation="reveal-right" stagger className="grid grid-cols-2 gap-4 sm:gap-5">
              {[
                { Icon: Certificate, title: 'ฟิล์มแท้มีใบรับรอง', desc: 'สินค้าแท้จากโรงงานพร้อมใบ Certificate' },
                { Icon: Handshake, title: 'ราคาโปร่งใส', desc: 'เสนอราคาชัดเจน ไม่มีค่าใช้จ่ายแอบแฝง' },
                { Icon: ClockCountdown, title: 'นัดหมายตรงเวลา', desc: 'เข้างานตรงเวลา เสร็จไว ไม่กวนวุ่นวาย' },
                { Icon: ShieldCheck, title: 'รับประกันงาน', desc: 'รับประกันฟิล์มและการติดตั้ง สูงสุด 10 ปี' },
                { Icon: Lightning, title: 'ประเมินราคาฟรี', desc: 'สำรวจหน้างานและเสนอราคาฟรี ไม่มีค่าใช้จ่าย' },
                { Icon: Star, title: 'ช่างผู้เชี่ยวชาญ', desc: 'ทีมช่างมืออาชีพ ผ่านการฝึกอบรมจากแบรนด์ฟิล์ม' },
              ].map((item, i) => (
                <div key={i} className="reveal px-5 py-6 border border-black/[0.06] hover:border-black/20 hover:shadow-sm transition-all duration-300">
                  <div className="text-black/25 mb-3"><item.Icon weight="regular" className="text-xl" /></div>
                  <h4 className="text-sm font-bold text-black mb-1">{item.title}</h4>
                  <p className="text-xs text-black/35 font-light leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══ 7. PROCESS ═══ */}
      <section id="process" className="bg-[#111318] text-white py-20 sm:py-28">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <AnimatedSection className="text-center mb-14">
            <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-white/30 mb-3">HOW IT WORKS</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase leading-[1.1]">ขั้นตอนการทำงาน</h2>
            <p className="mt-4 text-white/30 text-base font-light max-w-lg mx-auto">กระบวนการทำงานที่เป็นระบบ ให้คุณมั่นใจตั้งแต่ต้นจนจบ</p>
          </AnimatedSection>
          <AnimatedSection stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { step: '01', title: 'ปรึกษาและประเมินราคา', desc: 'ติดต่อเราเพื่อแจ้งรายละเอียด สำรวจหน้างานฟรี และรับใบเสนอราคาภายใน 24 ชม.' },
              { step: '02', title: 'เลือกฟิล์มที่เหมาะสม', desc: 'ทีมผู้เชี่ยวชาญช่วยแนะนำฟิล์มที่ตรงกับความต้องการ งบประมาณ และสภาพหน้างาน' },
              { step: '03', title: 'ติดตั้งโดยมืออาชีพ', desc: 'ช่างเข้าดำเนินการติดตั้ง ทำงานสะอาดเรียบร้อย ไม่ทิ้งคราบ ไม่เลอะกาว' },
              { step: '04', title: 'ตรวจสอบและรับประกัน', desc: 'ตรวจสอบคุณภาพก่อนส่งมอบงาน พร้อมใบรับประกันฟิล์มและการติดตั้ง' },
            ].map((item, i) => (
              <div key={i} className="reveal relative bg-white/[0.04] border border-white/[0.06] p-6 sm:p-8 hover:bg-white/[0.07] hover:-translate-y-1 transition-all duration-500">
                <span className="text-[48px] sm:text-[56px] font-black text-white/[0.04] absolute top-3 right-5 leading-none">{item.step}</span>
                <div className="relative">
                  <span className="text-[11px] font-black tracking-[0.3em] uppercase text-white/25 mb-4 block">STEP {item.step}</span>
                  <h3 className="text-base sm:text-lg font-bold uppercase tracking-wide mb-3">{item.title}</h3>
                  <p className="text-white/35 text-sm leading-relaxed font-light">{item.desc}</p>
                </div>
              </div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ 8. ABOUT ═══ */}
      <section id="about" className="bg-white">
        <div className="grid md:grid-cols-2">
          <AnimatedSection animation="reveal-left" className="relative min-h-[400px] md:min-h-[600px] bg-black/5 overflow-hidden">
            {content.about_image_url ? (
              <img src={content.about_image_url} alt="เกี่ยวกับ TOMI FILM" className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-[2s]" />
            ) : content.hero_image_url ? (
              <img src={content.hero_image_url} alt="TOMI FILM" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-[#111318] flex items-center justify-center">
                <div className="text-center">
                  <div className="grid grid-cols-2 gap-1.5 w-14 h-14 mx-auto mb-4 opacity-20">
                    {[0,1,2,3].map(i => <div key={i} className="bg-white rounded-[3px]" />)}
                  </div>
                  <div className="font-extrabold tracking-[0.5em] text-xl text-white/40 uppercase">TOMI FILM</div>
                </div>
              </div>
            )}
          </AnimatedSection>
          <AnimatedSection animation="reveal-right" className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-16 md:py-20">
            <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-black/30 mb-4">About Us</p>
            <h2 className="text-3xl sm:text-4xl md:text-[44px] font-extrabold tracking-tight uppercase leading-[1.1] text-black mb-8">
              EXCLUSIVE &<br />PROFESSIONAL<br />SERVICE
            </h2>
            <p className="text-black/40 text-base leading-loose font-light max-w-lg">{content.about_text}</p>
            <div className="flex gap-10 mt-10 pt-8 border-t border-black/10">
              {[{ Icon: Medal, label: 'ISO Certified' }, { Icon: Drop, label: 'Nano Ceramic' }, { Icon: ShieldCheck, label: 'Warranty' }].map(({ Icon, label }) => (
                <div key={label}>
                  <Icon weight="regular" className="text-xl text-black/25 mb-1.5" />
                  <div className="text-[10px] tracking-[0.2em] uppercase text-black/30 font-bold">{label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ 9. TESTIMONIALS ═══ */}
      <section className="bg-[#f7f8fa] py-20 sm:py-28 border-y border-black/5">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <AnimatedSection className="text-center mb-14">
            <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-black/30 mb-3">TESTIMONIALS</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase text-black leading-[1.1]">ลูกค้าพูดถึงเรา</h2>
          </AnimatedSection>
          <AnimatedSection stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { name: 'คุณสมชาย ว.', role: 'บ้านเดี่ยว บางนา', text: 'ติดฟิล์มกันความร้อนทั้งหลัง ได้ผลจริง อุณหภูมิในบ้านลดลงเยอะมาก ค่าไฟลดไป 40% ช่างทำงานดีมากครับ' },
              { name: 'คุณปิยะ ก.', role: 'คอนโด สาทร', text: 'ฟิล์มสวย ติดเรียบ ไม่มีฟองเลย ช่างมาตรงเวลา ทำงานเสร็จตามกำหนด ประทับใจมากค่ะ แนะนำเลย' },
              { name: 'คุณวิภา ศ.', role: 'สำนักงาน อโศก', text: 'ติดฟิล์มให้ออฟฟิศทั้งชั้น 30+ บาน ทำงานเรียบร้อยมาก พนักงานไม่บ่นเรื่องแดดเข้าอีกเลย ขอบคุณครับ' },
            ].map((review, i) => (
              <div key={i} className="reveal bg-white p-8 border border-black/[0.06] hover:shadow-md hover:-translate-y-1 transition-all duration-500">
                <Quotes weight="fill" className="text-3xl text-black/[0.06] mb-4" />
                <p className="text-black/45 text-sm leading-relaxed font-light mb-6">{review.text}</p>
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => <Star key={j} weight="fill" className="text-sm text-amber-400" />)}
                </div>
                <div className="border-t border-black/5 pt-4">
                  <div className="font-bold text-sm text-black">{review.name}</div>
                  <div className="text-xs text-black/30 font-light mt-0.5">{review.role}</div>
                </div>
              </div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ BLOG POSTS (ถ้ามี) ═══ */}
      {blogPosts.length > 0 && (
        <section className="bg-white py-20 sm:py-28 border-t border-black/5">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
            <AnimatedSection className="flex items-end justify-between mb-14">
              <div>
                <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-black/30 mb-3">KNOWLEDGE CENTER</p>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase text-black leading-[1.1]">บทความ &amp; เคล็ดลับ</h2>
              </div>
              <Link href="/blog" className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.2em] uppercase text-black/40 hover:text-black transition-colors">
                ดูทั้งหมด <ArrowRight weight="bold" />
              </Link>
            </AnimatedSection>
            <AnimatedSection stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {blogPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="reveal group block border border-black/[0.06] hover:border-black/15 hover:shadow-md hover:-translate-y-1 transition-all duration-500">
                  <div className="h-48 bg-black/5 overflow-hidden">
                    {post.cover_image_url ? (
                      <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <Article className="text-4xl text-slate-300" weight="thin" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-black/30 font-bold">{post.category}</span>
                    <h3 className="mt-2 font-bold text-black text-base leading-snug group-hover:text-black/70 transition-colors">{post.title}</h3>
                    {post.excerpt && <p className="mt-2 text-sm text-black/35 font-light line-clamp-2">{post.excerpt}</p>}
                  </div>
                </Link>
              ))}
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* ═══ 10. FAQ ═══ */}
      <section id="faq" className="bg-white py-20 sm:py-28 border-t border-black/5">
        <div className="max-w-[900px] mx-auto px-6 sm:px-10">
          <AnimatedSection className="text-center mb-14">
            <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-black/30 mb-3">FAQ</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase text-black leading-[1.1]">คำถามที่พบบ่อย</h2>
          </AnimatedSection>
          <AnimatedSection className="space-y-3">
            {[
              { q: 'ติดฟิล์มกันความร้อนจริงๆ ลดความร้อนได้กี่เปอร์เซ็นต์?', a: 'ฟิล์มเซรามิคระดับพรีเมียมของเราสามารถลดความร้อนจากรังสี IR ได้สูงสุดถึง 99% และกรองรังสี UV ได้ 99.9% ช่วยลดอุณหภูมิภายในอาคารได้ 5-10 องศา ประหยัดค่าไฟแอร์ได้อย่างเห็นผล' },
              { q: 'ใช้เวลาติดตั้งนานแค่ไหน?', a: 'ขึ้นอยู่กับจำนวนบานกระจก โดยทั่วไปบ้าน 1 หลัง (10-15 บาน) ใช้เวลาติดตั้งประมาณ 1-2 วัน สำนักงานขนาดใหญ่อาจใช้เวลา 3-5 วัน เราจะแจ้งกำหนดการที่ชัดเจนก่อนเริ่มงานทุกครั้ง' },
              { q: 'ฟิล์มรับประกันกี่ปี?', a: 'รับประกันฟิล์ม 5-10 ปี ขึ้นอยู่กับรุ่นฟิล์ม ครอบคลุมปัญหาฟิล์มซีดจาง หลุดลอก พอง หรือเปลี่ยนสี การรับประกันนี้ครอบคลุมทั้งตัวฟิล์มและงานติดตั้ง' },
              { q: 'ติดฟิล์มแล้วทำให้ห้องมืดไหม?', a: 'ไม่จำเป็น เรามีฟิล์มหลายระดับความเข้ม ตั้งแต่ระดับใส (VLT 70-80%) ไปจนถึงระดับเข้ม ทีมงานจะแนะนำระดับความเข้มที่เหมาะสมกับแต่ละห้องเพื่อให้ได้ทั้งความสว่างและการกันความร้อน' },
              { q: 'ราคาเริ่มต้นเท่าไหร่?', a: 'ราคาขึ้นอยู่กับชนิดฟิล์มและพื้นที่กระจก ท่านสามารถติดต่อเราเพื่อขอใบเสนอราคาฟรี โดยเราจะสำรวจหน้างานจริงก่อนตีราคา เพื่อให้ได้ราคาที่แม่นยำและเป็นธรรมที่สุด' },
              { q: 'สามารถลอกฟิล์มเก่าออกแล้วติดใหม่ได้ไหม?', a: 'ได้ครับ เรามีบริการลอกฟิล์มเก่าออกและทำความสะอาดกระจกก่อนติดฟิล์มใหม่ คิดค่าบริการเพิ่มเติมเล็กน้อย กระจกจะสะอาดเหมือนใหม่' },
            ].map((faq, i) => (
              <details key={i} className="group border border-black/[0.06] bg-black/[0.01] open:bg-white transition-colors">
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none select-none">
                  <span className="text-sm sm:text-base font-semibold text-black/80">{faq.q}</span>
                  <CaretDown weight="bold" className="text-black/25 shrink-0 group-open:rotate-180 transition-transform duration-300" />
                </summary>
                <div className="px-6 pb-5 pt-0">
                  <p className="text-sm text-black/40 font-light leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ 11. CTA ═══ */}
      <section className="bg-[#111318] text-white">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-20 sm:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="reveal-left">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase leading-[1.1]">
                {content.cta_title.split('?')[0]}?
              </h2>
            </AnimatedSection>
            <AnimatedSection animation="reveal-right" className="md:text-right">
              <p className="text-white/35 text-base leading-relaxed font-light max-w-md md:ml-auto mb-8">{content.cta_subtitle}</p>
              <a href="#contact" className="inline-flex items-center gap-2 px-8 py-3.5 text-[12px] font-bold tracking-[0.2em] uppercase bg-white text-black hover:bg-white/90 hover:scale-105 transition-all">
                ติดต่อเราเลย <ArrowRight weight="bold" />
              </a>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══ 12. CONTACT ═══ */}
      <section id="contact" className="bg-white py-20 sm:py-28 border-t border-black/10">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <AnimatedSection className="text-center mb-14">
            <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-black/30 mb-3">Contact Us</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase text-black leading-[1.1]">ติดต่อเรา</h2>
            <p className="mt-4 text-black/35 text-base font-light max-w-lg mx-auto">ติดต่อเราวันนี้เพื่อรับคำปรึกษาและประเมินราคาฟรี ทีมงานพร้อมให้บริการอย่างมืออาชีพ</p>
          </AnimatedSection>
          <AnimatedSection stagger className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
            <a href={`tel:${content.contact_phone}`} className="reveal group flex flex-col items-center gap-3 px-6 py-8 border border-black/10 bg-black/[0.02] hover:bg-black hover:text-white hover:border-black transition-all duration-300">
              <Phone className="text-2xl text-black/25 group-hover:text-white/70 transition-colors" weight="regular" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-black/25 group-hover:text-white/40 font-bold transition-colors">โทรศัพท์</span>
              <span className="text-black/70 group-hover:text-white font-semibold text-sm transition-colors">{content.contact_phone}</span>
            </a>
            <a href={`https://line.me/R/ti/p/${content.contact_line_id}`} target="_blank" className="reveal group flex flex-col items-center gap-3 px-6 py-8 border border-black/10 bg-black/[0.02] hover:bg-[#00B900] hover:text-white hover:border-[#00B900] transition-all duration-300">
              <ChatCircleDots className="text-2xl text-black/25 group-hover:text-white/70 transition-colors" weight="regular" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-black/25 group-hover:text-white/60 font-bold transition-colors">Line</span>
              <span className="text-black/70 group-hover:text-white font-semibold text-sm transition-colors">{content.contact_line_id}</span>
            </a>
            <a href={content.contact_facebook} target="_blank" className="reveal group flex flex-col items-center gap-3 px-6 py-8 border border-black/10 bg-black/[0.02] hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all duration-300">
              <FacebookLogo className="text-2xl text-black/25 group-hover:text-white/70 transition-colors" weight="regular" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-black/25 group-hover:text-white/60 font-bold transition-colors">Facebook</span>
              <span className="text-black/70 group-hover:text-white font-semibold text-sm transition-colors">Facebook Page</span>
            </a>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            <div className="px-6 py-6 border border-black/[0.06] bg-black/[0.01]">
              <div className="flex items-center gap-2 mb-3">
                <ClockCountdown weight="regular" className="text-lg text-black/25" />
                <h4 className="text-sm font-bold uppercase tracking-wide text-black">เวลาทำการ</h4>
              </div>
              <div className="space-y-1.5 text-sm text-black/40 font-light">
                <p>จันทร์ — เสาร์: 08:00 — 18:00 น.</p>
                <p>อาทิตย์: นัดหมายล่วงหน้า</p>
                <p className="text-black/25 text-xs">*เคสเร่งด่วน ติดต่อได้ตลอด 24 ชม.</p>
              </div>
            </div>
            <div className="px-6 py-6 border border-black/[0.06] bg-black/[0.01]">
              <div className="flex items-center gap-2 mb-3">
                <MapPin weight="regular" className="text-lg text-black/25" />
                <h4 className="text-sm font-bold uppercase tracking-wide text-black">พื้นที่ให้บริการ</h4>
              </div>
              <div className="space-y-1.5 text-sm text-black/40 font-light">
                <p>กรุงเทพฯ และปริมณฑล</p>
                <p>ต่างจังหวัด: บริการเฉพาะโปรเจกต์ขนาดใหญ่</p>
                <p className="text-black/25 text-xs">*กรณีต่างจังหวัดกรุณาสอบถามก่อน</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#111318] text-white border-t border-white/[0.05]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <div className="py-12 sm:py-16 grid sm:grid-cols-4 gap-10">
            <div className="sm:col-span-2">
              <span className="font-extrabold text-[14px] tracking-[0.3em] text-white/80 uppercase block mb-3">TOMI FILM</span>
              <p className="text-white/25 text-sm font-light leading-relaxed max-w-xs">{content.footer_description}</p>
            </div>
            <div>
              <h4 className="text-[10px] tracking-[0.3em] uppercase text-white/35 font-bold mb-4">Quick Links</h4>
              <div className="space-y-2">
                {[['#services','บริการของเรา'],['#film-types','ประเภทฟิล์ม'],['#process','ขั้นตอนการทำงาน'],['#faq','คำถามที่พบบ่อย'],['/blog','บทความ']].map(([href, label]) => (
                  <a key={href} href={href} className="block text-white/25 hover:text-white/60 text-sm font-light transition-colors">{label}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] tracking-[0.3em] uppercase text-white/35 font-bold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-white/25 font-light">
                <p>โทร: {content.contact_phone}</p>
                <p>Line: {content.contact_line_id}</p>
                <p>Facebook: TOMI FILM</p>
              </div>
            </div>
          </div>
          <div className="py-6 border-t border-white/[0.05] flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="font-extrabold text-[11px] tracking-[0.3em] text-white/20 uppercase">TOMI FILM</span>
            <div className="text-[11px] tracking-[0.15em] text-white/15 font-medium">
              &copy; {new Date().getFullYear()} TOMI FILM &mdash; All Rights Reserved
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
