import React from 'react';
import { Mic2, Book, Users, School, ArrowRight, Sparkles, Calendar, Phone, CheckCircle, HandHeart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Services: React.FC = () => {
  const services = [
    {
      icon: <Mic2 size={32} className="text-orange-600" />,
      color: "bg-orange-50 dark:bg-orange-900/20",
      title: "कीर्तन सेवा",
      description: "संत साहित्यावर आधारित सुश्राव्य कीर्तन सेवा. गायन आणि निरूपणाचा सुंदर संगम, जो श्रोत्यांना मंत्रमुग्ध करतो.",
      tags: ["गायन", "निरूपण", "प्रबोधन"]
    },
    {
      icon: <Book size={32} className="text-amber-600" />,
      color: "bg-amber-50 dark:bg-amber-900/20",
      title: "कथा सप्ताह",
      description: "श्रीमद् भागवत, ज्ञानेश्वरी किंवा रामायणाचे ७ दिवसांचे पारायण आणि कथा. रोजचा विशेष कार्यक्रम.",
      tags: ["भागवत", "ज्ञानेश्वरी", "रामायण"]
    },
    {
      icon: <Users size={32} className="text-blue-600" />,
      color: "bg-blue-50 dark:bg-blue-900/20",
      title: "प्रवचन",
      description: "दैनंदिन जीवनातील समस्यांवर अध्यात्मिक उपाय सांगणारे प्रवचन. मानसिक शांतता आणि दिशा देण्यासाठी.",
      tags: ["मार्गदर्शन", "चिंतन"]
    },
    {
      icon: <School size={32} className="text-green-600" />,
      color: "bg-green-50 dark:bg-green-900/20",
      title: "संस्कार वर्ग",
      description: "लहान मुले आणि तरुणांसाठी विशेष संस्कार शिबीर. भारतीय संस्कृती आणि मूल्यांची ओळख.",
      tags: ["बालसंस्कार", "शिबीर"]
    }
  ];

  return (
    <div className="bg-[#fcfbf9] dark:bg-stone-950 min-h-screen py-24 md:py-32 px-4 md:px-6 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        
        {/* Header - Badge + Title + Description */}
        <div className="text-center mb-16 md:mb-24 max-w-3xl mx-auto animate-slide-up px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-[11px] font-bold uppercase tracking-widest mb-6 border border-orange-100 dark:border-orange-800 shadow-sm">
             <HandHeart size={14} className="text-amber-600"/> आमच्या सेवा
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-stone-900 dark:text-white mb-6 leading-tight">
            अध्यात्मिक <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-amber-600">उपक्रम</span>
          </h1>
          <p className="text-lg md:text-xl text-stone-500 dark:text-stone-400 font-medium leading-relaxed max-w-2xl mx-auto">
            कीर्तन, प्रवचन आणि संस्कार वर्गांच्या माध्यमातून समाजप्रबोधनाची अखंड सेवा. मनाला शांती आणि जीवनाला योग्य दिशा देणारे विविध कार्यक्रम.
          </p>
        </div>

        {/* Services Grid - Upgraded to 3 columns on LG */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24 animate-slide-up" style={{ animationDelay: '100ms' }}>
          {services.map((service, index) => (
            <div key={index} className="group bg-white dark:bg-stone-900 p-8 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-sm hover:shadow-2xl hover:shadow-stone-200/50 dark:hover:shadow-black/50 transition-all duration-500 hover:-translate-y-2 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                  <div className={`w-16 h-16 rounded-2xl ${service.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                      {service.icon}
                  </div>
                  <div className="p-2 bg-stone-50 dark:bg-stone-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight size={20} className="text-stone-400 -rotate-45 group-hover:rotate-0 transition-transform duration-300"/>
                  </div>
              </div>
              
              <h3 className="text-2xl font-bold text-stone-900 dark:text-white mb-3 font-serif group-hover:text-orange-600 transition-colors">{service.title}</h3>
              <p className="text-stone-500 dark:text-stone-400 leading-relaxed mb-6 text-base flex-grow">{service.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                  {service.tags.map(tag => (
                      <span key={tag} className="text-[10px] uppercase font-bold px-2 py-1 bg-stone-100 dark:bg-stone-800 text-stone-500 rounded-md">
                          {tag}
                      </span>
                  ))}
              </div>

              <Link to="/booking" className="w-full py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-center hover:bg-stone-900 hover:text-white dark:hover:bg-white dark:hover:text-stone-900 transition-all shadow-sm">
                बुकिंग करा
              </Link>
            </div>
          ))}

          {/* Special 'Custom' Card */}
          <div className="group bg-gradient-to-br from-stone-900 to-stone-800 text-white p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col justify-center text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="relative z-10">
                 <h3 className="text-3xl font-serif font-bold mb-4">इतर कार्यक्रम?</h3>
                 <p className="text-stone-300 mb-8 text-lg">
                    आपल्या विशेष गरजांनुसार कार्यक्रम आयोजित करण्यासाठी थेट संपर्क साधा.
                 </p>
                 <Link to="/contact" className="inline-block bg-white text-stone-900 px-8 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors">
                    संपर्क साधा
                 </Link>
              </div>
          </div>
        </div>

        {/* Process Section */}
        <div className="max-w-5xl mx-auto animate-slide-up" style={{ animationDelay: '200ms' }}>
            <h2 className="text-3xl font-serif font-bold text-center mb-12 text-stone-900 dark:text-white">बुकिंग प्रक्रिया</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-stone-300 dark:via-stone-700 to-transparent z-0"></div>

                {[
                    { icon: Calendar, title: 'तारीख निवडा', desc: 'बुकिंग फॉर्म भरा आणि आपली पसंतीची तारीख निवडा.' },
                    { icon: Phone, title: 'फोन कन्फर्मेशन', desc: 'आमचे प्रतिनिधी तुम्हाला फोन करून तपशील निश्चित करतील.' },
                    { icon: CheckCircle, title: 'कार्यक्रम निश्चित', desc: 'तारीख कन्फर्म झाल्यावर अधिकृत आमंत्रण पाठवले जाईल.' }
                ].map((step, i) => (
                    <div key={i} className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-white dark:bg-stone-900 rounded-full border-4 border-stone-100 dark:border-stone-800 flex items-center justify-center mb-6 shadow-lg">
                            <step.icon size={32} className="text-orange-500" />
                        </div>
                        <h4 className="text-xl font-bold text-stone-900 dark:text-white mb-2">{step.title}</h4>
                        <p className="text-stone-500 dark:text-stone-400 text-sm max-w-xs">{step.desc}</p>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default Services;