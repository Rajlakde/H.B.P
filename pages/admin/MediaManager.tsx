
import React, { useState, useEffect, useRef } from 'react';
import { MediaItem } from '../../types';
import { Plus, Trash2, Video, Music, Image as ImageIcon, Play, MoreHorizontal, Filter, Image, RefreshCw, Upload } from 'lucide-react';
import { db } from '../../services/db';
import { useToast } from '../../context/ToastContext';

const MediaManager: React.FC = () => {
  const { success, error, info } = useToast();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'audio' | 'image'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
      setIsLoading(true);
      try {
          // Seeding handled by service
          const data = await db.getAll('media');
          setMedia(data);
      } catch(e) {
          console.error(e);
          error("डेटा लोड करण्यास त्रुटी", "कृपया पुन्हा प्रयत्न करा.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const updated = media.filter(m => m.id !== id);
      setMedia(updated);
      await db.save('media', updated);
      // Try to clean up from IDB if it's a local file
      await db.deleteMediaFile(id);
      success("मीडिया डिलीट केला", "फाईल यशस्वीरित्या काढून टाकली.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const fileType = file.type.startsWith('image') ? 'image' : file.type.startsWith('audio') ? 'audio' : 'video';
      
      try {
          setIsLoading(true);
          const { id, url } = await db.saveMedia(file);
          
          const newItem: MediaItem = {
              id: id,
              type: fileType as any,
              title: file.name,
              url: url, // This is a DataURL/Blob URL from IndexedDB wrapper
              date: new Date().toISOString().split('T')[0],
              category: 'Uploads'
          };

          const updatedList = [newItem, ...media];
          setMedia(updatedList);
          await db.save('media', updatedList);
          success("अपलोड यशस्वी", `${file.name} गॅलरीत जोडली गेली.`);
      } catch (err) {
          console.error("Upload failed", err);
          error("फाईल अपलोड अयशस्वी", "कृपया फाईल साईज किंवा फॉर्मेट तपासा.");
      } finally {
          setIsLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
      }
  };

  const filteredMedia = activeTab === 'all' ? media : media.filter(m => m.type === activeTab);

  const getIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video size={14} />;
      case 'audio': return <Music size={14} />;
      case 'image': return <ImageIcon size={14} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-slide-up">
      {/* Header - Badge + Title + Description */}
      <div className="flex justify-between items-end mb-8">
        <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-[11px] font-bold uppercase tracking-widest border border-orange-100 dark:border-orange-800 shadow-sm">
               <Image size={12} className="text-amber-600" /> गॅलरी
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white leading-tight flex items-center gap-2">
               डिजिटल <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-amber-600">मीडिया</span> संग्रह
               {isLoading && <RefreshCw size={24} className="animate-spin text-stone-400 ml-2" />}
            </h1>
            <p className="text-sm md:text-base text-stone-500 dark:text-stone-400 font-medium leading-relaxed">
               वेबसाईटवरील गॅलरीसाठी फोटो, व्हिडिओ, आणि ऑडिओ फाईल्स अपलोड आणि मॅनेज करा.
            </p>
        </div>
        
        <div className="relative">
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*,audio/*,video/mp4"
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-700 hover:scale-105 transition-all flex items-center gap-2"
                disabled={isLoading}
            >
               {isLoading ? <RefreshCw className="animate-spin" size={20}/> : <Upload size={20} />} 
               <span className="hidden sm:inline">अपलोड</span>
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 custom-scrollbar">
        <div className="p-2 bg-white dark:bg-stone-900 rounded-full border border-stone-200 dark:border-stone-800 mr-2 shadow-sm">
             <Filter size={18} className="text-stone-400" />
        </div>
        {['all', 'video', 'audio', 'image'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold capitalize transition-all whitespace-nowrap ${
              activeTab === tab 
                ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-md transform scale-105' 
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'
            }`}
          >
            {tab === 'all' ? 'All Media' : tab + 's'}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Upload Card Placeholder */}
        <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-[2rem] flex flex-col items-center justify-center p-6 text-stone-400 dark:text-stone-500 hover:border-primary-500 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-stone-800/50 transition cursor-pointer min-h-[250px] group"
        >
           <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 flex items-center justify-center mb-4 transition-colors">
                <Plus size={32} />
           </div>
           <span className="font-bold text-sm">Add New Media</span>
        </div>

        {filteredMedia.map(item => (
          <div key={item.id} className="group bg-white dark:bg-stone-900 rounded-[2rem] shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden hover:shadow-float transition-all duration-300 relative flex flex-col">
             {/* Thumbnail Area */}
             <div className="aspect-[4/3] bg-stone-100 dark:bg-stone-800 relative overflow-hidden">
                {item.type === 'image' || item.type === 'video' ? (
                   <img src={item.thumbnail || item.url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center text-primary-400 dark:text-primary-600 bg-gradient-to-br from-stone-50 to-stone-200 dark:from-stone-800 dark:to-stone-900">
                     <div className="p-4 bg-white/50 dark:bg-black/20 rounded-full backdrop-blur-sm">
                        <Music size={32} />
                     </div>
                   </div>
                )}
                
                {/* Type Badge */}
                <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/60 text-stone-900 dark:text-white text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                   {getIcon(item.type)} <span className="capitalize">{item.type}</span>
                </div>

                {/* Overlay Action - Now More Visible and Labeled */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                   <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-stone-900 font-bold text-xs hover:scale-105 transition shadow-lg">
                       <Play size={14} fill="currentColor" /> Preview
                   </a>
                   <button onClick={() => handleDelete(item.id)} className="flex items-center gap-2 px-4 py-2 bg-red-500 rounded-full text-white font-bold text-xs hover:scale-105 transition shadow-lg">
                       <Trash2 size={14} /> Delete
                   </button>
                </div>
             </div>

             {/* Content */}
             <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-stone-800 dark:text-white text-base leading-tight line-clamp-2" title={item.title}>{item.title}</h3>
                </div>
                <div className="mt-auto flex justify-between items-center text-xs font-medium text-stone-400">
                   <span className="bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-md text-stone-600 dark:text-stone-300">{item.category || 'General'}</span>
                   <span>{item.date}</span>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaManager;
