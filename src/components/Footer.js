import { ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer data-testid="footer" className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gold font-heading font-bold text-lg">NKP</span>
            <span className="font-heading font-semibold text-foreground text-sm">Construction</span>
          </div>

          <p className="text-muted-foreground text-sm text-center">
            &copy; {new Date().getFullYear()} NKP Construction. All rights reserved.
          </p>

          <button
            data-testid="scroll-to-top"
            onClick={scrollToTop}
            className="p-2 rounded-full bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
