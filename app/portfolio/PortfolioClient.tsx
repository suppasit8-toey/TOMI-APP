'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin, Buildings, ImageSquare, Funnel } from '@phosphor-icons/react';

interface PortfolioPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string;
  location_name: string;
  location_area: string;
  film_brand: string;
  film_model: string;
  film_type: string;
  glass_area_sqm: number;
  tags: string[];
  created_at: string;
}

export default function PortfolioClient({ posts }: { posts: PortfolioPost[] }) {
  const [selectedType, setSelectedType] = useState('ทั้งหมด');

  // Extract unique film types from posts
  const filmTypes = useMemo(() => {
    const types = Array.from(new Set(posts.map(p => p.film_type).filter(Boolean))).sort();
    return ['ทั้งหมด', ...types];
  }, [posts]);

  // Filter posts by selected film type
  const filteredPosts = useMemo(() => {
    if (selectedType === 'ทั้งหมด') return posts;
    return posts.filter(p => p.film_type === selectedType);
  }, [posts, selectedType]);

  // Unique locations from filtered posts
  const locations = Array.from(new Set(filteredPosts.map(p => p.location_area).filter(Boolean)));

  return (
    <>
      {/* Filter Bar */}
      {filmTypes.length > 2 && (
        <div className="bg-white sticky top-0 z-20 border-b border-black/[0.06]">
          <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-black/30 shrink-0">
                <Funnel weight="bold" className="text-sm" />
                <span className="text-[11px] font-bold tracking-[0.08em] uppercase">ประเภทฟิล์ม</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {filmTypes.map(type => {
                  const isActive = selectedType === type;
                  const count = type === 'ทั้งหมด' ? posts.length : posts.filter(p => p.film_type === type).length;
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`
                        px-4 py-2 rounded-full text-[12px] font-semibold transition-all duration-300 border
                        flex items-center gap-2
                        ${isActive
                          ? 'bg-[#111318] text-white border-[#111318] shadow-lg shadow-black/20'
                          : 'bg-white text-black/50 border-black/10 hover:border-black/25 hover:text-black/70 hover:bg-black/[0.02]'
                        }
                      `}
                    >
                      {type}
                      <span className={`
                        text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center
                        ${isActive ? 'bg-white/20 text-white/80' : 'bg-black/[0.06] text-black/30'}
                      `}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-[1200px] mx-auto px-6 sm:px-10 py-16">
        {/* Result count */}
        {selectedType !== 'ทั้งหมด' && (
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-black/40">
              แสดง <span className="font-bold text-black/70">{filteredPosts.length}</span> ผลงาน
              {selectedType !== 'ทั้งหมด' && (
                <> สำหรับ <span className="font-bold text-black/70">{selectedType}</span></>
              )}
            </p>
            <button
              onClick={() => setSelectedType('ทั้งหมด')}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              ดูทั้งหมด →
            </button>
          </div>
        )}

        {filteredPosts.length === 0 ? (
          <div className="text-center py-32">
            <Buildings className="text-6xl text-black/10 mx-auto mb-4" weight="thin" />
            <p className="text-black/30 font-light">
              {selectedType === 'ทั้งหมด'
                ? 'ยังไม่มีผลงานที่เผยแพร่'
                : `ยังไม่มีผลงานประเภท "${selectedType}"`}
            </p>
            <p className="text-black/20 text-sm mt-2">
              {selectedType === 'ทั้งหมด'
                ? 'กลับมาใหม่เร็วๆ นี้'
                : 'ลองเลือกประเภทอื่น'}
            </p>
            {selectedType !== 'ทั้งหมด' && (
              <button
                onClick={() => setSelectedType('ทั้งหมด')}
                className="mt-4 text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                ← ดูผลงานทั้งหมด
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <article key={post.id} className="animate-fadeIn">
                <Link href={`/portfolio/${post.slug}`} className="group block border border-black/[0.07] hover:border-black/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 rounded-xl overflow-hidden">
                  {/* Cover Image */}
                  <div className="aspect-[16/10] w-full bg-black/5 overflow-hidden relative">
                    {post.cover_image_url ? (
                      <Image src={post.cover_image_url} alt={post.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
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
    </>
  );
}
