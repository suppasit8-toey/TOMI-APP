'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@phosphor-icons/react';

function ReportContent() {
  const searchParams = useSearchParams();
  const yearParam = searchParams.get('year');
  const monthParam = searchParams.get('month');
  
  // Default to current date if params are null (not provided in URL)
  // If params are empty strings (provided but empty), treat as "All"
  const year = yearParam === null ? new Date().getFullYear().toString() : yearParam;
  const month = monthParam === null ? (new Date().getMonth() + 1).toString() : monthParam;
  
  const [data, setData] = useState<{income: any[], expense: any[], labor: any[]}>({income:[], expense:[], labor:[]});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: dbData } = await supabase.from('accounts').select('*, projects(name)').order('transaction_date', { ascending: true });
      if (!dbData) return;
      
      const filtered = dbData.filter(a => {
        if (!a.transaction_date) return false;
        const [y, mStr] = a.transaction_date.split('-');
        if (year && y !== year) return false;
        if (month && parseInt(mStr).toString() !== parseInt(month).toString()) return false;
        return true;
      });

      const { data: trData } = await supabase.from('project_transactions').select('*, projects(name)').not('ref_user_id', 'is', null).order('action_date', { ascending: true });
      const laborFiltered = trData?.filter(t => {
        if (!t.action_date) return false;
        const [y, mStr] = t.action_date.split('-');
        if (year && y !== year) return false;
        if (month && parseInt(mStr).toString() !== parseInt(month).toString()) return false;
        return true;
      }) || [];

      setData({
        income: filtered.filter(f => f.type === 'Income'),
        expense: filtered.filter(f => f.type === 'Expense'),
        labor: laborFiltered
      });
      setLoading(false);
      
      setTimeout(() => {
        window.print();
      }, 1000);
    };
    fetch();
  }, [year, month]);

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">กำลังเตรียมเอกสารรายงาน...</div>;

  const sumInc = data.income.reduce((s, x) => s + Number(x.amount), 0);
  const sumExp = data.expense.reduce((s, x) => s + Number(x.amount), 0);
  const net = sumInc - sumExp;

  const fmt = (num: number) => new Intl.NumberFormat('th-TH').format(num || 0);
  const mName = (() => {
    if (!year && !month) return 'ทั้งหมด';
    if (year && !month) return `ประจำปี ${year}`;
    if (!year && month) return `ประจำเดือน ${month}`;
    try {
      return new Date(`${year}-${month}-01`).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
    } catch {
      return 'ทั้งหมด';
    }
  })();

  return (
    <div className="bg-white text-black p-8 max-w-[210mm] mx-auto min-h-screen print:p-0 print:m-0 print:shadow-none shadow-2xl mt-8 mb-8 print:mt-0 print:mb-0">
      <div className="text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-black mb-1 tracking-wide uppercase font-sans">TOMI FILM (สรุปบัญชีรายรับ-รายจ่าย)</h1>
        <p className="text-lg font-bold">รายงานประจำรอบเดือน: <span className="text-blue-600">{mName}</span></p>
      </div>

      {/* 1. Labor Summary Section */}
      <div className="mb-12">
        <h2 className="text-xl font-bold border-l-4 border-slate-800 pl-3 mb-6">1. สรุปค่าแรงและคอมมิชชั่นรายบุคคล</h2>
        <div className="space-y-6">
          {Object.values(data.labor.reduce((acc: any, cur: any) => {
            const userName = cur.ref_user_id || 'ไม่ระบุ';
            if (!acc[userName]) acc[userName] = { name: userName, items: [], total: 0 };
            acc[userName].items.push(cur);
            acc[userName].total += Number(cur.amount);
            return acc;
          }, {})).map((l: any) => (
            <div key={l.name} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-4 py-3 flex justify-between items-center border-b border-slate-200">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <User weight="fill" className="text-blue-500" /> {l.name}
                </div>
                <div className="text-blue-600 font-bold">รวมรับ: {fmt(l.total)} บาท</div>
              </div>
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100 uppercase tracking-tight">
                  <tr>
                    <th className="py-2 px-4 text-left">วันที่</th>
                    <th className="py-2 px-4 text-left">โครงการ</th>
                    <th className="py-2 px-4 text-left">งานที่ทำ</th>
                    <th className="py-2 px-4 text-right pr-4">จำนวนเงิน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {l.items.map((it: any) => (
                    <tr key={it.id}>
                      <td className="py-2.5 px-4 text-slate-500">{it.action_date.split('-').reverse().join('/')}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-700">{it.projects?.name || '-'}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-700">{it.detail || it.stage_name}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900 pr-4">{fmt(it.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          {data.labor.length === 0 && <div className="text-center py-8 text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">ไม่มีรายการค่าแรงรายบุคคล</div>}
        </div>
      </div>

      <h2 className="text-xl font-bold border-l-4 border-slate-800 pl-3 mb-6">2. สรุปรายรับ-รายจ่ายรวม</h2>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="font-bold text-lg mb-3 border-b-2 border-green-500 pb-1 text-green-700 bg-green-50 px-2 rounded-t shrink-0 flex items-center">▶ รายรับ (Income)</h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-200">
              {data.income.map(i => (
                <tr key={i.id}>
                  <td className="py-2 text-gray-500 w-16">{i.transaction_date.split('-').reverse().join('/')}</td>
                  <td className="py-2 px-2 font-medium">
                    {i.detail || i.category}
                    {i.projects?.name && <span className="text-[9px] block text-blue-500 font-bold">Project: {i.projects.name}</span>}
                  </td>
                  <td className="py-2 text-right font-bold w-20">{fmt(i.amount)}</td>
                </tr>
              ))}
              {data.income.length === 0 && <tr><td colSpan={3} className="py-4 text-center italic text-gray-400 border border-dashed rounded mt-2 block">ไม่มีรายการ</td></tr>}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-400 font-bold bg-green-50 text-base">
                <td colSpan={2} className="py-3 px-2 text-right">รวมรายรับ</td>
                <td className="py-3 text-right text-green-700">{fmt(sumInc)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div>
          <h2 className="font-bold text-lg mb-3 border-b-2 border-red-500 pb-1 text-red-700 bg-red-50 px-2 rounded-t shrink-0 flex items-center">▶ รายจ่าย (Expense)</h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-200">
              {data.expense.map(e => (
                <tr key={e.id}>
                  <td className="py-2 text-gray-500 w-16">{e.transaction_date.split('-').reverse().join('/')}</td>
                  <td className="py-2 px-2 font-medium">
                    {e.detail || e.category}
                    {e.projects?.name && <span className="text-[9px] block text-blue-500 font-bold">Project: {e.projects.name}</span>}
                  </td>
                  <td className="py-2 text-right font-bold w-20">{fmt(e.amount)}</td>
                </tr>
              ))}
              {data.expense.length === 0 && <tr><td colSpan={3} className="py-4 text-center italic text-gray-400 border border-dashed rounded mt-2 block">ไม่มีรายการ</td></tr>}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-400 font-bold bg-red-50 text-base">
                <td colSpan={2} className="py-3 px-2 text-right">รวมรายจ่าย</td>
                <td className="py-3 text-right text-red-700">{fmt(sumExp)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="mt-12 bg-gray-100 p-6 rounded-xl flex justify-between items-center border-2 border-gray-300 shadow-sm print:bg-gray-100 print:!border-black">
        <h3 className="font-black text-2xl">ยอดคงเหลือสุทธิ (Net Profit)</h3>
        <div className={`font-black text-4xl tracking-tight ${net >= 0 ? 'text-green-700' : 'text-red-700'}`}>{fmt(net)} <span className="text-xl">THB</span></div>
      </div>

      <div className="mt-20 text-right pr-4">
        <div className="inline-block text-center w-64">
           <div className="border-b border-black mb-2 px-8 py-5"></div>
           <p className="text-sm text-gray-800 font-bold w-full uppercase">ผู้ตรวจสอบบัญชี</p>
           <p className="text-xs text-gray-500 mt-1">พิมพ์เมื่อ: {new Date().toLocaleDateString('th-TH')}</p>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-gray-400 no-print">
        <button onClick={() => window.print()} className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-black transition">🖨 พิมพ์รายงาน</button>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-bold animate-pulse">กำลังโหลดระบบพิมพ์...</div>}>
      <ReportContent />
    </Suspense>
  )
}
