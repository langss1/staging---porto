"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface TestimonialFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TestimonialForm({ isOpen, onClose }: TestimonialFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    message: "",
    avatar_url: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role || !formData.message) {
      setError("Name, Role, and Message are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: dbError } = await supabase
        .from('testimonials')
        .insert([
          {
            name: formData.name,
            role: formData.role,
            message: formData.message,
            avatar_url: formData.avatar_url || null,
            is_approved: true
          }
        ]);

      if (dbError) throw dbError;
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({ name: "", role: "", message: "", avatar_url: "" });
        onClose();
      }, 3000);
      
    } catch (err: any) {
      console.error("Error submitting testimonial:", err);
      if (err?.message?.includes("testimonials") || err?.code === "PGRST205") {
        setError("Tabel 'testimonials' belum dibuat di database Supabase. Silakan jalankan query SQL pembuatan tabel di Supabase SQL Editor.");
      } else {
        setError(err.message || "Failed to submit comment.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10"
        >
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-black display-text text-slate-900">Leave a Comment</h3>
                <p className="text-sm text-slate-500 mt-1">Share your experience collaborating with me.</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Thank you!</h4>
                <p className="text-slate-500 text-sm">Your comment has been submitted and is awaiting approval from the admin.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      maxLength={50}
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Role / Position <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      maxLength={50}
                      placeholder="e.g. Project Manager"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Avatar Photo / Image (Optional)</label>
                  <div className="flex flex-col gap-2">
                    <input 
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploading(true);
                        try {
                          const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                          const filename = `testimonials/${Date.now()}-${safeName}`;
                          const { data, error: uploadErr } = await supabase.storage
                            .from('portfolio-files')
                            .upload(filename, file);
                          if (uploadErr) throw uploadErr;
                          if (data) {
                            const { data: publicUrlData } = supabase.storage
                              .from('portfolio-files')
                              .getPublicUrl(data.path);
                            setFormData({...formData, avatar_url: publicUrlData.publicUrl});
                          }
                        } catch (err: any) {
                          console.error("Upload error:", err);
                        } finally {
                          setUploading(false);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer outline-none transition-all"
                    />
                    {uploading && (
                      <p className="text-xs text-blue-600 flex items-center gap-1 font-medium">
                        <Loader2 size={12} className="animate-spin" /> Uploading photo...
                      </p>
                    )}
                    {formData.avatar_url && !uploading && (
                      <div className="flex items-center gap-2.5 bg-blue-50/50 p-2 rounded-xl border border-blue-100">
                        <img src={formData.avatar_url} alt="Preview" className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" />
                        <span className="text-xs text-emerald-700 font-bold truncate flex-1">Photo attached!</span>
                        <button 
                          type="button" 
                          onClick={() => setFormData({...formData, avatar_url: ""})} 
                          className="text-xs text-red-500 font-bold hover:underline px-1 shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Message <span className="text-red-500">*</span></label>
                  <textarea 
                    required
                    maxLength={1000}
                    placeholder="Write your comment here..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm shadow-blue-500/20 border border-blue-500/50 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Submit Comment</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
