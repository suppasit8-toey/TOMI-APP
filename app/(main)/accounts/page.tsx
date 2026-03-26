'use client';

import { useState, useEffect } from 'react';
import { Plus, Funnel, Wallet, Image as ImageIcon, PencilSimple, Receipt, Printer } from '@phosphor-icons/react';
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
    let query = supabase.from('accounts').select('*').order('transaction_date', { ascending: false });
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
    return new Date(dateString).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  };

  const incomeCategories = ['ขายส่งฟิล์ม', 'งานติดตั้ง', 'อื่นๆ (รายรับ)'];
  const expenseCategories = ['โครงการ', 'ซื้อสินค้า (Stock)', 'อุปกรณ์ติดตั้ง', 'ยานพาหนะ', 'อื่นๆ (รายจ่าย)'];

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-0 no-print">
        <h2 className="text-xl font-bold text-slate-800">บัญชีรายรับ-รายจ่าย</h2>
        <div className="flex gap-2">
          <Link href={`/report?year=${filterYear}&month=${filterMonth}`} target="_blank" className="bg-slate-100 text-slate-600 border border-slate-200 py-2 px-3 rounded-xl font-semibold shadow-sm gap-2 flex items-center hover:-translate-y-0.5 transition hover:bg-slate-200">
            <Printer weight="bold" /> <span className="hidden sm:inline">พิมพ์</span>
          </Link>
          <button onClick={() => setShowAdd(true)} className="bg-blue-600 text-white py-2 px-4 rounded-xl font-semibold shadow-lg shadow-blue-200 gap-2 flex items-center hover:-translate-y-0.5 transition hover:bg-blue-700">
            <Plus weight="bold" /> เพิ่มรายการ
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center bg-white p-3 rounded-2xl shadow-sm border border-slate-100 no-print mb-4 w-full">
        <span className="text-sm text-gray-400 flex items-center gap-1 font-medium ml-1"><Funnel /> กรอง:</span>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="flex-1 min-w-[100px] border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-blue-600 bg-slate-50 font-bold text-slate-700">
          <option value="">ทุกปี</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
        </select>
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="flex-1 min-w-[100px] border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-blue-600 bg-slate-50 font-bold text-slate-700">
          <option value="">ทุกเดือน</option>
          {Array.from({length: 12}, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>เดือน {m}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center group hover:shadow-md transition">
          <div className="text-xs text-green-500 font-bold bg-green-50 px-2 py-0.5 rounded-full mb-1 border border-green-100">รายรับ</div>
          <div className="text-xl font-black text-slate-800 break-all">{fmt(sumIncome)}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center group hover:shadow-md transition">
          <div className="text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full mb-1 border border-red-100">รายจ่าย</div>
          <div className="text-xl font-black text-slate-800 break-all">{fmt(sumExpense)}</div>
        </div>
        <div className={`rounded-2xl p-4 shadow-sm border flex flex-col items-center justify-center text-center group transition ${net >= 0 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-red-600 border-red-500 text-white'}`}>
          <div className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full mb-1 text-white shadow-inner">คงเหลือ</div>
          <div className="text-xl font-black break-all">{fmt(net)}</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mt-4 text-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="py-4 px-4 font-bold text-slate-600 w-16 text-center">วันที่</th>
              <th className="py-4 px-4 font-bold text-slate-600">รายละเอียด</th>
              <th className="py-4 px-4 font-bold text-slate-600 text-right">จำนวนเงิน</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="py-12 text-center text-slate-400">
                   <Receipt className="text-4xl mx-auto mb-2 text-slate-300" />
                   ไม่พบรายการบัญชี
                </td>
              </tr>
            )}
            {filtered.map(acc => (
              <tr key={acc.id} className="hover:bg-slate-50 transition group">
                <td className="py-4 px-4 align-top w-20">
                  <div className="text-center">
                    <div className="font-bold text-slate-700 text-lg leading-none">{formatDate(acc.transaction_date).split(' ')[0]}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{formatDate(acc.transaction_date).split(' ')[1]}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-800 leading-snug">{acc.detail || '-'}</div>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-bold">{acc.category}</span>
                    <span className="text-[10px] text-slate-400 flex items-center">
                      <PencilSimple weight="fill" className="mr-0.5" /> {acc.created_by}
                    </span>
                  </div>
                  <div className="mt-2">
                    {acc.evidence_url ? (
                      <a href={acc.evidence_url} target="_blank" className="inline-flex gap-1.5 items-center text-[11px] text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition font-medium border border-blue-100">
                        <ImageIcon weight="fill" /> ดูใบเสร็จ/หลักฐาน
                      </a>
                    ) : (
                      <button onClick={() => setUploadModal({ open: true, id: acc.id })} className="inline-flex gap-1.5 items-center text-[11px] text-slate-500 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition font-medium opacity-0 group-hover:opacity-100 focus:opacity-100">
                        + เพิ่มรูป/สลิป
                      </button>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4 align-top text-right">
                  <div className={`font-black text-base ${acc.type === 'Income' ? 'text-green-500' : 'text-slate-800'}`}>
                    {acc.type === 'Income' ? '+' : '-'}{fmt(acc.amount)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center sm:p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-xl mb-4 text-slate-800">เพิ่มรายการ</h3>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button 
                onClick={() => setForm({...form, type: 'Income', category: incomeCategories[0]})} 
                className={`py-3 rounded-xl font-bold transition border-2 ${form.type === 'Income' ? 'bg-green-50 text-green-700 border-green-500 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
              >
                รายรับ
              </button>
              <button 
                onClick={() => setForm({...form, type: 'Expense', category: expenseCategories[0]})} 
                className={`py-3 rounded-xl font-bold transition border-2 ${form.type === 'Expense' ? 'bg-red-50 text-red-700 border-red-500 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
              >
                รายจ่าย
              </button>
            </div>

            <label className="block text-sm font-semibold mb-1">วันที่</label>
            <input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none mb-3 bg-slate-50" />
            
            <label className="block text-sm font-semibold mb-1">หมวดหมู่</label>
            <select value={form.category} onChange={e=>setForm({...form, category:e.target.value})} className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 outline-none mb-3 focus:ring-2 focus:border-blue-500">
              <option value="">- เลือกหมวดหมู่ -</option>
              {(form.type === 'Income' ? incomeCategories : expenseCategories).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            
            <label className="block text-sm font-semibold mb-1">รายละเอียด</label>
            <input value={form.detail} onChange={e=>setForm({...form, detail:e.target.value})} placeholder="ระบุรายละเอียดเพิ่มเติม..." className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none mb-3 focus:ring-2 focus:border-blue-500" />
            
            <label className="block text-sm font-semibold mb-1">จำนวนเงิน (บาท) <span className="text-red-500">*</span></label>
            <input type="number" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} placeholder="0" className={`w-full border border-slate-200 rounded-xl px-4 py-3 outline-none font-bold text-2xl focus:ring-2 focus:border-blue-500 ${form.type === 'Income' ? 'text-green-600' : 'text-slate-800'}`} />
            
            <label className="block text-sm font-semibold mb-1 mt-3">หลักฐาน (Optional)</label>
            <label className="flex flex-col items-center justify-center w-full min-h-[80px] border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition p-3">
              <span className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                 <ImageIcon weight="bold" className="text-xl" /> {fileRaw ? fileRaw.name : 'แนบสลิป/ใบเสร็จ (1 ภาพ)'}
              </span>
              <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files && setFileRaw(e.target.files[0])} />
            </label>

            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
              <button onClick={() => setShowAdd(false)} className="flex-1 font-semibold py-3 bg-slate-100 text-slate-600 rounded-xl">ยกเลิก</button>
              <button disabled={loading} onClick={submitAdd} className="flex-1 font-semibold py-3 bg-blue-600 text-white rounded-xl shadow-md disabled:opacity-50">บันทึกรายการ</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Photo Modal */}
      {uploadModal.open && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center sm:p-4" onClick={() => setUploadModal({open: false, id: null})}>
            <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-xl mb-4 text-slate-800">อัปเดตหลักฐาน</h3>
              <label className="flex flex-col items-center justify-center w-full min-h-[120px] border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition p-4 mb-4 text-center">
                <span className="flex flex-col items-center gap-2 text-slate-600 font-medium text-sm">
                   <ImageIcon weight="bold" className="text-4xl text-blue-500" /> 
                   {fileRaw ? fileRaw.name : 'แตะเพื่อแนบสลิป/ใบเสร็จใหม่'}
                </span>
                <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files && setFileRaw(e.target.files[0])} />
              </label>
              
              <div className="flex gap-3 pt-2">
                <button onClick={() => setUploadModal({open: false, id: null})} className="flex-1 font-bold py-3 bg-slate-100 text-slate-600 rounded-xl">ยกเลิก</button>
                <button disabled={loading || !fileRaw} onClick={savePhoto} className="flex-1 font-bold py-3 bg-blue-600 text-white rounded-xl disabled:opacity-50">บันทึกรูปภาพ</button>
              </div>
            </div>
         </div>
      )}

    </div>
  );
}
