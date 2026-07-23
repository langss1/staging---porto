"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView, animate } from "framer-motion";
import { Great_Vibes } from "next/font/google";
import ImageWithLoader from "./ImageWithLoader";

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

function AnimatedCounter({ to }: { to: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      const controls = animate(0, to, {
        duration: 2.5,
        ease: "easeOut",
        onUpdate(value) {
          setCount(Math.round(value));
        }
      });
      return () => controls.stop();
    }
  }, [inView, to]);

  return <span ref={ref}>{count}</span>;
}

const EXPERIENCES = [
  {
    id: 1,
    posisi: "Cyber Threat Intelligence",
    company: "Mabes Polri",
    masa: "Aug 2024 - Jan 2025",
    techStack: ["OSINT", "Threat Intel", "Security Monitoring", "Python", "Maltego"],
    poin: [
      "Conducted threat intelligence analysis and Open-Source Intelligence (OSINT).",
      "Active monitoring of cyber threats targeting national security infrastructure.",
      "Collaborated with the blue team to mitigate vulnerabilities and report incidents."
    ],
  },
  {
    id: 2,
    posisi: "QA Intern",
    company: "XL Axiata",
    masa: "Jun 2023 - Aug 2023",
    techStack: ["Selenium", "Katalon Studio", "Jira", "Postman", "Agile"],
    poin: [
      "Performed automated and manual testing for internal applications.",
      "Created comprehensive test cases and reported bugs efficiently in Jira.",
      "Ensured 99% bug-free deployment cycles during the internship period."
    ],
  }
];

function ExpandableTechStack({ techStack, limit = 5 }: { techStack: string[], limit?: number }) {
  const [expanded, setExpanded] = useState(false);
  const visibleTech = expanded ? techStack : techStack.slice(0, limit);
  const hiddenCount = techStack.length - limit;

  return (
    <div className="flex flex-col gap-2 w-full md:max-w-[80%]">
      <span className="text-[10px] font-extrabold text-[#0099ff] uppercase tracking-wider">Tech Stack</span>
      <motion.div layout className={`flex items-center gap-1.5 overflow-hidden ${expanded ? 'flex-wrap' : 'flex-nowrap'}`}>
        <AnimatePresence>
          {visibleTech.map((tech) => (
            <motion.span 
              layout
              key={tech} 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="px-2 py-1 rounded-md border border-[var(--border)] text-[10px] font-bold text-[var(--text-muted)] bg-white shadow-sm whitespace-nowrap shrink-0"
            >
              {tech}
            </motion.span>
          ))}
          {!expanded && hiddenCount > 0 && (
            <motion.button 
              layout
              key="expand-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(true); }}
              className="text-[10px] font-bold text-[var(--text-muted)] ml-1 hover:text-[#0099ff] cursor-pointer shrink-0"
            >
              +{hiddenCount}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function Timeline() {
  const containerRef = useRef(null);
  const [dbExperiences, setDbExperiences] = useState<any[]>(EXPERIENCES);

  useEffect(() => {
    const fetchExperiences = async () => {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase.from('work_experiences').select('*').order('id', { ascending: true });
      if (data && data.length > 0) {
        const mapped = data.map(item => ({
           ...item,
           image: item.image ? (item.image.match(/^\d{13}-/) ? `/work_experiences/${item.image}` : `/${item.image}`) : null,
           tech_stack: item.tech_stack || item.techStack || []
        }));
        setDbExperiences(mapped);
      }
    };
    fetchExperiences();
  }, []);
  
  return (
    <section className="relative py-10 md:py-20 overflow-hidden bg-[var(--bg)]" id="experience" ref={containerRef}>
      
      {/* Top Gradient Transition from White to Cream */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent z-0 pointer-events-none" />

      {/* Abstract Wave Background (Subtle) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-40">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/10 blur-[100px] mix-blend-multiply animate-pulse" style={{ animationDuration: '8s' }} />
         <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-300/10 blur-[100px] mix-blend-multiply animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* Rain / Diagonal Pattern Background */}
      <div 
         className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] dark:opacity-[0.05]"
         style={{ 
            backgroundImage: 'repeating-linear-gradient(45deg, var(--text) 0, var(--text) 1px, transparent 1px, transparent 24px)',
            maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'
         }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Header Section (Same UI style as Projects) */}
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
                  
                  {/* Title */}
                  <div className="flex flex-col items-start scale-[0.65] md:scale-100 origin-left ml-2 md:ml-0 -mr-24 md:mr-0 shrink-0">
                      <div className="flex items-center">
                          {/* Added aggressive padding (pt-8 pl-8) with compensating negative margins to prevent the cursive W from clipping with bg-clip-text */}
                          <span className={`${greatVibes.className} text-[110px] md:text-[150px] font-bold -mr-1 md:-mr-2 leading-none translate-y-1 md:translate-y-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500 z-10 pt-8 pl-8 pr-2 -mt-8 -ml-8`}>W</span>
                          <span className="text-5xl md:text-6xl font-black tracking-tight display-text ml-0 md:ml-2 mt-4">ork</span>
                      </div>
                  </div>
                  
                  {/* Mobile-only Counter */}
                  <div className="flex md:hidden flex-col items-center justify-center scale-[0.65] origin-right shrink-0 mr-4 -ml-16">
                     <span className="text-[70px] leading-none font-bold text-[#0099ff] tracking-tighter flex items-center">
                       <AnimatedCounter to={dbExperiences.length} />
                     </span>
                     <span className="text-lg font-semibold text-[var(--text-muted)] mt-1">Experiences</span>
                  </div>
                  
              </div>
              <div className="mt-0 md:mt-4 text-left relative z-10 pr-2 md:pr-0">
                  <p className="text-[var(--text-muted)] text-base md:text-lg leading-relaxed">
                      Explore my professional journey and roles. Discover the impact I've made and the tech stacks I've utilized in each position.
                  </p>
              </div>
          </div>

          {/* Right: Briefcase Icon/Stat (Compact) */}
          <div className="w-full lg:w-2/5 hidden md:flex justify-center items-center h-full mt-0">
              <div className="flex flex-col items-center justify-center">
                <span className="text-[70px] md:text-[90px] leading-none font-bold text-[#0099ff] tracking-tighter flex items-center">
                  <AnimatedCounter to={dbExperiences.length} />
                </span>
                <span className="text-lg md:text-xl font-semibold text-[var(--text-muted)] mt-1">Experiences</span>
             </div>
          </div>
        </motion.div>

        {/* Work Experience Cards (Compact & Stacked) */}
        <div className="flex flex-col gap-8">
          {dbExperiences.map((exp, idx) => (
             <motion.div 
               key={exp.id}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ duration: 0.5, delay: idx * 0.1 }}
               className="group relative bg-[var(--surface)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col md:flex-row"
             >
                {/* Image Placeholder Area (Left on Desktop, Top on Mobile) */}
                <div className="h-[200px] md:h-auto md:w-1/3 shrink-0 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b md:border-b-0 md:border-r border-[var(--border)]">
                   <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-slate-200/50 group-hover:scale-105 transition-transform duration-700"></div>
                   
                   {/* Category Badges (Top Left) */}
                   {exp.categories && exp.categories.length > 0 && (
                     <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                       {exp.categories.map((kat: string, katIdx: number) => (
                         <span key={katIdx} className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-bold text-blue-700 uppercase tracking-wider border border-white/50 shadow-sm inline-block">
                           {kat}
                         </span>
                       ))}
                     </div>
                   )}
                   {exp.image ? (
                     <ImageWithLoader 
                       src={exp.image} 
                       alt={exp.company} 
                       className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 z-10" 
                     />
                   ) : (
                     <div className="relative w-full h-full m-6 border border-dashed border-slate-300 rounded-2xl flex items-center justify-center bg-white/40 shadow-inner overflow-hidden">
                        <div className="absolute top-1/2 left-[40%] -translate-y-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-2 border-blue-200 bg-blue-100/30"></div>
                        <div className="absolute top-1/2 right-[40%] -translate-y-1/2 translate-x-1/2 w-20 h-20 rounded-full border-2 border-cyan-200 bg-cyan-100/30"></div>
                        
                        <div className="text-center z-10 px-4 py-2 bg-white/70 rounded-xl shadow-sm backdrop-blur-sm">
                           <span className="text-slate-600 font-bold uppercase tracking-widest text-xs display-text">
                              Evidence
                           </span>
                        </div>
                     </div>
                   )}
                </div>

                {/* Details Area (Right on Desktop, Bottom on Mobile) */}
                <div className="p-6 md:p-8 flex flex-col flex-1 relative bg-[var(--surface)]">
                   
                   {/* Header Row: Title & Year Badge */}
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-1">
                      <h3 className="text-2xl font-bold display-text text-[var(--text)]">{exp.posisi}</h3>
                      <div className="inline-flex items-center px-4 py-1.5 border border-[var(--border)] bg-slate-50 rounded-lg text-[var(--text-muted)] text-xs font-bold tracking-widest w-max">
                         {exp.masa}
                      </div>
                   </div>
                   
                   {/* Company */}
                   <h4 className="text-lg font-bold text-blue-600 italic mb-5">{exp.company}</h4>

                   {/* Points */}
                   <ul className="space-y-3 mb-6 flex-1">
                     {exp.poin && exp.poin.map((p: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                           <span className="text-[#0099ff] font-bold text-sm leading-none mt-1">→</span>
                           <span className="text-[var(--text-muted)] text-sm leading-relaxed">{p}</span>
                        </li>
                     ))}
                   </ul>

                   {/* Tech Stack Row (Bottom) */}
                   <div className="mt-auto pt-5 border-t border-[var(--border)]">
                      <ExpandableTechStack techStack={exp.tech_stack || exp.techStack} limit={4} />
                   </div>
                </div>
             </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
