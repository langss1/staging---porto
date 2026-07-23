"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  duration?: number;
  suffix?: string;
  delay?: number;
}

export default function AnimatedCounter({ value, decimals = 0, duration = 2, suffix = "", delay = 0 }: AnimatedCounterProps) {
  const [currentValue, setCurrentValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      const timeoutId = setTimeout(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
          
          const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          
          setCurrentValue(easeProgress * value);

          if (progress < 1) {
            animationFrame = requestAnimationFrame(animate);
          }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
      }, delay * 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [value, duration, isInView, delay]);

  return (
    <span ref={ref} className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500">
      {currentValue.toFixed(decimals)}
      {suffix}
    </span>
  );
}
