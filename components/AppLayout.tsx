'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { usePathname } from 'next/navigation';
import { SquaresFour, Briefcase, Scroll, Wallet, SignOut, Storefront, Tag, Calculator, Receipt, DotsThree, X, Globe } from '@phosphor-icons/react';
import Link from 'next/link';

const navItems = [
  { id: '/dashboard', label: 'ภาพรวม', icon: SquaresFour },
  { id: '/projects', label: 'โปรเจกต์', icon: Briefcase },
  { id: '/stock', label: 'สต็อก', icon: Scroll },
  { id: '/accounts', label: 'บัญชี', icon: Wallet },
  { id: '/suppliers', label: 'ซัพพลายเออร์', icon: Storefront },
  { id: '/brands', label: 'แบรนด์ฟิล์ม', icon: Tag },
  { id: '/calculator', label: 'คำนวณฟิล์ม', icon: Calculator },
  { id: '/quotations', label: 'ใบเสนอราคา', icon: Receipt },
  { id: '/website-manager', label: 'จัดการเว็บไซต์', icon: Globe }
];

// First 4 items show on mobile bottom bar
const mobileMainNav = navItems.slice(0, 4);
const mobileMoreNav = navItems.slice(4);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  // Check if any "more" item is active
  const isMoreActive = mobileMoreNav.some(item => pathname.startsWith(item.id));

  return (
    <div className="flex bg-slate-50">
      {/* SIDEBAR (Desktop) */}
      <aside className="w-64 bg-blue-950 text-white hidden md:flex flex-col z-50 shadow-2xl p-5 border-r border-blue-900/50 no-print sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-1 mt-2">
          <div className="flex items-center justify-center p-0.5 border-[2.5px] border-white rounded-[7px] w-12 h-12 shadow-[0_0_15px_rgba(255,255,255,0.15)] bg-gradient-to-br from-blue-800 to-blue-950 shrink-0">
            <SquaresFour weight="regular" className="text-white text-3xl" />
          </div>
          <div className="flex flex-col shrink-0">
            <h1 className="font-extrabold text-[22px] leading-[1.1] tracking-widest text-white drop-shadow-md pb-[2px]">TOMI</h1>
            <h1 className="font-extrabold text-[22px] leading-[1] tracking-widest text-white drop-shadow-md">FILM</h1>
            <p className="text-[8px] font-bold text-blue-200 tracking-widest uppercase mt-1 opacity-80">Window Film</p>
          </div>
        </div>
        
        <nav className="flex-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.id);
            return (
              <Link 
                key={item.id} 
                href={item.id} 
                className={`flex items-center gap-4 p-3.5 rounded-xl cursor-pointer transition-all mb-2 font-medium ${isActive ? 'bg-blue-600/90 text-white shadow-lg shadow-blue-900/50 border border-blue-500/30' : 'text-blue-200/80 hover:bg-blue-900/40 hover:text-white'}`}
              >
                <Icon weight={isActive ? "fill" : "regular"} className={`text-2xl ${isActive ? 'text-white' : 'text-blue-300/80'}`} />
                <span className="tracking-wide text-sm">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        
        <button onClick={logout} className="mt-8 text-red-300 flex items-center px-4 py-3.5 hover:bg-red-950/40 rounded-xl transition w-full text-left font-medium border border-transparent hover:border-red-900/30">
          <SignOut className="mr-3 text-xl" /> ออกจากระบบ
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto overflow-x-hidden relative p-4 pb-32 md:p-8 md:pb-8 bg-slate-50 w-full max-w-full">
        <header className="md:hidden bg-blue-950 p-4 shadow-lg shadow-blue-900/10 flex justify-between items-center sticky top-0 z-30 no-print mb-4 rounded-xl border border-blue-900/30">
          <div className="flex items-center gap-3">
             <div className="flex items-center justify-center p-0.5 border-[2px] border-white rounded-[5px] w-9 h-9 bg-blue-900 shrink-0">
               <SquaresFour weight="regular" className="text-white text-xl" />
             </div>
             <div className="flex flex-col shrink-0">
               <h1 className="font-black text-sm leading-[1.1] tracking-widest text-white">TOMI</h1>
               <h1 className="font-black text-sm leading-[1] tracking-widest text-white">FILM</h1>
             </div>
          </div>
          <button onClick={logout} className="text-red-300 hover:bg-red-900/30 p-2 rounded-full transition cursor-pointer">
            <SignOut weight="bold" className="text-xl" />
          </button>
        </header>

        {children}

        {/* MOBILE "MORE" OVERLAY */}
        {moreOpen && (
          <div className="md:hidden fixed inset-0 z-[60] no-print" onClick={() => setMoreOpen(false)}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            {/* Menu Panel */}
            <div className="absolute bottom-[72px] right-3 left-3 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in slide-in-from-bottom-2" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-3 px-1">
                <span className="font-bold text-slate-700 text-sm">เมนูเพิ่มเติม</span>
                <button onClick={() => setMoreOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full">
                  <X weight="bold" className="text-lg" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {mobileMoreNav.map(item => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.id);
                  return (
                    <Link key={item.id} href={item.id} onClick={() => setMoreOpen(false)} className={`flex flex-col items-center p-3 rounded-xl transition-all ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                      <Icon weight={isActive ? "fill" : "regular"} className="text-2xl mb-1.5" />
                      <span className="text-[10px] font-medium text-center leading-tight">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MOBILE BOTTOM NAV — 4 main + More */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2 pb-safe z-50 no-print shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          {mobileMainNav.map(item => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.id);
            return (
              <Link key={item.id} href={item.id} onClick={() => setMoreOpen(false)} className={`flex-1 flex flex-col items-center p-2 cursor-pointer transition-all ${isActive ? 'text-blue-600 -translate-y-0.5' : 'text-slate-400 hover:text-slate-600'}`}>
                <Icon weight={isActive ? "fill" : "regular"} className="text-2xl mb-1" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
          {/* MORE BUTTON */}
          <button onClick={() => setMoreOpen(!moreOpen)} className={`flex-1 flex flex-col items-center p-2 cursor-pointer transition-all ${moreOpen || isMoreActive ? 'text-blue-600 -translate-y-0.5' : 'text-slate-400 hover:text-slate-600'}`}>
            <DotsThree weight="bold" className="text-2xl mb-1" />
            <span className="text-[10px] font-medium">เพิ่มเติม</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
