import React, { useState, useEffect } from 'react';
import { Save, Globe, Palette, Layout, Search, Settings as SettingsIcon, RefreshCw } from 'lucide-react';
import { db } from '../../services/db';
import { useToast } from '../../context/ToastContext';

const Settings: React.FC = () => {
  const { success } = useToast();
  const [activeTab, setActiveTab] = useState<'seo' | 'design' | 'general'>('seo');
  const [config, setConfig] = useState<any>({
      seoTitle: 'SantSeva - Official Website',
      seoDesc: 'वारकरी संप्रदायाचा वारसा डिजिटल युगात.',
      keywords: 'kirtan, sant tukaram, varkari, alandi',
      darkMode: true,
      glassEffect: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
      loadConfig();
  }, []);

  const loadConfig = async () => {
      const settings = await db.getAll('settings');
      const loadedConfig = settings.find((s: any) => s.id === 'site_config');
      if (loadedConfig) {
          setConfig(loadedConfig.value);
      }
  };

  const handleSave = async () => {
      setSaving(true);
      const settings = await db.getAll('settings');
      const existingIndex = settings.findIndex((s: any) => s.id === 'site_config');
      
      if (existingIndex >= 0) {
          settings[existingIndex].value = config;
      } else {
          settings.push({ id: 'site_config', value: config });
      }

      await db.save('settings', settings);
      setSaving(false);
      success("सेटिंग्ज जतन केल्या", "वेबसाईट कॉन्फिगरेशन यशस्वीरित्या अपडेट झाले आहे.");
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header - Badge + Title + Description */}
      <div className="mb-8 space-y-4">
         <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-[11px] font-bold uppercase tracking-widest border border-orange-100 dark:border-orange-800 shadow-sm">
             <SettingsIcon size={12} className="text-amber-600" /> नियंत्रण
         </div>
         <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white leading-tight">
            वेबसाईट <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-amber-600">कॉन्फिगरेशन</span>
         </h1>
         <p className="text-sm md:text-base text-stone-500 dark:text-stone-400 font-medium leading-relaxed max-w-xl">
            वेबसाईटचे शीर्षक, मेटा वर्णन, आणि इतर तांत्रिक सेटिंग्ज. वेबसाईटचा लूक आणि एसईओ (SEO) कॉन्फिगरेशन अद्ययावत करण्यासाठीचे नियंत्रण कक्ष.
         </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
         {[
            { id: 'seo', label: 'SEO सेटिंग्ज', icon: Search },
            { id: 'design', label: 'डिझाईन & लेआउट', icon: Palette },
            { id: 'general', label: 'सामान्य', icon: Layout },
         ].map(tab => (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === tab.id 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' 
                  : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800'
               }`}
            >
               <tab.icon size={18} /> {tab.label}
            </button>
         ))}
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800">
         {activeTab === 'seo' && (
            <div className="space-y-6">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">SEO कॉन्फिगरेशन</h3>
               <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">वेबसाईट शीर्षक (Title Tag)</label>
                  <input type="text" value={config.seoTitle} onChange={e => setConfig({...config, seoTitle: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none text-slate-900 dark:text-white" />
               </div>
               <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">मेटा वर्णन (Meta Description)</label>
                  <textarea rows={3} value={config.seoDesc} onChange={e => setConfig({...config, seoDesc: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none text-slate-900 dark:text-white resize-none" />
               </div>
               <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">कीवर्ड्स (Keywords)</label>
                  <input type="text" value={config.keywords} onChange={e => setConfig({...config, keywords: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none text-slate-900 dark:text-white" />
               </div>
            </div>
         )}

         {activeTab === 'design' && (
            <div className="space-y-6">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">दिसणे आणि अनुभव (UI/UX)</h3>
               <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl cursor-pointer" onClick={() => setConfig({...config, darkMode: !config.darkMode})}>
                  <span className="font-bold text-slate-700 dark:text-slate-300">डार्क मोड (डीफॉल्ट)</span>
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${config.darkMode ? 'bg-primary-600' : 'bg-slate-300'}`}>
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.darkMode ? 'right-1' : 'left-1'}`}></div>
                  </div>
               </div>
               <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl cursor-pointer" onClick={() => setConfig({...config, glassEffect: !config.glassEffect})}>
                  <span className="font-bold text-slate-700 dark:text-slate-300">ग्लास इफेक्ट (Glassmorphism)</span>
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${config.glassEffect ? 'bg-primary-600' : 'bg-slate-300'}`}>
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.glassEffect ? 'right-1' : 'left-1'}`}></div>
                  </div>
               </div>
            </div>
         )}
         
         <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button onClick={handleSave} disabled={saving} className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-primary-700 disabled:opacity-70">
               {saving ? <RefreshCw className="animate-spin" size={18}/> : <Save size={18} />} बदल सेव्ह करा
            </button>
         </div>
      </div>
    </div>
  );
};

export default Settings;