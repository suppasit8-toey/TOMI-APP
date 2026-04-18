?import Link from 'next/link';
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
  let seoTitle = 'TOMI FILM — �?ริ�?ารติดตั�?�?�?ิล�?มอา�?าร�?รีเมียม �?รุ�?เท�?ฯ';
  let seoDesc = 'TOMI FILM �?ู�?เ�?ี�?ยว�?า�?ติดตั�?�?�?ิล�?ม�?ั�?�?วามร�?อ�? �?ิล�?ม�?รอ�?�?ส�? �?ิล�?ม�?ิรภัย สำหรั�?�?�?า�? อา�?ารสำ�?ั�?�?า�? �?ละรถย�?ต�? รั�?�?ระ�?ั�?ยาว�?า�? �?�?า�?มืออา�?ี�? �?ระเมิ�?�?รี';
  try {
    const { data } = await supabase.from('landing_page_content').select('seo_title,seo_description').eq('id','00000000-0000-0000-0000-000000000001').single();
    if (data?.seo_title) seoTitle = data.seo_title;
    if (data?.seo_description) seoDesc = data.seo_description;
  } catch {}
  return {
    title: seoTitle,
    description: seoDesc,
    keywords: '�?ิล�?ม�?ั�?�?วามร�?อ�?,�?ิล�?มอา�?าร,ติด�?ิล�?ม,TOMI FILM,�?ิล�?มเ�?รามิ�?,�?ิล�?มรถย�?ต�?,�?รุ�?เท�?',
    openGraph: { title: seoTitle, description: seoDesc, type: 'website', locale: 'th_TH' },
    twitter: { card: 'summary_large_image', title: seoTitle, description: seoDesc },
  };
}

export default async function LandingPage() {
  let content = {
    hero_title: 'TOMI FILM �?ริ�?ารติดตั�?�?�?ิล�?มอา�?าร�?รีเมียม',
    hero_subtitle: 'ลด�?วามร�?อ�? �?ระหยัด�?ลั�?�?า�? �?�?�?�?อ�?สิ�?�?ที�?�?ุณรั�?ด�?วย�?ิล�?ม�?ุณภา�?สู�?',
    about_text: 'TOMI FILM �?�?อตั�?�?ด�?วย�?วามมุ�?�?มั�?�?ที�?�?ะ�?ำเส�?อ�?วัต�?รรม�?ิล�?ม�?รอ�?�?ส�?ที�?ดีที�?สุด�?ห�?�?ั�?�?ู�?�?�?�?�?า�? �?ม�?ว�?า�?ะเ�?�?�?�?ิล�?มเ�?รามิ�?�?ั�?�?วามร�?อ�?สู�? �?ิล�?ม�?สสะท�?อ�?�?ส�? หรือ�?ิล�?ม�?�?�?�?อ�?�?วามเ�?�?�?ส�?ว�?ตัว เรา�?ัดสรร�?�?ร�?ด�?�?ิล�?ม�?ั�?�?�?ำ�?ละ�?�?�?�?�?า�?ที�?มี�?วาม�?ำ�?า�?สู�?',
    contact_phone: '0641792417',
    contact_line_id: '@tomifilm.th',
    contact_facebook: 'https://facebook.com/tomifilm',
    hero_image_url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2070&auto=format&fit=crop',
    about_image_url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=2070&auto=format&fit=crop',
    service1_image_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070&auto=format&fit=crop',
    service2_image_url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop',
    service3_image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop',
    services_tag: '�?ลุ�?ม�?ลิตภัณฑ�?�?ิเศษ',
    services_title: '�?วามเ�?ี�?ยว�?า�?�?อ�?เรา',
    service1_title: 'ระดั�?�?รีเมียมสำหรั�?ที�?�?ั�?อาศัย',
    service1_desc: 'เ�?ลี�?ย�?�?�?า�?�?อ�?�?ุณ�?ห�?เ�?�?�?�?ื�?�?ที�?ที�?เย�?�?ส�?ายด�?วย�?ิล�?ม�?า�?�?เ�?รามิ�?ระดั�?�?ล�?',
    service2_title: '�?�?ลู�?ั�?�?สำหรั�?อ�?�?�?�?ร',
    service2_desc: 'เ�?ิ�?ม�?ระสิท�?ิภา�?�?ารทำ�?า�?�?ละลด�?�?า�?�?�?�?�?ายด�?า�?�?ลั�?�?า�?สำหรั�?อา�?ารสำ�?ั�?�?า�?�?ละอ�?�?�?�?ร',
    service3_title: '�?าร�?�?�?�?อ�?สำหรั�?ยา�?ย�?ต�?',
    service3_desc: '�?�?�?�?อ�?รถย�?ต�?�?ั�?�?�?รดด�?วย�?ิล�?ม�?รอ�?�?ส�?เ�?รด�?ูเ�?อร�?�?รีเมียมที�?เ�?ลียร�?�?ส�?ต�?�?ั�?�?วามร�?อ�?สู�?สุด',
    trust_stat1_value: '10', trust_stat1_label: '�?ี+', trust_stat1_title: '�?ระส�?�?ารณ�?',
    trust_stat2_value: '1000', trust_stat2_label: '+', trust_stat2_title: '�?�?ร�?�?ารที�?เสร�?�?สิ�?�?',
    trust_stat3_value: '99', trust_stat3_label: '%', trust_stat3_title: 'ระดั�?�?าร�?ั�?�?วามร�?อ�?',
    trust_stat4_value: '24/7', trust_stat4_label: '', trust_stat4_title: 'ทีมที�?�?รึ�?ษา',
    cta_title: 'ย�?ระดั�?�?ื�?�?ที�?�?อ�?�?ุณตั�?�?�?ต�?วั�?�?ี�?',
    cta_subtitle: '�?ม�?ว�?า�?�?ทย�?�?อ�?�?ุณ�?ะเ�?�?�?�?�?�?�?ห�? เรามี�?�?ลู�?ั�?�?�?ิล�?ม�?รอ�?�?ส�?ที�?สม�?ูรณ�?�?�?�?รอ�?ุณอยู�? �?รึ�?ษา�?ู�?เ�?ี�?ยว�?า�?�?อ�?เรา�?ด�?ทั�?ที',
    footer_description: '�?ู�?�?ำด�?า�?�?วัต�?รรม�?ิล�?ม�?รอ�?�?ส�?ระดั�?�?รีเมียมสำหรั�?สถา�?ัตย�?รรม�?ละยา�?ย�?ต�? มาตร�?า�?สา�?ล',
  };

  try {
    const { data } = await supabase.from('landing_page_content').select('*').eq('id','00000000-0000-0000-0000-000000000001').single();
    if (data) {
        Object.keys(data).forEach(key => {
            if (data[key]) (content as any)[key] = data[key];
        });
    }
  } catch {}

  return (
    <div className="min-h-screen font-sans bg-slate-950 text-white selection:bg-blue-600 selection:text-white">
      <LandingNavbar />

      {/* �?�?�? 1. ULTRA-PREMIUM HERO �?�?�? */}
      <section className="relative min-h-[100vh] flex items-center pt-24 overflow-hidden">
        {/* Cinematic Backdrop */}
        <div className="absolute inset-0 z-0">
          <img src={content.hero_image_url} alt="Masterpiece Architecture" className="w-full h-full object-cover opacity-30 scale-105 animate-float" style={{ animationDuration: '20s' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)]" />
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto px-6 lg:px-20 relative z-10">
          <div className="max-w-5xl">
            <AnimatedSection animation="reveal" className="mb-10">
               <div className="inline-flex items-center gap-4 px-5 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl shrink-0">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  <p className="text-[10px] font-black uppercase text-white/70">�?ู�?เ�?ี�?ยว�?า�?ด�?า�?�?ิล�?มสถา�?ัตย�?รรมระดั�?สา�?ล</p>
               </div>
            </AnimatedSection>
            
            <h1 className="text-[56px] sm:text-[84px] lg:text-[120px] font-black leading-tight xl:leading-none uppercase mb-12">
              <span className="block animate-fade-in-up">�?ิยาม�?หม�?</span>
              <span className="block italic font-light text-slate-500 lowercase ml-2 animate-fade-in-up animation-delay-100">�?ห�?�?�?วาม</span>
              <span className="block animate-fade-in-up animation-delay-200 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">เย�?�?ส�?าย.</span>
            </h1>
            
            <p className="text-slate-400 text-xl sm:text-2xl leading-relaxed mb-16 max-w-2xl font-light animate-fade-in-up animation-delay-300">
               {content.hero_subtitle} ย�?ระดั�?�?าร�?�?�?�?ีวิตด�?วยเท�?�?�?�?ลยีที�?มอ�?�?ม�?เห�?�? �?ต�?สัม�?ัส�?ด�?ถึ�?�?วามเย�?�?ส�?าย
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-8 animate-fade-in-up animation-delay-400">
              <a href="#contact" className="group relative h-20 w-full sm:w-auto px-16 bg-blue-600 overflow-hidden rounded-full flex items-center justify-center transition-all duration-700 hover:scale-105 active:scale-95 shadow-2xl shadow-blue-600/30">
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <span className="relative text-[13px] font-black tracking-[0.3em] uppercase">�?รึ�?ษาเ�?ื�?อ�?ต�?�?</span>
                 <ArrowRight weight="bold" className="relative ml-4 group-hover:translate-x-2 transition-transform" />
              </a>
              <a href="/catalog" className="text-[12px] font-black uppercase text-white/40 hover:text-white transition-all underline underline-offset-[12px] decoration-white/10 hover:decoration-white">
                เลือ�?�?ม�?�?ตตาล�?อ�?สิ�?�?�?า
              </a>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30">
           <div className="w-[1px] h-20 bg-gradient-to-b from-white to-transparent" />
           <p className="text-[9px] font-black uppercase vertical-rl">เลื�?อ�?ล�?</p>
        </div>
      </section>

      {/* �?�?�? 2. FEATURE BENTO GRID �?�?�? */}
      <section id="services" className="py-40 bg-slate-950 border-y border-white/5 relative">
         <div className="container mx-auto px-6 lg:px-20">
            <div className="grid lg:grid-cols-12 gap-8 h-auto lg:h-[850px]">
               {/* Large Featured Card */}
               <AnimatedSection animation="reveal-left" className="lg:col-span-7 h-full">
                  <div className="group h-full relative rounded-[48px] overflow-hidden bg-slate-900 border border-white/5">
                     <img src={content.service1_image_url} alt="Residential" className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-[2s]" />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                     <div className="absolute inset-0 p-16 flex flex-col justify-between">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-2xl rounded-3xl flex items-center justify-center border border-white/10">
                           <House weight="fill" className="text-4xl text-blue-500" />
                        </div>
                        <div>
                           <span className="text-[11px] font-black uppercase text-blue-500 mb-6 block">01 / ที�?�?ั�?อาศัย</span>
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
                        <img src={content.service2_image_url} alt="Corporate" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-[2s]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                        <div className="relative z-10 flex justify-between items-start">
                           <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                              <Buildings weight="fill" className="text-3xl text-white" />
                           </div>
                           <ArrowUpRight weight="bold" className="text-white text-3xl opacity-20 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="relative z-10">
                           <span className="text-[10px] font-black uppercase text-blue-400 mb-4 block">02 / �?ุร�?ิ�?�?ละอ�?�?�?�?ร</span>
                           <h3 className="text-3xl font-black text-white uppercase mb-4">{content.service2_title}</h3>
                           <p className="text-slate-400 text-sm font-light leading-relaxed">{content.service2_desc}</p>
                        </div>
                     </div>
                  </AnimatedSection>
                  
                  <AnimatedSection animation="reveal-right" className="flex-1">
                     <div className="group h-full relative rounded-[48px] overflow-hidden bg-slate-900 border border-white/5">
                        <img src={content.service3_image_url} alt="Automotive" className="w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-[2s]" />
                        <div className="absolute inset-0 p-12 flex flex-col justify-between">
                           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/30">
                              <Car weight="fill" className="text-3xl text-white" />
                           </div>
                           <div>
                              <span className="text-[10px] font-black uppercase text-blue-500 mb-4 block">03 / ยา�?ย�?ต�?</span>
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

      {/* �?�?�? 3. TECHNICAL SPEC & LUXURY FEATURE CARDS �?�?�? */}
      <section id="film-types" className="py-40 bg-white text-slate-950 overflow-hidden">
         <div className="container mx-auto px-6 lg:px-20">
            <div className="flex flex-col lg:flex-row gap-20 items-center mb-32">
               <div className="lg:w-1/2">
                  <p className="text-blue-600 text-[11px] font-black tracking-[0.5em] uppercase mb-8">�?ระสิท�?ิภา�?�?อ�?�?ิล�?ม</p>
                  <h2 className="text-[56px] lg:text-[80px] font-black leading-tight xl:leading-none uppercase mb-12">
                    ทัศ�?วิสัย<br /><span className="text-slate-300">�?ม�?ัด.</span><br />�?าร�?�?�?�?อ�?สู�?สุด.
                  </h2>
                  <div className="grid grid-cols-2 gap-10">
                     {[
                        { val: '99%', label: '�?ั�?รั�?สี�?วามร�?อ�? (IR)', color: 'text-blue-600' },
                        { val: '100%', label: '�?�?อ�?�?ั�?รั�?สี UV', color: 'text-slate-900' },
                        { val: '-8°C', label: 'ลดอุณหภูมิภาย�?�?', color: 'text-blue-500' },
                        { val: '�?ม�?มี', label: 'ร�?�?ว�?สั�?�?าณ', color: 'text-slate-400' },
                     ].map((item, i) => (
                        <div key={i}>
                           <p className={`text-4xl font-black mb-1 ${item.color}`}>{item.val}</p>
                           <p className="text-[10px] font-black uppercase text-slate-400">{item.label}</p>
                        </div>
                     ))}
                  </div>
               </div>
               
               {/* ─── IMPROVED FEATURE CARDS ─── */}
               <div className="lg:w-1/2">
                  <div className="grid grid-cols-2 gap-6 w-full">
                     {[
                       { icon: ShieldPlus, text: '�?ิล�?ม�?ิรภัย', desc: 'เสริม�?วาม�?�?�?�?�?�?ร�?�?�?ห�?�?ระ�?�?', hover: 'bg-blue-600' },
                       { icon: Sparkle, text: '�?รีเมียม�?ม�?ัด', desc: '�?ม�?ัดทุ�?ทัศ�?วิสัย', hover: 'bg-slate-900' },
                       { icon: Drop, text: '�?�?อ�?�?ั�?�?ระ�?�?�?ต�?', desc: '�?�?อ�?�?ั�?�?ระ�?�?�?ต�?�?ระ�?าย', hover: 'bg-indigo-600' },
                       { icon: SunDim, text: 'ลด�?ส�?สะท�?อ�?', desc: 'ลด�?ส�?สะท�?อ�?ร�?�?ว�?ตา', hover: 'bg-slate-700' },
                     ].map((feat, i) => (
                       <AnimatedSection key={i} animation="reveal-scale" style={{ transitionDelay: `${i * 100}ms` }} className="h-full">
                          <div className={`group relative h-full aspect-square rounded-[40px] p-8 sm:p-10 flex flex-col justify-between transition-all duration-500 overflow-hidden bg-slate-50 hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-2`}>
                             {/* Hover Overlay */}
                             <div className={`absolute inset-0 ${feat.hover} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                             
                             <div className="relative z-10 w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                                <feat.icon weight="duotone" className="text-3xl text-blue-600 group-hover:animate-pulse" />
                             </div>
                             
                             <div className="relative z-10">
                                <h4 className="text-[13px] font-black uppercase text-slate-900 group-hover:text-white transition-colors mb-2">{feat.text}</h4>
                                <p className="text-[10px] font-medium text-slate-400 group-hover:text-white/60 transition-colors uppercase">{feat.desc}</p>
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

      {/* �?�?�? 3.5 PROCESS SECTION �?�?�? */}
      <section id="process" className="py-40 bg-slate-950 relative overflow-hidden">
         <div className="container mx-auto px-6 lg:px-20 relative z-10">
            <div className="text-center mb-20 lg:mb-32">
               <p className="text-blue-500 text-[11px] font-black tracking-[0.5em] uppercase mb-8">มาตร�?า�?�?ารทำ�?า�?สา�?ล</p>
               <h2 className="text-[56px] lg:text-[80px] font-black leading-tight xl:leading-none uppercase text-white">
                 เส�?�?ทา�?สู�?<br /><span className="text-white/20">�?วามสม�?ูรณ�?�?�?�?.</span>
               </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
               {[
                 { 
                   step: '01', title: '�?าร�?ห�?�?ำ�?รึ�?ษา', desc: 'ทีม�?ู�?เ�?ี�?ยว�?า�?ศึ�?ษา�?�?ทย�?�?ละ�?วามต�?อ�?�?าร เ�?ื�?อ�?�?ะ�?ำ�?ิล�?มที�?เหมาะสมที�?สุด',
                   img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1000' 
                 },
                 { 
                   step: '02', title: 'Precision Measure', desc: 'วัด�?�?าด�?ระ�?�?ด�?วย�?วามละเอียดสู�?สุด เ�?ื�?อ�?ารตัด�?ิล�?มที�?�?อดี�?ร�?ที�?ติ',
                   img: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1000' 
                 },
                 { 
                   step: '03', title: 'Professional Install', desc: 'ติดตั�?�?�?ดยทีม�?�?า�?�?ำ�?า�?�?าร�?�?ห�?อ�?�?ว�?�?ุม�?ุ�?�? มาตร�?า�?สา�?ล',
                   img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000' 
                 },
                 { 
                   step: '04', title: 'Quality Audit', desc: 'ตรว�?สอ�?�?วามเรีย�?ร�?อย 100% �?�?อ�?ส�?�?มอ�?�?า�?�?ุณภา�?ระดั�?�?รีเมียม',
                   img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1000' 
                 },
               ].map((item, i) => (
                 <AnimatedSection key={i} animation="reveal" style={{ transitionDelay: `${i * 150}ms` }} className="h-full">
                    <div className="group relative h-full aspect-[3/4] rounded-[40px] overflow-hidden border border-white/5 bg-slate-900">
                       <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-[1.5s]" />
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                       <div className="absolute inset-0 p-10 flex flex-col justify-end">
                          <span className="text-4xl font-black text-blue-500 mb-4 block opacity-40 group-hover:opacity-100 transition-opacity italic">{item.step}</span>
                          <h4 className="text-xl font-black text-white uppercase mb-4">{item.title}</h4>
                          <p className="text-slate-400 text-xs font-light leading-relaxed">{item.desc}</p>
                       </div>
                    </div>
                 </AnimatedSection>
               ))}
            </div>
         </div>
      </section>

      {/* �?�?�? 4. ULTRA-MINIMAL FAQ �?�?�? */}
      <section id="faq" className="py-40 bg-slate-950">
         <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-24">
               <h2 className="text-5xl font-black lowercase italic mb-4">�?�?อมูลเ�?าะลึ�?.</h2>
               <p className="text-slate-500 font-light uppercase text-[10px]">ทุ�?สิ�?�?ที�?�?ุณ�?วรทรา�?เ�?ี�?ยว�?ั�?�?ริ�?าร�?อ�?เรา</p>
            </div>
            
            <div className="space-y-4">
               {[
                  { q: 'ทำ�?มต�?อ�?�?า�?�?เ�?รามิ�??', a: '�?า�?�?เ�?รามิ�?�?ือเท�?�?�?�?ลยี�?ั�?�?สู�?ที�?�?ม�?�?�?�?�?ลหะ ทำ�?ห�?�?ิล�?ม�?ม�?สะท�?อ�?�?ส�?เหมือ�?�?ระ�?�?เ�?า �?ต�?�?ั�?�?วามร�?อ�?�?ด�?ดี�?ว�?า �?ละ�?ม�?�?ล�?อ�?สั�?�?าณทุ�?�?�?ิด' },
                  { q: 'มาตร�?า�?�?ารติดตั�?�?', a: 'เรา�?�?�?เท�?�?ิ�?�?ารติดตั�?�?�?�?�?�?ร�?รอยต�?อ �?ละล�?า�?�?ระ�?�?ด�?วย�?�?ำยาเ�?รด�?รีเมียม เ�?ื�?อ�?ห�?มั�?�?�?�?ว�?า�?ะ�?ม�?มี�?ุ�?�?หรือ�?อ�?อา�?าศร�?�?ว�?สายตา' },
                  { q: '�?ู�?มือ�?ารดู�?ลรั�?ษา', a: '�?ิล�?ม�?อ�?เราทำ�?วามสะอาด�?�?าย เ�?ีย�?�?�?�?�?�?ำเ�?ล�?าหรือ�?�?ำยาเ�?�?ด�?ระ�?�?สูตรอ�?อ�?�?ย�? �?ิล�?ม�?ะยั�?�?�?�?วาม�?สเหมือ�?�?หม�?ยาว�?า�?�?ั�?สิ�?�?ี' },
               ].map((item, i) => (
                  <details key={i} className="group border-b border-white/5 py-4">
                     <summary className="flex items-center justify-between cursor-pointer list-none py-6">
                        <span className="text-xl font-bold uppercase text-white/80 group-open:text-blue-500 transition-colors">{item.q}</span>
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

      {/* �?�?�? 4.5 ABOUT SECTION �?�?�? */}
      <section id="about" className="py-40 bg-white text-slate-900 border-t border-slate-100 overflow-hidden">
         <div className="container mx-auto px-6 lg:px-20">
            <div className="flex flex-col lg:flex-row items-center gap-20">
               <div className="lg:w-1/2 relative">
                  <div className="aspect-[4/5] relative rounded-[60px] overflow-hidden shadow-2xl">
                     <img src={content.about_image_url} alt="About TOMI FILM" className="w-full h-full object-cover" />
                  </div>
                  {/* Floating Certificate Card */}
                  <div className="absolute -bottom-10 -right-10 bg-blue-600 p-8 rounded-[40px] text-white shadow-2xl max-w-xs animate-float">
                     <Medal weight="duotone" className="text-4xl mb-4" />
                     <p className="text-sm font-black uppercase mb-2">�?ารรั�?รอ�?�?วามเ�?�?�?เลิศ</p>
                     <p className="text-xs text-white/60 leading-relaxed font-light">เรา�?ัดสรร�?ิล�?มเ�?รด�?รีเมียม�?ร�?อม�?ารรั�?รอ�?มาตร�?า�?สา�?ล เ�?ื�?อ�?วามมั�?�?�?�?�?�?ทุ�?�?ารติดตั�?�?</p>
                  </div>
               </div>
               <div className="lg:w-1/2">
                  <p className="text-blue-600 text-[11px] font-black tracking-[0.5em] uppercase mb-8">�?ระวัติ�?ละ�?วาม�?�?าเ�?ื�?อถือ</p>
                  <h2 className="text-[56px] lg:text-[72px] font-black leading-tight xl:leading-none uppercase mb-12">
                    ตำ�?า�?�?ห�?�?<br /><span className="text-slate-300">�?วาม�?ม�?�?ยำ.</span>
                  </h2>
                  <div className="space-y-8 max-w-xl">
                     <p className="text-slate-500 text-lg font-light leading-relaxed">
                        {content.about_text}
                     </p>
                     <p className="text-slate-500 text-lg font-light leading-relaxed">
                        ด�?วยวิสัยทัศ�?�?ที�?มุ�?�?เ�?�?�?�?วามเ�?�?�?เลิศ เรา�?ึ�?เลือ�?�?�?�?เ�?�?าะเท�?�?�?�?ลยี�?ิล�?ม�?รอ�?�?ส�?ล�?าสุดที�?�?�?า�?�?ารทดสอ�?�?�?สภาวะอา�?าศที�?สุด�?ั�?ว�?อ�?เมือ�?�?ทย
                     </p>
                  </div>
                  <div className="pt-12 mt-12 border-t border-slate-100 flex items-center gap-8">
                     <div className="flex -space-x-4">
                        {[1,2,3,4].map(i => (
                           <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-sm">
                              <img src={`https://i.pravatar.cc/150?u=${i}`} alt="Client" />
                           </div>
                        ))}
                     </div>
                     <p className="text-[10px] font-black text-slate-400 uppercase">
                       �?ด�?รั�?�?วาม�?ว�?วา�?�?�?�?า�? <span className="text-slate-900">500+ �?�?ร�?�?ารหรู</span> ทั�?ว�?รุ�?เท�?ฯ
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* �?�?�? 5. CTA EXCLUSIVE �?�?�? */}
      <section id="contact" className="py-40 bg-blue-600 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[60%] h-full bg-slate-950 -skew-x-[20deg] translate-x-40" />
         <div className="container mx-auto px-6 lg:px-20 relative z-10">
            <div className="grid lg:grid-cols-2 items-center gap-20">
               <div>
                  <h2 className="text-[64px] lg:text-[84px] font-black leading-tight xl:leading-none text-white uppercase mb-12">
                    �?ร�?อมสัม�?ัส<br />�?าร�?�?�?�?อ�?<br />ระดั�?�?รีเมียม?
                  </h2>
                  <p className="text-white/60 text-xl font-light mb-12 max-w-sm">ย�?ระดั�?มาตร�?า�?�?ื�?�?ที�?�?อ�?�?ุณด�?วย�?ริ�?ารระดั�?�?ฮเอ�?ด�?�?า�? TOMI FILM</p>
               </div>
               <div className="flex flex-col gap-6">
                  <a href={`tel:${content.contact_phone}`} className="h-24 bg-white text-slate-950 rounded-[32px] flex items-center justify-between px-10 group hover:bg-slate-100 transition-all">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase mb-1">ติดต�?อ�?ู�?เ�?ี�?ยว�?า�?</span>
                        <span className="text-2xl font-black">{content.contact_phone}</span>
                     </div>
                     <Phone weight="fill" className="text-3xl text-blue-600 group-hover:rotate-12 transition-transform" />
                  </a>
                  <a href={`https://line.me/R/ti/p/${content.contact_line_id}`} className="h-24 bg-slate-900 border border-white/10 text-white rounded-[32px] flex items-center justify-between px-10 group hover:bg-slate-800 transition-all">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-600 uppercase mb-1">�?ั�?�?ี Line ทา�?�?าร</span>
                        <span className="text-2xl font-black">{content.contact_line_id}</span>
                     </div>
                     <ChatCircleDots weight="fill" className="text-3xl text-[#00B900]" />
                  </a>
               </div>
            </div>
         </div>
      </section>

      {/* �?�?�? 6. LOCATION / MAP �?�?�? */}
      <section className="bg-slate-950 pt-20 pb-0 border-t border-white/5 relative z-10 w-full">
         <div className="container mx-auto px-6 lg:px-20 mb-12">
            <div className="flex items-center gap-4 mb-4 animate-fade-in-up">
               <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center">
                   <MapPin weight="fill" className="text-2xl text-blue-500" />
               </div>
               <h2 className="text-2xl font-black text-white uppercase">�?ุด�?ห�?�?ริ�?าร / ที�?ตั�?�?สา�?า</h2>
            </div>
            <p className="text-slate-400 font-light max-w-2xl text-lg animate-fade-in-up animation-delay-100">
               ยิ�?ดีต�?อ�?รั�?สู�?�?�?ว�?รูม TOMI FILM เ�?�?ามารั�?�?ำ�?รึ�?ษา�?ร�?อมสัม�?ัสตัวอย�?า�?�?ิล�?มทุ�?รุ�?�?ด�?วยตัว�?ุณเอ�? เ�?ื�?อ�?ารตัดสิ�?�?�?ที�?สม�?ูรณ�?�?�?�?ที�?สุด
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
                  <span className="text-3xl font-black uppercase mb-10 block">TOMIFILM.</span>
                  <p className="text-slate-500 font-light leading-loose text-sm italic">
                    "มอ�?สิ�?�?ที�?ดีที�?สุด�?ห�?�?ั�?�?ระ�?�?ทุ�?�?า�? �?ือ�?ั�?�?�?ิ�?ที�?เรายึดถือมาตลอดทศวรรษ"
                  </p>
               </div>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
                  <div>
                     <h4 className="text-[10px] font-black text-white uppercase mb-8">เม�?ู</h4>
                     <ul className="space-y-4 text-xs font-bold text-slate-600 uppercase">
                        <li><a href="#services" className="hover:text-blue-500 transition-colors">�?ล�?า�?ติดตั�?�?</a></li>
                        <li><a href="#film-types" className="hover:text-blue-500 transition-colors">�?�?ตตาล�?อ�?</a></li>
                        <li><a href="/blog" className="hover:text-blue-500 transition-colors">�?ท�?วาม</a></li>
                     </ul>
                  </div>
                  <div>
                     <h4 className="text-[10px] font-black text-white uppercase mb-8">ติดตามเรา</h4>
                     <ul className="space-y-4 text-xs font-bold text-slate-600 uppercase">
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

