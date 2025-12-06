'use client';
import { useEffect, useState, useRef } from 'react';
import { TrendingUp, Users, Calendar, Star } from 'lucide-react';

export default function Analytics() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    staffCount: 0,
    analytics: {}
  });

  const sessionStartRef = useRef(Date.now());

  useEffect(() => {
    fetchStats();
    sessionStartRef.current = Date.now();

    // send pageview
    sendEvent({ type: 'pageview' });

    // throttled click listener
    let clickLocked = false;
    function onClick(e) {
      if (clickLocked) return;
      clickLocked = true;
      setTimeout(() => { clickLocked = false; }, 400);
      const target = e.target;
      const tag = target.tagName;
      const text = (target.innerText || '').trim().slice(0, 120);
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

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  async function sendEvent(payload) {
    try {
      const body = {
        ...payload,
        url: window.location.href,
        path: window.location.pathname,
        title: document.title,
        userAgent: navigator.userAgent,
        platform: navigator.platform || ''
      };
      await fetch('/api/analytics/collect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } catch (e) {
      // ignore send errors
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 to-sky-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-emerald-800 mb-4">Our Impact</h2>
          <p className="text-gray-600 text-lg">Trusted by thousands for quality healthcare at home</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-blue-600" size={32} />
            </div>
            <div className="text-4xl font-bold text-gray-800 mb-2">{stats.totalUsers > 80 ? stats.totalUsers : '80'}+</div>
            <div className="text-gray-600">Happy Patients</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-emerald-600" size={32} />
            </div>
            <div className="text-4xl font-bold text-gray-800 mb-2">{stats.totalBookings > 100 ? stats.totalBookings : '100'}+</div>
            <div className="text-gray-600">Services Delivered</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="text-purple-600" size={32} />
            </div>
            <div className="text-4xl font-bold text-gray-800 mb-2">
              {stats.totalBookings > 0
                ? Math.round((stats.confirmedBookings / stats.totalBookings) * 100)
                : 0}%
            </div>
            <div className="text-gray-600">Success Rate</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition">
            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-yellow-600" size={32} />
            </div>
            <div className="text-4xl font-bold text-gray-800 mb-2">{stats.staffCount > 50 ? stats.staffCount : '50'}+</div>
            <div className="text-gray-600">Expert Staff</div>
          </div>
        </div>
      </div>
    </section>
  );
}
