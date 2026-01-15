import React from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, ArrowRight, Clock, MessageCircle, Send, Copy } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const Contact: React.FC = () => {
  const { success } = useToast();

  const handleCopy = (text: string, label: string) => {
      navigator.clipboard.writeText(text);
      success("कॉपी केले", `${label} क्लिपबोर्डवर कॉपी केला.`);
  };

  return (
    <div className="bg-[#fcfbf9] dark:bg-stone-950 min-h-screen py-24 md:py-32 px-4 md:px-6 transition-colors duration-500 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header - Badge + Title + Description */}
        <div className="text-center mb-16 md:mb-20 animate-slide-up px-4">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-[11px] font-bold uppercase tracking-widest mb-6 border border-orange-100 dark:border-orange-800 shadow-sm">
               <MessageCircle size={14} className="text-amber-600" /> संपर्क
           </div>
           <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-stone-900 dark:text-white mb-6 leading-tight">आम्हाला <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-amber-600">संपर्क</span> करा</h1>
           <p className="text-lg md:text-xl text-stone-500 dark:text-stone-400 font-medium leading-relaxed max-w-2xl mx-auto">
             कार्यक्रमाची चौकशी, देणगी, किंवा इतर कोणत्याही आध्यात्मिक मार्गदर्शनासाठी आमच्याशी संपर्क साधा. आम्ही आपल्या सेवेसाठी सदैव तत्पर आहोत.
           </p>
        </div>

        {/* Desktop: Unified Dashboard Layout */}
        <div className="bg-white dark:bg-stone-900 rounded-[3rem] shadow-xl shadow-stone-200/50 dark:shadow-none border border-stone-100 dark:border-stone-800 overflow-hidden flex flex-col lg:flex-row min-h-[600px] animate-slide-up" style={{ animationDelay: '100ms' }}>
            
            {/* Left Panel: Info (Dark Theme) */}
            <div className="lg:w-2/5 p-8 md:p-12 bg-stone-900 dark:bg-stone-950 text-white relative flex flex-col justify-between overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

                <div className="relative z-10">
                    <h3 className="text-2xl font-serif font-bold mb-8 text-orange-100">संपर्क माहिती</h3>
                    
                    <div className="space-y-8">
                        <div className="flex items-start gap-4 group cursor-pointer" onClick={() => handleCopy('+91 98765 43210', 'Phone Number')}>
                             <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm"><Phone className="text-orange-400" size={24}/></div>
                             <div>
                                <p className="text-xs font-bold uppercase text-stone-400 mb-1 flex items-center gap-2">फोन <Copy size={10} className="opacity-0 group-hover:opacity-100 transition-opacity"/></p>
                                <p className="text-xl font-bold group-hover:text-orange-300 transition-colors">+91 98765 43210</p>
                                <p className="text-sm text-stone-400 mt-1">सोम - शनि (सकाळी ९ - ६)</p>
                             </div>
                        </div>

                        <div className="flex items-start gap-4 group cursor-pointer" onClick={() => handleCopy('contact@santseva.com', 'Email')}>
                             <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm"><Mail className="text-orange-400" size={24}/></div>
                             <div>
                                <p className="text-xs font-bold uppercase text-stone-400 mb-1 flex items-center gap-2">ईमेल <Copy size={10} className="opacity-0 group-hover:opacity-100 transition-opacity"/></p>
                                <p className="text-xl font-bold group-hover:text-orange-300 transition-colors">contact@santseva.com</p>
                                <p className="text-sm text-stone-400 mt-1">२४ तासात उत्तर</p>
                             </div>
                        </div>

                        <div className="flex items-start gap-4">
                             <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm"><MapPin className="text-orange-400" size={24}/></div>
                             <div>
                                <p className="text-xs font-bold uppercase text-stone-400 mb-1">कार्यालय</p>
                                <p className="text-lg leading-relaxed text-stone-200">
                                    श्री ज्ञानेश्वर महाराज संस्थान जवळ,<br/>
                                    आळंदी देवाची, ता. खेड,<br/>
                                    जि. पुणे - ४१२१०५
                                </p>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-12">
                    <p className="text-xs font-bold uppercase text-stone-400 mb-4">सोशल मीडिया कनेक्ट</p>
                    <div className="flex gap-4">
                        {[Facebook, Instagram, Youtube, MessageCircle].map((Icon, i) => (
                            <a key={i} href="#" className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-stone-900 transition-all duration-300">
                                <Icon size={20} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel: Map / Interactive Element */}
            <div className="lg:w-3/5 relative bg-stone-100 dark:bg-stone-800 min-h-[300px] lg:min-h-auto">
                {/* Mock Map Background */}
                <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Google_Maps_Logo_2020.svg/2275px-Google_Maps_Logo_2020.svg.png')] bg-cover bg-center opacity-10 grayscale"></div>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-xl max-w-sm border border-stone-200 dark:border-stone-700 animate-float">
                        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
                            <MapPin size={32} />
                        </div>
                        <h4 className="text-xl font-bold text-stone-900 dark:text-white mb-2">येथे आम्हाला भेटा</h4>
                        <p className="text-stone-500 dark:text-stone-400 mb-6">आळंदी येथे प्रत्यक्ष भेटीसाठी गुगल मॅप वापरा.</p>
                        <button className="w-full py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl font-bold hover:scale-105 transition-transform">
                            गुगल मॅप उघडा
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* FAQ / Extra Info */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            {[
                { title: 'बुकिंगसाठी', text: 'कार्यक्रमाच्या १ महिना आधी संपर्क करणे उत्तम.' },
                { title: 'देणगी', text: 'संस्थेच्या कार्यात हातभार लावण्यासाठी संपर्क करा.' },
                { title: 'स्वयंसेवक', text: 'सेवेत सहभागी होण्यासाठी आमचे व्हॉटसअँप ग्रुप जॉईन करा.' }
            ].map((item, i) => (
                <div key={i} className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800 text-center">
                    <h4 className="font-serif font-bold text-lg mb-2 text-stone-900 dark:text-white">{item.title}</h4>
                    <p className="text-stone-500 dark:text-stone-400 text-sm">{item.text}</p>
                </div>
            ))}
        </div>

      </div>
    </div>
  );
};

export default Contact;