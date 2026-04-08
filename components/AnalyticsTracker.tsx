'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't track admin pages or API routes
    if (
      !pathname || 
      pathname.startsWith('/dashboard') || 
      pathname.startsWith('/website-manager') || 
      pathname.startsWith('/login') ||
      pathname.startsWith('/accounts') ||
      pathname.startsWith('/projects') ||
      pathname.startsWith('/quotations') ||
      pathname.startsWith('/stock') ||
      pathname.startsWith('/suppliers') ||
      pathname.startsWith('/brands') ||
      pathname.startsWith('/calculator')
    ) {
      return;
    }

    const trackView = async () => {
      try {
        const url = window.location.href;
        const referrer = document.referrer;
        const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
        
        let sessionId = sessionStorage.getItem('tomi_visit_session');
        if (!sessionId) {
          sessionId = Math.random().toString(36).substring(2, 15);
          sessionStorage.setItem('tomi_visit_session', sessionId);
        }

        // Keep it simple and insert without checking response so we don't handle errors
        await supabase.from('website_analytics').insert({
          page_path: pathname,
          url,
          referrer,
          device_type: deviceType,
          session_id: sessionId
        });
      } catch (err) {
        // Silently catch errors
      }
    };

    // Small delay to ensure only real views get tracked and no rapid multi-fires
    const timer = setTimeout(trackView, 1500);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
