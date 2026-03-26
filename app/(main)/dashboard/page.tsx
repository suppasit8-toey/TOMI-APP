'use client';

import { useState, useEffect } from 'react';
import { Wallet, Funnel, ArrowsClockwise, Info } from '@phosphor-icons/react';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [totalStockValue, setTotalStockValue] = useState(0);
  
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterMonth, setFilterMonth] = useState((new Date().getMonth() + 1).toString());

  const loadData = async () => {
    setLoading(true);
    
    const { data: accData } = await supabase.from('accounts').select('transaction_date, type, amount');
    setAccounts(accData || []);

    const { data: stockData } = await supabase.from('stocks').select('cost_per_meter, remaining_length').gt('remaining_length', 0);
    
    let stockVal = 0;
    if (stockData) {
      stockData.forEach(s => {
        stockVal += (Number(s.cost_per_meter) * Number(s.remaining_length));
      });
    }
    setTotalStockValue(Math.floor(stockVal));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  let income = 0;
  let expense = 0;
  
  accounts.forEach(acc => {
    if (!acc.transaction_date) return;
    const [y, m] = acc.transaction_date.split('-');
    if (filterYear && y !== filterYear) return;
    if (filterMonth && parseInt(m).toString() !== parseInt(filterMonth).toString()) return;
    
    const amt = Number(acc.amount);
    if (acc.type?.toLowerCase().includes('income')) income += amt;
    else expense += amt;
  });

  const net = income - expense;
  const fmt = (num: number) => new Intl.NumberFormat('th-TH').format(num || 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap justify-between items-end gap-4 no-print">
        <h2 className="text-xl font-bold text-slate-800">ภาพรวมร้าน</h2>
        <div className="flex gap-2 items-center bg-white p-2 rounded-lg shadow-sm border border-slate-200">
          <span className="text-xs text-gray-400 flex items-center gap-1"><Funnel /> กรอง:</span>
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="w-auto border border-slate-200 rounded-lg py-1 px-2 text-sm outline-none focus:border-blue-600 bg-white">
            <option value="">ทุกปี</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="w-auto border border-slate-200 rounded-lg py-1 px-2 text-sm outline-none focus:border-blue-600 bg-white">
            <option value="">ทุกเดือน</option>
            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button onClick={loadData} className="bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 py-1.5 px-2.5 rounded-lg h-8 flex items-center justify-center transition cursor-pointer">
            <ArrowsClockwise className={loading ? 'animate-spin text-blue-600' : ''} />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-2">
        <div className="bg-gradient-to-br from-blue-900 to-blue-600 rounded-3xl p-7 text-white shadow-[0_10px_30px_rgba(34,34,86,0.2)] relative overflow-hidden group transition duration-500 hover:shadow-[0_15px_40px_rgba(34,34,86,0.3)]">
          <div className="absolute top-0 right-0 p-3 opacity-10 transform scale-[2] translate-x-4 -translate-y-4 group-hover:scale-[2.2] transition duration-700">
            <Wallet weight="fill" className="text-9xl" />
          </div>
          <div className="text-blue-100 text-sm mb-1 relative font-medium">ยอดเงินคงเหลือสุทธิ</div>
          <div className="text-4xl font-bold relative tracking-tight">{fmt(net)} <span className="text-lg font-normal opacity-80">บาท</span></div>
          <div className="mt-6 flex gap-8 text-sm relative border-t border-white/20 pt-4">
            <div>
              <span className="text-green-200 block mb-1 font-medium">รายรับรวม</span>
              <span className="font-bold text-xl">+{fmt(income)}</span>
            </div>
            <div>
              <span className="text-red-200 block mb-1 font-medium">รายจ่ายรวม</span>
              <span className="font-bold text-xl">-{fmt(expense)}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-200 relative overflow-hidden flex flex-col justify-center group transition duration-500 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
          <div className="text-slate-500 text-sm mb-1.5 font-medium tracking-wide">มูลค่าสต็อกฟิล์มคงเหลือ</div>
          <div className="text-[40px] font-black text-slate-800 tracking-tight leading-none mb-1">{fmt(totalStockValue)} <span className="text-lg font-bold text-slate-400">บาท</span></div>
          <div className="mt-4 text-xs font-semibold text-blue-600/80 flex items-center gap-2 bg-blue-50 w-fit px-3 py-1.5 rounded-lg border border-blue-100/50">
            <Info weight="fill" className="text-blue-500 text-base" /> คำนวณจากราคาทุน/เมตร x เมตรที่เหลือ
          </div>
        </div>
      </div>
    </div>
  );
}
