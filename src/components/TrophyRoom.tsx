"use client";
import { useState, useEffect, useRef } from "react";
import { motion, animate, useMotionValue, useTransform, useInView } from "framer-motion";
import { Trophy, Star, Target, ChevronLeft, ChevronRight, Award } from "lucide-react";
import ImageWithLoader from "./ImageWithLoader";
import { Great_Vibes } from "next/font/google";

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

function AnimatedCounter({ to }: { to: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      animate(count, to, { duration: 2, ease: "easeOut" });
    }
  }, [count, isInView, to]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

const ORIGINAL_HONORS = [
  {
    id: 1,
    nama: "Gemastik 2024",
    deskripsi: "National ICT Competition organized by Puspresnas.",
    juara_tingkat: "Finalist - Smart City",
    penyelenggara: "Puspresnas / Kemdikbud",
    evidence: "Gemastik Certificate / Evidence"
  },
  {
    id: 2,
    nama: "Hackathon X 2025",
    deskripsi: "24-hour coding challenge focused on GenAI solutions.",
    juara_tingkat: "1st Place",
    penyelenggara: "Tech Corp",
    evidence: "Hackathon X Trophy / Evidence"
  },
  {
    id: 3,
    nama: "ICPC Regional Asia",
    deskripsi: "Represented the university in the prestigious collegiate programming contest.",
    juara_tingkat: "Finalist",
    penyelenggara: "ICPC Foundation",
    evidence: "ICPC Certificate / Evidence"
  },
  {
    id: 4,
    nama: "Google Solution Challenge",
    deskripsi: "Built a sustainable tech solution recognized in the global top 50.",
    juara_tingkat: "Global Top 50",
    penyelenggara: "Google Developers",
    evidence: "Google Certificate / Evidence"
  }
];

// Duplicate items if less than 4 to allow seamless 3D carousel looping
const HONORS = ORIGINAL_HONORS.length < 4 
  ? [...ORIGINAL_HONORS, ...ORIGINAL_HONORS, ...ORIGINAL_HONORS].map((h, i) => ({ ...h, uniqueId: i }))
  : ORIGINAL_HONORS.map((h, i) => ({ ...h, uniqueId: i }));

export default function TrophyRoom() {
  const [dbHonors, setDbHonors] = useState<any[]>(HONORS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchHonors = async () => {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase.from('honors').select('*').order('id', { ascending: true });
      if (data && data.length > 0) {
        const mapped = data.map(item => ({
          id: item.id,
          nama: item.title,
          deskripsi: item.desc_text,
          juara_tingkat: item.event,
          penyelenggara: item.icon_type,
          evidence: item.icon_type,
          image: item.image ? (item.image.match(/^\d{13}-/) ? `/honors/${item.image}` : `/${item.image}`) : null,
          year: item.year
        }));
        
        const finalHonors = mapped.length < 4 
          ? [...mapped, ...mapped, ...mapped].map((h, i) => ({ ...h, uniqueId: i }))
          : mapped.map((h, i) => ({ ...h, uniqueId: i }));
          
        setDbHonors(finalHonors);
      }
    };
    fetchHonors();
  }, []);

  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % dbHonors.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [currentIndex, isPaused]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % dbHonors.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + dbHonors.length) % dbHonors.length);
  };

  return (
    <section className="relative py-10 md:py-20 overflow-hidden bg-[var(--bg)]" id="honors">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Header Section (Same UI style as Projects and Work) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col lg:flex-row justify-between items-center mb-16 gap-4 lg:gap-8"
        >
          
          {/* Left: Title & Text */}
          <div className="flex flex-col gap-1 md:gap-4 w-full md:w-3/5 text-left">
              <div className="flex flex-row justify-between items-center w-full">
                  <div className="flex flex-col items-start scale-[0.65] md:scale-100 origin-left ml-2 md:ml-0 -mr-24 md:mr-0 shrink-0">
                      <div className="flex items-center">
                          <span className={`${greatVibes.className} text-[90px] md:text-[130px] font-bold -mr-1 md:-mr-2 leading-none translate-y-1 md:translate-y-2 bg-clip-text text-transparent bg-gradient-to-br from-cyan-500 to-blue-600 p-12 -m-12 z-10 relative`}>H</span>
                          <h2 className="text-4xl md:text-6xl font-bold display-text text-[var(--text)] tracking-tight leading-[0.9] md:leading-[0.9] z-0 relative -ml-8 md:-ml-12">
                              onor &
                          </h2>
                      </div>
                      <div className="flex items-center mt-[-45px] md:mt-[-50px] ml-12 md:ml-24 relative z-20">
                          <span className={`${greatVibes.className} text-[90px] md:text-[130px] font-bold -mr-1 md:-mr-2 leading-none translate-y-1 md:translate-y-2 bg-clip-text text-transparent bg-gradient-to-br from-cyan-500 to-blue-600 p-12 -m-12 z-20 relative`}>A</span>
                          <h2 className="text-4xl md:text-6xl font-bold display-text text-[var(--text)] tracking-tight leading-[0.9] md:leading-[0.9] z-10 relative -ml-8 md:-ml-12">
                              wards
                          </h2>
                      </div>
                  </div>
                  
                  {/* Mobile-only Counter */}
                  <div className="flex md:hidden flex-col items-center justify-center scale-[0.65] origin-right shrink-0 mr-4 -ml-16">
                     <span className="text-[70px] leading-none font-bold text-[#0099ff] tracking-tighter flex items-center">
                       <AnimatedCounter to={ORIGINAL_HONORS.length} />
                     </span>
                     <span className="text-lg font-semibold text-[var(--text-muted)] mt-1">Honors</span>
                  </div>
              </div>
              <div className="mt-0 md:mt-4 text-left relative z-10 pr-2 md:pr-0">
                  <p className="text-[var(--text-muted)] text-base md:text-lg leading-relaxed">
                      A showcase of my achievements, competitive programming results, and hackathon victories. Proof of excellence and dedication.
                  </p>
              </div>
          </div>

          {/* Right: Counter / Stat */}
          <div className="w-full lg:w-2/5 hidden md:flex justify-center items-center h-full mt-0">
             <div className="flex flex-col items-center justify-center">
                <span className="text-[70px] md:text-[90px] leading-none font-bold text-[#0099ff] tracking-tighter flex items-center">
                  <AnimatedCounter to={ORIGINAL_HONORS.length} />
                </span>
                <span className="text-lg md:text-xl font-semibold text-[var(--text-muted)] mt-1">Honors</span>
             </div>
          </div>
        </motion.div>

        {/* Carousel Section */}
        <div 
          className="relative w-full h-[450px] md:h-[500px] flex items-center justify-center mt-12 mb-8"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
           {dbHonors.map((honor, index) => {
              const len = dbHonors.length;
              const isCenter = index === currentIndex;
              const isPrev = index === (currentIndex - 1 + len) % len;
              const isNext = index === (currentIndex + 1) % len;
              
              let x = "0%";
              let scale = 1;
              let opacity = 1;
              let zIndex = 20;

              if (isPrev) {
                x = "-75%";
                scale = 0.85;
                opacity = 0.4;
                zIndex = 10;
              } else if (isNext) {
                x = "75%";
                scale = 0.85;
                opacity = 0.4;
                zIndex = 10;
              } else if (!isCenter) {
                // Hidden items shrink and hide behind the center card
                x = "0%";
                scale = 0.7;
                opacity = 0;
                zIndex = 0;
              }

              return (
                <motion.div
                  key={honor.uniqueId}
                  initial={false}
                  animate={{ x, scale, opacity, zIndex }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className={`absolute w-[85%] md:w-[60%] h-full rounded-[40px] overflow-hidden border border-[var(--border)] shadow-xl ${isCenter ? 'cursor-default' : 'cursor-pointer'}`}
                  onClick={() => {
                    if (isPrev) handlePrev();
                    if (isNext) handleNext();
                  }}
                  style={{
                    backgroundColor: 'var(--surface)',
                  }}
                >
                  {/* Card Image / Content */}
                  <div className="w-full h-[65%] bg-slate-100 relative overflow-hidden flex items-center justify-center">
                     <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-slate-200/50 z-0"></div>
                     {honor.image ? (
                       <ImageWithLoader src={honor.image} alt={honor.nama} className="absolute inset-0 w-full h-full object-cover z-10" />
                     ) : (
                       <div className="relative z-10 w-4/5 h-3/4 border-2 border-dashed border-slate-300 rounded-3xl flex items-center justify-center bg-white/40 shadow-inner">
                          <span className="text-slate-600 font-bold uppercase tracking-widest text-center px-4">
                             {honor.evidence || 'MEDAL'}
                          </span>
                       </div>
                     )}
                  </div>

                  {/* Card Details */}
                  <div className="w-full h-[35%] p-6 md:p-8 bg-[var(--surface)] flex flex-col justify-center">
                     <div className="flex justify-between items-start mb-1 gap-2">
                        <h3 className="text-2xl md:text-3xl font-bold display-text text-[var(--text)] line-clamp-1">{honor.nama}</h3>
                        <div className="flex flex-col md:flex-row gap-2 shrink-0 items-end md:items-center">
                          {honor.year && (
                            <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-bold text-indigo-600 uppercase tracking-wider">
                              {honor.year}
                            </span>
                          )}
                        </div>
                     </div>
                     <div className="text-[#0099ff] font-semibold text-sm mb-2 tracking-wide">
                        {honor.juara_tingkat}
                     </div>
                     <p className="text-[var(--text-muted)] text-sm md:text-base line-clamp-2">
                        {honor.deskripsi}
                     </p>
                  </div>
                </motion.div>
              );
           })}
        </div>

        {/* Carousel Controls */}
        <div className="flex items-center justify-center gap-6">
           <button 
             onClick={handlePrev}
             className="w-14 h-14 rounded-full border-2 border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:bg-[var(--accent)] hover:border-[var(--accent)] hover:text-white transition-all duration-300 shadow-sm"
           >
             <ChevronLeft className="w-6 h-6" />
           </button>
           
           <div className="flex gap-2">
              {dbHonors.map((_, idx) => (
                 <div 
                   key={idx}
                   className={`h-2 rounded-full transition-all duration-300 ${
                     (currentIndex % dbHonors.length) === idx 
                       ? "w-8 bg-[#0099ff]" 
                       : "w-2 bg-[var(--border)]"
                   }`}
                 />
              ))}
           </div>

           <button 
             onClick={handleNext}
             className="w-14 h-14 rounded-full border-2 border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:bg-[var(--accent)] hover:border-[var(--accent)] hover:text-white transition-all duration-300 shadow-sm"
           >
             <ChevronRight className="w-6 h-6" />
           </button>
        </div>

      </div>
    </section>
  );
}