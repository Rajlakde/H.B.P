
import React, { useState, useEffect } from 'react';
import { Calendar, Video, ArrowRight, Sparkles, ChevronRight, MapPin, Heart, Phone, X, Info, Users, Timer, Share2, Clock, Map, Copy, Quote, Check, ExternalLink, Feather, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../../services/db';
import { Event, Abhang, SocialPost, BlogPost } from '../../types';
import { DEMO_ABHANG } from '../../data/demoData';
import { PLATFORM_STATS, SOCIAL_LINKS } from '../../constants';
import { EventCardSkeleton, SkeletonBlock, BlogCardSkeleton } from '../../components/Skeletons';
import { useToast } from '../../context/ToastContext';

const Home: React.FC = () => {
  const { success } = useToast();
  // State
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [nextEvent, setNextEvent] = useState<Event | null>(null);
  const [todayEvent, setTodayEvent] = useState<Event | null>(null);
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [dailyAbhang, setDailyAbhang] = useState<Abhang>(DEMO_ABHANG);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Typewriter Effect State
  const [greetingText, setGreetingText] = useState('');
  const fullGreeting = "राम कृष्ण हरी माऊली...";

  // Dynamic Social Stats
  const totalFollowers = PLATFORM_STATS.reduce((acc, curr) => acc + curr.followers, 0);
  const formattedFollowers = (totalFollowers / 1000).toFixed(1) + 'K+';

  useEffect(() => {
    // Typewriter Logic
    let timeoutId: ReturnType<typeof setTimeout>;
    let currentIndex = 0;
    let isDeleting = false;

    const animateText = () => {
      if (!isDeleting) {
        if (currentIndex < fullGreeting.length) {
          currentIndex++;
          setGreetingText(fullGreeting.slice(0, currentIndex));
          timeoutId = setTimeout(animateText, 100);
        } else {
          isDeleting = true;
          timeoutId = setTimeout(animateText, 2000); // Pause at end
        }
      } else {
        if (currentIndex > 0) {
          currentIndex--;
          setGreetingText(fullGreeting.slice(0, currentIndex));
          timeoutId = setTimeout(animateText, 50);
        } else {
          isDeleting = false;
          timeoutId = setTimeout(animateText, 500); // Pause at start
        }
      }
    };

    timeoutId = setTimeout(animateText, 500);
    loadData();
    return () => clearTimeout(timeoutId);
  }, []);

  // --- Fixed Countdown Logic ---
  useEffect(() => {
    if (!nextEvent) return;

    const calculateTimeLeft = () => {
        // Assume event starts at 9:00 AM on the specific date for the countdown
        const eventDate = new Date(nextEvent.date);
        eventDate.setHours(9, 0, 0, 0); 
        
        const now = new Date();
        const difference = eventDate.getTime() - now.getTime();

        if (difference > 0) {
            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            });
        } else {
            // Event has started or passed today
            setTimeLeft(null); 
        }
    };

    calculateTimeLeft(); // Run immediately
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [nextEvent]);

  const loadData = async () => {
      setIsLoading(true);
      try {
          // 1. Events
          const events = await db.getAll('events');
          
          // Get Today's Date String (YYYY-MM-DD)
          // We use local time to ensure 'today' matches the user's perception
          const todayObj = new Date();
          const year = todayObj.getFullYear();
          const month = String(todayObj.getMonth() + 1).padStart(2, '0');
          const day = String(todayObj.getDate()).padStart(2, '0');
          const todayStr = `${year}-${month}-${day}`;

          // Find Today's Event
          const todaysLive = events.find((e: Event) => e.isPublished && e.date === todayStr);
          setTodayEvent(todaysLive || null);

          // Filter for future events (Excluding today for the "Upcoming" list if needed, 
          // but typically we keep today in upcoming until it's over. 
          // Here we filter >= today for general list, but > today for 'Next Event' if we have a specific 'Today' card)
          const todayDateObj = new Date();
          todayDateObj.setHours(0, 0, 0, 0);

          const publishedEvents = events
            .filter((e: Event) => e.isPublished && new Date(e.date) >= todayDateObj)
            .sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          setUpcomingEvents(publishedEvents.slice(0, 3));
          
          // Next event logic: If we have a today event, the 'next' event for countdown 
          // should probably be the one *after* today, unless we want to countdown to today's start time.
          // Let's grab the first one that isn't 'todayEvent' for the countdown if todayEvent exists.
          if (todaysLive) {
             const future = publishedEvents.filter(e => e.id !== todaysLive.id);
             setNextEvent(future.length > 0 ? future[0] : null);
          } else {
             setNextEvent(publishedEvents.length > 0 ? publishedEvents[0] : null);
          }

          // 2. Abhang
          const settings = await db.getAll('settings');
          const abhangSetting = settings.find((s: any) => s.id === 'daily_abhang');
          if (abhangSetting) {
              setDailyAbhang(abhangSetting.value);
          }

          // 3. Social Posts
          const posts = await db.getAll('social_posts');
          const featured = posts.filter((p: SocialPost) => p.isFeatured).slice(0, 4);
          setSocialPosts(featured);

          // 4. Blogs
          const blogs = await db.getAll('blogs');
          const publishedBlogs = blogs
            .filter((b: BlogPost) => b.status === 'Published')
            .slice(0, 3);
          setLatestBlogs(publishedBlogs);

      } catch (e) {
          console.error("Failed to load data on home", e);
      } finally {
          setIsLoading(false);
      }
  };

  const handleShare = async () => {
      const text = `"${dailyAbhang.text}"\n\n- ${dailyAbhang.sant}\n\nभावार्थ: ${dailyAbhang.meaning}\n\nअधिक माहितीसाठी भेट द्या: kanchanshelke.com`;
      if (navigator.share) {
          try {
              await navigator.share({
                  title: 'Daily Suvichar',
                  text: text,
                  url: window.location.href
              });
          } catch (err) {
              console.log('Error sharing', err);
          }
      } else {
          navigator.clipboard.writeText(text);
          success("Text Copied", "सुविचार कॉपी केला.");
      }
  };

  const handleCopy = () => {
      const text = `"${dailyAbhang.text}"\n\n- ${dailyAbhang.sant}\n\nभावार्थ: ${dailyAbhang.meaning}`;
      navigator.clipboard.writeText(text);
      success("Text Copied", "सुविचार क्लिपबोर्डवर कॉपी केला.");
  };

  const getSocialIcon = (platform: string) => {
      switch (platform) {
          case 'YouTube': return <Video size={20} fill="currentColor" />;
          case 'Instagram': return (
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          );
          case 'Facebook': return (
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          );
          default: return <Video size={20} />;
      }
  };

  const getPlatformColor = (platform: string) => {
      switch (platform) {
          case 'YouTube': return 'bg-red-600';
          case 'Instagram': return 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500';
          case 'Facebook': return 'bg-blue-600';
          default: return 'bg-stone-500';
      }
  };

  return (
    <div className="bg-[#fcfbf9] dark:bg-stone-950 min-h-screen selection:bg-primary-100 selection:text-primary-900 overflow-x-hidden font-sans transition-colors duration-500 relative">
      
      {/* Background Branding Watermark */}
      <div className="fixed top-24 left-10 opacity-[0.03] dark:opacity-[0.05] pointer-events-none select-none z-0">
          <span className="text-[15rem] md:text-[25rem] font-serif font-bold text-orange-600 leading-none">ॐ</span>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 md:px-6 overflow-hidden pt-20">
         <div className="absolute inset-0 z-0 pointer-events-none">
             <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#fcfbf9] via-[#fcfbf9]/80 to-transparent dark:from-stone-950 dark:via-stone-950/80 z-10"></div>
         </div>

         <div className="max-w-7xl mx-auto relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Typography */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
               <div className="h-6 flex items-center justify-center lg:justify-start">
                   <span className="text-sm font-sans text-stone-500 dark:text-stone-500 font-medium tracking-wide opacity-80 min-h-[24px]">
                       {greetingText}
                       <span className="animate-pulse ml-1 text-stone-400">|</span>
                   </span>
               </div>

               <div className="animate-slide-up space-y-3" style={{ animationDelay: '100ms' }}>
                   <div className="inline-block px-6 py-2 rounded-full border border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 shadow-sm mb-2 backdrop-blur-sm">
                      <span className="text-base font-extrabold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
                        ह.भ.प.
                      </span>
                   </div>
                   <h1 className="font-sans font-extrabold text-stone-900 dark:text-white leading-snug tracking-tight">
                      <span className="block text-5xl md:text-7xl pb-1">
                        कु. कांचनताई
                      </span>
                      <span className="block text-5xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500 py-2">
                        शिवानंदजी शेळके
                      </span>
                   </h1>
               </div>
               
               <div className="animate-slide-up pt-4 flex items-center justify-center lg:justify-start gap-4 opacity-90" style={{ animationDelay: '300ms' }}>
                   <span className="h-px w-12 bg-gradient-to-r from-transparent to-stone-300 dark:to-stone-700"></span>
                   <span className="font-serif text-2xl text-stone-600 dark:text-stone-300">
                      कृष्ण सदा सहायते
                   </span>
                   <span className="h-px w-12 bg-gradient-to-l from-transparent to-stone-300 dark:to-stone-700"></span>
               </div>

               <p className="text-lg font-light text-stone-600 dark:text-stone-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-slide-up pt-4" style={{ animationDelay: '400ms' }}>
                  कीर्तन, प्रवचन आणि समाजप्रबोधनाचा वारसा जपणारे युवा व्यक्तिमत्त्व. <br className="hidden md:block"/>
                  अध्यात्म आणि विज्ञानाचा सुंदर मिलाफ.
               </p>
               
               <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
                  <Link to="/about" className="px-8 py-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                     <Users size={20} /> माझ्याबद्दल
                  </Link>
                  <Link to="/booking" className="px-8 py-4 bg-white dark:bg-stone-800 text-stone-900 dark:text-white border border-stone-200 dark:border-stone-700 rounded-full font-bold text-lg hover:bg-stone-50 dark:hover:bg-stone-700 transition-all flex items-center justify-center gap-2">
                     <Info size={20} /> निमंत्रण द्या
                  </Link>
               </div>

               <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 animate-slide-up" style={{ animationDelay: '600ms' }}>
                  <div className="text-center">
                      <span className="block text-2xl font-bold text-stone-900 dark:text-white">१०+</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest">वर्षे सेवा</span>
                  </div>
                  <div className="w-px h-8 bg-stone-300 dark:bg-stone-700"></div>
                  <div className="text-center">
                      <span className="block text-2xl font-bold text-stone-900 dark:text-white">५००+</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest">कीर्तने</span>
                  </div>
                  <div className="w-px h-8 bg-stone-300 dark:bg-stone-700"></div>
                  <div className="text-center">
                      <span className="block text-2xl font-bold text-stone-900 dark:text-white">{formattedFollowers}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest">भक्त परिवार</span>
                  </div>
               </div>
            </div>

            {/* Visual / Image */}
            <div className="lg:col-span-5 relative hidden lg:block">
                <div className="relative w-full aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl shadow-stone-200 dark:shadow-stone-900/50 border-8 border-white dark:border-stone-800 rotate-3 hover:rotate-0 transition-transform duration-700">
                    <img 
                       src="https://picsum.photos/800/1200" 
                       alt="H.B.P. Kanchan Shelke" 
                       className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-8 left-8 text-white">
                        <p className="font-serif text-2xl font-bold">ह.भ.प. कु. कांचनताई</p>
                        <p className="text-sm opacity-80">युवा कीर्तनकार</p>
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* Professional Daily Suvichar Section */}
      <section className="py-24 px-4 relative overflow-hidden">
          {/* Subtle Ambient Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-50/50 via-transparent to-transparent dark:from-orange-900/10 -z-10 pointer-events-none"></div>

          <div className="max-w-5xl mx-auto">
             {isLoading ? (
                 <SkeletonBlock className="h-96 w-full rounded-[3rem]" />
             ) : (
             <div className="relative bg-[#fffcf5] dark:bg-[#1c1917] rounded-[3rem] p-8 md:p-16 shadow-2xl shadow-stone-200/50 dark:shadow-black/50 border border-stone-100 dark:border-stone-800 text-center overflow-hidden group">
                
                {/* Decorative Corners - Premium Look */}
                <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-orange-200/60 dark:border-stone-700 rounded-tl-[2.5rem]"></div>
                <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-orange-200/60 dark:border-stone-700 rounded-tr-[2.5rem]"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-orange-200/60 dark:border-stone-700 rounded-bl-[2.5rem]"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-orange-200/60 dark:border-stone-700 rounded-br-[2.5rem]"></div>

                {/* Watermark Quote Icon */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none">
                   <Quote size={300} className="text-stone-900 dark:text-white" />
                </div>
                
                {/* Header Badge */}
                <div className="relative z-10 flex flex-col items-center mb-8">
                    <div className="flex items-center gap-3 opacity-80">
                        <div className="h-px w-12 bg-orange-300 dark:bg-stone-600"></div>
                        <span className="text-xs font-bold tracking-[0.25em] uppercase text-orange-600 dark:text-orange-500">आजचा सुविचार</span>
                        <div className="h-px w-12 bg-orange-300 dark:bg-stone-600"></div>
                    </div>
                </div>

                {/* Main Quote */}
                <h2 className="relative z-10 text-3xl md:text-5xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-8 leading-snug max-w-4xl mx-auto drop-shadow-sm">
                   "{dailyAbhang.text}"
                </h2>
                
                {/* Sant Name */}
                <div className="relative z-10 mb-10 flex items-center justify-center gap-3">
                   <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                   <p className="text-lg md:text-xl font-medium text-stone-600 dark:text-stone-400 italic font-serif">
                      {dailyAbhang.sant}
                   </p>
                   <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                </div>

                {/* Meaning Box */}
                <div className="relative z-10 bg-white/60 dark:bg-stone-800/50 backdrop-blur-sm border border-stone-200 dark:border-stone-700 rounded-3xl p-6 md:p-8 max-w-2xl mx-auto hover:bg-white dark:hover:bg-stone-800 transition-colors duration-500">
                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-100 dark:bg-stone-700 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-orange-800 dark:text-stone-300 border border-orange-200 dark:border-stone-600 shadow-sm">
                      भावार्थ
                   </div>
                   <p className="text-stone-700 dark:text-stone-300 text-base md:text-lg leading-relaxed font-medium">
                      {dailyAbhang.meaning}
                   </p>
                </div>

                {/* Footer Actions */}
                <div className="relative z-10 mt-10 flex justify-center items-center gap-4">
                    <button 
                        onClick={handleShare}
                        className="flex items-center gap-2 px-8 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-transform shadow-xl shadow-stone-900/10"
                    >
                        <Share2 size={18} /> शेअर करा
                    </button>
                    <button 
                        onClick={handleCopy}
                        className="p-3 bg-white dark:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white rounded-full border border-stone-200 dark:border-stone-700 hover:border-stone-400 transition-all shadow-sm active:scale-95"
                        title="Copy text"
                    >
                        <Copy size={20} />
                    </button>
                </div>

             </div>
             )}
          </div>
      </section>

      {/* --- TODAY'S LIVE EVENT CARD --- */}
      {todayEvent && (
        <section className="py-8 px-4 relative z-30">
            <div className="max-w-5xl mx-auto animate-slide-up">
                <div className="relative bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-700 dark:to-orange-800 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl shadow-orange-500/30 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-white/20">
                    
                    {/* Live Pulse Animation Background */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-[80px] pointer-events-none"></div>

                    {/* Content */}
                    <div className="relative z-10 text-center md:text-left flex-1">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-white/20 shadow-lg">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                            </span>
                            LIVE • आजचा सोहळा
                        </div>
                        <h3 className="text-3xl md:text-5xl font-serif font-bold leading-tight mb-4 drop-shadow-md">
                            {todayEvent.title}
                        </h3>
                        <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 md:gap-8 text-white/90 font-medium text-lg">
                            <span className="flex items-center gap-2"><MapPin size={20}/> {todayEvent.location}</span>
                            <span className="hidden md:inline text-white/40">|</span>
                            <span className="flex items-center gap-2"><Clock size={20}/> {todayEvent.duration || 'सुरू आहे'}</span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="relative z-10 shrink-0">
                        <button 
                            onClick={() => setSelectedEvent(todayEvent)}
                            className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 hover:bg-stone-50 transition-all flex items-center gap-3"
                        >
                            <Radio size={20} className="animate-pulse"/> सोहळा पहा
                        </button>
                    </div>
                </div>
            </div>
        </section>
      )}

      {/* --- COUNTDOWN TIMER (NEXT EVENT) --- */}
      {nextEvent && timeLeft && !todayEvent && (
      <section className="py-12 px-4 relative z-20">
          <div className="max-w-5xl mx-auto">
              <div className="relative bg-gradient-to-r from-stone-900 to-stone-800 dark:from-white dark:to-stone-200 rounded-[3rem] p-8 md:p-12 text-white dark:text-stone-900 shadow-2xl shadow-stone-500/20 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16 border border-white/20">
                  
                  {/* Decorative Glow */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px] pointer-events-none"></div>
                  
                  {/* Text Info */}
                  <div className="relative z-10 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 dark:bg-black/5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-white/10 dark:border-black/5 animate-pulse">
                          <Timer size={14} /> पुढील सोहळा
                      </div>
                      <h3 className="text-2xl md:text-4xl font-serif font-bold leading-tight mb-2">
                          {nextEvent.title}
                      </h3>
                      <div className="flex items-center justify-center md:justify-start gap-4 text-white/80 dark:text-stone-600/80 font-medium text-sm md:text-base">
                          <span className="flex items-center gap-1"><Calendar size={16}/> {new Date(nextEvent.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          <span className="flex items-center gap-1"><MapPin size={16}/> {nextEvent.location}</span>
                      </div>
                  </div>

                  {/* Timer Grid */}
                  <div className="flex gap-4 md:gap-6 relative z-10">
                      {[
                          { val: timeLeft.days, label: 'दिवस' },
                          { val: timeLeft.hours, label: 'तास' },
                          { val: timeLeft.minutes, label: 'मिनिटे' },
                          { val: timeLeft.seconds, label: 'सेकंद' },
                      ].map((item, i) => (
                          <div key={i} className="flex flex-col items-center">
                              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/10 dark:bg-stone-900/10 backdrop-blur-md border border-white/10 dark:border-black/5 flex items-center justify-center shadow-lg">
                                  <span className="text-2xl md:text-3xl font-bold font-mono tracking-tighter">
                                      {String(item.val).padStart(2, '0')}
                                  </span>
                              </div>
                              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest mt-2 opacity-60">
                                  {item.label}
                              </span>
                          </div>
                      ))}
                  </div>

                  {/* Action */}
                  <div className="relative z-10">
                      <button 
                        onClick={() => setSelectedEvent(nextEvent)}
                        className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white dark:bg-stone-900 text-stone-900 dark:text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
                      >
                          <ArrowRight size={24} />
                      </button>
                  </div>
              </div>
          </div>
      </section>
      )}

      {/* Upcoming Events Preview - PREMIUM REDESIGN */}
      <section className="py-20 px-4 bg-stone-50 dark:bg-stone-900/50">
         <div className="max-w-7xl mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                 <div>
                    <span className="text-orange-600 font-bold tracking-widest uppercase text-sm mb-2 block">कार्यक्रम</span>
                    <h2 className="text-4xl font-serif font-bold text-stone-900 dark:text-white">आगामी सेवा</h2>
                 </div>
                 <Link to="/events" className="text-stone-900 dark:text-white font-bold flex items-center gap-2 hover:text-orange-600 transition-colors">
                    सर्व कार्यक्रम पहा <ChevronRight size={18} />
                 </Link>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {isLoading ? (
                     <>
                        <EventCardSkeleton />
                        <EventCardSkeleton />
                        <EventCardSkeleton />
                     </>
                 ) : (
                    <>
                        {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
                            <div key={event.id} className="group relative bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-stone-100 dark:border-stone-800 flex flex-col h-full hover:-translate-y-1">
                                
                                {/* Top Decorative Bar */}
                                <div className={`h-2 w-full bg-gradient-to-r ${
                                    event.type === 'कीर्तन' ? 'from-orange-500 to-amber-500' : 
                                    event.type === 'प्रवचन' ? 'from-blue-500 to-cyan-500' : 'from-purple-500 to-pink-500'
                                }`}></div>

                                <div className="p-8 flex flex-col h-full relative">
                                    {/* Date Badge */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex flex-col items-center bg-stone-50 dark:bg-stone-800 px-4 py-2 rounded-2xl border border-stone-100 dark:border-stone-700">
                                            <span className="text-xs font-bold text-stone-400 uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="text-2xl font-bold text-stone-900 dark:text-white">{new Date(event.date).getDate()}</span>
                                            <span className="text-xs font-bold text-stone-400">{new Date(event.date).getFullYear()}</span>
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                             event.type === 'कीर्तन' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' : 
                                             event.type === 'प्रवचन' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                                        }`}>
                                            {event.type}
                                        </div>
                                    </div>

                                    {/* Title & Info */}
                                    <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-3 leading-tight line-clamp-2">
                                        {event.title}
                                    </h3>
                                    
                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-start gap-3 text-stone-500 dark:text-stone-400 text-sm">
                                            <MapPin size={18} className="text-orange-500 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="font-medium line-clamp-1">{event.location}</span>
                                                {event.venue && <span className="text-xs block">{event.venue}</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 text-stone-500 dark:text-stone-400 text-sm">
                                            <Clock size={18} className="text-orange-500 mt-0.5 shrink-0" />
                                            <span className="font-medium">वेळ: नियोजित प्रमाणे</span>
                                        </div>
                                    </div>

                                    {/* Footer Button */}
                                    <div className="mt-auto pt-6 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center">
                                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Details</span>
                                        <button 
                                            onClick={() => setSelectedEvent(event)}
                                            className="w-10 h-10 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                                        >
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-3 text-center py-20 bg-white dark:bg-stone-900 rounded-[3rem] border border-dashed border-stone-200 dark:border-stone-800">
                                <Calendar size={48} className="mx-auto text-stone-300 mb-4" />
                                <p className="text-stone-500 text-lg">सध्या कोणतेही आगामी कार्यक्रम प्रकाशित नाहीत.</p>
                            </div>
                        )}
                    </>
                 )}
             </div>
         </div>
      </section>

      {/* Social Highlights */}
      <section className="py-20 px-4">
         <div className="max-w-7xl mx-auto">
             <div className="text-center mb-16">
                 <h2 className="text-4xl font-serif font-bold text-stone-900 dark:text-white mb-4">सोशल मीडिया कनेक्ट</h2>
                 <p className="text-stone-500 dark:text-stone-400">दररोज नवीन अपडेट्ससाठी फॉलो करा.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {/* Quick Social Links - Dynamic & Modern */}
                 <div className="bg-gradient-to-br from-[#FF512F] to-[#DD2476] text-white p-8 rounded-[2.5rem] flex flex-col justify-between shadow-xl shadow-red-500/20 relative overflow-hidden group">
                     {/* Animated Background Elements */}
                     <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                     <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
                     
                     <div className="relative z-10">
                         <div className="flex items-center justify-between mb-6">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/10">
                                <Users size={24} className="text-white" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full border border-white/10">Community</span>
                         </div>
                         
                         <h3 className="text-4xl font-black mb-1 tracking-tight">{formattedFollowers}</h3>
                         <p className="text-white/80 font-medium text-sm">Spiritual Seekers Connected</p>
                     </div>

                     <div className="flex gap-3 mt-8 relative z-10">
                         {PLATFORM_STATS.map((stat, i) => {
                             const link = SOCIAL_LINKS.find(l => l.platform === stat.platform)?.url || '#';
                             return (
                                 <a key={i} href={link} target="_blank" rel="noreferrer" className="flex-1 h-12 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-all border border-white/10 group/icon" title={`${stat.platform}: ${(stat.followers/1000).toFixed(1)}K`}>
                                     {getSocialIcon(stat.platform)}
                                 </a>
                             );
                         })}
                     </div>
                 </div>

                 {isLoading ? (
                     <>
                        <SkeletonBlock className="h-64 rounded-[2.5rem]" />
                        <SkeletonBlock className="h-64 rounded-[2.5rem]" />
                        <SkeletonBlock className="h-64 rounded-[2.5rem]" />
                     </>
                 ) : (
                    <>
                        {socialPosts.map(post => (
                            <a href={post.url} key={post.id} target="_blank" rel="noreferrer" className="group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-stone-200 dark:bg-stone-800">
                                <img src={post.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                                
                                <div className="absolute top-4 left-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${getPlatformColor(post.platform)} text-white`}>
                                        {getSocialIcon(post.platform)}
                                    </div>
                                </div>

                                <div className="absolute bottom-6 left-6 right-6 text-white">
                                    <p className="text-sm font-bold line-clamp-2 leading-tight mb-3">{post.caption}</p>
                                    <div className="flex items-center justify-between text-xs font-medium opacity-80 border-t border-white/20 pt-3">
                                        <span className="flex items-center gap-1"><Heart size={12} className="fill-white" /> {post.likes}</span>
                                        <span>{post.date}</span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </>
                 )}
             </div>
         </div>
      </section>

      {/* --- LATEST BLOGS SECTION (New) --- */}
      <section className="py-24 px-4 bg-[#fffcf5] dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800">
          <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                 <div>
                    <span className="text-orange-600 font-bold tracking-widest uppercase text-sm mb-2 block flex items-center gap-2"><Feather size={14}/> विचारधन</span>
                    <h2 className="text-4xl font-serif font-bold text-stone-900 dark:text-white">नवीनतम लेख</h2>
                 </div>
                 <Link to="/blog" className="text-stone-900 dark:text-white font-bold flex items-center gap-2 hover:text-orange-600 transition-colors">
                    सर्व लेख वाचा <ChevronRight size={18} />
                 </Link>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {isLoading ? (
                     <>
                        <BlogCardSkeleton />
                        <BlogCardSkeleton />
                        <BlogCardSkeleton />
                     </>
                 ) : latestBlogs.length > 0 ? (
                     latestBlogs.map(blog => (
                        <Link to="/blog" key={blog.id} className="group">
                            <div className="rounded-[2.5rem] overflow-hidden bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col hover:-translate-y-1">
                                <div className="h-56 relative overflow-hidden">
                                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">
                                        {blog.category}
                                    </div>
                                </div>
                                <div className="p-8 flex flex-col flex-1">
                                    <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-3 leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">
                                        {blog.title}
                                    </h3>
                                    <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed mb-6 line-clamp-2">
                                        {blog.excerpt}
                                    </p>
                                    <div className="mt-auto pt-6 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest">
                                        <span>{blog.date}</span>
                                        <span className="flex items-center gap-1 group-hover:text-orange-600 transition-colors">वाचा <ArrowRight size={14} /></span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                     ))
                 ) : (
                     <div className="col-span-3 text-center text-stone-500 py-12">लेख उपलब्ध नाहीत.</div>
                 )}
             </div>
          </div>
      </section>

      {/* Modern Premium Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm transition-opacity" onClick={() => setSelectedEvent(null)}></div>
            <div className="bg-[#fffdf9] dark:bg-stone-950 rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative animate-slide-up overflow-hidden">
                
                {/* Decorative Header */}
                <div className="relative h-48 bg-stone-900 overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-r ${
                        selectedEvent.type === 'कीर्तन' ? 'from-orange-600 to-amber-600' :
                        selectedEvent.type === 'प्रवचन' ? 'from-blue-600 to-cyan-600' : 'from-purple-600 to-pink-600'
                    } opacity-90`}></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    
                    <button onClick={() => setSelectedEvent(null)} className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition backdrop-blur-md z-10">
                        <X size={20} />
                    </button>

                    <div className="absolute bottom-8 left-8 right-8 text-white">
                        <div className="flex items-center gap-3 mb-2">
                             <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-wider border border-white/20">
                                {selectedEvent.type}
                             </span>
                             <span className="text-xs font-bold opacity-80 uppercase tracking-widest">निमंत्रण</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold leading-tight">
                            {selectedEvent.title}
                        </h2>
                    </div>
                </div>

                <div className="p-8 md:p-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* Key Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-500 shrink-0">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">शुभ तारीख</p>
                                <p className="text-lg font-bold text-stone-900 dark:text-white">
                                    {new Date(selectedEvent.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-500 shrink-0">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">शुभ ठिकाण</p>
                                <p className="text-lg font-bold text-stone-900 dark:text-white leading-tight">
                                    {selectedEvent.location}
                                </p>
                                {selectedEvent.venue && <p className="text-sm text-stone-500">{selectedEvent.venue}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-stone-50 dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800 mb-8">
                        <h4 className="text-sm font-bold text-stone-900 dark:text-white mb-3 flex items-center gap-2">
                            <Info size={16} className="text-stone-400"/> सविस्तर माहिती
                        </h4>
                        <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                            {selectedEvent.description || 'सविस्तर माहिती लवकरच उपलब्ध होईल. कृपया संपर्कात राहा.'}
                        </p>
                        {/* Organizer Bold Highlight */}
                        {selectedEvent.organizer && (
                            <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                                <p className="text-xs text-stone-400 uppercase font-bold mb-1">आयोजक</p>
                                <p className="text-lg font-black text-stone-800 dark:text-stone-200">{selectedEvent.organizer}</p>
                            </div>
                        )}
                    </div>

                    {/* Google Map Embed (Read Only) */}
                    {selectedEvent.latitude && selectedEvent.longitude && (
                        <div className="mb-8 rounded-2xl overflow-hidden h-48 border border-stone-100 dark:border-stone-800 relative group">
                            <iframe 
                                width="100%" 
                                height="100%" 
                                frameBorder="0" 
                                className="border-0 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" 
                                src={`https://maps.google.com/maps?q=${selectedEvent.latitude},${selectedEvent.longitude}&z=14&output=embed`}
                            ></iframe>
                        </div>
                    )}

                    {/* Organizers & Contact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-stone-100 dark:border-stone-800 pt-8">
                        <div>
                            <h4 className="text-sm font-bold text-stone-900 dark:text-white mb-4 uppercase tracking-wider">संपर्क क्रमांक</h4>
                             {selectedEvent.altContact ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-stone-400">सार्वजनिक संपर्क</p>
                                        <p className="text-lg font-bold text-stone-900 dark:text-white">{selectedEvent.altContact}</p>
                                    </div>
                                </div>
                             ) : (
                                 <p className="text-stone-400 text-sm italic">संपर्क उपलब्ध नाही</p>
                             )}
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-stone-900 dark:text-white mb-4 uppercase tracking-wider">आयोजक / कमिटी</h4>
                            {selectedEvent.committeeMembers && selectedEvent.committeeMembers.length > 0 ? (
                                <ul className="space-y-3">
                                    {selectedEvent.committeeMembers.map((m, i) => (
                                        <li key={i} className="flex items-center justify-between text-sm p-2 bg-stone-50 dark:bg-stone-900 rounded-lg">
                                            <span className="font-bold text-stone-700 dark:text-stone-300">{m.name}</span>
                                            {m.phone && <span className="text-stone-400 text-xs">{m.phone}</span>}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-stone-400 text-sm italic">माहिती नाही</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex gap-4 shrink-0">
                    {selectedEvent.latitude && selectedEvent.longitude ? (
                        <a 
                            href={`https://www.google.com/maps/dir/?api=1&destination=${selectedEvent.latitude},${selectedEvent.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 bg-stone-900 dark:bg-white text-white dark:text-stone-900 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Map size={18} /> दिशा (Directions)
                        </a>
                    ) : (
                        <button className="flex-1 bg-stone-900 dark:bg-white text-white dark:text-stone-900 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                            <Map size={18} /> नकाशा पहा
                        </button>
                    )}
                    <button 
                        onClick={handleShare}
                        className="flex-1 bg-white dark:bg-stone-800 text-stone-900 dark:text-white border border-stone-200 dark:border-stone-700 py-3 rounded-xl font-bold hover:bg-stone-50 dark:hover:bg-stone-700 transition-all flex items-center justify-center gap-2"
                    >
                        <Share2 size={18} /> शेअर करा
                    </button>
                </div>

            </div>
        </div>
      )}

    </div>
  );
};

export default Home;
