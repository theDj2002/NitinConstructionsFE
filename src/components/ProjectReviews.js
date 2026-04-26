/**
 * NKP Constructions – Project-wise Reviews
 *
 * Features:
 *  - Each project card has a ⭐ "Ratings & Reviews" button
 *  - Opens a modal with TWO tabs: "Reviews" list + "Write a Review" form
 *  - Form is always immediately accessible — no hidden toggles
 *  - Star hover animation, success state, validation, rating bar chart
 *
 * Integration: see bottom of file.
 */

import { useState, useEffect, useRef } from 'react';
import { reviewsApi } from '@/services/api';
import { Star, User, MessageSquare, Send, Loader2, X, CheckCircle, PenLine, ChevronLeft } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(ts) {
    return new Date(ts ?? Date.now()).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
    });
}

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

// ─── Star Rating Widget ───────────────────────────────────────────────────────
function StarRating({ value, onChange, readOnly = false, size = 'md' }) {
    const [hover, setHover] = useState(0);
    const dim = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }[size] ?? 'w-6 h-6';

    return (
        <div className="flex gap-1" onMouseLeave={() => !readOnly && setHover(0)}>
            {[1, 2, 3, 4, 5].map((s) => (
                <button
                    key={s}
                    type="button"
                    disabled={readOnly}
                    onClick={() => onChange?.(s)}
                    onMouseEnter={() => !readOnly && setHover(s)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: readOnly ? 'default' : 'pointer' }}
                    className={`transition-transform duration-100 ${!readOnly ? 'hover:scale-125 active:scale-110' : ''}`}
                >
                    <Star
                        className={`${dim} transition-colors duration-100 ${
                            (hover || value) >= s ? 'text-[#d4af37] fill-[#d4af37]' : 'text-gray-600'
                        }`}
                    />
                </button>
            ))}
        </div>
    );
}

// ─── Rating Summary with bar chart ───────────────────────────────────────────
function RatingSummary({ reviews }) {
    const avg = reviews.length
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;
    const counts = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r) => r.rating === star).length,
    }));

    return (
        <div className="flex gap-5 items-center mb-5 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-center flex-shrink-0">
                <div className="text-4xl font-black text-[#d4af37] leading-none">
                    {avg > 0 ? avg.toFixed(1) : '—'}
                </div>
                <div className="mt-1"><StarRating value={Math.round(avg)} readOnly size="sm" /></div>
                <p className="text-[10px] text-gray-500 mt-1">
                    {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </p>
            </div>
            <div className="flex-1 space-y-1.5">
                {counts.map(({ star, count }) => {
                    const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                    return (
                        <div key={star} className="flex items-center gap-2 text-[10px] text-gray-400">
                            <span className="w-3 text-right">{star}</span>
                            <Star className="w-3 h-3 text-[#d4af37] fill-[#d4af37] flex-shrink-0" />
                            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#caa64b] to-[#f5d97a] transition-all duration-700"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <span className="w-4 text-left">{count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Single Review Card ───────────────────────────────────────────────────────
function ReviewCard({ review }) {
    // Backend returns camelCase: userName, createdAt
    const name    = review.userName ?? review.user_name ?? 'Anonymous';
    const initial = name[0]?.toUpperCase() ?? '?';
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#d4af37]/15 flex items-center justify-center text-[#d4af37] flex-shrink-0 text-sm font-bold">
                        {initial}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white leading-none">{name}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                            {formatDate(review.createdAt ?? review.timestamp)}
                        </p>
                    </div>
                </div>
                <StarRating value={review.rating} readOnly size="sm" />
            </div>
            <p className="text-sm text-gray-300 leading-relaxed pl-11">"{review.comment}"</p>
        </div>
    );
}

// ─── Write Review Form ────────────────────────────────────────────────────────
function WriteReviewForm({ projectId, onSubmitted, onBack }) {
    const [form, setForm]     = useState({ user_name: '', rating: 5, comment: '' });
    const [busy, setBusy]     = useState(false);
    const [error, setError]   = useState('');
    const [success, setSuccess] = useState(false);
    const nameRef = useRef(null);

    useEffect(() => { nameRef.current?.focus(); }, []);

    const submit = async () => {
        if (!form.user_name.trim()) { setError('Please enter your name.'); return; }
        if (form.rating < 1)        { setError('Please select a star rating.'); return; }
        if (!form.comment.trim())   { setError('Please write a comment.'); return; }
        setError('');
        setBusy(true);
        try {
            const res = await reviewsApi.create({
                projectId,
                userName: form.user_name,
                rating:   form.rating,
                comment:  form.comment,
            });
            onSubmitted(res.data || res);
            setSuccess(true);
            setForm({ user_name: '', rating: 5, comment: '' });
        } catch {
            setError('Could not submit your review. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    // Success screen
    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <div>
                    <h4 className="text-white font-bold text-lg">Thank you for your review!</h4>
                    <p className="text-gray-400 text-sm mt-1">Your feedback helps others make better decisions.</p>
                </div>
                <button
                    type="button"
                    onClick={() => { setSuccess(false); onBack?.(); }}
                    className="mt-1 flex items-center gap-1 text-[#d4af37] text-sm font-semibold hover:underline"
                >
                    <ChevronLeft className="w-4 h-4" /> View all reviews
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {onBack && (
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back to reviews
                </button>
            )}

            <p className="text-gray-400 text-sm leading-relaxed">
                Share your honest experience — it helps others and helps us improve!
            </p>

            {/* Name */}
            <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                    Your Name <span className="text-[#d4af37]">*</span>
                </label>
                <input
                    ref={nameRef}
                    type="text"
                    value={form.user_name}
                    onChange={(e) => setForm({ ...form, user_name: e.target.value })}
                    placeholder="e.g. Ravi Shankar"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#020617] border border-white/10 text-sm text-white
                     placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/60
                     focus:ring-2 focus:ring-[#d4af37]/20 transition-all"
                />
            </div>

            {/* Star rating — large and prominent */}
            <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                    Your Rating <span className="text-[#d4af37]">*</span>
                </label>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#020617] border border-white/10">
                    <StarRating
                        value={form.rating}
                        onChange={(r) => setForm({ ...form, rating: r })}
                        size="lg"
                    />
                    {form.rating > 0 && (
                        <span className="text-[#d4af37] text-sm font-bold">{RATING_LABELS[form.rating]}</span>
                    )}
                </div>
            </div>

            {/* Comment */}
            <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                    Your Review <span className="text-[#d4af37]">*</span>
                </label>
                <textarea
                    rows={4}
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    placeholder="How was the build quality, timeline, and communication? The more detail, the better!"
                    className="w-full px-4 py-3 rounded-xl bg-[#020617] border border-white/10 text-sm text-white
                     placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/60
                     focus:ring-2 focus:ring-[#d4af37]/20 transition-all resize-none"
                />
                <p className="text-[10px] text-gray-600 mt-1 text-right">{form.comment.length} characters</p>
            </div>

            {/* Error */}
            {error && (
                <div className="px-4 py-2.5 rounded-xl bg-red-900/20 border border-red-500/20 text-red-400 text-xs">
                    ⚠ {error}
                </div>
            )}

            {/* Submit button */}
            <button
                type="button"
                onClick={submit}
                disabled={busy}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-[#020617] flex items-center justify-center gap-2
                   bg-gradient-to-r from-[#caa64b] to-[#f5d97a] shadow-lg transition-all
                   hover:-translate-y-0.5 hover:shadow-[#d4af37]/30 hover:shadow-xl
                   active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
                {busy
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</>
                    : <><Send className="w-4 h-4" />Submit My Review</>
                }
            </button>
        </div>
    );
}

// ─── Reviews Panel (tabbed: list | write) ────────────────────────────────────
function ReviewsPanel({ projectId, projectName }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab]         = useState('list'); // 'list' | 'write'

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const res = await reviewsApi.getByProject(projectId);
                if (!cancelled) setReviews(res.data || []);
            } catch {
                if (!cancelled) setReviews([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [projectId]);

    const handleNew = (review) => {
        setReviews((prev) => [review, ...prev]);
        setTab('list');
    };

    return (
        <div>
            {/* Tab bar */}
            <div className="flex gap-1 mb-5 p-1 bg-white/5 rounded-xl border border-white/10">
                {[
                    { id: 'list',  label: 'Reviews',       icon: MessageSquare, badge: reviews.length },
                    { id: 'write', label: 'Write a Review', icon: PenLine },
                ].map(({ id, label, icon: Icon, badge }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setTab(id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            tab === id
                                ? 'bg-[#d4af37] text-[#020617] shadow-md'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                        {badge > 0 && (
                            <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold ${
                                tab === id ? 'bg-[#020617]/25 text-[#020617]' : 'bg-[#d4af37]/20 text-[#d4af37]'
                            }`}>
                {badge}
              </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Reviews list tab */}
            {tab === 'list' && (
                <div>
                    {loading ? (
                        <div className="flex flex-col items-center py-12 gap-3 text-gray-500">
                            <Loader2 className="w-6 h-6 animate-spin text-[#d4af37]" />
                            <span className="text-sm">Loading reviews…</span>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="flex flex-col items-center py-12 gap-3 text-center">
                            <div className="w-14 h-14 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
                                <Star className="w-7 h-7 text-[#d4af37]" />
                            </div>
                            <div>
                                <p className="text-white font-semibold">No reviews yet</p>
                                <p className="text-gray-500 text-sm mt-1">
                                    Be the first to review <span className="text-[#d4af37]">{projectName ?? 'this project'}</span>!
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setTab('write')}
                                className="mt-1 px-6 py-2 rounded-full bg-[#d4af37] text-[#020617] text-sm font-bold
                           hover:-translate-y-0.5 transition-all hover:shadow-lg hover:shadow-[#d4af37]/25"
                            >
                                Write the first review
                            </button>
                        </div>
                    ) : (
                        <>
                            <RatingSummary reviews={reviews} />
                            <div
                                className="space-y-3 max-h-72 overflow-y-auto pr-1"
                                style={{ scrollbarWidth: 'thin', scrollbarColor: '#d4af37 transparent' }}
                            >
                                {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
                            </div>
                            <button
                                type="button"
                                onClick={() => setTab('write')}
                                className="mt-4 w-full py-2.5 rounded-xl border border-[#d4af37]/40 text-[#d4af37] text-sm font-semibold
                           flex items-center justify-center gap-2 hover:bg-[#d4af37]/10 transition-all"
                            >
                                <PenLine className="w-4 h-4" /> Add your review
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Write review tab */}
            {tab === 'write' && (
                <WriteReviewForm
                    projectId={projectId}
                    onSubmitted={handleNew}
                    onBack={() => setTab('list')}
                />
            )}
        </div>
    );
}

// ─── Modal trigger + overlay ──────────────────────────────────────────────────
export function ProjectReviewsModal({ projectId, projectName }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Card button */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#d4af37]
                   border border-[#d4af37]/35 rounded-full px-3.5 py-1.5
                   hover:bg-[#d4af37]/10 hover:border-[#d4af37]/60 transition-all"
            >
                <Star className="w-3.5 h-3.5 fill-[#d4af37]" />
                Ratings &amp; Reviews
            </button>

            {/* Full modal */}
            {open && (
                <div
                    className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-6"
                    style={{ background: 'rgba(2,6,23,0.92)', backdropFilter: 'blur(8px)' }}
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="relative w-full sm:max-w-lg bg-[#0b1120] border border-white/10
                       rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
                            <div>
                                <h3 className="font-bold text-white text-base leading-tight">
                                    {projectName ?? 'Project'}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">Customer Ratings &amp; Reviews</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center
                           text-gray-400 hover:text-white hover:bg-white/20 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Scrollable body */}
                        <div className="px-6 py-5 overflow-y-auto max-h-[80vh]">
                            <ReviewsPanel projectId={projectId} projectName={projectName} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ProjectReviewsModal;

/* ─────────────────────────────────────────────────────────────────────────────
   INTEGRATION — ProjectSection.js
   ─────────────────────────────────────────────────────────────────────────────

   1. Add import at top:
        import { ProjectReviewsModal } from '@/components/ProjectReviews';

   2. Inside <ProjectCard>, at the end of the card body:
        <div className="mt-4 flex justify-end">
          <ProjectReviewsModal
            projectId={project.id}
            projectName={project.name}
          />
        </div>

   ─────────────────────────────────────────────────────────────────────────────
   BACKEND API SHAPE
   ─────────────────────────────────────────────────────────────────────────────

   GET  /api/reviews?project_id=<id>
   → { data: [{ id, project_id, user_name, rating, comment, timestamp }] }

   POST /api/reviews
   Body: { project_id, user_name, rating, comment }
   → { data: { id, project_id, user_name, rating, comment, timestamp } }
   ───────────────────────────────────────────────────────────────────────────── */