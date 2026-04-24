import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import ProjectsSection from '@/components/ProjectSection';
import AboutSection from '@/components/AboutSection';
import CTASection from '@/components/CTASection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import AdminDashboard from '@/pages/AdminDashboard';
import ReviewsSection from '@/components/ReviewsSection';

// ─── NEW: Intro Animation ──────────────────────────────────────────────────
import IntroAnimation from '@/components/IntroAnimation';

function LandingPage() {
    return (
        <>
            <HeroSection />
            <ServicesSection />
            <ProjectsSection />
            <AboutSection />
            <ReviewsSection />
            <CTASection />
            <ContactSection />
            <Footer />
        </>
    );
}

function App() {
    return (
        <>
            {/*
             * IntroAnimation sits OUTSIDE ThemeProvider / BrowserRouter so it
             * renders on top of everything. It plays once per session and
             * unmounts itself automatically after ~6.8 s.
             */}
            <IntroAnimation />

            <ThemeProvider>
                <AuthProvider>
                    <BrowserRouter>
                        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
                            <Navbar />
                            <Routes>
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/admin" element={<AdminDashboard />} />
                            </Routes>
                        </div>
                    </BrowserRouter>
                </AuthProvider>
            </ThemeProvider>
        </>
    );
}

export default App;