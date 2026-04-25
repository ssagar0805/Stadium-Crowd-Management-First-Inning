import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, AlertTriangle, MapPin, CheckCircle2, Navigation, Crosshair, Radio, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Incident } from '../types';

export default function SecurityPage() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [unitId] = useState('UNIT-7-ALPHA'); // Tactical unit ID

  const fetchIncidents = () => {
    fetch('/api/incidents')
      .then(res => res.json())
      .then(data => {
        setIncidents(data.filter((i: Incident) => i.type === 'security' || i.type === 'crowd'));
      });
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: string, status: string, assignedTo?: string) => {
    const payload: any = { id, status };
    if (assignedTo) payload.assignedTo = assignedTo;
    
    await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    fetchIncidents();
  };

  const activeIncidents = incidents.filter(i => i.status !== 'resolved' && i.status !== 'escalated_to_police');
  const myIncidents = activeIncidents.filter(i => i.assignedTo === unitId);
  const openIncidents = activeIncidents.filter(i => !i.assignedTo || i.assignedTo !== unitId);
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved' && (i.type === 'security' || i.type === 'crowd')).sort((a,b) => b.updatedAt - a.updatedAt);
  
  const stats = {
    active: activeIncidents.length,
    assignedToMe: myIncidents.length,
    onTheWay: myIncidents.filter(i => i.status === 'en_route').length,
    resolved: resolvedIncidents.length,
    escalated: incidents.filter(i => i.status === 'escalated_to_police' && (i.type === 'security' || i.type === 'crowd')).length
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-mono selection:bg-blue-500/30">
      <div className="bg-slate-900 border-b border-blue-500/20 px-4 py-4 md:px-6 flex items-center shadow-[0_0_30px_rgba(59,130,246,0.1)] sticky top-0 z-50">
         <button onClick={() => navigate('/')} className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-blue-400 mr-4 hover:bg-slate-700 transition-colors border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)] shrink-0">
            <ArrowLeft size={20} />
         </button>
         <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-x-hidden">
           <div>
              <h1 className="text-xl font-black tracking-widest uppercase text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">TACTICAL DISPATCH</h1>
              <p className="text-[10px] uppercase font-bold text-blue-400 tracking-[0.2em] flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"/>
                 UNIT {unitId} ACTIVE
              </p>
           </div>
           
           <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
             <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg flex flex-col min-w-[80px]">
               <span className="text-[8px] uppercase tracking-widest text-slate-400">Active</span>
               <span className="text-white font-bold">{stats.active}</span>
             </div>
             <div className="bg-blue-900/30 border border-blue-800/50 px-3 py-1.5 rounded-lg flex flex-col min-w-[80px]">
               <span className="text-[8px] uppercase tracking-widest text-blue-400">Mine</span>
               <span className="text-white font-bold">{stats.assignedToMe}</span>
             </div>
             <div className="bg-amber-900/30 border border-amber-800/50 px-3 py-1.5 rounded-lg flex flex-col min-w-[80px]">
               <span className="text-[8px] uppercase tracking-widest text-amber-500">En Route</span>
               <span className="text-white font-bold">{stats.onTheWay}</span>
             </div>
             <div className="bg-emerald-900/30 border border-emerald-800/50 px-3 py-1.5 rounded-lg flex flex-col min-w-[80px]">
               <span className="text-[8px] uppercase tracking-widest text-emerald-400">Resolved</span>
               <span className="text-white font-bold">{stats.resolved}</span>
             </div>
             <div className="bg-red-900/30 border border-red-800/50 px-3 py-1.5 rounded-lg flex flex-col min-w-[80px]">
               <span className="text-[8px] uppercase tracking-widest text-red-400">Escalated</span>
               <span className="text-white font-bold">{stats.escalated}</span>
             </div>
           </div>
         </div>
      </div>

      <div className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column - My Active Assignments */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-2 flex items-center gap-2">
             <Crosshair size={14} className="text-blue-500"/> Current Objectives
          </h2>
          {myIncidents.length === 0 ? (
            <div className="border border-slate-800 border-dashed rounded-2xl p-12 text-center bg-slate-900/50">
               <Radio size={32} className="mx-auto text-slate-600 mb-3" />
               <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Awaiting Dispatch Orders</p>
            </div>
          ) : (
            myIncidents.map(incident => (
              <div key={incident.id} className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6 flex flex-col gap-6 shadow-[0_0_20px_rgba(59,130,246,0.05)] relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${incident.status === 'on_scene' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                       <span className={`px-2 py-1 rounded bg-slate-800 text-[10px] font-black uppercase tracking-widest border border-slate-700 flex items-center gap-2`}>
                         <span className={`w-1.5 h-1.5 rounded-full ${incident.status === 'on_scene' ? 'bg-amber-500 animate-pulse' : 'bg-blue-500 animate-pulse'}`} />
                         {incident.status.replace(/_/g, ' ')}
                       </span>
                       <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest bg-slate-950 px-2 py-1 rounded border border-slate-800">
                         ID: {incident.id.slice(0, 8)}
                       </span>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-2xl uppercase tracking-tight text-white mb-1">{incident.aiSummary || incident.description || "Security Incident"}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 uppercase tracking-widest"><MapPin size={12}/> {incident.customLocation || incident.locationId}</p>
                    </div>
                    
                    {incident.description && !incident.aiSummary && (
                      <p className="text-sm text-slate-300 font-sans border-l-2 border-slate-700 pl-3">"{incident.description}"</p>
                    )}

                    {incident.imageUrl && (
                      <div className="w-full max-w-sm aspect-video rounded-lg overflow-hidden border border-slate-700 relative mt-2">
                         <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[8px] font-black tracking-widest uppercase">EVIDENCE_IMG</div>
                         <img src={incident.imageUrl} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 shrink-0 md:w-56 justify-center bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                     {incident.status === 'en_route' && (
                       <button onClick={() => updateStatus(incident.id, 'on_scene')} className="w-full py-4 bg-amber-500/10 text-amber-500 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-amber-500/20 transition-colors border border-amber-500/30">
                         10-97: On Scene
                       </button>
                     )}
                     {incident.status === 'on_scene' && (
                       <React.Fragment>
                         <button onClick={() => updateStatus(incident.id, 'resolved')} className="w-full py-4 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-colors border border-emerald-500/30">
                           Code 4: Clear/Resolved
                         </button>
                         <button onClick={() => updateStatus(incident.id, 'escalated_to_police')} className="w-full py-4 bg-red-500/10 text-red-500 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-red-500/20 transition-colors border border-red-500/30 flex items-center justify-center gap-2">
                           <ShieldAlert size={14} /> 10-33: Request LEO
                         </button>
                       </React.Fragment>
                     )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column - Open Dispatch Queue & Log */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div>
             <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-2 flex items-center gap-2">
               <Navigation size={14} className="text-slate-400"/> Open Incidents
            </h2>
            <div className="space-y-4">
              {openIncidents.length === 0 ? (
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center py-8">Queue Empty</div>
              ) : (
                openIncidents.map(incident => (
                  <div key={incident.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between">
                       <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${incident.severity === 'critical' || incident.severity === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                         SEV: {incident.severity}
                       </span>
                       <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">{incident.customLocation || incident.locationId}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-200 uppercase leading-snug">{incident.aiSummary || "Report"}</h4>
                    <button onClick={() => updateStatus(incident.id, 'en_route', unitId)} className="w-full py-2 bg-slate-800 text-white rounded text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-colors border border-slate-700 hover:border-blue-500 mt-2">
                      Accept / En Route
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-2 flex items-center gap-2">
               <CheckCircle2 size={14} className="text-emerald-500"/> Resolved Log
            </h2>
            <div className="space-y-3">
              {resolvedIncidents.slice(0, 5).map(inc => (
                <div key={inc.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 flex flex-col gap-1 opacity-70">
                   <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-slate-300">{inc.aiSummary || inc.description?.slice(0,30)}</span>
                      <span className="text-[8px] tracking-widest uppercase text-slate-500">{new Date(inc.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                   </div>
                   <span className="text-[8px] uppercase tracking-widest text-emerald-500">By: {inc.assignedTo || 'Unknown'}</span>
                </div>
              ))}
              {resolvedIncidents.length === 0 && <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center py-4">No recent activity</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
