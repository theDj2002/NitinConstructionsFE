import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, Shield, LogOut, LayoutDashboard, Home, Briefcase, User, Mail } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import AdminModal from '@/components/AdminModal';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const navLinks = [
  { label: 'Home', id: 'home', icon: Home },
  { label: 'Works', id: 'works', icon: Briefcase },
  { label: 'About', id: 'about', icon: User },
  { label: 'Contact', id: 'contact', icon: Mail },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (location.pathname !== '/') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.3 }
    );
    navLinks.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [location.pathname]);

  const scrollTo = (id) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileOpen(false);
  };

  const isHeroVisible = !scrolled && location.pathname === '/';
  const textClass = isHeroVisible ? 'text-white' : 'text-foreground';

  return (
    <>
      <header
        data-testid="navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 lg:h-20">
          <button
            data-testid="navbar-logo"
            onClick={() => scrollTo('home')}
            className="flex items-center gap-1.5"
          >
            <span className="text-gold font-heading font-bold text-xl lg:text-2xl">NKP</span>
            <span className={`font-heading font-semibold text-sm lg:text-base ${textClass} transition-colors duration-300`}>
              Construction
            </span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ label, id }) => (
              <button
                key={id}
                data-testid={`nav-link-${id}`}
                onClick={() => scrollTo(id)}
                className={`text-sm font-medium transition-colors duration-300 ${
                  activeSection === id
                    ? 'text-gold'
                    : `${isHeroVisible ? 'text-white/70 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              data-testid="theme-toggle"
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors duration-300 ${
                isHeroVisible
                  ? 'text-white/80 hover:text-white hover:bg-white/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <button
                    data-testid="admin-dashboard-link"
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 text-gold rounded-full text-sm font-medium hover:bg-gold/20 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </button>
                  <button
                    data-testid="logout-button"
                    onClick={logout}
                    className={`p-2 rounded-full transition-colors ${
                      isHeroVisible ? 'text-white/60 hover:text-white' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  data-testid="admin-button"
                  onClick={() => setShowAdmin(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gold/10 text-gold rounded-full text-sm font-medium hover:bg-gold/20 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </button>
              )}
            </div>

            <button
              data-testid="mobile-menu-button"
              className={`md:hidden p-2 ${textClass} transition-colors`}
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </nav>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent className="w-80 bg-background border-border" data-testid="mobile-menu">
          <SheetHeader>
            <SheetTitle className="text-left">
              <span className="text-gold font-heading font-bold text-xl">NKP</span>{' '}
              <span className="font-heading">Construction</span>
            </SheetTitle>
          </SheetHeader>
          <div className="mt-8 flex flex-col gap-2">
            {navLinks.map(({ label, id }) => (
              <button
                key={id}
                data-testid={`mobile-nav-${id}`}
                onClick={() => scrollTo(id)}
                className={`text-left px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  activeSection === id
                    ? 'text-gold bg-gold/10'
                    : 'text-foreground hover:bg-accent'
                }`}
              >
                {label}
              </button>
            ))}
            <div className="border-t border-border mt-4 pt-4">
              <button
                data-testid="mobile-theme-toggle"
                onClick={toggleTheme}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-accent w-full transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              {isAuthenticated ? (
                <>
                  <button
                    data-testid="mobile-dashboard"
                    onClick={() => { navigate('/admin'); setMobileOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gold hover:bg-gold/10 w-full transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </button>
                  <button
                    data-testid="mobile-logout"
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-destructive hover:bg-destructive/10 w-full transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  data-testid="mobile-admin"
                  onClick={() => { setShowAdmin(true); setMobileOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gold hover:bg-gold/10 w-full transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  Admin
                </button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AdminModal open={showAdmin} onOpenChange={setShowAdmin} />

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md md:hidden z-50">
        <div className="bg-background/80 backdrop-blur-2xl border border-border/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-[2rem] flex items-center justify-around py-3.5 px-2">
          {navLinks.map(({ label, id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`relative flex flex-col items-center gap-1 transition-all duration-300 ${
                activeSection === id
                  ? 'text-gold scale-110'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em]">{label}</span>
              {activeSection === id && (
                <span className="absolute -bottom-1.5 w-1 h-1 bg-gold rounded-full" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
