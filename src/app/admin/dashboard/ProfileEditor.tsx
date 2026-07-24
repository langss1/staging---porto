"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { validateFileUpload } from "@/lib/security";

export default function ProfileEditor({ onClose }: { onClose?: () => void }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  
  const [formData, setFormData] = useState({
    name: "",
    about_me: "",
    gpa: "",
    years_experience: "",
    cv_link: "",
    image_url: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profile').select('*').single();
    if (data) {
      setProfile(data);
      setFormData({
        name: data.name || "",
        about_me: data.about_me || "",
        gpa: data.gpa || "",
        years_experience: data.years_experience || "",
        cv_link: data.cv_link || "",
        image_url: data.image_url || ""
      });
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from('profile')
      .update({
        name: formData.name,
        about_me: formData.about_me,
        gpa: parseFloat(formData.gpa),
        years_experience: parseInt(formData.years_experience),
        cv_link: formData.cv_link,
        image_url: formData.image_url,
        updated_at: new Date()
      })
      .eq('id', profile?.id)
      .select()
      .single();
    
    if (error) {
      showToast("Error saving profile: " + error.message, 'error');
    } else {
      showToast("Profile updated successfully!", 'success');
      if (onClose) {
        setTimeout(() => onClose(), 1500);
      }
    }
    setSaving(false);
  };

  const uploadCV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingCV(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select a file to upload.');
      }
      const file = event.target.files[0];

      // MED-02: Validate MIME type and file size before uploading
      const validationError = validateFileUpload(file, {
        allowedMimes: ['application/pdf'],
        maxSizeBytes: 5 * 1024 * 1024, // 5 MB
      });
      if (validationError) throw new Error(validationError);

      // Derive extension from MIME type, not from file.name
      const fileExt = 'pdf';
      const fileName = `CV_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-files')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage.from('portfolio-files').getPublicUrl(filePath);
      
      setFormData({ ...formData, cv_link: data.publicUrl });
      showToast("CV uploaded successfully! Don't forget to click Save.", 'success');
    } catch (error: any) {
      showToast('Error uploading file: ' + error.message, 'error');
    } finally {
      setUploadingCV(false);
    }
  };

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingImage(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      const file = event.target.files[0];

      // MED-02: Validate MIME type and file size before uploading
      const validationError = validateFileUpload(file, {
        allowedMimes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        maxSizeBytes: 5 * 1024 * 1024, // 5 MB
      });
      if (validationError) throw new Error(validationError);

      // Derive extension from MIME type, not from file.name
      const mimeToExt: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
      };
      const fileExt = mimeToExt[file.type] || 'jpg';
      const fileName = `Profile_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-files')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('portfolio-files').getPublicUrl(filePath);
      
      setFormData({ ...formData, image_url: data.publicUrl });
      showToast("Profile image uploaded successfully! Don't forget to click Save.", 'success');
    } catch (error: any) {
      showToast('Error uploading image: ' + error.message, 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const [runningAI, setRunningAI] = useState(false);

  const handleRunAI = async () => {
    if (!confirm("Run AI Evaluation? This will read all your portfolio data and recalculate your competency scores.")) return;
    
    setRunningAI(true);
    try {
      const res = await fetch('/api/evaluate-profile', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast("AI Evaluation completed! Scores updated on the chart.", 'success');
      } else {
        showToast("Error running AI: " + data.message, 'error');
      }
    } catch (e: any) {
      showToast("Error running AI: " + e.message, 'error');
    }
    setRunningAI(false);
  };

  if (loading) return <div>Loading profile data...</div>;

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black display-text text-slate-900">Edit Profile & Settings</h3>
          <p className="text-slate-500 text-sm mt-2">Update your main portfolio settings and personal information here.</p>
        </div>
        
        <button
          onClick={handleRunAI}
          disabled={runningAI}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 border border-indigo-200 rounded-lg font-bold text-sm transition-all shadow-sm disabled:opacity-50"
        >
          {runningAI ? <Loader2 size={16} className="animate-spin" /> : "✨"}
          {runningAI ? "Evaluating Profile..." : "Run AI Evaluator"}
        </button>
      </div>
      
      <form onSubmit={handleSave} className="space-y-6 w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200">

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm placeholder-slate-400"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">About Me (Optional)</label>
          <textarea
            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm h-32 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm placeholder-slate-400"
            rows={4}
            value={formData.about_me}
            onChange={(e) => setFormData({...formData, about_me: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">GPA (IPK)</label>
            <input
              type="number"
              step="0.01"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm placeholder-slate-400"
              value={formData.gpa}
              onChange={(e) => setFormData({...formData, gpa: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Years of Experience</label>
            <input
              type="number"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm placeholder-slate-400"
              value={formData.years_experience}
              onChange={(e) => setFormData({...formData, years_experience: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div className="">
            <label className="block text-sm font-semibold text-slate-700 mb-3">CV File (PDF)</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".pdf"
                onChange={uploadCV}
                disabled={uploadingCV}
                className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 file:border file:border-slate-200 cursor-pointer transition-colors text-slate-600"
              />
              {uploadingCV && <span className="text-sm font-medium text-blue-500 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Uploading...</span>}
            </div>
            {formData.cv_link && (
              <div className="mt-3 flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-md border border-slate-200 w-max">
                <span className="text-sm text-slate-500">Current CV:</span>
                <a href={formData.cv_link} target="_blank" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">View File</a>
              </div>
            )}
          </div>

          <div className="">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Profile Image</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={uploadImage}
                disabled={uploadingImage}
                className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 file:border file:border-slate-200 cursor-pointer transition-colors text-slate-600"
              />
              {uploadingImage && <span className="text-sm font-medium text-blue-500 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Uploading...</span>}
            </div>
            {formData.image_url && (
              <div className="mt-4 flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200 w-max">
                <img src={formData.image_url} alt="Profile preview" className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-sm" />
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 mb-0.5">Current Image</span>
                  <a href={formData.image_url} target="_blank" className="text-blue-600 hover:text-blue-700 font-medium text-sm">View Image</a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 transition-all shadow-sm shadow-blue-500/20 border border-blue-500/50 flex items-center justify-center gap-2 text-sm"
          >
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving Changes...</> : "Save Profile"}
          </button>
        </div>
      </form>

      {/* Toast Notification */}
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
