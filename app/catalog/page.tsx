import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import LandingNavbar from '@/components/LandingNavbar';
import { CaretRight, House, Tag, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'แคตตาล็อกสินค้าและบริการ | TOMI FILM',
  description: 'เลือกชมบริการติดตั้งฟิล์มกรองแสงอาคาร ฟิล์มรถยนต์ และฟิล์มนิรภัยคุณภาพสูงจาก TOMI FILM',
};

export default async function CatalogMainPage() {
  const { data: items } = await supabase
    .from('service_catalog')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <LandingNavbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6 lg:px-20">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-[12px] text-slate-500 mb-8 border-b border-slate-200 pb-4 uppercase tracking-widest font-bold">
             <Link href="/" className="hover:text-black flex items-center gap-1">
               <House size={14} /> หน้าแรก
             </Link>
             <CaretRight size={10} />
             <span className="text-blue-600">แคตตาล็อก</span>
          </nav>

          <div className="mb-12">
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4">แคตตาล็อกบริการ</h1>
            <p className="text-slate-500 text-lg max-w-2xl">รวมรวมบริการติดตั้งฟิล์มกรองแสงพรีเมียม เจาะจงทุกพื้นที่และประเภทการใช้งาน เพื่อคุณภาพชีวิตที่ดีกว่า</p>
          </div>

          {!items || items.length === 0 ? (
            <div className="bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <MagnifyingGlass size={40} />
               </div>
               <p className="text-slate-400 font-medium">ยังไม่มีรายการในแคตตาล็อก</p>
               <p className="text-slate-400 text-sm mt-2">เริ่มสร้างคีย์เวิร์ด SEO ของคุณได้ผ่านระบบจัดการหลังบ้าน</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col"
                >
                  <Link href={`/catalog/${item.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-slate-100 shrink-0">
                    <Image 
                      src={item.image_url || 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2070&auto=format&fit=crop'} 
                      alt={`ภาพประกอบ: ${item.title} - ${item.keywords || 'ติดตั้งฟิล์ม TOMI FILM'}`}
                      title={`${item.title} โดยทีมช่างผู้เชี่ยวชาญ TOMI FILM`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-[2s]"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-slate-900 tracking-widest uppercase shadow-sm">
                      {item.category_label || 'SERVICE'}
                    </div>
                  </Link>
                  <div className="p-6 flex flex-col flex-1">
                    <Link href={`/catalog/${item.slug}`} className="block mb-2">
                      <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                        {item.title}
                      </h2>
                    </Link>
                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-4">
                      {item.short_description}
                    </p>
                    {item.keywords && (
                      <div className="flex items-center gap-2 text-xs text-slate-700 font-bold mb-2 truncate">
                        <Tag weight="fill" className="text-blue-600" /> <span>{item.keywords.split(',')[0].trim()}</span>
                      </div>
                    )}
                    <div className="text-xs text-slate-500 mb-6 truncate font-medium">
                       หมวดหมู่: <span className="text-slate-800 font-bold">{item.category_label || 'ฟิล์มสถาปัตยกรรม'}</span>
                    </div>

                    <div className="flex items-center gap-3 mt-auto pt-6 border-t border-slate-100">
                       <Link 
                         href={`/catalog/${item.slug}`}
                         className="flex-1 bg-white border-2 border-slate-200 hover:border-slate-800 text-slate-700 hover:text-slate-900 text-center py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
                       >
                         ดูรายละเอียด
                       </Link>
                       <a 
                         href="tel:0641792417"
                         className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M222.37,158.46l-47.11-21.11-.13-.06a16,16,0,0,0-15.17,1.4,8.12,8.12,0,0,0-.75.56L134.87,160c-15.42-7.49-31.34-23.41-38.83-38.83l20.78-24.34a8.12,8.12,0,0,0,.56-.75,16,16,0,0,0,1.4-15.17l-.06-.13L97.54,33.63A16,16,0,0,0,82.39,23.86C66.61,26.4,53.07,35,46.12,47.78A48.06,48.06,0,0,0,40,71.24c0,32.31,13.62,65.65,37.33,91.31L77.34,162.6C103,186.38,136.32,200,168.76,200a48.06,48.06,0,0,0,23.46-6.12c12.78-6.95,21.38-20.49,23.92-36.27A16,16,0,0,0,222.37,158.46ZM184.51,180A32,32,0,0,1,168.76,184C140.23,184,111,172.07,89,150.62s-33.35-49.88-33.35-78.29A32,32,0,0,1,59.8,55.51c3.87-7.1,11-10.3,19.33-9.52l47.11,21.11-21.72,25.46a8,8,0,0,0-1,8c9.64,20,29.1,39.42,49.05,49.05a8,8,0,0,0,8-1l25.46-21.72,21.11,47.11C206.32,173.5,203.11,180.64,184.51,180Z"></path></svg> Call Now
                       </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
