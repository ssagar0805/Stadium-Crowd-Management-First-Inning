import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, MapPin, CheckCircle2, ClipboardList, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Incident } from '../types';

export default function HousekeepingPage() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [teamId] = useState('HK-TEAM-BETA');

  const fetchIncidents = () => {
    fetch('/api/incidents')
      .then(res => res.json())
      .then(data => {
        setIncidents(data.filter((i: Incident) => i.type === 'housekeeping'));
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

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const myJobs = activeIncidents.filter(i => i.assignedTo === teamId);
  const openJobs = activeIncidents.filter(i => !i.assignedTo || i.assignedTo !== teamId);
  const resolvedJobs = incidents.filter(i => i.status === 'resolved' && i.type === 'housekeeping').sort((a,b) => b.updatedAt - a.updatedAt);
  
  const stats = {
    active: activeIncidents.length,
    myJobs: myJobs.length,
    cleaning: myJobs.filter(i => i.status === 'in_progress').length,
    resolved: resolvedJobs.length
  };

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-slate-900 flex flex-col font-sans">
      <div className="bg-white px-4 py-4 md:px-6 flex flex-col md:flex-row md:items-center justify-between shadow-sm border-b border-stone-200 sticky top-0 z-50 gap-4">
         <div className="flex items-center">
           <button onClick={() => navigate('/')} className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-500 mr-4 hover:bg-stone-200 transition-colors border border-stone-200 shrink-0">
              <ArrowLeft size={20} />
           </button>
           <div>
              <h1 className="text-xl font-black tracking-tight uppercase text-stone-800">HK OPS BOARD</h1>
              <p className="text-[10px] uppercase font-bold text-amber-600 tracking-widest flex items-center gap-2">
                <ClipboardList size={12} /> {teamId} LOGGED IN
              </p>
           </div>
         </div>
         
         <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 md:pb-0">
           <div className="bg-stone-50 border border-stone-200 px-4 py-2 rounded-xl flex flex-col min-w-[70px]">
             <span className="text-[9px] uppercase font-black tracking-widest text-stone-500">Active</span>
             <span className="text-stone-800 font-black">{stats.active}</span>
           </div>
           <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl flex flex-col min-w-[70px]">
             <span className="text-[9px] uppercase font-black tracking-widest text-amber-600">My Jobs</span>
             <span className="text-amber-800 font-black">{stats.myJobs}</span>
           </div>
           <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl flex flex-col min-w-[70px]">
             <span className="text-[9px] uppercase font-black tracking-widest text-blue-600">Cleaning</span>
             <span className="text-blue-800 font-black">{stats.cleaning}</span>
           </div>
           <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl flex flex-col min-w-[70px]">
             <span className="text-[9px] uppercase font-black tracking-widest text-emerald-600">Resolved</span>
             <span className="text-emerald-800 font-black">{stats.resolved}</span>
           </div>
         </div>
      </div>

      <div className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Open Tickets Board */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-stone-400 mb-2 border-b border-stone-200 pb-2">Open Tickets</h2>
          {openJobs.length === 0 ? (
            <div className="text-center py-20 bg-white border border-stone-200 border-dashed rounded-[24px] shadow-sm">
              <Trash2 size={40} className="mx-auto text-stone-300 mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Queue Clean</p>
            </div>
          ) : (
            openJobs.map(incident => (
              <div key={incident.id} className="bg-white border border-stone-200 rounded-[24px] p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-stone-200 group-hover:bg-amber-400 transition-colors"/>
                <div className="flex items-center justify-between pl-2">
                   <div className="flex items-center gap-2">
                     <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${incident.severity === 'high' || incident.severity === 'critical' ? 'bg-red-100 text-red-600' : 'bg-stone-100 text-stone-600'}`}>
                       SEV: {incident.severity}
                     </span>
                     <span className="text-[10px] uppercase font-black text-stone-400 tracking-widest flex items-center gap-1">
                       <MapPin size={12} /> {incident.customLocation || incident.locationId}
                     </span>
                   </div>
                   <div className="text-[10px] font-bold text-stone-400 bg-stone-50 px-2 py-1 rounded-full border border-stone-100">
                     Ticket: {incident.id.slice(0, 6)}
                   </div>
                </div>
                
                <h3 className="font-bold text-lg uppercase tracking-tight text-stone-800 pl-2">{incident.aiSummary || incident.description || "Cleaning Request"}</h3>
                
                <button onClick={() => updateStatus(incident.id, 'en_route', teamId)} className="w-full mt-2 py-3 bg-white text-amber-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-50 hover:border-amber-200 transition-colors border border-stone-200 shadow-sm">
                  Accept Job
                </button>
              </div>
            ))
          )}
        </div>

        {/* My Jobs Map */}
        <div className="flex flex-col gap-4">
           <h2 className="text-sm font-black uppercase tracking-widest text-stone-400 mb-2 border-b border-stone-200 pb-2">My Active Jobs</h2>
           
           {myJobs.length === 0 ? (
            <div className="text-center py-20 bg-stone-100 border border-stone-200 rounded-[24px]">
              <Clock size={40} className="mx-auto text-stone-300 mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">No active assignments</p>
            </div>
           ) : (
             myJobs.map(incident => (
              <div key={incident.id} className="bg-amber-50 border border-amber-200 rounded-[24px] p-6 flex flex-col gap-5 shadow-sm">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <span className="px-2 py-1 rounded bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest shadow-sm">
                       {incident.status.replace(/_/g, ' ')}
                     </span>
                     <span className="text-[10px] uppercase font-black text-amber-900 tracking-widest flex items-center gap-1">
                       <MapPin size={12} /> {incident.customLocation || incident.locationId}
                     </span>
                   </div>
                </div>
                
                <div>
                  <h3 className="font-black text-xl uppercase tracking-tight text-amber-950 mb-1">{incident.aiSummary || incident.description || "Cleaning Request"}</h3>
                  {incident.description && !incident.aiSummary && (
                    <p className="text-sm font-medium text-amber-800 border-l-2 border-amber-300 pl-3">"{incident.description}"</p>
                  )}
                </div>

                {incident.imageUrl && (
                  <div className="w-full max-w-[200px] aspect-video rounded-xl overflow-hidden border border-amber-200 shadow-sm">
                     <img src={incident.imageUrl} className="w-full h-full object-cover" />
                  </div>
                )}

                 <div className="flex gap-3 pt-2">
                  {incident.status === 'en_route' && (
                    <button onClick={() => updateStatus(incident.id, 'in_progress')} className="flex-1 py-4 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-colors shadow-md">
                      Start Cleaning
                    </button>
                  )}
                  {incident.status === 'in_progress' && (
                    <button onClick={() => updateStatus(incident.id, 'resolved')} className="flex-1 py-4 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-md flex items-center justify-center gap-2">
                      <CheckCircle2 size={16}/> Mark Cleaned
                    </button>
                  )}
                </div>
              </div>
            ))
           )}
           
           {/* Resolved Log */}
           <div className="mt-8">
             <h2 className="text-sm font-black uppercase tracking-widest text-stone-400 mb-2 border-b border-stone-200 pb-2">Recently Cleaned</h2>
             <div className="space-y-3 mt-4">
               {resolvedJobs.slice(0,5).map(inc => (
                 <div key={inc.id} className="bg-white border border-stone-200 rounded-[16px] p-4 flex flex-col gap-1 shadow-sm opacity-60">
                   <div className="flex justify-between items-start">
                     <span className="text-[11px] font-bold text-stone-800 uppercase">{inc.aiSummary || "Completed Job"}</span>
                     <span className="text-[9px] tracking-widest uppercase text-stone-400 font-bold">{new Date(inc.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                   </div>
                   <div className="flex justify-between mt-1">
                     <span className="text-[9px] uppercase tracking-widest text-stone-500 flex items-center gap-1"><MapPin size={10}/> {inc.customLocation || inc.locationId}</span>
                     <span className="text-[9px] uppercase tracking-widest text-emerald-600 font-bold">{inc.assignedTo}</span>
                   </div>
                 </div>
               ))}
               {resolvedJobs.length === 0 && <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center py-4">No recent history</div>}
             </div>
           </div>

        </div>
      </div>
    </div>
  );
}
