
import React, { useEffect, useState } from 'react';
import { 
  Link2, RefreshCw, CheckCircle, AlertTriangle, Cloud, Database, Lock, LogOut, Zap, 
  Server, HardDrive, Layout, Facebook, Instagram, Youtube, MessageCircle, 
  BarChart, Search, DollarSign, Megaphone, Shield, Activity, Globe, X, Save, ExternalLink,
  GitBranch, Github
} from 'lucide-react';
import { initGapi, initGis, signInGoogle, signOutGoogle, initializeDriveStructure } from '../../services/googleDrive';
import { checkSupabaseConnection } from '../../services/supabase';
import { validateGitHubConnection } from '../../services/github';
import { db, DbMode } from '../../services/db';
import { useToast } from '../../context/ToastContext';

// Types for the new generic integrations
type IntegrationType = 'social' | 'analytics' | 'ads' | 'performance';
interface IntegrationItem {
  id: string;
  name: string;
  type: IntegrationType;
  icon: React.ElementType;
  description: string;
  color: string;
  fields: { key: string; label: string; placeholder: string }[];
  isPro?: boolean;
}

const NEW_INTEGRATIONS: IntegrationItem[] = [
  // Social
  {
    id: 'instagram', name: 'Instagram Graph API', type: 'social', icon: Instagram, color: 'text-pink-600 bg-pink-50 dark:bg-pink-900/20 border-pink-100', description: 'Fetch posts, reels, and analytics automatically.',
    fields: [{ key: 'ig_token', label: 'Access Token', placeholder: 'IGVQ...' }]
  },
  {
    id: 'facebook', name: 'Facebook Page', type: 'social', icon: Facebook, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100', description: 'Auto-post updates and sync events.',
    fields: [{ key: 'fb_page_id', label: 'Page ID', placeholder: '10293...' }]
  },
  {
    id: 'youtube', name: 'YouTube Data API', type: 'social', icon: Youtube, color: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-100', description: 'Sync video gallery and subscriber counts.',
    fields: [{ key: 'yt_api_key', label: 'API Key', placeholder: 'AIza...' }, { key: 'yt_channel_id', label: 'Channel ID', placeholder: 'UC...' }]
  },
  {
    id: 'whatsapp', name: 'WhatsApp Business', type: 'social', icon: MessageCircle, color: 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-100', description: 'Send automated booking confirmations.',
    fields: [{ key: 'wa_phone_id', label: 'Phone Number ID', placeholder: '103...' }]
  },
  // Analytics
  {
    id: 'ga4', name: 'Google Analytics 4', type: 'analytics', icon: BarChart, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-100', description: 'Track visitor traffic and behavior.',
    fields: [{ key: 'ga_measurement_id', label: 'Measurement ID', placeholder: 'G-XXXXXXX' }]
  },
  {
    id: 'search_console', name: 'Google Search Console', type: 'analytics', icon: Search, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-100', description: 'Monitor search performance and indexing.',
    fields: [{ key: 'gsc_verification', label: 'HTML Tag Verification', placeholder: '<meta name=...' }]
  },
  // Ads
  {
    id: 'adsense', name: 'Google AdSense', type: 'ads', icon: DollarSign, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100', description: 'Monetize website traffic with ads.',
    fields: [{ key: 'adsense_pub_id', label: 'Publisher ID', placeholder: 'pub-xxxxxxxx' }]
  },
  {
    id: 'meta_ads', name: 'Meta Pixel (Ads)', type: 'ads', icon: Megaphone, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100', description: 'Retarget visitors on Facebook & Instagram.',
    fields: [{ key: 'fb_pixel_id', label: 'Pixel ID', placeholder: '2837...' }]
  },
  // Performance
  {
    id: 'cloudflare', name: 'Cloudflare CDN', type: 'performance', icon: Cloud, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20 border-orange-100', description: 'Speed up site load times and security.',
    fields: [{ key: 'cf_zone_id', label: 'Zone ID', placeholder: 'e2d...' }]
  },
  {
    id: 'sentry', name: 'Sentry IO', type: 'performance', icon: Activity, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-100', description: 'Real-time error tracking and monitoring.',
    fields: [{ key: 'sentry_dsn', label: 'DSN URL', placeholder: 'https://...' }]
  },
];

const Integrations: React.FC = () => {
  const { success, error, warning, info } = useToast();
  
  // Database Status States
  const [googleStatus, setGoogleStatus] = useState<'Disconnected' | 'Connected' | 'Error'>('Disconnected');
  const [supabaseStatus, setSupabaseStatus] = useState<'Disconnected' | 'Connected' | 'Error'>('Disconnected');
  const [githubStatus, setGithubStatus] = useState<'Disconnected' | 'Connected' | 'Error'>('Disconnected');
  
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<DbMode>('local');

  // Config States
  const [driveConfig, setDriveConfig] = useState({ clientId: '', apiKey: '' });
  const [sbConfig, setSbConfig] = useState({ url: '', key: '' });
  const [ghConfig, setGhConfig] = useState({ token: '', owner: '', repo: '', branch: 'main' });
  const [driveStructure, setDriveStructure] = useState<any>(null);

  // Generic Modal State
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationItem | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});

  useEffect(() => {
    // 1. Initialize Mode
    setActiveMode(db.getMode());

    // 2. Check Drive
    const token = localStorage.getItem('g_access_token');
    if (token) setGoogleStatus('Connected');
    const savedDriveStruct = localStorage.getItem('drive_config');
    if (savedDriveStruct) setDriveStructure(JSON.parse(savedDriveStruct));
    const storedClientId = localStorage.getItem('g_client_id');
    const storedApiKey = localStorage.getItem('g_api_key');
    if(storedClientId && storedApiKey) {
        setDriveConfig({ clientId: storedClientId, apiKey: storedApiKey });
        initGapi().then(() => initGis(handleDriveToken)).catch(console.error);
    }

    // 3. Check Supabase
    const sbUrl = localStorage.getItem('sb_project_url');
    const sbKey = localStorage.getItem('sb_anon_key');
    if(sbUrl && sbKey) {
        setSbConfig({ url: sbUrl, key: sbKey });
        setSupabaseStatus('Connected');
    }

    // 4. Check GitHub
    const ghToken = localStorage.getItem('gh_token');
    const ghRepo = localStorage.getItem('gh_repo');
    if(ghToken && ghRepo) {
        setGhConfig({
            token: ghToken,
            owner: localStorage.getItem('gh_owner') || '',
            repo: ghRepo,
            branch: localStorage.getItem('gh_branch') || 'main'
        });
        setGithubStatus('Connected');
    }
  }, []);

  // --- MODE SWITCHING ---
  const handleModeSwitch = (mode: DbMode) => {
      if (mode === 'drive' && googleStatus !== 'Connected') {
          warning("Drive Not Connected", "Please connect Google Drive first.");
          return;
      }
      if (mode === 'supabase' && supabaseStatus !== 'Connected') {
          warning("Supabase Not Connected", "Please enter Supabase credentials first.");
          return;
      }
      if (mode === 'github' && githubStatus !== 'Connected') {
          warning("GitHub Not Connected", "Please configure GitHub repo first.");
          return;
      }
      
      if(confirm(`Are you sure you want to switch database mode to ${mode.toUpperCase()}? The page will reload.`)) {
          db.setMode(mode);
      }
  };

  // --- GITHUB HANDLERS ---
  const handleGithubConnect = async () => {
      if(!ghConfig.token || !ghConfig.owner || !ghConfig.repo) {
          warning("Missing Information", "Please fill all GitHub fields.");
          return;
      }
      setLoading(true);
      const isValid = await validateGitHubConnection(ghConfig.token, ghConfig.owner, ghConfig.repo);
      setLoading(false);

      if(isValid) {
          localStorage.setItem('gh_token', ghConfig.token);
          localStorage.setItem('gh_owner', ghConfig.owner);
          localStorage.setItem('gh_repo', ghConfig.repo);
          localStorage.setItem('gh_branch', ghConfig.branch);
          setGithubStatus('Connected');
          success("Connected", "Linked to GitHub repository.");
      } else {
          setGithubStatus('Error');
          error("Connection Failed", "Invalid credentials or repository not found.");
      }
  };

  const handleGithubDisconnect = () => {
      localStorage.removeItem('gh_token');
      localStorage.removeItem('gh_owner');
      localStorage.removeItem('gh_repo');
      localStorage.removeItem('gh_branch');
      setGhConfig({ token: '', owner: '', repo: '', branch: 'main' });
      setGithubStatus('Disconnected');
      if (activeMode === 'github') db.setMode('local');
      info("Disconnected", "GitHub credentials removed.");
  };

  // --- GOOGLE DRIVE HANDLERS ---
  const handleDriveToken = (token: any) => {
      setGoogleStatus('Connected');
      setLoading(false);
  };

  const handleDriveConnect = async () => {
      if(!driveConfig.clientId || !driveConfig.apiKey) {
          warning("Configuration Missing", "Please enter Client ID and API Key.");
          return;
      }
      setLoading(true);
      localStorage.setItem('g_client_id', driveConfig.clientId);
      localStorage.setItem('g_api_key', driveConfig.apiKey);
      
      try {
        await initGapi();
        await initGis(handleDriveToken);
        signInGoogle();
      } catch (e) {
          console.error(e);
          setLoading(false);
          setGoogleStatus('Error');
          error("Connection Failed", "Could not connect to Google API.");
      }
  };

  const handleInitializeDriveDB = async () => {
      setLoading(true);
      try {
          const structure = await initializeDriveStructure();
          setDriveStructure(structure);
          success("Database Created", "Folder structure created on Drive.");
      } catch (e) {
          console.error(e);
          error("Failed", "Could not create folders.");
      } finally {
          setLoading(false);
      }
  };

  // --- SUPABASE HANDLERS ---
  const handleSupabaseConnect = async () => {
      if(!sbConfig.url || !sbConfig.key) {
          warning("Credentials Missing", "Please enter Project URL and Anon Key.");
          return;
      }
      setLoading(true);
      const result = await checkSupabaseConnection(sbConfig.url, sbConfig.key);
      setLoading(false);

      if(result.success) {
          localStorage.setItem('sb_project_url', sbConfig.url);
          localStorage.setItem('sb_anon_key', sbConfig.key);
          setSupabaseStatus('Connected');
          success("Connected", "Supabase connection established.");
          if(result.message.includes('missing')) info("Table Missing", "Please run the SQL setup script.");
      } else {
          setSupabaseStatus('Error');
          error("Connection Failed", result.message);
      }
  };

  const handleSupabaseDisconnect = () => {
      localStorage.removeItem('sb_project_url');
      localStorage.removeItem('sb_anon_key');
      setSbConfig({ url: '', key: '' });
      setSupabaseStatus('Disconnected');
      if (activeMode === 'supabase') db.setMode('local'); // Fallback
      info("Disconnected", "Supabase credentials removed.");
  };

  // --- GENERIC CONFIG HANDLERS ---
  const openConfigModal = (item: IntegrationItem) => {
      // Load existing values
      const currentVals: Record<string, string> = {};
      item.fields.forEach(f => {
          currentVals[f.key] = localStorage.getItem(`int_${f.key}`) || '';
      });
      setConfigValues(currentVals);
      setSelectedIntegration(item);
  };

  const saveGenericConfig = () => {
      if (!selectedIntegration) return;
      
      let allFilled = true;
      Object.entries(configValues).forEach(([key, val]) => {
          const stringVal = val as string;
          if (!stringVal.trim()) allFilled = false;
          localStorage.setItem(`int_${key}`, stringVal);
      });

      if (allFilled) {
          success("Configuration Saved", `${selectedIntegration.name} settings updated.`);
          // Also set a connection flag for UI
          localStorage.setItem(`conn_${selectedIntegration.id}`, 'true');
      } else {
          // If cleared
          if (Object.values(configValues).every(v => v === '')) {
             info("Configuration Cleared", "Settings removed.");
             localStorage.removeItem(`conn_${selectedIntegration.id}`);
          }
      }
      setSelectedIntegration(null);
  };

  const isGenericConnected = (id: string) => {
      return !!localStorage.getItem(`conn_${id}`);
  };

  const renderIntegrationCard = (item: IntegrationItem) => {
      const connected = isGenericConnected(item.id);
      return (
          <div key={item.id} className="bg-white dark:bg-stone-900 rounded-[2rem] p-6 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-lg transition-all flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${item.color}`}>
                      <item.icon size={28} />
                  </div>
                  {connected ? (
                      <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full border border-green-100 dark:border-green-800">
                          <CheckCircle size={10} /> Active
                      </span>
                  ) : (
                      <span className="text-[10px] uppercase font-bold text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-full">
                          Ready
                      </span>
                  )}
              </div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-white mb-1">{item.name}</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium leading-relaxed mb-6 flex-grow">
                  {item.description}
              </p>
              <button 
                onClick={() => openConfigModal(item)}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    connected 
                    ? 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700' 
                    : 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:scale-[1.02] shadow-lg'
                }`}
              >
                  {connected ? 'Manage Settings' : 'Connect'}
              </button>
          </div>
      );
  };

  return (
    <div className="max-w-7xl mx-auto animate-slide-up pb-20">
      
      {/* Header */}
      <div className="mb-10 space-y-4">
         <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-[11px] font-bold uppercase tracking-widest border border-orange-100 dark:border-orange-800 shadow-sm">
             <Link2 size={12} className="text-amber-600" /> Integrations Marketplace
         </div>
         <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white leading-tight">
            Connect & <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-amber-600">Scale</span>
         </h1>
         <p className="text-sm md:text-base text-stone-500 dark:text-stone-400 font-medium leading-relaxed max-w-2xl">
            Supercharge your spiritual platform with modern tools. Manage your database, connect social media, track analytics, and monetize traffic.
         </p>
      </div>

      {/* --- SECTION 1: CORE DATABASE (Priority) --- */}
      <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-lg"><Database size={20} className="text-stone-600 dark:text-stone-300"/></div>
              <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">Database & Cloud Storage</h2>
          </div>

          {/* Mode Selector */}
          <div className="bg-white dark:bg-stone-900 p-6 rounded-[2rem] shadow-sm border border-stone-200 dark:border-stone-800 mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-4">Select Active Storage Mode</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button onClick={() => handleModeSwitch('local')} className={`p-4 rounded-2xl border-2 text-left transition-all ${activeMode === 'local' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-stone-200 dark:border-stone-800 hover:border-primary-200'}`}>
                      <HardDrive size={24} className="mb-3 text-stone-600 dark:text-stone-300"/>
                      <p className="font-bold text-stone-900 dark:text-white">Demo / Local</p>
                      <p className="text-[10px] text-stone-500">Browser Storage Only</p>
                  </button>
                  <button onClick={() => handleModeSwitch('github')} className={`p-4 rounded-2xl border-2 text-left transition-all ${activeMode === 'github' ? 'border-stone-800 bg-stone-100 dark:bg-stone-800' : 'border-stone-200 dark:border-stone-800 hover:border-stone-400'}`}>
                      <Github size={24} className="mb-3 text-stone-800 dark:text-white"/>
                      <p className="font-bold text-stone-900 dark:text-white">GitHub (CMS)</p>
                      <p className="text-[10px] text-stone-500">Commit JSON to Repo</p>
                  </button>
                  <button onClick={() => handleModeSwitch('supabase')} className={`p-4 rounded-2xl border-2 text-left transition-all ${activeMode === 'supabase' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-stone-200 dark:border-stone-800 hover:border-emerald-200'}`}>
                      <Zap size={24} className="mb-3 text-emerald-600"/>
                      <p className="font-bold text-stone-900 dark:text-white">Supabase</p>
                      <p className="text-[10px] text-stone-500">High-Performance SQL</p>
                  </button>
                  <button onClick={() => handleModeSwitch('drive')} className={`p-4 rounded-2xl border-2 text-left transition-all ${activeMode === 'drive' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-stone-200 dark:border-stone-800 hover:border-blue-200'}`}>
                      <Cloud size={24} className="mb-3 text-blue-600"/>
                      <p className="font-bold text-stone-900 dark:text-white">Google Drive</p>
                      <p className="text-[10px] text-stone-500">Personal Cloud JSON</p>
                  </button>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* GITHUB CONFIG */}
             <div className={`p-8 rounded-[2rem] border transition-all ${githubStatus === 'Connected' ? 'bg-stone-100/50 dark:bg-stone-800/30 border-stone-300 dark:border-stone-700' : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'}`}>
                 <div className="flex justify-between items-start mb-6">
                     <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black"><Github size={24}/></div>
                         <div>
                             <h3 className="font-bold text-lg text-stone-900 dark:text-white">GitHub Repository</h3>
                             <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${githubStatus === 'Connected' ? 'text-stone-800 bg-stone-200' : 'text-stone-400 bg-stone-100'}`}>{githubStatus}</span>
                         </div>
                     </div>
                 </div>
                 {githubStatus !== 'Connected' ? (
                     <div className="space-y-4">
                         <input type="password" className="w-full p-3 rounded-xl border bg-white dark:bg-black border-stone-200 dark:border-stone-700 text-sm" placeholder="Personal Access Token (ghp_...)" value={ghConfig.token} onChange={e => setGhConfig({...ghConfig, token: e.target.value})} />
                         <div className="flex gap-4">
                            <input type="text" className="w-full p-3 rounded-xl border bg-white dark:bg-black border-stone-200 dark:border-stone-700 text-sm" placeholder="Username" value={ghConfig.owner} onChange={e => setGhConfig({...ghConfig, owner: e.target.value})} />
                            <input type="text" className="w-full p-3 rounded-xl border bg-white dark:bg-black border-stone-200 dark:border-stone-700 text-sm" placeholder="Repo Name" value={ghConfig.repo} onChange={e => setGhConfig({...ghConfig, repo: e.target.value})} />
                         </div>
                         <input type="text" className="w-full p-3 rounded-xl border bg-white dark:bg-black border-stone-200 dark:border-stone-700 text-sm" placeholder="Branch (e.g. main)" value={ghConfig.branch} onChange={e => setGhConfig({...ghConfig, branch: e.target.value})} />
                         <button onClick={handleGithubConnect} disabled={loading} className="w-full py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl font-bold text-sm hover:scale-[1.01] transition">Connect</button>
                         <p className="text-[10px] text-stone-400 text-center">Changes will be committed to <code>data/*.json</code> in your repo.</p>
                     </div>
                 ) : (
                     <div className="space-y-4">
                         <div className="p-4 bg-white dark:bg-black/20 rounded-xl border border-stone-200 dark:border-stone-700">
                             <p className="text-xs font-bold text-stone-500 uppercase">Connected To</p>
                             <p className="font-bold text-stone-900 dark:text-white flex items-center gap-2"><GitBranch size={14}/> {ghConfig.owner}/{ghConfig.repo} ({ghConfig.branch})</p>
                         </div>
                         <button onClick={handleGithubDisconnect} className="w-full py-3 border border-red-200 text-red-500 rounded-xl font-bold text-sm hover:bg-red-50 transition">Disconnect</button>
                     </div>
                 )}
             </div>

             {/* SUPABASE CONFIG */}
             <div className={`p-8 rounded-[2rem] border transition-all ${supabaseStatus === 'Connected' ? 'bg-emerald-50/50 dark:bg-emerald-900/5 border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'}`}>
                 <div className="flex justify-between items-start mb-6">
                     <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600"><Zap size={24}/></div>
                         <div>
                             <h3 className="font-bold text-lg text-stone-900 dark:text-white">Supabase</h3>
                             <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${supabaseStatus === 'Connected' ? 'text-emerald-600 bg-emerald-100' : 'text-stone-400 bg-stone-100'}`}>{supabaseStatus}</span>
                         </div>
                     </div>
                 </div>
                 {supabaseStatus !== 'Connected' ? (
                     <div className="space-y-4">
                         <input type="text" className="w-full p-3 rounded-xl border bg-white dark:bg-black border-stone-200 dark:border-stone-700 text-sm" placeholder="Project URL" value={sbConfig.url} onChange={e => setSbConfig({...sbConfig, url: e.target.value})} />
                         <input type="password" className="w-full p-3 rounded-xl border bg-white dark:bg-black border-stone-200 dark:border-stone-700 text-sm" placeholder="Anon Key" value={sbConfig.key} onChange={e => setSbConfig({...sbConfig, key: e.target.value})} />
                         <button onClick={handleSupabaseConnect} disabled={loading} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition">Connect</button>
                     </div>
                 ) : (
                     <button onClick={handleSupabaseDisconnect} className="w-full py-3 border border-red-200 text-red-500 rounded-xl font-bold text-sm hover:bg-red-50 transition">Disconnect</button>
                 )}
             </div>

             {/* DRIVE CONFIG */}
             <div className={`p-8 rounded-[2rem] border transition-all ${googleStatus === 'Connected' ? 'bg-blue-50/50 dark:bg-blue-900/5 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'}`}>
                 <div className="flex justify-between items-start mb-6">
                     <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600"><Cloud size={24}/></div>
                         <div>
                             <h3 className="font-bold text-lg text-stone-900 dark:text-white">Google Drive</h3>
                             <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${googleStatus === 'Connected' ? 'text-blue-600 bg-blue-100' : 'text-stone-400 bg-stone-100'}`}>{googleStatus}</span>
                         </div>
                     </div>
                 </div>
                 {googleStatus !== 'Connected' ? (
                     <div className="space-y-4">
                         <input type="text" className="w-full p-3 rounded-xl border bg-white dark:bg-black border-stone-200 dark:border-stone-700 text-sm" placeholder="Client ID" value={driveConfig.clientId} onChange={e => setDriveConfig({...driveConfig, clientId: e.target.value})} />
                         <input type="password" className="w-full p-3 rounded-xl border bg-white dark:bg-black border-stone-200 dark:border-stone-700 text-sm" placeholder="API Key" value={driveConfig.apiKey} onChange={e => setDriveConfig({...driveConfig, apiKey: e.target.value})} />
                         <button onClick={handleDriveConnect} disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition">Connect</button>
                     </div>
                 ) : (
                     <div className="space-y-4">
                         {!driveStructure && (
                             <button onClick={handleInitializeDriveDB} disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm">Initialize Folders</button>
                         )}
                         <button onClick={signOutGoogle} className="w-full py-3 border border-red-200 text-red-500 rounded-xl font-bold text-sm hover:bg-red-50 transition">Disconnect</button>
                     </div>
                 )}
             </div>
          </div>
      </div>

      {/* --- SECTION 2: SOCIAL MEDIA --- */}
      <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg"><MessageCircle size={20} className="text-pink-600"/></div>
              <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">Social Ecosystem</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {NEW_INTEGRATIONS.filter(i => i.type === 'social').map(renderIntegrationCard)}
          </div>
      </div>

      {/* ... (Rest of the component remains same: Search, Ads, Performance, Modals) ... */}
      {/* Keeping previous code for Search & Analytics, Ads, Performance and Modals */}
      
      {/* --- SECTION 3: SEARCH & ANALYTICS --- */}
      <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg"><BarChart size={20} className="text-orange-600"/></div>
              <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">Search & Analytics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {NEW_INTEGRATIONS.filter(i => i.type === 'analytics').map(renderIntegrationCard)}
          </div>
      </div>

      {/* --- SECTION 4: ADS & REVENUE --- */}
      <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg"><DollarSign size={20} className="text-yellow-600"/></div>
              <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">Ads & Monetization</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {NEW_INTEGRATIONS.filter(i => i.type === 'ads').map(renderIntegrationCard)}
          </div>
      </div>

      {/* --- SECTION 5: PERFORMANCE --- */}
      <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><Server size={20} className="text-purple-600"/></div>
              <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">Performance & Infra</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {NEW_INTEGRATIONS.filter(i => i.type === 'performance').map(renderIntegrationCard)}
          </div>
      </div>

      {/* CONFIGURATION MODAL */}
      {selectedIntegration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm" onClick={() => setSelectedIntegration(null)}></div>
              <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] w-full max-w-md shadow-2xl relative animate-slide-up border border-stone-200 dark:border-stone-800 overflow-hidden">
                  <div className={`h-24 w-full flex items-center justify-center relative bg-gradient-to-br from-stone-100 to-white dark:from-stone-800 dark:to-stone-900`}>
                      <button onClick={() => setSelectedIntegration(null)} className="absolute top-6 right-6 p-2 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"><X size={18}/></button>
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl ${selectedIntegration.color.split(' ')[0]} ${selectedIntegration.color.includes('bg-') ? selectedIntegration.color.split(' ')[1] : ''} scale-125`}>
                          <selectedIntegration.icon size={32} />
                      </div>
                  </div>
                  <div className="p-8">
                      <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white text-center mb-1">Configure {selectedIntegration.name}</h3>
                      <p className="text-center text-sm text-stone-500 mb-8">{selectedIntegration.description}</p>
                      
                      <div className="space-y-5">
                          {selectedIntegration.fields.map(field => (
                              <div key={field.key}>
                                  <label className="block text-xs font-bold uppercase text-stone-400 mb-1.5 ml-1">{field.label}</label>
                                  <input 
                                    type="text" 
                                    className="w-full p-4 rounded-xl bg-stone-50 dark:bg-stone-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-black transition-all outline-none font-medium text-stone-900 dark:text-white placeholder-stone-300"
                                    placeholder={field.placeholder}
                                    value={configValues[field.key] || ''}
                                    onChange={e => setConfigValues({...configValues, [field.key]: e.target.value})}
                                  />
                              </div>
                          ))}
                      </div>

                      <div className="mt-8 flex gap-3">
                          <button onClick={saveGenericConfig} className="flex-1 py-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform shadow-lg flex items-center justify-center gap-2">
                              <Save size={20} /> Save Configuration
                          </button>
                      </div>
                      
                      <div className="mt-6 text-center">
                          <a href="#" className="text-xs font-bold text-primary-600 flex items-center justify-center gap-1 hover:underline">
                              Read Documentation <ExternalLink size={10} />
                          </a>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default Integrations;
