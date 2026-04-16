import { ArrowRight, Phone } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function CTASection() {
  const { theme } = useTheme();

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section data-testid="cta-section" className="py-24 sm:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`relative overflow-hidden rounded-3xl p-8 sm:p-12 lg:p-16 text-center ${
            theme === 'dark' ? 'glass-dark' : 'glass-light'
          }`}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground">
              Have a project in{' '}
              <span className="text-gradient-gold">mind?</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-base sm:text-lg">
              Let's discuss your next construction project. Our team is ready to bring
              your vision to life with precision and excellence.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                data-testid="cta-contact-button"
                onClick={() => scrollTo('contact')}
                className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-gold text-white font-semibold rounded-full gold-glow transition-all duration-300 hover:shadow-lg"
              >
                Get In Touch
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                data-testid="cta-call-button"
                href="tel:+919876543210"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-border text-foreground font-semibold rounded-full hover:bg-accent transition-all duration-300"
              >
                <Phone className="w-4 h-4" />
                Call Us Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
