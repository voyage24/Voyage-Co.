"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

export type ReviewItem = { id: string; authorName: string; rating: number; comment: string; createdAt: string | Date };

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} className={i <= value ? "text-gold fill-gold" : "text-line"} />
      ))}
    </span>
  );
}

export default function ReviewsSection({
  type, itemId, reviews,
}: {
  type: string; itemId: string; reviews: ReviewItem[];
}) {
  const [canReview, setCanReview] = useState(false);
  useEffect(() => {
    fetch("/api/account/me").then(r => r.json()).then(d => setCanReview(!!d.customer)).catch(() => {});
  }, []);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setError("");
    if (rating < 1) { setError("Please choose a rating."); return; }
    setSending(true);
    const res = await fetch("/api/reviews", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, itemId, rating, comment }),
    });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    if (res.ok) { setDone(true); setComment(""); setRating(0); }
    else setError(data.error ?? "Could not submit your review.");
  };

  return (
    <div className="border-t border-line pt-8 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-serif text-2xl font-light text-ink">Guest Reviews</h2>
        {reviews.length > 0 && (
          <span className="flex items-center gap-1.5 text-sm text-ink-muted">
            <Stars value={Math.round(avg)} /> {avg.toFixed(1)} · {reviews.length}
          </span>
        )}
      </div>

      {reviews.length === 0 && <p className="text-sm text-ink-muted font-light mb-6">No reviews yet — be the first to share your experience.</p>}

      <div className="space-y-5 mb-8">
        {reviews.map(r => (
          <div key={r.id} className="bg-panel-soft border border-line rounded-xl p-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-ink">{r.authorName}</span>
              <Stars value={r.rating} size={13} />
            </div>
            <p className="text-sm text-ink-muted font-light leading-relaxed">{r.comment}</p>
          </div>
        ))}
      </div>

      {/* Submission */}
      {done ? (
        <p className="text-sm text-gold">Thank you — your review has been submitted and will appear once approved.</p>
      ) : canReview ? (
        <form onSubmit={submit} className="bg-panel border border-line rounded-xl p-5 space-y-3 max-w-xl">
          <p className="text-sm font-medium text-ink">Write a review</p>
          <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map(i => (
              <button key={i} type="button" aria-label={`${i} star${i > 1 ? "s" : ""}`}
                onMouseEnter={() => setHover(i)} onClick={() => setRating(i)} className="p-0.5">
                <Star size={22} className={i <= (hover || rating) ? "text-gold fill-gold" : "text-line"} />
              </button>
            ))}
          </div>
          <textarea
            value={comment} onChange={e => setComment(e.target.value)} rows={3}
            placeholder="Tell others about your experience…"
            className="w-full px-3 py-2.5 rounded-sm bg-panel-soft border border-line text-sm text-ink focus:outline-none focus:border-gold"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={sending} className="px-5 py-2.5 bg-ink hover:bg-ink/90 disabled:opacity-50 text-page text-xs tracking-[0.14em] uppercase rounded-sm transition-colors">
            {sending ? "Submitting…" : "Submit review"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-ink-muted font-light">
          <a href="/login" className="text-gold link-underline">Sign in</a> to leave a review.
        </p>
      )}
    </div>
  );
}
