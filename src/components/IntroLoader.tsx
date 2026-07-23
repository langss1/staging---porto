"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface IntroLoaderProps {
  onFinish: () => void;
}

export default function IntroLoader({ onFinish }: IntroLoaderProps) {
  useEffect(() => {
    // Finish after 2.5 seconds since there is no text anymore
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--bg)] overflow-hidden"
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* Background scribbles in corners */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2, delay: 0.3, ease: "easeInOut" }}
      >
        {/* Top left corner */}
        <svg className="absolute top-4 left-4 w-56 h-56 md:w-72 md:h-72 opacity-70" viewBox="0 0 200 200">
          <motion.path
            d="M 10 120 C 40 50, 120 40, 100 90 C 80 140, 30 160, 60 180 C 90 200, 160 140, 180 90"
            fill="none"
            stroke="var(--brush)"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
          />
        </svg>

        {/* Top right corner */}
        <svg className="absolute top-4 right-4 w-56 h-56 md:w-72 md:h-72 opacity-70" viewBox="0 0 200 200">
          <motion.path
            d="M 190 140 C 140 180, 80 160, 100 100 C 120 40, 180 60, 150 20 C 120 -20, 40 40, 20 90"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
          />
        </svg>

        {/* Bottom left corner */}
        <svg className="absolute bottom-4 left-4 w-56 h-56 md:w-72 md:h-72 opacity-70" viewBox="0 0 200 200">
          <motion.path
            d="M 20 60 C 80 20, 100 100, 50 130 C 0 160, 100 190, 140 150 C 180 110, 160 30, 190 10"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
          />
        </svg>

        {/* Bottom right corner */}
        <svg className="absolute bottom-4 right-4 w-56 h-56 md:w-72 md:h-72 opacity-70" viewBox="0 0 200 200">
          <motion.path
            d="M 180 60 C 120 20, 100 100, 150 130 C 200 160, 100 190, 60 150 C 20 110, 40 30, 10 10"
            fill="none"
            stroke="var(--accent-2)"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          />
        </svg>
      </motion.div>

      <div className="relative flex items-center justify-center">
        {/* Soft atmospheric glow instead of a loading circle */}
        <motion.div
          className="absolute inset-[-30px] rounded-full bg-gradient-to-tr from-[var(--accent)]/30 to-[var(--accent-2)]/30 blur-2xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Logo */}
        <motion.div
          layoutId="logo-gw" // Matches the nav logo layoutId in page.tsx
          initial={{ scale: 0.8, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border border-[var(--border)] relative z-10 bg-black shadow-2xl"
        >
          <Image
            src="/Logo.jpeg"
            alt="Logo"
            width={160}
            height={160}
            className="w-full h-full object-cover scale-105"
            priority
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
