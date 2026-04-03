import Link from 'next/link';
import {
  ArrowRight, ShieldCheck, Thermometer, FacebookLogo, Phone, ChatCircleDots,
  Drop, Eye, Medal, ArrowUpRight, CheckCircle, Star, Buildings, House,
  Car, Wrench, ClockCountdown, Leaf, SunDim, Lock, Quotes, MapPin,
  EnvelopeSimple, CaretDown, Lightning, Handshake, Certificate, ListNumbers
} from '@phosphor-icons/react/dist/ssr';
import { supabase } from '@/lib/supabase';

export const revalidate = 60;

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
    service3_image_url: ''
  };

  try {
    const { data } = await supabase
      .from('landing_page_content')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();
    if (data) content = { ...content, ...data };
  } catch { }

  return (
    <div className="min-h-screen font-sans overflow-x-hidden bg-white">

      {/* ─── NAVBAR ─── */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-black/5">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <div className="flex justify-between h-[72px] items-center">
            <span className="font-extrabold text-[18px] tracking-[0.3em] text-black whitespace-nowrap uppercase">TOMI FILM</span>
            <div className="hidden md:flex items-center gap-10">
              <a href="#services" className="text-black/50 hover:text-black transition-colors text-[13px] font-medium tracking-widest uppercase">Services</a>
              <a href="#film-types" className="text-black/50 hover:text-black transition-colors text-[13px] font-medium tracking-widest uppercase">Products</a>
              <a href="#process" className="text-black/50 hover:text-black transition-colors text-[13px] font-medium tracking-widest uppercase">Process</a>
              <a href="#about" className="text-black/50 hover:text-black transition-colors text-[13px] font-medium tracking-widest uppercase">About</a>
              <a href="#faq" className="text-black/50 hover:text-black transition-colors text-[13px] font-medium tracking-widest uppercase">FAQ</a>
              <a href="#contact" className="text-black/50 hover:text-black transition-colors text-[13px] font-medium tracking-widest uppercase">Contact</a>
            </div>
            <a href="#contact" className="hidden sm:inline-flex items-center gap-2 px-5 py-2 text-[11px] font-bold tracking-[0.2em] uppercase bg-black text-white hover:bg-black/80 transition-colors">
              Get Started <ArrowUpRight weight="bold" className="text-sm" />
            </a>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 1. HERO — Split layout: Text left, Image right        */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="pt-[72px] bg-white">
        <div className="grid md:grid-cols-2 min-h-[calc(100vh-72px)]">
          {/* Left — Content */}
          <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-16 md:py-0">
            <div className="max-w-xl">
              <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-black/30 mb-6 animate-fade-in-up">Premium Window Film</p>
              <h1 className="text-[36px] sm:text-[44px] lg:text-[56px] font-extrabold tracking-tight leading-[1.05] text-black uppercase animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                {content.hero_title}
              </h1>
              <p className="mt-6 text-black/40 text-base sm:text-lg leading-relaxed font-light animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                {content.hero_subtitle}
              </p>
              <div className="mt-10 flex flex-wrap gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <a href="#contact" className="group inline-flex items-center gap-2 px-8 py-3.5 text-[12px] font-bold tracking-[0.2em] uppercase bg-black text-white hover:bg-black/80 transition-all">
                  ขอใบเสนอราคาฟรี <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="#services" className="group inline-flex items-center gap-2 px-8 py-3.5 text-[12px] font-bold tracking-[0.2em] uppercase border border-black/15 text-black/60 hover:border-black/40 hover:text-black transition-all">
                  ดูบริการ
                </a>
              </div>
            </div>
          </div>

          {/* Right — Hero Image */}
          <div className="relative bg-black/5 min-h-[400px] md:min-h-0">
            {content.hero_image_url ? (
              <img src={content.hero_image_url} alt="TOMI FILM" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f35] to-[#0d1020] flex items-center justify-center">
                <div className="text-center">
                  <div className="grid grid-cols-2 gap-2 w-20 h-20 mx-auto mb-6 opacity-30">
                    <div className="bg-white rounded-[4px]"></div>
                    <div className="bg-white rounded-[4px]"></div>
                    <div className="bg-white rounded-[4px]"></div>
                    <div className="bg-white rounded-[4px]"></div>
                  </div>
                  <div className="font-extrabold tracking-[0.5em] text-2xl text-white/60 uppercase">TOMI FILM</div>
                  <div className="mt-2 text-[9px] tracking-[0.5em] uppercase text-white/20 font-bold">Window Film Expert</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 2. TRUST BAR — Stats & numbers                        */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="bg-white border-y border-black/10">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-black/10">
            <div className="py-10 sm:py-14 px-4 sm:px-8 text-center">
              <div className="text-[11px] tracking-[0.3em] uppercase text-black/30 font-bold mb-2">ประสบการณ์</div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl sm:text-5xl font-black text-black tracking-tight">10</span>
                <span className="text-lg font-bold text-black/30">ปี+</span>
              </div>
            </div>
            <div className="py-10 sm:py-14 px-4 sm:px-8 text-center">
              <div className="text-[11px] tracking-[0.3em] uppercase text-black/30 font-bold mb-2">โครงการ</div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl sm:text-5xl font-black text-black tracking-tight">1,000</span>
                <span className="text-lg font-bold text-black/30">+</span>
              </div>
            </div>
            <div className="py-10 sm:py-14 px-4 sm:px-8 text-center">
              <div className="text-[11px] tracking-[0.3em] uppercase text-black/30 font-bold mb-2">กันความร้อน</div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl sm:text-5xl font-black text-black tracking-tight">99</span>
                <span className="text-lg font-bold text-black/30">%</span>
              </div>
            </div>
            <div className="py-10 sm:py-14 px-4 sm:px-8 text-center">
              <div className="text-[11px] tracking-[0.3em] uppercase text-black/30 font-bold mb-2">บริการ</div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl sm:text-5xl font-black text-black tracking-tight">24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 3. SERVICES — 3 Image cards (dark bg)                 */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section id="services" className="bg-[#111318] text-white py-20 sm:py-28">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
            <div>
              <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-white/30 mb-3">WHY CHOOSE US?</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase leading-[1.1]">
                OUR<br />SERVICES
              </h2>
            </div>
            <a href="#contact" className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors self-start sm:self-auto">
              ปรึกษาฟรี <ArrowRight weight="bold" />
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Service 1 */}
            <div className="group bg-white/[0.04] border border-white/[0.06] overflow-hidden hover:bg-white/[0.07] transition-all duration-500">
              <div className="h-52 bg-white/[0.03] overflow-hidden">
                {content.service1_image_url ? (
                  <img src={content.service1_image_url} alt="กันความร้อน" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-900/30 to-blue-950/50 flex items-center justify-center">
                    <Thermometer className="text-5xl text-white/15" weight="thin" />
                  </div>
                )}
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="text-lg font-bold uppercase tracking-wide mb-2">กันความร้อน 99%</h3>
                <p className="text-white/35 text-sm leading-relaxed font-light">ป้องกันรังสี IR และ UV อย่างมีประสิทธิภาพ ลดอุณหภูมิภายในอาคาร ประหยัดค่าไฟทันที</p>
              </div>
            </div>

            {/* Service 2 */}
            <div className="group bg-white/[0.04] border border-white/[0.06] overflow-hidden hover:bg-white/[0.07] transition-all duration-500">
              <div className="h-52 bg-white/[0.03] overflow-hidden">
                {content.service2_image_url ? (
                  <img src={content.service2_image_url} alt="ลดแสงจ้า" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800/30 to-slate-900/50 flex items-center justify-center">
                    <Eye className="text-5xl text-white/15" weight="thin" />
                  </div>
                )}
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="text-lg font-bold uppercase tracking-wide mb-2">ลดแสงจ้า ถนอมสายตา</h3>
                <p className="text-white/35 text-sm leading-relaxed font-light">กรองแสงแดดสะท้อน ชมวิวภายนอกได้ชัดเจนและสบายตาตลอดทั้งวัน</p>
              </div>
            </div>

            {/* Service 3 */}
            <div className="group bg-white/[0.04] border border-white/[0.06] overflow-hidden hover:bg-white/[0.07] transition-all duration-500">
              <div className="h-52 bg-white/[0.03] overflow-hidden">
                {content.service3_image_url ? (
                  <img src={content.service3_image_url} alt="รับประกัน" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-900/30 to-indigo-950/50 flex items-center justify-center">
                    <ShieldCheck className="text-5xl text-white/15" weight="thin" />
                  </div>
                )}
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="text-lg font-bold uppercase tracking-wide mb-2">รับประกันยาวนาน</h3>
                <p className="text-white/35 text-sm leading-relaxed font-light">ติดตั้งโดยช่างผู้เชี่ยวชาญ รับประกันคุณภาพฟิล์มและการติดตั้ง ไม่หลุดลอก ไม่พอง</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 4. SERVICE SCOPE — What we cover                      */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-black/30 mb-3">SCOPE OF WORK</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase text-black leading-[1.1]">
              รับติดตั้งทุกประเภท
            </h2>
            <p className="mt-4 text-black/35 text-base font-light max-w-lg mx-auto">
              ไม่ว่าจะเป็นบ้าน คอนโด อาคารสำนักงาน หรือรถยนต์ เรามีทีมงานพร้อมบริการ
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: <House weight="regular" className="text-3xl sm:text-4xl" />, title: 'บ้านพักอาศัย', desc: 'บ้านเดี่ยว ทาวน์โฮม บ้านแฝด' },
              { icon: <Buildings weight="regular" className="text-3xl sm:text-4xl" />, title: 'อาคารสำนักงาน', desc: 'ออฟฟิศ คอนโด อาคารพาณิชย์' },
              { icon: <Car weight="regular" className="text-3xl sm:text-4xl" />, title: 'รถยนต์', desc: 'ฟิล์มกรองแสงรถยนต์ทุกรุ่น' },
              { icon: <Wrench weight="regular" className="text-3xl sm:text-4xl" />, title: 'งานโปรเจกต์', desc: 'โรงงาน โรงแรม ห้างสรรพสินค้า' },
            ].map((item, i) => (
              <div key={i} className="group px-6 py-8 sm:py-10 border border-black/[0.06] bg-black/[0.01] hover:bg-black hover:text-white transition-all duration-500 text-center">
                <div className="text-black/20 group-hover:text-white/60 transition-colors mb-4 flex justify-center">
                  {item.icon}
                </div>
                <h3 className="text-sm sm:text-base font-bold uppercase tracking-wide mb-1.5">{item.title}</h3>
                <p className="text-black/35 group-hover:text-white/35 text-xs sm:text-sm font-light transition-colors">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 5. FILM TYPES — Product showcase (dark bg)            */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section id="film-types" className="bg-[#111318] text-white py-20 sm:py-28">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-white/30 mb-3">OUR PRODUCTS</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase leading-[1.1]">
              ประเภทฟิล์ม
            </h2>
            <p className="mt-4 text-white/30 text-base font-light max-w-lg mx-auto">
              เราคัดสรรฟิล์มคุณภาพสูงจากแบรนด์ชั้นนำระดับโลก ตอบโจทย์ทุกความต้องการ
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <Thermometer weight="regular" className="text-2xl" />, name: 'ฟิล์มเซรามิคกันความร้อน', features: ['ลดความร้อนสูงสุด 99%', 'ไม่บดบังทัศนวิสัย', 'ทนทาน ไม่ซีดจาง'], tag: 'Best Seller' },
              { icon: <SunDim weight="regular" className="text-2xl" />, name: 'ฟิล์มกรองแสง UV', features: ['กรอง UV 99.9%', 'ป้องกันเฟอร์นิเจอร์ซีดจาง', 'ลดอุณหภูมิภายใน'], tag: null },
              { icon: <Lock weight="regular" className="text-2xl" />, name: 'ฟิล์มนิรภัย', features: ['ป้องกันกระจกแตก', 'เพิ่มความปลอดภัย', 'กันขโมย กันระเบิด'], tag: null },
              { icon: <Eye weight="regular" className="text-2xl" />, name: 'ฟิล์มกระจกสะท้อน', features: ['มองไม่เห็นจากภายนอก', 'ให้ความเป็นส่วนตัว', 'ดีไซน์โมเดิร์น'], tag: null },
              { icon: <Leaf weight="regular" className="text-2xl" />, name: 'ฟิล์มประหยัดพลังงาน', features: ['ลดค่าไฟ 30-50%', 'ใส่ใจสิ่งแวดล้อม', 'คืนทุนภายใน 2 ปี'], tag: 'ECO' },
              { icon: <Drop weight="regular" className="text-2xl" />, name: 'ฟิล์มกันน้ำ กันฝ้า', features: ['ป้องกันความชื้น', 'เหมาะกับห้องน้ำ', 'ทำความสะอาดง่าย'], tag: null },
            ].map((film, i) => (
              <div key={i} className="group relative bg-white/[0.04] border border-white/[0.06] p-6 sm:p-8 hover:bg-white/[0.07] transition-all duration-500">
                {film.tag && (
                  <span className="absolute top-4 right-4 text-[9px] tracking-[0.2em] uppercase font-black bg-white text-black px-2.5 py-1">{film.tag}</span>
                )}
                <div className="text-white/30 mb-4">{film.icon}</div>
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
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 6. WHY US — Features / USPs (white bg)                */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 sm:py-28 border-t border-black/5">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-black/30 mb-4">WHY US?</p>
              <h2 className="text-3xl sm:text-4xl md:text-[44px] font-extrabold tracking-tight uppercase leading-[1.1] text-black mb-6">
                ทำไมต้อง<br />TOMI FILM?
              </h2>
              <p className="text-black/40 text-base leading-loose font-light max-w-lg">
                เราไม่ได้แค่ติดฟิล์ม เราให้โซลูชั่นที่ตอบโจทย์ทุกความต้องการอย่างครบวงจร ด้วยมาตรฐานระดับสากลและทีมงานที่คุณวางใจได้
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              {[
                { icon: <Certificate weight="regular" className="text-xl" />, title: 'ฟิล์มแท้มีใบรับรอง', desc: 'สินค้าแท้จากโรงงานพร้อมใบ Certificate' },
                { icon: <Handshake weight="regular" className="text-xl" />, title: 'ราคาโปร่งใส', desc: 'เสนอราคาชัดเจน ไม่มีค่าใช้จ่ายแอบแฝง' },
                { icon: <ClockCountdown weight="regular" className="text-xl" />, title: 'นัดหมายตรงเวลา', desc: 'เข้างานตรงเวลา เสร็จไว ไม่กวนวุ่นวาย' },
                { icon: <ShieldCheck weight="regular" className="text-xl" />, title: 'รับประกันงาน', desc: 'รับประกันฟิล์มและการติดตั้ง สูงสุด 10 ปี' },
                { icon: <Lightning weight="regular" className="text-xl" />, title: 'ประเมินราคาฟรี', desc: 'สำรวจหน้างานและเสนอราคาฟรี ไม่มีค่าใช้จ่าย' },
                { icon: <Star weight="regular" className="text-xl" />, title: 'ช่างผู้เชี่ยวชาญ', desc: 'ทีมช่างมืออาชีพ ผ่านการฝึกอบรมจากแบรนด์ฟิล์ม' },
              ].map((item, i) => (
                <div key={i} className="px-5 py-6 border border-black/[0.06]">
                  <div className="text-black/25 mb-3">{item.icon}</div>
                  <h4 className="text-sm font-bold text-black mb-1">{item.title}</h4>
                  <p className="text-xs text-black/35 font-light leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 7. PROCESS — How it works (dark bg)                   */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section id="process" className="bg-[#111318] text-white py-20 sm:py-28">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-white/30 mb-3">HOW IT WORKS</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase leading-[1.1]">
              ขั้นตอนการทำงาน
            </h2>
            <p className="mt-4 text-white/30 text-base font-light max-w-lg mx-auto">
              กระบวนการทำงานที่เป็นระบบ ให้คุณมั่นใจตั้งแต่ต้นจนจบ
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { step: '01', title: 'ปรึกษาและประเมินราคา', desc: 'ติดต่อเราเพื่อแจ้งรายละเอียด สำรวจหน้างานฟรี และรับใบเสนอราคาภายใน 24 ชม.' },
              { step: '02', title: 'เลือกฟิล์มที่เหมาะสม', desc: 'ทีมผู้เชี่ยวชาญช่วยแนะนำฟิล์มที่ตรงกับความต้องการ งบประมาณ และสภาพหน้างาน' },
              { step: '03', title: 'ติดตั้งโดยมืออาชีพ', desc: 'ช่างเข้าดำเนินการติดตั้ง ทำงานสะอาดเรียบร้อย ไม่ทิ้งคราบ ไม่เลอะกาว' },
              { step: '04', title: 'ตรวจสอบและรับประกัน', desc: 'ตรวจสอบคุณภาพก่อนส่งมอบงาน พร้อมใบรับประกันฟิล์มและการติดตั้ง' },
            ].map((item, i) => (
              <div key={i} className="relative bg-white/[0.04] border border-white/[0.06] p-6 sm:p-8 hover:bg-white/[0.07] transition-all duration-500">
                <span className="text-[48px] sm:text-[56px] font-black text-white/[0.04] absolute top-3 right-5 leading-none">{item.step}</span>
                <div className="relative">
                  <span className="text-[11px] font-black tracking-[0.3em] uppercase text-white/25 mb-4 block">STEP {item.step}</span>
                  <h3 className="text-base sm:text-lg font-bold uppercase tracking-wide mb-3">{item.title}</h3>
                  <p className="text-white/35 text-sm leading-relaxed font-light">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 8. ABOUT — Split: Image left, Text right              */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section id="about" className="bg-white">
        <div className="grid md:grid-cols-2">
          {/* Left — Image */}
          <div className="relative min-h-[400px] md:min-h-[600px] bg-black/5">
            {content.about_image_url ? (
              <img src={content.about_image_url} alt="เกี่ยวกับ TOMI FILM" className="absolute inset-0 w-full h-full object-cover" />
            ) : content.hero_image_url ? (
              <img src={content.hero_image_url} alt="TOMI FILM" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-[#111318] flex items-center justify-center">
                <div className="text-center">
                  <div className="grid grid-cols-2 gap-1.5 w-14 h-14 mx-auto mb-4 opacity-20">
                    <div className="bg-white rounded-[3px]"></div>
                    <div className="bg-white rounded-[3px]"></div>
                    <div className="bg-white rounded-[3px]"></div>
                    <div className="bg-white rounded-[3px]"></div>
                  </div>
                  <div className="font-extrabold tracking-[0.5em] text-xl text-white/40 uppercase">TOMI FILM</div>
                </div>
              </div>
            )}
          </div>

          {/* Right — Text */}
          <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-16 md:py-20">
            <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-black/30 mb-4">About Us</p>
            <h2 className="text-3xl sm:text-4xl md:text-[44px] font-extrabold tracking-tight uppercase leading-[1.1] text-black mb-8">
              EXCLUSIVE &amp;<br />
              PROFESSIONAL<br />
              SERVICE
            </h2>
            <p className="text-black/40 text-base leading-loose font-light max-w-lg">
              {content.about_text}
            </p>

            {/* Certifications */}
            <div className="flex gap-10 mt-10 pt-8 border-t border-black/10">
              <div>
                <Medal weight="regular" className="text-xl text-black/25 mb-1.5" />
                <div className="text-[10px] tracking-[0.2em] uppercase text-black/30 font-bold">ISO Certified</div>
              </div>
              <div>
                <Drop weight="regular" className="text-xl text-black/25 mb-1.5" />
                <div className="text-[10px] tracking-[0.2em] uppercase text-black/30 font-bold">Nano Ceramic</div>
              </div>
              <div>
                <ShieldCheck weight="regular" className="text-xl text-black/25 mb-1.5" />
                <div className="text-[10px] tracking-[0.2em] uppercase text-black/30 font-bold">Warranty</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 9. TESTIMONIALS — Customer reviews                    */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="bg-[#f7f8fa] py-20 sm:py-28 border-y border-black/5">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-black/30 mb-3">TESTIMONIALS</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase text-black leading-[1.1]">
              ลูกค้าพูดถึงเรา
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { name: 'คุณสมชาย ว.', role: 'บ้านเดี่ยว บางนา', text: 'ติดฟิล์มกันความร้อนทั้งหลัง ได้ผลจริง อุณหภูมิในบ้านลดลงเยอะมาก ค่าไฟลดไป 40% ช่างทำงานดีมากครับ' },
              { name: 'คุณปิยะ ก.', role: 'คอนโด สาทร', text: 'ฟิล์มสวย ติดเรียบ ไม่มีฟองเลย ช่างมาตรงเวลา ทำงานเสร็จตามกำหนด ประทับใจมากค่ะ แนะนำเลย' },
              { name: 'คุณวิภา ศ.', role: 'สำนักงาน อโศก', text: 'ติดฟิล์มให้ออฟฟิศทั้งชั้น 30+ บาน ทำงานเรียบร้อยมาก พนักงานไม่บ่นเรื่องแดดเข้าอีกเลย ขอบคุณครับ' },
            ].map((review, i) => (
              <div key={i} className="bg-white p-8 border border-black/[0.06]">
                <Quotes weight="fill" className="text-3xl text-black/[0.06] mb-4" />
                <p className="text-black/45 text-sm leading-relaxed font-light mb-6">{review.text}</p>
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} weight="fill" className="text-sm text-amber-400" />
                  ))}
                </div>
                <div className="border-t border-black/5 pt-4">
                  <div className="font-bold text-sm text-black">{review.name}</div>
                  <div className="text-xs text-black/30 font-light mt-0.5">{review.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 10. FAQ — Frequently asked questions                  */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section id="faq" className="bg-white py-20 sm:py-28">
        <div className="max-w-[900px] mx-auto px-6 sm:px-10">
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-black/30 mb-3">FAQ</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase text-black leading-[1.1]">
              คำถามที่พบบ่อย
            </h2>
          </div>

          <div className="space-y-3">
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
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 11. CTA — Call to action (dark bg)                    */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="bg-[#111318] text-white">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-20 sm:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase leading-[1.1]">
                พร้อมเปลี่ยน<br />
                อาคารของคุณให้<br />
                เย็นสบายขึ้น?
              </h2>
            </div>
            <div className="md:text-right">
              <p className="text-white/35 text-base leading-relaxed font-light max-w-md md:ml-auto mb-8">
                ไม่ว่าคุณจะต้องการฟิล์มกันความร้อน ฟิล์มกรองแสง หรือฟิล์มนิรภัย เราพร้อมให้คำปรึกษาและแนะนำฟิล์มที่เหมาะสมที่สุดสำหรับคุณ ปรึกษาฟรี ไม่มีค่าใช้จ่าย
              </p>
              <a href="#contact" className="inline-flex items-center gap-2 px-8 py-3.5 text-[12px] font-bold tracking-[0.2em] uppercase bg-white text-black hover:bg-white/90 transition-all">
                ติดต่อเราเลย <ArrowRight weight="bold" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 12. CONTACT — Full contact information                */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section id="contact" className="bg-white py-20 sm:py-28 border-t border-black/10">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-black/30 mb-3">Contact Us</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase text-black leading-[1.1]">
              ติดต่อเรา
            </h2>
            <p className="mt-4 text-black/35 text-base font-light max-w-lg mx-auto">
              ติดต่อเราวันนี้เพื่อรับคำปรึกษาและประเมินราคาฟรี ทีมงานพร้อมให้บริการอย่างมืออาชีพ
            </p>
          </div>

          {/* Contact cards */}
          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
            <a
              href={`tel:${content.contact_phone}`}
              className="group flex flex-col items-center gap-3 px-6 py-8 border border-black/10 bg-black/[0.02] hover:bg-black hover:text-white hover:border-black transition-all duration-300"
            >
              <Phone className="text-2xl text-black/25 group-hover:text-white/70 transition-colors" weight="regular" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-black/25 group-hover:text-white/40 font-bold transition-colors">โทรศัพท์</span>
              <span className="text-black/70 group-hover:text-white font-semibold text-sm transition-colors">{content.contact_phone}</span>
            </a>

            <a
              href={`https://line.me/R/ti/p/${content.contact_line_id}`}
              target="_blank"
              className="group flex flex-col items-center gap-3 px-6 py-8 border border-black/10 bg-black/[0.02] hover:bg-[#00B900] hover:text-white hover:border-[#00B900] transition-all duration-300"
            >
              <ChatCircleDots className="text-2xl text-black/25 group-hover:text-white/70 transition-colors" weight="regular" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-black/25 group-hover:text-white/60 font-bold transition-colors">Line</span>
              <span className="text-black/70 group-hover:text-white font-semibold text-sm transition-colors">{content.contact_line_id}</span>
            </a>

            <a
              href={content.contact_facebook}
              target="_blank"
              className="group flex flex-col items-center gap-3 px-6 py-8 border border-black/10 bg-black/[0.02] hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all duration-300"
            >
              <FacebookLogo className="text-2xl text-black/25 group-hover:text-white/70 transition-colors" weight="regular" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-black/25 group-hover:text-white/60 font-bold transition-colors">Facebook</span>
              <span className="text-black/70 group-hover:text-white font-semibold text-sm transition-colors">Facebook Page</span>
            </a>
          </div>

          {/* Service hours & area */}
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
          {/* Top */}
          <div className="py-12 sm:py-16 grid sm:grid-cols-3 gap-10">
            <div>
              <span className="font-extrabold text-[14px] tracking-[0.3em] text-white/80 uppercase block mb-3">TOMI FILM</span>
              <p className="text-white/25 text-sm font-light leading-relaxed">
                ผู้เชี่ยวชาญด้านฟิล์มกรองแสงอาคาร บ้าน สำนักงาน และรถยนต์ ด้วยประสบการณ์กว่า 10 ปี
              </p>
            </div>
            <div>
              <h4 className="text-[10px] tracking-[0.3em] uppercase text-white/35 font-bold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <a href="#services" className="block text-white/25 hover:text-white/60 text-sm font-light transition-colors">บริการของเรา</a>
                <a href="#film-types" className="block text-white/25 hover:text-white/60 text-sm font-light transition-colors">ประเภทฟิล์ม</a>
                <a href="#process" className="block text-white/25 hover:text-white/60 text-sm font-light transition-colors">ขั้นตอนการทำงาน</a>
                <a href="#faq" className="block text-white/25 hover:text-white/60 text-sm font-light transition-colors">คำถามที่พบบ่อย</a>
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

          {/* Bottom */}
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
