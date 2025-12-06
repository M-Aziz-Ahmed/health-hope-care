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
       const body = {
         ...payload,
         url: typeof window !== 'undefined' ? window.location.href : '',
         path: typeof window !== 'undefined' ? window.location.pathname : '',
         title: typeof document !== 'undefined' ? document.title : '',
         userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
         platform: typeof navigator !== 'undefined' ? (navigator.platform || '') : ''
       };
       await fetch('/api/analytics/collect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
     } catch (e) {
       // ignore
     }
   }

   return null;
 }
