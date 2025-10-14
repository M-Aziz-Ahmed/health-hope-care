"use client";
import { useEffect, useState } from 'react';

export default function NotificationsPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        setNotes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const markRead = async (id) => {
    try {
      const res = await fetch('/api/notifications/markRead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error('Failed');
      setNotes((prev) => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading notifications...</div>;

  return (
    <div className="min-h-screen bg-emerald-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
        {notes.length === 0 ? (
          <p className="text-gray-500">No notifications.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map(n => (
              <li key={n._id} className={`p-3 rounded-md border ${n.read ? 'bg-white' : 'bg-emerald-50 border-emerald-200'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-600">{new Date(n.createdAt).toLocaleString()}</div>
                    <div className="mt-1">{n.message}</div>
                    {n.booking && <div className="text-sm text-gray-500 mt-1">Booking: {n.booking._id}</div>}
                  </div>
                  <div>
                    {!n.read && <button onClick={() => markRead(n._id)} className="text-sm text-blue-600">Mark read</button>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
