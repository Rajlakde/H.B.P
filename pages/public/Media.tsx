import React, { useState, useEffect } from 'react';
import { MediaItem } from '../../types';
import { Play, Music, Image as ImageIcon, Filter, Search, Grid, Film, RefreshCw } from 'lucide-react';
import { db } from '../../services/db';
import { MediaCardSkeleton } from '../../components/Skeletons';

const Media: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'video' | 'audio' | 'image'>('all');
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
      loadMedia();
  }, []);

  const loadMedia = async () => {
      setIsLoading(true);
      try {
          const data = await db.getAll('media');
          setMediaList(data);
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  };

  const filteredMedia = filter === 'all' 
    ? mediaList 
    : mediaList.filter(m => m.type === filter);

  return (
    <div className="bg-[#fcfbf9] dark:bg-stone-950 min-h-screen py-24 md:py-32 px-4 md:px-6 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-12 md:mb-16 animate-slide-up px-2">
            <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-[11px] font-bold uppercase tracking-widest mb-6 border border-orange-100 dark:border-orange-800 shadow-sm">
                     <Film size={14} className="text-amber-600" /> भक्ती संग्रह
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-stone-900 dark:text-white mb-6 leading-tight">
                    भक्ती <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-amber-600">भांडार</span>
                    {isLoading && <RefreshCw size={24} className="inline ml-3 animate-spin text-stone-400"/>}
                </h1>
                <p className="text-lg md:text-xl text-stone-500 dark:text-stone-400 font-medium leading-relaxed">
                   कीर्तन सोहळे, अभंगवाणी, आणि प्रवचनांचे दुर्मिळ व्हिडिओ आणि ऑडिओ संग्रह. भक्तीच्या या डिजिटल प्रवासात सामील व्हा.
                </p>
            </div>
            
            <div className="flex flex-col gap-4 w-full md:w-auto">
               <div className="relative w-full">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                   <input 
                      type="text" 
                      placeholder="शोधा..." 
                      className="pl-12 pr-6 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-900 dark:text-white shadow-sm transition-all"
                   />
               </div>
               
               <div className="bg-white dark:bg-stone-900 p-1.5 rounded-2xl border border-stone-200 dark:border-stone-800 flex gap-1 overflow-x-auto custom-scrollbar shadow-sm">
                  {[
                    { id: 'all', label: 'सर्व' },
                    { id: 'video', label: 'व्हिडिओ', icon: Play },
                    { id: 'audio', label: 'ऑडिओ', icon: Music },
                    { id: 'image', label: 'फोटो', icon: ImageIcon },
                  ].map((item) => {
                     const Icon = item.icon;
                     return (
                      <button 
                        key={item.id}
                        onClick={() => setFilter(item.id as any)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
                          filter === item.id 
                            ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-md transform scale-105' 
                            : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                      >
                        {Icon && <Icon size={14} />} {item.label}
                      </button>
                     )
                  })}
               </div>
            </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
          {isLoading ? (
              // Show 8 skeletons while loading
              Array.from({ length: 8 }).map((_, i) => <MediaCardSkeleton key={i} />)
          ) : (
              filteredMedia.map((item, index) => (
                <div key={item.id} className="group cursor-pointer">
                  
                  <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-stone-100 dark:bg-stone-800 mb-4 shadow-sm group-hover:shadow-2xl group-hover:shadow-stone-200/50 dark:group-hover:shadow-none transition-all duration-500 border border-stone-200 dark:border-stone-800">
                    {item.type === 'video' && (
                      <>
                        <img src={item.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <div className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/50 group-hover:scale-110 transition-transform shadow-lg">
                              <Play fill="currentColor" size={24} className="ml-1" />
                            </div>
                        </div>
                      </>
                    )}
                    {item.type === 'image' && (
                      <img src={item.url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    )}
                    {item.type === 'audio' && (
                      <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center relative p-8 group-hover:scale-110 transition-transform duration-700">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center text-white border border-white/20 mb-4 shadow-inner">
                            <Music size={32} />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                    )}
                    
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-stone-900 dark:text-white uppercase tracking-wider shadow-sm border border-white/20">
                        {item.type}
                    </div>
                  </div>

                  <div className="px-2">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-white group-hover:text-orange-600 transition-colors leading-tight line-clamp-1">{item.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs font-bold text-stone-400 uppercase tracking-wide">
                      <span className="bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-md text-stone-600 dark:text-stone-300">{item.category}</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
        
        {!isLoading && filteredMedia.length === 0 && (
           <div className="text-center py-32">
             <div className="inline-flex p-8 bg-stone-100 dark:bg-stone-900 rounded-full mb-6">
                <Filter size={40} className="text-stone-300 dark:text-stone-600" />
             </div>
             <p className="text-stone-400 text-lg">कोणतीही माहिती सापडली नाही.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default Media;