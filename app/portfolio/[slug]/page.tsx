'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft, MapPin, Ruler, Tag, CalendarBlank, X,
  ArrowRight as ArrowR, CaretLeft, CaretRight, Buildings
} from '@phosphor-icons/react';

interface PortfolioImage {
  url: string;
  width?: number;
  height?: number;
  caption?: string;
}

interface PortfolioPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  location_name: string;
  location_area: string;
  film_brand: string;
  film_model: string;
  film_type: string;
  film_specs: string;
  glass_area_sqm: number;
  images: PortfolioImage[];
  cover_image_url: string;
  tags: string[];
  meta_title: string;
  meta_description: string;
  published: boolean;
  created_at: string;
}

export default function PortfolioDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [post, setPost] = useState<PortfolioPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (!slug) return;
    const decodedSlug = decodeURIComponent(slug);
    (async () => {
      try {
        const { data } = await supabase
          .from('portfolio_posts')
          .select('*')
          .eq('slug', decodedSlug)
          .single();
        if (data) setPost(data as PortfolioPost);
      } catch {}
      setLoading(false);
    })();
  }, [slug]);

  // Update document title
  useEffect(() => {
    if (post) {
      document.title = post.meta_title || `${post.title} — ผลงาน TOMI FILM`;
    }
  }, [post]);

  const openLightbox = (i: number) => { setLightboxIndex(i); setLightboxOpen(true); };
  const closeLightbox = () => setLightboxOpen(false);
  const nextImage = () => { if (post) setLightboxIndex(i => (i + 1) % post.images.length); };
  const prevImage = () => { if (post) setLightboxIndex(i => (i - 1 + post.images.length) % post.images.length); };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Buildings className="text-6xl text-black/10" weight="thin" />
        <p className="text-black/40 font-light">ไม่พบผลงานนี้</p>
        <Link href="/portfolio" className="text-sm text-blue-600 hover:underline">← กลับไปดูผลงานทั้งหมด</Link>
      </div>
    );
  }

  const allImages = post.images?.length > 0 ? post.images : (post.cover_image_url ? [{ url: post.cover_image_url }] : []);
  const specItems = [
    { label: 'แบรนด์ฟิล์ม', value: post.film_brand },
    { label: 'รุ่น', value: post.film_model },
    { label: 'ประเภท', value: post.film_type },
    { label: 'สเปก', value: post.film_specs },
    { label: 'พื้นที่ติดตั้ง', value: post.glass_area_sqm > 0 ? `${post.glass_area_sqm} ตร.ม.` : '' },
    { label: 'สถานที่', value: [post.location_name, post.location_area].filter(Boolean).join(', ') },
  ].filter(s => s.value);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.meta_description || post.description?.slice(0, 160),
        datePublished: post.created_at,
        author: { '@type': 'Organization', name: 'TOMI FILM' },
        publisher: { '@type': 'Organization', name: 'TOMI FILM' },
        image: post.cover_image_url || allImages[0]?.url,
        keywords: post.tags?.join(', '),
        contentLocation: {
          '@type': 'Place',
          name: post.location_name,
          address: { '@type': 'PostalAddress', addressLocality: post.location_area },
        },
      })}} />

      {/* Cover Hero */}
      {post.cover_image_url && (
        <div className="relative h-[45vh] sm:h-[55vh] bg-black overflow-hidden">
          <img src={post.cover_image_url} alt={post.title} className="absolute inset-0 w-full h-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>
      )}

      {/* Header */}
      <header className={`${post.cover_image_url ? 'bg-[#111318] text-white' : 'bg-[#111318] text-white pt-24'} px-6 sm:px-10 py-12`}>
        <div className="max-w-[900px] mx-auto">
          <Link href="/portfolio" className="inline-flex items-center gap-2 text-white/40 hover:text-white/80 text-sm font-light transition-colors mb-6">
            <ArrowLeft weight="bold" /> กลับไปผลงานทั้งหมด
          </Link>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            {post.film_type && (
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-bold bg-white/10 px-3 py-1">{post.film_type}</span>
            )}
            {(post.location_name || post.location_area) && (
              <span className="text-[11px] text-white/30 font-light flex items-center gap-1">
                <MapPin weight="fill" className="text-xs text-blue-400" />
                {[post.location_name, post.location_area].filter(Boolean).join(', ')}
              </span>
            )}
            <span className="text-[11px] text-white/30 font-light flex items-center gap-1">
              <CalendarBlank weight="regular" className="text-xs" />
              {new Date(post.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase leading-[1.1]">
            {post.title}
          </h1>

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {post.tags.map((tag: string) => (
                <span key={tag} className="text-[11px] text-white/30 border border-white/10 px-2.5 py-1 font-light flex items-center gap-1">
                  <Tag weight="regular" className="text-xs" />{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[900px] mx-auto px-6 sm:px-10 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Left: Content */}
          <div className="md:col-span-2">
            {/* Image Gallery */}
            {allImages.length > 0 && (
              <div className="mb-12">
                <h2 className="text-[11px] font-bold tracking-[0.3em] uppercase text-black/30 mb-4">รูปภาพผลงาน ({allImages.length} รูป)</h2>
                <div className="grid grid-cols-2 gap-3">
                  {allImages.map((img, i) => (
                    <div
                      key={i}
                      className="relative group cursor-pointer rounded-lg overflow-hidden border border-black/[0.06] hover:border-black/20 hover:shadow-lg transition-all"
                      onClick={() => openLightbox(i)}
                    >
                      <img src={img.url} alt={img.caption || `ภาพที่ ${i + 1}`} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                          คลิกดูรูปใหญ่
                        </span>
                      </div>
                      {/* Size badge */}
                      {img.width && img.height && (
                        <span className="absolute bottom-2 right-2 text-[9px] bg-black/50 text-white px-2 py-0.5 rounded-full backdrop-blur-sm font-mono">
                          {img.width}×{img.height}
                        </span>
                      )}
                      {img.caption && (
                        <span className="absolute bottom-2 left-2 text-[10px] bg-black/50 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                          {img.caption}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {post.description && (
              <div>
                <h2 className="text-[11px] font-bold tracking-[0.3em] uppercase text-black/30 mb-4">รายละเอียด</h2>
                <div className="prose prose-base max-w-none prose-p:text-black/55 prose-p:font-light prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-black"
                  dangerouslySetInnerHTML={{
                    __html: post.description
                      .split('\n')
                      .map((line: string) => {
                        if (line.startsWith('### ')) return `<h3>${line.replace('### ', '')}</h3>`;
                        if (line.startsWith('## ')) return `<h2>${line.replace('## ', '')}</h2>`;
                        if (line.startsWith('# ')) return `<h1>${line.replace('# ', '')}</h1>`;
                        if (line.startsWith('- ')) return `<li>${line.replace('- ', '')}</li>`;
                        if (line.trim() === '') return '<br />';
                        return `<p>${line}</p>`;
                      })
                      .join('')
                  }}
                />
              </div>
            )}
          </div>

          {/* Right: Specs Sidebar */}
          <div className="space-y-6">
            {specItems.length > 0 && (
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h3 className="text-[11px] font-bold tracking-[0.3em] uppercase text-black/30 mb-5">ข้อมูลโครงการ</h3>
                <div className="space-y-4">
                  {specItems.map((spec, i) => (
                    <div key={i} className="border-b border-slate-200 pb-3 last:border-0 last:pb-0">
                      <p className="text-[10px] text-black/30 font-medium uppercase tracking-wide mb-1">{spec.label}</p>
                      <p className="text-sm text-black/80 font-semibold">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-blue-600 rounded-2xl p-6 text-white text-center">
              <p className="text-lg font-bold mb-2">สนใจติดฟิล์มแบบนี้?</p>
              <p className="text-white/60 text-sm font-light mb-4">ปรึกษาฟรี ประเมินราคาให้เลย</p>
              <Link href="/#contact" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all">
                ติดต่อเราเลย <ArrowR weight="bold" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <section className="bg-[#f7f8fa] border-t border-black/5 py-16 px-6 sm:px-10">
        <div className="max-w-[900px] mx-auto text-center">
          <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-black/30 mb-3">ดูผลงานเพิ่มเติม</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase text-black mb-4">ผลงานอื่นๆ ของเรา</h2>
          <Link href="/portfolio" className="inline-flex items-center gap-2 px-8 py-3.5 text-[12px] font-bold tracking-[0.2em] uppercase bg-black text-white hover:bg-black/80 hover:scale-105 transition-all rounded-xl">
            ดูผลงานทั้งหมด <ArrowR weight="bold" />
          </Link>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxOpen && allImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-50">
            <X weight="bold" className="text-3xl" />
          </button>

          {allImages.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors z-50 p-2">
                <CaretLeft weight="bold" className="text-4xl" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors z-50 p-2">
                <CaretRight weight="bold" className="text-4xl" />
              </button>
            </>
          )}

          <div className="max-w-[90vw] max-h-[85vh] relative" onClick={e => e.stopPropagation()}>
            <img
              src={allImages[lightboxIndex].url}
              alt={allImages[lightboxIndex].caption || ''}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm">
              <span className="text-white/60 text-sm">{lightboxIndex + 1} / {allImages.length}</span>
              {allImages[lightboxIndex].width && allImages[lightboxIndex].height && (
                <span className="text-white/40 text-xs font-mono">
                  {allImages[lightboxIndex].width}×{allImages[lightboxIndex].height}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
