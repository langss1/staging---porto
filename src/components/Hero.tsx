"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PROFILE } from "@/data/portfolio";
import ImageWithLoader from "./ImageWithLoader";
import AnimatedCounter from "./AnimatedCounter";
import { Great_Vibes } from "next/font/google";
import { supabase } from "@/lib/supabase";
import { sanitizeUrl } from "@/lib/security";

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
});

export default function Hero() {
    const [profileData, setProfileData] = useState<any>(null);
    const [projectsCount, setProjectsCount] = useState<number>(0);
    const [experiencesCount, setExperiencesCount] = useState<number>(0);

    useEffect(() => {
        const fetchStats = async () => {
            const { data } = await supabase.from('profile').select('*').single();
            if (data) setProfileData(data);
            
            // Fetch total projects + research
            const { count: projCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
            const { count: resCount } = await supabase.from('research').select('*', { count: 'exact', head: true });
            setProjectsCount((projCount || 0) + (resCount || 0));
            
            // Fetch total work experiences
            const { count: expCount } = await supabase.from('work_experiences').select('*', { count: 'exact', head: true });
            setExperiencesCount(expCount || 0);
        };
        fetchStats();
    }, []);

    return (
        <section id="hero" className="w-full min-h-screen flex flex-col px-4 md:px-12 lg:px-24 bg-[var(--bg)] relative pt-12 md:pt-16 pb-16 md:pb-24">
            <div className="max-w-4xl w-full flex flex-col gap-6 md:gap-8 relative z-10 mx-auto">
                
                {/* TOP ROW: Profile Picture (Left) + Name, Subtitle, Buttons (Right) */}
                <div className="flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-10 w-full relative z-20">
                    
                    {/* LEFT: Profile Picture with Blue Gradient Ring */}
                    <motion.div
                        initial={{ opacity: 0, filter: "blur(10px)", scale: 0.9 }}
                        animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                        transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
                        className="flex-shrink-0 mx-auto md:mx-0"
                    >
                        <div className="w-[160px] h-[160px] md:w-[220px] md:h-[220px] rounded-full p-[3px] md:p-[4px] bg-gradient-to-tr from-cyan-300 via-blue-500 to-blue-800 shadow-lg shadow-blue-500/20">
                            <div className="w-full h-full rounded-full border-[4px] border-[var(--bg)] overflow-hidden bg-[var(--surface)]">
                                <ImageWithLoader
                                    src={profileData?.image_url || "/Profil.jpeg"}
                                    alt={profileData?.name || "Gilang Wasis"}
                                    className="w-full h-full object-cover object-center"
                                    priority
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT: Name, Subtitle, and Buttons */}
                    <div className="flex flex-col justify-center flex-grow w-full gap-3 md:gap-4 text-center md:text-left">
                        
                        {/* Name */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0, duration: 0.8, ease: "easeOut" }}
                            className="w-full flex items-center justify-center md:justify-start"
                        >
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--text)]">
                                {profileData?.name || "Gilang Wasis"}<span className="text-blue-500">.</span>
                            </h1>
                        </motion.div>

                        {/* Subtitle / Kata2 - 1 Baris secara Paksa (No Wrap) */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
                            className="w-full flex items-center justify-center md:justify-start"
                        >
                            <div className="text-[0.75rem] sm:text-sm md:text-base lg:text-lg font-medium tracking-wide md:tracking-wider uppercase text-[var(--text)] text-center md:text-left leading-snug">
                                Multidisciplinary Engineer<br className="block md:hidden" /><span className="hidden md:inline"> </span>WITH Innovative Problem Solving
                            </div>
                        </motion.div>

                        {/* Action Buttons (Instagram Style) */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.3, duration: 0.8, ease: "easeOut" }}
                            className="flex flex-row justify-center md:justify-start gap-2 mt-1"
                        >
                            <a 
                                href={sanitizeUrl(profileData?.cv_link || PROFILE?.cvLink || "#")} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-1.5 md:py-2 bg-[#EFEFEF] hover:bg-[#DBDBDB] text-black text-sm font-semibold rounded-lg transition-colors border border-transparent"
                            >
                                Download CV
                            </a>
                            <a 
                                href="#projects" 
                                className="px-6 py-1.5 md:py-2 bg-[#EFEFEF] hover:bg-[#DBDBDB] text-black text-sm font-semibold rounded-lg transition-colors border border-transparent"
                            >
                                Explore Work
                            </a>
                        </motion.div>
                    </div>
                </div>

                {/* MIDDLE ROW: Description Box */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.8, ease: "easeOut" }}
                    className="w-full relative mt-4 md:mt-6"
                >
                    <fieldset className="bg-white border border-[#DBDBDB] px-5 pb-6 md:px-8 md:pb-8 pt-3 rounded-2xl relative z-10 text-[0.95rem] md:text-base text-[var(--text)] leading-relaxed md:leading-relaxed text-left shadow-sm">
                        
                        {/* Title: About Me (Legend Style intersecting top border natively) */}
                        <legend className="ml-0 px-1">
                            <h2 className="text-xl md:text-2xl font-bold text-[var(--text)] flex items-baseline tracking-wide">
                                <span className={`${greatVibes.className} text-5xl md:text-6xl mr-0.5 leading-none translate-y-1 md:translate-y-1.5 bg-clip-text text-transparent bg-gradient-to-br from-cyan-500 to-blue-600 px-2 py-4 -mx-2 -my-4`}>A</span>
                                bout &nbsp;
                                <span className={`${greatVibes.className} text-5xl md:text-6xl mr-0.5 leading-none translate-y-1 md:translate-y-1.5 bg-clip-text text-transparent bg-gradient-to-br from-cyan-500 to-blue-600 px-2 py-4 -mx-2 -my-4`}>M</span>
                                e
                            </h2>
                        </legend>
                        
                        <div className="mt-2">
                            {profileData?.about_me || "Undergraduate student @ Telkom University. Specializing in AI Engineering, Cyber Security, IoT, and Fullstack Development. Aspiring to become a key proficient IT resource in Indonesia, delivering secure & intelligent digital solutions."}
                        </div>
                    </fieldset>
                </motion.div>

                {/* BOTTOM ROW: Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6, duration: 0.8, ease: "easeOut" }}
                    className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4 md:mt-5"
                >
                    {/* Stat 1: GPA */}
                    <div className="bg-white border border-[#DBDBDB] p-4 md:p-5 rounded-xl flex flex-col items-center justify-center text-center hover:border-blue-300 hover:shadow-md transition-all">
                        <span className="text-xl md:text-2xl font-bold text-[var(--text)] mb-1">
                            <AnimatedCounter value={profileData?.gpa || 3.94} decimals={2} delay={1.8} duration={2.5} />
                        </span>
                        <span className="text-[0.65rem] md:text-xs text-[var(--text-muted)] font-medium">GPA</span>
                    </div>

                    {/* Stat 2: Projects */}
                    <div className="bg-white border border-[#DBDBDB] p-4 md:p-5 rounded-xl flex flex-col items-center justify-center text-center hover:border-blue-300 hover:shadow-md transition-all">
                        <span className="text-xl md:text-2xl font-bold text-[var(--text)] flex items-center mb-1">
                            <AnimatedCounter value={projectsCount || 30} delay={1.8} duration={2.5} /><span className="text-blue-500 ml-0.5">+</span>
                        </span>
                        <span className="text-[0.65rem] md:text-xs text-[var(--text-muted)] font-medium">Projects</span>
                    </div>

                    {/* Stat 3: Years */}
                    <div className="bg-white border border-[#DBDBDB] p-4 md:p-5 rounded-xl flex flex-col items-center justify-center text-center hover:border-blue-300 hover:shadow-md transition-all">
                        <span className="text-xl md:text-2xl font-bold text-[var(--text)] flex items-center mb-1">
                            <AnimatedCounter value={profileData?.years_experience || 2} delay={1.8} duration={2.5} /><span className="text-blue-500 ml-0.5">+</span>
                        </span>
                        <span className="text-[0.65rem] md:text-xs text-[var(--text-muted)] font-medium">Years</span>
                    </div>

                    {/* Stat 4: Experiences */}
                    <div className="bg-white border border-[#DBDBDB] p-4 md:p-5 rounded-xl flex flex-col items-center justify-center text-center hover:border-blue-300 hover:shadow-md transition-all">
                        <span className="text-xl md:text-2xl font-bold text-[var(--text)] flex items-center mb-1 h-[28px] md:min-h-[32px]">
                            <AnimatedCounter value={experiencesCount || 19} delay={1.8} duration={2.5} /><span className="text-blue-500 ml-0.5">+</span>
                        </span>
                        <span className="text-[0.65rem] md:text-xs text-[var(--text-muted)] font-medium">Experiences</span>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}