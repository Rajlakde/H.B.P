
import React, { useState, useEffect } from 'react';
import { Event } from '../../types';
import { db } from '../../services/db';
import { Calendar, MapPin, Clock, ArrowRight, Search, Filter, X, Phone, Info, Map as MapIcon, Share2, RefreshCw, Grid, List, ChevronLeft, ChevronRight, CalendarCheck } from 'lucide-react';
import { EventCardSkeleton } from '../../components/Skeletons';
import { useToast } from '../../context/ToastContext';

const Events: React.FC = () => {
  const { success } = useToast();
  // Data State
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI State
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // List View State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calendar View State
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  const types = ['All', 'कीर्तन', 'प्रवचन', 'सप्ताह', 'इतर'];

  useEffect(() => {
    loadEvents();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType]);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await db.getAll('events');
      // Only show published events and sort by date ascending (closest first)
      const published = data
        .filter((e: Event) => e.isPublished)
        .sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setEvents(published);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // --- List View Logic ---
  const getFilteredEvents = () => {
    let result = events;

    // Filter by Future Dates (default behavior for list)
    const today = new Date();
    today.setHours(0,0,0,0);
    result = result.filter(e => new Date(e.date) >= today);

    // Filter by Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(e => 
        e.title.toLowerCase().includes(lower) || 
        e.location.toLowerCase().includes(lower) ||
        (e.venue && e.venue.toLowerCase().includes(lower))
      );
    }

    // Filter by Type
    if (selectedType !== 'All') {
      result = result.filter(e => e.type === selectedType);
    }

    return result;
  };

  const filteredList = getFilteredEvents();
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedEvents = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- Calendar View Logic ---
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const prevMonth = () => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1));
  
  const formatDateKey = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  const calendarEvents = selectedDateFilter 
      ? events.filter(e => e.date === selectedDateFilter)
      : events.filter(e => {
          const d = new Date(e.date);
          return d.getMonth() === currentCalendarDate.getMonth() && d.getFullYear() === currentCalendarDate.getFullYear();
      });

  const handleShare = () => {
      if (navigator.share && selectedEvent) {
          navigator.share({
              title: selectedEvent.title,
              text: `Join us for ${selectedEvent.title} at ${selectedEvent.location}`,
              url: window.location.href
          });
      } else {
          success("Link Copied", "Event link copied to clipboard.");
      }
  };

  const getTypeColor = (type: string) => {
      switch (type) {
          case 'कीर्तन': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
          case 'प्रवचन': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
          case 'सप्ताह': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
          default: return 'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700';
      }
  };

  return (
    <div className="bg-[#fcfbf9] dark:bg-stone-950 min-h-screen py-24 md:py-32 px-4 md:px-6 transition-colors duration-500 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-[11px] font-bold uppercase tracking-widest mb-6 border border-orange-100 dark:border-orange-800 shadow-sm">
              <Calendar size={14} className="text-amber-600" /> कार्यक्रम सूची
           </div>
           <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-stone-900 dark:text-white mb-6 leading-tight">
             आगामी <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-amber-600">सोहळे</span>
           </h1>
           <p className="text-lg text-stone-500 dark:text-stone-400 font-medium max-w-2xl mx-auto">
             कीर्तन, प्रवचन आणि विविध धार्मिक कार्यक्रमांचे संपूर्ण वेळापत्रक.
           </p>
        </div>

        {/* Toolbar & Controls */}
        <div className="bg-white dark:bg-stone-900 p-4 rounded-[2rem] shadow-xl shadow-stone-200/50 dark:shadow-none border border-stone-100 dark:border-stone-800 mb-12 flex flex-col lg:flex-row gap-4 animate-slide-up sticky top-24 z-30">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20}/>
                <input 
                    type="text" 
                    placeholder="शोध (Search event, city...)" 
                    className="w-full pl-12 pr-4 py-3 bg-stone-50 dark:bg-stone-800 rounded-xl outline-none font-bold text-stone-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all placeholder-stone-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="flex gap-2 items-center overflow-x-auto custom-scrollbar">
                {/* Type Filter */}
                <select 
                    className="px-4 py-3 bg-stone-50 dark:bg-stone-800 rounded-xl font-bold text-stone-600 dark:text-stone-300 outline-none cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-700 appearance-none border-r-[16px] border-transparent"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                >
                    {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                <div className="w-px h-8 bg-stone-200 dark:bg-stone-700 mx-2"></div>

                {/* View Toggle */}
                <div className="flex bg-stone-50 dark:bg-stone-800 p-1 rounded-xl">
                    <button 
                        onClick={() => { setViewMode('list'); setSelectedDateFilter(null); }}
                        className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-stone-700 text-primary-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        <List size={20} />
                    </button>
                    <button 
                        onClick={() => setViewMode('calendar')}
                        className={`p-2.5 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-stone-700 text-primary-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        <Grid size={20} />
                    </button>
                </div>
            </div>
        </div>

        {/* --- CONTENT AREA --- */}
        
        {viewMode === 'list' ? (
            /* LIST VIEW */
            <div className="space-y-8 animate-slide-up">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoading ? (
                        <>
                            <EventCardSkeleton />
                            <EventCardSkeleton />
                            <EventCardSkeleton />
                        </>
                    ) : paginatedEvents.length > 0 ? (
                        paginatedEvents.map(event => (
                            <div key={event.id} className="group flex flex-col h-full bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-stone-100 dark:border-stone-800 hover:-translate-y-2 relative">
                                {/* Date Badge Floating */}
                                <div className="absolute top-6 right-6 bg-white/90 dark:bg-stone-800/90 backdrop-blur-md p-3 rounded-2xl text-center shadow-lg border border-stone-100 dark:border-stone-700 z-10 min-w-[70px]">
                                    <span className="block text-xs font-bold text-stone-400 uppercase tracking-wider">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="block text-2xl font-black text-stone-900 dark:text-white">{new Date(event.date).getDate()}</span>
                                </div>

                                <div className={`h-32 w-full bg-gradient-to-br ${
                                    event.type === 'कीर्तन' ? 'from-orange-400 to-amber-600' : 
                                    event.type === 'प्रवचन' ? 'from-blue-400 to-cyan-600' : 'from-purple-400 to-pink-600'
                                } relative overflow-hidden`}>
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                                    <div className="absolute bottom-4 left-6">
                                        <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/20">
                                            {event.type}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8 flex flex-col h-full pt-6">
                                    <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white mb-4 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors min-h-[3.5rem]">
                                        {event.title}
                                    </h3>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-start gap-3 text-stone-500 dark:text-stone-400 text-sm">
                                            <MapPin size={18} className="text-stone-300 dark:text-stone-600 mt-0.5 shrink-0 group-hover:text-orange-500 transition-colors" />
                                            <div>
                                                <span className="font-bold block text-stone-700 dark:text-stone-300">{event.location}</span>
                                                {event.venue && <span className="text-xs">{event.venue}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => setSelectedEvent(event)}
                                        className="mt-auto w-full py-3.5 rounded-xl bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-bold text-sm hover:bg-stone-900 hover:text-white dark:hover:bg-white dark:hover:text-stone-900 transition-all flex items-center justify-center gap-2 group/btn"
                                    >
                                        सविस्तर माहिती <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform"/>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-1 md:col-span-3 text-center py-20 bg-stone-50 dark:bg-stone-900 rounded-[3rem] border border-dashed border-stone-200 dark:border-stone-800">
                            <Filter size={48} className="mx-auto text-stone-300 mb-4" />
                            <p className="text-stone-500 text-lg font-medium">कोणतेही कार्यक्रम सापडले नाहीत.</p>
                            <button onClick={() => { setSearchTerm(''); setSelectedType('All'); }} className="mt-4 text-primary-600 font-bold hover:underline">
                                सर्व फिल्टर्स काढा
                            </button>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 pt-8">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 disabled:opacity-50 hover:bg-stone-50 dark:hover:bg-stone-800 transition shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-bold text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900 px-6 py-3 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 disabled:opacity-50 hover:bg-stone-50 dark:hover:bg-stone-800 transition shadow-sm"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        ) : (
            /* CALENDAR VIEW */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-slide-up">
                {/* Calendar Widget */}
                <div className="lg:col-span-5 xl:col-span-4">
                    <div className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-stone-100 dark:border-stone-800">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white capitalize">
                                {currentCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </h3>
                            <div className="flex gap-2">
                                <button onClick={prevMonth} className="p-2 bg-stone-50 dark:bg-stone-800 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 transition"><ChevronLeft size={20} /></button>
                                <button onClick={nextMonth} className="p-2 bg-stone-50 dark:bg-stone-800 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 transition"><ChevronRight size={20} /></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <span key={d} className="text-xs font-bold text-stone-400 uppercase">{d}</span>)}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: getFirstDayOfMonth(currentCalendarDate) }).map((_, i) => <div key={`empty-${i}`} />)}
                            {Array.from({ length: getDaysInMonth(currentCalendarDate) }).map((_, i) => {
                                const day = i + 1;
                                const date = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), day);
                                const dateStr = formatDateKey(date);
                                const dayEvents = events.filter(e => e.date === dateStr);
                                const hasEvent = dayEvents.length > 0;
                                const isSelected = selectedDateFilter === dateStr;
                                const isToday = dateStr === formatDateKey(new Date());

                                return (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDateFilter(isSelected ? null : dateStr)}
                                        className={`
                                            aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all relative
                                            ${isSelected 
                                                ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-lg scale-105 z-10' 
                                                : hasEvent
                                                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-800' 
                                                    : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                                            }
                                            ${isToday && !isSelected ? 'ring-2 ring-primary-500' : ''}
                                        `}
                                    >
                                        {day}
                                        {hasEvent && !isSelected && (
                                            <div className="flex gap-0.5 mt-1">
                                                {dayEvents.slice(0, 3).map((_, idx) => (
                                                    <span key={idx} className="w-1 h-1 rounded-full bg-orange-500"></span>
                                                ))}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Events for Selected Date / Month */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-stone-900 dark:text-white text-lg">
                            {selectedDateFilter 
                                ? `${new Date(selectedDateFilter).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} चे कार्यक्रम`
                                : `${currentCalendarDate.toLocaleString('default', { month: 'long' })} महिन्यातील कार्यक्रम`
                            }
                        </h4>
                        {selectedDateFilter && (
                            <button onClick={() => setSelectedDateFilter(null)} className="text-xs font-bold text-primary-600 hover:underline">
                                सर्व पहा
                            </button>
                        )}
                    </div>

                    {calendarEvents.length > 0 ? (
                        calendarEvents.map(event => (
                            <div key={event.id} onClick={() => setSelectedEvent(event)} className="bg-white dark:bg-stone-900 p-5 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 flex items-center gap-6 hover:shadow-lg transition-all cursor-pointer group">
                                <div className="hidden md:flex flex-col items-center bg-stone-50 dark:bg-stone-800 px-4 py-2 rounded-xl border border-stone-100 dark:border-stone-700 shrink-0">
                                    <span className="text-xs font-bold text-stone-400 uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="text-xl font-black text-stone-900 dark:text-white">{new Date(event.date).getDate()}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getTypeColor(event.type)}`}>
                                            {event.type}
                                        </span>
                                        <span className="text-xs text-stone-400 font-medium md:hidden">{new Date(event.date).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-stone-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-1">{event.title}</h4>
                                    <p className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-1">
                                        <MapPin size={14}/> {event.location}
                                    </p>
                                </div>
                                <div className="p-2 bg-stone-50 dark:bg-stone-800 rounded-full text-stone-400 group-hover:text-primary-600 transition-colors">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 bg-stone-50 dark:bg-stone-900 rounded-[2.5rem] border border-dashed border-stone-200 dark:border-stone-700">
                            <CalendarCheck size={40} className="mx-auto text-stone-300 mb-4" />
                            <p className="text-stone-500">या कालावधीत कोणताही कार्यक्रम नाही.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

      </div>

      {/* Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm transition-opacity" onClick={() => setSelectedEvent(null)}></div>
            <div className="bg-[#fffdf9] dark:bg-stone-950 rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative animate-slide-up overflow-hidden max-h-[90vh] flex flex-col">
                
                {/* Header */}
                <div className="relative h-40 bg-stone-900 shrink-0">
                    <div className={`absolute inset-0 bg-gradient-to-r ${
                        selectedEvent.type === 'कीर्तन' ? 'from-orange-600 to-amber-600' :
                        selectedEvent.type === 'प्रवचन' ? 'from-blue-600 to-cyan-600' : 'from-purple-600 to-pink-600'
                    } opacity-90`}></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    
                    <button onClick={() => setSelectedEvent(null)} className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition backdrop-blur-md z-10">
                        <X size={20} />
                    </button>

                    <div className="absolute bottom-6 left-8 right-8 text-white">
                        <div className="flex items-center gap-3 mb-2">
                             <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-wider border border-white/20">
                                {selectedEvent.type}
                             </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-serif font-bold leading-tight line-clamp-2">
                            {selectedEvent.title}
                        </h2>
                    </div>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar">
                    {/* Key Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="flex items-start gap-4 p-4 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800">
                            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 shrink-0">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">शुभ तारीख</p>
                                <p className="text-base font-bold text-stone-900 dark:text-white">
                                    {new Date(selectedEvent.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">शुभ ठिकाण</p>
                                <p className="text-base font-bold text-stone-900 dark:text-white leading-tight">
                                    {selectedEvent.location}
                                </p>
                                {selectedEvent.venue && <p className="text-xs text-stone-500 mt-1 font-medium">{selectedEvent.venue}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                        <h4 className="text-sm font-bold text-stone-900 dark:text-white mb-3 flex items-center gap-2">
                            <Info size={16} className="text-stone-400"/> सविस्तर माहिती
                        </h4>
                        <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-sm md:text-base">
                            {selectedEvent.description || 'सविस्तर माहिती लवकरच उपलब्ध होईल. कृपया संपर्कात राहा.'}
                        </p>
                    </div>

                    {/* Map */}
                    {selectedEvent.latitude && selectedEvent.longitude && (
                        <div className="mb-8 rounded-2xl overflow-hidden h-40 border border-stone-100 dark:border-stone-800 relative group">
                            <iframe 
                                width="100%" 
                                height="100%" 
                                frameBorder="0" 
                                className="border-0 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" 
                                src={`https://maps.google.com/maps?q=${selectedEvent.latitude},${selectedEvent.longitude}&z=14&output=embed`}
                            ></iframe>
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <span className="bg-white/90 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md">Click Directions Below</span>
                            </div>
                        </div>
                    )}

                    {/* Organizer & Contact */}
                    {selectedEvent.organizer && (
                        <div className="border-t border-stone-100 dark:border-stone-800 pt-6">
                            <p className="text-xs text-stone-400 uppercase font-bold mb-2">आयोजक</p>
                            <p className="text-base font-bold text-stone-800 dark:text-stone-200">{selectedEvent.organizer}</p>
                            {selectedEvent.altContact && (
                                <p className="text-sm text-stone-500 mt-1 flex items-center gap-2"><Phone size={14}/> {selectedEvent.altContact}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex gap-4 shrink-0">
                    {selectedEvent.latitude && selectedEvent.longitude ? (
                        <a 
                            href={`https://www.google.com/maps/dir/?api=1&destination=${selectedEvent.latitude},${selectedEvent.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 bg-stone-900 dark:bg-white text-white dark:text-stone-900 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <MapIcon size={18} /> दिशा (Directions)
                        </a>
                    ) : (
                        <button className="flex-1 bg-stone-900 dark:bg-white text-white dark:text-stone-900 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm">
                            <MapIcon size={18} /> नकाशा (Map N/A)
                        </button>
                    )}
                    <button 
                        onClick={handleShare}
                        className="flex-1 bg-white dark:bg-stone-800 text-stone-900 dark:text-white border border-stone-200 dark:border-stone-700 py-3 rounded-xl font-bold hover:bg-stone-50 dark:hover:bg-stone-700 transition-all flex items-center justify-center gap-2 text-sm"
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

export default Events;
