import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Camera, AlertCircle, RefreshCcw, Send, CheckCircle2, ChevronRight, HardHat, TrendingDown, TrendingUp, PaintBucket, Users, ShieldAlert, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Location } from '../types';

export default function VolunteerPage() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLoc, setSelectedLoc] = useState<Location | null>(null);
  
  // Form state
  const [status, setStatus] = useState<'Clear' | 'Moderate' | 'Heavy'>('Clear');
  const [countBand, setCountBand] = useState<'0-10' | '10-25' | '25-50' | '50+'>('0-10');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/locations')
      .then(r => r.json())
      .then(data => setLocations(data));
  }, []);

  const handleSelect = (loc: Location) => {
    setSelectedLoc(loc);
    setStatus(loc.status === 'Low' ? 'Clear' : loc.status === 'Medium' ? 'Moderate' : 'Heavy');
    setCountBand(loc.count <= 10 ? '0-10' : loc.count <= 25 ? '10-25' : loc.count <= 50 ? '25-50' : '50+');
    setNotes('');
    setImageUrl(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedLoc) return;
    setIsSubmitting(true);
    try {
      await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedLoc,
          status: status === 'Clear' ? 'Low' : status === 'Moderate' ? 'Medium' : 'High',
          count: countBand === '0-10' ? 5 : countBand === '10-25' ? 18 : countBand === '25-50' ? 35 : 75,
          notes: notes || selectedLoc.notes,
          imageUrl: imageUrl || selectedLoc.imageUrl,
          updatedAt: Date.now()
        })
      });
      setRecentUpdates(prev => [{ location: selectedLoc.name, status, time: Date.now() }, ...prev]);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelectedLoc(null);
        fetch('/api/locations').then(r => r.json()).then(data => setLocations(data));
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       <div className="bg-white px-4 py-4 md:px-6 flex items-center shadow-sm border-b border-slate-100 sticky top-0 z-50">
         <button onClick={() => {
           if (selectedLoc) setSelectedLoc(null);
           else navigate('/');
         }} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 mr-4 transition-colors hover:bg-slate-100">
            <ArrowLeft size={20} />
         </button>
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 text-green-600 flex items-center justify-center rounded-lg">
               <HardHat size={18} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight uppercase text-slate-900">Volunteer Ops</h1>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{selectedLoc ? 'Node Update' : 'Live Assignments'}</p>
            </div>
         </div>
      </div>

      {!selectedLoc ? (
        <div className="p-4 md:p-6 max-w-2xl mx-auto w-full space-y-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-[24px] p-6 mb-8">
             <h2 className="text-emerald-800 font-bold mb-1">Welcome, Volunteer</h2>
             <p className="text-sm text-emerald-600/80">Select your assigned location to submit routine crowd telemetry or report area conditions.</p>
          </div>

          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-2 mt-8">Your Assigned Zones</h3>
          
          <div className="space-y-3">
            {locations.sort((a, b) => a.zone.localeCompare(b.zone)).map(loc => (
              <button 
                key={loc.id} 
                onClick={() => handleSelect(loc)}
                className="w-full bg-white border border-slate-200 p-4 rounded-3xl flex items-center justify-between group hover:border-green-500 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                      <MapPin size={20} />
                   </div>
                   <div className="text-left">
                     <p className="font-bold text-slate-900 text-sm">{loc.name}</p>
                     <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">{loc.zone} • {loc.category}</p>
                     <p className="text-[8px] uppercase tracking-widest text-slate-300 mt-1">Last Update: {new Date(loc.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${loc.status === 'Low' ? 'bg-emerald-100 text-emerald-600' : loc.status === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                     {loc.status === 'Low' ? 'Clear' : loc.status === 'Medium' ? 'Moderate' : 'Heavy'}
                   </span>
                   <ChevronRight size={18} className="text-slate-300 group-hover:text-green-500 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8">
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-3">Quick Incident Reporting</h3>
             <div className="grid grid-cols-2 gap-3">
                <button onClick={() => navigate('/attendee')} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:border-amber-400 transition-colors flex flex-col items-center justify-center gap-2 group">
                  <PaintBucket size={20} className="text-slate-400 group-hover:text-amber-500"/>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Report Spill</span>
                </button>
                <button onClick={() => navigate('/attendee')} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:border-red-400 transition-colors flex flex-col items-center justify-center gap-2 group">
                  <Activity size={20} className="text-slate-400 group-hover:text-red-500"/>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Medical Help</span>
                </button>
                <button onClick={() => navigate('/attendee')} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:border-blue-400 transition-colors flex flex-col items-center justify-center gap-2 group">
                  <Users size={20} className="text-slate-400 group-hover:text-blue-500"/>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Crowd Surge</span>
                </button>
                <button onClick={() => navigate('/attendee')} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:border-orange-400 transition-colors flex flex-col items-center justify-center gap-2 group">
                  <ShieldAlert size={20} className="text-slate-400 group-hover:text-orange-500"/>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Blocked Path</span>
                </button>
             </div>
          </div>

          {recentUpdates.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-3">Latest Submissions</h3>
              <div className="space-y-2">
                {recentUpdates.map((update, i) => (
                  <div key={i} className="bg-white border border-slate-100 p-3 rounded-xl flex items-center justify-between shadow-sm opacity-80">
                     <div>
                       <p className="text-xs font-bold text-slate-700">{update.location}</p>
                       <p className="text-[9px] uppercase tracking-widest text-slate-400">{new Date(update.time).toLocaleTimeString()}</p>
                     </div>
                     <span className="bg-green-50 text-green-600 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                       <CheckCircle2 size={10}/> Sync OK
                     </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : submitted ? (
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-[32px] shadow-sm max-w-sm w-full animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
               <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-2">Telemetry Synced</h2>
            <p className="text-slate-500 font-medium">Command center has received the live update.</p>
          </div>
        </div>
      ) : (
        <div className="p-4 md:p-6 max-w-xl mx-auto w-full space-y-8 animate-in slide-in-from-right-4 duration-300 mb-24">
           
           <div className="text-center space-y-1 my-4">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">{selectedLoc.name}</h2>
              <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                 {selectedLoc.zone} • {selectedLoc.category}
              </div>
           </div>

           <section className="space-y-4 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
             <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Live Density Level</label>
             <div className="flex bg-slate-100 p-2 rounded-[24px]">
                {['Clear', 'Moderate', 'Heavy'].map(s => (
                  <button 
                    key={s}
                    onClick={() => setStatus(s as any)}
                    className={`flex-1 py-4 px-2 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all ${status === s ? (s === 'Clear' ? 'bg-emerald-500' : s === 'Moderate' ? 'bg-amber-400' : 'bg-red-500') + ' text-white shadow-lg' : 'text-slate-400 hover:bg-slate-200'}`}
                  >
                    {s}
                  </button>
                ))}
             </div>
           </section>

           <section className="space-y-4 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
             <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Headcount Estimate</label>
             <div className="grid grid-cols-2 gap-2">
                {['0-10', '10-25', '25-50', '50+'].map(band => (
                  <button 
                    key={band}
                    onClick={() => setCountBand(band as any)}
                    className={`py-6 rounded-[24px] text-lg font-black italic tracking-tighter transition-all ${countBand === band ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-200'}`}
                  >
                    {band} <span className="text-[10px] uppercase tracking-widest opacity-50 not-italic ml-1">PPL</span>
                  </button>
                ))}
             </div>
           </section>

           <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-3">
                 <label className="flex flex-col items-center cursor-pointer w-full group">
                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3 group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                       {imageUrl ? <CheckCircle2 size={24} className="text-green-600" /> : <Camera size={24} />}
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">{imageUrl ? 'Photo Attached' : 'Visual Proof'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                 </label>
              </div>
              <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Quick Intel (Optional)</label>
                 <textarea 
                   rows={2} 
                   value={notes} 
                   onChange={e => setNotes(e.target.value)} 
                   placeholder="E.g. Queue is moving fast now..." 
                   className="w-full bg-slate-50 border border-slate-100 rounded-[20px] px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500/20"
                 />
              </div>
           </section>

           <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100">
             <div className="max-w-xl mx-auto">
               <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-green-600 text-white rounded-full py-5 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-green-600/20 disabled:opacity-50 flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
               >
                  {isSubmitting ? <RefreshCcw size={20} className="animate-spin" /> : <Send size={20} />}
                  {isSubmitting ? 'Syncing...' : 'Sync Telemetry'}
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
