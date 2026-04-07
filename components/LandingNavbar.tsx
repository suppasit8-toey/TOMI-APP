'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, List, X } from '@phosphor-icons/react';

import Link from 'next/link';

const navLinks = [
  { href: '/#services', label: 'การบริการ' },
  { href: '/#film-types', label: 'ผลิตภัณฑ์' },
  { href: '/#process', label: 'ขั้นตอนการทำงาน' },
  { href: '/#about', label: 'เกี่ยวกับเรา' },
  { href: '/#faq', label: 'คำถามที่พบบ่อย' },
  { href: '/#contact', label: 'ติดต่อเรา' },
  { href: '/blog', label: 'บทความ' },
  { href: '/catalog', label: 'แคตตาล็อก' },
];

export default function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-black/5">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <div className="flex justify-between h-[72px] items-center">
            <span className="font-extrabold text-[18px] tracking-[0.3em] text-black whitespace-nowrap uppercase">TOMI FILM</span>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-10">
              {navLinks.map(item => (
                <Link key={item.href} href={item.href} className="text-black/50 hover:text-black transition-colors text-[13px] font-medium tracking-widest uppercase">{item.label}</Link>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/#contact" className="hidden sm:inline-flex items-center gap-2 px-5 py-2 text-[11px] font-bold tracking-[0.2em] uppercase bg-black text-white hover:bg-black/80 transition-colors">
                เริ่มต้นใช้งาน <ArrowUpRight weight="bold" className="text-sm" />
              </Link>
              
              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden relative w-10 h-10 flex items-center justify-center text-black/70 hover:text-black transition-colors"
                aria-label="Toggle menu"
              >
                <List weight="bold" className={`text-2xl absolute transition-all duration-300 ${menuOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} />
                <X weight="bold" className={`text-2xl absolute transition-all duration-300 ${menuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Full-Screen Menu — rendered OUTSIDE nav for proper z-index stacking */}
      {menuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-[9999]"
          style={{ backgroundColor: '#ffffff' }}
        >
          {/* Top bar with logo + close */}
          <div className="flex justify-between items-center h-[72px] px-6 sm:px-10 border-b border-black/10">
            <span className="font-extrabold text-[18px] tracking-[0.3em] text-black whitespace-nowrap uppercase">TOMI FILM</span>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-10 h-10 flex items-center justify-center text-black hover:text-black/60 transition-colors"
              aria-label="Close menu"
            >
              <X weight="bold" className="text-2xl" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col h-[calc(100%-72px)] px-8 pt-6 pb-10 overflow-y-auto">
            <div className="flex-1">
              {navLinks.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-5 border-b border-black/10 text-[16px] font-bold tracking-[0.25em] uppercase text-black hover:text-black/60 hover:pl-2 transition-all duration-300"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            <div className="pt-8">
              <Link
                href="/#contact"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-4 text-[13px] font-bold tracking-[0.2em] uppercase bg-black text-white hover:bg-black/80 transition-colors"
              >
                เริ่มต้นใช้งาน <ArrowUpRight weight="bold" className="text-sm" />
              </Link>
              <p className="text-center mt-5 text-[10px] tracking-[0.2em] uppercase text-black/30 font-bold">TOMI FILM — ฟิล์มกรองแสงระดับพรีเมียม</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

