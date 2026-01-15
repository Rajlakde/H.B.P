import React from 'react';
import { Facebook, Instagram, Youtube, Twitter, Heart, ArrowRight, Mail, MapPin, Phone, Globe, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#fffcf5] text-stone-600 py-24 relative overflow-hidden font-sans border-t border-primary-100">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#fde68a 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary-50/80 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20 border-b border-stone-200 pb-16">
          
          {/* Brand Column (Span 4) */}
          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="flex items-center gap-4 group select-none">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-amber-600 flex items-center justify-center text-white font-serif font-bold text-3xl shadow-lg shadow-primary-200 group-hover:scale-105 transition-transform">
                    क
                </div>
                <div>
                  <h2 className="text-4xl font-serif font-bold tracking-tight text-stone-900 leading-none">
                  कांचन <span className="text-primary-600">शेळके</span>
                  </h2>
                  <p className="text-xs font-bold tracking-[0.25em] uppercase text-stone-400 mt-2">Spiritual Portfolio</p>
                </div>
            </Link>
            <p className="text-stone-600 leading-relaxed text-lg font-light max-w-sm">
              वारकरी संप्रदायाचा वारसा डिजिटल युगात पुढे नेण्यासाठी कटिबद्ध. अध्यात्म आणि आधुनिक तंत्रज्ञानाचा सुंदर संगम.
            </p>
            <div className="flex gap-4">
               {[
                 { icon: Facebook, href: '#' },
                 { icon: Instagram, href: '#' },
                 { icon: Youtube, href: '#' },
                 { icon: Twitter, href: '#' }
               ].map((social, i) => (
                 <a key={i} href={social.href} className="w-12 h-12 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-primary-600 hover:text-white hover:border-primary-500 transition-all duration-300 group shadow-sm hover:shadow-md">
                    <social.icon size={22} className="group-hover:scale-110 transition-transform" />
                 </a>
               ))}
            </div>
          </div>

          {/* Quick Links (Span 2) */}
          <div className="lg:col-span-2 lg:col-start-6 pt-2">
            <h4 className="font-serif font-bold text-stone-900 mb-8 text-xl">महत्वाचे दुवे</h4>
            <ul className="space-y-5">
              {[
                { label: 'मुख्यपान', path: '/' },
                { label: 'सेवा', path: '/services' },
                { label: 'भक्ती भांडार', path: '/media' },
                { label: 'विचारधन (ब्लॉग)', path: '/blog' },
                { label: 'आमच्याविषयी', path: '/about' }
              ].map(item => (
                <li key={item.path}>
                    <Link to={item.path} className="text-base text-stone-600 hover:text-primary-700 transition-colors flex items-center gap-3 font-medium group">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-300 group-hover:bg-primary-500 transition-colors"></span>
                        {item.label}
                    </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info (Span 3) */}
          <div className="lg:col-span-3 pt-2">
            <h4 className="font-serif font-bold text-stone-900 mb-8 text-xl">संपर्क</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary-600 group-hover:text-primary-700 transition-colors shrink-0 border border-stone-100 shadow-sm">
                   <MapPin size={22} />
                </div>
                <span className="text-stone-600 text-base leading-relaxed pt-2 group-hover:text-stone-900 transition-colors">आळंदी देवाची, पुणे,<br/>महाराष्ट्र - ४१२१०५</span>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary-600 group-hover:text-primary-700 transition-colors shrink-0 border border-stone-100 shadow-sm">
                   <Phone size={22} />
                </div>
                <span className="text-stone-600 text-base group-hover:text-stone-900 transition-colors">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary-600 group-hover:text-primary-700 transition-colors shrink-0 border border-stone-100 shadow-sm">
                   <Mail size={22} />
                </div>
                <span className="text-stone-600 text-base group-hover:text-stone-900 transition-colors">contact@kanchanshelke.com</span>
              </li>
            </ul>
          </div>
          
          {/* Newsletter (Span 3) */}
          <div className="lg:col-span-3 pt-2">
            <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-soft">
                <h4 className="font-serif font-bold text-stone-900 mb-2 text-lg">अपडेट्स मिळवा</h4>
                <p className="text-sm text-stone-500 mb-6 leading-relaxed">नवीन कार्यक्रम आणि अभंग थेट तुमच्या इनबॉक्समध्ये.</p>
                
                <div className="relative mb-6">
                    <input 
                        type="email" 
                        placeholder="तुमचा ईमेल" 
                        className="w-full pl-5 pr-14 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none text-base text-stone-800 placeholder-stone-400 transition-all"
                    />
                    <button className="absolute right-2 top-2 bottom-2 bg-stone-900 text-white p-3 rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-stone-900/10">
                        <ArrowRight size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-stone-400 font-bold uppercase tracking-wider">
                    <Globe size={14} />
                    <span>Global Spiritual Community</span>
                </div>
            </div>
          </div>

        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-stone-500 font-medium">
          <p>© २०२४ ह.भ.प. कु. कांचन शेळके. सर्व हक्क राखीव. | Designed with <Heart size={14} className="inline text-red-500 fill-red-500 mx-1" /> in Maharashtra</p>
          <div className="flex gap-8 items-center">
             <a href="#" className="hover:text-primary-600 transition-colors">गोपनीयता धोरण</a>
             <a href="#" className="hover:text-primary-600 transition-colors">नियम व अटी</a>
             <Link to="/admin" className="flex items-center gap-1.5 hover:text-primary-600 transition-colors text-xs bg-stone-100 px-3 py-1.5 rounded-full">
                <Lock size={12} /> Admin
             </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
