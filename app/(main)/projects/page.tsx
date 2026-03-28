'use client';

import { useState, useEffect } from 'react';
import { Plus, Phone, CalendarBlank, CaretRight, FolderDashed, Trash, PencilSimple, DotsThreeVertical } from '@phosphor-icons/react';
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
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', tel: '', note: '' });
  const [editModal, setEditModal] = useState<any>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

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
    const { error } = await supabase.from('projects').insert({ id, name: form.name, tel: form.tel, note: form.note, status: 'ใหม่' });
    if (error) return Swal.fire('ผิดพลาด', error.message, 'error');
    await supabase.from('app_logs').insert({ action_by: user?.name, action_type: 'CREATE', description: `สร้างโปรเจกต์ ${form.name}`, ref_id: id });
    Swal.fire('สำเร็จ', 'สร้างโปรเจกต์เรียบร้อย', 'success');
    setShowAdd(false); setForm({ name: '', tel: '', note: '' }); loadData();
  };

  const deletePrj = async (p: any) => {
    const result = await Swal.fire({ title: 'ลบโปรเจกต์?', text: `ยืนยันลบ "${p.name}" ?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'ลบ', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#ef4444' });
    if (!result.isConfirmed) return;
    const { error } = await supabase.from('projects').delete().eq('id', p.id);
    if (error) return Swal.fire('ผิดพลาด', error.message, 'error');
    await supabase.from('app_logs').insert({ action_by: user?.name, action_type: 'DELETE', description: `ลบโปรเจกต์ ${p.name}`, ref_id: p.id });
    Swal.fire('ลบแล้ว', '', 'success'); setMenuOpenId(null); loadData();
  };

  const openEdit = (p: any) => {
    setEditModal({ id: p.id, name: p.name, tel: p.tel || '', note: p.note || '', status: p.status });
    setMenuOpenId(null);
  };

  const submitEdit = async () => {
    if (!editModal) return;
    const { error } = await supabase.from('projects').update({ name: editModal.name, tel: editModal.tel, note: editModal.note, status: editModal.status }).eq('id', editModal.id);
    if (error) return Swal.fire('ผิดพลาด', error.message, 'error');
    Swal.fire('บันทึกแล้ว', '', 'success'); setEditModal(null); loadData();
  };

  const fmt = (num: number) => new Intl.NumberFormat('th-TH').format(num || 0);
  const formatDate = (date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 max-w-full overflow-x-hidden" onClick={() => menuOpenId && setMenuOpenId(null)}>
      <div className="flex justify-between items-center mb-2 no-print">
        <h2 className="text-xl font-bold text-slate-800">โปรเจกต์</h2>
        <button onClick={() => setShowAdd(true)} className="bg-blue-600 text-white py-2 px-4 rounded-xl font-semibold shadow-lg shadow-blue-200 gap-2 flex items-center hover:-translate-y-0.5 transition hover:bg-blue-700">
          <Plus weight="bold" /> สร้าง
        </button>
      </div>
      
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-2 w-full">
        {filterOptions.map(f => {
          const count = f === 'ทั้งหมด' ? projects.length : projects.filter(p => p.status === f).length;
          const isActive = filter === f;
          return (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap flex items-center shadow-sm border ${isActive ? 'bg-slate-800 text-white border-slate-800 scale-105 shadow-md flex-shrink-0' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 flex-shrink-0'}`}>
              {f !== 'ทั้งหมด' && !isActive && <div className={`w-2 h-2 rounded-full mr-2 ${getStatusDotColor(f)}`}></div>}
              {f}
              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4 w-full">
        {filtered.map(p => (
          <div key={p.id} className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-300 hover:shadow-md transition group relative min-w-0">
            <div className="flex justify-between items-start mb-3 min-w-0">
              <h3 onClick={() => router.push(`/projects/${p.id}`)} className="font-bold text-lg text-slate-800 leading-tight flex-1 mr-2 group-hover:text-blue-600 transition truncate cursor-pointer min-w-0">{p.name}</h3>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${getStatusColor(p.status)}`}>{p.status}</span>
                <button onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === p.id ? null : p.id); }} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition">
                  <DotsThreeVertical weight="bold" className="text-lg" />
                </button>
              </div>
            </div>

            {/* Dropdown menu */}
            {menuOpenId === p.id && (
              <div className="absolute right-4 top-14 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden min-w-[140px]" onClick={e => e.stopPropagation()}>
                <button onClick={() => openEdit(p)} className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition">
                  <PencilSimple weight="bold" /> แก้ไข
                </button>
                <button onClick={() => deletePrj(p)} className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition border-t border-slate-100">
                  <Trash weight="bold" /> ลบ
                </button>
              </div>
            )}
            
            <div className="space-y-2 mb-4 cursor-pointer" onClick={() => router.push(`/projects/${p.id}`)}>
              <div className="text-sm text-gray-500 flex items-center"><Phone weight="fill" className="mr-2 text-gray-400" /> {p.tel || '-'}</div>
              <div className="text-xs text-gray-400 flex items-center"><CalendarBlank weight="fill" className="mr-2" /> สร้าง: {formatDate(p.created_at)}</div>
            </div>
            
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center cursor-pointer" onClick={() => router.push(`/projects/${p.id}`)}>
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
          <span className="font-medium">ไม่พบโปรเจกต์ในสถานะ &quot;{filter}&quot;</span>
        </div>
      )}

      {/* ADD MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowAdd(false)}>
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-xl mb-4 text-slate-800">สร้างโปรเจกต์</h3>
            <label className="block text-sm font-semibold text-slate-700 mb-1 mt-3">ชื่อโปรเจกต์ <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition text-base" placeholder="ระบุชื่อโปรเจกต์" />
            <label className="block text-sm font-semibold text-slate-700 mb-1 mt-4">เบอร์โทรศัพท์</label>
            <input value={form.tel} onChange={e=>setForm({...form, tel: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition text-base" placeholder="0xx-xxx-xxxx" />
            <label className="block text-sm font-semibold text-slate-700 mb-1 mt-4">หมายเหตุ (Note)</label>
            <textarea value={form.note} onChange={e=>setForm({...form, note: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition min-h-[100px] text-base" placeholder="รายละเอียดเบื้องต้น"></textarea>
            <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
              <button onClick={() => setShowAdd(false)} className="flex-1 font-semibold py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition">ยกเลิก</button>
              <button onClick={submitPrj} className="flex-1 font-semibold py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition">บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setEditModal(null)}>
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-xl mb-4 text-slate-800">แก้ไขโปรเจกต์</h3>
            <label className="block text-sm font-semibold text-slate-700 mb-1 mt-3">ชื่อโปรเจกต์</label>
            <input value={editModal.name} onChange={e=>setEditModal({...editModal, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition text-base" />
            <label className="block text-sm font-semibold text-slate-700 mb-1 mt-4">เบอร์โทรศัพท์</label>
            <input value={editModal.tel} onChange={e=>setEditModal({...editModal, tel: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition text-base" />
            <label className="block text-sm font-semibold text-slate-700 mb-1 mt-4">สถานะ</label>
            <select value={editModal.status} onChange={e=>setEditModal({...editModal, status: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition text-base bg-white">
              {filterOptions.filter(f => f !== 'ทั้งหมด').map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <label className="block text-sm font-semibold text-slate-700 mb-1 mt-4">หมายเหตุ</label>
            <textarea value={editModal.note} onChange={e=>setEditModal({...editModal, note: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition min-h-[80px] text-base"></textarea>
            <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
              <button onClick={() => setEditModal(null)} className="flex-1 font-semibold py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition">ยกเลิก</button>
              <button onClick={submitEdit} className="flex-1 font-semibold py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition">บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

