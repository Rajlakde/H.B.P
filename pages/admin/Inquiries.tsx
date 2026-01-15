
import React, { useState, useEffect } from 'react';
import { Inquiry, Event } from '../../types';
import { Check, X, Phone, MapPin, Calendar, Search, Users, Info, Map as MapIcon, RefreshCw, Eye, MessageSquare, Navigation, MapPinned, Building2, List, AlertTriangle } from 'lucide-react';
import { db } from '../../services/db';
import { useToast } from '../../context/ToastContext';

// Admin Base Location (Alandi - approx)
const ADMIN_LAT = 18.6769;
const ADMIN_LNG = 73.8967;

const Inquiries: React.FC = () => {
  const { success, error, info } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Confirmed' | 'Rejected'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    setIsLoading(true);
    try {
      const data = await db.getAll('inquiries');
      const safeData = Array.isArray(data) ? data : [];
      
      const sorted = safeData.sort((a: Inquiry, b: Inquiry) => {
          // Robust date parsing for sorting
          const getTimestamp = (d?: string) => d ? new Date(d).getTime() : 0;
          const dateA = getTimestamp(a.submissionDate) || getTimestamp(a.date);
          const dateB = getTimestamp(b.submissionDate) || getTimestamp(b.date);
          return dateB - dateA;
      });
      setInquiries(sorted);
    } catch (err) {
      console.error(err);
      error("लोड त्रुटी", "विनंत्या लोड करता आल्या नाहीत.");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDistance = (lat1: number | undefined, lon1: number | undefined, lat2: number | undefined, lon2: number | undefined) => {
      if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
      const R = 6371; 
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      return Math.round(R * c); 
  };

  const getSubmissionDate = (inquiry: Inquiry) => {
      if (inquiry.submissionDate) {
          try {
            const d = new Date(inquiry.submissionDate);
            if (!isNaN(d.getTime())) return d.toLocaleDateString();
          } catch (e) { return 'N/A'; }
      }
      return 'N/A'; 
  };

  const handleStatusChange = async (inquiryId: string, newStatus: 'Confirmed' | 'Rejected', e?: React.MouseEvent) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    const inquiryToUpdate = inquiries.find(i => i.id === inquiryId);
    if (!inquiryToUpdate) {
        error("Error", "Inquiry not found in local state.");
        return;
    }

    setProcessingId(inquiryId);

    try {
        // 1. Prepare Updated Inquiry Object
        const updatedInquiry: Inquiry = { ...inquiryToUpdate, status: newStatus };
        
        // 2. Optimistic Update
        const updatedInquiriesList = inquiries.map(inq => 
            inq.id === inquiryId ? updatedInquiry : inq
        );
        setInquiries(updatedInquiriesList);
        
        // 3. Save Inquiry List
        await db.save('inquiries', updatedInquiriesList);
        
        // 4. Handle Event Creation (Only for Confirmed)
        if (newStatus === 'Confirmed') {
            const safeDate = inquiryToUpdate.date || new Date().toISOString().split('T')[0];
            const safeTitle = inquiryToUpdate.organizer ? `${inquiryToUpdate.organizer} - ${inquiryToUpdate.eventType}` : 'नवीन कार्यक्रम';

            const newEvent: Event = {
                id: `evt_${Date.now()}`,
                title: safeTitle,
                date: safeDate,
                location: inquiryToUpdate.location || 'Unknown', 
                taluka: inquiryToUpdate.taluka || '',
                district: inquiryToUpdate.district || '',
                venue: inquiryToUpdate.venue || '',
                latitude: inquiryToUpdate.latitude || 0,
                longitude: inquiryToUpdate.longitude || 0,
                type: inquiryToUpdate.eventType || 'इतर',
                status: 'Upcoming',
                description: inquiryToUpdate.details || `आयोजक: ${inquiryToUpdate.organizer}. संपर्क: ${inquiryToUpdate.contact}`,
                organizer: inquiryToUpdate.organizer || 'Unknown',
                contact: inquiryToUpdate.contact || '', 
                altContact: inquiryToUpdate.altContact || '',
                committeeMembers: inquiryToUpdate.committeeMembers || [],
                isPublished: false, // Draft mode
                duration: '2 तास' 
            };

            // Fetch current events to ensure we append correctly
            const currentEvents = await db.getAll('events');
            const safeEvents = Array.isArray(currentEvents) ? currentEvents : [];
            await db.save('events', [...safeEvents, newEvent]);

            success("विनंती स्वीकारली", "कॅलेंडरमध्ये 'Draft' इव्हेंट तयार केला आहे.");
        } else {
            info("विनंती नाकारली", "विनंती रद्द (Rejected) करण्यात आली.");
        }
        
        // Close modal if open
        if (selectedInquiry?.id === inquiryId) {
            setSelectedInquiry(null);
        }

    } catch (err) {
        console.error("Action Failed:", err);
        error("त्रुटी", "बदल सेव्ह करताना समस्या आली. कृपया रिफ्रेश करा.");
        loadInquiries(); // Revert
    } finally {
        setProcessingId(null);
    }
  };

  const filteredInquiries = inquiries
    .filter(i => filter === 'All' || i.status === filter)
    .filter(i => 
        (i.organizer && i.organizer.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (i.location && i.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (i.district && i.district.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Confirmed': return 'bg-green-100 text-green-700 border-green-200';
          case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
          default: return 'bg-amber-100 text-amber-800 border-amber-200';
      }
  };

  return (
    <div className="max-w-7xl mx-auto animate-slide-up pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 px-2">
        <div className="space-y-4">
           <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white leading-tight flex items-center gap-2">
             बुकिंग आणि <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-amber-600">चौकशी</span>
             {isLoading && <RefreshCw size={24} className="animate-spin text-stone-400 ml-2" />}
           </h1>
           <p className="text-sm md:text-base text-stone-500 dark:text-stone-400 font-medium leading-relaxed max-w-xl">
             विविध गावांमधून आलेल्या कीर्तन सेवेच्या विनंत्यांचे व्यवस्थापन. स्वीकारलेल्या विनंत्या आपोआप कॅलेंडरमध्ये जोडल्या जातील.
           </p>
        </div>
        
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
           <div className="relative">
             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400" size={18} />
             <input 
               type="text" 
               placeholder="नाव, गाव किंवा जिल्हा शोधा..." 
               className="w-full sm:w-72 pl-11 pr-4 py-3 border border-stone-200 dark:border-stone-800 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-stone-900 text-stone-900 dark:text-white font-medium shadow-sm transition-all"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {['All', 'Pending', 'Confirmed', 'Rejected'].map(f => (
            <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                filter === f 
                ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-lg' 
                : 'bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
            >
                {f === 'All' ? <List size={16}/> : f === 'Pending' ? <Info size={16}/> : f === 'Confirmed' ? <Check size={16}/> : <X size={16}/>}
                {f === 'All' ? 'सर्व' : f === 'Pending' ? 'प्रलंबित' : f === 'Confirmed' ? 'निश्चित' : 'रद्द'}
                <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${filter === f ? 'bg-white/20' : 'bg-stone-100 dark:bg-stone-800'}`}>
                    {inquiries.filter(i => f === 'All' || i.status === f).length}
                </span>
            </button>
            ))}
        </div>
      </div>
      
      {/* Inquiry Cards List */}
      <div className="space-y-4">
        {filteredInquiries.length > 0 ? (
            filteredInquiries.map(inquiry => {
                const distance = calculateDistance(ADMIN_LAT, ADMIN_LNG, inquiry.latitude, inquiry.longitude);
                const isItemProcessing = processingId === inquiry.id;
                
                return (
                <div key={inquiry.id} className="relative group bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-stone-100 dark:border-stone-800 hover:-translate-y-1 cursor-pointer" onClick={() => setSelectedInquiry(inquiry)}>
                    
                    {/* Decorative Colored Strip */}
                    <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                        inquiry.eventType === 'कीर्तन' ? 'bg-orange-500' : 'bg-stone-400'
                    }`}></div>

                    <div className="p-6 md:p-8 pl-8 flex flex-col lg:flex-row gap-6">
                        
                        {/* Primary Info */}
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <span className={`px-3 py-1 text-xs font-bold rounded-lg border uppercase tracking-wide ${getStatusColor(inquiry.status)}`}>
                                    {inquiry.status}
                                </span>
                                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
                                    {inquiry.eventType}
                                </span>
                                {inquiry.latitude && inquiry.longitude ? (
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg flex items-center gap-1">
                                        <Navigation size={12} /> {distance} km
                                    </span>
                                ) : null}
                                <span className="text-xs font-bold text-stone-400 ml-auto flex items-center gap-1">
                                    <Calendar size={12}/> {getSubmissionDate(inquiry)}
                                </span>
                            </div>

                            <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-2 leading-tight">
                                {inquiry.organizer}
                            </h3>
                            
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-stone-600 dark:text-stone-300 mt-4">
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-blue-500"/>
                                    <span className="font-bold">{inquiry.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-orange-500"/>
                                    <span className="font-bold">{new Date(inquiry.date).toLocaleDateString('en-GB')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone size={16} className="text-green-500"/>
                                    <span className="font-bold font-mono">{inquiry.contact}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions Toolbar */}
                        <div className="flex flex-row lg:flex-col justify-center gap-3 border-t lg:border-t-0 lg:border-l border-stone-100 dark:border-stone-800 pt-4 lg:pt-0 lg:pl-6 shrink-0">
                            {inquiry.status === 'Pending' && (
                                <>
                                    <button 
                                        onClick={(e) => handleStatusChange(inquiry.id, 'Confirmed', e)}
                                        disabled={isItemProcessing}
                                        className="flex-1 lg:w-32 px-4 py-2.5 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-xl font-bold text-xs hover:bg-green-100 dark:hover:bg-green-900/50 flex items-center justify-center gap-2 transition-colors border border-green-200 dark:border-green-800 z-10 disabled:opacity-50"
                                    >
                                        {isItemProcessing ? <RefreshCw className="animate-spin" size={14}/> : <Check size={16} />} स्वीकार
                                    </button>
                                    <button 
                                        onClick={(e) => handleStatusChange(inquiry.id, 'Rejected', e)}
                                        disabled={isItemProcessing}
                                        className="flex-1 lg:w-32 px-4 py-2.5 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-xl font-bold text-xs hover:bg-red-100 dark:hover:bg-red-900/50 flex items-center justify-center gap-2 transition-colors border border-red-200 dark:border-red-800 z-10 disabled:opacity-50"
                                    >
                                        {isItemProcessing ? <RefreshCw className="animate-spin" size={14}/> : <X size={16} />} नकार
                                    </button>
                                </>
                            )}
                            <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedInquiry(inquiry); }}
                                className="flex-1 lg:w-32 px-4 py-2.5 bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 rounded-xl font-bold text-xs hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center gap-2 transition-colors z-10"
                            >
                                <Eye size={16} /> तपशील
                            </button>
                        </div>
                    </div>
                </div>
            )})
        ) : (
           <div className="text-center py-24 bg-stone-50 dark:bg-stone-900 rounded-[3rem] border border-dashed border-stone-200 dark:border-stone-800">
               <div className="w-20 h-20 bg-white dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                   <MessageSquare size={32} className="text-stone-300 dark:text-stone-600" />
               </div>
               <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">कोणतीही विनंती सापडली नाही</h3>
               <button onClick={() => {setFilter('All'); setSearchTerm('');}} className="mt-6 text-primary-600 font-bold hover:underline">
                   सर्व विनंत्या पहा
               </button>
           </div>
        )}
      </div>

      {/* PREMIUM DETAILS MODAL */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm transition-opacity" onClick={() => setSelectedInquiry(null)}></div>
            <div className="bg-[#fffdf9] dark:bg-stone-950 rounded-[2.5rem] w-full max-w-5xl shadow-2xl relative animate-slide-up overflow-hidden max-h-[90vh] flex flex-col border border-stone-100 dark:border-stone-800">
                
                {/* Modal Header */}
                <div className="p-6 md:p-8 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50/50 dark:bg-stone-900/50">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className={`px-3 py-1 text-xs font-bold rounded-lg border uppercase tracking-wide ${getStatusColor(selectedInquiry.status)}`}>
                                {selectedInquiry.status}
                            </span>
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{selectedInquiry.eventType}</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 dark:text-white">{selectedInquiry.organizer}</h2>
                    </div>
                    <button onClick={() => setSelectedInquiry(null)} className="p-3 bg-stone-200 dark:bg-stone-800 rounded-full hover:bg-stone-300 dark:hover:bg-stone-700 transition text-stone-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* LEFT: Info */}
                        <div className="space-y-8">
                            <div className="bg-stone-50 dark:bg-stone-900 p-6 rounded-2xl border border-stone-100 dark:border-stone-800">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white mb-4 uppercase tracking-wider">
                                    <Info size={16} className="text-primary-500"/> सविस्तर माहिती
                                </h4>
                                <p className="text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                                    {selectedInquiry.details || 'विशेष माहिती उपलब्ध नाही.'}
                                </p>
                                <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700 grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs text-stone-400 uppercase font-bold block mb-1">तारीख</span>
                                        <p className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
                                            <Calendar size={14} className="text-orange-500"/>
                                            {new Date(selectedInquiry.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-stone-400 uppercase font-bold block mb-1">अपेक्षित श्रोते</span>
                                        <p className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
                                            <Users size={14} className="text-blue-500"/>
                                            {selectedInquiry.expectedAudience}+
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800">
                                    <p className="text-xs text-stone-400 font-bold uppercase mb-1">प्रमुख संपर्क</p>
                                    <a href={`tel:${selectedInquiry.contact}`} className="text-lg font-bold text-green-600 hover:underline flex items-center gap-2"><Phone size={16}/>{selectedInquiry.contact}</a>
                                </div>
                                {selectedInquiry.altContact && (
                                    <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800">
                                        <p className="text-xs text-stone-400 font-bold uppercase mb-1">पर्यायी संपर्क</p>
                                        <a href={`tel:${selectedInquiry.altContact}`} className="text-lg font-bold text-blue-600 hover:underline flex items-center gap-2"><Phone size={16}/>{selectedInquiry.altContact}</a>
                                    </div>
                                )}
                            </div>

                            {selectedInquiry.committeeMembers && selectedInquiry.committeeMembers.length > 0 && (
                                <div>
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white mb-4 uppercase tracking-wider">
                                        <Users size={16} className="text-primary-500"/> कमिटी सदस्य
                                    </h4>
                                    <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden">
                                        {selectedInquiry.committeeMembers.map((m, i) => (
                                            <div key={i} className="px-6 py-3 border-b border-stone-200 dark:border-stone-800 last:border-0 flex justify-between items-center">
                                                <span className="font-bold text-sm text-stone-700 dark:text-stone-300">{m.name}</span>
                                                <a href={`tel:${m.phone}`} className="text-xs font-bold text-stone-500">{m.phone}</a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Map */}
                        <div className="flex flex-col h-full">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white mb-4 uppercase tracking-wider">
                                <MapIcon size={16} className="text-primary-500"/> नकाशा व पत्ता
                            </h4>
                            
                            <div className="flex-1 bg-stone-100 dark:bg-stone-800 rounded-[2rem] overflow-hidden relative min-h-[300px] border border-stone-200 dark:border-stone-700 flex flex-col">
                                {selectedInquiry.latitude && selectedInquiry.longitude ? (
                                    <div className="flex-1 relative">
                                        <iframe 
                                            width="100%" 
                                            height="100%" 
                                            className="border-0 w-full h-full absolute inset-0"
                                            src={`https://maps.google.com/maps?q=${selectedInquiry.latitude},${selectedInquiry.longitude}&z=14&output=embed`}
                                            allowFullScreen
                                            loading="lazy"
                                        ></iframe>
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white/50">
                                            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Distance</p>
                                            <p className="text-xl font-black text-stone-900">
                                                {calculateDistance(ADMIN_LAT, ADMIN_LNG, selectedInquiry.latitude, selectedInquiry.longitude)} km
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-stone-400 bg-stone-200 dark:bg-stone-800/50">
                                        <MapIcon size={48} className="opacity-50 mb-2"/>
                                        <p className="font-bold">GPS Location Not Provided</p>
                                        <p className="text-xs mt-1">आयोजकांनी लोकेशन पिन केले नाही.</p>
                                    </div>
                                )}
                                
                                <div className="p-6 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700">
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <Building2 size={18} className="text-orange-500 shrink-0 mt-0.5"/>
                                            <div>
                                                <span className="text-xs font-bold text-stone-400 uppercase">गाव</span>
                                                <p className="font-bold text-stone-900 dark:text-white">{selectedInquiry.location}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <MapPinned size={18} className="text-orange-500 shrink-0 mt-0.5"/>
                                            <div>
                                                <span className="text-xs font-bold text-stone-400 uppercase">तालुका / जिल्हा</span>
                                                <p className="font-bold text-stone-900 dark:text-white">{selectedInquiry.taluka || '-'}, {selectedInquiry.district || '-'}</p>
                                            </div>
                                        </div>
                                        {selectedInquiry.venue && (
                                            <div className="flex items-start gap-3">
                                                <MapPin size={18} className="text-orange-500 shrink-0 mt-0.5"/>
                                                <div>
                                                    <span className="text-xs font-bold text-stone-400 uppercase">स्थळ</span>
                                                    <p className="font-bold text-stone-900 dark:text-white">{selectedInquiry.venue}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                {selectedInquiry.status === 'Pending' && (
                    <div className="p-6 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex flex-col md:flex-row gap-4">
                        <button 
                            onClick={(e) => handleStatusChange(selectedInquiry.id, 'Confirmed', e)}
                            disabled={!!processingId}
                            className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold text-lg hover:bg-green-700 shadow-xl shadow-green-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {processingId === selectedInquiry.id ? <RefreshCw className="animate-spin" /> : <Check size={24} />} विनंती स्वीकार करा
                        </button>
                        <button 
                            onClick={(e) => handleStatusChange(selectedInquiry.id, 'Rejected', e)}
                            disabled={!!processingId}
                            className="flex-1 py-4 bg-white dark:bg-stone-800 text-red-600 border-2 border-red-100 dark:border-red-900/30 rounded-2xl font-bold text-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {processingId === selectedInquiry.id ? <RefreshCw className="animate-spin" /> : <X size={24} />} नकार द्या
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}

    </div>
  );
};

export default Inquiries;
