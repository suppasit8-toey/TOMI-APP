'use client';

import { useState, useEffect } from 'react';
import { Plus, Phone, CalendarBlank, CaretRight, FolderDashed } from '@phosphor-icons/react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useAuth } from '@/components/AuthProvider';

const filterOptions = ['ทั้งหมด', 'ใหม่', 'นัดวัด', 'เสนอราคา', 'รอติดตั้ง', 'รอรับเงิน', 'รอปิดงาน', 'เสร็จสิ้น', 'ยกเลิก'];

const getStatusColor = (s: string) => {
  return {'ใหม่':'bg-gray-100 text-gray-700','นัดวัด':'bg-yellow-100 text-yellow-700','เสนอราคา':'bg-blue-100 text-blue-700','รอติดตั้ง':'bg-purple-100 text-purple-700','รอรับเงิน':'bg-orange-100 text-orange-700','รอปิดงาน':'bg-orange-100 text-orange-700','เสร็จสิ้น':'bg-green-100 text-green-700','ยกเลิก':'bg-red-100 text-red-700'}[s] || 'bg-gray-100 text-gray-700';
};

const getStatusDotColor = (s: string) => {
  return {'ใหม่':'bg-gray-400','นัดวัด':'bg-yellow-400','เสนอราคา':'bg-blue-400','รอติดตั้ง':'bg-purple-400','รอรับเงิน':'bg-orange-400','รอปิดงาน':'bg-orange-400','เสร็จสิ้น':'bg-green-400','ยกเลิก':'bg-red-500'}[s] || 'bg-gray-300';
};

export default function ProjectsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState('ทั้งหมด');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', tel: '', note: '' });

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = filter === 'ทั้งหมด' ? projects : projects.filter(p => p.status === filter);

  const submitPrj = async () => {
    if (!form.name) return Swal.fire('เตือน', 'กรุณาระบุชื่อโปรเจกต์', 'warning');
    const id = 'PJ' + new Date().getTime();
    const { error } = await supabase.from('projects').insert({
      id,
      name: form.name,
      tel: form.tel,
      note: form.note,
      status: 'ใหม่'
    });
    
    if (error) return Swal.fire('ผิดพลาด', error.message, 'error');
    
    // Log Action
    await supabase.from('app_logs').insert({ 
      action_by: user?.name,
      action_type: 'CREATE', 
      description: `สร้างโปรเจกต์ ${form.name}`, 
      ref_id: id 
    });
    
    Swal.fire('สำเร็จ', 'สร้างโปรเจกต์เรียบร้อย', 'success');
    setShowAdd(false);
    setForm({ name: '', tel: '', note: '' });
    loadData();
  };

  const fmt = (num: number) => new Intl.NumberFormat('th-TH').format(num || 0);
  const formatDate = (date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-2 no-print">
        <h2 className="text-xl font-bold text-slate-800">โปรเจกต์</h2>
        <button onClick={() => setShowAdd(true)} className="bg-blue-600 text-white py-2 px-4 rounded-xl font-semibold shadow-lg shadow-blue-200 gap-2 flex items-center hover:-translate-y-0.5 transition hover:bg-blue-700">
          <Plus weight="bold" /> สร้าง
        </button>
      </div>
      
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-2">
        {filterOptions.map(f => {
          const count = f === 'ทั้งหมด' ? projects.length : projects.filter(p => p.status === f).length;
          const isActive = filter === f;
          return (
            <button 
              key={f} 
              onClick={() => setFilter(f)} 
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap flex items-center shadow-sm border ${isActive ? 'bg-slate-800 text-white border-slate-800 scale-105 shadow-md flex-shrink-0' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 flex-shrink-0'}`}
            >
              {f !== 'ทั้งหมด' && !isActive && <div className={`w-2 h-2 rounded-full mr-2 ${getStatusDotColor(f)}`}></div>}
              {f}
              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(p => (
          <div key={p.id} onClick={() => router.push(`/projects/${p.id}`)} className="bg-white p-5 rounded-2xl shadow-sm cursor-pointer border border-slate-100 hover:border-blue-300 hover:shadow-md transition group">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg text-slate-800 leading-tight flex-1 mr-2 group-hover:text-blue-600 transition truncate">{p.name}</h3>
              <span className={`px-2 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${getStatusColor(p.status)}`}>{p.status}</span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="text-sm text-gray-500 flex items-center"><Phone weight="fill" className="mr-2 text-gray-400" /> {p.tel || '-'}</div>
              <div className="text-xs text-gray-400 flex items-center"><CalendarBlank weight="fill" className="mr-2" /> สร้าง: {formatDate(p.created_at)}</div>
            </div>
            
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              {p.status === 'เสร็จสิ้น' ? (
                <div>
                  <span className="text-xs text-gray-400 block font-medium">กำไรสุทธิ</span>
                  <span className="text-green-600 font-bold text-lg">{fmt(p.net_profit)} <span className="text-xs font-normal opacity-70">บาท</span></span>
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic flex items-center font-medium bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse mr-2"></div> กำลังดำเนินการ
                </div>
              )}
              <CaretRight weight="bold" className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition text-lg" />
            </div>
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center text-gray-400 py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-white flex flex-col items-center">
          <FolderDashed className="text-4xl mb-3 text-slate-300" />
          <span className="font-medium">ไม่พบโปรเจกต์ในสถานะ "{filter}"</span>
        </div>
      )}

      {/* ADD MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowAdd(false)}>
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-xl mb-4 text-slate-800">สร้างโปรเจกต์</h3>
            
            <label className="block text-sm font-semibold text-slate-700 mb-1 mt-3">ชื่อโปรเจกต์ <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition" placeholder="ระบุชื่อโปรเจกต์" />
            
            <label className="block text-sm font-semibold text-slate-700 mb-1 mt-4">เบอร์โทรศัพท์</label>
            <input value={form.tel} onChange={e=>setForm({...form, tel: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition" placeholder="0xx-xxx-xxxx" />
            
            <label className="block text-sm font-semibold text-slate-700 mb-1 mt-4">หมายเหตุ (Note)</label>
            <textarea value={form.note} onChange={e=>setForm({...form, note: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition min-h-[100px]" placeholder="รายละเอียดเบื้องต้น"></textarea>
            
            <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
              <button onClick={() => setShowAdd(false)} className="flex-1 font-semibold py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition">ยกเลิก</button>
              <button onClick={submitPrj} className="flex-1 font-semibold py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition">บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
