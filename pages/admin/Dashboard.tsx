import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MONTHLY_DATA, PLATFORM_STATS } from '../../constants';
import { DEMO_ABHANG } from '../../data/demoData';
import { TrendingUp, Users, Calendar, Activity, Plus, ArrowUpRight, Zap, FileText, ChevronRight, Bell, Share2, Quote, LayoutDashboard, RefreshCw, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../../services/db';
import { Event, Inquiry, Subscriber, Abhang } from '../../types';
import { StatCardSkeleton, SkeletonBlock } from '../../components/Skeletons';

const COLORS = ['#f59e0b', '#fbbf24', '#d97706', '#92400e'];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
      events: 0,
      inquiries: 0,
      subscribers: 0,
      views: 3400
  });
  const [abhang, setAbhang] = useState<Abhang>(DEMO_ABHANG);
  const [eventDistribution, setEventDistribution] = useState<{name: string, value: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      loadData();
  }, []);

  const loadData = async () => {
      setLoading(true);
      try {
          const events: Event[] = await db.getAll('events');
          const inquiries: Inquiry[] = await db.getAll('inquiries');
          const subscribers: Subscriber[] = await db.getAll('subscribers');
          const settings = await db.getAll('settings');

          const upcomingEvents = events.filter(e => e.status === 'Upcoming').length;
          const pendingInquiries = inquiries.filter(i => i.status === 'Pending').length;
          
          setStats({
              events: upcomingEvents,
              inquiries: pendingInquiries,
              subscribers: subscribers.length,
              views: 3400 + Math.floor(Math.random() * 100)
          });

          const loadedAbhang = settings.find((s: any) => s.id === 'daily_abhang');
          if (loadedAbhang) setAbhang(loadedAbhang.value);

          const dist = [
              { name: 'कीर्तन', value: events.filter(e => e.type === 'कीर्तन').length },
              { name: 'प्रवचन', value: events.filter(e => e.type === 'प्रवचन').length },
              { name: 'सप्ताह', value: events.filter(e => e.type === 'सप्ताह').length },
              { name: 'इतर', value: events.filter(e => !['कीर्तन', 'प्रवचन', 'सप्ताह'].includes(e.type)).length },
          ];
          setEventDistribution(dist);

      } catch (e) {
          console.error("Dashboard Load Error", e);
      } finally {
          setLoading(false);
      }
  };

  const dashboardStats = [
      { name: 'नियोजित कार्यक्रम', value: stats.events, change: 'Upcoming', icon: Calendar, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
      { name: 'सेवा विनंत्या', value: stats.inquiries, change: 'Pending', icon: Activity, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
      { name: 'वेबसाईट भेटी', value: stats.views, change: '+18%', icon: TrendingUp, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
      { name: 'भक्ती परिवार', value: stats.subscribers, change: 'Total', icon: Users, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-100 dark:border-stone-800">
         <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-[11px] font-bold uppercase tracking-widest border border-orange-100 dark:border-orange-800 shadow-sm">
                <LayoutDashboard size={12} className="text-amber-600" /> नियंत्रण कक्ष
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white leading-tight flex items-center gap-2">
               नियंत्रण <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-amber-600">कक्ष</span>
               {loading && <RefreshCw size={24} className="animate-spin text-stone-400" />}
            </h1>
            <p className="text-sm md:text-base text-stone-500 dark:text-stone-400 font-medium leading-relaxed max-w-xl">
               वेबसाईटच्या दैनंदिन कामकाजाचा थोडक्यात आढावा. नवीन विनंत्या, आगामी कार्यक्रमांचे नियोजन, आणि सोशल मीडियावरील प्रतिसादाची आकडेवारी पहा.
            </p>
         </div>
         <div className="flex items-center gap-4 shrink-0">
             <button className="relative p-3 bg-white dark:bg-stone-900 rounded-full border border-stone-200 dark:border-stone-700 text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 transition shadow-sm">
                <Bell size={20} />
                {stats.inquiries > 0 && <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-stone-900"></span>}
             </button>
            <Link to="/admin/calendar" className="hidden md:flex items-center gap-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-6 py-3 rounded-full font-bold shadow-lg shadow-stone-900/10 hover:shadow-xl transition-all">
               <Plus size={18} /> नवीन कार्यक्रम
            </Link>
         </div>
      </div>

      {/* Daily Spiritual Thought Card */}
      {loading ? (
          <SkeletonBlock className="h-32 w-full rounded-2xl" />
      ) : (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-stone-900 border border-orange-100 dark:border-stone-800 rounded-2xl p-6 relative overflow-hidden group">
            <Quote className="absolute top-4 right-4 text-orange-200 dark:text-orange-900/40 transition-transform group-hover:scale-110" size={48} />
            
            {/* Edit Button */}
            <Link to="/admin/cms" className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-stone-800/80 rounded-full shadow-sm hover:bg-white dark:hover:bg-stone-700 text-stone-400 hover:text-orange-600 transition-all opacity-0 group-hover:opacity-100 z-10">
                <Edit size={16} />
            </Link>

            <p className="text-xs font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400 mb-2">आजचा सुविचार</p>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-800 dark:text-white mb-2">"{abhang.text.split('\n')[0]}..."</h2>
            <p className="text-stone-500 dark:text-stone-400 italic text-sm">- {abhang.sant}</p>
        </div>
      )}

      {/* Quick Actions Bento */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
         <Link to="/admin/calendar" className="col-span-1 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-4 flex flex-col items-center justify-center aspect-square shadow-sm hover:shadow-md hover:border-primary-200 transition-all group">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Calendar size={20} />
            </div>
            <span className="text-xs font-bold text-stone-600 dark:text-stone-300">नियोजन</span>
         </Link>
         <Link to="/admin/blog-manager" className="col-span-1 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-4 flex flex-col items-center justify-center aspect-square shadow-sm hover:shadow-md hover:border-primary-200 transition-all group">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText size={20} />
            </div>
            <span className="text-xs font-bold text-stone-600 dark:text-stone-300">लेखन</span>
         </Link>
         <Link to="/admin/inquiries" className="col-span-1 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-4 flex flex-col items-center justify-center aspect-square shadow-sm hover:shadow-md hover:border-primary-200 transition-all group">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Zap size={20} />
            </div>
            <span className="text-xs font-bold text-stone-600 dark:text-stone-300">विनंत्या</span>
         </Link>
         
         <Link to="/admin/social" className="hidden md:flex col-span-3 bg-gradient-to-br from-primary-500 to-orange-500 rounded-2xl p-6 items-center justify-between text-white shadow-lg shadow-orange-500/20 relative overflow-hidden group">
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                    <Share2 size={18} className="opacity-80"/> <span className="text-xs font-bold uppercase tracking-wider opacity-80">Online Reach</span>
                </div>
                <h3 className="font-bold text-2xl">{(PLATFORM_STATS.reduce((acc, curr) => acc + curr.reach, 0) / 1000).toFixed(1)}K</h3>
                <p className="text-white/80 text-sm">भक्ती प्रसार (एकूण दर्शक)</p>
             </div>
             <div className="absolute right-0 bottom-0 top-0 w-32 bg-white/10 skew-x-12 transform translate-x-10 group-hover:translate-x-5 transition-transform"></div>
         </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loading ? (
            <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
            </>
        ) : (
            dashboardStats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                    <stat.icon size={22} />
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-lg">
                    <ArrowUpRight size={12} /> {stat.change}
                    </div>
                </div>
                
                <div>
                    <p className="text-3xl font-bold text-stone-900 dark:text-white mb-1">{stat.value}</p>
                    <h3 className="text-stone-500 dark:text-stone-400 text-xs font-bold uppercase tracking-widest">{stat.name}</h3>
                </div>
            </div>
            ))
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-stone-900 dark:text-white">मासिक प्रगती</h3>
            <button className="text-sm font-bold bg-stone-50 dark:bg-stone-800 px-3 py-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition">
               या वर्षी <ChevronRight size={14} className="inline" />
            </button>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={15} fontSize={12} stroke="#a8a29e" />
                <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#a8a29e" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e7e5e4', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Area type="monotone" dataKey="events" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorEvents)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart - DYNAMIC */}
        <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 flex flex-col">
          <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-6">कार्यक्रम विभागणी</h3>
          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={6}
                >
                  {eventDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-stone-800 dark:text-stone-200">
                    {eventDistribution.reduce((acc, curr) => acc + curr.value, 0)}
                </span>
                <span className="text-[10px] text-stone-400 uppercase font-bold">एकूण</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
              {eventDistribution.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs font-bold text-stone-500 dark:text-stone-400">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                      {item.name} ({item.value})
                  </div>
              ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;