 'use client';
 import { useEffect, useRef } from 'react';

 export default function AnalyticsTracker() {
   const sessionStartRef = useRef(Date.now());

   useEffect(() => {
     // send pageview
     sendEvent({ type: 'pageview' });

     // throttled click listener
     let clickLocked = false;
     function onClick(e) {
       if (clickLocked) return;
       clickLocked = true;
       setTimeout(() => { clickLocked = false; }, 400);
       const target = e.target;
       const tag = target?.tagName || 'unknown';
       const text = (target?.innerText || '').trim().slice(0, 120);
       sendEvent({ type: 'click', event: `${tag}:${text}` });
     }

     window.addEventListener('click', onClick);

     function onUnload() {
       const duration = Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 1000));
       const body = JSON.stringify({ type: 'session', duration });
       const url = '/api/analytics/collect';
       if (navigator.sendBeacon) {
         navigator.sendBeacon(url, body);
       } else {
         try { fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }); } catch (e) {}
       }
     }

     window.addEventListener('visibilitychange', () => {
       if (document.visibilityState === 'hidden') onUnload();
     });
     window.addEventListener('beforeunload', onUnload);

     return () => {
       window.removeEventListener('click', onClick);
       window.removeEventListener('beforeunload', onUnload);
       window.removeEventListener('visibilitychange', onUnload);
     };
   }, []);

   async function sendEvent(payload) {
     try {
      // gather referrer, utm source/medium and basic device/os info
      const url = typeof window !== 'undefined' ? new URL(window.location.href) : null;
      const params = url ? Object.fromEntries(url.searchParams.entries()) : {};
      const referrer = typeof document !== 'undefined' ? document.referrer || '' : '';
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      const platformStr = typeof navigator !== 'undefined' ? (navigator.platform || '') : '';

      const os = (() => {
        const ua = userAgent.toLowerCase();
        if (ua.includes('windows')) return 'Windows';
        if (ua.includes('mac os') || ua.includes('macintosh')) return 'macOS';
        if (ua.includes('android')) return 'Android';
        if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'iOS';
        if (ua.includes('linux')) return 'Linux';
        return platformStr || 'Unknown';
      })();

      const deviceType = /mobi|android|iphone|ipad|ipod/i.test(userAgent) ? 'mobile' : 'desktop';

      const source = params.utm_source || (referrer ? (new URL(referrer).hostname.replace('www.', '')) : 'direct');
      const medium = params.utm_medium || (params.utm_source ? 'utm' : (referrer ? 'referrer' : 'direct'));

      const body = {
        ...payload,
        url: url ? url.href : '',
        path: typeof window !== 'undefined' ? window.location.pathname : '',
        title: typeof document !== 'undefined' ? document.title : '',
        userAgent,
        platform: platformStr,
        referrer,
        source,
        medium,
        os,
        deviceType
      };
       await fetch('/api/analytics/collect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
     } catch (e) {
       // ignore
     }
   }

   return null;
 }
