import { useState, useEffect } from 'react';
import { reviewsApi } from '@/services/api';
import { Star, User, MessageSquare, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

function RatingStars({ rating, setRating, interactive = false }) {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex gap-1" onMouseLeave={() => interactive && setHover(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => interactive && setRating(star)}
                    onMouseEnter={() => interactive && setHover(star)}
                    className={`${interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'} ${
                        (hover || rating) >= star ? 'text-gold fill-gold' : 'text-muted border-muted'
                    }`}
                >
                    <Star className="w-5 h-5" />
                </button>
            ))}
        </div>
    );
}

function ReviewCard({ review }) {
    return (
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-heading font-bold text-foreground">{review.user_name}</h4>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                            {new Date(review.timestamp).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
                <RatingStars rating={review.rating} />
            </div>
            <div className="relative">
                <MessageSquare className="absolute -top-1 -left-1 w-8 h-8 text-gold/5 -z-0" />
                <p className="text-muted-foreground text-sm italic relative z-10 leading-relaxed">
                    "{review.comment}"
                </p>
            </div>
        </div>
    );
}

export default function ReviewsSection() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ user_name: '', rating: 5, comment: '' });

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        try {
            const res = await reviewsApi.getAll();
            setReviews(res.data || res); // Backend returns data nested or direct depending on wrapper
        } catch (err) {
            console.error('Failed to load reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.user_name || !form.comment) {
            toast.error('Please fill in all fields');
            return;
        }
        setSubmitting(true);
        try {
            const res = await reviewsApi.create(form);
            const newReview = res.data || res;
            setReviews((prev) => [newReview, ...prev]);
            setForm({ user_name: '', rating: 5, comment: '' });
            toast.success('Thank you for your review!');
        } catch (err) {
            toast.error('Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section id="reviews" className="py-24 bg-accent/30 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    
                    {/* Left: Heading & Form */}
                    <div className="lg:col-span-4 space-y-8">
                        <div>
                            <span className="text-gold text-sm font-semibold tracking-[0.2em] uppercase">Testimonials</span>
                            <h2 className="mt-3 text-3xl sm:text-4xl font-heading font-bold text-foreground">
                                What Our Clients Say
                            </h2>
                            <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
                                We take pride in our excellence and client satisfaction. 
                                Leave us a review to share your experience with our services.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="bg-card border border-border p-6 rounded-2xl shadow-xl space-y-4">
                            <h3 className="font-heading font-bold text-lg text-foreground mb-2">Leave a Review</h3>
                            
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    value={form.user_name}
                                    onChange={(e) => setForm({ ...form, user_name: e.target.value })}
                                    placeholder="John Doe"
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold/50 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1.5">Rating</label>
                                <RatingStars rating={form.rating} setRating={(r) => setForm({ ...form, rating: r })} interactive />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-muted-foreground uppercase mb-1.5">Comment</label>
                                <textarea
                                    value={form.comment}
                                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                                    placeholder="Tell us about your project..."
                                    rows={4}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold/50 transition-all resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 bg-gradient-gold text-white font-bold rounded-xl shadow-lg gold-glow flex items-center justify-center gap-2 hover:translate-y-[-2px] active:translate-y-[0px] transition-all disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    </div>

                    {/* Right: Reviews List */}
                    <div className="lg:col-span-8">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-gold" />
                                <p className="text-sm font-medium">Loading testimonials...</p>
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="text-center py-20 bg-card/50 rounded-3xl border border-dashed border-border">
                                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-muted-foreground italic">No reviews yet. Be the first to leave one!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar">
                                {reviews.map((review) => (
                                    <ReviewCard key={review.id} review={review} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
