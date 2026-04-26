/**
 * NKP Constructions – Project Reviews
 *
 * Fully theme-aware (light + dark) using CSS custom properties from App.css.
 * Modal rendered via React Portal so it escapes card stacking contexts on mobile.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
                        (hover || value) >= s ? 'text-[#d4af37] fill-[#d4af37]' : 'text-muted-foreground'
                    }`} />
                </button>
            ))}
        </div>
    );
}

// ─── Rating Summary Bar ───────────────────────────────────────────────────────
function RatingSummary({ reviews }) {
    const avg = reviews.length
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    const counts = [5, 4, 3, 2, 1].map((star) => ({
        star, count: reviews.filter((r) => r.rating === star).length,
    }));

    return (
        <div className="flex gap-5 items-center mb-4 p-4 rounded-xl bg-muted/50 border border-border">
            <div className="text-center flex-shrink-0">
                <div className="text-4xl font-black text-[#d4af37] leading-none">
                    {avg > 0 ? avg.toFixed(1) : '—'}
                </div>
                <div className="mt-1"><StarRating value={Math.round(avg)} readOnly size="sm" /></div>
                <p className="text-[10px] text-muted-foreground mt-1">
                    {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </p>
            </div>
            <div className="flex-1 space-y-1.5">
                {counts.map(({ star, count }) => {
                    const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                    return (
                        <div key={star} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="w-3 text-right">{star}</span>
                            <Star className="w-3 h-3 text-[#d4af37] fill-[#d4af37] flex-shrink-0" />
                            <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
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

// ─── Full review card (inside modal list) ─────────────────────────────────────
function ReviewCard({ review }) {
    const name    = review.userName ?? review.user_name ?? 'Anonymous';
    const initial = name[0]?.toUpperCase() ?? '?';
    return (
        <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#d4af37]/15 flex items-center justify-center text-[#d4af37] flex-shrink-0 text-sm font-bold">
                        {initial}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground leading-none">{name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                            {formatDate(review.createdAt ?? review.timestamp)}
                        </p>
                    </div>
                </div>
                <StarRating value={review.rating} readOnly size="sm" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed pl-10">"{review.comment}"</p>
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
                    <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div>
                    <h4 className="text-foreground font-bold text-lg">Thank you!</h4>
                    <p className="text-muted-foreground text-sm mt-1">Your review has been submitted.</p>
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
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5" /> Back to reviews
                </button>
            )}
            <p className="text-muted-foreground text-sm">Share your honest experience!</p>

            <div>
                <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                    Your Name <span className="text-[#d4af37]">*</span>
                </label>
                <input
                    ref={nameRef}
                    type="text"
                    value={form.user_name}
                    onChange={(e) => setForm({ ...form, user_name: e.target.value })}
                    placeholder="e.g. Ravi Shankar"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm
                               placeholder:text-muted-foreground focus:outline-none focus:border-[#d4af37]/60
                               focus:ring-2 focus:ring-[#d4af37]/20 transition-all"
                />
            </div>

            <div>
                <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                    Rating <span className="text-[#d4af37]">*</span>
                </label>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background">
                    <StarRating value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} size="lg" />
                    {form.rating > 0 && (
                        <span className="text-[#d4af37] text-sm font-bold">{RATING_LABELS[form.rating]}</span>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                    Review <span className="text-[#d4af37]">*</span>
                </label>
                <textarea
                    rows={4}
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    placeholder="Quality, timeline, communication — share it all!"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm
                               placeholder:text-muted-foreground focus:outline-none focus:border-[#d4af37]/60
                               focus:ring-2 focus:ring-[#d4af37]/20 transition-all resize-none"
                />
                <p className="text-[10px] text-muted-foreground mt-1 text-right">{form.comment.length} / 2000</p>
            </div>

            {error && (
                <div className="px-4 py-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                    ⚠ {error}
                </div>
            )}

            <button
                type="button"
                onClick={submit}
                disabled={busy}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2
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

    useEffect(() => { setTab(initialTab); }, [initialTab]);

    const handleNew = (review) => {
        onNewReview(review);
        setTab('list');
    };

    return (
        <div>
            {/* Tab bar */}
            <div className="flex gap-1 mb-5 p-1 bg-muted/50 rounded-xl border border-border">
                {[
                    { id: 'list',  label: 'Reviews',        icon: MessageSquare, badge: reviews.length },
                    { id: 'write', label: 'Write a Review',  icon: PenLine },
                ].map(({ id, label, icon: Icon, badge }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setTab(id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            tab === id
                                ? 'bg-[#d4af37] text-white shadow-md'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                        {id === 'list' && badge > 0 && (
                            <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold ${
                                tab === id
                                    ? 'bg-white/25 text-white'
                                    : 'bg-[#d4af37]/20 text-[#d4af37]'
                            }`}>{badge}</span>
                        )}
                    </button>
                ))}
            </div>

            {tab === 'list' && (
                <div>
                    {loading ? (
                        <div className="flex flex-col items-center py-12 gap-3 text-muted-foreground">
                            <Loader2 className="w-6 h-6 animate-spin text-[#d4af37]" />
                            <span className="text-sm">Loading reviews…</span>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="flex flex-col items-center py-12 gap-3 text-center">
                            <div className="w-14 h-14 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
                                <Star className="w-7 h-7 text-[#d4af37]" />
                            </div>
                            <div>
                                <p className="text-foreground font-semibold">No reviews yet</p>
                                <p className="text-muted-foreground text-sm mt-1">
                                    Be the first to review{' '}
                                    <span className="text-[#d4af37]">{projectName ?? 'this project'}</span>!
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setTab('write')}
                                className="mt-1 px-6 py-2 rounded-full bg-[#d4af37] text-white text-sm font-bold
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

// ─── Portal Modal ─────────────────────────────────────────────────────────────
// Uses createPortal → document.body to escape card stacking contexts on mobile.
// All colors use CSS variables so light/dark theme works automatically.
function ReviewModal({ open, onClose, projectId, projectName, initialTab, reviews, loading, onNewReview }) {
    // Lock body scroll when open
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);

    return createPortal(
        <>
            {/*
              * Inject theme-aware CSS for the modal panel.
              * We use hsl(var(--xxx)) so the variables from App.css apply
              * automatically when the .dark class toggles on <html>.
              */}
            <style>{`
                .nkp-review-modal-backdrop {
                    position: fixed;
                    inset: 0;
                    z-index: 99999;
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(6px);
                    -webkit-backdrop-filter: blur(6px);
                    transition: opacity 250ms ease;
                }
                .nkp-review-modal-panel {
                    position: relative;
                    width: 100%;
                    background: hsl(var(--card));
                    border: 1px solid hsl(var(--border));
                    border-radius: 1.5rem 1.5rem 0 0;
                    box-shadow: 0 -8px 40px rgba(0,0,0,0.25);
                    display: flex;
                    flex-direction: column;
                    max-height: 92vh;
                    overflow: hidden;
                    transition: transform 300ms cubic-bezier(0.34,1.15,0.64,1);
                }
                .nkp-review-modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1.25rem 1.5rem 1rem;
                    border-bottom: 1px solid hsl(var(--border));
                    flex-shrink: 0;
                }
                .nkp-review-modal-title {
                    font-weight: 700;
                    color: hsl(var(--foreground));
                    font-size: 0.9375rem;
                    line-height: 1.3;
                    margin: 0;
                }
                .nkp-review-modal-subtitle {
                    font-size: 0.75rem;
                    color: hsl(var(--muted-foreground));
                    margin-top: 0.2rem;
                }
                .nkp-review-modal-close {
                    flex-shrink: 0;
                    width: 2.25rem;
                    height: 2.25rem;
                    border-radius: 50%;
                    background: hsl(var(--muted));
                    border: 1px solid hsl(var(--border));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: hsl(var(--muted-foreground));
                    transition: background 150ms, color 150ms;
                    -webkit-tap-highlight-color: transparent;
                    touch-action: manipulation;
                }
                .nkp-review-modal-close:hover {
                    background: hsl(var(--accent));
                    color: hsl(var(--foreground));
                }
                .nkp-review-modal-body {
                    padding: 1.25rem 1.5rem;
                    overflow-y: auto;
                    flex: 1;
                }
                @media (min-width: 640px) {
                    .nkp-review-modal-backdrop {
                        align-items: center;
                        padding: 1.5rem;
                    }
                    .nkp-review-modal-panel {
                        max-width: 32rem;
                        border-radius: 1rem;
                        box-shadow: 0 25px 50px rgba(0,0,0,0.3);
                    }
                }
            `}</style>

            <div
                className="nkp-review-modal-backdrop"
                style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
                onClick={onClose}
            >
                <div
                    className="nkp-review-modal-panel"
                    style={{ transform: open ? 'translateY(0)' : 'translateY(2rem)' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="nkp-review-modal-header">
                        <div>
                            <h3 className="nkp-review-modal-title">{projectName ?? 'Project'}</h3>
                            <p className="nkp-review-modal-subtitle">Customer Ratings & Reviews</p>
                        </div>
                        <button
                            type="button"
                            className="nkp-review-modal-close"
                            onClick={(e) => { e.stopPropagation(); onClose(); }}
                            aria-label="Close reviews"
                        >
                            <X style={{ width: '1rem', height: '1rem' }} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="nkp-review-modal-body">
                        <ReviewsPanel
                            projectId={projectId}
                            projectName={projectName}
                            initialTab={initialTab}
                            reviews={reviews}
                            loading={loading}
                            onNewReview={onNewReview}
                        />
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function ProjectReviewsSection({ projectId, projectName }) {
    const [reviews, setReviews]       = useState([]);
    const [loading, setLoading]       = useState(true);
    const [open, setOpen]             = useState(false);
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

    useEffect(() => {
        if (!fetchedRef.current) {
            fetchedRef.current = true;
            load();
        }
    }, [load]);

    const handleNewReview = (review) => setReviews((prev) => [review, ...prev]);
    const openModal  = (tab = 'list') => { setInitialTab(tab); setOpen(true); };
    const closeModal = useCallback(() => setOpen(false), []);

    const topReviews = reviews.filter((r) => r.rating >= 4).slice(0, 3);
    const avg = reviews.length
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

    return (
        <>
            {/* ── Inline card section ────────────────────────────────── */}
            <div className="mt-4 pt-3 border-t border-border">
                <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                        {loading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d4af37]" />
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
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openModal('write'); }}
                            className="flex items-center gap-1 text-[10px] font-bold text-white
                                       bg-[#d4af37] rounded-full px-2.5 py-1 leading-none
                                       hover:bg-[#c9a227] active:scale-95 transition-all"
                        >
                            <Plus className="w-3 h-3" />
                            Review
                        </button>

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

                {!loading && topReviews.length > 0 && (
                    <div>
                        {topReviews.map((r) => <MiniReviewCard key={r.id} review={r} />)}
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

            {/* ── Portal Modal ── */}
            <ReviewModal
                open={open}
                onClose={closeModal}
                projectId={projectId}
                projectName={projectName}
                initialTab={initialTab}
                reviews={reviews}
                loading={loading}
                onNewReview={handleNewReview}
            />
        </>
    );
}

export function ProjectReviewsModal(props) {
    return <ProjectReviewsSection {...props} />;
}

export default ProjectReviewsSection;