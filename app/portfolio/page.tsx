import Link from 'next/link';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { ArrowRight, MapPin, Buildings, ImageSquare } from '@phosphor-icons/react/dist/ssr';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'ผลงานติดตั้ง — TOMI FILM บริการติดฟิล์มอาคาร กรุงเทพฯ',
  description: 'รวมผลงานติดตั้งฟิล์มกรองแสง ฟิล์มกันความร้อน อาคาร คอนโด บ้าน สำนักงาน โดย TOMI FILM ผู้เชี่ยวชาญกว่า 10 ปี',
  keywords: 'ผลงานติดฟิล์ม,ติดฟิล์มอาคาร,ฟิล์มกรองแสง,TOMI FILM,ผลงาน',
  openGraph: {
    title: 'ผลงานติดตั้ง — TOMI FILM',
    description: 'รวมผลงานติดตั้งฟิล์มกรองแสง ฟิล์มกันความร้อน อาคาร คอนโด บ้าน',
    type: 'website',
  },
};

export default async function PortfolioPage() {
  let posts: any[] = [];

  try {
    const { data } = await supabase
      .from('portfolio_posts')
      .select('id,title,slug,description,cover_image_url,location_name,location_area,film_brand,film_model,film_type,glass_area_sqm,tags,created_at')
      .eq('published', true)
      .order('created_at', { ascending: false });
    if (data) posts = data;
  } catch {}

  // Unique locations for filter display
  const locations = Array.from(new Set(posts.map(p => p.location_area).filter(Boolean)));

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'ผลงานติดตั้งฟิล์ม TOMI FILM',
        description: 'รวมผลงานติดตั้งฟิล์มกรองแสง ฟิล์มกันความร้อน อาคาร คอนโด บ้าน สำนักงาน',
        url: 'https://tomifilm.co.th/portfolio',
        numberOfItems: posts.length,
        itemListElement: posts.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Article',
            headline: p.title,
            url: `https://tomifilm.co.th/portfolio/${p.slug}`,
            image: p.cover_image_url || undefined,
            datePublished: p.created_at,
            author: { '@type': 'Organization', name: 'TOMI FILM' },
          },
        })),
      })}} />

      {/* Header */}
      <header className="bg-[#111318] text-white pt-24 pb-16 px-6 sm:px-10 relative overflow-hidden">
        {/* Decorative blurs */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[120px]" />

        <div className="max-w-[1200px] mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white/70 text-sm font-light transition-colors mb-8">
            ← กลับหน้าหลัก
          </Link>
          <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-blue-400/60 mb-4">OUR PROJECTS</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight uppercase leading-[1.05]">
            ผลงาน<br /><span className="text-white/20">การติดตั้ง.</span>
          </h1>
          <p className="mt-4 text-white/35 text-base font-light max-w-lg">
            รวมผลงานจริงจากสถานที่จริง โดย TOMI FILM ผู้เชี่ยวชาญด้านฟิล์มสถาปัตยกรรม
          </p>
          {locations.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {locations.map(loc => (
                <span key={loc} className="text-[10px] text-white/25 border border-white/10 px-3 py-1 font-light flex items-center gap-1">
                  <MapPin weight="regular" className="text-xs" />{loc}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 sm:px-10 py-16">
        {posts.length === 0 ? (
          <div className="text-center py-32">
            <Buildings className="text-6xl text-black/10 mx-auto mb-4" weight="thin" />
            <p className="text-black/30 font-light">ยังไม่มีผลงานที่เผยแพร่</p>
            <p className="text-black/20 text-sm mt-2">กลับมาใหม่เร็วๆ นี้</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article key={post.id}>
                <Link href={`/portfolio/${post.slug}`} className="group block border border-black/[0.07] hover:border-black/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 rounded-xl overflow-hidden">
                  {/* Cover Image */}
                  <div className="h-56 bg-black/5 overflow-hidden relative">
                    {post.cover_image_url ? (
                      <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <ImageSquare className="text-5xl text-slate-300" weight="thin" />
                      </div>
                    )}
                    {/* Film Type Badge */}
                    {post.film_type && (
                      <span className="absolute top-3 left-3 text-[10px] bg-black/60 text-white px-3 py-1 rounded-full font-bold backdrop-blur-sm">
                        {post.film_type}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Location */}
                    {(post.location_name || post.location_area) && (
                      <div className="flex items-center gap-1.5 mb-3">
                        <MapPin weight="fill" className="text-xs text-blue-500 shrink-0" />
                        <span className="text-[11px] text-black/40 font-medium truncate">
                          {[post.location_name, post.location_area].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}

                    <h2 className="font-bold text-black text-base leading-snug group-hover:text-black/70 transition-colors mb-2 line-clamp-2">
                      {post.title}
                    </h2>

                    {/* Film Info */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.film_brand && (
                        <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-semibold">
                          {post.film_brand} {post.film_model}
                        </span>
                      )}
                      {post.glass_area_sqm > 0 && (
                        <span className="text-[10px] text-black/30 bg-black/[0.04] px-2 py-0.5 rounded font-medium">
                          {post.glass_area_sqm} ตร.ม.
                        </span>
                      )}
                    </div>

                    {/* View More */}
                    <div className="mt-4 pt-4 border-t border-black/5 flex items-center gap-1 text-[11px] font-bold tracking-[0.1em] uppercase text-black/30 group-hover:text-blue-600 transition-colors">
                      ดูผลงาน <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
