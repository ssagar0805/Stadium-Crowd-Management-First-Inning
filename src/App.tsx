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
  LayoutDashboard
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
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: `Based on these live queue conditions, give a 1-sentence recommendation in ${lang === 'EN' ? 'English' : 'Hindi'}. Tell fans exactly where to go for the shortest lines.
            
            Conditions:
            ${dataStr}` }]
          }
        ],
        config: {
          systemInstruction: `You are a savvy stadium concierge at a major cricket stadium. Your goal is to help fans save time. Be concise, friendly, and direct. Use 'Pro-tip:' for specific advice. Always respond in ${lang === 'EN' ? 'English' : 'Hindi'}.`,
        }
      });
      setRecommendation(result.text || "");
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

  const helpLocations = useMemo(() => {
    return locations.filter(loc => loc.category === 'help');
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
              {/* Home View */}
              {fanTab === 'home' && (
                <div className="space-y-12">
                  {/* Quick Shortcuts */}
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

                  {/* AI Tip (Minimalist) */}
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

                  {/* Oval Stadium Heatmap */}
                  <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                       <h2 className="font-bold text-xs uppercase tracking-widest text-black/30">{t('Stadium Status Board', 'स्टेडियम स्थिति बोर्ड')}</h2>
                       <div className="flex gap-4">
                          <div className="flex items-center gap-1.5 text-[9px] font-bold opacity-30 uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-red-500" /> {t('Busy', 'व्यस्त')}
                          </div>
                          <div className="flex items-center gap-1.5 text-[9px] font-bold opacity-30 uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-green-500" /> {t('Clear', 'साफ')}
                          </div>
                       </div>
                    </div>

                    <div className="relative mx-auto w-full max-w-lg aspect-[2/1] bg-white border border-black/5 rounded-full p-8 flex items-center justify-center shadow-sm overflow-hidden">
                        {/* Concourse Ring */}
                        <div 
                          className={`absolute inset-2 border-[6px] rounded-full opacity-20 transition-colors ${
                            zonesStatus.find(z => z.name === 'Concourse')?.status === 'High' ? 'border-red-500' :
                            zonesStatus.find(z => z.name === 'Concourse')?.status === 'Medium' ? 'border-orange-400' :
                            'border-green-500'
                          }`}
                        />
                        <button 
                          onClick={() => { setActiveZone('Concourse'); setFanTab('explore'); }}
                          className="absolute bottom-4 right-12 z-20 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-black/5 hover:scale-105 transition-all"
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            zonesStatus.find(z => z.name === 'Concourse')?.status === 'High' ? 'bg-red-500' :
                            zonesStatus.find(z => z.name === 'Concourse')?.status === 'Medium' ? 'bg-orange-400' :
                            'bg-green-500'
                          }`} />
                          <span className="text-[8px] font-black uppercase tracking-widest">{t('Concourse', 'कन्कोर्स')}</span>
                        </button>

                        {/* Inner Pitch */}
                        <div className="absolute inset-12 border-2 border-dashed border-black/5 rounded-full flex items-center justify-center">
                           <span className="text-[10px] font-black uppercase tracking-widest opacity-10">{t('The Pitch', 'पिच')}</span>
                        </div>

                        {/* Zone Buttons */}
                        {zonesStatus.map(z => {
                          const pos = {
                            North: "top-4 left-1/2 -translate-x-1/2",
                            South: "bottom-4 left-1/2 -translate-x-1/2",
                            East: "right-4 top-1/2 -translate-y-1/2",
                            West: "left-4 top-1/2 -translate-y-1/2",
                            Pavilion: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20",
                            Concourse: "bottom-12 left-1/2 -translate-x-1/2 scale-75 opacity-50"
                          }[z.name];

                          const statusColor = {
                            Low: 'bg-green-500',
                            Medium: 'bg-orange-400',
                            High: 'bg-red-500'
                          }[z.status];

                          if (z.name === 'Concourse') return null;

                          return (
                            <button
                              key={z.name}
                              onClick={() => { setActiveZone(z.name); setFanTab('explore'); }}
                              className={`absolute ${pos} flex flex-col items-center gap-1 transition-all hover:scale-110 active:scale-95`}
                            >
                              <div className={`w-10 h-10 rounded-full border-4 border-white shadow-lg ${statusColor}`} />
                              <span className="text-[10px] font-black uppercase tracking-widest">{t(z.name, z.name)}</span>
                            </button>
                          );
                        })}
                    </div>
                  </section>

                  {/* Emergency/Support Cards */}
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="bg-white border border-black/5 p-6 rounded-3xl flex items-center gap-6 group hover:border-orange-500/30 transition-all cursor-pointer" onClick={() => setFanTab('help')}>
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                          <Activity size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-base">{t('Medical Support', 'चिकित्सा सहायता')}</h3>
                          <p className="text-xs text-black/40">{t('First Aid & SOS Assistance', 'प्राथमिक चिकित्सा और एसओएस सहायता')}</p>
                        </div>
                     </div>
                     <div className="bg-white border border-black/5 p-6 rounded-3xl flex items-center gap-6 group hover:border-orange-500/30 transition-all cursor-pointer" onClick={() => setFanTab('help')}>
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                          <Shield size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-base">{t('Security & Info', 'सुरक्षा और जानकारी')}</h3>
                          <p className="text-xs text-black/40">{t('Safety desks and lost property', 'सुरक्षा डेस्क और खोई हुई संपत्ति')}</p>
                        </div>
                     </div>
                  </section>
                </div>
              )}

              {/* Sub-pages / Tabs */}
              {fanTab !== 'home' && fanTab !== 'updates' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <h2 className="font-black text-3xl tracking-tight uppercase">
                          {fanTab === 'explore' && t('Explore Venue', 'वेन्यू देखें')}
                          {fanTab === 'food' && t('Food & Washroom', 'भोजन और शौचालय')}
                          {fanTab === 'gates' && t('Gates & Seating', 'गेट और बैठने की जगह')}
                          {fanTab === 'help' && t('Help & Access', 'मदद और पहुंच')}
                        </h2>
                        <p className="text-xs font-black uppercase tracking-widest text-black/30 mt-1">{t('Live availability updates', 'लाइव उपलब्धता अपडेट')}</p>
                      </div>

                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={16} />
                        <input 
                          type="text" 
                          placeholder={t('Search...', 'खोजें...')}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-white border border-black/5 rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-600/10 transition-all"
                        />
                      </div>
                   </div>

                   <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                      <button 
                         onClick={() => setActiveZone('all')}
                         className={`flex-shrink-0 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeZone === 'all' ? 'bg-black text-white' : 'bg-white border border-black/5 text-black/40'}`}
                      >
                        {t('All Zones', 'सभी ज़ोन')}
                      </button>
                      {["North", "South", "East", "West", "Pavilion", "Concourse"].map(z => (
                        <button 
                          key={z}
                          onClick={() => setActiveZone(z)}
                          className={`flex-shrink-0 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeZone === z ? 'bg-black text-white' : 'bg-white border border-black/5 text-black/40'}`}
                        >
                          {t(z, z)}
                        </button>
                      ))}
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredLocations.length > 0 ? (
                        filteredLocations.map(loc => (
                          <LocationSmallCard key={loc.id} location={loc} t={t} />
                        ))
                      ) : (
                        <div className="col-span-full py-20 text-center space-y-4">
                           <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-black/10">
                              <Search size={32} />
                           </div>
                           <p className="text-sm font-bold text-black/30 uppercase tracking-widest">{t('No matches found in this area', 'इस क्षेत्र में कोई मिलान नहीं मिला')}</p>
                        </div>
                      )}
                   </div>
                </div>
              )}

              {/* Live Updates Tab */}
              {fanTab === 'updates' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                      <h2 className="font-black text-3xl tracking-tight uppercase">{t('Live Feed', 'लाइव फीड')}</h2>
                   </div>
                   
                   <div className="space-y-6">
                      {bestOptions.map(loc => (
                        <BestOptionCard key={loc.id} location={loc} t={t} />
                      ))}
                      
                      <div className="bg-white border border-black/5 p-8 rounded-[40px] space-y-6">
                         <h3 className="font-bold text-lg uppercase tracking-tight">{t('Recent Reports', 'हाल की रिपोर्ट')}</h3>
                         <div className="space-y-4">
                            {locations.filter(l => l.status === 'High').map(l => (
                              <div key={l.id} className="flex items-center gap-4 p-4 bg-red-50 rounded-2xl border border-red-100">
                                 <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-red-600">
                                    <TrendingUp size={18} />
                                 </div>
                                 <div>
                                    <p className="text-xs font-bold text-red-900 uppercase">High Crowd: {l.name}</p>
                                    <p className="text-[10px] text-red-700/60 font-medium uppercase tracking-widest">Expected Wait: 30+ Minutes</p>
                                 </div>
                              </div>
                            ))}
                            {locations.filter(l => l.status === 'Low').slice(0, 3).map(l => (
                              <div key={l.id} className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border border-green-100">
                                 <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-green-600">
                                    <TrendingDown size={18} />
                                 </div>
                                 <div>
                                    <p className="text-xs font-bold text-green-900 uppercase">Clear Zone: {l.name}</p>
                                    <p className="text-[10px] text-green-700/60 font-medium uppercase tracking-widest">No Waiting Time</p>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
              )}
            </motion.div>
          ) : (
            <AdminView 
              locations={locations} 
              onUpdate={fetchLocations} 
              t={t} 
              activeTab={adminTab}
              setActiveTab={setAdminTab}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Fan Tab Bar */}
      {view === 'fan' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-2xl border border-black/5 px-6 py-4 rounded-[32px] shadow-2xl flex items-center gap-8 md:gap-12 z-50">
           {[
             { id: 'home', icon: LayoutDashboard, label: t('Home', 'होम') },
             { id: 'explore', icon: MapPin, label: t('Explore', 'एक्सप्लोर') },
             { id: 'food', icon: Utensils, label: t('Food', 'भोजन') },
             { id: 'gates', icon: DoorOpen, label: t('Gates', 'गेट') },
             { id: 'help', icon: LifeBuoy, label: t('Help', 'मदद') },
             { id: 'updates', icon: Sparkles, label: t('Live', 'लाइव') },
           ].map(tab => (
             <button
                key={tab.id}
                onClick={() => setFanTab(tab.id as any)}
                className={`flex flex-col items-center gap-1.5 transition-all ${fanTab === tab.id ? 'text-orange-600 scale-110' : 'text-black/30 hover:text-black/50'}`}
             >
                <tab.icon size={20} strokeWidth={fanTab === tab.id ? 2.5 : 2} />
                <span className="text-[9px] font-black uppercase tracking-[0.1em]">{tab.label}</span>
             </button>
           ))}
        </div>
      )}

      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-black/5 text-center mt-12 opacity-50">
        <p className="text-[9px] font-black uppercase tracking-[0.4em]">{t('Elite Stadium Assistant • v2.0', 'एलीट स्टेडियम सहायक • v2.0')}</p>
      </footer>
    </div>
  );
}

const BestOptionCard: React.FC<{ location: Location; t: (en: string, hi: string) => string }> = ({ location, t }) => {
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.01 }}
      className="bg-[#111] text-white rounded-[32px] p-8 relative overflow-hidden group shadow-2xl shadow-gray-900/10"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/20 rounded-full blur-[80px] -mr-24 -mt-24 transition-opacity group-hover:opacity-100 opacity-50" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-10">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
            {location.category === 'food' && <Utensils size={28} />}
            {location.category === 'washroom' && <SquarePlay size={28} />}
            {location.category === 'gate' && <DoorOpen size={28} />}
            {location.category === 'seating' && <Armchair size={28} />}
            {location.category === 'help' && <LifeBuoy size={28} />}
          </div>
          <div className="bg-white/10 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] backdrop-blur-md border border-white/10">
            {t('Speedy Option', 'तेज़ विकल्प')}
          </div>
        </div>
        
        <h3 className="font-black text-2xl tracking-tight mb-2 group-hover:text-orange-500 transition-colors uppercase leading-tight">{location.name}</h3>
        
        <div className="flex items-center gap-4 mt-6">
          <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
            <TrendingDown size={16} />
            {t(location.status, location.status === 'Low' ? 'कम' : location.status === 'Medium' ? 'मध्यम' : 'उच्च')} {t('Traffic', 'ट्रैफिक')}
          </div>
          <div className="w-1 h-1 bg-white/20 rounded-full" />
          <div className="text-white/40 text-sm font-medium uppercase tracking-widest text-[10px]">
            {t(location.category, location.category === 'food' ? 'भोजन' : location.category === 'washroom' ? 'शौचालय' : location.category === 'gate' ? 'गेट' : location.category === 'seating' ? 'सीटिंग' : 'मदद')}
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
        <div className="flex -space-x-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-10 h-10 rounded-full bg-white/10 border-4 border-[#111] flex items-center justify-center backdrop-blur-md transform group-hover:translate-x-1 transition-transform">
              <Users size={14} className="opacity-40" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-40 group-hover:opacity-100 group-hover:text-orange-500 transition-all">
          {t('Go Now', 'अभी जाओ')} <ChevronRight size={16} />
        </div>
      </div>
    </motion.div>
  );
}

const LocationSmallCard: React.FC<{ location: Location; t: (en: string, hi: string) => string }> = ({ location, t }) => {
  const statusColor = {
    Low: 'text-green-600 bg-green-50',
    Medium: 'text-orange-600 bg-orange-50',
    High: 'text-red-600 bg-red-50',
  }[location.status];

  return (
    <div className="bg-white border border-black/5 p-5 rounded-2xl flex items-center justify-between group hover:shadow-xl hover:shadow-gray-200/50 transition-all">
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-black/20 group-hover:bg-black group-hover:text-white transition-all duration-300">
           {location.category === 'food' && <Utensils size={20} />}
           {location.category === 'washroom' && <SquarePlay size={20} />}
           {location.category === 'gate' && <DoorOpen size={20} />}
           {location.category === 'seating' && <Armchair size={20} />}
           {location.category === 'help' && <LifeBuoy size={20} />}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-sm tracking-tight">{location.name}</h4>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-20">{t(location.zone, location.zone === 'North' ? 'उत्तर' : location.zone === 'South' ? 'दक्षिण' : location.zone === 'East' ? 'पूर्व' : location.zone === 'West' ? 'पश्चिम' : location.zone === 'Pavilion' ? 'पवेलियन' : 'कन्कोर्स')}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[9px] px-2.5 py-1 rounded-md font-black uppercase tracking-widest ${statusColor}`}>
              {t(location.status, location.status === 'Low' ? 'कम' : location.status === 'Medium' ? 'मध्यम' : 'उच्च')} {t('Wait', 'प्रतीक्षा')}
            </span>
          </div>
        </div>
      </div>
      <div className="h-2 w-2 rounded-full bg-black/5 group-hover:bg-orange-600 transition-all shadow-sm" />
    </div>
  );
}

function AdminView({ 
  locations, 
  onUpdate, 
  t, 
  activeTab, 
  setActiveTab 
}: { 
  locations: Location[]; 
  onUpdate: () => void; 
  t: (en: string, hi: string) => string;
  activeTab: string;
  setActiveTab: (t: any) => void;
}) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [editingLoc, setEditingLoc] = useState<Partial<Location> & { imageUrl?: string } | null>(null);

  const filteredLocations = useMemo(() => {
    if (activeTab === 'home') return locations;
    if (activeTab === 'gates') return locations.filter(l => l.category === 'gate' || l.category === 'seating');
    if (activeTab === 'food') return locations.filter(l => l.category === 'food');
    if (activeTab === 'washrooms') return locations.filter(l => l.category === 'washroom');
    if (activeTab === 'help') return locations.filter(l => l.category === 'help');
    return locations;
  }, [locations, activeTab]);

  const handleStatusChange = async (id: string, updates: Partial<Location>) => {
    setIsUpdating(id);
    try {
      const loc = locations.find(l => l.id === id);
      if (!loc) return;
      
      await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...loc, ...updates }),
      });
      onUpdate();
    } finally {
      setIsUpdating(null);
    }
  };

  const submitNew = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingLoc?.name || !editingLoc?.category) return;
    
    await fetch('/api/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...editingLoc,
        status: editingLoc.status || 'Low',
        count: editingLoc.count || 0,
      }),
    });
    setEditingLoc(null);
    onUpdate();
  };

  const deleteLocation = async (id: string) => {
    // Note: For a real app we'd have a DELETE endpoint. 
    // Here we'll just skip implementation for the demo hackathon.
  };

  return (
    <motion.div 
      key="admin"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="space-y-12 max-w-4xl mx-auto"
    >
      <div className="flex flex-col gap-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="font-black text-4xl tracking-tight mb-2 italic text-orange-600">{t('Ground Control', 'ग्राउंड कंट्रोल')}</h2>
            <p className="text-sm text-black/40 font-bold uppercase tracking-widest">{t('Staff Management Dashboard', 'कर्मचारी प्रबंधन डैशबोर्ड')}</p>
          </div>
          <button 
            onClick={() => setEditingLoc({})}
            className="bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Plus size={18} strokeWidth={3} />
            {t('Register New Location', 'नया स्थान पंजीकृत करें')}
          </button>
        </header>

        {/* Admin Navigation */}
        <div className="flex bg-white border border-black/5 p-2 rounded-2xl overflow-x-auto no-scrollbar gap-2 shadow-sm">
          {[
            { id: 'home', label: t('All Items', 'सभी आइटम'), icon: LayoutDashboard },
            { id: 'gates', label: t('Gates & Stands', 'गेट और स्टैंड'), icon: DoorOpen },
            { id: 'food', label: t('Food & Snacks', 'भोजन और स्नैक्स'), icon: Utensils },
            { id: 'washrooms', label: t('Washrooms', 'शौचालय'), icon: SquarePlay },
            { id: 'help', label: t('Help & Safety', 'मदद और सुरक्षा'), icon: LifeBuoy },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-transparent whitespace-nowrap ${activeTab === tab.id ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'text-black/40 hover:bg-gray-50'}`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'home' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: t('Active Zones', 'सक्रिय ज़ोन'), value: locations.length, icon: MapPin },
            { label: t('High Congestion', 'अधिक भीड़'), value: locations.filter(l => l.status === 'High').length, icon: TrendingUp },
            { label: t('Clear Flow', 'स्पष्ट प्रवाह'), value: locations.filter(l => l.status === 'Low').length, icon: TrendingDown },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-black/5 p-8 rounded-[32px] flex items-center gap-6 shadow-xl shadow-gray-100/50">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-black/20">
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-black/30 mb-1">{stat.label}</p>
                <p className="text-3xl font-black tracking-tight">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingLoc && (
        <form onSubmit={submitNew} className="bg-[#111] text-white p-10 rounded-[40px] space-y-10 shadow-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/5 rounded-full blur-[100px] -mr-48 -mt-48" />
          
          <div>
            <h3 className="font-black text-2xl tracking-tight mb-2 uppercase">{t('New Zone Registration', 'नया ज़ोन पंजीकरण')}</h3>
            <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">{t('Add new venue monitoring point', 'नया वेन्यू मॉनिटरिंग पॉइंट जोड़ें')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40 ml-1">{t('Location Identification', 'स्थान की पहचान')}</label>
              <input 
                autoFocus
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white/10 focus:border-orange-500/50 transition-all outline-none placeholder:text-white/10"
                placeholder={t('e.g. Pavilion Exit A', 'जैसे कि पवेलियन निकास ए')}
                onChange={e => setEditingLoc({...editingLoc, name: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40 ml-1">{t('Classification', 'वर्गीकरण')}</label>
              <div className="relative">
                <select 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white/10 transition-all outline-none appearance-none cursor-pointer"
                  onChange={e => setEditingLoc({...editingLoc, category: e.target.value as any})}
                >
                  <option value="" disabled selected>{t('Select Type', 'प्रकार चुनें')}</option>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value} className="bg-[#111]">{c.label}</option>)}
                </select>
                <ChevronRight size={16} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-white/20 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40 ml-1">{t('Zone Assignment', 'ज़ोन असाइनमेंट')}</label>
              <div className="relative">
                <select 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white/10 transition-all outline-none appearance-none cursor-pointer"
                  onChange={e => setEditingLoc({...editingLoc, zone: e.target.value as any})}
                >
                  <option value="" disabled selected>{t('Select Zone', 'ज़ोन चुनें')}</option>
                  {["North", "South", "East", "West", "Pavilion", "Concourse"].map(z => <option key={z} value={z} className="bg-[#111]">{t(z, z)}</option>)}
                </select>
                <ChevronRight size={16} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-white/20 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40 ml-1">{t('Visual Evidence (Optional)', 'दृश्य प्रमाण (वैकल्पिक)')}</label>
              <div className="relative">
                <input 
                  type="text"
                  placeholder={t('Image URL...', 'छवि यूआरएल...')}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white/10 focus:border-orange-500/50 transition-all outline-none"
                  onChange={e => setEditingLoc({...editingLoc, imageUrl: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-6 relative z-10">
            <button type="submit" className="flex-1 bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-white/5 hover:scale-[1.02] active:scale-95 transition-all">
              {t('Initialize Zone', 'ज़ोन प्रारंभ करें')}
            </button>
            <button type="button" onClick={() => setEditingLoc(null)} className="px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs border border-white/10 hover:bg-white/5 transition-all">
              {t('Cancel', 'रद्द करें')}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between ml-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">
            {activeTab === 'home' ? t('Complete Stadium Inventory', 'पूर्ण स्टेडियम सूची') : t('Category Specific Update', 'श्रेणी विशिष्ट अपडेट')}
          </h3>
          <div className="h-px bg-black/5 flex-1 mx-8" />
        </div>
        {filteredLocations.length > 0 ? filteredLocations.map(loc => (
          <div key={loc.id} className="bg-white border border-black/5 p-8 rounded-[32px] flex flex-col lg:flex-row lg:items-center justify-between gap-8 hover:border-black/20 transition-all shadow-sm group">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[20px] bg-gray-50 flex items-center justify-center text-black/20 group-hover:bg-black group-hover:text-white transition-all duration-500 relative">
                   {loc.category === 'food' && <Utensils size={28} />}
                   {loc.category === 'washroom' && <SquarePlay size={28} />}
                   {loc.category === 'gate' && <DoorOpen size={28} />}
                   {loc.category === 'seating' && <Armchair size={28} />}
                   {loc.category === 'help' && <LifeBuoy size={28} />}
                </div>
                <div>
                  <h4 className="font-black text-xl tracking-tight mb-1 uppercase">{loc.name}</h4>
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] uppercase font-black tracking-widest opacity-20">{t(loc.category, loc.category === 'food' ? 'भोजन' : loc.category === 'washroom' ? 'शौचालय' : loc.category === 'gate' ? 'गेट' : loc.category === 'seating' ? 'सीटिंग' : 'मदद')}</p>
                    <span className="w-1 h-1 bg-black/10 rounded-full" />
                    <p className="text-[10px] uppercase font-black tracking-widest opacity-20">{t(loc.zone, loc.zone === 'North' ? 'उत्तर' : loc.zone === 'South' ? 'दक्षिण' : loc.zone === 'East' ? 'पूर्व' : loc.zone === 'West' ? 'पश्चिम' : loc.zone === 'Pavilion' ? 'पवेलियन' : 'कन्कोर्स')} {t('Zone', 'ज़ोन')}</p>
                  </div>
                </div>
             </div>

             <div className="flex flex-wrap items-center gap-6">
                {/* Status Switcher */}
                <div className="bg-gray-100 p-1.5 rounded-2xl flex border border-black/[0.03]">
                  {STATUS_ORDER.map(s => (
                    <button
                      key={s}
                      disabled={isUpdating === loc.id}
                      onClick={() => handleStatusChange(loc.id, { status: s })}
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${loc.status === s ? 'bg-white shadow-md text-black' : 'text-black/30 hover:text-black'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Precision Counter */}
                <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl border border-black/[0.03]">
                  <button 
                    onClick={() => handleStatusChange(loc.id, { count: Math.max(0, loc.count - 5) })}
                    className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white transition-all text-black/20 hover:text-black shadow-none hover:shadow-sm"
                  >
                    <Minus size={16} strokeWidth={3} />
                  </button>
                  <div className="w-12 text-center">
                    <span className="text-sm font-black tabular-nums">{loc.count}</span>
                  </div>
                  <button 
                    onClick={() => handleStatusChange(loc.id, { count: loc.count + 5 })}
                    className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white transition-all text-black/20 hover:text-black shadow-none hover:shadow-sm"
                  >
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>

                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-black/5 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer">
                  <Trash2 size={20} />
                </div>
             </div>
          </div>
        )) : (
          <div className="py-24 text-center space-y-4 bg-white border border-black/5 rounded-[40px]">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-black/10">
                <Search size={32} />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">{t('No regions to manage in this category', 'इस श्रेणी में प्रबंधन के लिए कोई क्षेत्र नहीं है')}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function SkeletonCards({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-64 bg-gray-100 rounded-[32px] animate-pulse" />
      ))}
    </>
  );
}
