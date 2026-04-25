import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Shield, Smartphone, HardHat, ShieldAlert, Activity, PaintBucket, Radar, Key, Users, ChevronRight, Play, AlertTriangle } from 'lucide-react';
import AttendeePage from './pages/AttendeePage';
import VolunteerPage from './pages/VolunteerPage';
import CommandCenterPage from './pages/CommandCenterPage';
import SecurityPage from './pages/SecurityPage';
import HousekeepingPage from './pages/HousekeepingPage';
import PolicePage from './pages/PolicePage';

function RoleSelection() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ open: 0, critical: 0, resolved: 0 });

  useEffect(() => {
    fetch('/api/incidents')
      .then(r => r.json())
      .then(data => {
        setStats({
          open: data.filter((i: any) => i.status !== 'resolved').length,
          critical: data.filter((i: any) => i.severity === 'critical' && i.status !== 'resolved').length,
          resolved: data.filter((i: any) => i.status === 'resolved').length,
        });
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-blue-900/10 via-slate-900/40 to-transparent pointer-events-none" />
      
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-20 relative z-10 flex flex-col">
        {/* Header / Hero Section */}
        <div className="flex flex-col lg:flex-row gap-16 items-start justify-between mb-20 mt-4">
           <div className="max-w-3xl">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest mb-8 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
               <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" /> Live Telemetry Linked
             </div>
             <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase italic mb-6 leading-[0.9]">
               Stadium<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Command</span>
             </h1>
             <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mb-8">
               A live stadium operations system for crowd monitoring, incident reporting, triage, and field response.
             </p>
             <div className="flex flex-wrap gap-4">
               <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-300"><Play size={14} className="text-blue-400"/> Live Incident Routing</div>
               <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-300"><Activity size={14} className="text-emerald-400"/> AI Triage</div>
               <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-300"><Activity size={14} className="text-amber-400"/> Photo Evidence</div>
               <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-300"><ShieldAlert size={14} className="text-red-400"/> Multi-Role Ops</div>
             </div>
           </div>
           
           <div className="hidden lg:flex flex-col gap-6 w-80 shrink-0">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800 pb-2">System Snapshot</h3>
             <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                  <div className="text-3xl font-black text-white">{stats.open}</div>
                  <div className="text-[9px] uppercase tracking-widest text-slate-400 mt-1">Active Reports</div>
               </div>
               <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
                  <div className="text-3xl font-black text-red-500">{stats.critical}</div>
                  <div className="text-[9px] uppercase tracking-widest text-red-400/80 mt-1">High Priority</div>
               </div>
               <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                  <div className="text-3xl font-black text-emerald-400">4</div>
                  <div className="text-[9px] uppercase tracking-widest text-slate-400 mt-1">Depts Online</div>
               </div>
               <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 justify-center items-center flex relative overflow-hidden">
                  <Radar size={80} className="text-blue-500/10 absolute animate-spin-slow" />
                  <div className="text-center relative z-10">
                    <div className="text-2xl font-black text-white italic">6/6</div>
                    <div className="text-[9px] uppercase tracking-widest text-slate-400 mt-1">Zones Locked</div>
                  </div>
               </div>
             </div>
           </div>
        </div>

        {/* Role Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Ground Frontline */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <Users className="text-emerald-400" size={18} />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Ground Frontline</h2>
            </div>
            
            <button onClick={() => navigate('/attendee')} className="w-full group flex items-start text-left bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/30 p-6 rounded-2xl transition-all duration-300">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mr-4 shrink-0 transition-transform group-hover:scale-110">
                <Smartphone size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black uppercase text-white group-hover:text-blue-400 transition-colors tracking-tight">Attendee UI</h3>
                <p className="text-xs font-medium text-slate-400 mt-2 leading-relaxed">Frictionless 10-second hazard reporting for fans in the venue.</p>
              </div>
            </button>

            <button onClick={() => navigate('/volunteer')} className="w-full group flex items-start text-left bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/30 p-6 rounded-2xl transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mr-4 shrink-0 transition-transform group-hover:scale-110">
                <HardHat size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black uppercase text-white group-hover:text-emerald-400 transition-colors tracking-tight">Volunteer Ops</h3>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </div>
                <p className="text-xs font-medium text-slate-400 mt-2 leading-relaxed">Field telemetry console for live crowd counting and routing.</p>
              </div>
            </button>
          </div>

          {/* Central Command */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="text-amber-400" size={18} />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Headquarters</h2>
            </div>
            
            <button onClick={() => navigate('/command')} className="w-full h-[calc(100%-2.5rem)] group flex flex-col text-left bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 hover:border-amber-500/50 p-8 rounded-2xl shadow-xl overflow-hidden relative transition-all duration-300">
                <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-amber-950 mb-6 shrink-0 z-10 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                  <Radar size={32} />
                </div>
                <div className="flex-1 z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-black uppercase italic tracking-tight text-white">Central HQ</h3>
                    <span className="bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase px-2 py-1 rounded border border-amber-500/20">Active</span>
                  </div>
                  <p className="text-sm font-medium text-amber-100/70 leading-relaxed mb-6">The primary dispatch interface. View AI-filtered triage feeds, assign teams, and monitor global stadium telemetry.</p>
                  <div className="flex items-center text-xs font-black tracking-widest uppercase text-amber-500 group-hover:text-white transition-colors">
                    Access Dashboard <ChevronRight size={16} className="ml-1" />
                  </div>
                </div>
            </button>
          </div>

          {/* Tactical Response */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <Key className="text-blue-400" size={18} />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Tactical Response</h2>
            </div>
            
            <button onClick={() => navigate('/security')} className="w-full group flex items-start text-left bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/30 p-6 rounded-2xl transition-all duration-300">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mr-4 shrink-0 transition-transform group-hover:scale-110">
                <Shield size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black uppercase text-white group-hover:text-blue-400 transition-colors tracking-tight">Security</h3>
                <p className="text-xs font-medium text-slate-400 mt-2 leading-relaxed">Respond to altercations, overcrowding, and localized threats.</p>
              </div>
            </button>

            <button onClick={() => navigate('/housekeeping')} className="w-full group flex items-start text-left bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800 hover:border-teal-500/30 p-6 rounded-2xl transition-all duration-300">
              <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400 mr-4 shrink-0 transition-transform group-hover:scale-110">
                <PaintBucket size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black uppercase text-white group-hover:text-teal-400 transition-colors tracking-tight">Housekeeping</h3>
                <p className="text-xs font-medium text-slate-400 mt-2 leading-relaxed">Dedicated board for spill containment and facility maintenance.</p>
              </div>
            </button>
            
            <button onClick={() => navigate('/police')} className="w-full group flex items-start text-left bg-red-950/20 hover:bg-red-900/40 border border-red-900/50 hover:border-red-500/50 p-6 rounded-2xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute left-0 top-0 w-1 h-full bg-red-600 opacity-50 group-hover:opacity-100" />
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 mr-4 shrink-0 transition-transform group-hover:scale-110">
                <ShieldAlert size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black uppercase text-white group-hover:text-red-400 transition-colors tracking-tight">LEO Escalation</h3>
                  <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                </div>
                <p className="text-xs font-medium text-red-400/70 mt-2 leading-relaxed">High-level threat dashboard for police intervention.</p>
              </div>
            </button>
          </div>
          
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/attendee" element={<AttendeePage />} />
        <Route path="/volunteer" element={<VolunteerPage />} />
        <Route path="/command" element={<CommandCenterPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/housekeeping" element={<HousekeepingPage />} />
        <Route path="/police" element={<PolicePage />} />
      </Routes>
    </BrowserRouter>
  );
}

