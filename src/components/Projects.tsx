"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView, animate } from "framer-motion";
import { X, ExternalLink, Github, ChevronRight, Plus, LayoutGrid, Cpu, Shield, Sparkles, Code, ArrowUpRight, ArrowRight } from "lucide-react";
import { Great_Vibes } from "next/font/google";
import ImageWithLoader from "./ImageWithLoader";

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

function AnimatedCounter({ to, delay = 0, duration = 2.5 }: { to: number; delay?: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      const controls = animate(0, to, {
        duration: duration,
        delay: delay,
        ease: "easeOut",
        onUpdate(value) {
          setCount(Math.round(value));
        }
      });
      return () => controls.stop();
    }
  }, [inView, to, delay, duration]);

  return <span ref={ref}>{count}</span>;
}

// Mock DB for Projects
const PROJECTS = [
  {
    id: 1,
    nama: "Autonomous IoT Monitoring",
    kategori: "IoT",
    foto: "/projects/iot-1.jpg",
    deskripsi: "A fully autonomous IoT monitoring system using ESP32 and MQTT, designed to track environmental data in real-time. Features automated failovers and low-power modes.",
    tahun: 2025,
    techStack: ["ESP32", "MQTT", "Node.js", "React"],
    store_links: [{ type: "github", url: "#" }]
  },
  {
    id: 2,
    nama: "VAPT Automation Script",
    kategori: "Cyber",
    foto: "/projects/cyber-1.jpg",
    deskripsi: "Automated Vulnerability Assessment and Penetration Testing scripts for rapid security auditing. Generates comprehensive compliance reports automatically.",
    tahun: 2024,
    techStack: ["Python", "Bash", "Docker"],
    store_links: [{ type: "github", url: "#" }, { type: "custom", url: "#" }]
  },
  {
    id: 3,
    nama: "LLM Medical Agent",
    kategori: "AI",
    foto: "/projects/ai-1.jpg",
    deskripsi: "An AI agent using RAG and ChromaDB to assist medical professionals with clinical guidelines retrieval and summarization of patient records.",
    tahun: 2026,
    techStack: ["Python", "LangChain", "ChromaDB", "Next.js"],
    store_links: [{ type: "github", url: "#" }]
  },
  {
    id: 4,
    nama: "Harpa SAP Reconciliation",
    kategori: "Software",
    foto: "/projects/web-1.jpg",
    deskripsi: "Fullstack web application for financial reconciliation, integrating with SAP data pipelines. Reduces manual reconciliation time by up to 80%.",
    tahun: 2025,
    techStack: ["Next.js", "NestJS", "PostgreSQL", "SAP"],
    store_links: [{ type: "custom", url: "#" }]
  }
];

const CATEGORIES = [
  { id: "All", label: "All", icon: LayoutGrid },
  { id: "IoT", label: "IoT", icon: Cpu },
  { id: "Cyber", label: "Cyber", icon: Shield },
  { id: "AI", label: "AI", icon: Sparkles },
  { id: "Fullstack", label: "Fullstack", icon: Code }
];

function ExpandableTechStack({ techStack, limit = 3 }: { techStack: string[], limit?: number }) {
  const [expanded, setExpanded] = useState(false);
  const visibleTech = expanded ? techStack : techStack.slice(0, limit);
  const hiddenCount = techStack.length - limit;

  return (
    <div className="flex flex-col gap-2 mb-4 w-full">
      <span className="text-[10px] font-extrabold text-[var(--accent)] uppercase tracking-wider">Tech Stack</span>
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
              className="text-[10px] font-bold text-[var(--text-muted)] ml-1 hover:text-[var(--accent)] cursor-pointer shrink-0"
            >
              +{hiddenCount}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [dbProjects, setDbProjects] = useState<any[]>(PROJECTS);

  useEffect(() => {
    const fetchProjects = async () => {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase.from('projects').select('*').order('year', { ascending: false });
      
      if (data && data.length > 0) {
        const mappedProjects = data.map(item => ({
          id: item.id,
          nama: item.title,
          kategori: item.categories?.[0] || 'Web',
          kategories: item.categories || [],
          foto: item.image ? (item.image.match(/^\d{13}-/) ? `/projects/${item.image}` : `/${item.image}`) : null,
          deskripsi: item.description,
          tahun: item.year,
          techStack: item.tech_stack,
          store_links: [
            ...(item.github_url ? [{ type: "github", url: item.github_url }] : []),
            ...(item.demo_url ? [{ type: "custom", url: item.demo_url }] : [])
          ]
        }));
        setDbProjects(mappedProjects);
      }
    };
    fetchProjects();

    const handleFilterChange = (e: any) => {
      setIsInitialLoad(false);
      setActiveFilter(e.detail);
    };
    window.addEventListener('setProjectFilter', handleFilterChange);
    return () => window.removeEventListener('setProjectFilter', handleFilterChange);
  }, []);

  const filteredProjects = activeFilter === "All" 
    ? dbProjects 
    : dbProjects.filter(p => p.kategories && p.kategories.includes(activeFilter));

  const closePanel = () => setSelectedProject(null);

  return (
    <section className="py-12 md:py-32 bg-white relative overflow-hidden" id="projects">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Top Section */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col lg:flex-row justify-between items-center mb-16 gap-4 lg:gap-16"
        >
          
          {/* Left: Title & Text */}
          <div className="flex flex-col gap-1 md:gap-4 w-full lg:w-3/5 text-left">
              <div className="flex flex-row justify-between items-center w-full">
                  
                  {/* Title */}
                  <div className="flex flex-col items-start scale-[0.65] md:scale-100 origin-left ml-2 md:ml-0 -mr-24 md:mr-0 shrink-0">
                      <div className="flex items-center">
                          <motion.span 
                              variants={{
                                 hidden: { opacity: 0, clipPath: "inset(0 100% 0 0)" },
                                 visible: { opacity: 1, clipPath: "inset(0 0% 0 0)", transition: { duration: 1.0, ease: "easeInOut" } }
                              }}
                              className={`${greatVibes.className} text-[90px] md:text-[130px] font-bold -mr-1 md:-mr-2 leading-none translate-y-1 md:translate-y-2 bg-clip-text text-transparent bg-gradient-to-br from-cyan-500 to-blue-600 px-8 py-4 -mx-8 -my-4 z-10 relative`}
                          >R</motion.span>
                          <motion.h2 
                              variants={{
                                 hidden: { opacity: 1 },
                                 visible: { opacity: 1 }
                              }}
                              className="text-4xl md:text-6xl font-bold display-text text-[var(--text)] tracking-tight leading-[0.9] md:leading-[0.9] z-0 relative"
                          >
                              <span>
                                {"esearch &".split("").map((char, i) => (
                                   <motion.span key={i} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.05, delay: 0.9 + (i * 0.05) } } }}>{char}</motion.span>
                                ))}
                              </span>
                          </motion.h2>
                      </div>
                      <div className="flex items-center mt-[-45px] md:mt-[-50px] ml-12 md:ml-24 relative z-20">
                          <motion.span 
                              variants={{
                                 hidden: { opacity: 0, clipPath: "inset(0 100% 0 0)" },
                                 visible: { opacity: 1, clipPath: "inset(0 0% 0 0)", transition: { duration: 1.0, delay: 1.4, ease: "easeInOut" } }
                              }}
                              className={`${greatVibes.className} text-[90px] md:text-[130px] font-bold -mr-1 md:-mr-2 leading-none translate-y-1 md:translate-y-2 bg-clip-text text-transparent bg-gradient-to-br from-cyan-500 to-blue-600 px-8 py-4 -mx-8 -my-4 z-20 relative`}
                          >P</motion.span>
                          <motion.h2 
                              variants={{
                                 hidden: { opacity: 1 },
                                 visible: { opacity: 1 }
                              }}
                              className="text-4xl md:text-6xl font-bold display-text text-[var(--text)] tracking-tight leading-[0.9] md:leading-[0.9] z-10 relative"
                          >
                              <span>
                                {"rojects".split("").map((char, i) => (
                                   <motion.span key={i} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.05, delay: 2.3 + (i * 0.05) } } }}>{char}</motion.span>
                                ))}
                              </span>
                          </motion.h2>
                      </div>
                  </div>

                  {/* Mobile-only Counter */}
                  <motion.div 
                     variants={{
                        hidden: { opacity: 0, scale: 0.8 },
                        visible: { opacity: 1, scale: 1, transition: { duration: 0.6, delay: 2.8, ease: "easeOut" } }
                     }}
                     className="flex md:hidden flex-col items-center justify-center scale-[0.65] origin-right shrink-0 mr-6 -ml-16"
                  >
                     <span className="text-[70px] leading-none font-bold text-[#0099ff] tracking-tighter flex items-center">
                       <AnimatedCounter to={dbProjects.length} delay={2.9} duration={2.5} /><span className="text-[60px] ml-1">+</span>
                     </span>
                     <span className="text-lg font-semibold text-[var(--text-muted)] mt-1">Projects</span>
                  </motion.div>
                  
              </div>
              
              <motion.div 
                 variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 2.8, ease: "easeOut" } }
                 }}
                 className="mt-0 md:mt-4 text-left pr-2 md:pr-0"
              >
                  <p className="text-[var(--text-muted)] text-base md:text-lg leading-relaxed">
                      Explore my selected research and projects across IoT, AI, Web,<br className="hidden md:block" /> and Applications. Click any card to view its source code and details.
                  </p>
              </motion.div>
          </div>

          {/* Right: Stats & Category Tabs */}
          <motion.div 
             variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.6, delay: 2.8, ease: "easeOut" } }
             }}
             className="w-full lg:w-2/5 flex justify-center lg:justify-end mt-0 h-full self-end pb-2"
          >
             <div className="flex flex-col items-center gap-4 md:gap-10 w-full max-w-full">
               
               {/* Project Count - Desktop Only */}
                <div className="hidden md:flex flex-col items-center justify-center">
                  <span className="text-[70px] md:text-[90px] leading-none font-bold text-[#0099ff] tracking-tighter flex items-center">
                    <AnimatedCounter to={dbProjects.length} delay={2.9} duration={2.5} /><span className="text-[60px] md:text-[80px] ml-1">+</span>
                  </span>
                  <span className="text-lg md:text-xl font-semibold text-[var(--text-muted)] mt-1">Projects</span>
               </div>

               {/* Tabs */}
               <div className="flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-2 w-full overflow-x-auto md:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-2 md:px-0">
                  {CATEGORIES.map((cat) => {
                   const isActive = activeFilter === cat.id;
                   const Icon = cat.icon;
                   
                   return (
                     <button
                       key={cat.id}
                       onClick={() => {
                         setIsInitialLoad(false);
                         setActiveFilter(cat.id);
                       }}
                       className={`relative px-4 py-2 shrink-0 flex flex-col items-center justify-center gap-1.5 text-sm md:text-base font-bold transition-colors duration-300 ${
                         isActive 
                           ? "text-[var(--text)]" 
                           : "text-[var(--text-muted)] hover:text-[var(--text)]"
                       }`}
                     >
                       <Icon className={`w-5 h-5 transition-colors duration-300 ${isActive ? "text-[var(--text)]" : "text-[var(--text-muted)]"}`} />
                       <span>{cat.label}</span>
                       {isActive && (
                         <motion.div
                           layoutId="activeCategory"
                           className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--text)]"
                           initial={false}
                           transition={{ type: "spring", stiffness: 400, damping: 30 }}
                         />
                       )}
                     </button>
                   )
                 })}
               </div>
             </div>
          </motion.div>
        </motion.div>

        {/* Separator Line */}
        <motion.div 
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full h-[1px] bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent mb-12 -mt-4 md:-mt-6 opacity-60" 
        />

        {/* Dynamic Project Grid Layout */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProjects.map((project, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: isInitialLoad ? 0.6 + (index * 0.15) : index * 0.1, ease: "easeOut" }}
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="group cursor-pointer bg-white rounded-[24px] overflow-hidden flex flex-col shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500 border border-slate-100"
                >
                {/* Top Half: Image or Gradient */}
                <div className="h-[220px] w-full relative overflow-hidden bg-slate-50">
                   {project.foto ? (
                     <ImageWithLoader 
                       src={project.foto}
                       alt={project.nama}
                       className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 z-0"
                     />
                   ) : (
                     <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50 group-hover:scale-105 transition-transform duration-700 ease-out z-0" />
                   )}
                   
                   {/* Abstract Glowing Orbs */}
                   <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700 mix-blend-overlay pointer-events-none">
                     <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-400/30 blur-3xl" />
                     <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-400/30 blur-3xl" />
                   </div>
                   
                   {/* Gradient overlay for text readability */}
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"/>
                   
                   {/* Year Watermark */}
                   <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                      <span className="text-[60px] font-black text-slate-900/5 tracking-tighter">{project.tahun}</span>
                   </div>
                   
                   {/* Category Badges Top Left */}
                   <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                     {(project.kategories && project.kategories.length > 0 ? project.kategories : [project.kategori]).map((kat: string, idx: number) => (
                       <span key={idx} className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-bold text-blue-700 uppercase tracking-wider border border-white/50 shadow-sm inline-block">
                         {kat}
                       </span>
                     ))}
                   </div>
                </div>

                {/* Bottom Half: Details */}
                <div className="p-6 flex flex-col flex-1 relative bg-white z-20">
                  <div className="mb-4">
                    <ExpandableTechStack techStack={project.techStack} limit={3} />
                  </div>

                  <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{project.nama}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                    {project.deskripsi}
                  </p>
                  
                  <div className="mt-5 flex items-center text-sm font-bold text-blue-600 group-hover:text-blue-700">
                     <span className="mr-2">Explore</span>
                     <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Auxiliary Pane / Detail Panel */}
      <AnimatePresence>
        {selectedProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePanel}
              className="fixed inset-0 bg-black/20 z-[100] backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full md:w-[600px] h-full bg-[var(--surface)] shadow-2xl z-[110] border-l border-[var(--border)] overflow-y-auto"
            >
              <div className="h-72 bg-slate-100 relative p-6 border-b border-[var(--border)]">
                <button 
                  onClick={closePanel}
                  className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-800 shadow-md transition-colors z-20"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 rounded-3xl flex flex-col items-center justify-center">
                   <span className="text-slate-500 font-bold uppercase tracking-widest">{selectedProject.kategori} Cover</span>
                </div>
              </div>

              <div className="p-10">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold tracking-widest text-[var(--accent)] uppercase">
                      {selectedProject.kategori} • {selectedProject.tahun}
                    </span>
                  </div>
                  <h3 className="text-4xl font-bold display-text mb-6 leading-tight">{selectedProject.nama}</h3>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {selectedProject.techStack.map((tech: string, i: number) => (
                      <span key={i} className="px-4 py-2 rounded-xl bg-white border border-[var(--border)] shadow-sm text-sm font-bold text-slate-600">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <p className="text-[var(--text-muted)] leading-relaxed text-lg">
                    {selectedProject.deskripsi}
                  </p>
                </div>

                <div className="space-y-4 mt-12">
                  <h4 className="font-bold text-[var(--text)] uppercase tracking-wider text-sm mb-6">Project Resources</h4>
                  {selectedProject.store_links.map((link: any, idx: number) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full p-5 bg-white border border-[var(--border)] rounded-2xl flex items-center gap-5 hover:border-[var(--text)] hover:shadow-md transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[var(--text)] group-hover:text-white transition-colors">
                        {link.type === 'github' ? <Github className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
                      </div>
                      <span className="font-bold text-lg flex-1 capitalize">{link.type} Repository</span>
                      <ChevronRight className="w-6 h-6 text-[var(--text-muted)] group-hover:translate-x-2 group-hover:text-[var(--text)] transition-all" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
