'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft, MapPin, Ruler, Tag, CalendarBlank, X,
  ArrowRight as ArrowR, CaretLeft, CaretRight, Buildings, Sparkle
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
    { label: 'พื้นที่ติดตั้ง', value: post.glass_area_sqm > 0 ? `${post.glass_area_sqm} ตร.ม.` : '' },
    { label: 'สถานที่', value: [post.location_name, post.location_area].filter(Boolean).join(', ') },
  ].filter(s => s.value);

  const parsedSpecs = post.film_specs ? post.film_specs.split(',').map((s: string) => s.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans selection:bg-blue-500/30">
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

      {/* Hero Section */}
      <div className="relative min-h-[65vh] flex items-end pb-16 sm:pb-24 pt-32 px-6 sm:px-10 overflow-hidden bg-[#0a0f18]">
        {/* Background Layers */}
        {post.cover_image_url && (
          <div className="absolute inset-0 z-0">
            <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f18] via-[#0a0f18]/80 to-[#0a0f18]/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f18]/90 via-transparent to-transparent" />
          </div>
        )}
        
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-[8000ms] z-0" />
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-indigo-500/20 blur-[100px] rounded-full mix-blend-screen z-0" />

        <div className="max-w-[1100px] mx-auto w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Link href="/portfolio" className="group inline-flex items-center gap-2 text-white/50 hover:text-white text-[13px] font-medium transition-all mb-8 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/5">
            <ArrowLeft weight="bold" className="group-hover:-translate-x-1 transition-transform" /> กลับหน้ารวมผลงาน
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            {post.film_type && (
              <span className="text-[11px] tracking-[0.2em] uppercase font-bold text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full backdrop-blur-sm shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                {post.film_type}
              </span>
            )}
            <span className="text-[12px] text-white/60 font-light flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5">
              <CalendarBlank weight="duotone" className="text-sm" />
              {new Date(post.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] mb-6 drop-shadow-xl text-balance">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center max-w-3xl gap-4">
            {(post.location_name || post.location_area) && (
              <div className="text-sm sm:text-base text-white/80 font-light flex items-center gap-2">
                <MapPin weight="fill" className="text-lg text-blue-400 drop-shadow-md" />
                {[post.location_name, post.location_area].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1100px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Gallery & Description */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Gallery */}
            {allImages.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 fill-mode-both">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-[1px] bg-blue-600 rounded-full" />
                  <h2 className="text-[13px] font-bold tracking-[0.2em] uppercase text-slate-800">แกลเลอรีภาพผลงาน</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-6 sm:gap-8">
                  {allImages.map((img, i) => {
                    const isSquare = img.width && img.height && img.width === img.height;
                    
                    return (
                      <div
                        key={i}
                        className={`relative group cursor-pointer overflow-hidden rounded-3xl bg-slate-100 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 border border-slate-200 ${isSquare ? 'col-span-1 aspect-square' : 'col-span-2'}`}
                        onClick={() => openLightbox(i)}
                      >
                        <img src={img.url} alt={img.caption || `ภาพที่ ${i + 1}`} className="w-full h-full object-cover transform-gpu max-h-[85vh] group-hover:scale-[1.03] transition-transform duration-700 ease-in-out" />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                        
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:-translate-y-2">
                           <span className="bg-white/20 backdrop-blur-md text-white font-bold text-xs px-4 py-2 rounded-full border border-white/30 shadow-lg">
                             ขยายภาพ
                           </span>
                        </div>

                        {img.caption && (
                          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                            <span className="inline-block text-[11px] sm:text-[13px] font-semibold bg-white/20 backdrop-blur-xl text-white px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl border border-white/30 shadow-xl shadow-black/30 line-clamp-2">
                              {img.caption}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description Prose */}
            {post.description && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-[1px] bg-blue-600 rounded-full" />
                  <h2 className="text-[13px] font-bold tracking-[0.2em] uppercase text-slate-800">รายละเอียดงาน</h2>
                </div>
                <div className="prose prose-lg max-w-none prose-p:text-slate-600 prose-p:font-light prose-p:leading-[1.8] prose-headings:font-bold prose-headings:text-slate-900 prose-headings:tracking-tight prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-img:rounded-2xl prose-img:shadow-lg"
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
            
            {/* Tags line */}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-8 border-t border-slate-200">
                {post.tags.map((tag: string) => (
                  <span key={tag} className="text-[12px] text-slate-500 bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:border-slate-300 hover:bg-slate-50 transition-colors">
                    <Tag weight="bold" className="text-blue-500" /> {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Sticky Sidebar */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-32 space-y-6">
              
              {/* Specs Card */}
              {specItems.length > 0 && (
                <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group animate-in fade-in slide-in-from-right-8 duration-1000 delay-500 fill-mode-both">
                  {/* Decorative blur inside card */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors duration-500" />
                  
                  <h3 className="text-[12px] font-black tracking-[0.2em] uppercase text-slate-400 mb-6 flex items-center gap-2">
                    <Ruler weight="bold" className="text-lg" /> ข้อมูลโครงการ
                  </h3>
                  
                  <div className="space-y-5 relative z-10">
                    {specItems.map((spec, i) => (
                      <div key={i} className="flex justify-between items-end border-b border-slate-100 pb-3 group/item">
                        <span className="text-[13px] text-slate-400 font-medium">{spec.label}</span>
                        <span className="text-[15px] font-bold text-slate-800 text-right max-w-[60%] group-hover/item:text-blue-600 transition-colors">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Film Specs Card */}
              {parsedSpecs.length > 0 && (
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-white animate-in fade-in slide-in-from-right-8 duration-1000 delay-600 fill-mode-both border border-slate-700">
                  <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/20 blur-3xl rounded-full mix-blend-screen" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/20 blur-2xl rounded-full mix-blend-screen" />
                  
                  <h3 className="text-[12px] font-black tracking-[0.2em] uppercase text-white/50 mb-5 flex items-center gap-2 relative z-10">
                    <Sparkle weight="fill" className="text-blue-400 text-lg" /> สเปกฟิล์ม
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3 relative z-10">
                    {parsedSpecs.map((spec: string, i: number) => {
                      let label = spec;
                      let val = "";
                      const numIndex = spec.search(/\d/);
                      if (numIndex > 0) {
                         label = spec.substring(0, numIndex).trim();
                         val = spec.substring(numIndex).trim();
                      }
                      
                      return (
                        <div key={i} className="bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-4 border border-white/10 flex flex-col justify-center items-center text-center group/spec shadow-inner">
                          <span className="text-[10px] text-white/40 uppercase tracking-[0.1em] font-bold mb-1">{label}</span>
                          <span className="text-xl font-black tracking-tight text-white group-hover/spec:text-blue-300 transition-colors">{val || label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Call to Action Card */}
              <div className="rounded-3xl p-8 relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-800 text-white shadow-xl shadow-blue-900/20 animate-in fade-in slide-in-from-right-8 duration-1000 delay-700 fill-mode-both group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
                
                <h4 className="text-2xl font-black mb-3 relative z-10 drop-shadow-md">ต้องการฟิล์มสเปกนี้?</h4>
                <p className="text-blue-100 text-sm font-light mb-8 relative z-10 leading-relaxed text-balance">
                  เราประเมินราคาและให้คำปรึกษาฟรี ทั่วกรุงเทพฯ และปริมณฑล
                </p>
                
                <Link href="/#contact" className="relative z-10 w-full flex items-center justify-center gap-2 bg-white text-blue-600 font-bold py-4 px-6 rounded-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                  รับคำปรึกษาฟรี <ArrowR weight="bold" />
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Footer Section - Recommended Projects */}
      <section className="bg-white border-t border-slate-100 py-24 px-6 sm:px-10">
        <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-[1px] bg-slate-300 rounded-full" />
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-slate-400">Our Portfolio</p>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-800">ผลงานติดตั้งอื่นๆ</h2>
          </div>
          
          <Link href="/portfolio" className="group inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-blue-500/30">
            <span className="text-[13px] font-bold tracking-[0.1em] uppercase">ดูผลงานทั้งหมด</span>
            <ArrowR weight="bold" className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Lightbox Modal (Glassmorphism) */}
      {lightboxOpen && allImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-50 backdrop-blur-md border border-white/10">
            <X weight="bold" className="text-xl" />
          </button>

          {allImages.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center bg-white/5 hover:bg-white/20 text-white rounded-full transition-all z-50 backdrop-blur-md border border-white/5 hover:scale-110">
                <CaretLeft weight="bold" className="text-2xl" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center bg-white/5 hover:bg-white/20 text-white rounded-full transition-all z-50 backdrop-blur-md border border-white/5 hover:scale-110">
                <CaretRight weight="bold" className="text-2xl" />
              </button>
            </>
          )}

          <div className="max-w-[95vw] sm:max-w-[85vw] max-h-[85vh] relative flex flex-col items-center animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="relative rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
               <img
                 src={allImages[lightboxIndex].url}
                 alt={allImages[lightboxIndex].caption || ''}
                 className="max-w-full max-h-[80vh] object-contain"
               />
            </div>
            
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 px-6 py-3 rounded-full backdrop-blur-md border border-white/10 shadow-xl whitespace-nowrap">
              <span className="text-white font-bold text-sm bg-white/20 px-3 py-1 rounded-lg">{lightboxIndex + 1} / {allImages.length}</span>
              {allImages[lightboxIndex].caption && (
                 <span className="text-white/90 text-sm font-medium pr-2 max-w-[200px] sm:max-w-[400px] truncate">{allImages[lightboxIndex].caption}</span>
              )}
              {allImages[lightboxIndex].width && allImages[lightboxIndex].height && (
                <span className="text-white/40 text-xs font-mono hidden sm:inline-block">
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
