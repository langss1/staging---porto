"use client";
import React, { useState, useEffect } from "react";
import { PROFILE } from "@/data/portfolio";
import { Download, Linkedin, Github, Mail, Instagram, MessageSquarePlus, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TestimonialForm from "./TestimonialForm";
import { sanitizeUrl } from "@/lib/security";

const CLOUDS = [
  { id: 1, size: 120, top: "10%", duration: 80, delay: 0, opacity: 0.6 },
  { id: 2, size: 200, top: "35%", duration: 120, delay: -20, opacity: 0.4 },
  { id: 3, size: 150, top: "60%", duration: 90, delay: -40, opacity: 0.5 },
  { id: 4, size: 280, top: "15%", duration: 150, delay: -70, opacity: 0.3 },
  { id: 5, size: 100, top: "75%", duration: 60, delay: -10, opacity: 0.7 },
];

const isValidAvatarUrl = (url: string) => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const allowedDomains = [
      'avatars.githubusercontent.com', 
      'lh3.googleusercontent.com', 
      'media.licdn.com',
      'ui-avatars.com',
      'supabase.co',
      'supabase.in'
    ];
    return parsed.protocol === 'https:' && allowedDomains.some(domain => parsed.hostname.endsWith(domain));
  } catch (e) {
    return false;
  }
};

const CloudShape = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.5 19c2.485 0 4.5-2.015 4.5-4.5 0-2.316-1.75-4.22-4.004-4.475C17.75 6.72 14.865 4 11.25 4 7.28 4 4.024 7.02 3.54 10.875 1.554 11.275 0 13.06 0 15.25 0 17.87 2.13 20 4.75 20h12.75z" />
  </svg>
);

export default function Contact() {
  const [profileData, setProfileData] = useState<any>(null);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [cyclePhase, setCyclePhase] = useState<'orbit' | 'popup' | 'popup_exit'>('orbit');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        
        // Fetch Profile
        const { data: pData } = await supabase.from('profile').select('linkedin_url, github_url, instagram_url, email, cv_link').single();
        if (pData) setProfileData(pData);

        // Fetch Approved Testimonials
        const { data: tData } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
        if (tData && tData.length > 0) {
          const approved = tData.filter(item => item.is_approved !== false);
          setTestimonials(approved.length > 0 ? approved : tData);
        } else {
          setTestimonials([]);
        }
      } catch (e) {
        console.error("Error fetching data:", e);
        setTestimonials([]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;
    let timeoutId: NodeJS.Timeout;

    if (cyclePhase === 'orbit') {
      timeoutId = setTimeout(() => {
        setCyclePhase('popup');
      }, 3000);
    } else if (cyclePhase === 'popup') {
      timeoutId = setTimeout(() => {
        setCyclePhase('popup_exit');
      }, 5000);
    } else if (cyclePhase === 'popup_exit') {
      timeoutId = setTimeout(() => {
        setCyclePhase('orbit');
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 600);
    }

    return () => clearTimeout(timeoutId);
  }, [cyclePhase, testimonials]);

  const activeTestimonial = testimonials[currentIndex];

  return (
    <section className="relative pt-32 md:pt-48 pb-10 bg-gradient-to-b from-[var(--bg)] via-sky-100 to-blue-200 overflow-hidden flex flex-col justify-between min-h-[800px]" id="contact">
      
      {/* Animated Clouds Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {CLOUDS.map((cloud) => (
          <motion.div
            key={cloud.id}
            className="absolute text-white drop-shadow-xl"
            style={{ 
              top: cloud.top, 
              opacity: cloud.opacity,
              width: cloud.size,
              height: cloud.size * 0.6 
            }}
            animate={{ x: ["-15vw", "115vw"] }}
            transition={{
              repeat: Infinity,
              duration: cloud.duration,
              ease: "linear",
              delay: cloud.delay
            }}
          >
            <CloudShape className="w-full h-full" />
          </motion.div>
        ))}
      </div>
      
      {/* Content overlay */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-start justify-center flex-grow w-full mt-10 md:mt-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full"
        >
          <div className="relative inline-block w-full">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black display-text tracking-tighter mb-6 leading-[1.1] text-slate-900 drop-shadow-sm">
              Ready to<br className="hidden md:block"/> Collaborate?
            </h2>
            
            {/* Desktop Only Satellite and Message Bubble Animation Container */}
            <div className="hidden md:flex absolute top-0 -right-12 lg:-right-32 xl:-right-48 -translate-y-8 z-30 flex-col items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ x: 200, y: -200, opacity: 0 }}
                  animate={{ x: 0, y: 0, opacity: 1, transition: { 
                    opacity: { duration: 0.8 },
                    x: { duration: 1.2, ease: "easeOut" },
                    y: { duration: 1.2, ease: "easeIn" }
                  }}}
                  exit={{ x: 200, y: 200, opacity: 0, transition: { 
                    opacity: { duration: 0.8, delay: 0.4 },
                    x: { duration: 1.2, ease: "easeIn" },
                    y: { duration: 1.2, ease: "easeOut" }
                  }}}
                  className="relative flex items-center justify-center"
                >
                  {/* Satellite / Avatar target */}
                  <div 
                    className="relative group cursor-pointer" 
                    onClick={() => setCyclePhase(cyclePhase === 'orbit' ? 'popup' : 'popup_exit')}
                  >
                    {activeTestimonial && activeTestimonial.avatar_url && isValidAvatarUrl(activeTestimonial.avatar_url) ? (
                      <img src={activeTestimonial.avatar_url} alt="User Satellite" className="relative w-14 h-14 md:w-16 md:h-16 rounded-full object-cover shadow-xl border-4 border-white z-10 hover:scale-110 transition-transform" />
                    ) : (
                      <div className="relative w-14 h-14 md:w-16 md:h-16 bg-white rounded-full shadow-xl flex items-center justify-center text-blue-600 z-10 border-4 border-white hover:scale-110 transition-transform overflow-hidden">
                        <User className="w-7 h-7 md:w-8 md:h-8 text-blue-500" />
                      </div>
                    )}
                  </div>

                  {/* Message Bubble Drop (Positioned to the left) */}
                  <AnimatePresence mode="wait">
                    {cyclePhase === 'popup' && activeTestimonial && (
                      <motion.div 
                        key={activeTestimonial.id}
                        initial={{ opacity: 0, scale: 0.5, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: 10 }}
                        transition={{ type: "spring", bounce: 0.4 }}
                        className="absolute right-[calc(100%+24px)] top-1/2 -translate-y-1/2 bg-white rounded-2xl p-4 md:p-5 shadow-2xl border border-blue-100 w-[280px] md:w-[320px] origin-right text-left z-40"
                      >
                        <div className="relative z-10">
                          <p className="text-xs md:text-base text-slate-700 italic mb-4 font-medium leading-relaxed">
                            "{activeTestimonial.message}"
                          </p>
                          <div className="flex items-center gap-3">
                            {activeTestimonial.avatar_url && isValidAvatarUrl(activeTestimonial.avatar_url) ? (
                              <img src={activeTestimonial.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-slate-100" />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                                {activeTestimonial.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold text-slate-900 leading-tight">{activeTestimonial.name}</p>
                              <p className="text-[11px] md:text-xs text-blue-600 font-bold tracking-wide uppercase mt-0.5">{activeTestimonial.role}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <p className="text-lg md:text-xl text-slate-700 mb-12 max-w-2xl leading-relaxed font-medium">
            I am always open to new opportunities, collaborations, let's connect and make an impact.
          </p>

          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <SocialPill href={profileData?.instagram_url || "https://instagram.com/gilangproject"} icon={<Instagram className="w-4 h-4 md:w-5 md:h-5" />} label="Instagram" />
            <SocialPill href={profileData?.github_url || PROFILE?.socials?.github || "#"} icon={<Github className="w-4 h-4 md:w-5 md:h-5" />} label="Github" />
            <SocialPill href={profileData?.email ? (profileData.email.startsWith('mailto:') ? profileData.email : `mailto:${profileData.email}`) : "mailto:gilangonwork@gmail.com"} icon={<Mail className="w-4 h-4 md:w-5 md:h-5" />} label="Email" />
            <SocialPill href={profileData?.linkedin_url || PROFILE?.socials?.linkedin || "#"} icon={<Linkedin className="w-4 h-4 md:w-5 md:h-5" />} label="LinkedIn" />
            <SocialPill href={profileData?.cv_link || PROFILE?.cvLink || "#"} icon={<Download className="w-4 h-4 md:w-5 md:h-5" />} label="CV" isPrimary />
            
            <button 
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-bold bg-white text-slate-900 border border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50 hover:-translate-y-1 transition-all duration-300 ml-0 sm:ml-2"
            >
              <MessageSquarePlus className="w-4 h-4 md:w-5 md:h-5" />
              <span>Leave a Comment</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Mobile Only Testimonial Orbit Container (Positioned as illustrated: Quote Box on Left, Orbiting Avatar on Right) */}
      <div className="md:hidden w-full max-w-5xl mx-auto px-6 mt-6 mb-2 relative z-30 min-h-[140px]">
        <div className="relative w-full flex items-center justify-between min-h-[120px]">
          {/* Testimonial Quote Bubble (Left side red rectangle) */}
          <div className="flex-1 pr-3 max-w-[68%]">
            <AnimatePresence mode="wait">
              {cyclePhase === 'popup' && activeTestimonial && (
                <motion.div 
                  key={`mob-bubble-${activeTestimonial.id}`}
                  initial={{ opacity: 0, scale: 0.85, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.85, x: -20 }}
                  transition={{ type: "spring", bounce: 0.3 }}
                  className="bg-white rounded-2xl p-3.5 shadow-xl border border-blue-100 w-full text-left z-40"
                >
                  <p className="text-[11px] text-slate-700 italic mb-2.5 font-medium leading-snug line-clamp-3">
                    "{activeTestimonial.message}"
                  </p>
                  <div className="flex items-center gap-2">
                    {activeTestimonial.avatar_url && isValidAvatarUrl(activeTestimonial.avatar_url) ? (
                      <img src={activeTestimonial.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover border border-slate-100 shrink-0" />
                    ) : (
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-[10px] shadow-sm shrink-0">
                        {activeTestimonial.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 truncate leading-tight">{activeTestimonial.name}</p>
                      <p className="text-[9px] text-blue-600 font-bold tracking-wide uppercase truncate">{activeTestimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Satellite Avatar with Orbit Arc (Right side red circle & semi-circle arc motion) */}
          <div className="relative shrink-0 flex items-center justify-center w-24 h-24 overflow-visible">
            <AnimatePresence mode="wait">
              <motion.div
                key={`mob-sat-${currentIndex}`}
                initial={{ x: 50, y: -90, opacity: 0, scale: 0.5 }}
                animate={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 1, 
                  scale: 1,
                  transition: {
                    x: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
                    y: { duration: 1.1, ease: [0.34, 1.3, 0.64, 1] },
                    opacity: { duration: 0.6 }
                  }
                }}
                exit={{ 
                  x: 50, 
                  y: 90, 
                  opacity: 0, 
                  scale: 0.5,
                  transition: {
                    x: { duration: 0.8, ease: "easeIn" },
                    y: { duration: 0.8, ease: "easeIn" },
                    opacity: { duration: 0.4 }
                  }
                }}
                className="relative flex items-center justify-center z-10"
              >
                <div 
                  className="relative group cursor-pointer" 
                  onClick={() => setCyclePhase(cyclePhase === 'orbit' ? 'popup' : 'popup_exit')}
                >
                  {activeTestimonial && activeTestimonial.avatar_url && isValidAvatarUrl(activeTestimonial.avatar_url) ? (
                    <img src={activeTestimonial.avatar_url} alt="User Satellite" className="relative w-12 h-12 rounded-full object-cover shadow-lg border-2 border-white z-10 hover:scale-110 transition-transform" />
                  ) : (
                    <div className="relative w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-600 z-10 border-2 border-white hover:scale-110 transition-transform overflow-hidden">
                      <User className="w-6 h-6 text-blue-500" />
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Merged Copyright Footer */}
      <div className="relative z-10 mt-6 text-center text-slate-600/80 text-sm font-medium">
         <p>© 2026 portofolio gilang</p>
      </div>

      <TestimonialForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </section>
  );
}

function SocialPill({ href, icon, label, isPrimary = false }: { href: string, icon: React.ReactNode, label: string, isPrimary?: boolean }) {
  return (
    <a
      href={sanitizeUrl(href)}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 px-4 py-2.5 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all duration-300 shadow-sm hover:shadow-md ${
        isPrimary 
          ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 border-transparent'
          : 'bg-white/80 backdrop-blur-md text-slate-800 border border-slate-200 hover:bg-white hover:border-slate-300 hover:-translate-y-1'
      }`}
      aria-label={label}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}
