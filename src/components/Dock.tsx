"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Linkedin, Github, Mail, Download, Menu, Instagram, FileText, X } from "lucide-react";
import { PROFILE } from "@/data/portfolio";
import { useState, useEffect } from "react";
import { sanitizeUrl } from "@/lib/security";

export default function Dock() {
    const [isVisible, setIsVisible] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [profileData, setProfileData] = useState<any>(null);

    useEffect(() => {
        const handleScroll = () => {
            const projects = document.getElementById("projects");
            const contact = document.getElementById("contact");

            if (projects) {
                const scrollY = window.scrollY;
                const windowHeight = window.innerHeight;
                const start = projects.offsetTop - 300;
                const isContactVisible = contact
                    ? (scrollY + windowHeight > contact.offsetTop + 10)
                    : false;

                if (scrollY >= start && !isContactVisible) {
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
            }
        };

        const handleToggleMobileDock = () => {
            setIsMobileOpen(prev => !prev);
        };

        window.addEventListener("scroll", handleScroll);
        window.addEventListener("toggleMobileDock", handleToggleMobileDock);
        handleScroll();

        const fetchProfile = async () => {
            try {
                const { supabase } = await import('@/lib/supabase');
                const { data } = await supabase.from('profile').select('linkedin_url, github_url, instagram_url, email, cv_link').single();
                if (data) setProfileData(data);
            } catch (e) {}
        };
        fetchProfile();

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("toggleMobileDock", handleToggleMobileDock);
        };
    }, []);

    return (
        <>
            {/* Desktop Dock (Hidden on Mobile, Visible on Desktop when scrolled) */}
            <div className="hidden md:flex fixed bottom-6 left-0 right-0 z-50 justify-center items-center pointer-events-none px-4">
                <AnimatePresence>
                    {isVisible && (
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="flex items-center gap-4 w-full max-w-md justify-center"
                        >
                            <div className="pointer-events-auto flex items-center gap-2 p-2 bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl shadow-2xl">
                                <SocialIcon href={profileData?.linkedin_url || PROFILE.socials.linkedin} icon={<Linkedin size={20} />} label="LinkedIn" />
                                <SocialIcon href={profileData?.github_url || PROFILE.socials.github} icon={<Github size={20} />} label="Github" />
                                <SocialIcon href={profileData?.instagram_url || "https://www.instagram.com/gilangwasis/"} icon={<Instagram size={20} />} label="Instagram" />
                                <SocialIcon href={profileData?.email ? (profileData.email.startsWith('mailto:') ? profileData.email : `mailto:${profileData.email}`) : PROFILE.socials.email} icon={<Mail size={20} />} label="Email" />

                                <div className="w-px h-6 bg-slate-200 mx-1" />

                                <a
                                    href={sanitizeUrl(profileData?.cv_link || PROFILE.cvLink)}
                                    target="_blank"
                                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-colors"
                                >
                                    CV <FileText size={16} />
                                </a>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Mobile Dock Popup (Shown ONLY when clicking Profile "GW." on mobile) */}
            <AnimatePresence>
                {isMobileOpen && (
                    <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 flex justify-center items-center pointer-events-none px-4">
                        <motion.div
                            initial={{ y: 80, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 80, opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                            className="pointer-events-auto flex items-center gap-2 p-2 bg-white/90 backdrop-blur-md border border-white/50 rounded-2xl shadow-2xl"
                        >
                            <SocialIcon href={profileData?.linkedin_url || PROFILE.socials.linkedin} icon={<Linkedin size={20} />} label="LinkedIn" />
                            <SocialIcon href={profileData?.github_url || PROFILE.socials.github} icon={<Github size={20} />} label="Github" />
                            <SocialIcon href={profileData?.instagram_url || "https://www.instagram.com/gilangwasis/"} icon={<Instagram size={20} />} label="Instagram" />
                            <SocialIcon href={profileData?.email ? (profileData.email.startsWith('mailto:') ? profileData.email : `mailto:${profileData.email}`) : PROFILE.socials.email} icon={<Mail size={20} />} label="Email" />

                            <div className="w-px h-6 bg-slate-200 mx-1" />

                            <a
                                href={sanitizeUrl(profileData?.cv_link || PROFILE.cvLink)}
                                target="_blank"
                                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-colors"
                            >
                                CV <FileText size={16} />
                            </a>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

function SocialIcon({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <motion.a
            href={sanitizeUrl(href)}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -3 }}
            className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title={label}
        >
            {icon}
        </motion.a>
    );
}