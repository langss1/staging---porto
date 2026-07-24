"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Great_Vibes } from "next/font/google";
import { 
  Cpu, 
  Shield, 
  Code, 
  Database, 
  Globe, 
  Wifi, 
  Smartphone, 
  Sparkles,
  ArrowDownCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"] });

// Data Structure
const SKILL_DATA = {
  iot: { 
    id: 'iot',
    label: "IoT Engineering", 
    mobileLabel: "IoT",
    items: ["ESP32", "MQTT", "C++", "Sensors", "MicroPython"],
    evidence: "Extensive experience designing autonomous monitoring systems and building end-to-end IoT pipelines from edge devices to cloud dashboards.",
    projectsText: "See IoT Projects",
    icon: Cpu
  },
  cyber: { 
    id: 'cyber',
    label: "Cyber Security", 
    mobileLabel: "Cyber",
    items: ["OWASP Top 10", "VAPT", "MITRE ATT&CK", "ISO 27002"],
    evidence: "Conducting vulnerability assessments and penetration testing. Familiar with industry standards to secure web applications and network infrastructures.",
    projectsText: "See VAPT & Security Audit projects",
    icon: Shield
  },
  ai: { 
    id: 'ai',
    label: "AI Engineering", 
    mobileLabel: "AI",
    items: ["RAG", "LLM Agents", "ChromaDB", "Prompt Engineering"],
    evidence: "Developing intelligent agents and Retrieval-Augmented Generation systems using state-of-the-art LLMs, integrated with vector databases for knowledge retrieval.",
    projectsText: "See AI Assistants & NLP projects",
    icon: Sparkles
  },
  software: { 
    id: 'software',
    label: "Fullstack", 
    mobileLabel: "Software",
    items: ["React", "Python", "SQL", "Flutter", "Next.js"],
    evidence: "Building scalable web and mobile applications from end-to-end. Experienced in modern frontend frameworks and robust backend architectures.",
    projectsText: "See Web & Mobile App projects",
    icon: Code
  }
};

const tabs = [SKILL_DATA.iot, SKILL_DATA.cyber, SKILL_DATA.ai, SKILL_DATA.software];

// Dynamic Logo Component
function DynamicLogo({ activeTab, tabsData }: { activeTab: string, tabsData: Record<string, any> }) {
  // Map string icon names from DB to Lucide components if needed, or fallback
  const iconsMap: Record<string, any> = { Cpu, Shield, Sparkles, Code };
  
  const iconName = tabsData[activeTab]?.icon;
  const ActiveIcon = typeof iconName === 'string' ? (iconsMap[iconName] || Cpu) : (iconName || Cpu);

  return (
    <div className="relative group">
      {/* Background glowing blob */}
      <div className="absolute inset-0 bg-blue-100 rounded-[2rem] blur-xl transition-colors opacity-60"></div>
      
      {/* Logo container */}
      <div className="relative w-32 h-32 md:w-44 md:h-44 bg-white border border-[#DBDBDB] rounded-[2rem] shadow-sm flex flex-col items-center justify-center transition-transform hover:scale-105">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, scale: 0.2, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.8, filter: "blur(10px)" }}
            transition={{ duration: 0.5, type: "spring" }}
            className="absolute"
          >
            <ActiveIcon className="w-12 h-12 md:w-16 md:h-16 text-blue-600" strokeWidth={2.5} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function AutoScrollSkills({ items }: { items: string[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset scroll position and progress when skill category changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
    setScrollProgress(0);
    setIsInteracting(false);
  }, [items]);

  // Trigger 3-second hold on user interaction
  const triggerHold = () => {
    setIsInteracting(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 3000); // Hold for 3 seconds, then resume auto-scroll
  };

  const updateProgress = () => {
    const el = scrollRef.current;
    const inner = innerRef.current;
    if (el && inner && inner.clientWidth > 0) {
      const currentScroll = el.scrollLeft % inner.clientWidth;
      const progress = currentScroll / inner.clientWidth;
      setScrollProgress(Math.min(1, Math.max(0, progress)));
    }
  };

  useEffect(() => {
    const handleUserInteraction = () => {
      triggerHold();
    };

    const el = scrollRef.current;
    if (el) {
      el.addEventListener('touchstart', handleUserInteraction, { passive: true });
      el.addEventListener('touchmove', handleUserInteraction, { passive: true });
      el.addEventListener('mousedown', handleUserInteraction, { passive: true });
      el.addEventListener('wheel', handleUserInteraction, { passive: true });
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (el) {
        el.removeEventListener('touchstart', handleUserInteraction);
        el.removeEventListener('touchmove', handleUserInteraction);
        el.removeEventListener('mousedown', handleUserInteraction);
        el.removeEventListener('wheel', handleUserInteraction);
      }
    };
  }, [items]);

  // Infinite Seamless Auto-Scroll Loop
  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();
    
    const render = (time: number) => {
      const el = scrollRef.current;
      const inner = innerRef.current;

      if (el && inner) {
        if (!isInteracting) {
          const delta = time - lastTime;
          el.scrollLeft += 0.03 * delta; // continuous pleasant slow speed (~30px/sec)
          
          // Reset loop seamlessly when scrollLeft reaches inner width
          if (inner.clientWidth > 0 && el.scrollLeft >= inner.clientWidth) {
            el.scrollLeft -= inner.clientWidth;
          }
        }
        updateProgress();
      }
      lastTime = time;
      animationId = requestAnimationFrame(render);
    };
    
    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [isInteracting]);

  return (
    <div className="relative group/skills w-full">
      {/* Left Gradient Fade Mask */}
      <div className="md:hidden absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />

      {/* Right Gradient Fade Mask */}
      <div className="md:hidden absolute right-0 top-0 bottom-0 w-5 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

      {/* Scrollable Items Container */}
      <div 
        ref={scrollRef}
        className="flex md:block overflow-x-auto md:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full px-2 md:px-0 py-1"
      >
        {/* Set 1 (Original for inner.clientWidth measurement) */}
        <div ref={innerRef} className="flex md:flex-wrap gap-2 shrink-0 w-max md:w-full">
          {items.map((item, idx) => (
            <button
              key={`orig-${item}-${idx}`}
              type="button"
              onClick={triggerHold}
              className="px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-semibold bg-blue-50/60 text-blue-700 border border-blue-100/70 whitespace-nowrap shrink-0 hover:bg-blue-100/70 transition-colors cursor-pointer active:scale-95"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Set 2 (Duplicate for continuous loop) */}
        <div className="flex md:hidden gap-2 shrink-0 ml-2">
          {items.map((item, idx) => (
            <button
              key={`dup1-${item}-${idx}`}
              type="button"
              onClick={triggerHold}
              className="px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-semibold bg-blue-50/60 text-blue-700 border border-blue-100/70 whitespace-nowrap shrink-0 hover:bg-blue-100/70 transition-colors cursor-pointer active:scale-95"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Set 3 (Duplicate to guarantee scrollWidth > inner.clientWidth + clientWidth) */}
        <div className="flex md:hidden gap-2 shrink-0 ml-2">
          {items.map((item, idx) => (
            <button
              key={`dup2-${item}-${idx}`}
              type="button"
              onClick={triggerHold}
              className="px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-semibold bg-blue-50/60 text-blue-700 border border-blue-100/70 whitespace-nowrap shrink-0 hover:bg-blue-100/70 transition-colors cursor-pointer active:scale-95"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Swipe Indicator Bar Under Pills (Mobile) */}
      <div className="md:hidden flex items-center justify-center mt-3">
        <div className="w-36 sm:w-48 h-1.5 bg-blue-100/90 rounded-full overflow-hidden relative shadow-inner">
          <div 
            className="h-full bg-blue-600 rounded-full transition-transform duration-75 ease-out shadow-sm"
            style={{
              width: '35%',
              transform: `translateX(${scrollProgress * 185}%)`
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function MySkills() {
  const [activeTab, setActiveTab] = useState('iot');
  const [dynamicSkills, setDynamicSkills] = useState<Record<string, any>>(SKILL_DATA);
  const [tabsList, setTabsList] = useState<any[]>(tabs);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { supabase } = await import('@/lib/supabase');
      const { data: skillsData } = await supabase.from('m_shape_skills').select('*');
      
      if (skillsData && skillsData.length > 0) {
        const newSkillsData: Record<string, any> = {};
        skillsData.forEach(item => {
          newSkillsData[item.id] = {
            id: item.id,
            label: item.label,
            mobileLabel: item.mobile_label,
            items: item.items,
            evidence: item.evidence,
            projectsText: item.projects_text,
            icon: item.icon
          };
        });
        setDynamicSkills(newSkillsData);
        const ordered = ['iot', 'cyber', 'ai', 'software'].map(id => newSkillsData[id]).filter(Boolean);
        setTabsList(ordered.length > 0 ? ordered : skillsData);
        if (ordered.length > 0) setActiveTab(ordered[0].id);
      }

      const { data: projectsData, error: projError } = await supabase.from('projects').select('*').order('year', { ascending: false });
      if (projectsData) {
        setProjects(projectsData);
      } else if (projError) {
        console.error("Error fetching projects for MySkills:", projError);
      }
    };
    fetchData();
  }, []);

  const activeData = dynamicSkills[activeTab] || SKILL_DATA.iot;

  const tabToKategori: Record<string, string> = {
    'iot': 'IoT',
    'cyber': 'Cyber',
    'ai': 'AI',
    'software': 'Fullstack'
  };
  const currentKategori = tabToKategori[activeTab] || 'Fullstack';
  
  const relatedProjects = projects
    .filter(p => {
       if (activeData.projectsText && activeData.projectsText.trim() !== '') {
          const featuredTitles = activeData.projectsText.split(',').map((t: string) => t.trim().toLowerCase()).filter(Boolean);
          if (featuredTitles.length > 0) {
            const projectTitle = (p.nama || p.title || '').toLowerCase();
            return featuredTitles.includes(projectTitle);
          }
       }
       const cats = p.categories || [];
       return cats.includes(currentKategori) || (cats[0] === currentKategori);
    })
    .slice(0, 3);

  return (
    <section id="skills" className="w-full min-h-screen py-12 md:py-24 px-4 md:px-12 lg:px-24 bg-[var(--bg)] relative overflow-hidden flex flex-col justify-center">
      
      {/* Antigravity Dot Pattern Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #000 1.5px, transparent 1.5px)", backgroundSize: "32px 32px" }}></div>
      
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-5xl w-full mx-auto flex flex-col gap-8 md:gap-10 relative z-10"
      >
          
          {/* Top Section */}
          <div className="flex flex-row md:flex-row justify-between gap-4 md:gap-8 items-center md:items-start w-full">
             
             {/* Left: Title & Text */}
             <div className="flex flex-col gap-4 w-full md:w-3/4 text-left md:text-left">
                  <div className="flex items-center justify-start md:justify-start">
                      <div className="flex items-center">
                          <motion.span 
                            variants={{
                               hidden: { opacity: 0, clipPath: "inset(0 100% 0 0)" },
                               visible: { opacity: 1, clipPath: "inset(0 0% 0 0)", transition: { duration: 1.0, ease: "easeInOut" } }
                            }}
                            className={`${greatVibes.className} text-[80px] md:text-[140px] font-bold -mr-1 md:-mr-2 leading-none translate-y-1 md:translate-y-2 bg-clip-text text-transparent bg-gradient-to-br from-cyan-500 to-blue-600 px-6 py-4 -mx-6 md:px-10 md:py-6 md:-mx-10 -my-6 z-10 relative`}
                          >M</motion.span>

                          {/* Shape Skills + Mobile Logo side by side */}
                          <div className="flex items-center gap-2">
                            <motion.h2 
                              variants={{
                                 hidden: { opacity: 1 },
                                 visible: { opacity: 1 }
                              }}
                              className="flex flex-col items-start text-3xl md:text-6xl font-bold display-text text-[var(--text)] tracking-tight leading-[0.9] md:leading-[0.9] z-0"
                            >
                                <span>
                                  {"Shape".split("").map((char, i) => (
                                     <motion.span key={i} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.05, delay: 0.9 + (i * 0.05) } } }}>{char}</motion.span>
                                  ))}
                                </span>
                                <span>
                                  {"Skills".split("").map((char, i) => (
                                     <motion.span key={i} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.05, delay: 1.15 + (i * 0.05) } } }}>{char}</motion.span>
                                  ))}
                                </span>
                            </motion.h2>

                            <motion.div
                              variants={{
                                 hidden: { opacity: 0, scale: 0.8 },
                                 visible: { opacity: 1, scale: 1, transition: { duration: 0.6, delay: 1.6, ease: "easeOut" } }
                              }}
                              className="flex md:hidden shrink-0"
                            >
                              <div className="scale-[0.55] origin-center">
                                <DynamicLogo activeTab={activeTab} tabsData={dynamicSkills} />
                              </div>
                            </motion.div>
                          </div>

                      </div>
                  </div>
                  
                  <motion.div 
                    variants={{
                       hidden: { opacity: 0, y: 20 },
                       visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 1.5, ease: "easeOut" } }
                    }}
                    className="mt-2 text-left"
                 >
                    <p className="text-[var(--text-muted)] text-base md:text-lg leading-relaxed">
                        Three years of active research and development on campus, driven by intensive coursework,<br className="hidden md:block" /> research lab studies, and hands-on industry experience.
                    </p>
                 </motion.div>
             </div>
             
             {/* Right: Dynamic Logo — Desktop only */}
             <motion.div 
                variants={{
                   hidden: { opacity: 0, scale: 0.8 },
                   visible: { opacity: 1, scale: 1, transition: { duration: 0.6, delay: 1.6, ease: "easeOut" } }
                }}
                className="hidden md:flex justify-end w-1/4 shrink-0"
             >
                  <DynamicLogo activeTab={activeTab} tabsData={dynamicSkills} />
             </motion.div>
          </div>
          
          {/* Bottom Section (Copybook layout) */}
          <motion.div 
             variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 1.8, ease: "easeOut" } }
             }}
             className="flex flex-col w-full"
          >
             {/* Tabs Row */}
             <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] gap-1 md:gap-2 px-2 md:px-8 relative z-10 translate-y-[1px]">
                 {tabsList.map(tab => (
                     <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-3 md:px-8 md:py-4 rounded-t-xl font-bold transition-all border border-[#DBDBDB] whitespace-nowrap text-sm md:text-base ${
                            activeTab === tab.id 
                            ? 'bg-white text-blue-600 border-b-white' 
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border-b-[#DBDBDB] opacity-80 hover:opacity-100'
                        }`}
                     >
                        <span className="hidden md:inline">{tab.label}</span>
                        <span className="inline md:hidden">{tab.mobileLabel || tab.label}</span>
                     </button>
                 ))}
             </div>
             
             {/* Copybook Body */}
             <div className="bg-white border border-[#DBDBDB] rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-sm relative z-0">
                  
                  <AnimatePresence mode="wait">
                    <motion.div 
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16"
                    >
                        
                        {/* Left Column: Skill + Evidence */}
                        <div className="flex flex-col gap-6 md:border-r border-[#DBDBDB] md:pr-10">
                            <h3 className="text-xl md:text-2xl font-bold text-[var(--text)]">Skills & Evidence</h3>
                            
                            <AutoScrollSkills items={activeData.items.slice(0, 5)} />
                            
                            <p className="text-[var(--text-muted)] leading-relaxed text-sm md:text-base">
                                {activeData.evidence}
                            </p>
                        </div>
                        
                        {/* Right Column: Projects Reference */}
                        <div className="flex flex-col gap-4 justify-center">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50/80 text-blue-600 flex items-center justify-center border border-blue-100/50">
                                    <span className="text-xl font-black">+</span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-[var(--text)]">Related Projects</h3>
                            </div>
                            
                            <div className="flex flex-col gap-3">
                                {relatedProjects.length > 0 ? relatedProjects.map(proj => (
                                    <a key={proj.id} href="#projects" onClick={(e) => {
                                        e.preventDefault();
                                        window.dispatchEvent(new CustomEvent('setProjectFilter', { detail: currentKategori }));
                                        document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                                    }} className="group flex items-center justify-between p-3 rounded-xl border border-[#DBDBDB] hover:border-blue-300 hover:shadow-md transition-all bg-gray-50/50">
                                        <div className="flex flex-col pr-4">
                                            <span className="font-bold text-[var(--text)] text-sm group-hover:text-blue-600 transition-colors line-clamp-1">{proj.nama || proj.title}</span>
                                            <span className="text-xs text-[var(--text-muted)]">{proj.year || proj.tahun}</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[#DBDBDB] group-hover:border-blue-200 shadow-sm shrink-0 transition-all group-hover:bg-blue-50">
                                            <ArrowDownCircle className="w-4 h-4 text-blue-500 -rotate-90 group-hover:rotate-0 transition-transform" />
                                        </div>
                                    </a>
                                )) : (
                                    <div className="p-4 border border-dashed border-[#DBDBDB] rounded-xl bg-gray-50/50 flex flex-col items-center justify-center text-center">
                                        <p className="text-sm text-[var(--text-muted)] italic mb-1">No featured projects yet.</p>
                                        <p className="text-xs text-gray-400">Check the section below for more.</p>
                                    </div>
                                )}
                            </div>
                            
                            <a href="#projects" onClick={(e) => {
                                e.preventDefault();
                                window.dispatchEvent(new CustomEvent('setProjectFilter', { detail: currentKategori }));
                                document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                            }} className="mt-2 text-sm inline-flex items-center justify-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors w-full md:w-fit px-4 py-2.5 rounded-lg bg-blue-50/50 border border-blue-100 hover:bg-blue-100 cursor-pointer">
                                View All {currentKategori} Projects
                            </a>
                        </div>
                    </motion.div>
                  </AnimatePresence>
              </div>
          </motion.div>
      </motion.div>
    </section>
  );
}
