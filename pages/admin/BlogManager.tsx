
import React, { useState, useEffect } from 'react';
import { BlogPost } from '../../types';
import { Plus, Edit2, Trash2, Search, Save, X, Image as ImageIcon, Layout, Calendar, User, PenTool, RefreshCw, ChevronRight, CheckCircle2, Eye, EyeOff, Filter, ArrowLeft } from 'lucide-react';
import { db } from '../../services/db';
import { useToast } from '../../context/ToastContext';

const BlogManager: React.FC = () => {
  const { success, error, info } = useToast();
  
  // State
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Published' | 'Draft'>('All');

  // Editor State
  const initialBlogState: Partial<BlogPost> = {
      title: '',
      content: '',
      excerpt: '',
      category: 'अध्यात्म',
      status: 'Draft',
      author: 'ह.भ.प. कु. कांचनताई',
      date: new Date().toISOString().split('T')[0],
      image: 'https://picsum.photos/800/400'
  };
  const [currentBlog, setCurrentBlog] = useState<Partial<BlogPost>>(initialBlogState);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    setIsLoading(true);
    try {
        const data = await db.getAll('blogs');
        setBlogs(data);
    } catch (e) {
        console.error(e);
        error("लोडिंग त्रुटी", "ब्लॉग पोस्ट्स लोड करताना समस्या आली.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleEdit = (blog: BlogPost) => {
    setCurrentBlog(blog);
    setView('editor');
  };

  const handleDelete = async (id: string) => {
      if (window.confirm("हा लेख नक्की डिलीट करायचा आहे का?")) {
          const updated = blogs.filter(b => b.id !== id);
          setBlogs(updated);
          await db.save('blogs', updated);
          success("लेख डिलीट केला", "ब्लॉग पोस्ट यशस्वीरित्या काढून टाकली.");
      }
  }

  const handleCreate = () => {
    setCurrentBlog({
      ...initialBlogState,
      id: Date.now().toString(),
    });
    setView('editor');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBlog.title) {
        error("शीर्षक आवश्यक", "कृपया लेखाला शीर्षक द्या.");
        return;
    }
    
    setIsSaving(true);
    let updatedList = [...blogs];
    
    // Ensure ID exists
    if (!currentBlog.id) {
        currentBlog.id = Date.now().toString();
    }

    const exists = blogs.find(b => b.id === currentBlog.id);
    if (exists) {
        updatedList = blogs.map(b => b.id === currentBlog.id ? currentBlog as BlogPost : b);
    } else {
        updatedList.push(currentBlog as BlogPost);
    }
    
    try {
        await db.save('blogs', updatedList);
        setBlogs(updatedList);
        success("लेख जतन झाला", "ब्लॉग पोस्ट यशस्वीरित्या अपडेट केली.");
        setView('list'); // Return to list view
    } catch(err) {
        error("त्रुटी", "सेव्ह करताना समस्या आली.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 800000) { // Limit ~800kb
              error("फाईल खूप मोठी आहे", "कृपया 800kb पेक्षा कमी साईजचा फोटो वापरा.");
              return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
              setCurrentBlog({ ...currentBlog, image: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const filteredBlogs = blogs.filter(b => {
      const matchSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'All' || b.status === filterStatus;
      return matchSearch && matchStatus;
  });

  // --- EDITOR VIEW (Advanced) ---
  if (view === 'editor') {
    return (
      <div className="max-w-6xl mx-auto animate-slide-up pb-20">
         {/* Editor Header */}
         <div className="flex items-center justify-between mb-6 sticky top-0 z-20 bg-stone-50/95 dark:bg-stone-950/95 backdrop-blur-md py-4 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-4">
                <button onClick={() => setView('list')} className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-stone-600 dark:text-stone-300"/>
                </button>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-white leading-none">
                        {currentBlog.id === initialBlogState.id ? 'नवीन लेख' : 'लेख संपादन'}
                    </h1>
                    <p className="text-xs text-stone-500 mt-1">
                        {currentBlog.status === 'Published' ? 'हा लेख प्रकाशित आहे' : 'हा लेख ड्राफ्ट मोडमध्ये आहे'}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setCurrentBlog({...currentBlog, status: currentBlog.status === 'Published' ? 'Draft' : 'Published'})}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-2 ${currentBlog.status === 'Published' ? 'border-green-200 text-green-700 bg-green-50' : 'border-stone-200 text-stone-500'}`}
                >
                    {currentBlog.status === 'Published' ? <><Eye size={16}/> Published</> : <><EyeOff size={16}/> Draft</>}
                </button>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-6 py-2.5 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                >
                    {isSaving ? <RefreshCw className="animate-spin" size={18}/> : <Save size={18} />} जतन करा
                </button>
            </div>
         </div>
         
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
             {/* Main Editor */}
             <div className="lg:col-span-2 space-y-6">
                 <div className="bg-white dark:bg-stone-900 p-8 rounded-[2rem] shadow-sm border border-stone-100 dark:border-stone-800">
                    <input 
                        type="text" 
                        placeholder="लेखाचे शीर्षक येथे लिहा..." 
                        className="w-full text-3xl md:text-4xl font-serif font-bold bg-transparent border-none placeholder-stone-300 dark:placeholder-stone-700 text-stone-900 dark:text-white outline-none mb-6 p-0 focus:ring-0"
                        value={currentBlog.title || ''}
                        onChange={e => setCurrentBlog({...currentBlog, title: e.target.value})}
                    />
                    
                    <textarea 
                        rows={15}
                        className="w-full bg-transparent border-none text-lg leading-relaxed text-stone-600 dark:text-stone-300 outline-none resize-none placeholder-stone-300 p-0 focus:ring-0"
                        value={currentBlog.content || ''}
                        onChange={e => setCurrentBlog({...currentBlog, content: e.target.value})}
                        placeholder="तुमचे विचार सविस्तर मांडा..."
                    />
                 </div>

                 <div className="bg-white dark:bg-stone-900 p-6 rounded-[2rem] shadow-sm border border-stone-100 dark:border-stone-800">
                    <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">सारांश (Excerpt)</h3>
                    <textarea 
                        rows={3}
                        className="w-full bg-stone-50 dark:bg-stone-800 p-4 rounded-xl border-none outline-none text-stone-600 dark:text-stone-300 focus:ring-2 focus:ring-primary-500/20 transition-all"
                        value={currentBlog.excerpt || ''}
                        onChange={e => setCurrentBlog({...currentBlog, excerpt: e.target.value})}
                        placeholder="होमपेजवर दिसण्यासाठी लहान सारांश..."
                    />
                 </div>
             </div>

             {/* Sidebar settings */}
             <div className="space-y-6">
                
                {/* Image Uploader */}
                <div className="bg-white dark:bg-stone-900 p-2 rounded-[2rem] shadow-sm border border-stone-100 dark:border-stone-800">
                    <div className="relative aspect-video rounded-[1.5rem] overflow-hidden bg-stone-100 dark:bg-stone-800 group cursor-pointer border-2 border-transparent hover:border-primary-500 transition-all">
                        {currentBlog.image ? (
                            <img src={currentBlog.image} className="w-full h-full object-cover" alt="Cover" />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400">
                                <ImageIcon size={32} className="mb-2"/>
                                <span className="text-xs font-bold">Add Cover Image</span>
                            </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-bold text-sm flex items-center gap-2"><ImageIcon size={16}/> Change Image</span>
                        </div>
                    </div>
                </div>

                {/* Meta Data */}
                <div className="bg-white dark:bg-stone-900 p-6 rounded-[2rem] shadow-sm border border-stone-100 dark:border-stone-800 space-y-5">
                    <div>
                        <label className="text-xs font-bold uppercase text-stone-400 mb-1.5 block">श्रेणी (Category)</label>
                        <select 
                            className="w-full p-3 bg-stone-50 dark:bg-stone-800 rounded-xl font-bold text-stone-700 dark:text-stone-300 outline-none border border-transparent focus:border-primary-500 transition-all"
                            value={currentBlog.category}
                            onChange={e => setCurrentBlog({...currentBlog, category: e.target.value})}
                        >
                            <option value="अध्यात्म">अध्यात्म</option>
                            <option value="संस्कृती">संस्कृती</option>
                            <option value="चरित्र">चरित्र</option>
                            <option value="विज्ञान">विज्ञान</option>
                            <option value="इतर">इतर</option>
                        </select>
                    </div>
                    <div>
                         <label className="text-xs font-bold uppercase text-stone-400 mb-1.5 block">लेखक (Author)</label>
                         <input 
                            type="text" 
                            className="w-full p-3 bg-stone-50 dark:bg-stone-800 rounded-xl font-bold text-stone-700 dark:text-stone-300 outline-none border border-transparent focus:border-primary-500 transition-all"
                            value={currentBlog.author || ''}
                            onChange={e => setCurrentBlog({...currentBlog, author: e.target.value})}
                         />
                    </div>
                    <div>
                         <label className="text-xs font-bold uppercase text-stone-400 mb-1.5 block">तारीख</label>
                         <input 
                            type="date" 
                            className="w-full p-3 bg-stone-50 dark:bg-stone-800 rounded-xl font-bold text-stone-700 dark:text-stone-300 outline-none border border-transparent focus:border-primary-500 transition-all"
                            value={currentBlog.date || ''}
                            onChange={e => setCurrentBlog({...currentBlog, date: e.target.value})}
                         />
                    </div>
                </div>
             </div>
         </div>
      </div>
    )
  }

  // --- LIST VIEW ---
  return (
    <div className="max-w-7xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 px-2">
        <div className="space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-[11px] font-bold uppercase tracking-widest border border-orange-100 dark:border-orange-800 shadow-sm">
               <PenTool size={12} className="text-amber-600" /> लेखन
           </div>
           <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white leading-tight flex items-center gap-2">
              विचारधन <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-amber-600">व्यवस्थापन</span>
              {isLoading && <RefreshCw size={20} className="animate-spin text-stone-400 ml-2" />}
           </h1>
           <p className="text-sm md:text-base text-stone-500 dark:text-stone-400 font-medium leading-relaxed max-w-xl">
              समाजप्रबोधनासाठी नवीन लेख लिहा आणि वेबसाइटवर प्रकाशित करा.
           </p>
        </div>
        <button onClick={handleCreate} className="w-full md:w-auto bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-6 py-3 rounded-2xl font-bold shadow-lg shadow-stone-900/20 hover:scale-105 transition-transform flex items-center justify-center gap-2">
            <Plus size={20} /> नवीन लेख
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-stone-900 p-2 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm mb-8 flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18}/>
              <input 
                type="text" 
                placeholder="लेख शोधा..." 
                className="w-full pl-11 pr-4 py-3 bg-stone-50 dark:bg-stone-800 rounded-xl outline-none font-medium text-stone-900 dark:text-white focus:bg-white dark:focus:bg-black transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <div className="flex bg-stone-50 dark:bg-stone-800 p-1 rounded-xl shrink-0">
              {['All', 'Published', 'Draft'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterStatus === status ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'}`}
                  >
                      {status}
                  </button>
              ))}
          </div>
      </div>

      {/* Table/Card List */}
      <div className="space-y-4">
         {filteredBlogs.length > 0 ? filteredBlogs.map(blog => (
            <div key={blog.id} className="group bg-white dark:bg-stone-900 p-4 rounded-[2rem] border border-stone-100 dark:border-stone-800 hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row gap-6 items-center">
               
               {/* Thumbnail */}
               <div className="w-full md:w-48 aspect-video rounded-2xl overflow-hidden relative bg-stone-100 dark:bg-stone-800 shrink-0">
                  <img src={blog.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
               </div>
               
               {/* Content */}
               <div className="flex-1 text-center md:text-left w-full">
                   <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2 justify-center md:justify-start">
                        <span className={`px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md border w-fit mx-auto md:mx-0 ${blog.status === 'Published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                            {blog.status}
                        </span>
                        <span className="text-xs font-bold text-stone-400">{blog.category}</span>
                        <span className="text-xs text-stone-300 hidden md:inline">•</span>
                        <span className="text-xs text-stone-400 flex items-center gap-1 justify-center md:justify-start"><Calendar size={12} /> {blog.date}</span>
                   </div>

                   <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white mb-2 line-clamp-1">{blog.title}</h3>
                   <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2">{blog.excerpt}</p>
               </div>

               {/* Actions */}
               <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-stone-100 dark:border-stone-800 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-center">
                    <button 
                        onClick={() => handleEdit(blog)} 
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition font-bold text-xs"
                    >
                        <Edit2 size={16}/> Edit
                    </button>
                    <button 
                        onClick={() => handleDelete(blog.id)} 
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition font-bold text-xs"
                    >
                        <Trash2 size={16}/> Delete
                    </button>
               </div>
            </div>
         )) : (
             <div className="text-center py-20 bg-stone-50 dark:bg-stone-900 rounded-[3rem] border border-dashed border-stone-200 dark:border-stone-800">
                 <PenTool size={48} className="mx-auto text-stone-300 mb-4" />
                 <p className="text-stone-500 font-medium">कोणताही लेख सापडला नाही.</p>
                 <button onClick={handleCreate} className="mt-4 text-primary-600 font-bold hover:underline">नवीन लेख लिहा</button>
             </div>
         )}
      </div>
    </div>
  );
};

export default BlogManager;
