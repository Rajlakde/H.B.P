import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  MessageSquare, 
  Image, 
  LogOut, 
  Users, 
  FileText,
  Menu,
  X,
  Settings,
  Share2,
  Link as LinkIcon,
  Globe,
  Quote
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { info } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
      info("लॉग आउट", "तुम्ही यशस्वीरित्या बाहेर पडलात.");
      navigate('/');
  };

  const navItems = [
    { path: '/admin', label: 'डॅशबोर्ड', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/calendar', label: 'कार्यक्रम', icon: <Calendar size={20} /> },
    { path: '/admin/inquiries', label: 'विनंत्या', icon: <MessageSquare size={20} /> },
    { path: '/admin/blog-manager', label: 'ब्लॉग लेखन', icon: <FileText size={20} /> },
    { path: '/admin/media', label: 'मीडिया गॅलरी', icon: <Image size={20} /> },
    { path: '/admin/social', label: 'सोशल मीडिया', icon: <Share2 size={20} /> },
    { path: '/admin/integrations', label: 'इंटीग्रेशन्स', icon: <LinkIcon size={20} /> },
    { path: '/admin/settings', label: 'सेटिंग्ज', icon: <Settings size={20} /> },
    { path: '/admin/subscribers', label: 'भक्त परिवार', icon: <Users size={20} /> },
  ];

  const bottomNavItems = [
    { path: '/admin', label: 'डॅशबोर्ड', icon: <LayoutDashboard size={24} /> },
    { path: '/admin/calendar', label: 'कॅलेंडर', icon: <Calendar size={24} /> },
    { path: '/admin/inquiries', label: 'विनंत्या', icon: <MessageSquare size={24} /> },
  ];

  return (
    <div className="flex h-screen bg-stone-50 font-sans overflow-hidden text-stone-800">
      
      {/* Sidebar - Clean & Light */}
      <aside className="hidden md:flex w-64 bg-white border-r border-stone-100 flex-col z-20">
        <div className="p-6 flex items-center gap-3 cursor-pointer select-none group" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-amber-600 flex items-center justify-center font-bold text-white font-serif shadow-md transition-transform group-hover:scale-105">क</div>
          <div>
             <h2 className="text-lg font-serif font-bold text-stone-900 leading-none">कांचन <span className="text-primary-600">शेळके</span></h2>
             <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Admin Panel</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm group ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                }`
              }
            >
              <span className={`mr-3 ${location.pathname === item.path ? 'text-primary-600' : 'text-stone-400 group-hover:text-stone-600'}`}>
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer Quote */}
        <div className="px-6 py-4 mx-4 mb-2 bg-stone-50 rounded-xl border border-stone-100 text-center">
            <Quote size={12} className="mx-auto text-primary-400 mb-1" />
            <p className="text-[10px] text-stone-500 font-serif italic">"जनसेवा हीच ईश्वरसेवा"</p>
        </div>

        <div className="p-4 border-t border-stone-50">
           <button 
              onClick={() => navigate('/')}
              className="flex items-center w-full px-4 py-3 text-stone-500 hover:bg-stone-50 rounded-xl transition-all text-sm font-medium mb-1"
            >
              <Globe size={18} className="mr-3" /> वेबसाईट
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all text-sm font-medium"
            >
              <LogOut size={18} className="mr-3" /> बाहेर पडा
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
         {/* Top Header Mobile */}
         <header className="md:hidden h-16 bg-white/80 backdrop-blur-md border-b border-stone-100 flex items-center justify-between px-6 shrink-0 z-30 sticky top-0">
             <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => navigate('/')}>
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-amber-600 flex items-center justify-center font-bold text-white text-sm font-serif shadow-md">क</div>
               <div className="flex flex-col">
                  <span className="font-serif font-bold text-lg text-stone-900 leading-none">कांचन <span className="text-primary-600">शेळके</span></span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Admin</span>
               </div>
             </div>
             <button onClick={() => navigate('/')} className="text-stone-400 hover:text-primary-600 transition-colors">
                <Globe size={22}/>
             </button>
         </header>

         <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 md:pb-8 scroll-smooth bg-stone-50/50">
            <Outlet />
         </main>

         {/* Mobile Floating Dock */}
         <div className="md:hidden fixed bottom-6 left-6 right-6 z-40">
            <div className="bg-white/90 backdrop-blur-xl rounded-full px-6 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white flex justify-between items-center">
               {bottomNavItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/admin'}
                    className={({ isActive }) => `
                      flex flex-col items-center justify-center p-2 rounded-full transition-all
                      ${isActive 
                        ? 'text-primary-600 bg-primary-50' 
                        : 'text-stone-400 hover:text-stone-600'}
                    `}
                  >
                     {React.cloneElement(item.icon as React.ReactElement, { size: 24 })}
                  </NavLink>
               ))}
               <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className={`p-2 rounded-full ${isMobileMenuOpen ? 'text-primary-600 bg-primary-50' : 'text-stone-400'}`}
               >
                  <Menu size={24} />
               </button>
            </div>
         </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
           <div className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
           
           <div className="relative bg-white rounded-t-[2rem] shadow-2xl max-h-[85vh] overflow-y-auto animate-slide-up p-6">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-serif font-bold text-stone-900">मेनू</h2>
                 <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-stone-100 rounded-full text-stone-500"><X size={20}/></button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                 {navItems.map(item => (
                    <NavLink
                       key={item.path}
                       to={item.path}
                       onClick={() => setIsMobileMenuOpen(false)}
                       className={({ isActive }) => 
                          `flex flex-col items-center justify-center p-4 rounded-2xl border transition-all aspect-square ${
                             isActive 
                             ? 'bg-primary-50 border-primary-100 text-primary-700' 
                             : 'bg-stone-50 border-stone-100 text-stone-600'
                          }`
                       }
                    >
                       <div className="mb-2">{item.icon}</div>
                       <span className="text-[10px] font-bold text-center">{item.label}</span>
                    </NavLink>
                 ))}
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default AdminLayout;