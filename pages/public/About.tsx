import React from 'react';
import { User, Award, BookOpen, Users, Star, ArrowRight, Quote, MapPin, GraduationCap, Scroll, Heart, Home, LocateFixed, Feather, Sparkles, Info } from 'lucide-react';

const About: React.FC = () => {
  const personalDetails = [
    { label: 'संपूर्ण नाव', value: 'कु. कांचनताई शिवानंदजी शेळके', icon: User, colSpan: 'col-span-2' },
    { label: 'मूळ गाव', value: 'पांगरी', icon: Home, colSpan: 'col-span-1' },
    { label: 'तालुका', value: 'बार्शी', icon: LocateFixed, colSpan: 'col-span-1' },
    { label: 'जिल्हा', value: 'सोलापूर (महाराष्ट्र)', icon: MapPin, colSpan: 'col-span-2' },
    { label: 'शिक्षण', value: 'एम.ए. (संत साहित्य), आळंदी', icon: GraduationCap, colSpan: 'col-span-2' },
    { label: 'संप्रदाय', value: 'वारकरी संप्रदाय', icon: Scroll, colSpan: 'col-span-2' },
    { label: 'विशेष आवड', value: 'कीर्तन, वाचन, गोसेवा', icon: Heart, colSpan: 'col-span-2' },
  ];

  return (
    <div className="bg-[#fcfbf9] dark:bg-stone-950 min-h-screen py-24 md:py-32 transition-colors duration-500 font-sans selection:bg-orange-100 selection:text-orange-900">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Main Page Header - Badge + Title + Description */}
        <div className="text-center mb-16 md:mb-24 max-w-4xl mx-auto animate-slide-up">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-[11px] font-bold uppercase tracking-widest mb-6 border border-orange-100 dark:border-orange-800 shadow-sm">
              <Info size={14} className="text-amber-600" /> परिचय
           </div>
           <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-stone-900 dark:text-white mb-6 leading-tight">
             वारकरी <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-amber-600">परंपरा</span> व <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-amber-600">वारसा</span>
           </h1>
           <p className="text-lg md:text-xl text-stone-500 dark:text-stone-400 font-medium leading-relaxed max-w-2xl mx-auto">
             बालवयातच कीर्तन सेवेचा वसा घेऊन, संत साहित्याच्या गाढा अभ्यासातून समाजातील अनिष्ट प्रथांवर प्रहार करणारे युवा व्यक्तिमत्त्व.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-24 items-start">
            
            {/* Left Column: Sticky Profile, Name & Micro Info */}
            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28 order-1 space-y-8">
                
                {/* Profile Image Card */}
                <div className="relative group perspective-1000">
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-200 to-amber-100 dark:from-orange-900/40 dark:to-stone-800 rounded-[2.5rem] rotate-6 scale-95 opacity-70 group-hover:rotate-3 transition-transform duration-700"></div>
                    
                    <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-stone-900/10 dark:shadow-black/50 border-4 border-white dark:border-stone-800 bg-stone-200">
                        <img 
                          src="https://picsum.photos/800/1200" 
                          alt="H.B.P. Kanchan Shelke" 
                          className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
                        
                        <div className="absolute bottom-8 left-8 right-8 text-white">
                             <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/90 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider mb-3 shadow-lg">
                                <Star size={12} fill="currentColor" /> युवा कीर्तनकार
                             </div>
                             <p className="text-white/90 font-light text-sm tracking-wide opacity-90">वारकरी संप्रदाय</p>
                        </div>
                    </div>
                </div>

                {/* Grand Full Name Typography (Positioned Below Photo) */}
                <div className="text-center py-2 animate-slide-up space-y-3">
                    <span className="inline-block text-xs font-bold text-orange-600 tracking-[0.3em] uppercase border-b border-orange-200 pb-1">
                        ॥ रामकृष्ण हरि ॥
                    </span>
                    <h1 className="font-serif font-bold text-stone-900 dark:text-white leading-[1.1] py-1">
                        <span className="block text-2xl text-stone-400 font-light mb-1">ह.भ.प.</span>
                        <span className="block text-4xl xl:text-5xl mb-1 tracking-tight">कु. कांचनताई</span>
                        <span className="block text-4xl xl:text-5xl text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-amber-600 tracking-tight pb-1">
                            शिवानंदजी शेळके
                        </span>
                    </h1>
                </div>

                {/* Micro Information Card (Personal Details) */}
                <div className="bg-white dark:bg-stone-900 rounded-[2rem] p-8 shadow-xl shadow-stone-200/50 dark:shadow-none border border-stone-100 dark:border-stone-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 dark:bg-orange-900/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white mb-8 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 shadow-sm">
                                <User size={20} />
                            </span>
                            वैयक्तिक परिचय
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                            {personalDetails.map((item, idx) => (
                                <div key={idx} className={`${item.colSpan || 'col-span-2'} group`}>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5 flex items-center gap-1.5">
                                        <item.icon size={12} className="text-orange-400/70" /> {item.label}
                                    </p>
                                    <p className="text-base font-bold text-stone-800 dark:text-stone-200 border-b border-stone-100 dark:border-stone-800 pb-2 group-hover:border-orange-200 dark:group-hover:border-orange-800/50 transition-colors leading-tight">
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-gradient-to-br from-orange-50 to-white dark:from-stone-900 dark:to-stone-800 p-6 rounded-[2rem] border border-orange-100 dark:border-stone-800 text-center shadow-sm">
                       <h4 className="text-3xl font-bold text-orange-600 dark:text-orange-500 mb-1">१०+</h4>
                       <p className="text-xs font-bold text-stone-400 uppercase tracking-wide">वर्षे अखंड सेवा</p>
                   </div>
                   <div className="bg-white dark:bg-stone-900 p-6 rounded-[2rem] border border-stone-100 dark:border-stone-800 text-center shadow-sm">
                       <h4 className="text-3xl font-bold text-stone-900 dark:text-white mb-1">५००+</h4>
                       <p className="text-xs font-bold text-stone-400 uppercase tracking-wide">यशस्वी कार्यक्रम</p>
                   </div>
                </div>

            </div>

            {/* Right Column: Content Flow */}
            <div className="lg:col-span-7 xl:col-span-8 order-2 space-y-16 lg:pt-8">
                
                {/* Intro Content */}
                <div className="animate-slide-up">
                    <h3 className="text-3xl font-serif font-bold text-stone-900 dark:text-white mb-6">
                        जीवन प्रवास
                    </h3>
                    <div className="prose prose-lg dark:prose-invert max-w-none text-stone-600 dark:text-stone-300 leading-relaxed space-y-6">
                        <p className="text-xl font-light text-stone-800 dark:text-stone-200 border-l-4 border-orange-500 pl-6 mb-8 bg-orange-50/50 dark:bg-orange-900/10 py-2 rounded-r-xl">
                           "वारकरी संप्रदायाचा पवित्र वारसा आणि आधुनिक विचारांचा संगम. बालवयातच कीर्तन सेवेचा वसा घेऊन, संत साहित्याच्या गाढा अभ्यासातून समाजातील अनिष्ट प्रथांवर प्रहार करणारे आणि तरुणांना अध्यात्माची गोडी लावणारे एक तेजस्वी युवा व्यक्तिमत्त्व."
                        </p>
                        <p>
                            ह.भ.प. कु. कांचनताई शिवानंदजी शेळके यांचा जन्म सोलापूर जिल्ह्यातील बार्शी तालुक्यातील पांगरी या पवित्र गावी झाला. 
                            लहानपणापासूनच घरातून अध्यात्मिक बाळकडू मिळाले असल्याने, वयाच्या अवघ्या ७ व्या वर्षी त्यांनी कीर्तन सेवेला सुरुवात केली. 
                            बालवयातच आपल्या ओजस्वी वाणीने त्यांनी श्रोत्यांची मने जिंकली.
                        </p>
                        <p>
                            वारकरी संप्रदायाची थोर परंपरा पुढे नेण्यासाठी त्यांनी आळंदी देवाची येथे वास्तव्य करून 'एम.ए. (संत साहित्य)' पर्यंतचे उच्च शिक्षण पूर्ण केले. 
                            शास्त्रशुद्ध संगीत आणि संत साहित्याचा गाढा अभ्यास यामुळे त्यांची कीर्तन शैली ही अत्यंत ओघवती, रसाळ आणि तरुणांना अध्यात्माकडे आकर्षित करणारी आहे.
                        </p>
                        <p>
                            केवळ अध्यात्मच नव्हे, तर अंधश्रद्धा निर्मूलन, व्यसनमुक्ती, बेटी बचाओ-बेटी पढाओ आणि गो-सेवा यांसारख्या सामाजिक विषयांवर त्या कीर्तनाच्या माध्यमातून सातत्याने जनजागृती करत असतात. 
                            आज सोशल मीडियाच्या माध्यमातून त्यांचे विचार जगभरातील लाखो भक्तांपर्यंत पोहोचत आहेत.
                        </p>
                    </div>
                </div>

                {/* Timeline / Journey */}
                <div>
                   <div className="flex items-center gap-4 mb-10">
                      <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-full text-stone-900 dark:text-white">
                         <Feather size={24} />
                      </div>
                      <h3 className="text-3xl font-serif font-bold text-stone-900 dark:text-white">
                         अध्यात्म प्रवास
                      </h3>
                      <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800"></div>
                   </div>
                   
                   <div className="relative border-l-2 border-dashed border-stone-200 dark:border-stone-800 ml-4 space-y-12">
                      {[
                        { year: '२०१०', title: 'बाल कीर्तनकार', desc: 'वयाच्या ७ व्या वर्षी कीर्तन सेवेचा श्रीगणेशा. प्रथम कीर्तन सेवेतूनच लोकांची मने जिंकली.' },
                        { year: '२०१५', title: 'संत साहित्याचा अभ्यास', desc: 'आळंदी येथे वारकरी शिक्षण संस्थेतून संत वाङ्मयाचे शास्त्रशुद्ध शिक्षण.' },
                        { year: '२०२२', title: 'युवा कीर्तनकार गौरव', desc: 'विविध संस्थांकडून युवा कीर्तनकार म्हणून गौरव आणि पुरस्कार प्राप्त.' },
                        { year: '२०२४', title: 'डिजिटल सेवा', desc: 'सोशल मीडिया आणि वेबसाईटच्या माध्यमातून जगभरातील भक्तांपर्यंत पोहोचण्याचा संकल्प.' }
                      ].map((item, idx) => (
                         <div key={idx} className="relative pl-12 group">
                            <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-stone-950 bg-stone-300 group-hover:bg-orange-500 transition-colors shadow-sm"></span>
                            <span className="text-orange-600 font-bold text-xs tracking-widest uppercase block mb-1 font-sans">{item.year}</span>
                            <h4 className="text-xl font-bold text-stone-900 dark:text-white mb-2 font-serif group-hover:text-orange-600 transition-colors">{item.title}</h4>
                            <p className="text-stone-500 dark:text-stone-400 leading-relaxed">{item.desc}</p>
                         </div>
                      ))}
                   </div>
                </div>

                {/* Awards Grid */}
                <div>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-full text-stone-900 dark:text-white">
                         <Award size={24} />
                      </div>
                      <h3 className="text-3xl font-serif font-bold text-stone-900 dark:text-white">
                         पुरस्कार व सन्मान
                      </h3>
                      <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800"></div>
                   </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                           { name: 'बाल कीर्तनकार पुरस्कार', year: '२०१५', by: 'स्थानिक मंडळ' },
                           { name: 'संत साहित्य अभ्यासक', year: '२०२०', by: 'वारकरी शिक्षण संस्था' },
                           { name: 'युवा प्रेरणा', year: '२०२३', by: 'रोटरी क्लब' },
                           { name: 'समाज भूषण', year: '२०२४', by: 'ग्रामस्थ मंडळ' }
                        ].map((award, i) => (
                           <div key={i} className="flex items-center gap-5 p-6 rounded-[2rem] bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 shadow-sm hover:shadow-xl hover:shadow-stone-200/50 dark:hover:shadow-black/50 hover:border-orange-200 transition-all group duration-300 hover:-translate-y-1">
                               <div className="w-14 h-14 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-500 group-hover:scale-110 transition-transform shadow-inner">
                                  <Award size={28} />
                                </div>
                                <div>
                                  <h4 className="font-bold text-xl text-stone-900 dark:text-white leading-tight mb-1">{award.name}</h4>
                                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">{award.year} • {award.by}</p>
                                </div>
                           </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default About;