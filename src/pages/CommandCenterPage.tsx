import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Activity, MapPin, AlertTriangle, CheckCircle2, RefreshCcw, Shield, Trash2, Users, Search, MoreHorizontal, MessageSquare, ChevronRight, Filter, Eye, Accessibility, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Location, Incident } from '../types';

const timeAgo = (timestamp: number) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 2) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
};

export default function CommandCenterPage() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Location[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'security' | 'housekeeping' | 'crowd' | 'help' | 'suspicious' | 'accessibility'>('all');

  const fetchData = async () => {
    try {
      const [locRes, incRes, logRes] = await Promise.all([
        fetch('/api/locations'),
        fetch('/api/incidents'),
        fetch('/api/logs')
      ]);
      setLocations(await locRes.json());
      setIncidents(await incRes.json());
      setLogs(await logRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateIncident = async (id: string, updates: Partial<Incident>) => {
    try {
      await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredIncidents = useMemo(() => {
    if (filterType === 'all') return incidents;
    return incidents.filter(i => i.type === filterType);
  }, [incidents, filterType]);

  const zonesStatus = useMemo(() => {
    const zones = ["North", "South", "East", "West", "Pavilion", "Concourse"];
    return zones.map(z => {
      const zoneLocs = locations.filter(l => l.zone === z);
      const highCount = zoneLocs.filter(l => l.status === 'High').length;
      const mediumCount = zoneLocs.filter(l => l.status === 'Medium').length;
      let status: 'Low' | 'Medium' | 'High' = 'Low';
      if (highCount > 0) status = 'High';
      else if (mediumCount > 1) status = 'Medium';
      
      const incidentCount = incidents.filter(i => i.zone === z && i.status !== 'resolved').length;
      
      return { name: z, status, incidentCount };
    });
  }, [locations, incidents]);

  // KPIs
  const totalActive = incidents.filter(i => i.status !== 'resolved').length;
  const totalCritical = incidents.filter(i => (i.severity === 'critical' || i.severity === 'high') && i.status !== 'resolved').length;
  const totalAssigned = incidents.filter(i => i.status === 'assigned' || i.status === 'en_route' || i.status === 'on_scene' || i.status === 'in_progress').length;
  const totalResolved = incidents.filter(i => i.status === 'resolved').length;
  const policeEscalations = incidents.filter(i => i.status === 'escalated_to_police').length;
  const hkOpen = incidents.filter(i => i.type === 'housekeeping' && i.status !== 'resolved').length;
  const secOpen = incidents.filter(i => i.type === 'security' && i.status !== 'resolved').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <div className="bg-slate-950 px-6 py-4 shadow-xl border-b border-slate-800 relative z-50">
         <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
           <div className="flex items-center gap-6">
             <button onClick={() => navigate('/')} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-colors shrink-0">
                <ArrowLeft size={20} />
             </button>
             <div>
                <h1 className="text-xl font-black tracking-tighter uppercase text-white italic">Command HQ</h1>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/> LIVE OPERATIONS</p>
             </div>
           </div>
           
           <div className="flex-1 flex overflow-x-auto no-scrollbar gap-2 pb-2 xl:pb-0 items-center xl:justify-end">
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex flex-col shrink-0 min-w-[120px]">
                 <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">Active</span>
                 <span className="text-xl text-white font-black">{totalActive}</span>
              </div>
              <div className="bg-red-950/30 border border-red-900/50 rounded-xl px-4 py-2 flex flex-col shrink-0 min-w-[120px]">
                 <span className="text-[9px] uppercase font-black tracking-widest text-red-400">Critical</span>
                 <span className="text-xl text-red-500 font-black">{totalCritical}</span>
              </div>
              <div className="bg-blue-900/20 border border-blue-900/40 rounded-xl px-4 py-2 flex flex-col shrink-0 min-w-[120px]">
                 <span className="text-[9px] uppercase font-black tracking-widest text-blue-400">Assigned</span>
                 <span className="text-xl text-blue-400 font-black">{totalAssigned}</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex flex-col shrink-0 min-w-[120px]">
                 <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">Police Esc.</span>
                 <span className="text-xl text-white font-black">{policeEscalations}</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex flex-col shrink-0 min-w-[120px]">
                 <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">Resolved</span>
                 <span className="text-xl text-emerald-400 font-black">{totalResolved}</span>
              </div>
           </div>
         </div>
      </div>

      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        
        {/* Left Column: Heatmap & Stats */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           
           <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200 flex-1 relative overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-8 z-10 relative">
                 <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Venue Telemetry</h2>
                 <Activity size={16} className="text-slate-400" />
              </div>
              
              <div className="flex-1 relative min-h-[300px] flex items-center justify-center">
                 <div className="relative w-full aspect-[4/5] md:aspect-square max-w-sm border-2 border-slate-100 rounded-full flex items-center justify-center">
                    <div className="absolute inset-[30%] border-2 border-slate-100 border-dashed rounded-full flex items-center justify-center bg-slate-50/50">
                       <div className="text-center font-black uppercase tracking-[0.4em] text-slate-300 text-[10px]">Field</div>
                    </div>
                    {zonesStatus.map(z => {
                      const pos = { North: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2", South: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2", East: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2", West: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2", Pavilion: "top-[20%] left-[20%] -translate-x-1/2 -translate-y-1/2", Concourse: "bottom-[20%] right-[20%] translate-x-1/2 translate-y-1/2" }[z.name];
                      const statusColorClass = z.status === 'High' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : z.status === 'Medium' ? 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
                      return (
                        <div key={z.name} className={`absolute ${pos} transition-all duration-1000 z-30 flex flex-col items-center gap-2`}>
                          <div className="bg-white/80 backdrop-blur px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest text-slate-500 shadow-sm border border-slate-100 flex items-center gap-2">
                             {z.name}
                             {z.incidentCount > 0 && <span className="text-red-500 bg-red-100 px-1 rounded-sm">{z.incidentCount}</span>}
                          </div>
                          <div className={`relative w-8 h-8 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center`}>
                             <div className={`w-3 h-3 rounded-full ${statusColorClass}`} />
                          </div>
                        </div>
                      );
                    })}
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 rounded-[32px] p-8 shadow-xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity"><AlertTriangle size={120} /></div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">AI Summary <SparkleIcon /></h2>
              <div className="space-y-4 relative z-10">
                 {incidents.filter(i => i.severity === 'high' || i.severity === 'critical').length > 0 ? (
                   <div className="text-xl font-bold leading-tight italic">
                     Multiple high-severity incidents active. Recommend deploying immediate security response to Gate 3 and North Food Plaza.
                   </div>
                 ) : (
                   <div className="text-xl font-medium leading-tight text-emerald-400">
                     Operations normal. No critical threats detected. Routine monitoring advised.
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* Right Column: Incident Feed */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           <div className="bg-white rounded-[32px] p-4 lg:p-8 shadow-sm border border-slate-200 flex-1 flex flex-col min-h-0">
             
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
               <div className="flex items-center gap-4">
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Incident List</h2>
                  <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{filteredIncidents.length} items</div>
               </div>
               
               <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-100 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'security', label: 'Security' },
                    { id: 'housekeeping', label: 'H.K.' },
                    { id: 'crowd', label: 'Crowd' },
                    { id: 'help', label: 'Help' },
                    { id: 'suspicious', label: 'Suspicious' },
                    { id: 'accessibility', label: 'Access' },
                  ].map(f => (
                    <button 
                      key={f.id} 
                      onClick={() => setFilterType(f.id as any)}
                      className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filterType === f.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {f.label}
                    </button>
                  ))}
               </div>
             </div>

             <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
                {filteredIncidents.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                     <CheckCircle2 size={48} className="opacity-20" />
                     <p className="text-xs uppercase font-black tracking-widest">No active incidents</p>
                  </div>
                ) : (
                  filteredIncidents.map(incident => (
                    <IncidentCard 
                      key={incident.id} 
                      data={incident} 
                      onAssign={(dept) => handleUpdateIncident(incident.id, { status: 'assigned' })}
                      onResolve={() => handleUpdateIncident(incident.id, { status: 'resolved' })}
                      onEscalate={() => handleUpdateIncident(incident.id, { status: 'escalated_to_police' })}
                    />
                  ))
                )}
             </div>

           </div>

           {/* Activity Timeline */}
           <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">Activity Timeline</h2>
               <Clock size={16} className="text-slate-400" />
             </div>
             <div className="space-y-4 max-h-[200px] overflow-y-auto no-scrollbar pr-2">
               {logs.slice(0, 15).map(log => (
                 <div key={log.id} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                       <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors mt-1.5" />
                       <div className="w-px h-full bg-slate-100 mt-2" />
                    </div>
                    <div className="pb-4">
                       <p className="text-[10px] font-black tracking-widest text-slate-400 mb-1">{timeAgo(log.timestamp)}</p>
                       <p className="text-xs font-medium text-slate-700">{log.message}</p>
                    </div>
                 </div>
               ))}
             </div>
           </div>

        </div>
      </div>
    </div>
  );
}

const SparkleIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>

const IncidentCard: React.FC<{ data: Incident, onAssign: (dept:string)=>void|Promise<void>, onResolve: ()=>void|Promise<void>, onEscalate: ()=>void|Promise<void> }> = ({ data, onAssign, onResolve, onEscalate }) => {
  const getIcon = () => {
    switch (data.type) {
      case 'security': return <Shield size={20} />;
      case 'housekeeping': return <Trash2 size={20} />;
      case 'crowd': return <Users size={20} />;
      case 'help': return <Activity size={20} />;
      case 'suspicious': return <Eye size={20} />;
      case 'accessibility': return <Accessibility size={20} />;
      default: return <AlertTriangle size={20} />;
    }
  };

  const getColor = () => {
    switch (data.severity) {
      case 'critical': return 'border-red-500 bg-red-500/10 text-red-600';
      case 'high': return 'border-orange-500 bg-orange-500/10 text-orange-600';
      case 'medium': return 'border-amber-400 bg-amber-400/10 text-amber-600';
      case 'low': return 'border-blue-400 bg-blue-400/10 text-blue-600';
      default: return 'border-slate-200 bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className={`p-6 rounded-[24px] border ${data.status === 'resolved' ? 'border-slate-100 bg-slate-50 opacity-60' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'} transition-all flex flex-col md:flex-row md:items-start gap-6`}>
      <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center border ${data.status === 'resolved' ? 'border-slate-200 text-slate-400' : getColor()}`}>
         {getIcon()}
      </div>
      
      <div className="flex-1 space-y-4">
        <div>
           <div className="flex items-center gap-3 mb-2 flex-wrap">
             <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${data.status === 'resolved' ? 'bg-slate-200 text-slate-500' : data.status === 'escalated_to_police' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'}`}>
               {data.status.replace(/_/g, ' ')}
             </span>
             {data.assignedTo && (
               <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-blue-100 text-blue-700 border border-blue-200">
                 Team: {data.assignedTo}
               </span>
             )}
             <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-1">
               <MapPin size={10} /> {data.customLocation || data.locationId} {data.stand ? `(${data.stand})` : ''} {data.zone ? `[${data.zone}]` : ''}
             </span>
             <span className="text-[10px] uppercase font-black text-slate-300 tracking-widest ml-auto">
               ID: {data.id} • {timeAgo(data.createdAt)}
             </span>
           </div>
           <h3 className={`font-black text-xl tracking-tight ${data.status === 'resolved' ? 'line-through text-slate-400' : 'text-slate-900'} uppercase italic`}>
             {data.aiSummary || "Uncategorized Report"}
           </h3>
           <p className="text-sm font-medium text-slate-600 mt-2">{data.description}</p>
        </div>

        {data.imageUrl && (
          <div className="w-full max-w-[200px] aspect-video rounded-xl overflow-hidden border border-slate-100">
             <img src={data.imageUrl} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 self-start px-3 py-1.5 rounded-lg border border-slate-100">
          Reported by: <span className="text-slate-700">{data.reporterRole}</span>
        </div>
      </div>

      <div className="flex flex-row md:flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
        {data.status !== 'resolved' && (
          <React.Fragment>
             {(data.status === 'open') && (
               <button onClick={() => onAssign(data.type)} className="flex-1 md:flex-none px-4 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors text-center shadow-md">
                 Force Dispatch
               </button>
             )}
             {data.type === 'security' && data.status !== 'escalated_to_police' && (
               <button onClick={onEscalate} className="flex-1 md:flex-none px-4 py-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-200 hover:bg-red-100 transition-colors text-center">
                 Escalate (Police)
               </button>
             )}
             <button onClick={onResolve} className="flex-1 md:flex-none px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors text-center">
               Mark Resolved
             </button>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}
