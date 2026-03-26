'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function ReportContent() {
  const searchParams = useSearchParams();
  const year = searchParams.get('year') || new Date().getFullYear().toString();
  const month = searchParams.get('month') || (new Date().getMonth() + 1).toString();
  
  const [data, setData] = useState<{income: any[], expense: any[]}>({income:[], expense:[]});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: dbData } = await supabase.from('accounts').select('*').order('transaction_date', { ascending: true });
      if (!dbData) return;
      
      const filtered = dbData.filter(a => {
        if (!a.transaction_date) return false;
        const [y, mStr] = a.transaction_date.split('-');
        if (year && y !== year) return false;
        if (month && parseInt(mStr).toString() !== parseInt(month).toString()) return false;
        return true;
      });

      setData({
        income: filtered.filter(f => f.type === 'Income'),
        expense: filtered.filter(f => f.type === 'Expense')
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
  const mName = year && month ? new Date(`${year}-${month}-01`).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' }) : 'รวมทุกปี';

  return (
    <div className="bg-white text-black p-8 max-w-[210mm] mx-auto min-h-screen print:p-0 print:m-0 print:shadow-none shadow-2xl mt-8 mb-8 print:mt-0 print:mb-0">
      <div className="text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-black mb-1 tracking-wide uppercase font-sans">TOMI FILM (สรุปบัญชีรายรับ-รายจ่าย)</h1>
        <p className="text-lg font-bold">รายงานประจำรอบเดือน: <span className="text-blue-600">{mName}</span></p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="font-bold text-lg mb-3 border-b-2 border-green-500 pb-1 text-green-700 bg-green-50 px-2 rounded-t shrink-0 flex items-center">▶ รายรับ (Income)</h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-200">
              {data.income.map(i => (
                <tr key={i.id}>
                  <td className="py-2 text-gray-500 w-16">{i.transaction_date.split('-').reverse().join('/')}</td>
                  <td className="py-2 px-2 font-medium">{i.detail || i.category}</td>
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
                  <td className="py-2 px-2 font-medium">{e.detail || e.category}</td>
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
