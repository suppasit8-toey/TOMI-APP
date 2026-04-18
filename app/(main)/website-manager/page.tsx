'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';
import {
  FloppyDisk, Globe, Camera, UploadSimple, Trash, Image as ImageIcon,
  SpinnerGap, Article, Plus, PencilSimple, Eye, X, CheckCircle,
  TextT, Phone, Link as LinkIcon, Info, Hash, BookOpen, Tag, ArrowsClockwise
} from '@phosphor-icons/react';

// ─── Types ───────────────────────────────────────────────────
interface SiteContent {
  id: string;
  hero_title: string; hero_subtitle: string;
  about_text: string;
  contact_phone: string; contact_line_id: string; contact_facebook: string;
  hero_image_url: string; about_image_url: string;
  service1_image_url: string; service2_image_url: string; service3_image_url: string;
  services_tag: string; services_title: string;
  service1_title: string; service1_desc: string;
  service2_title: string; service2_desc: string;
  service3_title: string; service3_desc: string;
  trust_stat1_value: string; trust_stat1_label: string; trust_stat1_title: string;
  trust_stat2_value: string; trust_stat2_label: string; trust_stat2_title: string;
  trust_stat3_value: string; trust_stat3_label: string; trust_stat3_title: string;
  trust_stat4_value: string; trust_stat4_label: string; trust_stat4_title: string;
  cta_title: string; cta_subtitle: string;
  footer_description: string;
  seo_title: string; seo_description: string;
}

interface BlogPost {
  id: string; title: string; slug: string; excerpt: string; content: string;
  cover_image_url: string; category: string; tags: string[];
  meta_title: string; meta_description: string; published: boolean;
  created_at: string;
}

interface CatalogItem {
  id: string; slug: string; title: string; content: string; short_description: string;
  keywords: string; image_url: string; price_range: string; brand_label: string;
  category_label: string; created_at: string; updated_at: string;
}

interface PortfolioImage {
  url: string; width?: number; height?: number; caption?: string;
}

interface PortfolioPost {
  id: string; title: string; slug: string; description: string;
  location_name: string; location_area: string;
  film_brand: string; film_model: string; film_type: string; film_specs: string;
  glass_area_sqm: number; images: PortfolioImage[]; cover_image_url: string;
  tags: string[]; meta_title: string; meta_description: string;
  published: boolean; created_at: string;
}

const DEFAULT_ID = '00000000-0000-0000-0000-000000000001';
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const DEFAULT_CONTENT: SiteContent = {
  id: DEFAULT_ID,
  hero_title: 'TOMI FILM บริการติดตั้งฟิล์มอาคารพรีเมียม',
  hero_subtitle: 'ลดความร้อน ประหยัดพลังงาน ปกป้องสิ่งที่คุณรักด้วยฟิล์มคุณภาพสูง',
  about_text: 'TOMI FILM ก่อตั้งด้วยความมุ่งมั่นที่จะนำเสนอนวัตกรรมฟิล์มกรองแสงที่ดีที่สุด',
  contact_phone: '099-999-9999', contact_line_id: '@tomifilm.th', contact_facebook: 'https://facebook.com/tomifilm',
  hero_image_url: '', about_image_url: '',
  service1_image_url: '', service2_image_url: '', service3_image_url: '',
  services_tag: 'WHY CHOOSE US?', services_title: 'OUR SERVICES',
  service1_title: 'กันความร้อน 99%', service1_desc: 'ป้องกันรังสี IR และ UV อย่างมีประสิทธิภาพ',
  service2_title: 'ลดแสงจ้า ถนอมสายตา', service2_desc: 'กรองแสงแดดสะท้อน ชมวิวสบายตา',
  service3_title: 'รับประกันยาวนาน', service3_desc: 'ติดตั้งโดยช่างผู้เชี่ยวชาญ รับประกันคุณภาพ',
  trust_stat1_value: '10', trust_stat1_label: 'ปี+', trust_stat1_title: 'ประสบการณ์',
  trust_stat2_value: '1,000', trust_stat2_label: '+', trust_stat2_title: 'โครงการ',
  trust_stat3_value: '99', trust_stat3_label: '%', trust_stat3_title: 'กันความร้อน',
  trust_stat4_value: '24/7', trust_stat4_label: '', trust_stat4_title: 'บริการ',
  cta_title: 'พร้อมเปลี่ยนอาคารของคุณให้เย็นสบายขึ้น?',
  cta_subtitle: 'เราพร้อมให้คำปรึกษาและแนะนำฟิล์มที่เหมาะสมที่สุด ปรึกษาฟรี ไม่มีค่าใช้จ่าย',
  footer_description: 'ผู้เชี่ยวชาญด้านฟิล์มกรองแสงอาคาร บ้าน สำนักงาน และรถยนต์ ด้วยประสบการณ์กว่า 10 ปี',
  seo_title: 'TOMI FILM — บริการติดตั้งฟิล์มอาคารพรีเมียม กรุงเทพฯ',
  seo_description: 'TOMI FILM ผู้เชี่ยวชาญติดตั้งฟิล์มกันความร้อน ฟิล์มกรองแสง รับประกันยาวนาน',
};

const EMPTY_POST: Omit<BlogPost,'id'|'created_at'> = {
  title: '', slug: '', excerpt: '', content: '', cover_image_url: '',
  category: 'ทั่วไป', tags: [], meta_title: '', meta_description: '', published: false,
};

const EMPTY_CATALOG: Omit<CatalogItem,'id'|'created_at'|'updated_at'> = {
  slug: '', title: '', content: '', short_description: '', keywords: '',
  image_url: '', price_range: '', brand_label: 'TOMI FILM', category_label: 'ฟิล์มสถาปัตยกรรม'
};

const EMPTY_PORTFOLIO: Omit<PortfolioPost,'id'|'created_at'> = {
  title: '', slug: '', description: '', location_name: '', location_area: '',
  film_brand: '', film_model: '', film_type: 'ฟิล์มกันความร้อน', film_specs: '',
  glass_area_sqm: 0, images: [], cover_image_url: '',
  tags: [], meta_title: '', meta_description: '', published: false,
};

// ─── Image Uploader ──────────────────────────────────────────
function ImageUploader({ label, value, onChange, hint }: {
  label: string; value: string; onChange: (url: string) => void; hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      Swal.fire('ตั้งค่า Cloudinary ไม่ครบ', 'กรุณาตรวจสอบ .env.local', 'error'); return;
    }
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', UPLOAD_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      onChange(data.secure_url);
      Swal.fire({ title: 'อัพโหลดสำเร็จ!', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire('อัพโหลดไม่สำเร็จ', err.message, 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700 flex items-center gap-1.5">
        <Camera weight="bold" className="text-blue-500" /> {label}
      </label>
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200">
          <img src={value} alt={label} className="w-full h-44 object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button type="button" onClick={() => fileRef.current?.click()} className="px-4 py-2 bg-white text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-slate-100">
              <UploadSimple weight="bold" /> เปลี่ยนรูป
            </button>
            <button type="button" onClick={() => onChange('')} className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-red-600">
              <Trash weight="bold" /> ลบ
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="w-full h-36 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
          {uploading ? (
            <><SpinnerGap weight="bold" className="text-3xl text-blue-500 animate-spin" /><span className="text-sm text-blue-600 font-semibold">กำลังอัพโหลด...</span></>
          ) : (
            <><ImageIcon weight="duotone" className="text-3xl text-slate-400" /><span className="text-sm text-slate-500 font-medium">คลิกเพื่ออัพโหลดรูปภาพ</span><span className="text-xs text-slate-400">JPG, PNG, WebP</span></>
          )}
        </button>
      )}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
    </div>
  );
}

// ─── Field components ─────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm";
const textareaCls = `${inputCls} resize-none`;

// ─── Section Header ───────────────────────────────────────────
function SectionHead({ n, label }: { n: number; label: string }) {
  return (
    <h3 className="text-base font-bold text-slate-800 border-b pb-2 flex items-center gap-2 mb-4">
      <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-black">{n}</span>
      {label}
    </h3>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function WebsiteManager() {
  const [tab, setTab] = useState<'landing'|'blog'|'catalog'|'portfolio'|'analytics'>('landing');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);

  // Blog state
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [editPost, setEditPost] = useState<(Omit<BlogPost,'id'|'created_at'> & { id?: string }) | null>(null);
  const [postSaving, setPostSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Catalog state
  const [catalogs, setCatalogs] = useState<CatalogItem[]>([]);
  const [catalogsLoading, setCatalogsLoading] = useState(false);
  const [editCatalog, setEditCatalog] = useState<(Omit<CatalogItem,'id'|'created_at'|'updated_at'> & { id?: string }) | null>(null);
  const [catalogSaving, setCatalogSaving] = useState(false);

  // Portfolio state
  const [portfolios, setPortfolios] = useState<PortfolioPost[]>([]);
  const [portfoliosLoading, setPortfoliosLoading] = useState(false);
  const [editPortfolio, setEditPortfolio] = useState<(Omit<PortfolioPost,'id'|'created_at'> & { id?: string }) | null>(null);
  const [portfolioSaving, setPortfolioSaving] = useState(false);
  const [pTagInput, setPTagInput] = useState('');
  const [imgUploading, setImgUploading] = useState(false);

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const { data } = await supabase.from('website_analytics').select('*').order('created_at', { ascending: false });
      if (data) setAnalyticsData(data);
    } catch {} finally { setAnalyticsLoading(false); }
  };

  const fetchPortfolios = async () => {
    try {
      setPortfoliosLoading(true);
      const { data } = await supabase.from('portfolio_posts').select('*').order('created_at', { ascending: false });
      if (data) setPortfolios(data as PortfolioPost[]);
    } catch {} finally { setPortfoliosLoading(false); }
  };

  useEffect(() => { fetchContent(); }, []);
  useEffect(() => { 
    if (tab === 'blog') fetchPosts(); 
    if (tab === 'catalog') fetchCatalogs();
    if (tab === 'portfolio') fetchPortfolios();
    if (tab === 'analytics') fetchAnalytics();
  }, [tab]);

  const set = (k: keyof SiteContent, v: string) => setContent(prev => ({ ...prev, [k]: v }));

  const fetchContent = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.from('landing_page_content').select('*').eq('id', DEFAULT_ID).single();
      if (data) setContent(c => ({ ...c, ...data }));
    } catch {} finally { setLoading(false); }
  };

  const fetchCatalogs = async () => {
    try {
      setCatalogsLoading(true);
      const { data } = await supabase.from('service_catalog').select('*').order('created_at', { ascending: false });
      if (data) setCatalogs(data);
    } catch {} finally { setCatalogsLoading(false); }
  };

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
      if (data) setPosts(data);
    } catch {} finally { setPostsLoading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { error } = await supabase.from('landing_page_content').upsert({ ...content, updated_at: new Date().toISOString() });
      if (error) throw error;
      Swal.fire({ title: 'บันทึกสำเร็จ', text: 'อัปเดตหน้าเว็บไซต์แล้ว', icon: 'success', confirmButtonColor: '#2563eb' });
    } catch (err: any) {
      Swal.fire({ title: 'ไม่สามารถบันทึกได้', text: err?.message || 'โปรดตรวจสอบการเชื่อมต่อ', icon: 'error' });
    } finally { setSaving(false); }
  };

  // Blog helpers
  const slugify = (t: string) => t.toLowerCase().replace(/\s+/g,'-').replace(/[^\u0E00-\u0E7Fa-z0-9-]/g,'').slice(0,80);

  const openNew = () => { setEditPost({ ...EMPTY_POST }); setTagInput(''); };
  const openEdit = (p: BlogPost) => { setEditPost({ ...p }); setTagInput(''); };
  const closeEdit = () => { setEditPost(null); setTagInput(''); };

  const addTag = () => {
    if (!tagInput.trim() || !editPost) return;
    setEditPost(p => p ? { ...p, tags: [...(p.tags||[]), tagInput.trim()] } : p);
    setTagInput('');
  };
  const removeTag = (i: number) => setEditPost(p => p ? { ...p, tags: p.tags.filter((_,j)=>j!==i) } : p);

  const savePost = async () => {
    if (!editPost?.title || !editPost?.slug) {
      Swal.fire('กรุณากรอกข้อมูล', 'ต้องการชื่อบทความและ Slug', 'warning'); return;
    }
    try {
      setPostSaving(true);
      const payload = { ...editPost, updated_at: new Date().toISOString() };
      if (editPost.id) {
        const { error } = await supabase.from('blog_posts').update(payload).eq('id', editPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('blog_posts').insert({ ...payload, created_at: new Date().toISOString() });
        if (error) throw error;
      }
      Swal.fire({ title: 'บันทึกบทความสำเร็จ', icon: 'success', timer: 1500, showConfirmButton: false });
      closeEdit(); fetchPosts();
    } catch (err: any) {
      Swal.fire({ title: 'บันทึกไม่สำเร็จ', text: err?.message, icon: 'error' });
    } finally { setPostSaving(false); }
  };

  const deletePost = async (id: string, title: string) => {
    const res = await Swal.fire({ title: `ลบ "${title}"?`, text: 'ไม่สามารถกู้คืนได้', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'ลบ', cancelButtonText: 'ยกเลิก' });
    if (!res.isConfirmed) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    fetchPosts();
  };

  const togglePublish = async (p: BlogPost) => {
    await supabase.from('blog_posts').update({ published: !p.published }).eq('id', p.id);
    fetchPosts();
  };

  // Catalog Helpers
  const openNewCatalog = () => setEditCatalog({ ...EMPTY_CATALOG });
  const openEditCatalog = (c: CatalogItem) => setEditCatalog({ 
    ...c, 
    brand_label: c.brand_label || '', 
    category_label: c.category_label || '', 
    price_range: c.price_range || '', 
    short_description: c.short_description || '', 
    keywords: c.keywords || '', 
    content: c.content || '', 
    image_url: c.image_url || '' 
  });
  const closeEditCatalog = () => setEditCatalog(null);

  const saveCatalog = async () => {
    if (!editCatalog?.title || !editCatalog?.slug) {
      Swal.fire('กรุณากรอกข้อมูล', 'ต้องการชื่อและ URL ปลายทาง', 'warning'); return;
    }
    try {
      setCatalogSaving(true);
      const payload = { ...editCatalog, updated_at: new Date().toISOString() };
      if (editCatalog.id) {
        const { error } = await supabase.from('service_catalog').update(payload).eq('id', editCatalog.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('service_catalog').insert({ ...payload, created_at: new Date().toISOString() });
        if (error) throw error;
      }
      Swal.fire({ title: 'บันทึก Catalog สำเร็จ', icon: 'success', timer: 1500, showConfirmButton: false });
      closeEditCatalog(); fetchCatalogs();
    } catch (err: any) {
      Swal.fire({ title: 'บันทึกไม่สำเร็จ', text: err?.message, icon: 'error' });
    } finally { setCatalogSaving(false); }
  };

  const deleteCatalog = async (id: string, title: string) => {
    const res = await Swal.fire({ title: `ลบ "${title}"?`, text: 'ไม่สามารถกู้คืนได้', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'ลบ', cancelButtonText: 'ยกเลิก' });
    if (!res.isConfirmed) return;
    await supabase.from('service_catalog').delete().eq('id', id);
    fetchCatalogs();
  };

  // Portfolio Helpers
  const openNewPortfolio = () => { setEditPortfolio({ ...EMPTY_PORTFOLIO }); setPTagInput(''); };
  const openEditPortfolio = (p: PortfolioPost) => { setEditPortfolio({ ...p }); setPTagInput(''); };
  const closeEditPortfolio = () => { setEditPortfolio(null); setPTagInput(''); };

  const addPTag = () => {
    if (!pTagInput.trim() || !editPortfolio) return;
    setEditPortfolio(p => p ? { ...p, tags: [...(p.tags||[]), pTagInput.trim()] } : p);
    setPTagInput('');
  };
  const removePTag = (i: number) => setEditPortfolio(p => p ? { ...p, tags: p.tags.filter((_,j)=>j!==i) } : p);

  const handlePortfolioImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number, slotCaption: string) => {
    const file = e.target.files?.[0];
    if (!file || !CLOUD_NAME || !UPLOAD_PRESET || !editPortfolio) return;
    try {
      setImgUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', UPLOAD_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const newImg: PortfolioImage = { url: data.secure_url, width: data.width, height: data.height, caption: slotCaption };
      setEditPortfolio(p => {
        if (!p) return p;
        const imgs = [...(p.images || [])];
        // Replace at slot index, or push if slot doesn't exist yet
        if (slotIndex < imgs.length) {
          imgs[slotIndex] = newImg;
        } else {
          // Fill gaps with empty slots if needed
          while (imgs.length < slotIndex) imgs.push({ url: '', caption: '' });
          imgs.push(newImg);
        }
        const validImgs = imgs.filter(img => img.url);
        return { ...p, images: validImgs, cover_image_url: validImgs[0]?.url || '' };
      });
      Swal.fire({ title: 'อัพโหลดสำเร็จ!', icon: 'success', timer: 1200, showConfirmButton: false });
    } catch (err: any) {
      Swal.fire('อัพโหลดไม่สำเร็จ', err.message, 'error');
    } finally {
      setImgUploading(false);
      e.target.value = '';
    }
  };

  const removePortfolioImage = (i: number) => {
    setEditPortfolio(p => {
      if (!p) return p;
      const imgs = p.images.filter((_,j) => j !== i);
      const cover = imgs.length > 0 ? (p.cover_image_url === p.images[i]?.url ? imgs[0]?.url : p.cover_image_url) : '';
      return { ...p, images: imgs, cover_image_url: cover };
    });
  };

  const setCoverImage = (url: string) => {
    setEditPortfolio(p => p ? { ...p, cover_image_url: url } : p);
  };

  const savePortfolio = async () => {
    if (!editPortfolio?.title || !editPortfolio?.slug) {
      Swal.fire('กรุณากรอกข้อมูล', 'ต้องการชื่องานและ Slug', 'warning'); return;
    }
    try {
      setPortfolioSaving(true);
      const payload = { ...editPortfolio, updated_at: new Date().toISOString() };
      if (editPortfolio.id) {
        const { error } = await supabase.from('portfolio_posts').update(payload).eq('id', editPortfolio.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('portfolio_posts').insert({ ...payload, created_at: new Date().toISOString() });
        if (error) throw error;
      }
      Swal.fire({ title: 'บันทึกผลงานสำเร็จ!', icon: 'success', timer: 1500, showConfirmButton: false });
      closeEditPortfolio(); fetchPortfolios();
    } catch (err: any) {
      Swal.fire({ title: 'บันทึกไม่สำเร็จ', text: err?.message, icon: 'error' });
    } finally { setPortfolioSaving(false); }
  };

  const deletePortfolio = async (id: string, title: string) => {
    const res = await Swal.fire({ title: `ลบ "${title}"?`, text: 'ไม่สามารถกู้คืนได้', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'ลบ', cancelButtonText: 'ยกเลิก' });
    if (!res.isConfirmed) return;
    await supabase.from('portfolio_posts').delete().eq('id', id);
    fetchPortfolios();
  };

  const togglePortfolioPublish = async (p: PortfolioPost) => {
    await supabase.from('portfolio_posts').update({ published: !p.published }).eq('id', p.id);
    fetchPortfolios();
  };

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-16 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 no-print">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 shrink-0">
            <Globe weight="fill" className="text-blue-500 text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">จัดการเว็บไซต์ (CMS)</h1>
            <p className="text-sm text-slate-400 mt-0.5 font-medium">ปรับแต่งข้อความ รูปภาพ และบทความสำหรับเว็บไซต์</p>
          </div>
        </div>
        <a href="/" target="_blank" className="bg-slate-100 text-slate-600 border border-slate-200 py-2.5 px-5 rounded-xl font-bold shadow-sm inline-flex items-center gap-2 hover:-translate-y-0.5 transition hover:bg-slate-200 w-full sm:w-auto justify-center">
          <Eye weight="bold" className="text-lg" /> ดูเว็บไซต์
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
        {([['landing','🏠 หน้าแรก'],['portfolio','📸 ผลงาน'],['catalog','🏷️ SEO Catalog'],['blog','📝 บทความ / Blog'],['analytics','📊 วิเคราะห์ข้อมูล']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab===id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ══════════ TAB: LANDING PAGE ══════════ */}
      {tab === 'landing' && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-amber-800 text-sm flex gap-2 mb-6">
          <Info className="text-xl shrink-0 mt-0.5" weight="fill" />
          <p>ถ้ายังไม่ได้รันไฟล์ SQL กรุณารัน <code className="bg-amber-100 px-1 rounded font-mono text-xs">add_cms_blog.sql</code> ใน Supabase SQL Editor ก่อน</p>
        </div>
      )}

      {tab === 'landing' && (
        <form onSubmit={handleSave} className="space-y-1">

          {/* ─ Card: SEO ─ */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
            <SectionHead n={1} label="SEO — ชื่อและคำอธิบายสำหรับ Google & AI" />
            <div className="space-y-4">
              <Field label="SEO Title (ชื่อที่แสดงใน Google)">
                <input value={content.seo_title} onChange={e=>set('seo_title',e.target.value)} className={inputCls} />
              </Field>
              <Field label="SEO Description (คำอธิบายในผลการค้นหา)">
                <textarea value={content.seo_description} onChange={e=>set('seo_description',e.target.value)} rows={3} className={textareaCls} />
              </Field>
            </div>
          </div>

          {/* ─ Card: Hero ─ */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
            <SectionHead n={2} label="ส่วนต้อนรับ (Hero Section)" />
            <div className="space-y-4">
              <Field label="หัวข้อหลัก"><input value={content.hero_title} onChange={e=>set('hero_title',e.target.value)} className={inputCls} required /></Field>
              <Field label="ข้อความรอง"><textarea value={content.hero_subtitle} onChange={e=>set('hero_subtitle',e.target.value)} rows={2} className={textareaCls} required /></Field>
              <ImageUploader label="รูปพื้นหลัง Hero" value={content.hero_image_url} onChange={u=>set('hero_image_url',u)} hint="แนะนำ 1920×1080 — ถ้าปล่อยว่างจะใช้ Gradient แทน" />
            </div>
          </div>

          {/* ─ Card: Trust Bar ─ */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
            <SectionHead n={3} label="แถบสถิติ (Trust Bar)" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {([1,2,3,4] as const).map(n => (
                <div key={n} className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">สถิติ {n}</p>
                  <Field label="หัวข้อ"><input value={(content as any)[`trust_stat${n}_title`]} onChange={e=>set(`trust_stat${n}_title` as any,e.target.value)} className={inputCls} /></Field>
                  <Field label="ตัวเลข"><input value={(content as any)[`trust_stat${n}_value`]} onChange={e=>set(`trust_stat${n}_value` as any,e.target.value)} className={inputCls} /></Field>
                  <Field label="หน่วย"><input value={(content as any)[`trust_stat${n}_label`]} onChange={e=>set(`trust_stat${n}_label` as any,e.target.value)} className={inputCls} /></Field>
                </div>
              ))}
            </div>
          </div>

          {/* ─ Card: Services ─ */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
            <SectionHead n={4} label="บริการของเรา (Services)" />
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tag เล็ก"><input value={content.services_tag} onChange={e=>set('services_tag',e.target.value)} className={inputCls} /></Field>
                <Field label="หัวข้อ Section"><input value={content.services_title} onChange={e=>set('services_title',e.target.value)} className={inputCls} /></Field>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {([1,2,3] as const).map(n => (
                  <div key={n} className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">การ์ดที่ {n}</p>
                    <Field label="ชื่อบริการ"><input value={(content as any)[`service${n}_title`]} onChange={e=>set(`service${n}_title` as any,e.target.value)} className={inputCls} /></Field>
                    <Field label="คำอธิบาย"><textarea value={(content as any)[`service${n}_desc`]} onChange={e=>set(`service${n}_desc` as any,e.target.value)} rows={2} className={textareaCls} /></Field>
                    <ImageUploader label="รูปภาพ" value={(content as any)[`service${n}_image_url`]} onChange={u=>set(`service${n}_image_url` as any,u)} hint="600×400px" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─ Card: About ─ */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
            <SectionHead n={5} label="เกี่ยวกับเรา (About Us)" />
            <div className="space-y-4">
              <Field label="รายละเอียด">
                <textarea value={content.about_text} onChange={e=>set('about_text',e.target.value)} rows={4} className={textareaCls} required />
              </Field>
              <ImageUploader label="รูปประกอบ" value={content.about_image_url} onChange={u=>set('about_image_url',u)} hint="800×1000px (แนวตั้ง)" />
            </div>
          </div>

          {/* ─ Card: CTA ─ */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
            <SectionHead n={6} label="Call to Action (CTA)" />
            <div className="space-y-4">
              <Field label="หัวข้อ CTA"><input value={content.cta_title} onChange={e=>set('cta_title',e.target.value)} className={inputCls} /></Field>
              <Field label="คำอธิบาย CTA"><textarea value={content.cta_subtitle} onChange={e=>set('cta_subtitle',e.target.value)} rows={2} className={textareaCls} /></Field>
            </div>
          </div>

          {/* ─ Card: Contact ─ */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
            <SectionHead n={7} label="ข้อมูลติดต่อ (Contact Info)" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="เบอร์โทรศัพท์"><input value={content.contact_phone} onChange={e=>set('contact_phone',e.target.value)} className={inputCls} required /></Field>
              <Field label="Line ID"><input value={content.contact_line_id} onChange={e=>set('contact_line_id',e.target.value)} className={inputCls} required /></Field>
              <Field label="Facebook Link"><input value={content.contact_facebook} onChange={e=>set('contact_facebook',e.target.value)} className={inputCls} required /></Field>
            </div>
          </div>

          {/* ─ Card: Footer ─ */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <SectionHead n={8} label="Footer" />
            <Field label="คำอธิบายในส่วน Footer">
              <textarea value={content.footer_description} onChange={e=>set('footer_description',e.target.value)} rows={2} className={textareaCls} />
            </Field>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-70 flex items-center gap-2">
              {saving ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />กำลังบันทึก...</> : <><FloppyDisk weight="fill" className="text-xl" />บันทึกข้อมูลเว็บไซต์</>}
            </button>
          </div>
        </form>
      )}

      {/* ══════════ TAB: BLOG ══════════ */}
      {tab === 'blog' && !editPost && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">บทความทั้งหมด</h2>
              <p className="text-sm text-slate-500">บทความที่เผยแพร่จะแสดงบนเว็บไซต์และช่วย SEO</p>
            </div>
            <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-600/30">
              <Plus weight="bold" /> สร้างบทความใหม่
            </button>
          </div>

          {postsLoading ? (
            <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
              <Article className="text-5xl text-slate-200 mx-auto mb-3" weight="thin" />
              <p className="text-slate-400 font-medium">ยังไม่มีบทความ</p>
              <p className="text-slate-300 text-sm mt-1">กดปุ่ม "สร้างบทความใหม่" เพื่อเริ่มต้น</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map(p => (
                <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:border-slate-300 transition-all">
                  {p.cover_image_url ? (
                    <img src={p.cover_image_url} alt={p.title} className="w-16 h-12 object-cover rounded-lg shrink-0" />
                  ) : (
                    <div className="w-16 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      <Article className="text-2xl text-slate-300" weight="thin" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold tracking-wide ${p.published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                        {p.published ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}
                      </span>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{p.category}</span>
                    </div>
                    <p className="font-semibold text-slate-800 text-sm truncate">{p.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(p.created_at).toLocaleDateString('th-TH')}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => togglePublish(p)} title={p.published ? 'ซ่อน' : 'เผยแพร่'}
                      className={`p-2 rounded-lg transition-all ${p.published ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-slate-400 bg-slate-50 hover:bg-slate-100'}`}>
                      <Eye weight="bold" className="text-sm" />
                    </button>
                    <button onClick={() => openEdit(p)} className="p-2 rounded-lg text-blue-500 bg-blue-50 hover:bg-blue-100 transition-all">
                      <PencilSimple weight="bold" className="text-sm" />
                    </button>
                    <button onClick={() => deletePost(p.id, p.title)} className="p-2 rounded-lg text-red-400 bg-red-50 hover:bg-red-100 transition-all">
                      <Trash weight="bold" className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════ BLOG EDITOR ══════════ */}
      {tab === 'blog' && editPost && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={closeEdit} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all">
              <X weight="bold" className="text-slate-600" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{editPost.id ? 'แก้ไขบทความ' : 'สร้างบทความใหม่'}</h2>
              <p className="text-sm text-slate-500">กรอกข้อมูลให้ครบเพื่อ SEO ที่ดี</p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-10 h-5 rounded-full transition-all ${editPost.published ? 'bg-green-500' : 'bg-slate-300'} relative`}
                  onClick={() => setEditPost(p => p ? { ...p, published: !p.published } : p)}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${editPost.published ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className={`text-sm font-semibold ${editPost.published ? 'text-green-600' : 'text-slate-400'}`}>
                  {editPost.published ? 'เผยแพร่' : 'ฉบับร่าง'}
                </span>
              </label>
              <button onClick={savePost} disabled={postSaving}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-70 shadow-md shadow-blue-600/20">
                {postSaving ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />บันทึก...</> : <><FloppyDisk weight="fill" />บันทึก</>}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Main content */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <Field label="ชื่อบทความ *">
                  <input value={editPost.title} onChange={e => {
                    const t = e.target.value;
                    setEditPost(p => p ? { ...p, title: t, slug: p.id ? p.slug : slugify(t) } : p);
                  }} className={inputCls} placeholder="ชื่อบทความที่น่าสนใจ..." />
                </Field>
                <Field label="Slug (URL) *">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-sm shrink-0">/blog/</span>
                    <input value={editPost.slug} onChange={e => setEditPost(p => p ? { ...p, slug: slugify(e.target.value) } : p)} className={inputCls} placeholder="url-friendly-name" />
                  </div>
                </Field>
                <Field label="บทคัดย่อ (ปรากฏในหน้ารายการ)">
                  <textarea value={editPost.excerpt} onChange={e => setEditPost(p => p ? { ...p, excerpt: e.target.value } : p)} rows={2} className={textareaCls} placeholder="สรุปสั้นๆ เกี่ยวกับบทความนี้..." />
                </Field>
                <Field label="เนื้อหาบทความ (รองรับ Markdown พื้นฐาน)">
                  <textarea value={editPost.content} onChange={e => setEditPost(p => p ? { ...p, content: e.target.value } : p)} rows={14} className={textareaCls} placeholder="เขียนเนื้อหาบทความที่นี่...&#10;&#10;# หัวข้อใหญ่&#10;## หัวข้อรอง&#10;**ตัวหนา** *ตัวเอียง*" />
                </Field>
              </div>

              {/* SEO */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Hash weight="bold" className="text-blue-500" /> SEO Settings
                </h3>
                <Field label="Meta Title (ชื่อในผลการค้นหา)">
                  <input value={editPost.meta_title} onChange={e => setEditPost(p => p ? { ...p, meta_title: e.target.value } : p)} className={inputCls} placeholder="ปล่อยว่างเพื่อใช้ชื่อบทความ" />
                  <p className="text-xs text-slate-400 mt-1">{editPost.meta_title.length}/60 ตัวอักษร</p>
                </Field>
                <Field label="Meta Description (คำอธิบายในผลการค้นหา)">
                  <textarea value={editPost.meta_description} onChange={e => setEditPost(p => p ? { ...p, meta_description: e.target.value } : p)} rows={2} className={textareaCls} placeholder="ปล่อยว่างเพื่อใช้บทคัดย่อ" />
                  <p className="text-xs text-slate-400 mt-1">{editPost.meta_description.length}/160 ตัวอักษร</p>
                </Field>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-700">รายละเอียด</h3>
                <Field label="หมวดหมู่">
                  <select value={editPost.category} onChange={e => setEditPost(p => p ? { ...p, category: e.target.value } : p)} className={inputCls}>
                    {['ทั่วไป','ฟิล์มกันความร้อน','ฟิล์มนิรภัย','ฟิล์มรถยนต์','เคล็ดลับ & วิธีดูแล','ข่าวสาร','รีวิวโครงการ'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tags (คีย์เวิร์ด SEO)</label>
                  <div className="flex gap-2 mb-2">
                    <input value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addTag())}
                      className={`${inputCls} flex-1`} placeholder="พิมพ์แล้วกด Enter" />
                    <button type="button" onClick={addTag} className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-all">
                      <Plus weight="bold" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {editPost.tags?.map((tag, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded-lg">
                        {tag}
                        <button type="button" onClick={() => removeTag(i)} className="hover:text-red-500 transition-colors"><X weight="bold" className="text-xs" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-3">รูปปก (Cover Image)</h3>
                <ImageUploader label="รูปปกบทความ" value={editPost.cover_image_url} onChange={u => setEditPost(p => p ? { ...p, cover_image_url: u } : p)} hint="1200×630px แนะนำ" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ TAB: CATALOG ══════════ */}
      {tab === 'catalog' && !editCatalog && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">จัดการหน้า SEO Catalog</h2>
              <p className="text-sm text-slate-500">แคตตาล็อกหน้าเว็บที่สร้างมาเพื่อทำ SEO โดยเฉพาะ</p>
            </div>
            <button onClick={openNewCatalog} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-600/30">
              <Plus weight="bold" /> สร้าง Catalog ใหม่
            </button>
          </div>

          {catalogsLoading ? (
            <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
          ) : catalogs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
              <Tag className="text-5xl text-slate-200 mx-auto mb-3" weight="thin" />
              <p className="text-slate-400 font-medium">ยังไม่มีข้อมูล Catalog</p>
              <p className="text-slate-300 text-sm mt-1">กดปุ่ม "สร้าง Catalog ใหม่" เพื่อเริ่มต้นดันอันดับ Google</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {catalogs.map(c => (
                <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4 hover:border-blue-300 hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    {c.image_url ? (
                      <img src={c.image_url} alt={c.title} className="w-20 h-20 object-cover rounded-lg shrink-0 border border-slate-100" />
                    ) : (
                      <div className="w-20 h-20 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 border border-slate-100">
                        <ImageIcon className="text-2xl text-slate-300" weight="thin" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold tracking-wide bg-blue-50 text-blue-600 uppercase">
                          {c.category_label || 'SERVICE'}
                        </span>
                        <a href={`/catalog/${c.slug}`} target="_blank" className="text-xs text-blue-400 hover:text-blue-600 underline truncate">/{c.slug}</a>
                      </div>
                      <p className="font-bold text-slate-800 text-sm leading-tight mb-1 line-clamp-2">{c.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-2">{c.short_description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100">
                    <button onClick={() => openEditCatalog(c)} className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all flex items-center justify-center gap-2">
                      <PencilSimple weight="bold" /> แก้ไขข้อมูล
                    </button>
                    <button onClick={() => deleteCatalog(c.id, c.title)} className="px-3 py-2 rounded-lg text-red-500 bg-red-50 hover:bg-red-100 transition-all">
                      <Trash weight="bold" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════ CATALOG EDITOR ══════════ */}
      {tab === 'catalog' && editCatalog && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={closeEditCatalog} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all">
              <X weight="bold" className="text-slate-600" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{editCatalog.id ? 'แก้ไขหน้า SEO Catalog' : 'สร้าง Catalog ใหม่'}</h2>
            </div>
            <div className="ml-auto">
              <button onClick={saveCatalog} disabled={catalogSaving}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-70 shadow-md shadow-blue-600/20">
                {catalogSaving ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />บันทึก...</> : <><FloppyDisk weight="fill" />บันทึกแคตตาล็อก</>}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                 <h3 className="font-bold text-slate-800 mb-2">ข้อมูลหลักสำหรับ SEO</h3>
                 <Field label="พาดหัว (H1 Title) *">
                   <input value={editCatalog.title} onChange={e => {
                     const t = e.target.value;
                     setEditCatalog(p => p ? { ...p, title: t, slug: p.id ? p.slug : slugify(t) } : p);
                   }} className={inputCls} placeholder="เช่น ติดตั้งฟิล์มอาคาร ลดความร้อน..." />
                 </Field>
                 <Field label="URL Slug *">
                   <div className="flex items-center gap-2">
                     <span className="text-slate-400 text-sm shrink-0">/catalog/</span>
                     <input value={editCatalog.slug} onChange={e => setEditCatalog(p => p ? { ...p, slug: slugify(e.target.value) } : p)} className={inputCls} placeholder="url-friendly-name" />
                   </div>
                 </Field>
                 <Field label="คำอธิบายสั้น (Short Description / Meta Desc)">
                   <textarea value={editCatalog.short_description} onChange={e => setEditCatalog(p => p ? { ...p, short_description: e.target.value } : p)} rows={3} className={textareaCls} placeholder="อธิบายบริการสั้นๆ เพื่อให้ชวนคลิก..." />
                 </Field>
                 <Field label="รายละเอียดเต็ม (HTML / Rich Text รองรับ)">
                   <textarea value={editCatalog.content} onChange={e => setEditCatalog(p => p ? { ...p, content: e.target.value } : p)} rows={10} className={textareaCls} placeholder="พิมพ์ข้อความปกติ หรือใส่แท็ก HTML ได้" />
                 </Field>
                 <Field label="คีย์เวิร์ด (Keywords คั่นด้วยลูกน้ำ)">
                   <input value={editCatalog.keywords} onChange={e => setEditCatalog(p => p ? { ...p, keywords: e.target.value } : p)} className={inputCls} placeholder="ติดฟิล์มอาคาร, ฟิล์มคอนโด, ฟิล์มกันร้อน" />
                 </Field>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                 <h3 className="font-bold text-slate-800">ข้อมูลเสริม</h3>
                 <Field label="แบรนด์ / ร้านค้า">
                   <input value={editCatalog.brand_label} onChange={e => setEditCatalog(p => p ? { ...p, brand_label: e.target.value } : p)} className={inputCls} />
                 </Field>
                 <Field label="หมวดหมู่สินค้า">
                   <input value={editCatalog.category_label} onChange={e => setEditCatalog(p => p ? { ...p, category_label: e.target.value } : p)} className={inputCls} placeholder="เช่น ฟิล์มสถาปัตยกรรม" />
                 </Field>
                 <Field label="ราคาโปรโมท (เผื่อต้องการระบุ)">
                   <input value={editCatalog.price_range} onChange={e => setEditCatalog(p => p ? { ...p, price_range: e.target.value } : p)} className={inputCls} placeholder="เช่น เริ่มต้น 50 บาท/ตร.ฟุต" />
                 </Field>
              </div>
              
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                 <h3 className="font-bold text-slate-800 mb-3">รูปภาพประกอบแคตตาล็อก</h3>
                 <ImageUploader label="อัปโหลดรูปภาพหลัก" value={editCatalog.image_url} onChange={u => setEditCatalog(p => p ? { ...p, image_url: u } : p)} hint="สัดส่วนภาพแบบคร่าวๆ 4:3 หรือกล้องแนวนอน" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ TAB: ANALYTICS ══════════ */}
      {tab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">วิเคราะห์ข้อมูลเว็บไซต์</h2>
              <p className="text-sm text-slate-500">ติดตามยอดผู้เข้าชมและหน้าที่มีความสนใจสูงสุด</p>
            </div>
            <button onClick={fetchAnalytics} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all text-slate-600">
              <ArrowsClockwise weight="bold" className={analyticsLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {analyticsLoading ? (
            <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">เข้าชมทั้งหมด</p>
                  <p className="text-3xl font-black text-slate-800">{analyticsData.length}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200">
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">เข้าชมวันนี้</p>
                  <p className="text-3xl font-black text-slate-800">
                    {analyticsData.filter(a => new Date(a.created_at).toDateString() === new Date().toDateString()).length}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200">
                  <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">มือถือ (Mobile)</p>
                  <p className="text-3xl font-black text-slate-800">
                    {analyticsData.filter(a => a.device_type === 'Mobile').length}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200">
                  <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">พีซี (Desktop)</p>
                  <p className="text-3xl font-black text-slate-800">
                    {analyticsData.filter(a => a.device_type === 'Desktop').length}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Most Popular Pages */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">ยอดฮิต (เรียงตามยอดเข้าชม)</h3>
                  </div>
                  <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto p-5 space-y-4">
                    {(() => {
                        const counts = analyticsData.reduce((acc, obj) => {
                           const p = obj.page_path === '/' ? 'หน้าแรก (Home)' : obj.page_path;
                           acc[p] = (acc[p] || 0) + 1; return acc;
                        }, {} as Record<string, number>);
                        const sorted = Object.entries(counts).sort((a: any, b: any) => b[1] - a[1]);
                        return sorted.length > 0 ? sorted.map(([path, count]: any, i) => (
                           <div key={i} className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-slate-700 truncate mr-4">{path}</span>
                              <span className="font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-lg text-xs border border-slate-200">{count} วิว</span>
                           </div>
                        )) : <div className="text-slate-400 text-center text-sm py-4">ยังไม่มีข้อมูลเข้าชม</div>;
                    })()}
                  </div>
                </div>

                {/* Recent Visits */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">หน้าที่คนเข้าล่าสุด</h3>
                  </div>
                  <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                    {analyticsData.length > 0 ? analyticsData.slice(0, 15).map((a, i) => (
                      <div key={i} className="p-4 flex items-start justify-between hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{a.page_path === '/' ? 'หน้าแรก (Home)' : a.page_path}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{a.device_type} • {new Date(a.created_at).toLocaleString('th-TH')}</p>
                        </div>
                        <a href={a.url} target="_blank" className="text-blue-500 bg-blue-50 p-2 rounded-lg hover:bg-blue-100">
                          <LinkIcon />
                        </a>
                      </div>
                    )) : <div className="text-slate-400 text-center text-sm py-8">ยังไม่มีข้อมูลเข้าชม</div>}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════ TAB: PORTFOLIO LIST ══════════ */}
      {tab === 'portfolio' && !editPortfolio && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">ผลงานติดตั้งทั้งหมด</h2>
              <p className="text-sm text-slate-500">โพสผลงานที่ไปติดตั้งมา พร้อมรูปและสเปกฟิล์ม ช่วยทำ SEO</p>
            </div>
            <button onClick={openNewPortfolio} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-600/30">
              <Plus weight="bold" /> สร้างผลงานใหม่
            </button>
          </div>

          {portfoliosLoading ? (
            <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
          ) : portfolios.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
              <ImageIcon className="text-5xl text-slate-200 mx-auto mb-3" weight="thin" />
              <p className="text-slate-400 font-medium">ยังไม่มีผลงาน</p>
              <p className="text-slate-300 text-sm mt-1">กดปุ่ม &quot;สร้างผลงานใหม่&quot; เพื่อเริ่มโพสผลงาน</p>
            </div>
          ) : (
            <div className="space-y-3">
              {portfolios.map(p => (
                <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:border-slate-300 transition-all">
                  {p.cover_image_url ? (
                    <img src={p.cover_image_url} alt={p.title} className="w-20 h-14 object-cover rounded-lg shrink-0 border border-slate-100" />
                  ) : (
                    <div className="w-20 h-14 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      <ImageIcon className="text-2xl text-slate-300" weight="thin" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold tracking-wide ${p.published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                        {p.published ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}
                      </span>
                      {p.film_type && <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded">{p.film_type}</span>}
                      {p.location_area && <span className="text-xs text-slate-400">📍 {p.location_area}</span>}
                    </div>
                    <p className="font-semibold text-slate-800 text-sm truncate">{p.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{p.images?.length || 0} รูป • {new Date(p.created_at).toLocaleDateString('th-TH')}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => togglePortfolioPublish(p)} title={p.published ? 'ซ่อน' : 'เผยแพร่'}
                      className={`p-2 rounded-lg transition-all ${p.published ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-slate-400 bg-slate-50 hover:bg-slate-100'}`}>
                      <Eye weight="bold" className="text-sm" />
                    </button>
                    <button onClick={() => openEditPortfolio(p)} className="p-2 rounded-lg text-blue-500 bg-blue-50 hover:bg-blue-100 transition-all">
                      <PencilSimple weight="bold" className="text-sm" />
                    </button>
                    <button onClick={() => deletePortfolio(p.id, p.title)} className="p-2 rounded-lg text-red-400 bg-red-50 hover:bg-red-100 transition-all">
                      <Trash weight="bold" className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════ PORTFOLIO EDITOR ══════════ */}
      {tab === 'portfolio' && editPortfolio && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={closeEditPortfolio} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all">
              <X weight="bold" className="text-slate-600" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{editPortfolio.id ? 'แก้ไขผลงาน' : 'สร้างผลงานใหม่'}</h2>
              <p className="text-sm text-slate-500">กรอกข้อมูลผลงาน รูปภาพ สเปกฟิล์ม และสถานที่</p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-10 h-5 rounded-full transition-all ${editPortfolio.published ? 'bg-green-500' : 'bg-slate-300'} relative`}
                  onClick={() => setEditPortfolio(p => p ? { ...p, published: !p.published } : p)}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${editPortfolio.published ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className={`text-sm font-semibold ${editPortfolio.published ? 'text-green-600' : 'text-slate-400'}`}>
                  {editPortfolio.published ? 'เผยแพร่' : 'ฉบับร่าง'}
                </span>
              </label>
              <button onClick={savePortfolio} disabled={portfolioSaving}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-70 shadow-md shadow-blue-600/20">
                {portfolioSaving ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />บันทึก...</> : <><FloppyDisk weight="fill" />บันทึกผลงาน</>}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-4">
              {/* Basic Info */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <SectionHead n={1} label="ข้อมูลผลงาน" />
                <Field label="ชื่องาน / โครงการ *">
                  <input value={editPortfolio.title} onChange={e => {
                    const t = e.target.value;
                    setEditPortfolio(p => p ? { ...p, title: t, slug: p.id ? p.slug : slugify(t) } : p);
                  }} className={inputCls} placeholder="เช่น ติดฟิล์มอาคาร ABC Tower บางนา" />
                </Field>
                <Field label="Slug (URL) *">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-sm shrink-0">/portfolio/</span>
                    <input value={editPortfolio.slug} onChange={e => setEditPortfolio(p => p ? { ...p, slug: slugify(e.target.value) } : p)} className={inputCls} placeholder="abc-tower-bangna" />
                  </div>
                </Field>
                <Field label="เนื้อหา / คอนเทนต์ (รองรับ Markdown)">
                  <textarea value={editPortfolio.description} onChange={e => setEditPortfolio(p => p ? { ...p, description: e.target.value } : p)} rows={8} className={textareaCls} placeholder="เขียนรายละเอียดผลงาน เช่น ปัญหาที่ลูกค้าเจอ และวิธีที่เราแก้ไข..." />
                </Field>
              </div>

              {/* Images */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <SectionHead n={2} label="รูปภาพผลงาน (4–6 รูป)" />
                <p className="text-xs text-slate-400">อัพโหลดรูปแต่ละช่อง — รูปช่องแรกจะเป็นรูปปกอัตโนมัติ · ถ่ายแนวนอน ขั้นต่ำ 800px</p>

                {/* 6 Individual Upload Slots */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { emoji: '1️⃣', label: 'รูปปก — ภาพรวมอาคาร', size: '1200×800px · 3:2', isCover: true },
                    { emoji: '2️⃣', label: 'ก่อนติดตั้ง (Before)', size: '1080×1080px · 1:1' },
                    { emoji: '3️⃣', label: 'หลังติดตั้ง (After)', size: '1080×1080px · 1:1' },
                    { emoji: '4️⃣', label: 'ระหว่างทำงาน', size: '1080×1080px · 1:1' },
                    { emoji: '5️⃣', label: 'Close-up เนื้อฟิล์ม', size: '1080×1080px · 1:1' },
                    { emoji: '6️⃣', label: 'ทีมงาน / ป้ายโครงการ', size: '1080×1080px · 1:1' },
                  ].map((slot, i) => {
                    const img = editPortfolio.images?.[i];
                    const hasImage = img && img.url;

                    return (
                      <div key={i} className={`rounded-xl border-2 overflow-hidden transition-all ${
                        hasImage
                          ? (slot.isCover ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-slate-200')
                          : 'border-dashed border-slate-300'
                      }`}>
                        {hasImage ? (
                          /* — Uploaded State — */
                          <div className="relative group">
                            <img src={img.url} alt={slot.label} className="w-full h-36 object-cover" />
                            {/* Size Badge */}
                            {img.width && img.height && (
                              <span className="absolute top-2 left-2 text-[9px] bg-black/60 text-white px-2 py-0.5 rounded-full font-mono backdrop-blur-sm">
                                {img.width}×{img.height}
                              </span>
                            )}
                            {/* Cover Badge */}
                            {slot.isCover && (
                              <span className="absolute top-2 right-2 text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">📷 รูปปก</span>
                            )}
                            {/* Hover Actions */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <label className="px-2 py-1 bg-white text-slate-800 rounded-lg text-[10px] font-bold hover:bg-slate-100 cursor-pointer">
                                🔄 เปลี่ยน
                                <input type="file" accept="image/*" onChange={e => handlePortfolioImageUpload(e, i, slot.label)} className="hidden" />
                              </label>
                              <button type="button" onClick={() => removePortfolioImage(i)} className="px-2 py-1 bg-red-500 text-white rounded-lg text-[10px] font-bold hover:bg-red-600">🗑️ ลบ</button>
                            </div>
                          </div>
                        ) : (
                          /* — Empty Upload State — */
                          <label className="flex flex-col items-center justify-center h-36 cursor-pointer hover:bg-blue-50 transition-all bg-slate-50">
                            {imgUploading ? (
                              <><SpinnerGap weight="bold" className="text-2xl text-blue-500 animate-spin" /><span className="text-[10px] text-blue-600 font-semibold mt-1">อัพโหลด...</span></>
                            ) : (
                              <>
                                <span className="text-lg mb-1">{slot.emoji}</span>
                                <UploadSimple weight="bold" className="text-xl text-slate-400" />
                                <span className="text-[10px] text-slate-600 font-semibold mt-1 text-center px-2 leading-tight">{slot.label}</span>
                                <span className="text-[9px] text-slate-400 mt-0.5">{slot.size}</span>
                              </>
                            )}
                            <input type="file" accept="image/*" onChange={e => handlePortfolioImageUpload(e, i, slot.label)} className="hidden" disabled={imgUploading} />
                          </label>
                        )}
                        {/* Caption */}
                        {hasImage && (
                          <input
                            value={img.caption || ''}
                            onChange={e => {
                              const val = e.target.value;
                              setEditPortfolio(p => {
                                if (!p) return p;
                                const imgs = [...p.images];
                                imgs[i] = { ...imgs[i], caption: val };
                                return { ...p, images: imgs };
                              });
                            }}
                            className="w-full text-[11px] px-3 py-2 bg-slate-50 border-t border-slate-200 focus:outline-none focus:bg-blue-50"
                            placeholder="คำอธิบายรูป (ไม่บังคับ)"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="text-[10px] text-slate-400 space-y-0.5 bg-slate-50 rounded-lg p-3">
                  <p>💡 <strong>Tips:</strong> ถ่ายรูปแนวนอนจะแสดงผลดีที่สุด — ขั้นต่ำ 800px ขึ้นไป</p>
                  <p>📱 รูปจากมือถือใช้ได้เลย ระบบแสดงขนาดจริงอัตโนมัติ</p>
                  <p>⭐ รูปช่อง 1 จะเป็นรูปปกเสมอ (แสดงในหน้าแกลเลอรี)</p>
                </div>
              </div>

              {/* SEO */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2"><Hash weight="bold" className="text-blue-500" /> SEO Settings</h3>
                <Field label="Meta Title">
                  <input value={editPortfolio.meta_title} onChange={e => setEditPortfolio(p => p ? { ...p, meta_title: e.target.value } : p)} className={inputCls} placeholder="ปล่อยว่างเพื่อใช้ชื่องาน" />
                  <p className="text-xs text-slate-400 mt-1">{editPortfolio.meta_title.length}/60 ตัวอักษร</p>
                </Field>
                <Field label="Meta Description">
                  <textarea value={editPortfolio.meta_description} onChange={e => setEditPortfolio(p => p ? { ...p, meta_description: e.target.value } : p)} rows={2} className={textareaCls} placeholder="ปล่อยว่างเพื่อใช้เนื้อหา" />
                  <p className="text-xs text-slate-400 mt-1">{editPortfolio.meta_description.length}/160 ตัวอักษร</p>
                </Field>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Film Specs */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-700">🎬 สเปกฟิล์ม</h3>
                <Field label="แบรนด์ฟิล์ม">
                  <input value={editPortfolio.film_brand} onChange={e => setEditPortfolio(p => p ? { ...p, film_brand: e.target.value } : p)} className={inputCls} placeholder="เช่น 3M, LLumar, V-KOOL" />
                </Field>
                <Field label="รุ่นฟิล์ม">
                  <input value={editPortfolio.film_model} onChange={e => setEditPortfolio(p => p ? { ...p, film_model: e.target.value } : p)} className={inputCls} placeholder="เช่น Prestige PR70" />
                </Field>
                <Field label="ประเภทฟิล์ม">
                  <select value={editPortfolio.film_type} onChange={e => setEditPortfolio(p => p ? { ...p, film_type: e.target.value } : p)} className={inputCls}>
                    {['ฟิล์มกันความร้อน','ฟิล์มนิรภัย','ฟิล์มกรองแสง','ฟิล์มกันรังสี UV','ฟิล์มตกแต่ง','ฟิล์มรถยนต์','อื่นๆ'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="สเปกเพิ่มเติม">
                  <textarea value={editPortfolio.film_specs} onChange={e => setEditPortfolio(p => p ? { ...p, film_specs: e.target.value } : p)} rows={2} className={textareaCls} placeholder="เช่น กันร้อน 99%, กัน UV 100%" />
                </Field>
                <Field label="พื้นที่ติดตั้ง (ตร.ม.)">
                  <input type="number" value={editPortfolio.glass_area_sqm || ''} onChange={e => setEditPortfolio(p => p ? { ...p, glass_area_sqm: parseFloat(e.target.value) || 0 } : p)} className={inputCls} placeholder="0" />
                </Field>
              </div>

              {/* Location */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-700">📍 สถานที่ (สำคัญสำหรับ SEO)</h3>
                <Field label="ชื่อสถานที่">
                  <input value={editPortfolio.location_name} onChange={e => setEditPortfolio(p => p ? { ...p, location_name: e.target.value } : p)} className={inputCls} placeholder="เช่น ABC Tower" />
                </Field>
                <Field label="ย่าน / เขต / จังหวัด">
                  <input value={editPortfolio.location_area} onChange={e => setEditPortfolio(p => p ? { ...p, location_area: e.target.value } : p)} className={inputCls} placeholder="เช่น บางนา กรุงเทพฯ" />
                </Field>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-700">🏷️ Tags (คีย์เวิร์ด SEO)</h3>
                <div className="flex gap-2">
                  <input value={pTagInput} onChange={e => setPTagInput(e.target.value)} onKeyDown={e => e.key==='Enter'&&(e.preventDefault(),addPTag())}
                    className={`${inputCls} flex-1`} placeholder="พิมพ์แล้วกด Enter" />
                  <button type="button" onClick={addPTag} className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-all">
                    <Plus weight="bold" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {editPortfolio.tags?.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded-lg">
                      {tag}
                      <button type="button" onClick={() => removePTag(i)} className="hover:text-red-500 transition-colors"><X weight="bold" className="text-xs" /></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
