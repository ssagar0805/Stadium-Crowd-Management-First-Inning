import React, { useState } from 'react';
import { Camera, Shield, Trash2, Users, LifeBuoy, Send, ArrowLeft, Loader2, AlertTriangle, Accessibility, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";

const INCIDENT_TYPES = [
  { id: 'security', label: 'Security Issue', icon: Shield, color: 'text-slate-800 bg-slate-100' },
  { id: 'crowd', label: 'Overcrowding', icon: Users, color: 'text-orange-500 bg-orange-50' },
  { id: 'housekeeping', label: 'Spill / Mess', icon: Trash2, color: 'text-amber-600 bg-amber-50' },
  { id: 'help', label: 'Medical / Help', icon: LifeBuoy, color: 'text-blue-500 bg-blue-50' },
  { id: 'suspicious', label: 'Suspicious Activity', icon: Eye, color: 'text-indigo-500 bg-indigo-50' },
  { id: 'accessibility', label: 'Accessibility', icon: Accessibility, color: 'text-emerald-500 bg-emerald-50' },
];

const ZONES = ['North', 'South', 'East', 'West', 'Pavilion', 'Concourse'];

export default function AttendeePage() {
  const navigate = useNavigate();
  const [type, setType] = useState<string>('security');
  const [location, setLocation] = useState('');
  const [zone, setZone] = useState('North');
  const [stand, setStand] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'urgent'>('medium');
  const [isDanger, setIsDanger] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [caseId, setCaseId] = useState('');

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

  const getAIUrgencyAndSummary = async (type: string, notes: string): Promise<{ summary: string, severity: string }> => {
    try {
      // @ts-ignore
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        return { summary: notes || 'No details provided.', severity: type === 'security' || type === 'help' ? 'high' : 'medium' };
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Analyze this attendee report for a stadium.
      Type: ${type}
      Notes: ${notes}
      
      Respond in strictly JSON format:
      {
        "summary": "1 very short sentence summarizing the issue",
        "severity": "low", "medium", "high", or "critical"
      }`;
      
      const result = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
      const text = result.text;
      const match = text && text.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      return { summary: notes, severity: 'medium' };
    } catch (err) {
      console.error(err);
      return { summary: notes, severity: 'medium' };
    }
  };

  const handleSubmit = async () => {
    if (!location) {
      alert("Please enter a location");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const aiData = await getAIUrgencyAndSummary(type, notes);
      
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          customLocation: location,
          zone,
          stand,
          description: notes,
          imageUrl,
          reporterRole: 'attendee',
          aiSummary: aiData.summary,
          severity: isDanger ? 'critical' : urgency === 'urgent' ? 'high' : urgency,
          isDanger,
          status: 'open'
        })
      });
      
      const serverData = await res.json();
      setCaseId(serverData.id);
      
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setNotes('');
        setLocation('');
        setStand('');
        setImageUrl(null);
        setCaseId('');
        setIsDanger(false);
        setUrgency('medium');
      }, 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-[32px] shadow-sm max-w-md w-full animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
             <Send size={32} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-2">Report Sent</h2>
          <p className="text-slate-500 font-medium mb-6">Stadium authorities have been notified and are reviewing your request.</p>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 inline-block mx-auto mb-4">
             <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Case ID</p>
             <p className="text-xl font-mono font-black text-slate-800">{caseId}</p>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mt-4">Command Center Active</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white px-4 py-4 md:px-6 flex items-center shadow-sm border-b border-slate-100 sticky top-0 z-50">
         <button onClick={() => navigate('/')} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 mr-4">
            <ArrowLeft size={20} />
         </button>
         <div>
            <h1 className="text-lg font-black tracking-tight uppercase text-slate-900">Report an Issue</h1>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Fast Track to Staff</p>
         </div>
      </div>

      <div className="flex-1 max-w-xl mx-auto w-full p-4 md:p-6 space-y-8">
        
        <section className="space-y-4">
           <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">What's the issue?</label>
           <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {INCIDENT_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${type === t.id ? 'border-orange-500 bg-orange-50' : 'border-transparent bg-white shadow-sm'}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${type === t.id ? 'bg-orange-500 text-white' : t.color}`}>
                     <t.icon size={24} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest text-center ${type === t.id ? 'text-orange-900' : 'text-slate-600'}`}>{t.label}</span>
                </button>
              ))}
           </div>
        </section>

        <section className="space-y-4 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
           <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Where are you?</label>
           <div className="space-y-3">
             <div className="flex gap-3">
               <select 
                 value={zone} 
                 onChange={e => setZone(e.target.value)}
                 className="flex-1 bg-slate-50 border border-slate-200 rounded-[20px] px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
               >
                 {ZONES.map(z => <option key={z} value={z}>{z} Zone</option>)}
               </select>
               <input 
                 value={stand}
                 onChange={e => setStand(e.target.value)}
                 placeholder="Stand/Sec (Opt)"
                 className="flex-1 bg-slate-50 border border-slate-200 rounded-[20px] px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
               />
             </div>
             <input 
               value={location}
               onChange={e => setLocation(e.target.value)}
               placeholder="Specific location (e.g. Near Gate 3 / Row F)"
               className="w-full bg-slate-50 border border-slate-200 rounded-[20px] px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
             />
           </div>
        </section>

        <section className="space-y-4">
           <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Add Photo (Recommended)</label>
           {imageUrl ? (
              <div className="relative aspect-video w-full rounded-[20px] overflow-hidden bg-slate-100 border border-slate-200 group">
                 <img src={imageUrl} className="w-full h-full object-cover" />
                 <button onClick={() => setImageUrl(null)} className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={18} />
                 </button>
              </div>
           ) : (
             <label className="flex flex-col items-center justify-center w-full aspect-video bg-white border-2 border-slate-200 border-dashed rounded-[20px] cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3 hover:bg-orange-100 hover:text-orange-500 transition-colors">
                   <Camera size={24} />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tap to Upload Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
             </label>
           )}
        </section>

        <section className="space-y-4">
           <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Notes (Optional)</label>
           <textarea 
             value={notes}
             onChange={e => setNotes(e.target.value)}
             placeholder="Provide any additional details..."
             rows={3}
             className="w-full bg-white border border-slate-200 rounded-[20px] px-6 py-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm resize-none"
           />
        </section>

        <section className="space-y-3 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
           <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 block mb-2">Situation Urgency</label>
           <div className="flex bg-slate-50 p-2 rounded-[20px]">
             {(['low', 'medium', 'urgent'] as const).map(u => (
                <button
                  key={u}
                  onClick={() => setUrgency(u)}
                  className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${urgency === u ? (u === 'urgent' ? 'bg-red-500 text-white shadow-md' : 'bg-slate-800 text-white shadow-md') : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
                >
                  {u}
                </button>
             ))}
           </div>
           
           <div className="mt-6 border-t border-slate-100 pt-6">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-[12px] font-black uppercase tracking-widest text-slate-800">Is someone in danger?</p>
                   <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Requires immediate response</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-200">
                   <button onClick={() => setIsDanger(false)} className={`py-2 px-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${!isDanger ? 'bg-slate-300 text-slate-800 shadow-sm' : 'text-slate-400 hover:bg-slate-100'}`}>No</button>
                   <button onClick={() => setIsDanger(true)} className={`py-2 px-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isDanger ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:bg-red-50 hover:text-red-500'}`}>Yes</button>
                </div>
             </div>
           </div>
        </section>

      </div>
      
      <div className="p-4 md:p-6 bg-white border-t border-slate-100 sticky bottom-0">
          <div className="max-w-xl mx-auto">
             <button 
                onClick={handleSubmit}
                disabled={isSubmitting || !location}
                className="w-full bg-slate-900 text-white rounded-full py-5 text-sm font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
             >
                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                {isSubmitting ? 'Sending to Staff...' : 'Submit Report'}
             </button>
          </div>
      </div>
    </div>
  );
}
