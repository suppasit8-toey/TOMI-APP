'use client';

import { useState, useEffect } from 'react';
import { Wallet, Funnel, ArrowsClockwise, Info, Briefcase, Scroll, TrendUp, TrendDown, CalendarBlank, ChartBar, CurrencyDollar, Package, ArrowRight, Sparkle, Clock } from '@phosphor-icons/react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [totalStockValue, setTotalStockValue] = useState(0);
  const [stockCount, setStockCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [projectStats, setProjectStats] = useState({ total: 0, active: 0, completed: 0 });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [recentAccounts, setRecentAccounts] = useState<any[]>([]);
  
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterMonth, setFilterMonth] = useState((new Date().getMonth() + 1).toString());

  const loadData = async () => {
    setLoading(true);
    
    const { data: accData } = await supabase.from('accounts').select('transaction_date, type, amount, detail, category, created_at').order('created_at', { ascending: false });
    setAccounts(accData || []);
    setRecentAccounts((accData || []).slice(0, 5));

    const { data: stockData } = await supabase.from('stocks').select('cost_per_meter, remaining_length, initial_length, status').gt('remaining_length', 0);
    
    let stockVal = 0;
    let lowCount = 0;
    if (stockData) {
      stockData.forEach(s => {
        stockVal += (Number(s.cost_per_meter) * Number(s.remaining_length));
        if (s.remaining_length < 5 && s.remaining_length > 0) lowCount++;
      });
    }
    setTotalStockValue(Math.floor(stockVal));
    setStockCount(stockData?.length || 0);
    setLowStockCount(lowCount);

    const { data: projData } = await supabase.from('projects').select('id, name, status, created_at, tel').order('created_at', { ascending: false });
    if (projData) {
      const active = projData.filter(p => !['เสร็จสิ้น', 'ยกเลิก'].includes(p.status)).length;
      const completed = projData.filter(p => p.status === 'เสร็จสิ้น').length;
      setProjectStats({ total: projData.length, active, completed });
      setRecentProjects(projData.slice(0, 4));
    }

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'สวัสดีตอนเช้า';
    if (hour < 17) return 'สวัสดีตอนบ่าย';
    return 'สวัสดีตอนเย็น';
  };

  const getStatusColor = (s: string) => {
    return {'ใหม่':'bg-gray-100 text-gray-600','นัดวัด':'bg-yellow-100 text-yellow-700','เสนอราคา':'bg-blue-100 text-blue-700','รอติดตั้ง':'bg-purple-100 text-purple-700','รอรับเงิน':'bg-orange-100 text-orange-700','รอปิดงาน':'bg-orange-100 text-orange-700','เสร็จสิ้น':'bg-green-100 text-green-700','ยกเลิก':'bg-red-100 text-red-700'}[s] || 'bg-gray-100 text-gray-700';
  };

  const monthNames = ['', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Greeting & Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkle weight="fill" className="text-amber-400 text-lg" />
            <span className="text-sm text-slate-400 font-medium">{getGreeting()}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
            ภาพรวมร้าน
          </h2>
          <p className="text-sm text-slate-400 mt-0.5 font-medium">
            สรุปข้อมูลธุรกิจ TOMI FILM ทั้งหมด
          </p>
        </div>
        <div className="flex gap-2 items-center bg-white p-2.5 rounded-xl shadow-sm border border-slate-200">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium"><Funnel weight="fill" className="text-blue-500" /> กรอง:</span>
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="w-auto border border-slate-200 rounded-lg py-1.5 px-3 text-sm outline-none focus:border-blue-600 bg-slate-50 font-bold text-slate-700">
            <option value="">ทุกปี</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="w-auto border border-slate-200 rounded-lg py-1.5 px-3 text-sm outline-none focus:border-blue-600 bg-slate-50 font-bold text-slate-700">
            <option value="">ทุกเดือน</option>
            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{monthNames[m]}</option>
            ))}
          </select>
          <button onClick={loadData} className="bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 py-1.5 px-2.5 rounded-lg h-8 flex items-center justify-center transition cursor-pointer">
            <ArrowsClockwise className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Financial Card */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-800 rounded-3xl p-7 text-white shadow-[0_10px_30px_rgba(34,34,86,0.25)] relative overflow-hidden group transition duration-500 hover:shadow-[0_15px_40px_rgba(34,34,86,0.35)]">
          <div className="absolute top-0 right-0 p-3 opacity-[0.07] transform scale-[2.5] translate-x-6 -translate-y-6 group-hover:scale-[2.7] transition duration-700">
            <Wallet weight="fill" className="text-9xl" />
          </div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
          
          <div className="flex items-center gap-2 mb-4 relative">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/10">
              <CurrencyDollar weight="bold" className="text-blue-200" />
            </div>
            <span className="text-blue-200 text-sm font-semibold tracking-wide">
              {filterMonth ? `${monthNames[parseInt(filterMonth)]} ${filterYear}` : filterYear ? `ปี ${filterYear}` : 'ทั้งหมด'}
            </span>
          </div>
          
          <div className="text-blue-200/70 text-xs mb-1 relative font-bold uppercase tracking-wider">ยอดเงินคงเหลือสุทธิ</div>
          <div className="text-4xl font-black relative tracking-tight mb-1">
            {net >= 0 ? '' : '-'}฿{fmt(Math.abs(net))}
          </div>
          
          <div className="mt-5 flex gap-6 text-sm relative border-t border-white/15 pt-4">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendUp weight="bold" className="text-emerald-300 text-base" />
                <span className="text-emerald-200 font-bold text-xs">รายรับ</span>
              </div>
              <span className="font-black text-xl text-emerald-100">+{fmt(income)}</span>
            </div>
            <div className="w-px bg-white/10"></div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendDown weight="bold" className="text-red-300 text-base" />
                <span className="text-red-200 font-bold text-xs">รายจ่าย</span>
              </div>
              <span className="font-black text-xl text-red-100">-{fmt(expense)}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-200 relative overflow-hidden flex flex-col justify-center group transition duration-500 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
          <div className="absolute top-4 right-4 w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
            <Package weight="duotone" className="text-blue-500 text-xl" />
          </div>
          <div className="text-slate-500 text-xs mb-2 font-bold uppercase tracking-wider">มูลค่าสต็อกฟิล์มคงเหลือ</div>
          <div className="text-[38px] font-black text-slate-800 tracking-tight leading-none mb-2">
            ฿{fmt(totalStockValue)}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <div className="text-xs font-bold text-blue-600 flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100/50">
              <Scroll weight="fill" className="text-blue-400" /> {stockCount} ม้วน คงเหลือ
            </div>
            {lowStockCount > 0 && (
              <div className="text-xs font-bold text-amber-600 flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100/50">
                ⚠️ {lowStockCount} ม้วน ใกล้หมด
              </div>
            )}
          </div>
          <div className="mt-4 text-[10px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Info weight="fill" className="text-slate-300 text-sm" /> คำนวณจากราคาทุน/เมตร × เมตรที่เหลือ
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/projects" className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-100 transition">
              <Briefcase weight="duotone" className="text-indigo-500 text-xl" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">โปรเจกต์</span>
          </div>
          <div className="text-2xl font-black text-slate-800 leading-none">{projectStats.total}</div>
          <div className="flex gap-2 mt-2">
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">{projectStats.active} กำลังดำเนินการ</span>
          </div>
        </Link>
        
        <Link href="/projects" className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-green-300 hover:shadow-md transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-100 transition">
              <ChartBar weight="duotone" className="text-emerald-500 text-xl" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">สำเร็จ</span>
          </div>
          <div className="text-2xl font-black text-slate-800 leading-none">{projectStats.completed}</div>
          <div className="flex gap-2 mt-2">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">โปรเจกต์เสร็จสิ้น</span>
          </div>
        </Link>
        
        <Link href="/stock" className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 group-hover:bg-blue-100 transition">
              <Scroll weight="duotone" className="text-blue-500 text-xl" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">สต็อก</span>
          </div>
          <div className="text-2xl font-black text-slate-800 leading-none">{stockCount}</div>
          <div className="flex gap-2 mt-2">
            <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded-md">ม้วนคงเหลือ</span>
          </div>
        </Link>
        
        <Link href="/accounts" className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-purple-300 hover:shadow-md transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100 group-hover:bg-purple-100 transition">
              <Wallet weight="duotone" className="text-purple-500 text-xl" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">รายการบัญชี</span>
          </div>
          <div className="text-2xl font-black text-slate-800 leading-none">{accounts.length}</div>
          <div className="flex gap-2 mt-2">
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md">รายการทั้งหมด</span>
          </div>
        </Link>
      </div>

      {/* Recent Activity Section */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Recent Projects */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase weight="fill" className="text-blue-500" />
              <h3 className="font-bold text-slate-800 text-sm">โปรเจกต์ล่าสุด</h3>
            </div>
            <Link href="/projects" className="text-xs text-blue-500 hover:text-blue-700 font-bold flex items-center gap-1 transition">
              ดูทั้งหมด <ArrowRight weight="bold" className="text-[10px]" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentProjects.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm font-medium">
                <Briefcase className="text-3xl mx-auto mb-2 text-slate-200" />
                ยังไม่มีโปรเจกต์
              </div>
            ) : (
              recentProjects.map(p => (
                <Link href={`/projects/${p.id}`} key={p.id} className="flex items-center px-5 py-3.5 hover:bg-slate-50 transition gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 shrink-0">
                    <Briefcase weight="duotone" className="text-blue-500 text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 text-sm truncate">{p.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="text-[10px]" />
                      {new Date(p.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${getStatusColor(p.status)}`}>
                    {p.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Accounts */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet weight="fill" className="text-purple-500" />
              <h3 className="font-bold text-slate-800 text-sm">รายการบัญชีล่าสุด</h3>
            </div>
            <Link href="/accounts" className="text-xs text-blue-500 hover:text-blue-700 font-bold flex items-center gap-1 transition">
              ดูทั้งหมด <ArrowRight weight="bold" className="text-[10px]" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentAccounts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm font-medium">
                <Wallet className="text-3xl mx-auto mb-2 text-slate-200" />
                ยังไม่มีรายการ
              </div>
            ) : (
              recentAccounts.map(acc => (
                <div key={acc.created_at + acc.amount} className="flex items-center px-5 py-3.5 hover:bg-slate-50 transition gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${acc.type === 'Income' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                    {acc.type === 'Income' ? <TrendUp weight="bold" className="text-emerald-500 text-sm" /> : <TrendDown weight="bold" className="text-red-400 text-sm" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 text-sm truncate">{acc.detail || acc.category || '-'}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-medium">{acc.category}</span>
                    </div>
                  </div>
                  <span className={`font-black text-sm shrink-0 ${acc.type === 'Income' ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {acc.type === 'Income' ? '+' : '-'}{fmt(acc.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl p-5 border border-slate-200/80">
        <h3 className="font-bold text-slate-600 text-sm mb-3 flex items-center gap-2">
          <Sparkle weight="fill" className="text-amber-400" /> ทางลัดด่วน
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Link href="/projects" className="bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:text-blue-700 transition-all flex items-center gap-2 shadow-sm">
            <Briefcase weight="duotone" className="text-blue-500" /> สร้างโปรเจกต์
          </Link>
          <Link href="/stock" className="bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:text-emerald-700 transition-all flex items-center gap-2 shadow-sm">
            <Scroll weight="duotone" className="text-emerald-500" /> เพิ่มสต็อก
          </Link>
          <Link href="/accounts" className="bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:text-purple-700 transition-all flex items-center gap-2 shadow-sm">
            <Wallet weight="duotone" className="text-purple-500" /> บันทึกบัญชี
          </Link>
          <Link href="/quotations" className="bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:text-amber-700 transition-all flex items-center gap-2 shadow-sm">
            <CalendarBlank weight="duotone" className="text-amber-500" /> สร้างใบเสนอราคา
          </Link>
        </div>
      </div>
    </div>
  );
}
