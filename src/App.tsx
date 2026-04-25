/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  MapPin, 
  Clock, 
  Utensils, 
  SquarePlay, 
  DoorOpen, 
  Trash2, 
  Plus, 
  RefreshCcw,
  Sparkles,
  Smartphone,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Minus,
  Search,
  Filter,
  LifeBuoy,
  Armchair,
  Info,
  Activity,
  Shield,
  Accessibility,
  HelpCircle,
  LayoutDashboard,
  Camera,
  Image as ImageIcon,
  X,
  History,
  AlertCircle
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Location, Category, Status } from './types';

// Gemini initialization
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const CATEGORIES: { label: string; value: Category; icon: any }[] = [
  { label: 'Gate', value: 'gate', icon: DoorOpen },
  { label: 'Food', value: 'food', icon: Utensils },
  { label: 'Washroom', value: 'washroom', icon: SquarePlay },
  { label: 'Seating', value: 'seating', icon: Armchair },
  { label: 'Help', value: 'help', icon: LifeBuoy },
];

const STATUS_ORDER: Status[] = ['Low', 'Medium', 'High'];

const timeAgo = (timestamp: number) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
};

export default function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [view, setView] = useState<'fan' | 'admin'>('fan');
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [adminTab, setAdminTab] = useState<'home' | 'gates' | 'food' | 'washrooms' | 'help' | 'zones'>('home');
  const [fanTab, setFanTab] = useState<'home' | 'explore' | 'food' | 'gates' | 'help' | 'updates'>('home');
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');
  const [recommendation, setRecommendation] = useState<string>("");
  const [isGeneratingRec, setIsGeneratingRec] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeZone, setActiveZone] = useState<string | 'all'>('all');

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/locations');
      const data = await res.json();
      setLocations(data);
    } catch (err) {
      console.error("Failed to fetch locations", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    const interval = setInterval(fetchLocations, 10000);
    return () => clearInterval(interval);
  }, []);

  const generateRecommendation = async () => {
    if (locations.length === 0) return;
    setIsGeneratingRec(true);
    try {
      const dataStr = locations.map(l => `${l.name} (${l.category}): ${l.status} queue, ~${l.count} people`).join('\n');
      const result = await ai.getGenerativeModel({
        model: "gemini-2.0-flash",
      }).generateContent(`Based on these live queue conditions, give a 1-sentence recommendation in ${lang === 'EN' ? 'English' : 'Hindi'}. Tell fans exactly where to go for the shortest lines.
      
      Conditions:
      ${dataStr}`);
      
      setRecommendation(result.response.text() || "");
    } catch (err) {
      console.error(err);
      setRecommendation(lang === 'EN' ? "Pro-tip: Head to Gate 1 Main Entry for the fastest access right now!" : "प्रो-टिप: सबसे तेज़ प्रवेश के लिए अभी गेट 1 मुख्य प्रवेश की ओर जाएं!");
    } finally {
      setIsGeneratingRec(false);
    }
  };

  useEffect(() => {
    if (locations.length > 0 && !recommendation) {
      generateRecommendation();
    }
  }, [locations]);

  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesZone = activeZone === 'all' || loc.zone === activeZone;
      let matchesTab = true;
      if (fanTab === 'food') matchesTab = loc.category === 'food' || loc.category === 'washroom';
      else if (fanTab === 'gates') matchesTab = loc.category === 'gate' || loc.category === 'seating';
      else if (fanTab === 'help') matchesTab = loc.category === 'help';
      
      return matchesSearch && matchesZone && matchesTab;
    });
  }, [locations, searchQuery, activeZone, fanTab]);

  const zonesStatus = useMemo(() => {
    const zones = ["North", "South", "East", "West", "Pavilion", "Concourse"];
    return zones.map(z => {
      const zoneLocs = locations.filter(l => l.zone === z);
      const highCount = zoneLocs.filter(l => l.status === 'High').length;
      const mediumCount = zoneLocs.filter(l => l.status === 'Medium').length;
      let status: 'Low' | 'Medium' | 'High' = 'Low';
      if (highCount > 0) status = 'High';
      else if (mediumCount > 1) status = 'Medium';
      return { name: z, status };
    });
  }, [locations]);

  const bestOptions = useMemo(() => {
    return [...locations].sort((a, b) => {
      const statusDiff = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
      if (statusDiff !== 0) return statusDiff;
      return a.count - b.count;
    }).slice(0, 2);
  }, [locations]);

  const t = (en: string, hi: string) => lang === 'EN' ? en : hi;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111] font-sans selection:bg-orange-100 selection:text-orange-900 pb-24">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5 px-4 md:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setView('fan'); setFanTab('home'); }}>
            <div className="w-10 h-10 md:w-11 md:h-11 bg-orange-600 rounded-[14px] flex items-center justify-center text-white shadow-xl shadow-orange-100 italic font-black text-xl">
              Q
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg md:text-xl leading-tight tracking-tight">{t('Stadium Assistant', 'स्टेडियम सहायक')}</h1>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-30">{t('Live Event Feed', 'लाइव इवेंट फीड')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <button 
              onClick={() => setLang(lang === 'EN' ? 'HI' : 'EN')}
              className="bg-black/5 text-black px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest"
            >
              {lang}
            </button>
            <div className="flex bg-gray-100 p-1 rounded-xl border border-black/5">
              <button 
                onClick={() => {
                  if (view === 'admin') {
                    setView('fan');
                  } else {
                    setShowPinEntry(true);
                  }
                }}
                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${view === 'admin' ? 'bg-black text-white shadow-lg' : 'bg-white text-black shadow-sm border border-black/5 border-dashed hover:bg-gray-50'}`}
              >
                {view === 'admin' ? t('Exit Admin', 'एडमिन से बाहर निकलें') : t('Admin Access', 'एडमिन एक्सेस')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <AnimatePresence mode="wait">
          {showPinEntry && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl space-y-8"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mx-auto">
                    <Shield size={32} />
                  </div>
                  <h3 className="font-black text-2xl uppercase tracking-tight">{t('Staff Only', 'केवल कर्मचारी')}</h3>
                  <p className="text-xs font-bold text-black/40 uppercase tracking-widest">{t('Enter PIN to access controls', 'नियंत्रण तक पहुंचने के लिए पिन दर्ज करें')}</p>
                </div>
                
                <div className="space-y-4">
                  <input 
                    type="password"
                    placeholder="••••"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full bg-gray-50 border border-black/5 rounded-2xl py-5 text-center text-3xl tracking-[0.5em] font-black focus:outline-none focus:ring-4 focus:ring-orange-600/5 transition-all"
                  />
                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        if (adminPin === "1234") {
                          setIsAdminAuth(true);
                          setView('admin');
                          setShowPinEntry(false);
                          setAdminPin("");
                        } else {
                          alert(t('Incorrect PIN', 'गलत पिन'));
                        }
                      }}
                      className="flex-1 bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                    >
                      {t('Confirm', 'पुष्टि करें')}
                    </button>
                    <button 
                      onClick={() => setShowPinEntry(false)}
                      className="px-6 border border-black/5 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                    >
                      {t('Cancel', 'रद्द करें')}
                    </button>
                  </div>
                </div>
                <p className="text-center text-[10px] font-bold text-black/20 uppercase tracking-[0.2em]">Demo PIN: 1234</p>
              </motion.div>
            </motion.div>
          )}

          {view === 'fan' ? (
            <motion.div 
              key="fan"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10"
            >
              {fanTab === 'home' && (
                <div className="space-y-12">
                  <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { label: t('Find Gate', 'गेट ढूंढें'), icon: DoorOpen, tab: 'gates' as const },
                      { label: t('Food & Snacks', 'भोजन और स्नैक्स'), icon: Utensils, tab: 'food' as const },
                      { label: t('Washrooms', 'शौचालय'), icon: SquarePlay, tab: 'food' as const },
                      { label: t('Need Help', 'मदद चाहिए'), icon: LifeBuoy, tab: 'help' as const },
                      { label: t('ADA Routes', 'सुगम मार्ग'), icon: Accessibility, tab: 'help' as const },
                    ].map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setFanTab(s.tab)}
                        className="bg-white border border-black/5 p-4 rounded-2xl flex flex-col items-center gap-3 transition-all hover:border-orange-600/30 hover:bg-orange-50/30 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-black/40 group-hover:bg-black group-hover:text-white transition-all text-xs">
                          <s.icon size={18} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">{s.label}</span>
                      </button>
                    ))}
                  </section>

                  <section className="bg-orange-600 text-white p-6 rounded-[24px] shadow-xl shadow-orange-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                      <Sparkles size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">{t('Live Assistant', 'लाइव सहायक')}</p>
                      <p className="font-bold text-sm md:text-base leading-snug">{recommendation || t("Scanning crowd levels...", "भीड़ के स्तर को स्कैन कर रहा है...")}</p>
                    </div>
                    <button onClick={generateRecommendation} className="p-2 hover:bg-white/10 rounded-lg">
                       <RefreshCcw size={16} className={isGeneratingRec ? 'animate-spin' : ''} />
                    </button>
                  </section>

                  <section className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                       <div className="space-y-1">
                          <h2 className="font-black text-xs uppercase tracking-[0.3em] text-slate-400">{t('Real-Time Stadium Telemetry', 'रियल-टाइम स्टेडियम टेलीमेट्री')}</h2>
                       </div>
                       <div className="flex gap-6">
                          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> {t('Heavy', 'भारी')}
                          </div>
                          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" /> {t('Buffer', 'बफर')}
                          </div>
                          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> {t('Clear', 'साफ')}
                          </div>
                       </div>
                    </div>

                    <div className="relative mx-auto w-full max-w-2xl group">
                       <div className="bg-white border border-slate-200/60 rounded-[48px] p-12 md:p-16 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                          <div className="relative w-full aspect-[2/1] border-[1px] border-slate-100 rounded-full flex items-center justify-center">
                             <div className="absolute inset-[30%] border border-slate-100 border-dashed rounded-full flex items-center justify-center bg-emerald-50/20">
                                <div className="text-center font-black uppercase tracking-[0.4em] text-emerald-800/20 text-[8px]">{t('Main Field', 'मुख्य क्षेत्र')}</div>
                             </div>
                             {zonesStatus.map(z => {
                               const pos = { North: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2", South: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2", East: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2", West: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2", Pavilion: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", Concourse: "bottom-[15%] right-[15%]" }[z.name];
                               const statusColorClass = z.status === 'High' ? 'bg-red-500' : z.status === 'Medium' ? 'bg-amber-400' : 'bg-emerald-500';
                               return (
                                 <button key={z.name} onClick={() => { setActiveZone(z.name); setFanTab('explore'); }} className={`absolute ${pos} group/node transition-all hover:scale-110 active:scale-95 z-30`}>
                                   <div className={`relative w-12 h-12 md:w-16 md:h-16 rounded-full bg-white border-4 md:border-8 border-white shadow-2xl flex items-center justify-center group-hover/node:bg-slate-900 transition-colors`}>
                                      <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${statusColorClass} shadow-lg`} />
                                      <div className="absolute top-full mt-4 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest opacity-0 group-hover/node:opacity-100 transition-opacity whitespace-nowrap shadow-xl">{t(z.name, z.name)}</div>
                                   </div>
                                 </button>
                               );
                             })}
                          </div>
                       </div>
                    </div>
                  </section>

                  <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="bg-white border border-black/5 p-6 rounded-3xl flex items-center gap-6 group hover:border-orange-500/30 transition-all cursor-pointer" onClick={() => setFanTab('help')}>
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600"><Activity size={24} /></div>
                        <div>
                          <h3 className="font-bold text-base">{t('Medical Support', 'चिकित्सा सहायता')}</h3>
                          <p className="text-xs text-black/40">{t('First Aid & SOS Assistance', 'प्राथमिक चिकित्सा और एसओएस सहायता')}</p>
                        </div>
                     </div>
                     <div className="bg-white border border-black/5 p-6 rounded-3xl flex items-center gap-6 group hover:border-orange-500/30 transition-all cursor-pointer" onClick={() => setFanTab('help')}>
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600"><Shield size={24} /></div>
                        <div>
                          <h3 className="font-bold text-base">{t('Security & Info', 'सुरक्षा और जानकारी')}</h3>
                          <p className="text-xs text-black/40">{t('Safety desks and lost property', 'सुरक्षा डेस्क और खोई हुई संपत्ति')}</p>
                        </div>
                     </div>
                  </section>
                </div>
              )}

              {fanTab !== 'home' && fanTab !== 'updates' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <h2 className="font-black text-3xl tracking-tight uppercase">
                        {fanTab === 'explore' && t('Explore Venue', 'वेन्यू देखें')}
                        {fanTab === 'food' && t('Food & Washroom', 'भोजन और शौचालय')}
                        {fanTab === 'gates' && t('Gates & Seating', 'गेट और बैठने की जगह')}
                        {fanTab === 'help' && t('Help & Access', 'मदद और पहुंच')}
                      </h2>
                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={16} />
                        <input type="text" placeholder={t('Search...', 'खोजें...')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-black/5 rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:outline-none transition-all" />
                      </div>
                   </div>
                   <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                      <button onClick={() => setActiveZone('all')} className={`flex-shrink-0 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeZone === 'all' ? 'bg-black text-white' : 'bg-white border border-black/5 text-black/40'}`}>{t('All Zones', 'सभी ज़ोन')}</button>
                      {["North", "South", "East", "West", "Pavilion", "Concourse"].map(z => (
                        <button key={z} onClick={() => setActiveZone(z)} className={`flex-shrink-0 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeZone === z ? 'bg-black text-white' : 'bg-white border border-black/5 text-black/40'}`}>{t(z, z)}</button>
                      ))}
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredLocations.map(loc => <LocationSmallCard key={loc.id} location={loc} t={t} />)}
                   </div>
                </div>
              )}

              {fanTab === 'updates' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                   <h2 className="font-black text-3xl tracking-tight uppercase flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" /> {t('Live Feed', 'लाइव फीड')}</h2>
                   <div className="space-y-6">
                      {bestOptions.map(loc => <BestOptionCard key={loc.id} location={loc} t={t} />)}
                   </div>
                </div>
              )}
            </motion.div>
          ) : (
            <AdminView locations={locations} onUpdate={fetchLocations} t={t} activeTab={adminTab} setActiveTab={setAdminTab} />
          )}
        </AnimatePresence>
      </main>

      {view === 'fan' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-2xl border border-black/5 px-6 py-4 rounded-[32px] shadow-2xl flex items-center gap-8 md:gap-12 z-50">
           {[ { id: 'home', icon: LayoutDashboard, label: t('Home', 'होम') }, { id: 'explore', icon: MapPin, label: t('Explore', 'एक्सप्लोर') }, { id: 'food', icon: Utensils, label: t('Food', 'भोजन') }, { id: 'gates', icon: DoorOpen, label: t('Gates', 'गेट') }, { id: 'help', icon: LifeBuoy, label: t('Help', 'मदद') }, { id: 'updates', icon: Sparkles, label: t('Live', 'लाइव') } ].map(tab => (
             <button key={tab.id} onClick={() => setFanTab(tab.id as any)} className={`flex flex-col items-center gap-1.5 transition-all ${fanTab === tab.id ? 'text-orange-600 scale-110' : 'text-black/30 hover:text-black/50'}`}>
                <tab.icon size={20} />
                <span className="text-[9px] font-black uppercase tracking-[0.1em]">{tab.label}</span>
             </button>
           ))}
        </div>
      )}
    </div>
  );
}

function AdminView({ locations, onUpdate, t, activeTab, setActiveTab }: { locations: Location[]; onUpdate: () => void; t: (en: string, hi: string) => string; activeTab: string; setActiveTab: (t: any) => void; }) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [editingLoc, setEditingLoc] = useState<Partial<Location> & { imageUrl?: string; notes?: string } | null>(null);

  const filteredLocations = useMemo(() => {
    if (activeTab === 'home') return locations;
    return locations.filter(l => {
      if (activeTab === 'gates') return l.category === 'gate' || l.category === 'seating';
      if (activeTab === 'food') return l.category === 'food';
      if (activeTab === 'washrooms') return l.category === 'washroom';
      if (activeTab === 'help') return l.category === 'help';
      return true;
    });
  }, [locations, activeTab]);

  const handleUpdate = async (id: string, updates: Partial<Location>) => {
    setIsUpdating(id);
    try {
      const loc = locations.find(l => l.id === id);
      if (!loc) return;
      await fetch('/api/locations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...loc, ...updates, updatedAt: Date.now() }) });
      onUpdate();
    } finally { setIsUpdating(null); }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const submitNew = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingLoc?.name || !editingLoc?.category || !editingLoc?.zone) return;
    await fetch('/api/locations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...editingLoc, status: editingLoc.status || 'Low', count: editingLoc.count || 0, updatedAt: Date.now() }) });
    setEditingLoc(null);
    onUpdate();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-black text-5xl tracking-tighter italic text-slate-900">{t('Ground Control', 'ग्राउंड कंट्रोल')}</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">{t('Live Operations Dashboard', 'लाइव ऑपरेशंस डैशबोर्ड')}</p>
        </div>
        <button onClick={() => setEditingLoc({})} className="bg-orange-600 text-white px-10 py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95"><Plus size={20} strokeWidth={4} /> {t('Add Node', 'नोड जोड़ें')}</button>
      </header>

      <div className="flex bg-white border border-slate-200/60 p-3 rounded-[32px] overflow-x-auto no-scrollbar gap-2 shadow-sm">
        {[ { id: 'home', label: t('Inventory', 'इन्वेंट्री'), icon: LayoutDashboard }, { id: 'gates', label: t('Gates', 'गेट'), icon: DoorOpen }, { id: 'food', label: t('Sustenance', 'भोजन'), icon: Utensils }, { id: 'washrooms', label: t('Hygiene', 'स्वच्छता'), icon: SquarePlay }, { id: 'help', label: t('Response', 'प्रतिक्रिया'), icon: LifeBuoy } ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-4 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border border-transparent whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {editingLoc && (
        <form onSubmit={submitNew} className="bg-[#111] text-white p-12 rounded-[56px] space-y-12 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="flex justify-between items-start"><div><h3 className="font-black text-3xl uppercase italic">{t('Node Registration', 'नोड पंजीकरण')}</h3></div><button type="button" onClick={() => setEditingLoc(null)} className="p-4 bg-white/5 rounded-full"><X size={24} /></button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
            <div className="space-y-4"><label className="text-[11px] uppercase font-black tracking-widest text-white/30">{t('Identity', 'पहचान')}</label><input required className="w-full bg-white/5 border border-white/10 rounded-[24px] px-8 py-5 text-base font-bold outline-none" placeholder={t('e.g. West Stand Exit 4', 'जैसे कि पश्चिम स्टैंड निकास 4')} onChange={e => setEditingLoc({...editingLoc, name: e.target.value})} /></div>
            <div className="space-y-4"><label className="text-[11px] uppercase font-black tracking-widest text-white/30">{t('Classification', 'वर्गीकरण')}</label><select required className="w-full bg-white/5 border border-white/10 rounded-[24px] px-8 py-5 text-base font-bold outline-none appearance-none cursor-pointer" onChange={e => setEditingLoc({...editingLoc, category: e.target.value as any})}><option value="" disabled selected>{t('Type', 'प्रकार')}</option>{CATEGORIES.map(c => <option key={c.value} value={c.value} className="bg-[#111]">{c.label}</option>)}</select></div>
            <div className="space-y-4"><label className="text-[11px] uppercase font-black tracking-widest text-white/30">{t('Zone Protocol', 'ज़ोन प्रोटोकॉल')}</label><select required className="w-full bg-white/5 border border-white/10 rounded-[24px] px-8 py-5 text-base font-bold outline-none appearance-none cursor-pointer" onChange={e => setEditingLoc({...editingLoc, zone: e.target.value as any})}><option value="" disabled selected>{t('Sector', 'सेक्टर')}</option>{["North", "South", "East", "West", "Pavilion", "Concourse"].map(z => <option key={z} value={z} className="bg-[#111]">{z}</option>)}</select></div>
            <div className="space-y-4"><label className="text-[11px] uppercase font-black tracking-widest text-white/30">{t('Visual Evidence', 'दृश्य साक्ष्य')}</label><div className="flex gap-6"><label className="flex-1 cursor-pointer h-[60px] bg-white/5 border border-white/10 border-dashed rounded-[24px] px-8 flex items-center justify-center gap-4 hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest"><Camera size={24} /> {editingLoc.imageUrl ? t('Proof Attached', 'प्रमाण संलग्न') : t('Capture / Upload', 'कैप्चर / अपलोड')}<input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => setEditingLoc({...editingLoc, imageUrl: url}))} /></label></div></div>
          </div>
          <button className="w-full bg-orange-600 text-white py-8 rounded-[32px] font-black text-sm uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-6 transition-all hover:scale-[1.02] active:scale-[0.98]"><Activity size={24} strokeWidth={4} /> {t('Activate Monitoring Node', 'मॉनिटरिंग नोड सक्रिय करें')}</button>
        </form>
      )}

      <div className="space-y-10">
        {filteredLocations.map(loc => (
          <div key={loc.id} className="bg-white border border-slate-200/60 p-10 rounded-[56px] flex flex-col lg:flex-row lg:items-start justify-between gap-12 group hover:shadow-xl transition-all">
             <div className="flex-1 flex flex-col sm:flex-row gap-10">
                <div className="w-32 h-32 rounded-[32px] bg-slate-50 flex items-center justify-center relative overflow-hidden shadow-inner shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-all duration-700">
                   {loc.imageUrl ? <img src={loc.imageUrl} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center gap-2 opacity-20 group-hover:opacity-100 transition-opacity">{loc.category === 'food' && <Utensils size={40} />}{loc.category === 'washroom' && <SquarePlay size={40} />}{loc.category === 'gate' && <DoorOpen size={40} />}{loc.category === 'seating' && <Armchair size={40} />}{loc.category === 'help' && <LifeBuoy size={40} />}</div>}
                </div>
                <div className="space-y-8 flex-1">
                  <div>
                    <h4 className="font-black text-3xl tracking-tighter uppercase italic group-hover:text-orange-600 transition-colors">{loc.name}</h4>
                    <div className="flex items-center gap-4 text-[10px] uppercase font-black tracking-widest text-slate-300"><span className="border border-slate-100 px-3 py-1 rounded-lg">{loc.zone}</span><span className="bg-slate-50 px-3 py-1 rounded-lg">{loc.category}</span><span className="flex items-center gap-2 italic"><History size={12} /> {timeAgo(loc.updatedAt)}</span></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-slate-50 p-6 rounded-3xl space-y-4 border border-slate-100 focus-within:bg-white focus-within:border-orange-200 transition-all"><label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-2 italic"><Activity size={12} /> {t('Ops Intelligence', 'ऑप्स इंटेलिजेंस')}</label><textarea rows={1} defaultValue={loc.notes} placeholder={t('Add notes...', 'नोट्स जोड़ें...')} onBlur={(e) => handleUpdate(loc.id, { notes: e.target.value })} className="w-full bg-transparent text-sm font-semibold outline-none resize-none" /></div>
                     <div className="flex flex-col justify-center gap-4"><label className="cursor-pointer flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-600 transition-all ml-2"><Camera size={18} /> {loc.imageUrl ? t('Replace Proof', 'प्रमाण बदलें') : t('Capture Intel', 'इंटेल कैप्चर करें')}<input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => handleUpdate(loc.id, { imageUrl: url }))} /></label></div>
                  </div>
                </div>
             </div>
             <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-6 min-w-[300px]">
                <div className="flex bg-slate-100 p-2 rounded-[28px] w-full border border-slate-200">
                  {STATUS_ORDER.map(s => (
                    <button key={s} disabled={isUpdating === loc.id} onClick={() => handleUpdate(loc.id, { status: s })} className={`flex-1 py-4 px-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${loc.status === s ? (s === 'Low' ? 'bg-emerald-500' : s === 'Medium' ? 'bg-amber-400' : 'bg-red-500') + ' text-white shadow-xl' : 'text-slate-400 hover:bg-slate-200'}`}>{s}</button>
                  ))}
                </div>
                <div className="flex h-[72px] items-center bg-white border border-slate-200 rounded-[28px] p-2 w-full justify-between shadow-sm">
                   <button disabled={isUpdating === loc.id} onClick={() => handleUpdate(loc.id, { count: Math.max(0, loc.count - 5) })} className="w-14 h-full flex items-center justify-center hover:bg-slate-50 rounded-2xl text-slate-300 hover:text-slate-900 transition-all"><Minus size={24} strokeWidth={3} /></button>
                   <div className="flex flex-col items-center flex-1"><span className="text-2xl font-black tabular-nums italic">{loc.count}</span><span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{t('Density', 'घनत्व')}</span></div>
                   <button disabled={isUpdating === loc.id} onClick={() => handleUpdate(loc.id, { count: loc.count + 5 })} className="w-14 h-full flex items-center justify-center hover:bg-slate-50 rounded-2xl text-slate-300 hover:text-slate-900 transition-all"><Plus size={24} strokeWidth={3} /></button>
                </div>
                <div className="w-full text-center py-2"><button onClick={() => handleUpdate(loc.id, { imageUrl: "" })} className="text-[10px] font-black uppercase text-red-400 hover:text-red-600 transition-all italic opacity-0 group-hover:opacity-100">{t('Clear Visuals', 'दृश्य हटा दें')}</button></div>
             </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

const BestOptionCard: React.FC<{ location: Location; t: (en: string, hi: string) => string }> = ({ location, t }) => (
  <motion.div whileHover={{ y: -8 }} className="bg-[#111] text-white rounded-[40px] p-8 md:p-10 relative overflow-hidden group shadow-2xl">
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-12">
        <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/5 shadow-2xl group-hover:scale-110 transition-transform">
          {location.category === 'food' && <Utensils size={32} />}{location.category === 'washroom' && <SquarePlay size={32} />}{location.category === 'gate' && <DoorOpen size={32} />}{location.category === 'seating' && <Armchair size={32} />}{location.category === 'help' && <LifeBuoy size={32} />}
        </div>
        <div className="bg-orange-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{t('Peak Efficiency', 'पीक दक्षता')}</div>
      </div>
      <h3 className="font-black text-3xl md:text-4xl tracking-tighter mb-4 group-hover:text-orange-500 transition-colors uppercase italic">{location.name}</h3>
      <p className="text-white/60 text-sm font-medium italic mb-8">"{location.notes || t('Flow is stable at this node.', 'इस नोड पर प्रवाह स्थिर है।')}"</p>
      <div className="flex items-center gap-4"><div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest ${location.status === 'Low' ? 'text-emerald-400 bg-emerald-400/10' : location.status === 'Medium' ? 'text-amber-400 bg-amber-400/10' : 'text-red-400 bg-red-400/10'}`}>{t(location.status, location.status)}</div><div className="px-4 py-2 border border-white/10 rounded-xl text-white/40 text-[10px] font-black uppercase tracking-widest">{location.zone} Zone</div></div>
    </div>
  </motion.div>
);

const LocationSmallCard: React.FC<{ location: Location; t: (en: string, hi: string) => string }> = ({ location, t }) => (
  <div className="bg-white border border-slate-200/60 p-6 rounded-[28px] space-y-6 group hover:shadow-xl transition-all duration-500">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300">{location.category === 'food' && <Utensils size={24} />}{location.category === 'washroom' && <SquarePlay size={24} />}{location.category === 'gate' && <DoorOpen size={24} />}{location.category === 'seating' && <Armchair size={24} />}{location.category === 'help' && <LifeBuoy size={24} />}</div>
        <div><h4 className="font-bold text-base tracking-tight leading-tight group-hover:text-orange-600 transition-colors uppercase">{location.name}</h4><p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">{location.zone} • {location.category}</p></div>
      </div>
      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${location.status === 'Low' ? 'text-emerald-600 bg-emerald-600/10' : location.status === 'Medium' ? 'text-amber-600 bg-amber-600/10' : 'text-red-600 bg-red-600/10'}`}>{t(location.status, location.status)}</div>
    </div>
    {location.imageUrl && <div className="aspect-video rounded-2xl overflow-hidden border border-slate-100"><img src={location.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" /></div>}
    {location.notes && !location.imageUrl && <p className="text-xs font-medium text-slate-400 italic">"{location.notes}"</p>}
    <div className="flex items-center justify-between pt-4 border-t border-slate-50"><div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-300"><Users size={14} /> {location.count} <History size={12} className="ml-2" /> {timeAgo(location.updatedAt)}</div><ChevronRight size={16} className="text-slate-200 group-hover:text-orange-600 transition-transform group-hover:translate-x-1" /></div>
  </div>
);
