"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion, useInView, animate, useMotionValue, useTransform } from "framer-motion";
import { Users, Calendar, MapPin, ChevronRight, UserCircle } from "lucide-react";
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

const ORGANIZATIONS = [
  {
    id: 1,
    year: "2025",
    status: "ACTIVE",
    name: "GenBI (Generasi Baru Indonesia)",
    role: "Staff External Affairs (Excon)",
    description: "The Bank Indonesia Scholarship Recipient Community focuses on being the frontliners of Bank Indonesia and providing energy and impact for Indonesia.",
  },
  {
    id: 2,
    year: "2025",
    status: "ACTIVE",
    name: "Hardware Embedded System Laboratory",
    role: "Research Group Member",
    description: "Hardware and embedded system research lab that focuses on the development and manufacture of hardware and IoT products.",
  }
];

export default function Organization() {
  const [dbOrganizations, setDbOrganizations] = useState<any[]>(ORGANIZATIONS);

  useEffect(() => {
    const fetchOrganizations = async () => {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase.from('organizations').select('*').order('id', { ascending: true });
      if (data && data.length > 0) {
        setDbOrganizations(data.map(item => ({
          id: item.id,
          year: item.period,
          status: item.location,
          name: item.org,
          role: item.role,
          description: item.responsibilities?.join(', ') || '',
          image: item.image ? (item.image.match(/^\d{13}-/) ? `/organizations/${item.image}` : `/${item.image}`) : null
        })));
      }
    };
    fetchOrganizations();
  }, []);

  return (
    <section className="relative py-10 md:py-20 overflow-hidden bg-[var(--bg)]" id="organization">
      {/* Wavy Background Pattern */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="wavy-pattern" x="0" y="0" width="100" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 20 Q 25 5, 50 20 T 100 20" fill="none" className="stroke-[var(--text)]" strokeWidth="1" opacity="0.06"/>
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#wavy-pattern)"></rect>
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col lg:flex-row justify-between items-center mb-16 gap-4 lg:gap-8"
        >
          <div className="flex flex-col gap-1 md:gap-4 w-full lg:w-3/5 text-left">
              <div className="flex flex-row justify-between items-center w-full">
                  
                  {/* Title */}
                  <div className="flex flex-col items-start scale-[0.65] md:scale-100 origin-left ml-2 md:ml-0 -mr-24 md:mr-0 shrink-0">
                      <div className="flex items-center">
                          <span className={`${greatVibes.className} text-[90px] md:text-[130px] font-bold -mr-1 md:-mr-2 leading-none translate-y-1 md:translate-y-2 bg-clip-text text-transparent bg-gradient-to-br from-cyan-500 to-blue-600 p-12 -m-12 z-10 relative`}>O</span>
                          <h2 className="text-4xl md:text-6xl font-bold display-text text-[var(--text)] tracking-tight leading-[0.9] md:leading-[0.9] z-0 relative -ml-8 md:-ml-12">
                              rganization
                          </h2>
                      </div>
                  </div>
                  
                  {/* Mobile-only Counter */}
                  <div className="flex md:hidden flex-col items-center justify-center scale-[0.65] origin-right shrink-0 mr-4 -ml-16">
                     <span className="text-[70px] leading-none font-bold text-[#0099ff] tracking-tighter flex items-center">
                       <AnimatedCounter to={dbOrganizations.length} />
                     </span>
                     <span className="text-lg font-semibold text-[var(--text-muted)] mt-1">Communities</span>
                  </div>
                  
              </div>
              <div className="mt-0 md:mt-4 text-left relative z-10 pr-2 md:pr-0">
                  <p className="text-[var(--text-muted)] text-base md:text-lg leading-relaxed">
                      My leadership roles and active participation in various impactful communities and research laboratories.
                  </p>
              </div>
          </div>
          <div className="w-full lg:w-2/5 hidden md:flex justify-center items-center h-full mt-0">
             <div className="flex flex-col items-center justify-center">
                <span className="text-[70px] md:text-[90px] leading-none font-bold text-[#0099ff] tracking-tighter flex items-center">
                  <AnimatedCounter to={dbOrganizations.length} />
                </span>
                <span className="text-lg md:text-xl font-semibold text-[var(--text-muted)] mt-1">Communities</span>
             </div>
          </div>
        </motion.div>

        {/* Timeline Section */}
        <div className="relative w-full max-w-5xl mx-auto">
           {/* Center Line */}
           <div className="absolute left-[32px] md:left-1/2 top-0 bottom-0 w-[2px] bg-blue-300 transform md:-translate-x-1/2"></div>
           
           <div className="flex flex-col gap-12 md:gap-8">
             {dbOrganizations.map((org, index) => {
                const isEven = index % 2 === 0;
                
                return (
                  <TimelineItem 
                    key={org.id}
                    org={org}
                    isEven={isEven}
                  />
                );
             })}
           </div>
        </div>

      </div>
    </section>
  );
}

function TimelineItem({ org, isEven }: { org: any, isEven: boolean }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div 
      ref={ref}
      className={`relative flex flex-col md:flex-row items-center w-full ${isEven ? 'md:flex-row-reverse' : ''}`}
    >
      {/* Node (Green Dot) */}
      <div className="absolute left-[32px] md:left-1/2 w-4 h-4 rounded-full bg-green-500 border-2 border-[var(--bg)] transform -translate-x-1/2 z-10"></div>
      
      {/* Empty Space for opposing side (Desktop) */}
      <div className="hidden md:block md:w-1/2"></div>
      
      {/* Content Card */}
      <div className={`w-full md:w-1/2 pl-20 md:pl-0 py-4 ${isEven ? 'md:pr-12 lg:pr-24' : 'md:pl-12 lg:pl-24'}`}>
        <motion.div
          initial={{ opacity: 0, x: isEven ? -50 : 50, y: 20 }}
          animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: isEven ? -50 : 50, y: 20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group"
        >
          {/* Image Area with Floating Badges */}
          <div className="relative w-full h-56 md:h-64 overflow-hidden bg-slate-100 border-b border-slate-200/60">
             {org.image ? (
               <ImageWithLoader src={org.image} alt={org.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
             ) : (
               <div className="w-full h-full bg-gradient-to-br from-blue-50/50 to-slate-200/50 group-hover:scale-105 transition-transform duration-700"></div>
             )}
             
             {/* Floating Badges */}
             <div className="absolute top-4 left-4 z-10 flex items-center gap-2 flex-wrap">
               <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md border border-white/50 shadow-sm text-slate-800 font-bold text-sm rounded-full">
                 {org.year}
               </span>
               {org.status === 'ACTIVE' && (
                 <span className="px-4 py-1.5 bg-green-500/90 backdrop-blur-md border border-green-400/50 shadow-sm text-white font-bold text-xs rounded-full flex items-center gap-2 uppercase tracking-wide">
                   <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                   ACTIVE
                 </span>
               )}
             </div>
          </div>
          
          <div className="p-6 md:p-8 flex flex-col flex-1">
            <h3 className="text-xl md:text-2xl font-black display-text text-[var(--text)] mb-1">
               {org.name}
            </h3>
            <h4 className="text-[#001489] font-bold text-sm md:text-base mb-4 tracking-wide">
               {org.role}
            </h4>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
               {org.description}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
