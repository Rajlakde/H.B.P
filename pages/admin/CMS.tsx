
import React, { useState, useEffect } from 'react';
import { DAILY_ABHANG } from '../../constants';
import { Abhang } from '../../types';
import { Save, RefreshCw, Type, Globe, PenTool, Quote, CheckCircle2, Eye, Calendar } from 'lucide-react';
import { db } from '../../services/db';
import { useToast } from '../../context/ToastContext';

const CMS: React.FC = () => {
  const { success, error } = useToast();
  const [abhang, setAbhang] = useState<Abhang>(DAILY_ABHANG);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false); // For mobile view

  useEffect(() => {
      loadSettings();
  }, []);

  const loadSettings = async () => {
      setLoading(true);
      try {
        const settings = await db.getAll('settings');
        if (settings && settings.length > 0) {
            const loadedAbhang = settings.find((s: any) => s.id === 'daily_abhang');
            if (loadedAbhang) setAbhang(loadedAbhang.value);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
        const settings = await db.getAll('settings');
        const existingIndex = settings.findIndex((s: any) => s.id === 'daily_abhang');
        
        // Update date to today on publish
        const updatedAbhang = {
            ...abhang,
            date: new Date().toISOString().split('T')[0]
        };
        setAbhang(updatedAbhang);

        if (existingIndex >= 0) {
            settings[existingIndex].value = updatedAbhang;
        } else {
            settings.push({ id: 'daily_abhang', value: updatedAbhang });
        }

        await db.save('settings', settings);
        success("सुविचार प्रकाशित झाला", "वेबसाईटवर नवीन सुविचार अपडेट झाला आहे.");
    } catch (e) {
        error("त्रुटी", "प्रकाशन अयशस्वी. कृपया पुन्हा प्रयत्न करा.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-[11px] font-bold uppercase tracking-widest border border-orange-100 dark:border-orange-800 shadow-sm">
                <PenTool size={12} className="text-amber-600" /> CMS
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white leading-tight">
            दैनंदिन <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-amber-600">सुविचार</span> व्यवस्थापन
            </h1>
        </div>
        <div className="flex gap-3">
             {/* Mobile Preview Toggle */}
             <button onClick={() => setPreviewMode(!previewMode)} className="md:hidden p-3 bg-stone-100 dark:bg-stone-800 rounded-xl text-stone-600 dark:text-stone-300">
                 <Eye size={20} />
             </button>
             <button 
                onClick={handlePublish}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 hover:shadow-green-500/20 disabled:opacity-70 flex items-center gap-2 transition-all"
             >
                {loading ? <RefreshCw className="animate-spin" size={20}/> : <CheckCircle2 size={20} />} 
                सुविचार प्रकाशित करा
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
         
         {/* Editor Column */}
         <div className={`space-y-6 ${previewMode ? 'hidden lg:block' : 'block'}`}>
            <div className="bg-white dark:bg-stone-900 rounded-[2rem] shadow-sm border border-stone-200 dark:border-stone-800 p-8">
               <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-6 flex items-center gap-2">
                   <Type size={20} className="text-orange-500"/> मजकूर संपादित करा
               </h3>
               
               <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 pl-1">संतांचे नाव</label>
                    <input 
                      type="text" 
                      className="w-full px-5 py-3 border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-bold transition-all"
                      value={abhang.sant}
                      onChange={(e) => setAbhang({...abhang, sant: e.target.value})}
                      placeholder="उदा. जगद्गुरु संत तुकाराम महाराज"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 pl-1">अभंग / सुविचार</label>
                    <textarea 
                      rows={6} 
                      className="w-full px-5 py-4 border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-serif text-lg leading-relaxed transition-all resize-none"
                      value={abhang.text}
                      onChange={(e) => setAbhang({...abhang, text: e.target.value})}
                      placeholder="येथे अभंग लिहा..."
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 pl-1">भावार्थ (Meaning)</label>
                    <textarea 
                      rows={4} 
                      className="w-full px-5 py-4 border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none font-medium"
                      value={abhang.meaning}
                      onChange={(e) => setAbhang({...abhang, meaning: e.target.value})}
                      placeholder="सोप्या शब्दांत अर्थ..."
                    ></textarea>
                  </div>
               </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800 flex items-start gap-4">
                <div className="p-2 bg-white dark:bg-blue-900 rounded-full text-blue-600 shadow-sm"><Globe size={18}/></div>
                <div>
                    <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm mb-1">Live Update</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                        'प्रकाशित करा' बटण दाबाल तेव्हा हा सुविचार मुख्य पानावर (Home Page) आणि डॅशबोर्डवर त्वरित अपडेट होईल. तारीख आजची सेट केली जाईल.
                    </p>
                </div>
            </div>
         </div>

         {/* Preview Column */}
         <div className={`lg:block ${previewMode ? 'block' : 'hidden'}`}>
             <div className="sticky top-8">
                 <div className="flex items-center justify-between mb-4 px-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Live Preview</span>
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded border border-green-200">Home Page Card</span>
                 </div>

                 {/* The Card Replica */}
                 <div className="bg-white dark:bg-stone-900 rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-orange-100/50 dark:shadow-none border border-orange-100 dark:border-stone-800 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600"></div>
                    <Quote size={48} className="mx-auto text-orange-200 mb-6" />
                    
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 dark:text-white mb-6 leading-relaxed whitespace-pre-line">
                    "{abhang.text}"
                    </h2>
                    
                    <div className="space-y-4">
                        <p className="text-lg font-bold text-orange-600 dark:text-orange-400 font-serif">— {abhang.sant}</p>
                        <div className="inline-block bg-stone-50 dark:bg-stone-800 px-6 py-4 rounded-2xl border border-stone-100 dark:border-stone-700">
                            <p className="text-stone-600 dark:text-stone-300 text-sm md:text-base leading-relaxed italic">
                                <span className="font-bold not-italic mr-2 text-stone-900 dark:text-white">भावार्थ:</span> 
                                {abhang.meaning}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800 flex justify-center text-xs font-bold text-stone-400 uppercase tracking-widest gap-2">
                        <Calendar size={14}/> {new Date().toLocaleDateString('en-GB')}
                    </div>
                </div>
             </div>
         </div>

      </div>
    </div>
  );
};

export default CMS;
