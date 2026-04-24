import { useState, useEffect } from 'react';
import LOGO_SRC from "./assets/NKP-GOLDEN-IMAGE.png";
/**
 * NKP Constructions – Intro Animation
 *
 * Usage in App.js:
 *   import IntroAnimation from '@/components/IntroAnimation';
 *
 *   function App() {
 *     return (
 *       <>
 *         <IntroAnimation />
 *         <ThemeProvider> ... rest of your app ... </ThemeProvider>
 *       </>
 *     );
 *   }
 *
 * The animation plays once per session (sessionStorage flag).
 * It fades out after ~6 s and unmounts completely so it never
 * blocks interactions with the rest of the site.
 */

// const LOGO_SRC = './'; // put the logo in /public/

export default function IntroAnimation() {
  const [phase, setPhase] = useState('visible'); // 'visible' | 'fading' | 'done'

  useEffect(() => {
    // Skip if already played this session
    if (sessionStorage.getItem('nkp_intro_done')) {
      setPhase('done');
      return;
    }

    // Begin fade-out at 5.5 s
    const fadeTimer = setTimeout(() => setPhase('fading'), 5500);
    // Unmount at 6.8 s (after CSS transition finishes)
    const doneTimer = setTimeout(() => {
      setPhase('done');
      sessionStorage.setItem('nkp_intro_done', '1');
    }, 6800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <>
      {/* ── Keyframes injected via a <style> tag so this component is self-contained ── */}
      <style>{`
        @keyframes nkp-zoom-in {
          0%   { transform: scale(0.15); opacity: 0; }
          60%  { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(1);    opacity: 1; }
        }
        @keyframes nkp-float {
          0%, 100% { transform: translateY(0px);   }
          50%       { transform: translateY(-14px); }
        }
        @keyframes nkp-spin-cw {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @keyframes nkp-spin-ccw {
          from { transform: rotate(360deg); }
          to   { transform: rotate(0deg);   }
        }
        @keyframes nkp-pulse-text {
          0%, 100% { opacity: 1;   }
          50%       { opacity: 0.4; }
        }
        @keyframes nkp-shimmer {
          0%   { left: -80%; }
          100% { left: 160%; }
        }
        @keyframes nkp-particle {
          0%   { transform: translateY(0)   scale(1);   opacity: 0.8; }
          100% { transform: translateY(-90px) scale(0); opacity: 0;   }
        }

        .nkp-intro-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(ellipse at 50% 40%, #1a1200 0%, #020617 70%);
          transition: opacity 1.3s ease, visibility 1.3s ease;
        }
        .nkp-intro-overlay.fading {
          opacity: 0;
          visibility: hidden;
        }

        /* Logo wrapper */
        .nkp-logo-wrap {
          position: relative;
          width: clamp(240px, 40vw, 400px);
          height: clamp(240px, 40vw, 400px);
          animation: nkp-zoom-in 1.2s cubic-bezier(.22,1,.36,1) forwards;
        }

        /* Floating logo image */
        .nkp-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 50%;
          filter: drop-shadow(0 0 30px rgba(212,175,55,0.55));
          animation: nkp-float 3.2s ease-in-out 1.2s infinite;
        }

        /* Outer gold ring */
        .nkp-ring-1 {
          position: absolute;
          inset: -22px;
          border-radius: 50%;
          border: 4px solid rgba(212,175,55,0.75);
          animation: nkp-spin-cw 10s linear infinite;
        }
        /* Dashed white ring */
        .nkp-ring-2 {
          position: absolute;
          inset: -44px;
          border-radius: 50%;
          border: 2px dashed rgba(255,255,255,0.25);
          animation: nkp-spin-ccw 16s linear infinite;
        }
        /* Thin accent ring */
        .nkp-ring-3 {
          position: absolute;
          inset: -66px;
          border-radius: 50%;
          border: 1px solid rgba(212,175,55,0.2);
          animation: nkp-spin-cw 24s linear infinite;
        }

        /* Shimmer stripe over the logo */
        .nkp-shimmer-wrap {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          overflow: hidden;
          pointer-events: none;
        }
        .nkp-shimmer {
          position: absolute;
          top: -20%;
          width: 35%;
          height: 140%;
          background: linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%);
          animation: nkp-shimmer 2.4s ease-in-out 1.4s infinite;
          transform: skewX(-15deg);
        }

        /* Particles */
        .nkp-particles {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          pointer-events: none;
        }
        .nkp-particle {
          position: absolute;
          bottom: 50%;
          left: 50%;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(212,175,55,0.9);
          animation: nkp-particle 2s ease-out infinite;
          opacity: 0;
        }

        /* Tagline */
        .nkp-tagline {
          position: absolute;
          bottom: -88px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          color: #f8fafc;
          font-family: 'Trebuchet MS', Arial, sans-serif;
          font-size: clamp(11px, 1.5vw, 16px);
          letter-spacing: 0.35em;
          text-transform: uppercase;
          font-weight: 600;
          animation: nkp-pulse-text 2s ease-in-out 1.2s infinite;
        }

        /* NKP company name above logo */
        .nkp-company-name {
          position: absolute;
          top: -72px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          font-family: 'Georgia', serif;
          font-size: clamp(22px, 3.5vw, 38px);
          font-weight: 700;
          letter-spacing: 0.18em;
          background: linear-gradient(135deg, #d4af37, #f5d97a, #caa64b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: nkp-zoom-in 1.4s cubic-bezier(.22,1,.36,1) forwards;
        }
      `}</style>

      <div className={`nkp-intro-overlay${phase === 'fading' ? ' fading' : ''}`}>
        <div className="nkp-logo-wrap">
          {/* Rings */}
          <div className="nkp-ring-1" />
          <div className="nkp-ring-2" />
          <div className="nkp-ring-3" />

          {/* Company name */}
          <div className="nkp-company-name">NKP CONSTRUCTIONS</div>

          {/* Logo */}
          <img className="nkp-logo-img" src={LOGO_SRC} alt="NKP Logo" />

          {/* Shimmer */}
          <div className="nkp-shimmer-wrap">
            <div className="nkp-shimmer" />
          </div>

          {/* Floating gold particles */}
          <div className="nkp-particles">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="nkp-particle"
                style={{
                  left: `${30 + Math.random() * 40}%`,
                  animationDelay: `${i * 0.28}s`,
                  animationDuration: `${1.8 + Math.random() * 0.8}s`,
                  width: `${3 + Math.random() * 4}px`,
                  height: `${3 + Math.random() * 4}px`,
                }}
              />
            ))}
          </div>

          {/* Tagline */}
          <div className="nkp-tagline">Building a Stronger Future</div>
        </div>
      </div>
    </>
  );
}
