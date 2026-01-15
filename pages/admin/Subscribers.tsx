import React, { useState, useEffect } from 'react';
import { Subscriber } from '../../types';
import { Mail, MessageCircle, User, MapPin, Search, Download, Calendar, Users, RefreshCw } from 'lucide-react';
import { db } from '../../services/db';
import { useToast } from '../../context/ToastContext';

const Subscribers: React.FC = () => {
  const { success } = useToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
      loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
      setLoading(true);
      const data = await db.getAll('subscribers');
      setSubscribers(data);
      setLoading(false);
  };

  const handleExport = () => {
      if (!subscribers.length) return;
      const csvContent = "data:text/csv;charset=utf-8," 
          + "Name,Contact,District,Joined Date\n"
          + subscribers.map(e => `${e.name},${e.contact},${e.district},${e.joinedDate}`).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "bhakt_parivar_list.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      success("Export Successful", "भक्त परिवार यादी डाऊनलोड झाली.");
  };

  const filtered = subscribers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.district.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header - Badge + Title + Description */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="space-y-4 max-w-2xl">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-[11px] font-bold uppercase tracking-widest border border-orange-100 dark:border-orange-800 shadow-sm">
               <Users size={12} className="text-amber-600" /> समुदाय
           </div>
           <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white leading-tight flex items-center gap-2">
              भक्त <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-amber-600">परिवार</span> यादी
              {loading && <RefreshCw size={20} className="animate-spin text-stone-400 ml-2" />}
           </h1>
           <p className="text-sm md:text-base text-stone-500 dark:text-stone-400 font-medium leading-relaxed">
              वेबसाईटशी जोडलेल्या आणि संपर्कात असलेल्या सर्व भक्तांची आणि संस्थांची यादी. नवीन अपडेट्स आणि कार्यक्रमांची माहिती पाठवण्यासाठी या डेटाबेसचा वापर करा.
           </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={18} />
             <input 
                type="text" 
                placeholder="शोधा..." 
                className="w-full pl-10 pr-4 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
             />
           </div>
           <button onClick={handleExport} className="bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 px-3 py-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center transition-colors">
              <Download size={18} />
           </button>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
         {filtered.map(sub => (
            <div key={sub.id} className="bg-white dark:bg-stone-900 p-5 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800">
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                     <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold mr-3 text-lg">
                        {sub.name.charAt(0)}
                     </div>
                     <div>
                        <h3 className="font-bold text-stone-900 dark:text-white">{sub.name}</h3>
                        <p className="text-sm text-stone-500">{sub.contact}</p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full">
                        <MessageCircle size={18} />
                     </button>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4 text-sm text-stone-600 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800 pt-4">
                  <div className="flex items-center">
                     <MapPin size={16} className="mr-2 text-primary-500" /> {sub.district}
                  </div>
                  <div className="flex items-center">
                     <Calendar size={16} className="mr-2 text-primary-500" /> {sub.joinedDate}
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden transition-colors">
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800">
               <thead className="bg-stone-50 dark:bg-stone-800/50">
                  <tr>
                     <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 dark:text-stone-400 uppercase">नाव</th>
                     <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 dark:text-stone-400 uppercase">संपर्क</th>
                     <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 dark:text-stone-400 uppercase">जिल्हा</th>
                     <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 dark:text-stone-400 uppercase">तारीख</th>
                     <th className="px-6 py-4 text-right text-xs font-bold text-stone-500 dark:text-stone-400 uppercase">कृती</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                  {filtered.map((sub) => (
                     <tr key={sub.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                        <td className="px-6 py-4">
                           <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold mr-3">
                                 {sub.name.charAt(0)}
                              </div>
                              <span className="font-medium text-stone-900 dark:text-white">{sub.name}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-stone-600 dark:text-stone-400">{sub.contact}</td>
                        <td className="px-6 py-4">
                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                              <MapPin size={10} className="mr-1" /> {sub.district}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-stone-500 dark:text-stone-400">{sub.joinedDate}</td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2">
                              <button className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition" title="WhatsApp">
                                 <MessageCircle size={18} />
                              </button>
                              <button className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition" title="SMS">
                                 <Mail size={18} />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default Subscribers;