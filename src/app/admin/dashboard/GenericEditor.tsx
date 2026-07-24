"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Edit2, X, Check, Loader2, Image as ImageIcon, ChevronLeft, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { validateFileUpload } from "@/lib/security";

export type ColumnDef = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'array' | 'image' | 'project_selector' | 'select_array' | 'select';
  options?: string[];
};

interface GenericEditorProps {
  tableName: string;
  title: string;
  columns: ColumnDef[];
}

export default function GenericEditor({ tableName, title, columns }: GenericEditorProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const [availableProjects, setAvailableProjects] = useState<any[]>([]);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  useEffect(() => {
    fetchData();
    if (columns.some(col => col.type === 'project_selector')) {
      supabase.from('projects').select('id, title, categories').order('year', { ascending: false }).then(({data}) => {
        if (data) setAvailableProjects(data);
      });
    }
  }, [tableName, columns]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from(tableName).select('*').order('id', { ascending: true });
    if (error) {
      console.error("Fetch error:", error);
      showToast(error.message, 'error');
    }
    if (data) setData(data);
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingId(null);
    const initialData: any = {};
    columns.forEach(col => {
      initialData[col.key] = col.type === 'array' ? [] : '';
    });
    setFormData(initialData);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    const initialData: any = { ...item };
    // Arrays might need conversion to string for textarea editing if we wanted, 
    // but we can just map them to comma-separated for editing, or keep as array
    columns.forEach(col => {
      if (col.type === 'array' && Array.isArray(initialData[col.key])) {
        initialData[col.key] = initialData[col.key].join('\n');
      }
    });
    setFormData(initialData);
    setIsModalOpen(true);
  };

  const confirmDelete = (id: any) => {
    setItemToDelete(id);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    const { error } = await supabase.from(tableName).delete().eq('id', itemToDelete);
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Item deleted successfully', 'success');
      fetchData();
    }
    setItemToDelete(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload: any = { ...formData };
    
    // Process array fields back from string
    columns.forEach(col => {
      if (col.type === 'array' && typeof payload[col.key] === 'string') {
        payload[col.key] = payload[col.key].split('\n').map((s: string) => s.trim()).filter(Boolean);
      }
    });

    if (editingId) {
      const { error } = await supabase.from(tableName).update(payload).eq('id', editingId);
      if (error) showToast(error.message, 'error');
      else showToast('Updated successfully', 'success');
    } else {
      const { error } = await supabase.from(tableName).insert([payload]);
      if (error) showToast(error.message, 'error');
      else showToast('Created successfully', 'success');
    }

    setSaving(false);
    setIsModalOpen(false);
    fetchData();
  };

  return (
    <div className="w-full">
      {!isModalOpen ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-black display-text text-slate-900">{title}</h3>
              <p className="text-slate-500 text-sm mt-2">Manage your {title.toLowerCase()} data and configurations here.</p>
            </div>
            {tableName !== 'm_shape_skills' && (
              <button 
                onClick={openAddModal}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20 border border-blue-500/50"
              >
                <Plus size={16} /> Add New
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No data found. Click "Add New" to create one.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              {data.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-300 transition-all relative group"
                >
                  <div className="absolute top-4 right-4 flex gap-2 transition-opacity">
                    <button onClick={() => openEditModal(item)} className="p-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 rounded-xl transition-all shadow-sm"><Edit2 size={16} /></button>
                    {tableName !== 'm_shape_skills' && (
                      <button onClick={() => confirmDelete(item.id)} className="p-2.5 bg-slate-50 border border-slate-200 text-red-500 hover:border-red-500 hover:text-red-600 rounded-xl transition-all shadow-sm"><Trash2 size={16} /></button>
                    )}
                  </div>
                  
                  <div className="pr-24">
                    <h4 className="text-lg font-bold text-slate-900 mb-4 line-clamp-1">
                      {item.title || item.label || item.role || item.company || item.posisi || 'Item'}
                    </h4>
                    <div className="space-y-4">
                      {columns.filter(col => !['title', 'label', 'role', 'company', 'posisi'].includes(col.key)).slice(0, 3).map((col, idx) => (
                        <div key={col.key} className="mb-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{col.label}</span>
                          <div className="text-sm text-slate-700 line-clamp-2 mt-0.5">
                            {col.type === 'array' || col.type === 'select_array'
                              ? (Array.isArray(item[col.key]) ? item[col.key].join(', ') : item[col.key]) 
                              : (col.type === 'image' && item[col.key] 
                                  ? <span className="flex items-center gap-1 text-blue-600"><ImageIcon size={14}/> Image Set</span>
                                  : item[col.key])
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full p-8"
        >
          <div className="flex justify-between items-start pb-5 mb-6 border-b border-slate-100">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                {editingId ? 'Edit' : 'Add New'} {formData?.title || formData?.label || formData?.role || formData?.company || formData?.posisi || title}
              </h2>
              <p className="text-sm text-slate-500 mt-1">Fill out the details below to save changes to the database.</p>
            </div>
            <button onClick={() => setIsModalOpen(false)} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors bg-white hover:bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 shadow-sm shrink-0">
              <ChevronLeft size={16} /> Back to List
            </button>
          </div>
          
          <div>
            <form id="generic-form" onSubmit={handleSave} className="space-y-6">
              {columns.map(col => (
                <div key={col.key}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{col.label}</label>
                  
                  {col.type === 'textarea' ? (
                    <textarea
                      required
                      value={formData[col.key] || ''}
                      onChange={(e) => setFormData({...formData, [col.key]: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm h-32 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm placeholder-slate-400"
                    />
                  ) : col.type === 'array' ? (
                    <div>
                      <textarea
                        value={formData[col.key] || ''}
                        onChange={(e) => setFormData({...formData, [col.key]: e.target.value})}
                        placeholder="Enter items separated by new lines (Enter)"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm h-32 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm placeholder-slate-400"
                      />
                      <span className="text-xs font-medium text-slate-500 mt-1.5 block">One item per line.</span>
                    </div>
                  ) : col.type === 'project_selector' ? (
                    <div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(() => {
                          const validProjects = availableProjects.filter(proj => {
                            if (tableName !== 'm_shape_skills') return true;
                            const tabToKategori: Record<string, string> = { 'iot': 'IoT', 'cyber': 'Cyber', 'ai': 'AI', 'software': 'Fullstack' };
                            const currentKategori = formData.id ? tabToKategori[formData.id] : null;
                            if (!currentKategori) return true;
                            const cats = proj.categories || [];
                            return cats.includes(currentKategori);
                          });
                          
                          return validProjects.map(proj => {
                            const cleanTitle = (proj.title || '').trim();
                            const selectedTitles = formData[col.key] ? formData[col.key].split(',').map((t: string) => t.trim().toLowerCase()).filter(Boolean) : [];
                            const isSelected = selectedTitles.includes(cleanTitle.toLowerCase());
                            
                            return (
                              <button
                                type="button"
                                key={proj.id}
                                onClick={() => {
                                  const validTitles = validProjects.map(p => (p.title || '').trim().toLowerCase());
                                  let current = formData[col.key] ? formData[col.key].split(',').map((t: string) => t.trim()).filter((t: string) => t && validTitles.includes(t.toLowerCase())) : [];
                                  
                                  let newTitles: string[];
                                  if (isSelected) {
                                    newTitles = current.filter((t: string) => t.toLowerCase() !== cleanTitle.toLowerCase());
                                  } else {
                                    if (current.length >= 3) {
                                      showToast('Maksimal 3 project!', 'error');
                                      return;
                                    }
                                    newTitles = [...current, cleanTitle];
                                  }
                                  setFormData({...formData, [col.key]: newTitles.join(', ')});
                                }}
                                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'}`}
                              >
                                {proj.title}
                              </button>
                            );
                          });
                        })()}
                      </div>
                      <span className="text-xs font-medium text-slate-500 block">Klik untuk memilih maksimal 3 project.</span>
                    </div>
                  ) : col.type === 'select_array' ? (
                    <div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {col.options?.map(opt => {
                          const currentArray = Array.isArray(formData[col.key]) ? formData[col.key] : [];
                          const isSelected = currentArray.includes(opt);
                          return (
                            <button
                              type="button"
                              key={opt}
                              onClick={() => {
                                if (isSelected) {
                                  setFormData({...formData, [col.key]: currentArray.filter((item: string) => item !== opt)});
                                } else {
                                  if (currentArray.length >= 2) {
                                    showToast('Maksimal 2 kategori yang dapat dipilih', 'error');
                                    return;
                                  }
                                  setFormData({...formData, [col.key]: [...currentArray, opt]});
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-xs font-medium text-slate-500 block">Klik untuk memilih maksimal 2 kategori.</span>
                    </div>
                  ) : col.type === 'image' ? (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          try {
                            // MED-02: Validate MIME type and size before upload
                            const ALLOWED_IMAGE_MIMES = [
                              'image/jpeg', 'image/png', 'image/webp', 'image/gif',
                            ];
                            const validationError = validateFileUpload(file, {
                              allowedMimes: ALLOWED_IMAGE_MIMES,
                              maxSizeBytes: 8 * 1024 * 1024, // 8 MB
                            });
                            if (validationError) {
                              showToast(validationError, 'error');
                              e.target.value = '';
                              return;
                            }

                            // Derive extension from MIME type, not file.name
                            const mimeToExt: Record<string, string> = {
                              'image/jpeg': 'jpg',
                              'image/png': 'png',
                              'image/webp': 'webp',
                              'image/gif': 'gif',
                            };
                            const ext = mimeToExt[file.type] || 'jpg';
                            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e4);
                            const filename = `${tableName}/${uniqueSuffix}.${ext}`;

                            const { data, error } = await supabase.storage
                              .from('portfolio-files')
                              .upload(filename, file);

                            if (error) {
                              throw error;
                            }

                            if (data) {
                              const { data: publicUrlData } = supabase.storage
                                .from('portfolio-files')
                                .getPublicUrl(data.path);
                                
                              setFormData({...formData, [col.key]: publicUrlData.publicUrl});
                              showToast('Gambar berhasil diunggah ke Supabase', 'success');
                            }
                          } catch (err) {
                            console.error("Upload error:", err);
                            showToast('Gagal mengunggah gambar', 'error');
                          }
                        }}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                      {formData[col.key] && (
                        <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
                          <Check size={14} /> File tersimpan: {formData[col.key]}
                        </p>
                      )}
                    </div>
                  ) : col.type === 'select' ? (
                    <select
                      value={formData[col.key] || ''}
                      onChange={(e) => setFormData({...formData, [col.key]: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm appearance-none"
                    >
                      <option value="" disabled>Pilih {col.label}</option>
                      {col.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required={col.key !== 'id' && col.key !== 'image' && col.key !== 'demo_url' && col.key !== 'award' && col.key !== 'github_url'}
                      value={formData[col.key] || ''}
                      onChange={(e) => setFormData({...formData, [col.key]: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm placeholder-slate-400"
                      disabled={col.key === 'id' && editingId}
                    />
                  )}
                </div>
              ))}
            </form>
          </div>
          
          <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm text-sm">
              Cancel
            </button>
            <button form="generic-form" type="submit" disabled={saving} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm shadow-blue-500/20 border border-blue-500/50 text-sm">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Save Changes
            </button>
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-200/50">
                <Trash2 size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Delete Item</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Are you sure you want to delete this item? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-sm shadow-red-500/20 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }} className={`fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-red-50 text-red-900 border-red-200'}`}>
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
