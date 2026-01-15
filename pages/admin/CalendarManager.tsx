
import React, { useState, useEffect } from 'react';
import { Event } from '../../types';
import { ChevronLeft, ChevronRight, Plus, MapPin, Calendar as CalendarIcon, Trash2, Edit2, X, Clock, Sparkles, Save, RefreshCw, Filter, CalendarCheck, MoreVertical, Globe, EyeOff, Phone, Timer, List, RotateCcw, Navigation, Building2, MapPinned, AlertCircle, CheckCircle } from 'lucide-react';
import { db } from '../../services/db';
import { useToast } from '../../context/ToastContext';

// Admin Base Location (Alandi)
const ADMIN_LAT = 18.6769;
const ADMIN_LNG = 73.8967;

const CalendarManager: React.FC = () => {
  const { success, error, info } = useToast();
  // Data State
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // View State
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'all' | 'date'>('all');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State - Initialize with all fields
  const initialFormState: Partial<Event> = {
    title: '',
    date: '',
    location: '',
    taluka: '',
    district: '',
    venue: '',
    type: 'कीर्तन',
    status: 'Upcoming',
    description: '',
    isPublished: false,
    altContact: '',
    duration: '2 तास',
    latitude: 0,
    longitude: 0
  };
  const [formData, setFormData] = useState<Partial<Event>>(initialFormState);

  // --- Initialization ---
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
      setIsLoading(true);
      try {
        const data = await db.getAll('events');
        setEvents(data);
      } catch (err) {
        console.error("Failed to load events", err);
        error("डेटा लोड त्रुटी", "इव्हेंट्स लोड करताना समस्या आली.");
      } finally {
        setIsLoading(false);
      }
  };

  const handleSaveData = async (updatedEvents: Event[]) => {
      // Optimistic Update
      setEvents(updatedEvents); 
      try {
        await db.save('events', updatedEvents);
      } catch (err) {
        error("सेव्ह त्रुटी", "बदल सेव्ह करताना त्रुटी आली.");
        loadEvents(); // Revert on failure
      }
  };

  // --- Calculations ---
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
      const R = 6371; 
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      return Math.round(R * c); 
  };

  // --- Calendar Logic ---
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  
  const prevMonth = () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  
  const formatDateKey = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  const handleDateClick = (date: Date) => {
      setSelectedDate(date);
      setViewMode('date');
      setCurrentPage(1);
  };

  const handleResetView = () => {
      setViewMode('all');
      setCurrentPage(1);
  };

  const getDaysRemaining = (dateString: string) => {
      const eventDate = new Date(dateString);
      eventDate.setHours(0,0,0,0);
      const today = new Date();
      today.setHours(0,0,0,0);
      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'झालेला';
      if (diffDays === 0) return 'आज';
      return `${diffDays} दिवस बाकी`;
  };

  // --- Sorting & Filtering Logic ---
  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const displayedList = viewMode === 'date' 
      ? sortedEvents.filter(e => e.date === formatDateKey(selectedDate))
      : sortedEvents;

  // Pagination Logic
  const totalPages = Math.ceil(displayedList.length / itemsPerPage);
  const paginatedEvents = displayedList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setCurrentPage(newPage);
      }
  };

  // --- CRUD Operations ---

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) {
        error("माहिती अपूर्ण", "कृपया कार्यक्रमाचे नाव आणि तारीख भरा.");
        return;
    }
    
    setIsSaving(true);

    const cleanData = {
        ...formData,
        location: formData.location || '',
        taluka: formData.taluka || '',
        district: formData.district || '',
        venue: formData.venue || '',
        description: formData.description || '',
        altContact: formData.altContact || '',
    };

    let updatedList;
    if (editingId) {
      updatedList = events.map(ev => ev.id === editingId ? { ...ev, ...cleanData } as Event : ev);
      success("Event Updated", `"${cleanData.title}" updated successfully.`);
    } else {
      const newEvent: Event = {
        id: Date.now().toString(),
        title: cleanData.title || 'Untitled',
        date: cleanData.date || new Date().toISOString().split('T')[0],
        location: cleanData.location || '',
        taluka: cleanData.taluka || '',
        district: cleanData.district || '',
        venue: cleanData.venue || '',
        type: cleanData.type || 'कीर्तन',
        status: cleanData.status || 'Upcoming',
        description: cleanData.description || '',
        isPublished: cleanData.isPublished || false,
        altContact: cleanData.altContact || '',
        duration: cleanData.duration || '2 तास',
        latitude: cleanData.latitude,
        longitude: cleanData.longitude
      };
      updatedList = [...events, newEvent];
      success("New Event", `"${cleanData.title}" added to calendar.`);
    }
    
    await handleSaveData(updatedList);
    setIsSaving(false);
    closeModal();
  };

  const togglePublish = async (event: Event) => {
      const newState = !event.isPublished;
      // No confirm needed for toggle, just toast
      const updatedList = events.map(e => e.id === event.id ? { ...e, isPublished: newState } : e);
      await handleSaveData(updatedList);
      if (newState) success("Published", "Event is now live on website.");
      else info("Unpublished", "Event hidden from website.");
  };

  const deleteEvent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event? This cannot be undone.')) {
      const updatedList = events.filter(e => e.id !== id);
      await handleSaveData(updatedList);
      info("Deleted", "Event removed from calendar.");
    }
  };

  const openAddModal = () => {
    setEditingId(null); // Clear editing ID
    setFormData({ 
      ...initialFormState,
      date: formatDateKey(selectedDate),
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (event: Event) => {
    setEditingId(event.id);
    setFormData({ ...initialFormState, ...event }); // Merge to ensure no undefineds
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  // --- UI Constants ---
  const daysInMonth = getDaysInMonth(currentMonthDate);
  const firstDayOffset = getFirstDayOfMonth(currentMonthDate);
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getTypeColor = (type: string) => {
      switch (type) {
          case 'कीर्तन': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
          case 'प्रवचन': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
          case 'सप्ताह': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
          default: return 'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700';
      }
  };

  return (
    <div className="max-w-7xl mx-auto animate-slide-up pb-20">
      
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 px-2">
         <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white leading-tight">
               कार्यक्रम <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-amber-600">व्यवस्थापन</span>
               {isLoading && <RefreshCw size={20} className="animate-spin text-stone-400 ml-2 inline" />}
            </h1>
            <p className="text-sm md:text-base text-stone-500 dark:text-stone-400 font-medium leading-relaxed max-w-xl">
               नवीन कार्यक्रम जोडा, वेळापत्रक अद्ययावत करा आणि संपूर्ण महिन्याचे नियोजन एका दृष्टीक्षेपात पहा.
            </p>
         </div>
         <button 
            onClick={openAddModal}
            className="w-full md:w-auto bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-6 py-3 rounded-2xl font-bold shadow-lg shadow-stone-900/20 hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            <Plus size={20} /> कार्यक्रम जोडा
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* LEFT COLUMN: Calendar Widget */}
        <div className="lg:col-span-5 order-1">
            <div className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-stone-200/50 dark:shadow-none border border-stone-100 dark:border-stone-800 relative overflow-hidden group hover:border-primary-200 dark:hover:border-primary-900/50 transition-colors duration-500">
               
               {/* Calendar Header */}
               <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-stone-400 block mb-1">निवड महिना</span>
                    <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white capitalize">{monthName}</h3>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={prevMonth} className="p-2 bg-stone-50 dark:bg-stone-800 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 transition"><ChevronLeft size={20} className="text-stone-600 dark:text-stone-300" /></button>
                     <button onClick={nextMonth} className="p-2 bg-stone-50 dark:bg-stone-800 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 transition"><ChevronRight size={20} className="text-stone-600 dark:text-stone-300" /></button>
                  </div>
               </div>

               {/* Week Days */}
               <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-[10px] md:text-xs font-bold text-stone-400 mb-4 uppercase tracking-wider">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
               </div>
               
               {/* Days Grid */}
               <div className="grid grid-cols-7 gap-1 md:gap-2">
                 {Array.from({ length: firstDayOffset }).map((_, i) => (
                   <div key={`empty-${i}`} className="aspect-square" />
                 ))}

                 {Array.from({ length: daysInMonth }).map((_, i) => {
                   const day = i + 1;
                   const currentDateObj = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), day);
                   // Highlight selected if we are in 'date' mode AND it matches
                   const isSelected = viewMode === 'date' && formatDateKey(currentDateObj) === formatDateKey(selectedDate);
                   const isToday = formatDateKey(currentDateObj) === formatDateKey(new Date());
                   const key = formatDateKey(currentDateObj);
                   const dayEvents = events.filter(e => e.date === key);
                   
                   return (
                     <button 
                      key={day} 
                      onClick={() => handleDateClick(currentDateObj)}
                      className={`
                        aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-bold transition-all relative group
                        ${isSelected 
                            ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-lg scale-105 z-10' 
                            : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 border border-stone-100 dark:border-stone-800'}
                        ${isToday && !isSelected ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-stone-900' : ''}
                      `}
                     >
                       {day}
                       <div className="flex gap-0.5 mt-1">
                          {dayEvents.slice(0, 3).map((ev, idx) => (
                             <div key={idx} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/50 dark:bg-black/50' : ev.isPublished ? 'bg-green-500' : 'bg-stone-300'}`}></div>
                          ))}
                       </div>
                     </button>
                   )
                 })}
               </div>
            </div>
        </div>

        {/* RIGHT COLUMN: Event List */}
        <div className="lg:col-span-7 order-2 space-y-6">
            
            {/* List Header & Controls */}
            <div className="flex items-center justify-between bg-white dark:bg-stone-900 p-4 rounded-[2rem] border border-stone-100 dark:border-stone-800 shadow-sm">
                <div className="flex items-center gap-3 pl-2">
                    <div className={`p-2 rounded-full ${viewMode === 'all' ? 'bg-stone-100 dark:bg-stone-800 text-stone-600' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'}`}>
                        {viewMode === 'all' ? <List size={20} /> : <CalendarIcon size={20} />}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-stone-900 dark:text-white leading-none">
                            {viewMode === 'all' ? 'सर्व कार्यक्रम' : 'निवडक तारीख'}
                        </h2>
                        <p className="text-xs text-stone-500 font-medium mt-1">
                            {viewMode === 'date' 
                                ? `${selectedDate.getDate()} ${selectedDate.toLocaleString('default', { month: 'long' })}` 
                                : 'नवीनतम प्रथम (Newest First)'}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {viewMode === 'date' && (
                        <button onClick={handleResetView} className="px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center gap-2">
                            <RotateCcw size={14} /> सर्व पहा
                        </button>
                    )}
                    <span className="text-xs font-bold bg-stone-50 dark:bg-stone-800 px-3 py-1.5 rounded-lg text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
                        {displayedList.length}
                    </span>
                </div>
            </div>

            {/* Events List */}
            <div className="space-y-4">
                {paginatedEvents.length > 0 ? (
                    paginatedEvents.map(event => {
                        const dist = event.latitude && event.longitude && event.latitude !== 0 ? calculateDistance(ADMIN_LAT, ADMIN_LNG, event.latitude, event.longitude) : 0;
                        return (
                        <div key={event.id} className={`group bg-white dark:bg-stone-900 p-6 rounded-[2.5rem] border ${event.isPublished ? 'border-stone-100 dark:border-stone-800' : 'border-stone-300 dark:border-stone-600 border-dashed'} shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row gap-6 relative overflow-hidden hover:-translate-y-1`}>
                            {/* Decorative Stripe */}
                            <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                                event.type === 'कीर्तन' ? 'bg-orange-500' : 
                                event.type === 'प्रवचन' ? 'bg-blue-500' : 'bg-purple-500'
                            }`}></div>

                            <div className="flex-1 pl-2">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-lg border ${getTypeColor(event.type)}`}>
                                        {event.type}
                                    </span>
                                    <span className="text-xs font-bold text-stone-400 flex items-center gap-1">
                                        <CalendarIcon size={12}/> {new Date(event.date).toLocaleDateString('en-GB')}
                                    </span>
                                    {dist > 0 && (
                                        <span className="text-xs font-bold text-blue-500 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                                            <Navigation size={10}/> {dist} km
                                        </span>
                                    )}
                                    <span className="ml-auto text-xs font-bold text-stone-400 flex items-center gap-1">
                                        <Timer size={12}/> {getDaysRemaining(event.date)}
                                    </span>
                                </div>
                                <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white mb-2 leading-tight">{event.title}</h3>
                                <div className="flex flex-col gap-1.5">
                                    <p className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-2 font-medium">
                                        <MapPin size={16} className="text-orange-500"/> 
                                        {event.location} {event.taluka ? `, ${event.taluka}` : ''} {event.district ? `, ${event.district}` : ''}
                                        {event.venue && <span className="text-xs text-stone-400 font-normal ml-1 bg-stone-50 dark:bg-stone-800 px-2 py-0.5 rounded">({event.venue})</span>}
                                    </p>
                                    {event.altContact && <p className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-2"><Phone size={16} className="text-blue-500"/> {event.altContact}</p>}
                                </div>
                            </div>

                            {/* Actions Toolbar - IMPROVED LABELS */}
                            <div className="flex flex-row md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-stone-100 dark:border-stone-800 pt-4 md:pt-0 md:pl-6 shrink-0">
                                <button 
                                    onClick={() => togglePublish(event)} 
                                    className={`px-4 py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-2 text-xs font-bold w-full md:w-auto ${
                                        event.isPublished 
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' 
                                        : 'bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400'
                                    }`} 
                                    title={event.isPublished ? "Unpublish Event" : "Publish Event"}
                                >
                                    {event.isPublished ? <><Globe size={16} /> Published</> : <><EyeOff size={16} /> Draft</>}
                                </button>
                                <button 
                                    onClick={() => openEditModal(event)} 
                                    className="px-4 py-2.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition shadow-sm flex items-center justify-center gap-2 text-xs font-bold w-full md:w-auto" 
                                >
                                    <Edit2 size={16} /> Edit
                                </button>
                                <button 
                                    onClick={() => deleteEvent(event.id)} 
                                    className="px-4 py-2.5 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition shadow-sm flex items-center justify-center gap-2 text-xs font-bold w-full md:w-auto" 
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        </div>
                    )})
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-[2.5rem] border border-dashed border-stone-200 dark:border-stone-700">
                        <div className="w-16 h-16 bg-stone-50 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CalendarCheck size={32} className="text-stone-300" />
                        </div>
                        <p className="text-stone-500 font-medium">कोणताही कार्यक्रम सापडला नाही.</p>
                        {viewMode === 'date' && <button onClick={openAddModal} className="mt-4 text-primary-600 font-bold text-sm hover:underline">या तारखेला नवीन जोडा</button>}
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 disabled:opacity-50 hover:bg-stone-50 dark:hover:bg-stone-800 transition"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-bold text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 disabled:opacity-50 hover:bg-stone-50 dark:hover:bg-stone-800 transition"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* ADD/EDIT MODAL (Premium Style) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
            <div className="bg-white dark:bg-stone-900 rounded-[3rem] w-full max-w-lg shadow-2xl relative animate-slide-up overflow-hidden border border-stone-100 dark:border-stone-800">
                {/* Modal Header */}
                <div className="p-8 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50/80 dark:bg-stone-800/50 backdrop-blur-md">
                    <div>
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest block mb-1">Editor</span>
                        <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">
                            {editingId ? 'कार्यक्रम संपादित करा' : 'नवीन कार्यक्रम'}
                        </h3>
                    </div>
                    <button onClick={closeModal} className="p-3 rounded-full bg-white dark:bg-stone-700 shadow-sm hover:scale-110 transition text-stone-500 dark:text-stone-300"><X size={20}/></button>
                </div>
                
                <form onSubmit={handleSaveEvent} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="group">
                        <label className="block text-xs font-bold uppercase text-stone-500 mb-2 pl-1">कार्यक्रम शीर्षक</label>
                        <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} 
                            className="w-full p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl font-bold text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all border-2 border-transparent focus:border-primary-200 focus:bg-white dark:focus:bg-stone-900" 
                            placeholder="उदा. भव्य कीर्तन सोहळा" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="group">
                            <label className="block text-xs font-bold uppercase text-stone-500 mb-2 pl-1">तारीख</label>
                            <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} 
                                className="w-full p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl font-bold text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all border-2 border-transparent focus:border-primary-200 focus:bg-white dark:focus:bg-stone-900" />
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold uppercase text-stone-500 mb-2 pl-1">प्रकार</label>
                            <div className="relative">
                                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} 
                                    className="w-full p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl font-bold text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 appearance-none transition-all border-2 border-transparent focus:border-primary-200 focus:bg-white dark:focus:bg-stone-900">
                                    <option value="कीर्तन">कीर्तन</option>
                                    <option value="प्रवचन">प्रवचन</option>
                                    <option value="सप्ताह">सप्ताह</option>
                                    <option value="भजन">भजन</option>
                                    <option value="इतर">इतर</option>
                                </select>
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-stone-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="group">
                            <label className="block text-xs font-bold uppercase text-stone-500 mb-2 pl-1">गाव / शहर</label>
                            <div className="relative">
                                <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"/>
                                <input type="text" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} 
                                    className="w-full pl-12 pr-4 py-4 bg-stone-50 dark:bg-stone-800 rounded-2xl font-bold text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all border-2 border-transparent focus:border-primary-200 focus:bg-white dark:focus:bg-stone-900" placeholder="उदा. पुणे" />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="group">
                                <label className="block text-xs font-bold uppercase text-stone-500 mb-2 pl-1">तालुका</label>
                                <input type="text" value={formData.taluka} onChange={e => setFormData({...formData, taluka: e.target.value})} 
                                    className="w-full p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl font-bold text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all border-2 border-transparent focus:border-primary-200 focus:bg-white dark:focus:bg-stone-900" placeholder="उदा. हवेली" />
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold uppercase text-stone-500 mb-2 pl-1">जिल्हा</label>
                                <input type="text" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} 
                                    className="w-full p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl font-bold text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all border-2 border-transparent focus:border-primary-200 focus:bg-white dark:focus:bg-stone-900" placeholder="उदा. पुणे" />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-xs font-bold uppercase text-stone-500 mb-2 pl-1">स्थळ / ठिकाण (Venue)</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"/>
                                <input type="text" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} 
                                    className="w-full pl-12 pr-4 py-4 bg-stone-50 dark:bg-stone-800 rounded-2xl font-bold text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all border-2 border-transparent focus:border-primary-200 focus:bg-white dark:focus:bg-stone-900" placeholder="उदा. विठ्ठल मंदिर" />
                            </div>
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-xs font-bold uppercase text-stone-500 mb-2 pl-1">संपर्क क्रमांक (वेबसाईटवर दिसण्यासाठी)</label>
                        <input type="text" value={formData.altContact} onChange={e => setFormData({...formData, altContact: e.target.value})} 
                            className="w-full p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl font-bold text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all border-2 border-transparent focus:border-primary-200 focus:bg-white dark:focus:bg-stone-900" placeholder="Optional" />
                    </div>

                    <div className="group">
                        <label className="block text-xs font-bold uppercase text-stone-500 mb-2 pl-1">सविस्तर माहिती</label>
                        <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} 
                            className="w-full p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl font-medium text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 resize-none transition-all border-2 border-transparent focus:border-primary-200 focus:bg-white dark:focus:bg-stone-900" placeholder="अधिक माहिती..." />
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-100 dark:border-stone-700 cursor-pointer" onClick={() => setFormData({...formData, isPublished: !formData.isPublished})}>
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${formData.isPublished ? 'bg-primary-600 border-primary-600' : 'border-stone-300 dark:border-stone-600'}`}>
                            {formData.isPublished && <CheckCircle size={14} className="text-white" strokeWidth={4} />}
                        </div>
                        <label className="font-bold text-stone-700 dark:text-stone-300 cursor-pointer select-none flex-1">वेबसाईटवर प्रकाशित करा (Publish)</label>
                        <Globe size={20} className={formData.isPublished ? "text-primary-600" : "text-stone-300"} />
                    </div>

                    <button type="submit" disabled={isSaving} className="w-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
                        {isSaving ? <RefreshCw className="animate-spin"/> : <Save size={20}/>} {editingId ? 'बदल जतन करा' : 'कार्यक्रम जोडा'}
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default CalendarManager;
