"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, Trash2, Loader2, RefreshCw } from "lucide-react";

export default function TestimonialsModerator() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTestimonials = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setTestimonials(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleApprove = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('testimonials')
      .update({ is_approved: !currentStatus })
      .eq('id', id);
    if (!error) fetchTestimonials();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);
    if (!error) fetchTestimonials();
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-2xl font-black display-text text-slate-900">Moderate Testimonials</h3>
          <p className="text-slate-500 text-sm mt-2">Approve, reject, or delete visitor comments.</p>
        </div>
        <button 
          onClick={fetchTestimonials}
          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-600"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Make sure you have executed the SQL query to create the <code>testimonials</code> table before using this feature.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading && <div className="text-center py-12"><Loader2 size={32} className="animate-spin mx-auto text-blue-500" /></div>}
        
        {!loading && testimonials.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500">No testimonials found.</p>
          </div>
        )}

        {!loading && testimonials.map(item => (
          <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between md:items-center">
            <div className="flex items-start gap-4 flex-1">
              {item.avatar_url ? (
                <img src={item.avatar_url} alt={item.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <span className="font-bold text-slate-400">{item.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900">{item.name}</h4>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${item.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {item.is_approved ? 'APPROVED' : 'PENDING'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-blue-600 mb-2">{item.role}</p>
                <p className="text-sm text-slate-600 italic">"{item.message}"</p>
              </div>
            </div>

            <div className="flex gap-2 justify-end shrink-0 pt-2 border-t md:border-t-0 md:pt-0 mt-2 md:mt-0">
              <button 
                onClick={() => handleApprove(item.id, item.is_approved)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border ${
                  item.is_approved 
                    ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100' 
                    : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                }`}
              >
                {item.is_approved ? <><XCircle size={16}/> Reject</> : <><CheckCircle size={16}/> Approve</>}
              </button>
              <button 
                onClick={() => handleDelete(item.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
              >
                <Trash2 size={16}/> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
