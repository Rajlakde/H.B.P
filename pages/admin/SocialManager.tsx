import React, { useState, useEffect } from 'react';
import { SOCIAL_LINKS, PLATFORM_STATS } from '../../constants';
import { SocialPost } from '../../types';
import { Facebook, Instagram, Youtube, Twitter, Save, ExternalLink, RefreshCw, CheckCircle, Eye, EyeOff, BarChart2, Zap, Heart, MessageCircle, Share2 } from 'lucide-react';
import { db } from '../../services/db';
import { useToast } from '../../context/ToastContext';
import { SkeletonBlock } from '../../components/Skeletons';

const SocialManager: React.FC = () => {
  const { success, info } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'feed' | 'settings'>('overview');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<SocialPost[]>([]);

  useEffect(() => {
      loadPosts();
  }, []);

  const loadPosts = async () => {
      setIsLoading(true);
      try {
        const data = await db.getAll('social_posts');
        setPosts(data);
      } finally {
        setIsLoading(false);
      }
  };

  const handleSync = () => {
      setIsSyncing(true);
      info("Sync Started", "Fetching latest data from social platforms...");
      setTimeout(async () => {
          setIsSyncing(false);
          await db.save('social_posts', posts);
          success("Sync Completed", "Social media stats and posts updated successfully.");
      }, 1500); 
  };

  const toggleFeatured = async (id: string) => {
      const updated = posts.map(p => p.id === id ? { ...p, isFeatured: !p.isFeatured } : p);
      setPosts(updated);
      await db.save('social_posts', updated);
  };

  const getIcon = (platform: string, size = 20) => {
    switch (platform) {
        case 'Facebook': return <Facebook size={size} />;
        case 'Instagram': return <Instagram size={size} />;
        case 'YouTube': return <Youtube size={size} />;
        default: return <ExternalLink size={size} />;
    }
  };

  const getColor = (platform: string) => {
      switch (platform) {
          case 'Facebook': return 'bg-blue-600';
          case 'Instagram': return 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500';
          case 'YouTube': return 'bg-red-600';
          default: return 'bg-slate-500';
      }
  }

  return (
    <div className="max-w-6xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
         <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-[11px] font-bold uppercase tracking-widest border border-orange-100 dark:border-orange-800 shadow-sm">
               <Share2 size={12} className="text-amber-600" /> कनेक्टिव्हिटी
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white leading-tight">
               सोशल मीडिया <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-amber-600">डॅशबोर्ड</span>
            </h1>
            <p className="text-sm md:text-base text-stone-500 dark:text-stone-400 font-medium leading-relaxed">
               फेसबुक, इंस्टाग्राम, आणि यूट्यूबवरील पोस्ट्सचे विश्लेषण. भक्तांचा प्रतिसाद, लाईक्स, आणि कमेंट्सची आकडेवारी एकाच ठिकाणी.
            </p>
         </div>
         <div className="flex gap-2">
             <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="bg-primary-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition flex items-center gap-2"
             >
                <RefreshCw size={20} className={isSyncing ? "animate-spin" : ""} /> 
                {isSyncing ? 'सिंक होत आहे...' : 'Sync Now'}
             </button>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-stone-200 dark:border-stone-800 pb-1">
          {[
              { id: 'overview', label: 'Overview & Stats', icon: BarChart2 },
              { id: 'feed', label: 'Content Feed', icon: Zap },
              { id: 'settings', label: 'API Connections', icon: CheckCircle }
          ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-t-xl font-bold flex items-center gap-2 transition-all relative top-0.5 ${
                    activeTab === tab.id 
                    ? 'bg-white dark:bg-stone-900 text-primary-600 border-x border-t border-stone-200 dark:border-stone-800' 
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                  <tab.icon size={18} /> {tab.label}
              </button>
          ))}
      </div>

      <div className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-[2rem] rounded-tl-none shadow-sm border border-stone-200 dark:border-stone-800">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PLATFORM_STATS.map((stat) => (
                        <div key={stat.platform} className="bg-stone-50 dark:bg-stone-800 p-6 rounded-3xl relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 ${getColor(stat.platform)} transition-opacity group-hover:opacity-20`}></div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${getColor(stat.platform)}`}>
                                    {getIcon(stat.platform, 24)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-stone-900 dark:text-white">{stat.platform}</h3>
                                    <p className="text-xs font-bold text-green-500 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-md inline-block">Connected</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-stone-500 uppercase font-bold">Followers</p>
                                    <p className="text-2xl font-bold text-stone-900 dark:text-white">{(stat.followers / 1000).toFixed(1)}K</p>
                                </div>
                                <div>
                                    <p className="text-xs text-stone-500 uppercase font-bold">Reach</p>
                                    <p className="text-2xl font-bold text-stone-900 dark:text-white">{(stat.reach / 1000).toFixed(1)}K</p>
                                </div>
                                <div className="col-span-2 pt-4 border-t border-stone-200 dark:border-stone-700 flex justify-between items-center">
                                    <span className="text-sm font-medium text-stone-500">Engagement Rate: <span className="text-stone-900 dark:text-white font-bold">{stat.engagement}</span></span>
                                    <span className="text-[10px] text-stone-400">Sync: {stat.lastSync}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Feed Management Tab */}
        {activeTab === 'feed' && (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-stone-900 dark:text-white">Recent Posts</h3>
                    <div className="text-sm text-stone-500">
                        {isLoading ? 'Loading posts...' : `Showing ${posts.length} items from connected accounts`}
                    </div>
                </div>

                <div className="space-y-4">
                    {isLoading ? (
                        <>
                            <SkeletonBlock className="h-40 w-full rounded-2xl"/>
                            <SkeletonBlock className="h-40 w-full rounded-2xl"/>
                            <SkeletonBlock className="h-40 w-full rounded-2xl"/>
                        </>
                    ) : (
                        posts.map((post) => (
                            <div key={post.id} className="flex flex-col md:flex-row gap-6 p-4 rounded-2xl border border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors group">
                                <div className="w-full md:w-48 aspect-video rounded-xl overflow-hidden relative shrink-0">
                                    <img src={post.thumbnail} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute top-2 left-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md ${getColor(post.platform)}`}>
                                            {getIcon(post.platform, 14)}
                                        </div>
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                                        {post.type}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <p className="text-stone-900 dark:text-white font-medium line-clamp-2 mb-2">{post.caption}</p>
                                    <div className="flex flex-wrap gap-4 text-xs font-bold text-stone-400 mb-4">
                                        <span className="flex items-center gap-1"><Heart size={14} className="text-red-400"/> {post.likes}</span>
                                        <span className="flex items-center gap-1"><MessageCircle size={14} className="text-blue-400"/> {post.comments}</span>
                                        {post.views && <span className="flex items-center gap-1"><Eye size={14} /> {post.views}</span>}
                                        <span>• {post.date}</span>
                                    </div>
                                </div>

                                <div className="flex md:flex-col items-center justify-center gap-3 md:border-l border-stone-100 dark:border-stone-800 md:pl-6">
                                    <button 
                                        onClick={() => toggleFeatured(post.id)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all w-full justify-center ${
                                            post.isFeatured 
                                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' 
                                            : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
                                        }`}
                                    >
                                        {post.isFeatured ? <><CheckCircle size={14}/> Shown on Home</> : <><EyeOff size={14}/> Hidden</>}
                                    </button>
                                    <a href={post.url} target="_blank" rel="noreferrer" className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white transition">
                                        <ExternalLink size={18} />
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}

        {/* API Settings Tab */}
        {activeTab === 'settings' && (
            <div className="space-y-6">
                <h3 className="font-bold text-xl text-stone-900 dark:text-white mb-4">Platform Connections</h3>
                <div className="grid gap-4">
                     {SOCIAL_LINKS.filter(l => l.platform !== 'WhatsApp').map((link) => (
                        <div key={link.platform} className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl">
                             <div className="flex items-center gap-4">
                                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${getColor(link.platform)}`}>
                                     {getIcon(link.platform, 24)}
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-stone-900 dark:text-white">{link.platform}</h4>
                                     <p className="text-xs text-stone-500">{link.handle} • {link.followers}</p>
                                 </div>
                             </div>
                             <div>
                                 {link.isConnected ? (
                                     <button className="px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition">Disconnect</button>
                                 ) : (
                                     <button className="px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-black transition">Connect API</button>
                                 )}
                             </div>
                        </div>
                     ))}
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800">
                    <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Note on API Limits</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                        Instagram and Facebook APIs require re-authentication every 60 days. Ensure you have the appropriate access tokens generated from the Meta Developer Portal.
                    </p>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default SocialManager;