import Link from 'next/link';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { MapPin } from '@phosphor-icons/react/dist/ssr';
import PortfolioClient from './PortfolioClient';

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

  // Unique locations for display in header
  const locations = Array.from(new Set(posts.map(p => p.location_area).filter(Boolean)));

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'ผลงานติดตั้งฟิล์ม TOMI FILM',
        description: 'รวมผลงานติดตั้งฟิล์มกรองแสง ฟิล์มกันความร้อน อาคาร คอนโด บ้าน สำนักงาน',
        url: 'https://www.xn--42cf2bdb5dorp5fubrbrf74a0b.com/portfolio',
        numberOfItems: posts.length,
        itemListElement: posts.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Article',
            headline: p.title,
            url: `https://www.xn--42cf2bdb5dorp5fubrbrf74a0b.com/portfolio/${p.slug}`,
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

      {/* Client-side filter and grid */}
      <PortfolioClient posts={posts} />
    </div>
  );
}
