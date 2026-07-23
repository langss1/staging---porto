"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import ProfileEditor from "./ProfileEditor";
import SocialLinksEditor from "./SocialLinksEditor";
import TestimonialsModerator from "./TestimonialsModerator";
import GenericEditor, { ColumnDef } from "./GenericEditor";
import { motion, AnimatePresence } from "framer-motion";
import { User, Sparkles, Folder, Briefcase, Trophy, Users, Globe, LogOut, ChevronLeft, MessageSquare } from "lucide-react";

const SECTIONS = [
  { id: 'Profile', label: 'Profile & Details', icon: User, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'hover:border-blue-500/50' },
  { id: 'Skills', label: 'M-Shape Skills', icon: Sparkles, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'hover:border-indigo-500/50' },
  { id: 'Projects', label: 'Research & Projects', icon: Folder, color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'hover:border-cyan-500/50' },
  { id: 'Experiences', label: 'Work Experiences', icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'hover:border-emerald-500/50' },
  { id: 'Honors', label: 'Honors & Awards', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'hover:border-amber-500/50' },
  { id: 'Organizations', label: 'Organizations', icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'hover:border-violet-500/50' },
  { id: 'Impact', label: 'Impact / Volunteering', icon: Globe, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'hover:border-rose-500/50' },
  { id: 'Testimonials', label: 'Testimonials', icon: MessageSquare, color: 'text-teal-500', bg: 'bg-teal-500/10', border: 'hover:border-teal-500/50' },
  { id: 'Socials', label: 'Navbar / Social Links', icon: Globe, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'hover:border-pink-500/50' },
];

const COLUMNS: Record<string, ColumnDef[]> = {
  Skills: [
    { key: 'items', label: 'Skills List', type: 'array' },
    { key: 'evidence', label: 'Evidence / Description', type: 'textarea' },
    { key: 'projects_text', label: 'Featured Projects', type: 'project_selector' },
  ],
  Projects: [
    { key: 'title', label: 'Project Title', type: 'text' },
    { key: 'categories', label: 'Categories', type: 'select_array', options: ['AI', 'Cyber', 'IoT', 'Fullstack'] },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'tech_stack', label: 'Tech Stack', type: 'array' },
    { key: 'github_url', label: 'GitHub URL', type: 'text' },
    { key: 'image', label: 'Project Image Upload', type: 'image' },
  ],
  Experiences: [
    { key: 'posisi', label: 'Position', type: 'text' },
    { key: 'categories', label: 'Categories', type: 'select_array', options: ['AI', 'Cyber', 'IoT', 'Fullstack'] },
    { key: 'company', label: 'Company', type: 'text' },
    { key: 'masa', label: 'Period (e.g. Aug 2024 - Jan 2025)', type: 'text' },
    { key: 'image', label: 'Evidence Image Upload', type: 'image' },
    { key: 'tech_stack', label: 'Tech Stack', type: 'array' },
    { key: 'poin', label: 'Key Points / Responsibilities', type: 'array' },
  ],
  Honors: [
    { key: 'title', label: 'Award Title', type: 'text' },
    { key: 'event', label: 'Event / Competition', type: 'text' },
    { key: 'year', label: 'Year', type: 'text' },
    { key: 'desc_text', label: 'Institution / Description', type: 'textarea' },
    { key: 'image', label: 'Award Image / Upload', type: 'image' },
  ],
  Organizations: [
    { key: 'role', label: 'Role', type: 'text' },
    { key: 'org', label: 'Organization', type: 'text' },
    { key: 'period', label: 'Period', type: 'text' },
    { key: 'location', label: 'Status', type: 'select', options: ['ACTIVE', 'UNACTIVE'] },
    { key: 'image', label: 'Organization Logo / Image', type: 'image' },
    { key: 'responsibilities', label: 'Responsibilities', type: 'array' },
  ],
  Impact: [
    { key: 'title', label: 'Role / Title', type: 'text' },
    { key: 'organization', label: 'Organization / Initiative', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'items', label: 'Key Points / Impacts', type: 'array' },
    { key: 'image', label: 'Evidence Image Upload', type: 'image' },
  ],
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login");
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderContent = () => {
    if (!activeTab) return null;

    if (activeTab === 'Profile') {
      return <ProfileEditor onClose={() => setActiveTab(null)} />;
    }
    
    if (activeTab === 'Socials') {
      return <SocialLinksEditor onClose={() => setActiveTab(null)} />;
    }
    
    if (activeTab === 'Testimonials') {
      return <TestimonialsModerator />;
    }
    
    const tableMapping: Record<string, string> = {
      Skills: 'm_shape_skills',
      Projects: 'projects',
      Experiences: 'work_experiences',
      Honors: 'honors',
      Organizations: 'organizations',
      Impact: 'impacts'
    };

    if (COLUMNS[activeTab]) {
      return (
        <GenericEditor 
          tableName={tableMapping[activeTab]} 
          title={`Manage ${SECTIONS.find(s => s.id === activeTab)?.label}`}
          columns={COLUMNS[activeTab]}
        />
      );
    }

    return (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700">Coming Soon</h3>
            <p className="text-slate-500 mt-2">The editor for {activeTab} is currently being built.</p>
          </div>
        );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-500/30 selection:text-blue-900">
      {/* Sleek Glassmorphic Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <header className="max-w-[1400px] mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center transition-all">
          <div className="flex items-center gap-4">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-black tracking-tight text-slate-900 cursor-pointer flex items-center gap-3"
              onClick={() => setActiveTab(null)}
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 text-sm shadow-sm">
                GW
              </div>
              <span className="hidden sm:block">Admin Panel</span>
            </motion.h1>
            
            <AnimatePresence>
              {activeTab && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -10 }}
                  className="hidden md:flex items-center gap-3"
                >
                  <span className="text-slate-300">/</span>
                  <span className="font-bold text-slate-700 bg-slate-100 px-4 py-1.5 rounded-full text-sm border border-slate-200 shadow-sm">
                    {SECTIONS.find(s => s.id === activeTab)?.label || activeTab}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3">
            <AnimatePresence>
              {activeTab && (
                <motion.button 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onClick={() => setActiveTab(null)}
                  className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-full px-4 py-1.5 transition-all border border-slate-200 shadow-sm"
                >
                  <ChevronLeft size={16} /> Dashboard
                </motion.button>
              )}
            </AnimatePresence>
            {!activeTab && (
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/admin/login");
                }}
                className="group flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-all duration-300 border border-red-100"
              >
                <LogOut size={16} className="transition-transform group-hover:-translate-x-1" />
                <span className="hidden md:block">Sign out</span>
              </button>
            )}
          </div>
        </header>
      </div>
      
      <main className="flex-1 max-w-[1400px] w-full mx-auto py-12 px-4 sm:px-6 lg:px-8 relative">
        
        {/* Subtle Background Glows */}
        <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-[120px] pointer-events-none" />

        <AnimatePresence mode="wait">
          {!activeTab ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              <div className="mb-10">
                <h2 className="text-3xl md:text-4xl font-black display-text text-slate-900 mb-2">Welcome Back.</h2>
                <p className="text-slate-500 text-lg font-medium">Select a section to manage your portfolio content.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {SECTIONS.map((section, idx) => {
                  const Icon = section.icon;
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      key={section.id} 
                      onClick={() => setActiveTab(section.id)}
                      className={`group relative bg-white border border-slate-200 rounded-2xl p-6 cursor-pointer overflow-hidden transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      
                      <div className="relative z-10 flex items-start justify-between">
                        <div>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-blue-50 text-blue-600 border border-blue-100`}>
                            <Icon size={24} strokeWidth={2.5} />
                          </div>
                          <h3 className="font-bold text-xl text-slate-900 mb-1">{section.label}</h3>
                          <p className="text-sm text-slate-500 group-hover:text-blue-600 transition-colors">
                            Manage {section.id.toLowerCase()} data
                          </p>
                        </div>
                        
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-slate-600 border border-slate-200 shadow-sm">
                          <ChevronLeft className="w-4 h-4 rotate-180" />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 w-full"
            >
              {renderContent()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
