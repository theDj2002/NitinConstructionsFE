/**
 * NKP Constructions – Project Reviews
 *
 * Fixes & features:
 *  1. NO FLICKER — modal stays mounted (opacity toggle, not unmount/remount).
 *     Reviews fetched once on card load, never refetched on modal open/close.
 *  2. INLINE CARD PREVIEW — top 3 reviews (rating ≥4★) shown below each card.
 *     If more than 3, a "+N more" link opens the modal.
 *  3. ADD REVIEW BUTTON — gold pill directly on the card, opens modal on Write tab.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { reviewsApi } from '@/services/api';
import {
    Star, MessageSquare, Send, Loader2,
    X, CheckCircle, PenLine, ChevronLeft, Plus
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(ts) {
    if (!ts) return '';
    return new Date(ts).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
    });
}

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ value, onChange, readOnly = false, size = 'md' }) {
    const [hover, setHover] = useState(0);
    const dim = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7' }[size] ?? 'w-5 h-5';

    return (
        <div className="flex gap-0.5" onMouseLeave={() => !readOnly && setHover(0)}>
            {[1, 2, 3, 4, 5].map((s) => (
                <button
                    key={s}
                    type="button"
                    disabled={readOnly}
                    onClick={() => onChange?.(s)}
                    onMouseEnter={() => !readOnly && setHover(s)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: readOnly ? 'default' : 'pointer' }}
                    className={`transition-transform duration-100 ${!readOnly ? 'hover:scale-125' : ''}`}
                >
                    <Star className={`${dim} transition-colors duration-100 ${
                        (hover || value) >= s ? 'text-[#d4af37] fill-[#d4af37]' : 'text-gray-600'
                    }`} />
                </button>
            ))}
        </div>
    );
}

// ─── Rating bar chart (inside modal) ─────────────────────────────────────────
function RatingSummary({ reviews }) {
    const avg = reviews.length
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    const counts = [5, 4, 3, 2, 1].map((star) => ({
        star, count: reviews.filter((r) => r.rating === star).length,
    }));

    return (
        <div className="flex gap-5 items-center mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
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

// ─── Full review card (modal list) ────────────────────────────────────────────
function ReviewCard({ review }) {
    const name    = review.userName ?? review.user_name ?? 'Anonymous';
    const initial = name[0]?.toUpperCase() ?? '?';
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#d4af37]/15 flex items-center justify-center text-[#d4af37] flex-shrink-0 text-sm font-bold">
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
            <p className="text-sm text-gray-300 leading-relaxed pl-10">"{review.comment}"</p>
        </div>
    );
}

// ─── Mini review card (inline on the project card) ────────────────────────────
function MiniReviewCard({ review }) {
    const name = review.userName ?? review.user_name ?? 'Anonymous';
    return (
        <div className="flex gap-2 items-start py-2 border-t border-border/40 first:border-t-0">
            <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center text-gold text-[10px] font-bold flex-shrink-0 mt-0.5">
                {name[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-foreground">{name}</span>
                    <StarRating value={review.rating} readOnly size="sm" />
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 italic leading-relaxed">
                    "{review.comment}"
                </p>
            </div>
        </div>
    );
}

// ─── Write Review Form ────────────────────────────────────────────────────────
function WriteReviewForm({ projectId, onSubmitted, onBack }) {
    const [form, setForm]       = useState({ user_name: '', rating: 5, comment: '' });
    const [busy, setBusy]       = useState(false);
    const [error, setError]     = useState('');
    const [success, setSuccess] = useState(false);
    const nameRef = useRef(null);

    useEffect(() => {
        const t = setTimeout(() => nameRef.current?.focus(), 150);
        return () => clearTimeout(t);
    }, []);

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

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <div>
                    <h4 className="text-white font-bold text-lg">Thank you!</h4>
                    <p className="text-gray-400 text-sm mt-1">Your review has been submitted.</p>
                </div>
                <button
                    type="button"
                    onClick={() => { setSuccess(false); onBack?.(); }}
                    className="flex items-center gap-1 text-[#d4af37] text-sm font-semibold hover:underline"
                >
                    <ChevronLeft className="w-4 h-4" /> View all reviews
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {onBack && (
                <button type="button" onClick={onBack}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5" /> Back to reviews
                </button>
            )}
            <p className="text-gray-400 text-sm">Share your honest experience!</p>

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

            <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                    Rating <span className="text-[#d4af37]">*</span>
                </label>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#020617] border border-white/10">
                    <StarRating value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} size="lg" />
                    {form.rating > 0 && (
                        <span className="text-[#d4af37] text-sm font-bold">{RATING_LABELS[form.rating]}</span>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                    Review <span className="text-[#d4af37]">*</span>
                </label>
                <textarea
                    rows={4}
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    placeholder="Quality, timeline, communication — share it all!"
                    className="w-full px-4 py-3 rounded-xl bg-[#020617] border border-white/10 text-sm text-white
                               placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/60
                               focus:ring-2 focus:ring-[#d4af37]/20 transition-all resize-none"
                />
                <p className="text-[10px] text-gray-600 mt-1 text-right">{form.comment.length} / 2000</p>
            </div>

            {error && (
                <div className="px-4 py-2.5 rounded-xl bg-red-900/20 border border-red-500/20 text-red-400 text-xs">
                    ⚠ {error}
                </div>
            )}

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

// ─── Reviews Panel (tabs) ─────────────────────────────────────────────────────
function ReviewsPanel({ projectId, projectName, initialTab, reviews, loading, onNewReview }) {
    const [tab, setTab] = useState(initialTab);

    // Sync tab when modal opens with a different initialTab
    useEffect(() => { setTab(initialTab); }, [initialTab]);

    const handleNew = (review) => {
        onNewReview(review);
        setTab('list');
    };

    return (
        <div>
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
                        {id === 'list' && badge > 0 && (
                            <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold ${
                                tab === id ? 'bg-[#020617]/25 text-[#020617]' : 'bg-[#d4af37]/20 text-[#d4af37]'
                            }`}>{badge}</span>
                        )}
                    </button>
                ))}
            </div>

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
                                    Be the first to review{' '}
                                    <span className="text-[#d4af37]">{projectName ?? 'this project'}</span>!
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
                                className="space-y-3 max-h-64 overflow-y-auto pr-1"
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

// ─── Main Export ──────────────────────────────────────────────────────────────
export function ProjectReviewsSection({ projectId, projectName }) {
    const [reviews, setReviews]     = useState([]);
    const [loading, setLoading]     = useState(true);
    const [open, setOpen]           = useState(false);
    const [initialTab, setInitialTab] = useState('list');
    const fetchedRef = useRef(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await reviewsApi.getByProject(projectId);
            setReviews(res.data || []);
        } catch {
            setReviews([]);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    // Fetch ONCE on mount — not on every modal open (this is what caused the flicker)
    useEffect(() => {
        if (!fetchedRef.current) {
            fetchedRef.current = true;
            load();
        }
    }, [load]);

    const handleNewReview = (review) => {
        setReviews((prev) => [review, ...prev]);
    };

    const openModal = (tab = 'list') => {
        setInitialTab(tab);
        setOpen(true);
    };

    // Top 3 reviews rated 4★ or above for inline display
    const topReviews = reviews.filter((r) => r.rating >= 4).slice(0, 3);
    const avg = reviews.length
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

    return (
        <>
            {/* ── Inline card section ──────────────────────────────────── */}
            <div className="mt-4 pt-3 border-t border-border">

                {/* Row: stars summary + action buttons */}
                <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                        {loading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />
                        ) : reviews.length > 0 ? (
                            <>
                                <StarRating value={Math.round(avg)} readOnly size="sm" />
                                <span className="text-[11px] text-muted-foreground">
                                    {avg.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                                </span>
                            </>
                        ) : (
                            <span className="text-[11px] text-muted-foreground italic">No reviews yet</span>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* ➕ Add Review */}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openModal('write'); }}
                            className="flex items-center gap-1 text-[10px] font-bold text-[#020617]
                                       bg-[#d4af37] rounded-full px-2.5 py-1 leading-none
                                       hover:bg-[#c9a227] active:scale-95 transition-all"
                        >
                            <Plus className="w-3 h-3" />
                            Review
                        </button>

                        {/* View all (only if reviews exist) */}
                        {!loading && reviews.length > 0 && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); openModal('list'); }}
                                className="flex items-center gap-1 text-[10px] font-semibold text-[#d4af37]
                                           border border-[#d4af37]/40 rounded-full px-2.5 py-1 leading-none
                                           hover:bg-[#d4af37]/10 active:scale-95 transition-all"
                            >
                                <MessageSquare className="w-3 h-3" />
                                All {reviews.length}
                            </button>
                        )}
                    </div>
                </div>

                {/* Top 3 inline mini-reviews */}
                {!loading && topReviews.length > 0 && (
                    <div>
                        {topReviews.map((r) => (
                            <MiniReviewCard key={r.id} review={r} />
                        ))}
                        {reviews.length > 3 && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); openModal('list'); }}
                                className="mt-1.5 text-[10px] text-[#d4af37] font-semibold hover:underline"
                            >
                                +{reviews.length - 3} more reviews →
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ── Modal — kept mounted, toggled with opacity/pointer-events ── */}
            <div
                className={`fixed inset-0 z-[9999] flex items-end sm:items-center justify-center
                            p-0 sm:p-6 transition-opacity duration-300 ${
                    open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                style={{ background: 'rgba(2,6,23,0.92)', backdropFilter: 'blur(8px)' }}
                onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            >
                <div
                    className={`relative w-full sm:max-w-lg bg-[#0b1120] border border-white/10
                                rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden
                                transition-transform duration-300 ${
                        open ? 'translate-y-0' : 'translate-y-6 sm:translate-y-4'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
                        <div>
                            <h3 className="font-bold text-white text-base leading-tight">
                                {projectName ?? 'Project'}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">Customer Ratings & Reviews</p>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
                            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center
                                       text-gray-400 hover:text-white hover:bg-white/20 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="px-6 py-5 overflow-y-auto max-h-[80vh]">
                        <ReviewsPanel
                            projectId={projectId}
                            projectName={projectName}
                            initialTab={initialTab}
                            reviews={reviews}
                            loading={loading}
                            onNewReview={handleNewReview}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

// Backwards-compat alias (ProjectSection.js imports this name)
export function ProjectReviewsModal(props) {
    return <ProjectReviewsSection {...props} />;
}

export default ProjectReviewsSection;