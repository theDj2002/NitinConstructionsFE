import { ArrowRight, Clock, FolderOpen, ThumbsUp } from 'lucide-react';
import HERO_BG from "./assets/poster-main.png"
// const HERO_BG = 'https://static.prod-images.emergentagent.com/jobs/15f9dbc9-4537-4ac5-a5d0-cb315a4d17fd/images/ae9eaeac7f63926d36ad56e20b3368c0176259604547a837d7776efb5556fa78.png';

const stats = [
  { icon: Clock, value: '14+', label: 'Years Experience' },
  { icon: FolderOpen, value: '120+', label: 'Projects Completed' },
  { icon: ThumbsUp, value: '100%', label: 'Client Satisfaction' },
];

export default function HeroSection() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" data-testid="hero-section" className="relative min-h-screen flex items-center">
      <img
        src={HERO_BG}
        alt="Construction site at golden hour"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="hero-overlay absolute inset-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-3xl">
          <div className="animate-fade-up">
            <span className="inline-block px-4 py-1.5 rounded-full bg-gold/20 text-gold text-xs sm:text-sm font-semibold tracking-wide uppercase border border-gold/30">
              Trusted Infrastructure & Construction Partner
            </span>
          </div>

          <h1 className="animate-fade-up-d1 mt-6 text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-white leading-tight tracking-tight">
            Building a Stronger{' '}
            <span className="text-gradient-gold">Future</span>{' '}
            With Precision
          </h1>

          <p className="animate-fade-up-d2 mt-6 text-base sm:text-lg text-white/70 leading-relaxed max-w-xl">
            From foundation to finish, NKP Construction delivers quality infrastructure,
            excavation, and structural solutions trusted by clients across India since 2019.
          </p>

          <div className="animate-fade-up-d3 mt-8 flex flex-col sm:flex-row gap-4">
            <button
              data-testid="hero-cta-works"
              onClick={() => scrollTo('works')}
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-gold text-white font-semibold rounded-full gold-glow transition-all duration-300 hover:shadow-lg"
            >
              View Our Works
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              data-testid="hero-cta-contact"
              onClick={() => scrollTo('contact')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300"
            >
              Get In Touch
            </button>
          </div>
        </div>

        <div className="mt-16 sm:mt-20 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} data-testid={`hero-stat-${value.replace(/[+%]/g, '')}`} className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <Icon className="w-5 h-5 text-gold hidden sm:block" />
                <span className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-white">{value}</span>
              </div>
              <p className="text-white/50 text-xs sm:text-sm">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
