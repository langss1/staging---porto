"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const roles = ["Cyber", "AI", "IoT", "Software Developer"];

export default function AnimatedRole() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % roles.length);
    }, 2000); // Change role every 2 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[32px] md:h-[40px] relative overflow-hidden flex justify-center items-center w-full">
      <AnimatePresence mode="wait">
        <motion.span
          key={roles[index]}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500 display-text whitespace-nowrap"
        >
          {roles[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
