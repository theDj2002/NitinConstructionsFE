import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const SECTION_IDS = ['home', 'services', 'works', 'about', 'reviews', 'contact'];

/**
 * useScrollSection
 *
 * 1. On mount (or page refresh): reads window.location.hash and scrolls to
 *    the matching section after the page has painted.
 * 2. While the user scrolls: updates window.location.hash (no push to history)
 *    so that a refresh lands back on the same section.
 */
export function useScrollSection() {
  const { pathname } = useLocation();
  const isLandingPage = pathname === '/';
  const ticking = useRef(false);

  // ── Restore position on mount ────────────────────────────────────────────
  useEffect(() => {
    if (!isLandingPage) return;

    const hash = window.location.hash?.replace('#', '');
    if (!hash || !SECTION_IDS.includes(hash)) return;

    // Wait for the DOM / images to settle before scrolling
    const timer = setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);

    return () => clearTimeout(timer);
  }, [isLandingPage]);

  // ── Track current section → update hash ─────────────────────────────────
  useEffect(() => {
    if (!isLandingPage) return;

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        ticking.current = false;

        // Find which section is most visible in the viewport
        let bestId = SECTION_IDS[0];
        let bestRatio = -1;

        SECTION_IDS.forEach((id) => {
          const el = document.getElementById(id);
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const visible =
            Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
          const ratio = visible / el.offsetHeight;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });

        const newHash = `#${bestId}`;
        if (window.location.hash !== newHash) {
          // Replace state so we don't pollute browser history
          window.history.replaceState(null, '', newHash);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLandingPage]);
}
