"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { sanitizeUrl } from "@/lib/security";

export default function SocialLinksEditor({ onClose }: { onClose?: () => void }) {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [formData, setFormData] = useState({
    instagram_url: "",
    linkedin_url: "",
    github_url: "",
    email: ""
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchSocials();
  }, []);

  const fetchSocials = async () => {
    setLoading(true);
    // We store social links in the 'profile' table for convenience
    const { data, error } = await supabase.from('profile').select('*').single();
    if (data) {
      setProfileId(data.id);
      setFormData({
        instagram_url: data.instagram_url || "",
        linkedin_url: data.linkedin_url || "",
        github_url: data.github_url || "",
        email: data.email || ""
      });
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) return;
    
    // MED-05: Sanitize all URLs before persisting to the database.
    // This prevents stored XSS via javascript: or data: URIs.
    const cleanInstagram = sanitizeUrl(formData.instagram_url);
    const cleanLinkedin  = sanitizeUrl(formData.linkedin_url);
    const cleanGithub    = sanitizeUrl(formData.github_url);
    // Email field uses mailto: which sanitizeUrl allows; validate format too
    const rawEmail = formData.email.trim();
    const cleanEmail = rawEmail.startsWith('mailto:') || rawEmail.startsWith('https://') || rawEmail === ''
      ? rawEmail
      : '#'; // block anything that isn't mailto:, https://, or empty

    setSaving(true);
    const { error } = await supabase
      .from('profile')
      .update({
        instagram_url: cleanInstagram === '#' ? '' : cleanInstagram,
        linkedin_url:  cleanLinkedin  === '#' ? '' : cleanLinkedin,
        github_url:    cleanGithub    === '#' ? '' : cleanGithub,
        email:         cleanEmail     === '#' ? '' : cleanEmail,
        updated_at: new Date()
      })
      .eq('id', profileId);
    
    if (error) {
      showToast("Error saving: " + error.message, 'error');
    } else {
      showToast("Social links updated successfully!", 'success');
      if (onClose) {
        setTimeout(() => onClose(), 1500);
      }
    }
    setSaving(false);
  };

  if (loading) return <div>Loading social links...</div>;

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-2xl font-black display-text text-slate-900">Edit Navbar / Social Links</h3>
        <p className="text-slate-500 text-sm mt-2">Update your Instagram and other social URLs displayed in the navigation dock.</p>
      </div>
      
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-800 font-medium">
          Note: Make sure the columns <code className="bg-blue-100 px-1 rounded">instagram_url</code>, <code className="bg-blue-100 px-1 rounded">linkedin_url</code>, <code className="bg-blue-100 px-1 rounded">github_url</code>, and <code className="bg-blue-100 px-1 rounded">email</code> exist in your <strong>profile</strong> table in Supabase!
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Instagram URL</label>
          <input
            type="url"
            placeholder="https://instagram.com/yourusername"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm placeholder-slate-400"
            value={formData.instagram_url}
            onChange={(e) => setFormData({...formData, instagram_url: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">LinkedIn URL</label>
          <input
            type="url"
            placeholder="https://linkedin.com/in/yourusername"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm placeholder-slate-400"
            value={formData.linkedin_url}
            onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">GitHub URL</label>
          <input
            type="url"
            placeholder="https://github.com/yourusername"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm placeholder-slate-400"
            value={formData.github_url}
            onChange={(e) => setFormData({...formData, github_url: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email URL (mailto:)</label>
          <input
            type="text"
            placeholder="mailto:you@example.com"
            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm placeholder-slate-400"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 transition-all shadow-sm shadow-blue-500/20 border border-blue-500/50 flex items-center justify-center gap-2 text-sm"
          >
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save Links"}
          </button>
        </div>
      </form>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
              toast.type === 'success' 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                : 'bg-red-50 text-red-900 border-red-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
