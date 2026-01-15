
import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronRight, Sparkles } from 'lucide-react';
import { NAV_LINKS } from '../constants';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out flex justify-center ${scrolled ? 'pt-4' : 'pt-0'}`}>
        <nav 
          className={`
            transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${scrolled 
              ? 'w-[90%] md:w-auto max-w-5xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 dark:border-stone-700/50 py-3 px-6 md:px-8' 
              : 'w-full bg-transparent py-6 px-6 md:px-10 border-b border-transparent'}
          `}
        >
          <div className="flex items-center justify-between gap-8">
            
            {/* Logo */}
            <div className="flex items-center cursor-pointer gap-3 group shrink-0 select-none" onClick={() => navigate('/')}>
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-amber-600 flex items-center justify-center text-white font-serif font-bold text-xl shadow-lg shadow-primary-500/30 transition-transform duration-500 group-hover:rotate-12`}>
                क
              </div>
              <div className={`flex flex-col transition-opacity duration-300`}>
                <h1 className="text-2xl font-serif font-bold tracking-tight text-stone-900 dark:text-white leading-none">
                  कांचन <span className="text-primary-600">शेळके</span>
                </h1>
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-stone-400 dark:text-stone-500 mt-0.5">Spiritual Portfolio</p>
              </div>
            </div>
            
            {/* Desktop Nav - Centered & Clean */}
            <div className="hidden lg:flex items-center gap-1 bg-stone-100/50 dark:bg-stone-800/50 p-1.5 rounded-full border border-stone-200/50 dark:border-stone-700/50">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 relative ${
                        isActive
                          ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm'
                          : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-700/30'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0">
                 <Link to="/booking" className={`hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
                    scrolled 
                    ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:scale-105' 
                    : 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-lg hover:shadow-xl'
                 }`}>
                    <Sparkles size={16} className={scrolled ? "text-amber-400" : "text-primary-600"} />
                    <span>आमंत्रण</span>
                 </Link>
                 
                 {/* Mobile Toggle */}
                 <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="lg:hidden p-2 text-stone-900 dark:text-white bg-stone-100/50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
                  >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                 </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay - Clean & Bright */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end lg:hidden">
          <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-md transition-opacity" onClick={() => setIsOpen(false)}></div>
          
          <div className="relative bg-white dark:bg-stone-900 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 pt-8 max-h-[85vh] overflow-y-auto animate-slide-up border-t border-white/20">
            <div className="flex flex-col gap-2">
              <div className="mb-8 px-2 flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-4">
                 <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => { setIsOpen(false); navigate('/'); }}>
                    <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-serif font-bold text-xl">क</div>
                    <div className="flex flex-col">
                        <span className="font-serif font-bold text-2xl text-stone-900 dark:text-white leading-none">कांचन <span className="text-primary-600">शेळके</span></span>
                        <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-stone-400 dark:text-stone-500 mt-1">Spiritual Portfolio</span>
                    </div>
                 </div>
                 <button onClick={() => setIsOpen(false)} className="p-2 bg-stone-100 dark:bg-stone-800 rounded-full text-stone-500 hover:bg-stone-200 transition"><X size={20}/></button>
              </div>

              <div className="space-y-2">
                {NAV_LINKS.map((link, idx) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `text-lg font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-between ${
                        isActive 
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' 
                        : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`
                    }
                    style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'backwards' }}
                  >
                    {({ isActive }) => (
                      <>
                        <span className="animate-slide-up">{link.label}</span>
                        {isActive && <ChevronRight size={20} className="text-primary-500" />}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
               
               <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800">
                 <Link
                    to="/booking"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-4 rounded-2xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold text-center text-lg shadow-xl shadow-stone-900/10 active:scale-95 transition-transform flex items-center justify-center gap-3"
                  >
                    <Sparkles size={20} className="text-amber-400 dark:text-orange-600"/> आमंत्रण द्या
                  </Link>
               </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
