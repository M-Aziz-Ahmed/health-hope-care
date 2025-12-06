'use client';
import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchStats();
  };

  const downloadCSV = (filename, rows) => {
    if (!rows || rows.length === 0) return;
    const header = Object.keys(rows[0]);
    const csv = [header.join(',')].concat(rows.map(r => header.map(h => JSON.stringify(r[h] ?? '')).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-6 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  const bookingStatusData = [
    { label: 'Confirmed', value: stats?.confirmedBookings || 0, color: 'bg-green-500', percentage: 0 },
    { label: 'Pending', value: stats?.pendingBookings || 0, color: 'bg-yellow-500', percentage: 0 },
    { label: 'Cancelled', value: stats?.cancelledBookings || 0, color: 'bg-red-500', percentage: 0 },
  ];

  const total = bookingStatusData.reduce((sum, item) => sum + item.value, 0);
  bookingStatusData.forEach(item => {
    item.percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
  });

  const maxValue = Math.max(...bookingStatusData.map(d => d.value), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-white rounded-lg transition">
              <ArrowLeft className="text-slate-700" size={24} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                <BarChart3 className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Analytics Dashboard</h1>
                <p className="text-slate-600">Comprehensive business insights</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Users className="text-blue-600" size={28} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">{stats?.totalUsers || 0}</div>
            <div className="text-sm text-slate-600">Total Users</div>
            <div className="mt-3 text-xs text-green-600 font-medium">↑ Active users</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <Calendar className="text-emerald-600" size={28} />
              </div>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">{stats?.totalBookings || 0}</div>
            <div className="text-sm text-slate-600">Total Bookings</div>
            <div className="mt-3 text-xs text-emerald-600 font-medium">All time bookings</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <CheckCircle className="text-green-600" size={28} />
              </div>
              <div className="text-sm font-semibold text-green-600">
                {stats?.totalBookings > 0 
                  ? Math.round((stats.confirmedBookings / stats.totalBookings) * 100) 
                  : 0}%
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">{stats?.confirmedBookings || 0}</div>
            <div className="text-sm text-slate-600">Confirmed</div>
            <div className="mt-3 text-xs text-green-600 font-medium">Success rate</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-xl">
                <Clock className="text-yellow-600" size={28} />
              </div>
              <div className="text-sm font-semibold text-yellow-600">
                {stats?.totalBookings > 0 
                  ? Math.round((stats.pendingBookings / stats.totalBookings) * 100) 
                  : 0}%
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">{stats?.pendingBookings || 0}</div>
            <div className="text-sm text-slate-600">Pending</div>
            <div className="mt-3 text-xs text-yellow-600 font-medium">Awaiting action</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Booking Status Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Booking Status Distribution</h2>
            <div className="space-y-5">
              {bookingStatusData.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-800">{item.value}</span>
                      <span className="text-xs text-slate-500">({item.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`${item.color} h-3 rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${(item.value / maxValue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Success Rate</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats?.totalBookings > 0 
                      ? Math.round((stats.confirmedBookings / stats.totalBookings) * 100) 
                      : 0}%
                  </div>
                </div>
                <CheckCircle className="text-blue-600" size={40} />
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Staff Members</div>
                  <div className="text-2xl font-bold text-emerald-600">{stats?.staffCount || 0}</div>
                </div>
                <Users className="text-emerald-600" size={40} />
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Active Services</div>
                  <div className="text-2xl font-bold text-purple-600">{stats?.totalServices || 0}</div>
                </div>
                <BarChart3 className="text-purple-600" size={40} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end mb-4">
          <button onClick={handleRefresh} className="bg-white border rounded-lg px-3 py-1 text-sm">Refresh Analytics</button>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h3 className="text-sm text-slate-500">Visits (Last 7 days)</h3>
            <div className="text-3xl font-bold text-slate-800 mt-3">{stats?.analytics?.visitsLast7Days ?? 0}</div>
            <div className="text-xs text-slate-500 mt-2">Unique pageviews collected by the tracker</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h3 className="text-sm text-slate-500">Avg. Session</h3>
            <div className="text-3xl font-bold text-slate-800 mt-3">{stats?.analytics?.averageSessionMinutes ?? 0} min</div>
            <div className="text-xs text-slate-500 mt-2">Average session duration across recent sessions</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h3 className="text-sm text-slate-500">Clicks (Last 7 days)</h3>
            <div className="text-3xl font-bold text-slate-800 mt-3">{stats?.analytics?.clicks ?? 0}</div>
            <div className="text-xs text-slate-500 mt-2">Tracked click events from users</div>
          </div>
        </div>

        {/* Small trend charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h3 className="text-sm text-slate-500 mb-4">Visits — Last 7 days</h3>
            {stats?.analytics?.visitsByDay && stats.analytics.visitsByDay.length > 0 ? (
              (() => {
                const data = stats.analytics.visitsByDay.map(d => ({ label: d._id, value: d.count }));
                const max = Math.max(...data.map(d => d.value), 1);
                return (
                  <div className="w-full">
                    <div className="flex items-end gap-2 h-32">
                      {data.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div className="w-full bg-slate-100 rounded-t-md" style={{ height: `${(d.value / max) * 100}%` }} />
                          <div className="text-xs text-slate-500 mt-2">{d.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-sm text-slate-500">No trend data yet</div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h3 className="text-sm text-slate-500 mb-4">Clicks — Last 7 days</h3>
            {stats?.analytics?.clicksByDay && stats.analytics.clicksByDay.length > 0 ? (
              (() => {
                const data = stats.analytics.clicksByDay.map(d => ({ label: d._id, value: d.count }));
                const max = Math.max(...data.map(d => d.value), 1);
                return (
                  <div className="w-full">
                    <div className="flex items-end gap-2 h-32">
                      {data.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div className="w-full bg-slate-100 rounded-t-md" style={{ height: `${(d.value / max) * 100}%` }} />
                          <div className="text-xs text-slate-500 mt-2">{d.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-sm text-slate-500">No click trend data yet</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Top Pages */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Top Pages</h2>
            <div className="space-y-3">
              {(stats?.analytics?.topPages || []).length === 0 ? (
                <div className="text-sm text-slate-500">No page data yet</div>
              ) : (
                (stats.analytics.topPages || []).map((p, idx) => (
                  <div key={p.path || idx} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-700 truncate">{p.path || '/'}</div>
                      <div className="text-xs text-slate-400">{p.visits} visits</div>
                    </div>
                    <div className="w-32">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(100, Math.round((p.visits / Math.max(1, (stats.analytics.topPages[0]?.visits || 1))) * 100))}%` }} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => downloadCSV('top-pages.csv', (stats?.analytics?.topPages || []).map(p => ({ path: p.path, visits: p.visits })))} className="bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm">Export Top Pages CSV</button>
            </div>
          </div>

          {/* Countries */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Top Countries</h2>
            <div className="space-y-3">
              {(stats?.analytics?.countries || []).length === 0 ? (
                <div className="text-sm text-slate-500">No country data yet</div>
              ) : (
                (stats.analytics.countries || []).map((c, idx) => (
                  <div key={c.label || idx} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-700">{c.label}</div>
                    </div>
                    <div className="w-32">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, Math.round((c.value / Math.max(1, stats.analytics.countries[0]?.value || 1)) * 100))}%` }} />
                      </div>
                    </div>
                    <div className="w-14 text-right text-sm text-slate-600">{c.value}</div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => downloadCSV('top-countries.csv', (stats?.analytics?.countries || []).map(c => ({ country: c.label, value: c.value })))} className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm">Export Countries CSV</button>
            </div>
          </div>

          {/* OS / Platform breakdown */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">OS & Platform</h2>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <div className="text-sm text-slate-600 mb-2">By Platform</div>
                {(stats?.analytics?.platformBreakdown || []).length === 0 ? (
                  <div className="text-sm text-slate-500">No platform data</div>
                ) : (
                  (stats.analytics.platformBreakdown || []).map((p, idx) => (
                    <div key={p.label || idx} className="flex items-center gap-3 mb-2">
                      <div className="flex-1 text-sm text-slate-700">{p.label}</div>
                      <div className="w-32">
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(100, Math.round((p.value / Math.max(1, stats.analytics.platformBreakdown[0]?.value || 1)) * 100))}%` }} />
                        </div>
                      </div>
                      <div className="w-12 text-right text-sm text-slate-600">{p.value}</div>
                    </div>
                  ))
                )}
              </div>

              <div>
                <div className="text-sm text-slate-600 mb-2">By OS</div>
                {(stats?.analytics?.osBreakdown || []).length === 0 ? (
                  <div className="text-sm text-slate-500">No OS data</div>
                ) : (
                  (stats.analytics.osBreakdown || []).map((o, idx) => (
                    <div key={o.label || idx} className="flex items-center gap-3 mb-2">
                      <div className="flex-1 text-sm text-slate-700">{o.label}</div>
                      <div className="w-32">
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${Math.min(100, Math.round((o.value / Math.max(1, stats.analytics.osBreakdown[0]?.value || 1)) * 100))}%` }} />
                        </div>
                      </div>
                      <div className="w-12 text-right text-sm text-slate-600">{o.value}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Bookings Trend */}
        {stats?.bookingsByMonth && stats.bookingsByMonth.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Bookings Trend (Last 6 Months)</h2>
            <div className="space-y-4">
              {stats.bookingsByMonth.map((month) => {
                const maxMonthValue = Math.max(...stats.bookingsByMonth.map(m => m.count), 1);
                return (
                  <div key={month._id}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-700">{month._id}</span>
                      <span className="text-sm font-bold text-slate-800">{month.count} bookings</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-700"
                        style={{ width: `${(month.count / maxMonthValue) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Bookings */}
        {stats?.recentBookings && stats.recentBookings.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Recent Bookings</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Service</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBookings.map((booking, idx) => (
                    <tr key={booking._id || idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-sm font-medium text-slate-800">{booking.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{booking.service}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{new Date(booking.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
