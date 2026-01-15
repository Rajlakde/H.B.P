
import React, { useState, useEffect } from 'react';
import { Calendar, User, ArrowRight, Search, BookOpen, Clock, Tag, ExternalLink, Feather, RefreshCw, X, Share2, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { db } from '../../services/db';
import { BlogPost, SocialPost } from '../../types';
import { BlogCardSkeleton, SkeletonBlock } from '../../components/Skeletons';

const Blog: React.FC = () => {
  const { success } = useToast();
  const [filter, setFilter] = useState('All');
  const [email, setEmail] = useState('');
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [socialUpdates, setSocialUpdates] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  const categories = ['All', 'अध्यात्म', 'संस्कृती', 'चरित्र', 'विज्ञान', 'इतर'];

  useEffect(() => {
      loadData();
  }, []);

  const loadData = async () => {
      setIsLoading(true);
      try {
          const blogData = await db.getAll('blogs');
          setBlogs(blogData.filter((b: BlogPost) => b.status === 'Published'));

          const socialData = await db.getAll('social_posts');
          setSocialUpdates(socialData.slice(0, 3));
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  };
  
  const featuredBlog = blogs.length > 0 ? blogs[0] : null;
  const otherBlogs = blogs.length > 1 ? blogs.slice(1) : [];

  const filteredBlogs = filter === 'All' 
    ? otherBlogs 
    : otherBlogs.filter(b => b.category === filter);

  const handleSubscribe = () => {
      if(email) {
          success("धन्यवाद!", "तुम्ही यशस्वीरित्या सबस्क्राईब केले आहे.");
          setEmail('');
      }
  };

  const handleShare = (blog: BlogPost) => {
      if (navigator.share) {
          navigator.share({
              title: blog.title,
              text: blog.excerpt,
              url: window.location.href
          });
      } else {
          navigator.clipboard.writeText(window.location.href);
          success("Link Copied", "Article link copied to clipboard");
      }
  };

  return (
    <div className="bg-[#fcfbf9] dark:bg-stone-950 min-h-screen py-24 md:py-32 px-4 md:px-6 transition-colors duration-500 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8 animate-slide-up px-2">
           <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-[11px] font-bold uppercase tracking-widest mb-6 border border-orange-100 dark:border-orange-800 shadow-sm">
                  <Feather size={14} className="text-amber-600" /> साहित्य
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-stone-900 dark:text-white mb-6 leading-tight">
                विचार<span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-amber-600">धन</span>
                {isLoading && <RefreshCw size={24} className="inline ml-3 animate-spin text-stone-400"/>}
              </h1>
              <p className="text-lg md:text-xl text-stone-500 dark:text-stone-400 font-medium leading-relaxed">
                 संत साहित्यावर आधारित अभ्यासपूर्ण लेख आणि दैनंदिन जीवनातील समस्यांवर आध्यात्मिक उपाय. वाचनातून मिळणारा आनंद आणि ज्ञानाचा प्रकाश.
              </p>
           </div>
           
           <div className="w-full md:w-auto flex flex-col items-end gap-4">
               <div className="relative w-full md:w-80 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                  <input 
                      type="text" 
                      placeholder="लेख शोधा..." 
                      className="w-full pl-12 pr-6 py-3.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-stone-900 dark:text-white font-medium shadow-sm"
                  />
               </div>
               <div className="flex gap-2 overflow-x-auto pb-1 max-w-full custom-scrollbar">
                  {categories.map(cat => (
                     <button 
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                           filter === cat 
                           ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 border-stone-900 dark:border-white' 
                           : 'bg-transparent text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 border-stone-200 dark:border-stone-800'
                        }`}
                     >
                        {cat}
                     </button>
                  ))}
               </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-slide-up" style={{ animationDelay: '100ms' }}>
            
            {/* Left Content Column */}
            <div className="lg:col-span-8 space-y-12">
                 {/* Featured Article */}
                {isLoading ? (
                    <BlogCardSkeleton />
                ) : featuredBlog ? (
                <div 
                    onClick={() => setSelectedBlog(featuredBlog)}
                    className="group relative rounded-[3rem] overflow-hidden bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 shadow-xl shadow-stone-200/40 dark:shadow-none cursor-pointer"
                >
                    <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
                        <img src={featuredBlog.image} alt={featuredBlog.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                        <div className="absolute top-6 left-6 bg-white/90 dark:bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">
                            Featured
                        </div>
                    </div>
                    <div className="p-8 md:p-12">
                        <div className="flex items-center gap-4 text-xs font-bold text-orange-600 mb-4 uppercase tracking-wider">
                            <span className="flex items-center gap-1"><Tag size={12}/> {featuredBlog.category}</span>
                            <span className="w-1 h-1 bg-stone-300 rounded-full"></span>
                            <span className="text-stone-400 font-medium flex items-center gap-1"><Clock size={12}/> 5 min read</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 dark:text-white mb-6 leading-tight group-hover:text-orange-700 transition-colors">
                            {featuredBlog.title}
                        </h2>
                        <p className="text-stone-500 dark:text-stone-400 text-base md:text-lg leading-relaxed mb-8 line-clamp-3">
                            {featuredBlog.excerpt}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-600 font-serif font-bold">म</div>
                                <div>
                                    <p className="text-sm font-bold text-stone-900 dark:text-white leading-none">{featuredBlog.author}</p>
                                    <p className="text-xs text-stone-400 mt-1">{featuredBlog.date}</p>
                                </div>
                            </div>
                            <button className="w-12 h-12 rounded-full border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-900 dark:text-white group-hover:bg-stone-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-stone-900 transition-all">
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
                ) : null}

                {/* Regular Articles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {isLoading ? (
                        <>
                            <BlogCardSkeleton />
                            <BlogCardSkeleton />
                        </>
                    ) : (
                        filteredBlogs.map((blog) => (
                            <div 
                                key={blog.id} 
                                onClick={() => setSelectedBlog(blog)}
                                className="group flex flex-col h-full bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 overflow-hidden hover:shadow-2xl hover:shadow-stone-200/50 dark:hover:shadow-black/20 transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                            >
                                <div className="h-60 overflow-hidden relative">
                                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent opacity-60"></div>
                                    <div className="absolute bottom-4 left-4 text-white text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
                                        {blog.category}
                                    </div>
                                </div>
                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex items-center gap-3 text-xs text-stone-400 font-bold mb-4 uppercase tracking-wide">
                                        <span className="flex items-center gap-1"><Calendar size={12} className="text-orange-500" /> {blog.date}</span>
                                    </div>
                                    <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white mb-3 leading-snug group-hover:text-orange-600 transition-colors">
                                        {blog.title}
                                    </h3>
                                    <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed mb-6 line-clamp-3">
                                        {blog.excerpt}
                                    </p>
                                    <div className="mt-auto pt-6 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                                        <span className="text-xs font-bold text-stone-400">By {blog.author}</span>
                                        <span className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2 group/btn">
                                        वाचा <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform text-orange-500" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-8">
                {/* Social Feed Widget */}
                <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] p-8 border border-stone-100 dark:border-stone-800 shadow-sm sticky top-32">
                    <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white mb-6">सोशल मीडिया अपडेट्स</h3>
                    
                    <div className="space-y-6">
                        {isLoading ? (
                            <>
                                <div className="flex gap-4 animate-pulse"><div className="w-20 h-20 bg-stone-200 rounded-2xl"></div><div className="flex-1 space-y-2"><div className="h-4 bg-stone-200 w-full"></div><div className="h-4 bg-stone-200 w-1/2"></div></div></div>
                                <div className="flex gap-4 animate-pulse"><div className="w-20 h-20 bg-stone-200 rounded-2xl"></div><div className="flex-1 space-y-2"><div className="h-4 bg-stone-200 w-full"></div><div className="h-4 bg-stone-200 w-1/2"></div></div></div>
                            </>
                        ) : (
                            socialUpdates.map(post => (
                                <div key={post.id} className="flex gap-4 group">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 relative">
                                        <img src={post.thumbnail} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center"></div>
                                    </div>
                                    <div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md text-white mb-1 inline-block ${
                                            post.platform === 'YouTube' ? 'bg-red-600' : post.platform === 'Facebook' ? 'bg-blue-600' : 'bg-pink-600'
                                        }`}>
                                            {post.platform}
                                        </span>
                                        <h4 className="text-sm font-bold text-stone-900 dark:text-white line-clamp-2 leading-tight mb-1 group-hover:text-primary-600 transition-colors">
                                            {post.caption}
                                        </h4>
                                        <a href={post.url} target="_blank" rel="noreferrer" className="text-xs text-stone-400 font-bold flex items-center gap-1 hover:text-stone-600 dark:hover:text-stone-200">
                                            View Post <ExternalLink size={10} />
                                        </a>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800">
                        <Link to="/media" className="w-full py-3 bg-stone-50 dark:bg-stone-800 rounded-xl text-stone-600 dark:text-stone-300 text-sm font-bold flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-700 transition">
                            सर्व मीडिया पहा
                        </Link>
                    </div>
                </div>

                {/* Newsletter Box */}
                <div className="bg-gradient-to-br from-primary-500 to-amber-600 rounded-[2.5rem] p-8 text-white text-center">
                    <BookOpen size={32} className="mx-auto mb-4 opacity-80" />
                    <h3 className="text-xl font-bold mb-2">अध्यात्मिक विचार</h3>
                    <p className="text-sm text-white/80 mb-6">दर आठवड्याला नवीन लेख आणि अभंग मिळवण्यासाठी जॉईन करा.</p>
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-stone-900 text-sm font-bold mb-3 outline-none" 
                    />
                    <button onClick={handleSubscribe} className="w-full bg-stone-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-black transition">सबस्क्राईब</button>
                </div>
            </div>
        </div>

        {/* --- FULL SCREEN ARTICLE MODAL --- */}
        {selectedBlog && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-white dark:bg-stone-950 animate-slide-up">
                {/* Modal Header Actions */}
                <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-6 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md">
                    <button onClick={() => setSelectedBlog(null)} className="p-3 bg-stone-100 dark:bg-stone-800 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                        <ChevronLeft size={24} className="text-stone-600 dark:text-stone-300"/>
                    </button>
                    <div className="flex gap-4">
                        <button onClick={() => handleShare(selectedBlog)} className="p-3 bg-stone-100 dark:bg-stone-800 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors text-stone-600 dark:text-stone-300">
                            <Share2 size={20}/>
                        </button>
                    </div>
                </div>

                {/* Article Cover */}
                <div className="w-full h-[50vh] md:h-[60vh] relative">
                    <img src={selectedBlog.image} alt={selectedBlog.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-4xl mx-auto">
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <span className="px-4 py-1.5 bg-orange-600 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                                {selectedBlog.category}
                            </span>
                            <span className="text-stone-300 text-sm font-medium flex items-center gap-2">
                                <Calendar size={14}/> {selectedBlog.date}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6 drop-shadow-lg">
                            {selectedBlog.title}
                        </h1>
                        <div className="flex items-center gap-4 text-stone-300">
                            <div className="w-10 h-10 rounded-full bg-white text-stone-900 flex items-center justify-center font-bold">म</div>
                            <div>
                                <p className="text-white font-bold">{selectedBlog.author}</p>
                                <p className="text-xs opacity-70">Published Author</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Article Content */}
                <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
                    <p className="text-xl md:text-2xl font-serif text-stone-700 dark:text-stone-300 leading-relaxed mb-12 italic border-l-4 border-orange-500 pl-6">
                        {selectedBlog.excerpt}
                    </p>
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        {selectedBlog.content.split('\n').map((paragraph, idx) => (
                            <p key={idx} className="text-stone-800 dark:text-stone-200 leading-8 mb-6 font-medium">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                    
                    {/* Conclusion/Footer of Article */}
                    <div className="mt-16 pt-8 border-t border-stone-200 dark:border-stone-800 flex justify-between items-center">
                        <span className="text-sm font-bold text-stone-400 uppercase tracking-widest">Share this thought</span>
                        <div className="flex gap-2">
                            <button onClick={() => handleShare(selectedBlog)} className="px-6 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
                                <Share2 size={18}/> Share Article
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default Blog;
