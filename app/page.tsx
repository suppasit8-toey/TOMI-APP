import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import {
  ArrowRight, ShieldCheck, Thermometer, FacebookLogo, Phone, ChatCircleDots,
  Drop, Eye, Medal, ArrowUpRight, CheckCircle, Star, Buildings, House,
  Car, Wrench, ClockCountdown, Leaf, SunDim, Lock, Quotes, MapPin,
  CaretDown, Lightning, Handshake, Certificate, ListNumbers, Article,
  Sparkle, MagnifyingGlass, CalendarCheck, ShieldPlus
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
    contact_phone: '0641792417',
    contact_line_id: '@tomifilm.th',
    contact_facebook: 'https://facebook.com/tomifilm',
    hero_image_url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2070&auto=format&fit=crop',
    about_image_url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=2070&auto=format&fit=crop',
    service1_image_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070&auto=format&fit=crop',
    service2_image_url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop',
    service3_image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop',
    services_tag: 'กลุ่มผลิตภัณฑ์พิเศษ',
    services_title: 'ความเชี่ยวชาญของเรา',
    service1_title: 'ระดับพรีเมียมสำหรับที่พักอาศัย',
    service1_desc: 'เปลี่ยนบ้านของคุณให้เป็นพื้นที่ที่เย็นสบายด้วยฟิล์มนาโนเซรามิคระดับโลก',
    service2_title: 'โซลูชั่นสำหรับองค์กร',
    service2_desc: 'เพิ่มประสิทธิภาพการทำงานและลดค่าใช้จ่ายด้านพลังงานสำหรับอาคารสำนักงานและองค์กร',
    service3_title: 'การปกป้องสำหรับยานยนต์',
    service3_desc: 'ปกป้องรถยนต์คันโปรดด้วยฟิล์มกรองแสงเกรดซูเปอร์พรีเมียมที่เคลียร์ใสแต่กันความร้อนสูงสุด',
    trust_stat1_value: '10', trust_stat1_label: 'ปี+', trust_stat1_title: 'ประสบการณ์',
    trust_stat2_value: '1000', trust_stat2_label: '+', trust_stat2_title: 'โครงการที่เสร็จสิ้น',
    trust_stat3_value: '99', trust_stat3_label: '%', trust_stat3_title: 'ระดับการกันความร้อน',
    trust_stat4_value: '24/7', trust_stat4_label: '', trust_stat4_title: 'ทีมที่ปรึกษา',
    cta_title: 'ยกระดับพื้นที่ของคุณตั้งแต่วันนี้',
    cta_subtitle: 'ไม่ว่าโจทย์ของคุณจะเป็นแบบไหน เรามีโซลูชั่นฟิล์มกรองแสงที่สมบูรณ์แบบรอคุณอยู่ ปรึกษาผู้เชี่ยวชาญของเราได้ทันที',
    footer_description: 'ผู้นำด้านนวัตกรรมฟิล์มกรองแสงระดับพรีเมียมสำหรับสถาปัตยกรรมและยานยนต์ มาตรฐานสากล',
  };

  try {
    const { data } = await supabase.from('landing_page_content').select('*').eq('id','00000000-0000-0000-0000-000000000001').single();
    if (data) {
        Object.keys(data).forEach(key => {
            if (data[key]) (content as any)[key] = data[key];
        });
    }
  } catch {}

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'TOMI FILM รับติดฟิล์มอาคาร',
    image: content.hero_image_url,
    '@id': 'https://www.xn--42cf2bdb5dorp5fubrbrf74a0b.com',
    url: 'https://www.xn--42cf2bdb5dorp5fubrbrf74a0b.com',
    telephone: content.contact_phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Tomifilm',
      addressLocality: 'Bangkok',
      addressCountry: 'TH'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 13.85440899490734,
      longitude: 100.80680307620034
    },
    priceRange: '฿฿',
    description: content.hero_subtitle
  };

  return (
    <div className="min-h-screen font-sans bg-slate-950 text-white selection:bg-blue-600 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingNavbar />

      {/* ═══ 1. ULTRA-PREMIUM HERO ═══ */}
      <section className="relative min-h-[100vh] flex items-center pt-24 overflow-hidden">
        {/* Cinematic Backdrop */}
        <div className="absolute inset-0 z-0">
          <Image src={content.hero_image_url || '/images/hero/banner.png'} alt="TOMI FILM – ฟิล์มกรองแสงอาคาร" fill priority className="object-cover opacity-40 scale-105" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
        </div>

        {/* Animated Accent Line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60 animate-shimmer" />

        {/* Floating Decorative Elements */}
        <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[180px] animate-pulse" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-indigo-600/8 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-blue-400/5 rounded-full blur-[100px] animate-blob" />

        <div className="container mx-auto px-6 lg:px-20 relative z-10">
          <div className="max-w-5xl">
            <AnimatedSection animation="reveal" className="mb-10">
               <div className="inline-flex items-center gap-4 px-5 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl shrink-0">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  <p className="text-[10px] font-black tracking-wide uppercase text-white/70">ผู้เชี่ยวชาญด้านฟิล์มสถาปัตยกรรมระดับสากล</p>
               </div>
            </AnimatedSection>
            
            <h1 className="text-[56px] sm:text-[84px] lg:text-[120px] font-black tracking-[-0.04em] leading-[0.85] uppercase mb-12">
              <span className="block animate-fade-in-up">นิยามใหม่</span>
              <span className="block italic font-light tracking-tight text-slate-500 lowercase ml-2 animate-fade-in-up animation-delay-100">แห่งความ</span>
              <span className="block animate-fade-in-up animation-delay-200 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-blue-400/60">เย็นสบาย.</span>
            </h1>
            
            <p className="text-slate-400 text-xl sm:text-2xl leading-relaxed mb-16 max-w-2xl font-light animate-fade-in-up animation-delay-300">
               {content.hero_subtitle} ยกระดับการใช้ชีวิตด้วยเทคโนโลยีที่มองไม่เห็น แต่สัมผัสได้ถึงความเย็นสบาย
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-8 animate-fade-in-up animation-delay-400">
              <a href="#contact" className="group relative h-20 w-full sm:w-auto px-16 bg-blue-600 overflow-hidden rounded-full flex items-center justify-center transition-all duration-700 hover:scale-105 active:scale-95 shadow-2xl shadow-blue-600/30">
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <span className="relative text-[13px] font-black tracking-wide uppercase">ปรึกษาเบื้องต้น</span>
                 <ArrowRight weight="bold" className="relative ml-4 group-hover:translate-x-2 transition-transform" />
              </a>
              <a href="/catalog" className="text-[12px] font-black tracking-wide uppercase text-white/40 hover:text-white transition-all underline underline-offset-[12px] decoration-white/10 hover:decoration-white">
                เลือกชมแคตตาล็อกสินค้า
              </a>
            </div>
          </div>
        </div>

        {/* Floating Stats Badge */}
        <div className="hidden lg:flex absolute right-20 bottom-32 z-10 flex-col items-center gap-6 animate-fade-in-up animation-delay-700">
           <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 text-center">
              <p className="text-5xl font-black text-white mb-1">10+</p>
              <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">ปี ประสบการณ์</p>
           </div>
           <div className="bg-blue-600/20 backdrop-blur-2xl border border-blue-500/20 rounded-[32px] p-8 text-center">
              <p className="text-5xl font-black text-blue-400 mb-1">99%</p>
              <p className="text-[9px] font-black text-blue-300/40 uppercase tracking-[0.3em]">กันความร้อน</p>
           </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30">
           <div className="w-[1px] h-20 bg-gradient-to-b from-white to-transparent" />
           <p className="text-[9px] font-black tracking-wide uppercase vertical-rl">เลื่อนลง</p>
        </div>
      </section>

      {/* ═══ 2. FEATURE BENTO GRID ═══ */}
      <section id="services" className="py-40 bg-slate-950 border-y border-white/5 relative">
         <div className="container mx-auto px-6 lg:px-20">
            <div className="grid lg:grid-cols-12 gap-8 h-auto lg:h-[850px]">
               {/* Large Featured Card */}
               <AnimatedSection animation="reveal-left" className="lg:col-span-7 h-full">
                  <div className="group h-full relative rounded-[48px] overflow-hidden bg-slate-900 border border-white/5">
                     <Image src={content.service1_image_url} alt="Residential" fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover opacity-40 group-hover:scale-110 transition-transform duration-[2s]" />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                     <div className="absolute inset-0 p-16 flex flex-col justify-between">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-2xl rounded-3xl flex items-center justify-center border border-white/10">
                           <House weight="fill" className="text-4xl text-blue-500" />
                        </div>
                        <div>
                           <span className="text-[11px] font-black tracking-wide uppercase text-blue-500 mb-6 block">01 / ที่พักอาศัย</span>
                           <h3 className="text-[48px] font-black leading-none uppercase mb-8">{content.service1_title}</h3>
                           <p className="text-slate-400 text-lg leading-relaxed max-w-md font-light">{content.service1_desc}</p>
                        </div>
                     </div>
                  </div>
               </AnimatedSection>
               
               {/* Vertical Column */}
               <div className="lg:col-span-5 flex flex-col gap-8 h-full">
                  <AnimatedSection animation="reveal-right" className="flex-1">
                     <div className="group h-full relative rounded-[48px] overflow-hidden bg-slate-900 border border-white/5 p-12 flex flex-col justify-between">
                        <Image src={content.service2_image_url} alt="Corporate" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover opacity-20 group-hover:scale-110 transition-transform duration-[2s]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                        <div className="relative z-10 flex justify-between items-start">
                           <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                              <Buildings weight="fill" className="text-3xl text-white" />
                           </div>
                           <ArrowUpRight weight="bold" className="text-white text-3xl opacity-20 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="relative z-10">
                           <span className="text-[10px] font-black tracking-wide uppercase text-blue-400 mb-4 block">02 / ธุรกิจและองค์กร</span>
                           <h3 className="text-3xl font-black text-white uppercase mb-4">{content.service2_title}</h3>
                           <p className="text-slate-400 text-sm font-light leading-relaxed">{content.service2_desc}</p>
                        </div>
                     </div>
                  </AnimatedSection>
                  
                  <AnimatedSection animation="reveal-right" className="flex-1">
                     <div className="group h-full relative rounded-[48px] overflow-hidden bg-slate-900 border border-white/5">
                        <Image src={content.service3_image_url} alt="Automotive" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover opacity-20 group-hover:scale-110 transition-transform duration-[2s]" />
                        <div className="absolute inset-0 p-12 flex flex-col justify-between">
                           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/30">
                              <Car weight="fill" className="text-3xl text-white" />
                           </div>
                           <div>
                              <span className="text-[10px] font-black tracking-wide uppercase text-blue-500 mb-4 block">03 / ยานยนต์</span>
                              <h3 className="text-3xl font-black text-white uppercase mb-4">{content.service3_title}</h3>
                              <p className="text-slate-500 text-sm font-light leading-relaxed">{content.service3_desc}</p>
                           </div>
                        </div>
                     </div>
                  </AnimatedSection>
               </div>
            </div>
         </div>
      </section>

      {/* ═══ 3. TECHNICAL SPEC & LUXURY FEATURE CARDS ═══ */}
      <section id="film-types" className="py-40 bg-white text-slate-950 overflow-hidden">
         <div className="container mx-auto px-6 lg:px-20">
            <div className="flex flex-col lg:flex-row gap-20 items-center mb-32">
               <div className="lg:w-1/2">
                  <p className="text-blue-600 text-[11px] font-black tracking-wide uppercase mb-8">ประสิทธิภาพของฟิล์ม</p>
                  <h2 className="text-[56px] lg:text-[80px] font-black leading-[0.9] uppercase tracking-tighter mb-12">
                    ทัศนวิสัย<br /><span className="text-slate-300">คมชัด.</span><br />การปกป้องสูงสุด.
                  </h2>
                  <div className="grid grid-cols-2 gap-10">
                     {[
                        { val: '99%', label: 'กันรังสีความร้อน (IR)', color: 'text-blue-600' },
                        { val: '100%', label: 'ป้องกันรังสี UV', color: 'text-slate-900' },
                        { val: '-8°C', label: 'ลดอุณหภูมิภายใน', color: 'text-blue-500' },
                        { val: 'ไม่มี', label: 'รบกวนสัญญาณ', color: 'text-slate-400' },
                     ].map((item, i) => (
                        <div key={i}>
                           <p className={`text-4xl font-black mb-1 ${item.color}`}>{item.val}</p>
                           <p className="text-[10px] font-black tracking-wide uppercase text-slate-400">{item.label}</p>
                        </div>
                     ))}
                  </div>
               </div>
               
               {/* ─── IMPROVED FEATURE CARDS ─── */}
               <div className="lg:w-1/2">
                  <div className="grid grid-cols-2 gap-6 w-full">
                     {[
                       { icon: ShieldPlus, text: 'ฟิล์มนิรภัย', desc: 'เสริมความแข็งแกร่งให้กระจก', hover: 'bg-blue-600' },
                       { icon: Sparkle, text: 'พรีเมียมคมชัด', desc: 'คมชัดทุกทัศนวิสัย', hover: 'bg-slate-900' },
                       { icon: Drop, text: 'ป้องกันกระจกแตก', desc: 'ป้องกันกระจกแตกกระจาย', hover: 'bg-indigo-600' },
                       { icon: SunDim, text: 'ลดแสงสะท้อน', desc: 'ลดแสงสะท้อนรบกวนตา', hover: 'bg-slate-700' },
                     ].map((feat, i) => (
                       <AnimatedSection key={i} animation="reveal-scale" style={{ transitionDelay: `${i * 100}ms` }} className="h-full">
                          <div className={`group relative h-full aspect-square rounded-[40px] p-8 sm:p-10 flex flex-col justify-between transition-all duration-500 overflow-hidden bg-slate-50 hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-2`}>
                             {/* Hover Overlay */}
                             <div className={`absolute inset-0 ${feat.hover} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                             
                             <div className="relative z-10 w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                                <feat.icon weight="duotone" className="text-3xl text-blue-600 group-hover:animate-pulse" />
                             </div>
                             
                             <div className="relative z-10">
                                <h4 className="text-[13px] font-black tracking-wide uppercase text-slate-900 group-hover:text-white transition-colors mb-2">{feat.text}</h4>
                                <p className="text-[10px] font-medium text-slate-400 group-hover:text-white/60 transition-colors uppercase tracking-wide">{feat.desc}</p>
                             </div>
                             
                             {/* Decorative Corner Icon */}
                             <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-20 transition-opacity rotate-12">
                                <feat.icon weight="fill" className="text-8xl text-slate-900 group-hover:text-white" />
                             </div>
                          </div>
                       </AnimatedSection>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* ═══ 3.5 PROCESS SECTION ═══ */}
      <section id="process" className="py-40 bg-slate-950 relative overflow-hidden">
         <div className="container mx-auto px-6 lg:px-20 relative z-10">
            <div className="text-center mb-20 lg:mb-32">
               <p className="text-blue-500 text-[11px] font-black tracking-wide uppercase mb-8">มาตรฐานการทำงานสากล</p>
               <h2 className="text-[56px] lg:text-[80px] font-black leading-[0.9] uppercase tracking-tighter text-white">
                 เส้นทางสู่<br /><span className="text-white/20">ความสมบูรณ์แบบ.</span>
               </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
               {[
                 { 
                   step: '01', title: 'การให้คำปรึกษา', desc: 'ทีมผู้เชี่ยวชาญศึกษาโจทย์และความต้องการ เพื่อแนะนำฟิล์มที่เหมาะสมที่สุด',
                   img: '/images/process/consultation.png' 
                 },
                 { 
                   step: '02', title: 'วัดขนาดอย่างแม่นยำ', desc: 'วัดขนาดกระจกด้วยความละเอียดสูงสุด เพื่อการตัดฟิล์มที่พอดีไร้ที่ติ',
                   img: '/images/process/measurement.png' 
                 },
                 { 
                   step: '03', title: 'ติดตั้งมืออาชีพ', desc: 'ติดตั้งโดยทีมช่างชำนาญการในห้องควบคุมฝุ่น มาตรฐานสากล',
                   img: '/images/process/installation.png' 
                 },
                 { 
                   step: '04', title: 'ตรวจสอบคุณภาพ', desc: 'ตรวจสอบความเรียบร้อย 100% ก่อนส่งมอบงานคุณภาพระดับพรีเมียม',
                   img: '/images/process/quality-check.png' 
                 },
               ].map((item, i) => (
                 <AnimatedSection key={i} animation="reveal" style={{ transitionDelay: `${i * 150}ms` }} className="h-full">
                    <div className="group relative h-full aspect-[3/4] rounded-[40px] overflow-hidden border border-white/5 bg-slate-900">
                       <Image src={item.img} alt={item.title} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover opacity-30 group-hover:scale-110 transition-transform duration-[1.5s]" />
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                       <div className="absolute inset-0 p-10 flex flex-col justify-end">
                          <span className="text-4xl font-black text-blue-500 mb-4 block opacity-40 group-hover:opacity-100 transition-opacity italic">{item.step}</span>
                          <h4 className="text-xl font-black text-white uppercase mb-4 tracking-tighter">{item.title}</h4>
                          <p className="text-slate-400 text-xs font-light leading-relaxed">{item.desc}</p>
                       </div>
                    </div>
                 </AnimatedSection>
               ))}
            </div>
         </div>
      </section>

      {/* ═══ 4. ULTRA-MINIMAL FAQ ═══ */}
      <section id="faq" className="py-40 bg-slate-950">
         <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-24">
               <h2 className="text-5xl font-black lowercase italic tracking-tight mb-4">ข้อมูลเจาะลึก.</h2>
               <p className="text-slate-500 font-light tracking-wide uppercase text-[10px]">ทุกสิ่งที่คุณควรทราบเกี่ยวกับบริการของเรา</p>
            </div>
            
            <div className="space-y-4">
               {[
                  { q: 'ทำไมต้องนาโนเซรามิค?', a: 'นาโนเซรามิคคือเทคโนโลยีขั้นสูงที่ไม่ใช้โลหะ ทำให้ฟิล์มไม่สะท้อนแสงเหมือนกระจกเงา แต่กันความร้อนได้ดีกว่า และไม่บล็อกสัญญาณทุกชนิด' },
                  { q: 'มาตรฐานการติดตั้ง', a: 'เราใช้เทคนิคการติดตั้งแบบไร้รอยต่อ และล้างกระจกด้วยน้ำยาเกรดพรีเมียม เพื่อให้มั่นใจว่าจะไม่มีฝุ่นหรือฟองอากาศรบกวนสายตา' },
                  { q: 'คู่มือการดูแลรักษา', a: 'ฟิล์มของเราทำความสะอาดง่าย เพียงใช้น้ำเปล่าหรือน้ำยาเช็ดกระจกสูตรอ่อนโยน ฟิล์มจะยังคงความใสเหมือนใหม่ยาวนานนับสิบปี' },
               ].map((item, i) => (
                  <details key={i} className="group border-b border-white/5 py-4">
                     <summary className="flex items-center justify-between cursor-pointer list-none py-6">
                        <span className="text-xl font-bold uppercase tracking-tight text-white/80 group-open:text-blue-500 transition-colors">{item.q}</span>
                        <CaretDown weight="bold" className="text-white/20 group-open:rotate-180 transition-transform" />
                     </summary>
                     <div className="pb-10 pt-2">
                        <p className="text-slate-500 text-lg font-light leading-relaxed max-w-2xl">{item.a}</p>
                     </div>
                  </details>
               ))}
            </div>
         </div>
      </section>

      {/* ═══ 4.5 ABOUT SECTION ═══ */}
      <section id="about" className="py-40 bg-white text-slate-900 border-t border-slate-100 overflow-hidden">
         <div className="container mx-auto px-6 lg:px-20">
            <div className="flex flex-col lg:flex-row items-center gap-20">
               <div className="lg:w-1/2 relative">
                  <div className="aspect-[4/5] relative rounded-[60px] overflow-hidden shadow-2xl">
                     <Image src={content.about_image_url} alt="About TOMI FILM" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                  </div>
                  {/* Floating Certificate Card */}
                  <div className="absolute -bottom-10 -right-10 bg-blue-600 p-8 rounded-[40px] text-white shadow-2xl max-w-xs animate-float">
                     <Medal weight="duotone" className="text-4xl mb-4" />
                     <p className="text-sm font-black tracking-wide uppercase mb-2">การรับรองความเป็นเลิศ</p>
                     <p className="text-xs text-white/60 leading-relaxed font-light">เราคัดสรรฟิล์มเกรดพรีเมียมพร้อมการรับรองมาตรฐานสากล เพื่อความมั่นใจในทุกการติดตั้ง</p>
                  </div>
               </div>
               <div className="lg:w-1/2">
                  <p className="text-blue-600 text-[11px] font-black tracking-wide uppercase mb-8">ประวัติและความน่าเชื่อถือ</p>
                  <h2 className="text-[56px] lg:text-[72px] font-black leading-[0.95] tracking-tighter uppercase mb-12">
                    ตำนานแห่ง<br /><span className="text-slate-300">ความแม่นยำ.</span>
                  </h2>
                  <div className="space-y-8 max-w-xl">
                     <p className="text-slate-500 text-lg font-light leading-relaxed">
                        {content.about_text}
                     </p>
                     <p className="text-slate-500 text-lg font-light leading-relaxed">
                        ด้วยวิสัยทัศน์ที่มุ่งเน้นความเป็นเลิศ เราจึงเลือกใช้เฉพาะเทคโนโลยีฟิล์มกรองแสงล่าสุดที่ผ่านการทดสอบในสภาวะอากาศที่สุดขั้วของเมืองไทย
                     </p>
                  </div>
                  <div className="pt-12 mt-12 border-t border-slate-100 flex items-center gap-8">
                     <div className="flex -space-x-4">
                        {[1,2,3,4].map(i => (
                           <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-sm relative">
                              <Image src={`https://i.pravatar.cc/150?u=${i}`} alt="Client" fill sizes="48px" className="object-cover" />
                           </div>
                        ))}
                     </div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                       ได้รับความไว้วางใจจาก <span className="text-slate-900">500+ โครงการหรู</span> ทั่วกรุงเทพฯ
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* ═══ 5. CTA EXCLUSIVE ═══ */}
      <section id="contact" className="py-40 bg-blue-600 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[60%] h-full bg-slate-950 -skew-x-[20deg] translate-x-40" />
         <div className="container mx-auto px-6 lg:px-20 relative z-10">
            <div className="grid lg:grid-cols-2 items-center gap-20">
               <div>
                  <h2 className="text-[64px] lg:text-[84px] font-black leading-[0.85] text-white uppercase mb-12">
                    พร้อมสัมผัส<br />การปกป้อง<br />ระดับพรีเมียม?
                  </h2>
                  <p className="text-white/60 text-xl font-light mb-12 max-w-sm">ยกระดับมาตรฐานพื้นที่ของคุณด้วยบริการระดับไฮเอนด์จาก TOMI FILM</p>
               </div>
               <div className="flex flex-col gap-6">
                  <a href={`tel:${content.contact_phone}`} className="h-24 bg-white text-slate-950 rounded-[32px] flex items-center justify-between px-10 group hover:bg-slate-100 transition-all">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1">ติดต่อผู้เชี่ยวชาญ</span>
                        <span className="text-2xl font-black">{content.contact_phone}</span>
                     </div>
                     <Phone weight="fill" className="text-3xl text-blue-600 group-hover:rotate-12 transition-transform" />
                  </a>
                  <a href={`https://line.me/R/ti/p/${content.contact_line_id}`} className="h-24 bg-slate-900 border border-white/10 text-white rounded-[32px] flex items-center justify-between px-10 group hover:bg-slate-800 transition-all">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-wide mb-1">บัญชี Line ทางการ</span>
                        <span className="text-2xl font-black">{content.contact_line_id}</span>
                     </div>
                     <ChatCircleDots weight="fill" className="text-3xl text-[#00B900]" />
                  </a>
               </div>
            </div>
         </div>
      </section>

      {/* ═══ 6. LOCATION / MAP ═══ */}
      <section className="bg-slate-950 pt-20 pb-0 border-t border-white/5 relative z-10 w-full">
         <div className="container mx-auto px-6 lg:px-20 mb-12">
            <div className="flex items-center gap-4 mb-4 animate-fade-in-up">
               <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center">
                   <MapPin weight="fill" className="text-2xl text-blue-500" />
               </div>
               <h2 className="text-2xl font-black text-white uppercase">จุดให้บริการ / ที่ตั้งสาขา</h2>
            </div>
            <p className="text-slate-400 font-light max-w-2xl text-lg animate-fade-in-up animation-delay-100">
               ยินดีต้อนรับสู่โชว์รูม TOMI FILM เข้ามารับคำปรึกษาพร้อมสัมผัสตัวอย่างฟิล์มทุกรุ่นด้วยตัวคุณเอง เพื่อการตัดสินใจที่สมบูรณ์แบบที่สุด
            </p>
         </div>
         {/* Google Maps Embed iframe */}
         <div className="w-full h-[50vh] min-h-[400px] relative hover:shadow-[0_-20px_50px_-20px_rgba(37,99,235,0.3)] transition-all duration-700 bg-slate-900">
            <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 pointer-events-none z-10"></div>
            <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3873.743840064821!2d100.80680307620034!3d13.85440899490734!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d6f325370fe2f%3A0xd57523b4463380ad!2zVG9taSBmaWxtIC0g4Lif4Li04Lil4LmM4Lih4Lit4Liy4LiE4Liy4LijIOC4n-C4tOC4peC5jOC4oeC4geC4o-C4reC4h-C5geC4quC4hw!5e0!3m2!1sth!2sth!4v1775696210675!5m2!1sth!2sth" 
                className="absolute inset-0 w-full h-full border-0 filter grayscale invert-[10%] hue-rotate-180 opacity-70 hover:filter-none hover:opacity-100 transition-all duration-[1s]" 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade">
            </iframe>
            {/* Soft gradient overlay on top of map to blend with background */}
            <div className="absolute inset-0 bg-slate-950/20 pointer-events-none transition-opacity duration-[1s] hover:opacity-0"></div>
         </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-950 py-24 border-t border-white/5">
         <div className="container mx-auto px-6 lg:px-20">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-20 mb-20">
               <div className="max-w-sm">
                  <span className="text-3xl font-black tracking-tighter uppercase mb-10 block">TOMIFILM.</span>
                  <p className="text-slate-500 font-light leading-loose text-sm italic">
                    "มอบสิ่งที่ดีที่สุดให้กับกระจกทุกบาน คือพันธกิจที่เรายึดถือมาตลอดทศวรรษ"
                  </p>
               </div>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
                  <div>
                     <h4 className="text-[10px] font-black text-white uppercase tracking-wide mb-8">เมนู</h4>
                     <ul className="space-y-4 text-xs font-bold text-slate-600 uppercase tracking-wide">
                        <li><a href="#services" className="hover:text-blue-500 transition-colors">ผลงานติดตั้ง</a></li>
                        <li><a href="#film-types" className="hover:text-blue-500 transition-colors">แคตตาล็อก</a></li>
                        <li><a href="/blog" className="hover:text-blue-500 transition-colors">บทความ</a></li>
                     </ul>
                  </div>
                  <div>
                     <h4 className="text-[10px] font-black text-white uppercase tracking-wide mb-8">ติดตามเรา</h4>
                     <ul className="space-y-4 text-xs font-bold text-slate-600 uppercase tracking-wide">
                        <li><a href="#" className="hover:text-blue-500 transition-colors">IG</a></li>
                        <li><a href="#" className="hover:text-blue-500 transition-colors">FB</a></li>
                        <li><a href="#" className="hover:text-blue-500 transition-colors">LI</a></li>
                     </ul>
                  </div>
               </div>
            </div>
            <div className="pt-12 border-t border-white/[0.03] flex justify-between items-center text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">
               <span>&copy; 2026 TOMI FILM ARCHITECTURAL</span>
               <span>Bangkok &mdash; Thailand</span>
            </div>
         </div>
      </footer>
    </div>
  );
}
