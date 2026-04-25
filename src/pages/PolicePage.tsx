import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, MapPin, CheckCircle2, Siren, ShieldAlert, Crosshair, Navigation, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Incident } from '../types';

export default function PolicePage() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [unitId] = useState('LEO-UNIT-1');

  const fetchIncidents = () => {
    fetch('/api/incidents')
      .then(res => res.json())
      .then(data => {
        // Police see escalated incidents and incidents they accepted/resolved
        setIncidents(data.filter((i: Incident) => 
          i.status === 'escalated_to_police' || 
          i.assignedTo === unitId || 
          (i.status === 'resolved' && (i.assignedTo === unitId || i.status === 'escalated_to_police')) // Simplification for demo
        ));
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

  const escalations = incidents.filter(i => i.status === 'escalated_to_police');
  const myAssignments = incidents.filter(i => i.assignedTo === unitId && i.status !== 'resolved');
  const resolved = incidents.filter(i => i.status === 'resolved' && i.assignedTo === unitId).sort((a,b) => b.updatedAt - a.updatedAt);
  
  const activeCount = escalations.length + myAssignments.length;

  return (
    <div className="min-h-screen bg-black text-red-50 flex flex-col font-mono selection:bg-red-500/30">
      <div className="bg-red-950/50 px-4 py-4 md:px-6 flex flex-col md:flex-row md:items-center justify-between shadow-[0_4px_30px_rgba(220,38,38,0.2)] border-b border-red-500/30 sticky top-0 z-50 backdrop-blur-md gap-4">
         <div className="flex items-center">
           <button onClick={() => navigate('/')} className="w-10 h-10 bg-red-900/50 rounded-lg flex items-center justify-center text-red-400 mr-4 hover:bg-red-800 transition-colors border border-red-500/30 shrink-0">
              <ArrowLeft size={20} />
           </button>
           <div>
              <h1 className="text-xl font-black tracking-widest uppercase text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] flex items-center gap-2">
                <Siren size={20} className="animate-pulse" /> LAW ENFORCEMENT DISPATCH
              </h1>
              <p className="text-[10px] uppercase font-bold text-red-400/80 tracking-[0.3em]">Critical Escalation Network • ID: {unitId}</p>
           </div>
         </div>
         
         <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
           <div className="bg-[#0a0000] border border-red-900/50 px-4 py-2 rounded-lg flex flex-col min-w-[80px]">
             <span className="text-[8px] uppercase tracking-widest text-red-500">Total Escal.</span>
             <span className="text-red-100 font-bold">{escalations.length}</span>
           </div>
           <div className="bg-[#0a0000] border border-red-900/50 px-4 py-2 rounded-lg flex flex-col min-w-[80px]">
             <span className="text-[8px] uppercase tracking-widest text-red-400">Mine Active</span>
             <span className="text-red-200 font-bold">{myAssignments.length}</span>
           </div>
           <div className="bg-[#0a0000] border border-red-900/50 px-4 py-2 rounded-lg flex flex-col min-w-[80px]">
             <span className="text-[8px] uppercase tracking-widest text-emerald-500">Resolved</span>
             <span className="text-emerald-100 font-bold">{resolved.length}</span>
           </div>
         </div>
      </div>

      <div className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-8 flex flex-col gap-6">
          {activeCount === 0 ? (
            <div className="text-center py-24 bg-red-950/20 border-2 border-red-900/30 border-dashed rounded-[32px] mt-10 flex flex-col items-center justify-center">
              <ShieldAlert size={64} className="text-red-900/50 mb-6" />
              <p className="text-sm font-black uppercase tracking-[0.3em] text-red-800">10-4 • All Clear</p>
              <p className="text-[10px] uppercase tracking-widest text-red-950 mt-2">No active escalations</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
               <div className="flex items-center justify-between border-b border-red-900/50 pb-2">
                 <h2 className="text-xs font-black uppercase tracking-[0.2em] text-red-500 flex items-center gap-2">
                   <Crosshair size={14} className="animate-pulse"/> Active Priorities
                 </h2>
               </div>

               {[...myAssignments, ...escalations].slice(0, 10).map(incident => (
                 <div key={incident.id} className="bg-[#0a0000] border border-red-600/50 rounded-2xl p-6 flex flex-col xl:flex-row gap-8 shadow-[0_0_30px_rgba(220,38,38,0.15)] relative overflow-hidden group">
                   
                   {/* Emergency animated stripe */}
                   <div className="absolute top-0 left-0 w-full h-1 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ef4444_10px,#ef4444_20px)] opacity-50" />
                   
                   <div className="flex-1 space-y-4 pt-2">
                     <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.8)] animate-pulse`}>
                          {(incident.status === 'on_scene' || incident.status === 'en_route') ? incident.status.replace(/_/, ' ') : 'CODE 3 ESCALATION'}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-red-300 tracking-widest flex items-center gap-1 border border-red-900/50 bg-red-950/30 px-2 py-1 rounded">
                          <MapPin size={10} className="text-red-500"/> {incident.customLocation || incident.locationId}
                        </span>
                     </div>
                     
                     <h3 className="font-black text-3xl uppercase tracking-tighter text-white drop-shadow-md">
                       {incident.aiSummary || incident.description || "Critical Disturbance"}
                     </h3>
                     
                     <div className="text-[10px] font-bold tracking-widest uppercase text-red-500/70 mb-2">
                       SOURCE: {incident.reporterRole} | SEV: {incident.severity}
                     </div>

                     {incident.description && !incident.aiSummary && (
                       <p className="text-sm font-medium text-red-200/70 border-l-2 border-red-800 pl-3">"{incident.description}"</p>
                     )}

                     {incident.imageUrl && (
                       <div className="w-full max-w-md aspect-video rounded-lg overflow-hidden border border-red-500/30 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                          <div className="bg-black/80 px-2 py-1 text-[8px] font-black text-red-500 tracking-[0.2em] uppercase">Visual Intel</div>
                          <img src={incident.imageUrl} className="w-full h-full object-cover" />
                       </div>
                     )}
                   </div>

                   <div className="flex flex-col justify-center gap-3 shrink-0 xl:w-56 bg-red-950/20 p-6 rounded-xl border border-red-900/50">
                      <p className="text-[10px] text-center text-red-500 font-bold tracking-widest mb-2 uppercase">Command Actions</p>
                      
                      {incident.status === 'escalated_to_police' && (
                        <button onClick={() => updateStatus(incident.id, 'en_route', unitId)} className="w-full py-4 bg-red-600 text-white rounded-lg text-xs font-black uppercase tracking-[0.2em] hover:bg-white hover:text-red-900 transition-colors shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)]">
                          Dispatch / Accept
                        </button>
                      )}
                      
                      {incident.status === 'en_route' && (
                        <button onClick={() => updateStatus(incident.id, 'on_scene')} className="w-full py-4 bg-amber-500 text-black rounded-lg text-xs font-black uppercase tracking-[0.2em] hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                          Mark On Scene
                        </button>
                      )}

                      {(incident.status === 'on_scene' || incident.status === 'en_route') && (
                        <button onClick={() => updateStatus(incident.id, 'resolved')} className="w-full py-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition-colors">
                          Code 4 (Secure/Resolved)
                        </button>
                      )}
                      
                      <div className="text-center pt-2 mt-2 border-t border-red-900/50 text-[9px] text-red-400 font-bold uppercase tracking-widest">
                         Action limits liability
                      </div>
                   </div>
                 </div>
               ))}
            </div>
          )}
        </div>
        
        {/* Right column: Action Log */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <h2 className="text-xs font-black uppercase tracking-[0.2em] text-red-500 border-b border-red-900/50 pb-2 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500"/> Action Log
           </h2>
           <div className="space-y-4">
              {resolved.slice(0, 10).map(inc => (
                <div key={inc.id} className="bg-[#0a0000] border border-red-900/30 rounded-xl p-4 flex flex-col gap-2 opacity-80">
                   <div className="flex justify-between items-start">
                     <span className="text-[12px] font-bold text-red-300 uppercase leading-snug">{inc.aiSummary || inc.description || "Escalation Closed"}</span>
                     <span className="text-[8px] tracking-widest uppercase text-red-500/50 font-bold bg-red-950 px-1 rounded">{new Date(inc.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                   </div>
                   <div className="flex justify-between mt-2 pt-2 border-t border-red-900/30">
                     <span className="text-[9px] uppercase tracking-widest text-red-400/80 flex items-center gap-1"><MapPin size={10}/> {inc.customLocation || inc.locationId}</span>
                     <span className="text-[9px] uppercase tracking-widest text-emerald-500 font-bold">SECURE</span>
                   </div>
                </div>
              ))}
              {resolved.length === 0 && <div className="text-[10px] font-bold text-red-900 uppercase tracking-widest text-center py-4">No recent resolutions</div>}
           </div>
        </div>
      </div>
    </div>
  );
}
