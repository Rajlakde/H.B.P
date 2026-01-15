
import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, CheckCircle, AlertCircle, Sparkles, Clock, MapPin, User, ChevronRight, Phone, CalendarCheck, Users, Info, Crosshair, ChevronLeft, Trash2, Plus, Map as MapIcon, Loader2, FileCheck, Building2, MapPinned, Lock, RefreshCw, X, MessageSquare } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { db } from '../../services/db';
import { Inquiry, Event } from '../../types';

const Booking: React.FC = () => {
  const { success, warning, error, info } = useToast();
  const [step, setStep] = useState<'form' | 'preview' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingEvents, setExistingEvents] = useState<Event[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  
  // OTP & Gateway State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState(['', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateObj, setSelectedDateObj] = useState<Date | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '', // Organizer Name
    phone: '',
    altPhone: '',
    date: '',
    city: '', // Gav
    taluka: '', // New
    district: '', // New
    venue: '', // Sthal/Thikan
    latitude: 0,
    longitude: 0,
    type: 'कीर्तन',
    audience: '500',
    details: '',
    locationConfirmed: false
  });

  // Committee Members State (Dynamic, Optional, Max 3)
  const [members, setMembers] = useState<{ name: string; phone: string }[]>([]);

  useEffect(() => {
      loadEvents();
  }, []);

  // OTP Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (showOtpModal && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [showOtpModal, timer]);

  const loadEvents = async () => {
      try {
          const events = await db.getAll('events');
          setExistingEvents(events);
      } catch (e) {
          console.error("Failed to load calendar availability");
      }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMemberChange = (index: number, field: 'name' | 'phone', value: string) => {
      const updated = [...members];
      updated[index][field] = value;
      setMembers(updated);
  };

  const addMember = () => {
      if (members.length < 3) {
          setMembers([...members, { name: '', phone: '' }]);
      } else {
          warning("मर्यादा पूर्ण", "तुम्ही जास्तीत जास्त 3 सदस्य जोडू शकता.");
      }
  };

  const removeMember = (index: number) => {
      const updated = members.filter((_, i) => i !== index);
      setMembers(updated);
  };

  // --- Location Logic ---
  const handleGetLocation = () => {
      if (!navigator.geolocation) {
          error("Error", "Geolocation is not supported by your browser.");
          return;
      }
      setIsLocating(true);
      info("लोकेशन शोधत आहे", "कृपया प्रतीक्षा करा...");
      navigator.geolocation.getCurrentPosition(
          (position) => {
              setFormData({
                  ...formData,
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  locationConfirmed: true
              });
              setIsLocating(false);
              success("लोकेशन निश्चित", "गावाचे लोकेशन यशस्वीरित्या पिन केले आहे!");
          },
          (err) => {
              setIsLocating(false);
              error("लोकेशन त्रुटी", "लोकेशन मिळवता आले नाही. कृपया GPS चालू करा.");
              console.error(err);
          },
          { enableHighAccuracy: true }
      );
  };

  // --- Calendar Logic ---
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const isDateBusy = (dateStr: string) => {
      return existingEvents.some(e => e.date === dateStr && e.status === 'Upcoming');
  };

  const handleDateSelect = (day: number) => {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateStr = date.toLocaleDateString('en-CA'); 
      setSelectedDateObj(date);
      
      const busy = isDateBusy(dateStr);
      setFormData({ ...formData, date: dateStr });

      if (busy) {
          warning("तारीख व्यस्त आहे (Deep Request)", "ही तारीख आधीच आरक्षित आहे. तरीही आपण विनंती पाठवू शकता.");
      }
  };

  // --- Validation Logic ---
  const validateForm = () => {
      // 1. Required Fields Check
      const requiredFields = {
          name: 'आयोजक नाव',
          phone: 'संपर्क क्रमांक',
          city: 'गाव',
          taluka: 'तालुका',
          district: 'जिल्हा',
          venue: 'कार्यक्रम स्थळ',
          date: 'तारीख'
      };

      for (const [key, label] of Object.entries(requiredFields)) {
          if (!(formData as any)[key].trim()) {
              warning("माहिती अपूर्ण", `कृपया '${label}' पूर्ण भरा.`);
              return false;
          }
      }
      
      // 2. Regex Validation for Phone (Indian Mobile: 6-9 start, 10 digits)
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(formData.phone)) {
          warning("अवैध मोबाईल नंबर", "कृपया १० अंकी वैध मोबाईल नंबर प्रविष्ट करा (उदा. 9876543210).");
          return false;
      }
      if (formData.altPhone && !phoneRegex.test(formData.altPhone)) {
          warning("अवैध पर्यायी नंबर", "पर्यायी मोबाईल नंबर १० अंकी असावा.");
          return false;
      }

      // 3. Member Validation
      for (const m of members) {
          if (m.name && !m.phone) {
              warning("सदस्य माहिती अपूर्ण", "कृपया सदस्याचा मोबाईल नंबर भरा.");
              return false;
          }
          if (m.phone && !phoneRegex.test(m.phone)) {
              warning("अवैध सदस्य नंबर", "सदस्याचा मोबाईल नंबर १० अंकी असावा.");
              return false;
          }
      }

      // 4. GPS Check (Recommended)
      if (!formData.locationConfirmed) {
          info("टीप", "अचूक प्रवासासाठी कृपया 'लोकेशन पिन' करण्याचा प्रयत्न करा.");
      }

      return true;
  };

  const handlePreview = () => {
      if(validateForm()) {
          setStep('preview');
          window.scrollTo(0,0);
      }
  }

  // --- VIRTUAL SMS GATEWAY LOGIC ---
  const initiateVerification = () => {
      setShowOtpModal(true);
      sendOtp();
  };

  const sendOtp = async () => {
      setIsSendingOtp(true);
      setCanResend(false);
      setOtpInput(['', '', '', '']);
      
      // 1. Generate Secure OTP
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(code);
      
      // 2. Simulate Gateway Latency (1.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 3. "Dispatch" Message (Virtual Gateway)
      console.log(`%c[SMS GATEWAY] Dispatching to +91${formData.phone}: ${code}`, 'color: #10b981; font-weight: bold; font-size: 12px');
      
      // 4. Deliver to User (Toast Notification acts as the "Phone")
      info("नवीन संदेश (SMS)", `तुमचा व्हेरिफिकेशन OTP आहे: ${code}`);
      
      setTimer(30);
      setIsSendingOtp(false);
      
      // Focus first input
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleOtpInput = (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;

      const newOtp = [...otpInput];
      newOtp[index] = value;
      setOtpInput(newOtp);

      // Auto focus next
      if (value && index < 3) {
          otpRefs.current[index + 1]?.focus();
      }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !otpInput[index] && index > 0) {
          otpRefs.current[index - 1]?.focus();
      }
  };

  const verifyOtp = async () => {
      const enteredOtp = otpInput.join('');
      if (enteredOtp.length !== 4) {
          warning("अपूर्ण कोड", "कृपया ४ अंकी कोड पूर्ण भरा.");
          return;
      }

      if (enteredOtp === generatedOtp) {
          success("Verified", "मोबाईल नंबर व्हेरिफाय झाला!");
          setShowOtpModal(false);
          await handleSubmit(); // Proceed to actual submission
      } else {
          error("Failed", "चुकीचा OTP. कृपया पुन्हा प्रयत्न करा.");
          setOtpInput(['','','','']);
          otpRefs.current[0]?.focus();
      }
  };

  // --- Final Submission ---
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
        const newInquiry: Inquiry = {
            id: Date.now().toString(),
            organizer: formData.name, 
            contact: formData.phone,
            altContact: formData.altPhone,
            location: formData.city, // Village
            taluka: formData.taluka,
            district: formData.district,
            venue: formData.venue,   // Specific Sthal
            latitude: formData.latitude,
            longitude: formData.longitude,
            date: formData.date,
            eventType: formData.type,
            expectedAudience: parseInt(formData.audience) || 0,
            details: formData.details,
            status: 'Pending',
            committeeMembers: members.filter(m => m.name.trim() !== ''),
            submissionDate: new Date().toISOString()
        };

        const existingInquiries = await db.getAll('inquiries');
        await db.save('inquiries', [newInquiry, ...existingInquiries]);

        setStep('success');
        success("विनंती यशस्वी", "विनंती पाठवली आहे. लवकरच आम्ही आपणास संपर्क करू.");
        window.scrollTo(0, 0);

    } catch (err) {
        console.error(err);
        error("त्रुटी", "विनंती पाठवताना समस्या आली. कृपया पुन्हा प्रयत्न करा.");
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- Render Calendar ---
  const renderCalendar = () => {
      const days = getDaysInMonth(currentMonth);
      const offset = getFirstDayOfMonth(currentMonth);
      const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

      return (
          <div className="bg-white dark:bg-stone-900 rounded-[2rem] p-6 border border-stone-200 dark:border-stone-800 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                  <span className="font-serif font-bold text-lg text-stone-900 dark:text-white capitalize">{monthName}</span>
                  <div className="flex gap-2">
                      <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"><ChevronLeft size={18}/></button>
                      <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"><ChevronRight size={18}/></button>
                  </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <span key={d} className="text-xs font-bold text-stone-400">{d}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: offset }).map((_, i) => <div key={`empty-${i}`} />)}
                  {Array.from({ length: days }).map((_, i) => {
                      const day = i + 1;
                      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                      const dateStr = date.toLocaleDateString('en-CA');
                      const isBusy = isDateBusy(dateStr);
                      const isSelected = formData.date === dateStr;
                      const isPast = date < new Date() && !isSelected; // Simple past check

                      return (
                          <button
                              key={day}
                              type="button"
                              disabled={isPast}
                              onClick={() => handleDateSelect(day)}
                              className={`
                                  aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all relative
                                  ${isSelected 
                                      ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-lg scale-105 z-10' 
                                      : isBusy 
                                          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-100 dark:border-red-800' 
                                          : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                  }
                                  ${isPast ? 'opacity-30 cursor-not-allowed' : ''}
                              `}
                          >
                              {day}
                              {isBusy && !isSelected && <span className="w-1 h-1 bg-red-500 rounded-full mt-0.5"></span>}
                          </button>
                      );
                  })}
              </div>
              <div className="flex gap-4 justify-center mt-4 text-[10px] uppercase font-bold tracking-wider text-stone-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-stone-200"></span> Available</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"></span> Busy</span>
              </div>
          </div>
      );
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfbf9] dark:bg-stone-950 px-4 pt-20 transition-colors duration-300">
        <div className="bg-white dark:bg-stone-900 p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-stone-200/50 dark:shadow-none max-w-lg w-full text-center border border-stone-100 dark:border-stone-800 animate-slide-up relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600"></div>
          <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-float">
             <CheckCircle size={48} className="text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 dark:text-white mb-4 font-serif">विनंती पाठवली आहे!</h2>
          <p className="text-stone-500 dark:text-stone-400 mb-10 leading-relaxed text-lg">
            तुमची कार्यक्रम बुकिंग विनंती आम्हाला मिळाली आहे. लवकरच आम्ही आपणास संपर्क करू.
          </p>
          <button 
            onClick={() => { 
                setStep('form'); 
                setFormData({ name: '', phone: '', altPhone: '', date: '', city: '', taluka: '', district: '', venue: '', latitude: 0, longitude: 0, type: 'कीर्तन', audience: '500', details: '', locationConfirmed: false }); 
                setMembers([]);
            }}
            className="w-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-6 py-4 rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-lg"
          >
            नवीन विनंती करा
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfbf9] dark:bg-stone-950 min-h-screen py-24 md:py-32 px-4 md:px-6 transition-colors duration-500 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 max-w-3xl mx-auto animate-slide-up px-4">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-[11px] font-bold uppercase tracking-widest mb-6 border border-orange-100 dark:border-orange-800 shadow-sm">
              <CalendarCheck size={14} className="text-amber-600" /> निमंत्रण
           </div>
           <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-stone-900 dark:text-white mb-6 leading-tight">
             कार्यक्रमाचे <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-amber-600">आमंत्रण</span>
           </h1>
           <p className="text-lg md:text-xl text-stone-500 dark:text-stone-400 font-medium leading-relaxed max-w-2xl mx-auto">
             आपल्या गावातील अखंड हरिनाम सप्ताह, उत्सव किंवा घरगुती शुभकार्यासाठी तारखा आरक्षित करा.
           </p>
        </div>

        {step === 'form' ? (
        <div className="flex flex-col lg:flex-row justify-center items-start gap-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
          
          {/* Left Column: Calendar */}
          <div className="w-full lg:w-1/3 space-y-6">
              <div className="bg-stone-100 dark:bg-stone-900/50 p-6 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 sticky top-24">
                  <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
                      <Clock size={20} className="text-orange-500"/> वेळापत्रक
                  </h3>
                  {renderCalendar()}
                  
                  {isDateBusy(formData.date) && (
                      <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800 flex gap-3">
                          <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                          <div>
                              <p className="text-sm font-bold text-red-700 dark:text-red-400">तारीख व्यस्त आहे!</p>
                              <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                                  तरीही आपण 'Deep Request' म्हणून विनंती पाठवू शकता. ॲडमिन उपलब्धता तपासून कळवतील.
                              </p>
                          </div>
                      </div>
                  )}
              </div>
          </div>

          {/* Right Column: Form */}
          <div className="w-full lg:w-2/3">
             <div className="bg-white dark:bg-stone-900 p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-stone-200/50 dark:shadow-none border border-stone-100 dark:border-stone-800 relative">
                
                <form className="space-y-8">
                    
                    {/* Section 1: Basic Info */}
                    <div className="space-y-6 border-b border-stone-100 dark:border-stone-800 pb-8">
                        <div className="group">
                            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 pl-4">आयोजक (ग्रुप / मंडळ / संस्थान)</label>
                            <div className="relative">
                            <User className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                            <input required type="text" name="name" value={formData.name} onChange={handleChange} 
                                className="w-full pl-14 pr-6 py-4 bg-stone-50 dark:bg-stone-800 border-2 border-transparent rounded-2xl focus:border-primary-500/50 focus:bg-white dark:focus:bg-stone-900 focus:ring-0 text-stone-900 dark:text-white font-medium transition-all outline-none placeholder-stone-400" 
                                placeholder="उदा. श्री गणेश मित्र मंडळ" 
                            />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group">
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 pl-4">प्रमुख संपर्क (खाजगी)</label>
                                <div className="relative">
                                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} 
                                    className="w-full pl-14 pr-6 py-4 bg-stone-50 dark:bg-stone-800 border-2 border-transparent rounded-2xl focus:border-primary-500/50 focus:bg-white dark:focus:bg-stone-900 focus:ring-0 text-stone-900 dark:text-white font-medium transition-all outline-none placeholder-stone-400" 
                                    placeholder="९८७६५ ४३२१०" maxLength={10} 
                                    />
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 pl-4 flex items-center gap-2">
                                    पर्यायी संपर्क (सार्वजनिक) <Info size={14} className="text-orange-500" title="This number will be visible on the website event page"/>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                                    <input type="tel" name="altPhone" value={formData.altPhone} onChange={handleChange} 
                                    className="w-full pl-14 pr-6 py-4 bg-stone-50 dark:bg-stone-800 border-2 border-transparent rounded-2xl focus:border-primary-500/50 focus:bg-white dark:focus:bg-stone-900 focus:ring-0 text-stone-900 dark:text-white font-medium transition-all outline-none placeholder-stone-400" 
                                    placeholder="वेबसाईटवर दिसण्यासाठी (ऐच्छिक)" maxLength={10} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Committee Members (Optional) */}
                    <div className="space-y-6 border-b border-stone-100 dark:border-stone-800 pb-8">
                        <div className="flex items-center justify-between pl-2">
                            <div className="flex items-center gap-2">
                                <Users size={18} className="text-orange-500"/>
                                <h3 className="font-bold text-stone-900 dark:text-white">कमिटी मेंबर्स (Optional)</h3>
                            </div>
                            {members.length < 3 && (
                                <button type="button" onClick={addMember} className="text-xs font-bold bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/20 text-stone-600 dark:text-stone-300 hover:text-orange-600 transition flex items-center gap-1">
                                    <Plus size={14}/> मेंबर जोडा
                                </button>
                            )}
                        </div>
                        
                        {members.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {members.map((member, idx) => (
                                    <div key={idx} className="bg-stone-50 dark:bg-stone-800 p-4 rounded-2xl space-y-3 border border-stone-100 dark:border-stone-700 relative group">
                                        <button type="button" onClick={() => removeMember(idx)} className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition">
                                            <Trash2 size={12}/>
                                        </button>
                                        <p className="text-xs font-bold text-stone-400 uppercase">सदस्य {idx + 1}</p>
                                        <input 
                                            type="text" 
                                            placeholder="नाव" 
                                            className="w-full bg-white dark:bg-stone-900 px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-600 text-sm font-medium outline-none focus:border-primary-500"
                                            value={member.name}
                                            onChange={e => handleMemberChange(idx, 'name', e.target.value)}
                                        />
                                        <input 
                                            type="tel" 
                                            placeholder="मोबाईल" 
                                            className="w-full bg-white dark:bg-stone-900 px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-600 text-sm font-medium outline-none focus:border-primary-500"
                                            value={member.phone}
                                            onChange={e => handleMemberChange(idx, 'phone', e.target.value)}
                                            maxLength={10}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-stone-400 italic pl-4">अतिरिक्त सदस्य माहिती जोडण्यासाठी वरील बटण वापरा (जास्तीत जास्त ३).</p>
                        )}
                    </div>

                    {/* Section 3: Event Details & Location */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group">
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 pl-4">तारीख (कॅलेंडर मधून निवडा)</label>
                                <div className="relative">
                                    <input required type="date" name="date" value={formData.date} onChange={handleChange} 
                                    className="w-full px-6 py-4 bg-stone-50 dark:bg-stone-800 border-2 border-transparent rounded-2xl focus:border-primary-500/50 focus:bg-white dark:focus:bg-stone-900 focus:ring-0 text-stone-900 dark:text-white font-medium transition-all outline-none" 
                                    />
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 pl-4">गाव</label>
                                <div className="relative">
                                    <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"/>
                                    <input required type="text" name="city" value={formData.city} onChange={handleChange} 
                                    className="w-full pl-12 pr-6 py-4 bg-stone-50 dark:bg-stone-800 border-2 border-transparent rounded-2xl focus:border-primary-500/50 focus:bg-white dark:focus:bg-stone-900 focus:ring-0 text-stone-900 dark:text-white font-medium transition-all outline-none placeholder-stone-400" 
                                    placeholder="उदा. पांगरी" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* NEW: Taluka & District */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group">
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 pl-4">तालुका</label>
                                <div className="relative">
                                    <MapPinned size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"/>
                                    <input required type="text" name="taluka" value={formData.taluka} onChange={handleChange} 
                                    className="w-full pl-12 pr-6 py-4 bg-stone-50 dark:bg-stone-800 border-2 border-transparent rounded-2xl focus:border-primary-500/50 focus:bg-white dark:focus:bg-stone-900 focus:ring-0 text-stone-900 dark:text-white font-medium transition-all outline-none placeholder-stone-400" 
                                    placeholder="उदा. बार्शी" 
                                    />
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 pl-4">जिल्हा</label>
                                <div className="relative">
                                    <MapIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"/>
                                    <input required type="text" name="district" value={formData.district} onChange={handleChange} 
                                    className="w-full pl-12 pr-6 py-4 bg-stone-50 dark:bg-stone-800 border-2 border-transparent rounded-2xl focus:border-primary-500/50 focus:bg-white dark:focus:bg-stone-900 focus:ring-0 text-stone-900 dark:text-white font-medium transition-all outline-none placeholder-stone-400" 
                                    placeholder="उदा. सोलापूर" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="group">
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 pl-4">स्थळ / ठिकाण (Venue)</label>
                                <div className="relative">
                                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"/>
                                    <input required type="text" name="venue" value={formData.venue} onChange={handleChange} 
                                    className="w-full pl-12 pr-6 py-4 bg-stone-50 dark:bg-stone-800 border-2 border-transparent rounded-2xl focus:border-primary-500/50 focus:bg-white dark:focus:bg-stone-900 focus:ring-0 text-stone-900 dark:text-white font-medium transition-all outline-none placeholder-stone-400" 
                                    placeholder="उदा. विठ्ठल मंदिर, मेन रोड" 
                                    />
                                </div>
                            </div>
                             <div className="group">
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 pl-4">अपेक्षित श्रोते</label>
                                <div className="relative">
                                    <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"/>
                                    <input type="number" name="audience" value={formData.audience} onChange={handleChange} 
                                    className="w-full pl-12 pr-6 py-4 bg-stone-50 dark:bg-stone-800 border-2 border-transparent rounded-2xl focus:border-primary-500/50 focus:bg-white dark:focus:bg-stone-900 focus:ring-0 text-stone-900 dark:text-white font-medium transition-all outline-none placeholder-stone-400" 
                                    placeholder="500" 
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* GPS Section - Important */}
                        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-colors ${
                            formData.locationConfirmed 
                            ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' 
                            : 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.locationConfirmed ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                    <Crosshair size={20}/>
                                </div>
                                <div className="text-left">
                                    <h4 className={`font-bold text-sm ${formData.locationConfirmed ? 'text-green-700 dark:text-green-400' : 'text-orange-800 dark:text-orange-300'}`}>
                                        {formData.locationConfirmed ? 'Location Pinned (यशस्वी)' : 'GPS Location (महत्वाचे)'}
                                    </h4>
                                    <p className="text-xs text-stone-500 dark:text-stone-400">
                                        {formData.locationConfirmed ? 'तुमचे लोकेशन आमच्यापर्यंत पोहोचले आहे.' : 'Google Map साठी लोकेशन पिन करणे आवश्यक आहे.'}
                                    </p>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={handleGetLocation} 
                                disabled={isLocating}
                                className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                                    formData.locationConfirmed
                                    ? 'bg-white dark:bg-stone-900 text-green-700 border border-green-200'
                                    : 'bg-orange-600 text-white hover:bg-orange-700 shadow-md'
                                }`}
                            >
                                {isLocating ? <Loader2 size={16} className="animate-spin"/> : <MapIcon size={16}/>} 
                                {formData.locationConfirmed ? 'Update Location' : 'Detect Location'}
                            </button>
                        </div>

                        <div>
                             <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 pl-4">कार्यक्रम प्रकार</label>
                             <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                {['कीर्तन', 'प्रवचन', 'सप्ताह', 'इतर'].map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setFormData({...formData, type: t})}
                                        className={`px-6 py-3 rounded-xl border-2 font-bold capitalize whitespace-nowrap transition-all ${
                                            formData.type === t 
                                            ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 border-stone-900 dark:border-white' 
                                            : 'bg-transparent text-stone-500 border-stone-200 dark:border-stone-700 hover:border-stone-400'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                             </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 pl-4">सविस्तर माहिती</label>
                            <textarea 
                                name="details" 
                                value={formData.details} 
                                onChange={handleChange} 
                                rows={4} 
                                className="w-full p-6 bg-stone-50 dark:bg-stone-800 border-2 border-transparent rounded-2xl focus:border-primary-500/50 focus:bg-white dark:focus:bg-stone-900 focus:ring-0 text-stone-900 dark:text-white font-medium transition-all outline-none resize-none placeholder-stone-400" 
                                placeholder="कार्यक्रमाची रूपरेषा, विशेष विनंती किंवा इतर माहिती..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="button" 
                            onClick={handlePreview}
                            className="w-full bg-gradient-to-r from-stone-900 to-stone-800 dark:from-white dark:to-stone-200 text-white dark:text-stone-900 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-stone-900/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
                        >
                            <FileCheck size={20} className="text-amber-400 dark:text-orange-500" /> विनंती तपासा (Review)
                        </button>
                    </div>

                </form>
             </div>
          </div>
        </div>
        ) : (
            /* PREVIEW STEP - Enhanced Design */
            <div className="max-w-3xl mx-auto animate-slide-up">
                <button onClick={() => setStep('form')} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 dark:hover:text-white mb-6 font-bold text-sm bg-white dark:bg-stone-900 px-4 py-2 rounded-full shadow-sm">
                    <ChevronLeft size={16}/> परत (Edit)
                </button>

                <div className="bg-[#fffdf9] dark:bg-stone-900 rounded-[3rem] shadow-2xl overflow-hidden border-8 border-double border-orange-200 dark:border-stone-800 relative">
                    
                    {/* Decorative Corners */}
                    <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-orange-400 rounded-tl-[2rem] m-4 pointer-events-none"></div>
                    <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-orange-400 rounded-tr-[2rem] m-4 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-orange-400 rounded-bl-[2rem] m-4 pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-orange-400 rounded-br-[2rem] m-4 pointer-events-none"></div>

                    {/* Official Invitation Header */}
                    <div className="text-center pt-12 pb-6 px-8 relative z-10">
                        <div className="inline-block mb-4">
                            <Sparkles size={32} className="text-orange-500 mx-auto animate-pulse"/>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 dark:text-white mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
                            ॥ निमंत्रण पत्रिका ॥
                        </h2>
                        <p className="text-sm font-bold text-stone-500 uppercase tracking-[0.3em]">विनंती अर्ज</p>
                    </div>

                    <div className="px-8 md:px-16 pb-12 relative z-10">
                        
                        {/* Organizer Section */}
                        <div className="text-center mb-10">
                            <p className="text-stone-500 text-sm font-serif italic mb-2">प्रति,</p>
                            <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-200 font-serif">ह.भ.प. कु. कांचनताई शिवानंदजी शेळके</h3>
                            <p className="text-stone-500 text-sm mt-4">यांसी,</p>
                            <p className="text-lg font-medium text-stone-700 dark:text-stone-300 mt-2 leading-relaxed">
                                स.न.वि.वि., आम्ही <span className="font-bold text-stone-900 dark:text-white border-b border-orange-300 px-1">{formData.name}</span>,
                                आपल्या गावात खालील नियोजित कार्यक्रमासाठी आपल्याला आग्रहाचे निमंत्रण देत आहोत.
                            </p>
                        </div>

                        {/* Detailed Table */}
                        <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
                                
                                <div className="border-b border-stone-200 dark:border-stone-700 pb-2">
                                    <span className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">शुभ दिनांक</span>
                                    <span className="text-lg font-bold text-stone-900 dark:text-white font-serif">{new Date(formData.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>

                                <div className="border-b border-stone-200 dark:border-stone-700 pb-2">
                                    <span className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">कार्यक्रम सेवा</span>
                                    <span className="text-lg font-bold text-stone-900 dark:text-white">{formData.type}</span>
                                </div>

                                <div className="border-b border-stone-200 dark:border-stone-700 pb-2">
                                    <span className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">ठिकाण (गाव)</span>
                                    <span className="text-lg font-bold text-stone-900 dark:text-white">{formData.city}</span>
                                </div>

                                <div className="border-b border-stone-200 dark:border-stone-700 pb-2">
                                    <span className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">तालुका / जिल्हा</span>
                                    <span className="text-lg font-bold text-stone-900 dark:text-white">{formData.taluka}, {formData.district}</span>
                                </div>

                                <div className="md:col-span-2 border-b border-stone-200 dark:border-stone-700 pb-2">
                                    <span className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">कार्यक्रम स्थळ (Venue)</span>
                                    <span className="text-lg font-bold text-stone-900 dark:text-white">{formData.venue}</span>
                                </div>

                                <div className="border-b md:border-b-0 border-stone-200 dark:border-stone-700 pb-2">
                                    <span className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">प्रमुख संपर्क</span>
                                    <span className="text-lg font-bold text-stone-900 dark:text-white font-mono">{formData.phone}</span>
                                </div>

                                <div className="pb-2">
                                    <span className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">लोकेशन स्टेटसं</span>
                                    <span className={`inline-flex items-center gap-1 font-bold ${formData.locationConfirmed ? 'text-green-600' : 'text-red-500'}`}>
                                        {formData.locationConfirmed ? <><CheckCircle size={14}/> जोडले आहे</> : <><AlertCircle size={14}/> जोडले नाही</>}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={initiateVerification} 
                            disabled={isSubmitting}
                            className="w-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 py-4 rounded-xl font-bold text-lg shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                        >
                            <Lock size={20} className="text-amber-400 dark:text-orange-600"/> Verify & Submit
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>

      {/* OTP Verification Modal (Virtual SMS Gateway) */}
      {showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-sm transition-opacity"></div>
              <div className="bg-white dark:bg-stone-950 rounded-[2.5rem] w-full max-w-md shadow-2xl relative animate-slide-up overflow-hidden border border-stone-100 dark:border-stone-800 p-8 text-center">
                  
                  {isSendingOtp ? (
                      <div className="py-12 flex flex-col items-center">
                          <Loader2 size={48} className="text-orange-500 animate-spin mb-4" />
                          <h3 className="text-xl font-bold text-stone-900 dark:text-white">Connecting to Gateway...</h3>
                          <p className="text-stone-500 text-sm mt-2">Sending OTP to +91 {formData.phone}</p>
                      </div>
                  ) : (
                      <>
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-400">
                            <Lock size={32} />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-2">मोबाईल व्हेरिफिकेशन</h3>
                        <p className="text-stone-500 dark:text-stone-400 text-sm mb-6">
                            आम्ही <strong>+91 {formData.phone}</strong> या नंबरवर 4 अंकी कोड पाठवला आहे. <br/>
                            <span className="text-xs text-orange-500 font-bold">(कृपया स्क्रीनवर आलेला नोटिफिकेशन पहा)</span>
                        </p>

                        <div className="flex justify-center gap-3 mb-8">
                            {otpInput.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => otpRefs.current[index] = el}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpInput(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    className="w-14 h-14 rounded-xl border-2 border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-center text-2xl font-bold text-stone-900 dark:text-white focus:border-blue-500 focus:outline-none transition-all"
                                />
                            ))}
                        </div>

                        <button 
                            onClick={verifyOtp}
                            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 mb-4"
                        >
                            व्हेरिफाय करा (Verify)
                        </button>

                        <div className="flex justify-between items-center text-sm">
                            <button 
                                onClick={() => setShowOtpModal(false)}
                                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 font-bold"
                            >
                                रद्द करा
                            </button>
                            
                            {timer > 0 ? (
                                <span className="text-stone-400 font-mono">00:{timer < 10 ? `0${timer}` : timer}</span>
                            ) : (
                                <button 
                                    onClick={sendOtp}
                                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                                >
                                    <RefreshCw size={12}/> पुन्हा पाठवा
                                </button>
                            )}
                        </div>
                      </>
                  )}
              </div>
          </div>
      )}

    </div>
  );
};

export default Booking;
