'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';
import { FloppyDisk, Info, Globe, Camera, UploadSimple, Trash, Image as ImageIcon, SpinnerGap } from '@phosphor-icons/react';

interface SiteContent {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  about_text: string;
  contact_phone: string;
  contact_line_id: string;
  contact_facebook: string;
  hero_image_url: string;
  about_image_url: string;
  service1_image_url: string;
  service2_image_url: string;
  service3_image_url: string;
}

const DEFAULT_ID = '00000000-0000-0000-0000-000000000001';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

// Reusable Image Uploader Component
function ImageUploader({ 
  label, 
  value, 
  onChange,
  hint
}: { 
  label: string; 
  value: string; 
  onChange: (url: string) => void;
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      Swal.fire('ตั้งค่า Cloudinary ไม่ครบ', 'กรุณาตรวจสอบ .env.local ว่ามี NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME และ NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET', 'error');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      onChange(data.secure_url);

      Swal.fire({ title: 'อัพโหลดสำเร็จ!', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (err: any) {
      console.error(err);
      Swal.fire('อัพโหลดไม่สำเร็จ', err.message || 'โปรดลองใหม่', 'error');
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

      {/* Preview */}
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          <img src={value} alt={label} className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-4 py-2 bg-white text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-slate-100 transition"
            >
              <UploadSimple weight="bold" /> เปลี่ยนรูป
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-red-600 transition"
            >
              <Trash weight="bold" /> ลบ
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full h-40 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
        >
          {uploading ? (
            <>
              <SpinnerGap weight="bold" className="text-3xl text-blue-500 animate-spin" />
              <span className="text-sm text-blue-600 font-semibold">กำลังอัพโหลด...</span>
            </>
          ) : (
            <>
              <ImageIcon weight="duotone" className="text-3xl text-slate-400" />
              <span className="text-sm text-slate-500 font-medium">คลิกเพื่ออัพโหลดรูปภาพ</span>
              <span className="text-xs text-slate-400">รองรับ JPG, PNG, WebP</span>
            </>
          )}
        </button>
      )}

      {hint && <p className="text-xs text-slate-400">{hint}</p>}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}

export default function WebsiteManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<SiteContent>({
    id: DEFAULT_ID,
    hero_title: 'TOMI FILM บริการติดตั้งฟิล์มอาคารพรีเมียม',
    hero_subtitle: 'ลดความร้อน ประหยัดพลังงาน ปกป้องสิ่งที่คุณรักด้วยฟิล์มคุณภาพสูง',
    about_text: 'ที่ TOMI FILM เราเชี่ยวชาญด้านการติดตั้งฟิล์มกรองแสงอาคาร บ้านเรือน และสำนักงาน เราใช้วัสดุระดับพรีเมียมพร้อมบริการจากช่างผู้ชำนาญการ',
    contact_phone: '099-999-9999',
    contact_line_id: '@tomifilm.th',
    contact_facebook: 'https://facebook.com/tomifilm',
    hero_image_url: '',
    about_image_url: '',
    service1_image_url: '',
    service2_image_url: '',
    service3_image_url: ''
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('landing_page_content')
        .select('*')
        .eq('id', DEFAULT_ID)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') console.error("Error fetching content", error);
      } else if (data) {
        setContent({ ...content, ...data } as SiteContent);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // Try saving all fields first
      const { error } = await supabase
        .from('landing_page_content')
        .upsert({ ...content, updated_at: new Date().toISOString() });
      
      if (error) {
        console.error('Supabase error:', error.message, error.code, error.hint, error.details);
        
        // If error might be due to missing image columns, try saving base fields only
        if (error.message?.includes('column') || error.code === '42703') {
          const { id, hero_title, hero_subtitle, about_text, contact_phone, contact_line_id, contact_facebook, hero_image_url } = content;
          const { error: fallbackError } = await supabase
            .from('landing_page_content')
            .upsert({ id, hero_title, hero_subtitle, about_text, contact_phone, contact_line_id, contact_facebook, hero_image_url, updated_at: new Date().toISOString() });
          
          if (fallbackError) throw fallbackError;
          
          Swal.fire({
            title: 'บันทึกข้อความเรียบร้อย',
            html: 'ข้อมูลข้อความถูกบันทึกแล้ว แต่ <b>คอลัมน์รูปภาพยังไม่มี</b> ในฐานข้อมูล<br/>กรุณารัน <code>migration_landing_images.sql</code> ใน SQL Editor ก่อน',
            icon: 'warning',
            confirmButtonColor: '#2563eb'
          });
          return;
        }
        
        throw error;
      }

      Swal.fire({
        title: 'บันทึกสำเร็จ',
        text: 'ข้อมูลบนหน้าเว็บไซต์ถูกอัปเดตแล้ว',
        icon: 'success',
        confirmButtonColor: '#2563eb'
      });
    } catch (err: any) {
      const msg = err?.message || err?.details || JSON.stringify(err) || 'โปรดตรวจสอบการเชื่อมต่อฐานข้อมูล';
      console.error('Save error:', msg);
      Swal.fire({
        title: 'ไม่สามารถบันทึกได้',
        text: msg,
        icon: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <Globe weight="duotone" className="text-3xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการเว็บไซต์ (CMS)</h1>
          <p className="text-slate-500 text-sm">ปรับแต่งข้อความ รูปภาพ และเนื้อหาสำหรับหน้าแรกของเว็บไซต์</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-4 bg-amber-50 border-b border-amber-100 flex gap-3 text-amber-800 text-sm">
          <Info className="text-xl shrink-0" weight="fill" />
          <p>
            ถ้ายังไม่ได้รันไฟล์ SQL อย่าลืมนำ <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-xs">migration_landing_page.sql</code> และ <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-xs">migration_landing_images.sql</code> ไปรันใน SQL Editor ก่อนนะ
          </p>
        </div>

        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8">
          
          {/* ─── Section 1: Hero ─── */}
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              <span className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-black">1</span>
              ส่วนต้อนรับ (Hero Section)
            </h3>
            
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">หัวข้อหลัก (Title)</label>
                <input 
                  type="text" 
                  value={content.hero_title}
                  onChange={e => setContent({...content, hero_title: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">ข้อความรอง (Subtitle)</label>
                <textarea 
                  value={content.hero_subtitle}
                  onChange={e => setContent({...content, hero_subtitle: e.target.value})}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
              
              <ImageUploader
                label="รูปพื้นหลัง Hero"
                value={content.hero_image_url}
                onChange={url => setContent({...content, hero_image_url: url})}
                hint="แนะนำขนาด 1920x1080 หรือใหญ่กว่า ถ้าปล่อยว่างจะใช้ Gradient สีน้ำเงินแทน"
              />
            </div>
          </div>

          {/* ─── Section 2: Services ─── */}
          <div className="space-y-5 pt-4 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              <span className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-black">2</span>
              รูปบริการ (Service Images)
            </h3>
            <p className="text-sm text-slate-500">อัพโหลดรูปประกอบสำหรับแต่ละการ์ดบริการ (ไม่บังคับ)</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <ImageUploader
                label="กันความร้อน"
                value={content.service1_image_url}
                onChange={url => setContent({...content, service1_image_url: url})}
                hint="ขนาดแนะนำ 600x400"
              />
              <ImageUploader
                label="ลดแสงจ้า"
                value={content.service2_image_url}
                onChange={url => setContent({...content, service2_image_url: url})}
                hint="ขนาดแนะนำ 600x400"
              />
              <ImageUploader
                label="รับประกัน"
                value={content.service3_image_url}
                onChange={url => setContent({...content, service3_image_url: url})}
                hint="ขนาดแนะนำ 600x400"
              />
            </div>
          </div>

          {/* ─── Section 3: About ─── */}
          <div className="space-y-5 pt-4 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              <span className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-black">3</span>
              เกี่ยวกับเรา (About Us)
            </h3>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">รายละเอียดบริษัทและบริการ</label>
              <textarea 
                value={content.about_text}
                onChange={e => setContent({...content, about_text: e.target.value})}
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all leading-relaxed"
                required
              />
            </div>
            <ImageUploader
              label="รูปประกอบส่วนเกี่ยวกับเรา"
              value={content.about_image_url}
              onChange={url => setContent({...content, about_image_url: url})}
              hint="ขนาดแนะนำ 800x1000 (แนวตั้ง) — ถ้าปล่อยว่างจะแสดงโลโก้ TOMI FILM แทน"
            />
          </div>

          {/* ─── Section 4: Contact ─── */}
          <div className="space-y-5 pt-4 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              <span className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-black">4</span>
              ข้อมูลติดต่อ (Contact Info)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                <input 
                  type="text" 
                  value={content.contact_phone}
                  onChange={e => setContent({...content, contact_phone: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Line ID</label>
                <input 
                  type="text" 
                  value={content.contact_line_id}
                  onChange={e => setContent({...content, contact_line_id: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Facebook Link</label>
                <input 
                  type="text" 
                  value={content.contact_facebook}
                  onChange={e => setContent({...content, contact_facebook: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-8 border-t flex items-center justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-70 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <FloppyDisk weight="fill" className="text-xl" /> 
                  บันทึกข้อมูลหน้าเว็บ
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
