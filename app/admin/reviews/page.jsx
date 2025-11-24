'use client';
import { useEffect, useState } from 'react';
import { Star, Check, X, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, approved, pending

  useEffect(() => {
    fetchAllReviews();
  }, []);

  const fetchAllReviews = async () => {
    try {
      // Fetch all reviews (admin endpoint needed)
      const res = await fetch('/api/reviews/all');
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId, approved) => {
    try {
      const res = await fetch('/api/reviews/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, approved }),
      });

      if (res.ok) {
        setReviews(prev => prev.map(r => 
          r._id === reviewId ? { ...r, approved } : r
        ));
        alert(approved ? 'Review approved!' : 'Review rejected!');
      }
    } catch (error) {
      alert('Failed to update review');
    }
  };

  const filteredReviews = reviews.filter(r => {
    if (filter === 'approved') return r.approved;
    if (filter === 'pending') return !r.approved;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">Review Management</h1>
            <p className="text-slate-600 mt-2">Approve or reject customer reviews</p>
          </div>
          <Link href="/admin" className="bg-slate-600 text-white px-6 py-3 rounded-lg hover:bg-slate-700">
            Back to Dashboard
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-md p-2 mb-6 inline-flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filter === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({reviews.length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filter === 'approved' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Approved ({reviews.filter(r => r.approved).length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filter === 'pending' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending ({reviews.filter(r => !r.approved).length})
          </button>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-12">Loading reviews...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-slate-600">No reviews found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review._id} className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-800">{review.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        review.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {review.approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                      <span>{review.email}</span>
                      <span>•</span>
                      <span>{review.service}</span>
                      <span>•</span>
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="ml-2 text-sm text-slate-600">({review.rating}/5)</span>
                    </div>
                    <p className="text-slate-700">{review.review}</p>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {!review.approved && (
                      <button
                        onClick={() => handleApprove(review._id, true)}
                        className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
                        title="Approve"
                      >
                        <Check size={20} />
                      </button>
                    )}
                    {review.approved && (
                      <button
                        onClick={() => handleApprove(review._id, false)}
                        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition"
                        title="Reject"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
