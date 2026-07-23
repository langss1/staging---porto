"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { Great_Vibes } from "next/font/google";
import Image from "next/image";
import ImageWithLoader from "./ImageWithLoader";
const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const IMPACT_CARDS = [
  {
    id: 1,
    role: "Project Manager",
    organisasi: "Desa Digital Indonesia",
    deskripsi: "Memimpin inisiatif digitalisasi desa yang berhasil menjangkau lebih dari 10,000 penduduk dan meningkatkan efisiensi administrasi desa sebesar 40%.",
    foto: "/org/desa-digital.jpg",
    poin: [
      { id: "1-1", teks: "10,000+ Penduduk terjangkau" },
      { id: "1-2", teks: "40% Peningkatan efisiensi" }
    ]
  },
  {
    id: 2,
    role: "Lead Mentor",
    organisasi: "Tech for All Bootcamp",
    deskripsi: "Membimbing 50+ peserta bootcamp dalam memahami dasar pemrograman web, dengan tingkat kelulusan 95% dan 60% peserta mendapatkan pekerjaan di bidang IT.",
    foto: "/org/tech-for-all.jpg",
    poin: [
      { id: "2-1", teks: "50+ Peserta dimentori" },
      { id: "2-2", teks: "95% Tingkat kelulusan" }
    ]
  }
];

export default function Impact() {
  const [activeCards, setActiveCards] = useState<any[]>([]);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchImpacts = async () => {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase.from('impacts').select('*').order('id', { ascending: true });
      if (data && data.length > 0) {
        setActiveCards(
          data.map((item, i) => ({
            id: item.id,
            role: item.title,
            organisasi: item.organization,
            deskripsi: item.description,
            foto: item.image ? (item.image.match(/^\d{13}-/) ? `/impacts/${item.image}` : `/${item.image}`) : "/org/desa-digital.jpg",
            instanceId: `id-${i}`
          }))
        );
      } else {
        setActiveCards([]);
      }
    };
    fetchImpacts();
  }, []);

  // Auto-play timer
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(timer);
  }, [activeCards, isPaused]);

  const handleNext = () => {
    setDirection(1);
    setActiveCards(prev => {
      const arr = [...prev];
      const first = arr.shift();
      if (first) {
        arr.push({ ...first, instanceId: `${first.id}-${Date.now()}` });
      }
      return arr;
    });
  };

  const handlePrev = () => {
    setDirection(-1);
    setActiveCards(prev => {
      const arr = [...prev];
      const last = arr.pop();
      if (last) {
        arr.unshift({ ...last, instanceId: `${last.id}-${Date.now()}` });
      }
      return arr;
    });
  };

  if (activeCards.length === 0) return null;

  return (
    <section className="py-12 md:py-24 lg:py-32 bg-[var(--bg)] overflow-hidden" id="impact">
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row gap-6 lg:gap-8 items-center">
        
        {/* Left Side: Header & Nav */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col justify-between w-full lg:w-2/5"
        >
           <div>
              <div className="flex items-center">
                  <span className={`${greatVibes.className} text-[90px] md:text-[130px] font-bold -mr-1 md:-mr-2 leading-none translate-y-1 md:translate-y-2 bg-clip-text text-transparent bg-gradient-to-br from-cyan-500 to-blue-600 p-12 -m-12 z-10 relative`}>I</span>
                  <h2 className="text-4xl md:text-6xl font-bold display-text text-[var(--text)] tracking-tight leading-[0.9] md:leading-[0.9] z-0 relative -ml-6 md:-ml-8">
                      mpact
                  </h2>
              </div>
              <p className="text-[var(--text-muted)] text-base md:text-lg mt-2 md:mt-8 leading-relaxed max-w-md">
                  Real-world contributions, workshops, and milestones that created lasting value for the community and participants.
              </p>
           </div>
           
           {/* Navigation Buttons (Desktop Only) */}
           <div className="hidden lg:flex items-center gap-2 mt-12 md:mt-16">
             <button 
               onClick={handlePrev} 
               className="w-14 h-14 rounded-full border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center hover:bg-blue-50 transition-colors shadow-sm text-[var(--text)] hover:text-blue-600"
             >
                <ChevronLeft className="w-6 h-6" />
             </button>
             <button 
               onClick={handleNext} 
               className="w-14 h-14 rounded-full border border-transparent bg-[#0099ff] flex items-center justify-center hover:bg-blue-600 transition-colors shadow-md text-white"
             >
                <ChevronRight className="w-6 h-6" />
             </button>
           </div>
        </motion.div>
        
        {/* Right Side: Stacked Cards Deck */}
        <div 
           className="w-full lg:w-3/5 relative h-[500px] md:h-[600px] flex items-center justify-center perspective-1000 mt-0"
           onMouseEnter={() => setIsPaused(true)}
           onMouseLeave={() => setIsPaused(false)}
           onTouchStart={() => setIsPaused(true)}
           onTouchEnd={() => setIsPaused(false)}
        >
           <AnimatePresence mode="popLayout">
              {activeCards.map((card, index) => {
                 // Only render the top 3 cards to keep the DOM light
                 if (index > 2) return null;

                 return (
                   <motion.div
                     key={card.instanceId}
                     layout
                     initial={{ 
                        opacity: 0, 
                        scale: 0.8,
                        y: direction === 1 ? 50 : -100, 
                        rotateZ: direction === 1 ? -5 : 5
                     }}
                     animate={{
                        opacity: 1 - index * 0.15,
                        scale: 1 - index * 0.05,
                        y: index * 25, // each card stacks 25px lower
                        rotateZ: index % 2 === 0 ? index * 1.5 : -index * 1.5, // alternating slight tilt
                        zIndex: 10 - index
                     }}
                     exit={{
                        opacity: 0,
                        x: direction === 1 ? -400 : 400, // fly away left or right
                        y: 100,
                        rotateZ: direction === 1 ? -15 : 15, // spin away
                        scale: 0.9,
                        transition: { duration: 0.5, ease: "easeOut" }
                     }}
                     transition={{ type: "spring", stiffness: 120, damping: 20, mass: 1 }}
                     className="absolute w-[95%] sm:w-[450px] md:w-[500px] h-[450px] md:h-[550px] bg-[var(--surface)] rounded-[32px] shadow-2xl overflow-hidden border border-[var(--border)] flex flex-col cursor-grab active:cursor-grabbing origin-bottom"
                     drag="x"
                     dragConstraints={{ left: 0, right: 0 }}
                     dragElastic={0.2}
                     onDragEnd={(e, { offset, velocity }) => {
                       const swipe = offset.x;
                       if (swipe < -100) {
                         handleNext();
                       } else if (swipe > 100) {
                         handlePrev();
                       }
                     }}
                   >
                     {/* Card Content Top (Image) */}
                     <div className="h-[45%] w-full bg-slate-100 relative overflow-hidden flex flex-col items-center justify-center">
                        {card.foto ? (
                          <ImageWithLoader 
                            src={card.foto}
                            alt={card.organisasi}
                            className="absolute inset-0 w-full h-full object-cover z-10"
                          />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-cyan-50 dark:from-blue-900 dark:to-cyan-900 opacity-50"></div>
                            <ImageIcon className="w-16 h-16 text-blue-300 dark:text-blue-700 z-10 mb-2" />
                            <span className="text-blue-400 dark:text-blue-600 font-medium text-sm z-10">Image Placeholder</span>
                          </>
                        )}
                     </div>
                     
                     {/* Card Content Bottom (Text) */}
                     <div className="h-[55%] w-full p-6 md:p-8 flex flex-col justify-center bg-[var(--surface)]">
                        <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-600 rounded-full uppercase tracking-wider mb-4 w-max">
                          {card.role}
                        </span>
                        <h3 className="text-2xl md:text-3xl font-black display-text text-[var(--text)] mb-3 line-clamp-2">
                          {card.organisasi}
                        </h3>
                        <p className="text-[var(--text-muted)] text-sm md:text-base leading-relaxed line-clamp-4">
                          {card.deskripsi}
                        </p>
                     </div>
                   </motion.div>
                 );
              })}
           </AnimatePresence>
        </div>
         
         {/* Navigation Buttons (Mobile Only) */}
         <div className="flex lg:hidden items-center justify-center gap-2 mt-4 w-full">
             <button 
               onClick={handlePrev} 
               className="w-14 h-14 rounded-full border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center hover:bg-blue-50 transition-colors shadow-sm text-[var(--text)] hover:text-blue-600"
             >
                <ChevronLeft className="w-6 h-6" />
             </button>
             <button 
               onClick={handleNext} 
               className="w-14 h-14 rounded-full border border-transparent bg-[#0099ff] flex items-center justify-center hover:bg-blue-600 transition-colors shadow-md text-white"
             >
                <ChevronRight className="w-6 h-6" />
             </button>
         </div>
        
      </div>
    </section>
  );
}
