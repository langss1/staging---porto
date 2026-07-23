"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Lenis from "lenis";
import Hero from "@/components/Hero";
import MShapeSkills from "@/components/MySkills";
import Projects from "@/components/Projects";
import TrophyRoom from "@/components/TrophyRoom";
import Timeline from "@/components/Timeline";
import Impact from "@/components/Impact";
import Summarize from "@/components/Summarize";
import Contact from "@/components/Contact";
import Dock from "@/components/Dock";
import IntroLoader from "@/components/IntroLoader";
import Organization from "@/components/Organization";
import Image from "next/image";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  // Prevent scroll saat loading
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isLoading]);

  // Check if intro has been seen in this session
  useEffect(() => {
    const introSeen = sessionStorage.getItem("introSeen");
    if (introSeen) {
      setIsLoading(false);
    }
  }, []);

  const handleIntroFinish = () => {
    sessionStorage.setItem("introSeen", "true");
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] selection:bg-blue-100 selection:text-blue-900">
      <AnimatePresence mode="wait">
        {isLoading && (
          <IntroLoader key="loader" onFinish={handleIntroFinish} />
        )}
      </AnimatePresence>

      {!isLoading && (
        <>
          {/* Top-Right Navbar & Menu */}
          <div className="fixed top-4 right-4 md:top-6 md:right-8 z-50 flex flex-col gap-2 items-end">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-auto pl-2 pr-4 py-2 md:pl-2.5 md:pr-5 md:py-2.5 bg-[var(--surface)]/30 backdrop-blur-md border border-[var(--border)] rounded-full flex items-center gap-2.5 md:gap-3 pointer-events-auto hover:bg-[var(--surface)]/60 transition-all cursor-pointer shadow-sm"
            >
              <motion.div layoutId="logo-gw" className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden relative shadow-sm shrink-0">
                <Image
                  src="/Logo.jpeg"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <span className="font-semibold text-sm md:text-base text-[var(--text)] display-text tracking-wide">GW.</span>
              <svg className={`w-4 h-4 md:w-4.5 md:h-4.5 text-[var(--text-muted)] transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-[var(--surface)]/95 backdrop-blur-xl border border-[var(--border)] rounded-2xl shadow-xl p-2 flex flex-col min-w-[200px]"
                >
                  {[
                    { label: 'Home', id: 'hero' },
                    { label: 'Skills', id: 'skills' },
                    { label: 'Projects', id: 'projects' },
                    { label: 'Work', id: 'experience' },
                    { label: 'Honors', id: 'honors' },
                    { label: 'Organization', id: 'organization' },
                    { label: 'Impact', id: 'impact' },
                    { label: 'Summary', id: 'summarize' },
                    { label: 'Contact', id: 'contact' },
                  ].map((link) => (
                    <button
                      key={link.id}
                      onClick={() => {
                        document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' });
                        setIsMenuOpen(false);
                      }}
                      className="text-left px-4 py-2.5 text-sm font-semibold text-[var(--text-muted)] hover:text-[#0099ff] hover:bg-blue-50/50 rounded-xl transition-colors"
                    >
                      {link.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Hero />

          <MShapeSkills />
          <Projects />
          <Timeline />
          <TrophyRoom />
          <Organization />
          <Impact />
          <Summarize />
          <Contact />
        </>
      )}
    </main>
  );
}