'use client';

import { useState, useEffect } from 'react';
import { Plus, Funnel, Wallet, Image as ImageIcon, PencilSimple, Receipt, Printer, Trash, ChartLineUp, ChartLineDown, Scales, CalendarBlank, Briefcase } from '@phosphor-icons/react';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

export default function AccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterMonth, setFilterMonth] = useState((new Date().getMonth() + 1).toString());
  const [loading, setLoading] = useState(true);

  // Modal
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], type: 'Income', category: '', detail: '', amount: '' });
  const [fileRaw, setFileRaw] = useState<File | null>(null);

  const [uploadModal, setUploadModal] = useState<any>({ open: false, id: null });

  const loadData = async () => {
    setLoading(true);
    let query = supabase.from('accounts').select('*, projects(name)').order('transaction_date', { ascending: false });
    const { data } = await query;
    setAccounts(data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const uploadFile = async (file: File) => {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const { error } = await supabase.storage.from('tomi_files').upload(fileName, file);
    if (error) return null;
    const { data } = supabase.storage.from('tomi_files').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const submitAdd = async () => {
    if (!form.category || !form.amount) return Swal.fire('เตือน', 'กรุณากรอกข้อมูลให้ครบ', 'warning');
    setLoading(true);
    
    let url = '';
    if (fileRaw) {
      const uploadedUrl = await uploadFile(fileRaw);
      if (uploadedUrl) url = uploadedUrl;
    }

    const { error } = await supabase.from('accounts').insert({
      id: 'ACC' + new Date().getTime(),
      transaction_date: form.date,
      type: form.type,
      category: form.category,
      detail: form.detail,
      amount: Number(form.amount),
      evidence_url: url,
      created_by: user?.name
    });

    if (error) { setLoading(false); return Swal.fire('ผิดพลาด', error.message, 'error'); }

    Swal.fire('สำเร็จ', 'บันทึกรายการบัญชีแล้ว', 'success');
    setShowAdd(false);
    setForm({ date: new Date().toISOString().split('T')[0], type: 'Income', category: '', detail: '', amount: '' });
    setFileRaw(null);
    loadData();
  };

  const savePhoto = async () => {
    if (!fileRaw) return;
    setLoading(true);
    const url = await uploadFile(fileRaw);
    if (!url) { setLoading(false); return Swal.fire('ผิดพลาด', 'อัปโหลดรูปไม่สำเร็จ', 'error'); }

    const { error } = await supabase.from('accounts').update({ evidence_url: url, updated_at: new Date().toISOString() }).eq('id', uploadModal.id);
    if (error) { setLoading(false); return Swal.fire('ผิดพลาด', error.message, 'error'); }

    Swal.fire('สำเร็จ', 'อัปเดตรูปภาพแล้ว', 'success');
    setUploadModal({ open: false, id: null });
    setFileRaw(null);
    loadData();
  };

  const deleteAccount = async (id: string, detail: string) => {
    const result = await Swal.fire({
      title: 'ลบรายการนี้?',
      text: `คุณต้องการลบรายการ "${detail || 'รายการนี้'}" ใช่หรือไม่?\nข้อมูลการเงินจะลดลงตามรายการที่ลบ`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบรายการ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444'
    });
    
    if (!result.isConfirmed) return;

    setLoading(true);
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (error) {
      setLoading(false);
      return Swal.fire('ผิดพลาด', error.message, 'error');
    }

    await supabase.from('app_logs').insert({ action_by: user?.name, action_type: 'DELETE', description: `ลบรายการบัญชี ${detail}`, ref_id: id });
    Swal.fire('สำเร็จ', 'ลบรายการแล้ว', 'success');
    loadData();
  };

  const filtered = accounts.filter(a => {
    if (!a.transaction_date) return false;
    const [y, m] = a.transaction_date.split('-');
    if (filterYear && y !== filterYear) return false;
    if (filterMonth && parseInt(m).toString() !== parseInt(filterMonth).toString()) return false;
    return true;
  });

  const sumIncome = filtered.filter(a => a.type === 'Income').reduce((sum, a) => sum + Number(a.amount), 0);
  const sumExpense = filtered.filter(a => a.type === 'Expense').reduce((sum, a) => sum + Number(a.amount), 0);
  const net = sumIncome - sumExpense;
  const fmt = (num: number) => new Intl.NumberFormat('th-TH').format(num || 0);
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  const getShortDate = (dateString: string) => {
    if (!dateString) return { day: '', month: '' };
    const d = new Date(dateString);
    return {
      day: d.getDate(),
      month: d.toLocaleDateString('th-TH', { month: 'short' })
    };
  };

  const monthNames = ['', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  const incomeCategories = ['ขายส่งฟิล์ม', 'งานติดตั้ง', 'อื่นๆ (รายรับ)'];
  const expenseCategories = ['โครงการ', 'ซื้อสินค้า (Stock)', 'อุปกรณ์ติดตั้ง', 'ยานพาหนะ', 'อื่นๆ (รายจ่าย)'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100 shrink-0">
            <Wallet weight="fill" className="text-purple-500 text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">บัญชีรายรับ-รายจ่าย</h2>
            <p className="text-sm text-slate-400 mt-0.5 font-medium">บันทึกและจัดการการเงินของร้าน</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link href={`/report?year=${filterYear}&month=${filterMonth}`} target="_blank" className="flex-1 sm:flex-none justify-center bg-slate-100 text-slate-600 border border-slate-200 py-2.5 px-4 rounded-xl font-bold shadow-sm flex items-center gap-2 hover:-translate-y-0.5 transition hover:bg-slate-200">
            <Printer weight="bold" className="text-lg" /> รายงาน
          </Link>
          <button onClick={() => setShowAdd(true)} className="flex-1 sm:flex-none justify-center bg-blue-600 text-white py-2.5 px-5 rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2 hover:-translate-y-0.5 transition hover:bg-blue-700">
            <Plus weight="bold" className="text-lg" /> เพิ่มรายการ
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-5 transform group-hover:scale-110 transition duration-500">
            <ChartLineUp weight="fill" className="text-green-500 text-9xl" />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-500 flex items-center justify-center border border-green-100 group-hover:bg-green-100 transition">
              <ChartLineUp weight="bold" />
            </div>
            <span className="font-bold text-slate-500 uppercase tracking-widest text-xs">รายรับทั้งหมด</span>
          </div>
          <div className="font-black text-3xl text-slate-800 break-all">
            <span className="text-green-500 text-xl font-bold mr-1">+</span>
            {fmt(sumIncome)}
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-5 transform group-hover:scale-110 transition duration-500">
            <ChartLineDown weight="fill" className="text-red-500 text-9xl" />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center border border-red-100 group-hover:bg-red-100 transition">
              <ChartLineDown weight="bold" />
            </div>
            <span className="font-bold text-slate-500 uppercase tracking-widest text-xs">รายจ่ายทั้งหมด</span>
          </div>
          <div className="font-black text-3xl text-slate-800 break-all">
            <span className="text-red-500 text-xl font-bold mr-1">-</span>
            {fmt(sumExpense)}
          </div>
        </div>

        <div className={`rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.1)] relative overflow-hidden group transition ${net >= 0 ? 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white' : 'bg-gradient-to-br from-red-600 to-rose-700 text-white'}`}>
          <div className="absolute -right-4 -top-4 opacity-10 transform group-hover:scale-110 transition duration-500">
            <Scales weight="fill" className="text-white text-9xl" />
          </div>
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center border border-white/20 backdrop-blur-sm">
              <Scales weight="bold" />
            </div>
            <span className="font-bold text-white/80 uppercase tracking-widest text-xs">ยอดคงเหลือสุทธิ</span>
          </div>
          <div className="font-black text-[34px] leading-tight break-all relative z-10 flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold opacity-80">{net >= 0 ? '' : '-'}</span>
            ฿{fmt(Math.abs(net))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200 no-print">
        <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider ml-1"><CalendarBlank weight="fill" className="text-blue-500 text-base" /> รอบบัญชี:</label>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="min-w-[110px] border border-slate-200 rounded-xl py-2 px-3.5 text-sm outline-none focus:border-blue-600 bg-slate-50 font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition">
          <option value="">ทุกปี</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
        </select>
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="min-w-[120px] border border-slate-200 rounded-xl py-2 px-3.5 text-sm outline-none focus:border-blue-600 bg-slate-50 font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition">
          <option value="">ทุกเดือน</option>
          {Array.from({length: 12}, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>{monthNames[m]}</option>
          ))}
        </select>
        {(filterYear || filterMonth) && (
          <button 
            onClick={() => { setFilterYear(''); setFilterMonth(''); }}
            className="text-[11px] font-bold text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition"
          >
            แสดงทั้งหมด
          </button>
        )}
      </div>

      {/* List */}
      <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden text-sm no-print">
        {loading ? (
          <div className="py-20 text-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
             <Receipt className="text-7xl mx-auto mb-4 text-slate-200" weight="thin" />
             <p className="text-slate-400 font-bold text-lg">ไม่พบรายการบัญชี</p>
             <p className="text-slate-400 text-sm mt-1">ในรอบบัญชีที่เลือก หรือระบบยังไม่มีข้อมูล</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(acc => {
              const dateInfo = getShortDate(acc.transaction_date);
              const isIncome = acc.type === 'Income';
              return (
                <div key={acc.id} className="flex flex-col md:flex-row md:items-center p-4 hover:bg-slate-50 transition-colors group relative border-l-4" style={{borderLeftColor: isIncome ? '#22c55e' : '#ef4444'}}>
                  
                   {/* Date Block (Desktop) / Row (Mobile) */}
                   <div className="flex items-center gap-3 md:w-32 shrink-0 mb-3 md:mb-0">
                      <div className="w-12 h-14 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
                         <span className="font-black text-slate-800 text-lg leading-none">{dateInfo.day}</span>
                         <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{dateInfo.month}</span>
                      </div>
                      <div className="flex md:hidden flex-col">
                        <span className={`font-black text-xl ${isIncome ? 'text-green-600' : 'text-slate-800'}`}>
                           {isIncome ? '+' : '-'}{fmt(acc.amount)}
                        </span>
                        <div className="text-[10px] font-medium text-slate-400 uppercase">{formatDate(acc.transaction_date)}</div>
                      </div>
                   </div>

                   {/* Detail Content */}
                   <div className="flex-1 min-w-0 pr-4">
                      <p className="font-bold text-slate-800 text-base leading-tight mb-1">{acc.detail || '-'}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {acc.projects?.name && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-bold border border-blue-100 truncate max-w-[200px]">
                            <Briefcase weight="fill" /> {acc.projects.name}
                          </span>
                        )}
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold border border-slate-200">{acc.category}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium bg-white px-2 py-0.5 rounded-md border border-slate-100">
                          <PencilSimple weight="fill" /> {acc.created_by}
                        </span>
                      </div>
                   </div>

                   {/* Actions & Amount (Desktop) */}
                   <div className="flex md:flex-col items-center md:items-end justify-between mt-4 md:mt-0 pt-3 md:pt-0 border-t md:border-0 border-slate-100 gap-3">
                      <div className="hidden md:block font-black text-xl text-right whitespace-nowrap mb-2">
                         <span className={isIncome ? 'text-green-600' : 'text-slate-800'}>
                            {isIncome ? '+' : '-'}{fmt(acc.amount)}
                         </span>
                      </div>
                      
                      <div className="flex gap-2 w-full md:w-auto justify-end">
                        {acc.evidence_url ? (
                          <a href={acc.evidence_url} target="_blank" className="flex-1 md:flex-none justify-center inline-flex gap-1.5 items-center text-[11px] text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 md:py-1.5 rounded-lg transition font-bold border border-blue-100">
                            <ImageIcon weight="fill" className="text-sm" /> หลักฐาน
                          </a>
                        ) : (
                          <button onClick={() => setUploadModal({ open: true, id: acc.id })} className="flex-1 md:flex-none justify-center inline-flex gap-1.5 items-center text-[11px] text-slate-500 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 px-3 py-2 md:py-1.5 rounded-lg transition font-bold">
                            <Plus weight="bold" /> อัปโหลดรูป
                          </button>
                        )}
                        <button onClick={() => deleteAccount(acc.id, acc.detail)} className="inline-flex justify-center items-center text-[11px] text-red-500 bg-red-50 hover:bg-red-100 px-3 py-2 md:py-1.5 rounded-lg transition font-bold border border-red-100">
                          <Trash weight="bold" className="text-sm" />
                        </button>
                      </div>
                   </div>
                   
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200" onClick={() => setShowAdd(false)}>
          <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                <Receipt weight="fill" className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-800">เพิ่มรายการบัญชี</h3>
                <p className="text-xs text-slate-400 font-medium">บันทึกรายรับหรือรายจ่าย</p>
              </div>
            </div>
            
            <div className="bg-slate-50 p-1.5 rounded-2xl flex gap-1 mb-5 border border-slate-200">
              <button 
                onClick={() => setForm({...form, type: 'Income', category: incomeCategories[0]})} 
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${form.type === 'Income' ? 'bg-white text-green-600 shadow border border-slate-200/60' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <ChartLineUp weight="bold" /> รายรับ
              </button>
              <button 
                onClick={() => setForm({...form, type: 'Expense', category: expenseCategories[0]})} 
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${form.type === 'Expense' ? 'bg-white text-red-600 shadow border border-slate-200/60' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <ChartLineDown weight="bold" /> รายจ่าย
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">วันที่</label>
                <input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition" />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">หมวดหมู่ <span className="text-red-500">*</span></label>
                <select value={form.category} onChange={e=>setForm({...form, category:e.target.value})} className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition font-bold text-slate-700">
                  <option value="">- เลือกหมวดหมู่ -</option>
                  {(form.type === 'Income' ? incomeCategories : expenseCategories).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">รายละเอียด <span className="text-red-500">*</span></label>
                <input value={form.detail} onChange={e=>setForm({...form, detail:e.target.value})} placeholder="ระบุสิ่งที่รับเงิน/จ่ายเงิน..." className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition font-medium" />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">จำนวนเงิน (บาท) <span className="text-red-500">*</span></label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                     <span className={`font-black text-xl ${form.type === 'Income' ? 'text-green-500' : 'text-slate-400'}`}>
                       {form.type === 'Income' ? '+' : '฿'}
                     </span>
                   </div>
                   <input type="number" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} placeholder="0.00" className={`w-full border border-slate-200 rounded-2xl pl-10 pr-5 py-4 outline-none font-black text-3xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition ${form.type === 'Income' ? 'text-green-600 bg-green-50/30' : 'text-slate-800 bg-slate-50'}`} />
                </div>
              </div>
              
              <div className="pt-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1"><ImageIcon weight="fill"/> อัปโหลดหลักฐาน / สลิป (ถ้ามี)</label>
                <label className="flex flex-col items-center justify-center w-full min-h-[90px] border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition p-4">
                  <span className="flex flex-col items-center gap-2 text-slate-500 font-medium text-xs">
                     {fileRaw ? (
                       <><ImageIcon weight="fill" className="text-3xl text-blue-500" /> <span className="text-blue-600 font-bold">{fileRaw.name}</span></>
                     ) : (
                       <><Plus weight="bold" className="text-2xl text-slate-400" /> <span>แตะเพื่อเลือกรูปภาพสลิป</span></>
                     )}
                  </span>
                  <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files && setFileRaw(e.target.files[0])} />
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
              <button onClick={() => setShowAdd(false)} className="flex-1 font-bold py-3.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition">ยกเลิก</button>
              <button disabled={loading} onClick={submitAdd} className="flex-1 font-bold py-3.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 disabled:opacity-50 hover:bg-blue-700 transition">บันทึกข้อมูล</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Photo Modal */}
      {uploadModal.open && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200" onClick={() => setUploadModal({open: false, id: null})}>
            <div className="bg-white w-full max-w-sm rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                  <ImageIcon weight="fill" className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-800">อัปเดตหลักฐาน</h3>
                  <p className="text-xs text-slate-400 font-medium">แนบสลิปโอนเงินใหม่</p>
                </div>
              </div>
              
              <label className="flex flex-col items-center justify-center w-full min-h-[140px] border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition p-4 mb-6 text-center">
                <span className="flex flex-col items-center gap-3 text-slate-600 font-medium text-sm">
                   <ImageIcon weight="duotone" className={`text-5xl ${fileRaw ? 'text-blue-500' : 'text-slate-300'}`} /> 
                   {fileRaw ? <span className="font-bold text-blue-600">{fileRaw.name}</span> : 'แตะเพื่อเลือกไฟล์รูปภาพ'}
                </span>
                <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files && setFileRaw(e.target.files[0])} />
              </label>
              
              <div className="flex gap-3 pt-2">
                <button onClick={() => setUploadModal({open: false, id: null})} className="flex-1 font-bold py-3.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition">ยกเลิก</button>
                <button disabled={loading || !fileRaw} onClick={savePhoto} className="flex-1 font-bold py-3.5 bg-blue-600 text-white rounded-xl disabled:opacity-50 hover:bg-blue-700 transition shadow-md shadow-blue-200">อัปโหลด</button>
              </div>
            </div>
         </div>
      )}

    </div>
  );
}
