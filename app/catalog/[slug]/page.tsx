import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { 
  ArrowRight, ShieldCheck, MapPin, Phone, ChatCircleDots, FacebookLogo,
  CaretRight, House, Tag, MagnifyingGlass, Megaphone, FileText,
  ShareNetwork, CalendarCheck, Clock, Quotes, CaretLeft
} from '@phosphor-icons/react/dist/ssr';
import { supabase } from '@/lib/supabase';
import LandingNavbar from '@/components/LandingNavbar';

// Force dynamic so we get the latest Supabase content immediately
export const dynamic = 'force-dynamic';

interface CatalogPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata(props: CatalogPageProps): Promise<Metadata> {
  const params = await props.params;
  const slug = decodeURIComponent(params.slug);
  const result = await supabase
    .from('service_catalog')
    .select('title, short_description, keywords, image_url')
    .eq('slug', slug)
    .single();

  const domain = 'https://xn--12ca0bc9bc6be9e1b2ay0f0e.com';
  const item = result.data;

  if (!item) return { title: 'ไม่พบหน้านี้' };

  return {
    title: `${item.title} | TOMI FILM`,
    description: item.short_description || `บริการ ${item.title} โดยทีมงานมืออาชีพ TOMI FILM ติดตั้งฟิล์มสถาปัตยกรรมระดับพรีเมียม`,
    keywords: item.keywords || 'ติดตั้งฟิล์มอาคาร, ติดฟิล์มกรองแสง',
    alternates: {
      canonical: `${domain}/catalog/${params.slug}`,
    },
    openGraph: {
      title: item.title,
      description: item.short_description,
      url: `${domain}/catalog/${params.slug}`,
      images: item.image_url ? [{ url: item.image_url }] : [],
      type: 'article',
    },
  };
}

export default async function CatalogSlugPage(props: CatalogPageProps) {
  const params = await props.params;
  const slug = decodeURIComponent(params.slug);
  
  const { data: item } = await supabase
    .from('service_catalog')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!item) {
    notFound();
  }

  // Get some suggested items (other pages)
  const { data: related } = await supabase
    .from('service_catalog')
    .select('title, slug')
    .neq('slug', slug)
    .limit(5);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-600 selection:text-white">
      {/* Existing Navbar (Works best on light background when customized) */}
      <LandingNavbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 lg:px-20">
          
          {/* Breadcrumbs - YellowPages Style */}
          <nav className="flex items-center gap-2 text-[12px] text-slate-500 mb-8 border-b border-slate-200 pb-4">
             <Link href="/" className="hover:text-black flex items-center gap-1">
               <House size={14} /> หน้าแรก
             </Link>
             <CaretRight size={10} />
             <Link href="/catalog" className="hover:text-black">แคตตาล็อก</Link>
             <CaretRight size={10} />
             <span className="text-blue-600 font-medium truncate">{item.title}</span>
          </nav>

          {/* Top Section: Title & Short Stats */}
          <div className="mb-10 text-right hidden lg:block">
             <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">ผู้นำด้านนวัตกรรมฟิล์มกรองแสงอาคารระดับพรีเมียม ตอบโจทย์ทุกไลฟ์สไตล์</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-10">
            <div className="flex flex-col lg:flex-row">
              
              {/* Left: Product Image */}
              <div className="lg:w-5/12 p-6 lg:p-10 border-r border-slate-50">
                <div className="aspect-square relative rounded-xl overflow-hidden bg-slate-100 border border-slate-100 group">
                  <img 
                    src={item.image_url || 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2070&auto=format&fit=crop'} 
                    alt={`${item.keywords || item.title} - รับติดตั้งโดยผู้เชี่ยวชาญ TOMI FILM`}
                    title={`บริการเนื้อหา: ${item.title}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full tracking-[0.2em] uppercase">
                    Official Catalog
                  </div>
                </div>
              </div>

              {/* Right: Key Info */}
              <div className="lg:w-7/12 p-6 lg:p-10 flex flex-col justify-between">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-black text-slate-900 mb-6 leading-tight">
                    {item.title}
                  </h1>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4 text-sm">
                       <span className="text-slate-400 font-medium w-24">แบรนด์:</span>
                       <span className="text-blue-600 font-bold tracking-wider">{item.brand_label || 'TOMI FILM'}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                       <span className="text-slate-400 font-medium w-24">หมวดหมู่:</span>
                       <span className="bg-slate-100 px-3 py-1 rounded-md text-slate-700 font-semibold">{item.category_label || 'ฟิล์มสถาปัตยกรรม'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-10">
                     <Link 
                       href="https://line.me/ti/p/~@tomifilm.th" 
                       className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-lg flex items-center gap-3 transition-colors text-sm"
                     >
                       <ChatCircleDots weight="fill" size={20} /> ขอรายละเอียด
                     </Link>
                     <Link 
                       href="#contact" 
                       className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-lg flex items-center gap-3 transition-colors text-sm"
                     >
                       <Megaphone weight="fill" size={20} /> ขอใบเสนอราคา
                     </Link>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Share :</span>
                         <div className="flex gap-2">
                           <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-all"><FacebookLogo size={18} /></button>
                           <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-500 hover:text-white transition-all"><ShareNetwork size={18} /></button>
                         </div>
                      </div>
                      <div className="text-[12px] text-slate-400 flex items-center gap-2">
                         <CalendarCheck size={16} /> อัปเดตล่าสุด: {new Date(item.updated_at).toLocaleDateString('th-TH')}
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 lg:p-12">
                <div className="flex items-center gap-4 mb-8">
                   <div className="h-8 w-1 bg-blue-600 rounded-full" />
                   <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">รายละเอียดสินค้า</h2>
                </div>
                
                <div 
                  className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600 prose-img:rounded-xl"
                  dangerouslySetInnerHTML={{ __html: item.content || '' }}
                />

                {/* Keywords Tags Section */}
                <div className="mt-16 pt-8 border-t border-slate-100">
                  <div className="flex items-center gap-3 mb-4 text-slate-900 font-bold">
                    <Tag size={20} weight="fill" className="text-blue-600" /> คำค้นหาที่เกี่ยวข้อง
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.keywords?.split(',').map((kw: string, i: number) => (
                      <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-500 hover:bg-white hover:border-blue-200 hover:text-blue-600 cursor-default transition-all">
                        {kw.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Information */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                 <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                   <Phone weight="fill" className="text-blue-600" /> ข้อมูลติดต่อ
                 </h3>
                 <div className="space-y-6">
                    <div className="flex gap-4">
                       <MapPin size={24} className="text-slate-400 shrink-0" />
                       <div className="text-sm text-slate-600 leading-relaxed">
                         44/10 MitMaitri Road, Khu Fang Nuea, Nong Chok, Bangkok 10530
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <Phone size={24} className="text-slate-400 shrink-0" />
                       <div className="text-sm font-bold text-slate-900">
                         064-179-2417
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <Clock size={24} className="text-slate-400 shrink-0" />
                       <div className="text-sm text-slate-600">
                         จันทร์ - อาทิตย์ 8:30 - 18:00 น.
                       </div>
                    </div>
                 </div>
                 <Link 
                   href="tel:0641792417"
                   className="mt-8 w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                 >
                    ติดต่อเราทันที
                 </Link>
              </div>

              {/* Related Items Sidebar */}
              {related && related.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                  <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                    <MagnifyingGlass weight="fill" className="text-blue-600" /> บริการอื่นๆ
                  </h3>
                  <div className="space-y-4">
                    {related.map((rel: any) => (
                      <Link 
                        key={rel.slug} 
                        href={`/catalog/${rel.slug}`}
                        className="block group"
                      >
                        <div className="p-3 rounded-xl border border-transparent group-hover:border-slate-100 group-hover:bg-slate-50 transition-all flex items-center gap-3">
                          <CaretRight size={14} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                          <span className="text-sm text-slate-600 group-hover:text-slate-900 font-medium truncate">{rel.title}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branding Similar to reference */}
      <footer className="bg-white border-t border-slate-200 py-10">
         <div className="container mx-auto px-6 text-center">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
               <div className="flex items-center gap-4 font-black text-slate-900">
                 <ShieldCheck weight="fill" size={32} />
                 <span>AUTHENTIC FILM ASSURANCE</span>
               </div>
               <div className="flex items-center gap-4 font-black text-slate-900">
                 <ShieldCheck weight="fill" size={32} />
                 <span>CERTIFIED MASTER INSTALLERS</span>
               </div>
               <div className="flex items-center gap-4 font-black text-slate-900">
                 <ShieldCheck weight="fill" size={32} />
                 <span>LIFETIME PERFORMANCE WARRANTY</span>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}
