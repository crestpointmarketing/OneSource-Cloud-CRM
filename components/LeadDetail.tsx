import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_LEADS, STATUS_COLORS } from '../constants';
import { LeadStatus } from '../types';
import { ArrowLeft, Mail, Phone, Calendar, Clock, Sparkles, Send, MoreHorizontal, User, Tag } from 'lucide-react';
import { generateLeadSummary, generateEmailDraft } from '../services/geminiService';

const LeadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lead = MOCK_LEADS.find(l => l.id === id);
  
  const [activeTab, setActiveTab] = useState<'timeline' | 'notes' | 'email'>('timeline');
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [emailDraft, setEmailDraft] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  useEffect(() => {
    // Reset state when lead changes
    setAiSummary('');
    setEmailDraft('');
  }, [id]);

  if (!lead) {
    return <div className="p-8 text-center">Lead not found</div>;
  }

  const handleGenerateSummary = async () => {
    setIsSummarizing(true);
    const summary = await generateLeadSummary(lead);
    setAiSummary(summary);
    setIsSummarizing(false);
  };

  const handleGenerateDraft = async () => {
    setIsDrafting(true);
    setActiveTab('email');
    const draft = await generateEmailDraft(lead, 'professional and welcoming');
    setEmailDraft(draft);
    setIsDrafting(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => navigate('/leads')}
          className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
             <h1 className="text-2xl font-bold text-slate-900">{lead.name}</h1>
             <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[lead.status]}`}>
               {lead.status}
             </span>
          </div>
          <p className="text-slate-500">{lead.company}</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm">
            <Calendar size={16} /> Schedule
          </button>
          <button 
             onClick={handleGenerateDraft}
             disabled={isDrafting}
             className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-100 font-medium text-sm transition-colors"
          >
            <Sparkles size={16} className={isDrafting ? "animate-pulse" : ""} />
            {isDrafting ? 'Drafting...' : 'AI Draft Email'}
          </button>
          <button className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm">
            Edit Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
              <User size={16} className="text-slate-400" />
              Contact Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 font-medium">Email</label>
                <div className="text-sm text-slate-900 flex items-center gap-2 group">
                  <a href={`mailto:${lead.email}`} className="hover:text-indigo-600 hover:underline">{lead.email}</a>
                  <Mail size={12} className="opacity-0 group-hover:opacity-50" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium">Phone</label>
                <div className="text-sm text-slate-900">{lead.phone || 'Not provided'}</div>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium">Source</label>
                <div className="text-sm text-slate-900">{lead.source}</div>
              </div>
               <div>
                <label className="text-xs text-slate-500 font-medium">Owner</label>
                <div className="text-sm text-slate-900 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                    SJ
                  </div>
                  {lead.owner}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Tag size={16} className="text-slate-400" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {lead.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium border border-slate-200">
                  {tag}
                </span>
              ))}
              <button className="px-2 py-1 border border-dashed border-slate-300 text-slate-400 text-xs rounded-md hover:border-slate-400 hover:text-slate-600 transition-colors">
                + Add
              </button>
            </div>
          </div>

          {/* AI Summary Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Sparkles size={64} className="text-indigo-900" />
            </div>
            <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wide mb-2 flex items-center gap-2">
              <Sparkles size={16} />
              AI Insights
            </h3>
            
            {!aiSummary ? (
               <div className="text-center py-4">
                 <p className="text-sm text-indigo-700/70 mb-3">Generate a concise summary of this lead's activity and status.</p>
                 <button 
                  onClick={handleGenerateSummary}
                  disabled={isSummarizing}
                  className="w-full bg-white text-indigo-600 border border-indigo-200 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors shadow-sm"
                 >
                   {isSummarizing ? 'Analyzing...' : 'Generate Summary'}
                 </button>
               </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-indigo-900 leading-relaxed bg-white/60 p-3 rounded-lg border border-indigo-100/50">
                  {aiSummary}
                </p>
                <div className="flex justify-end">
                   <button onClick={() => setAiSummary('')} className="text-xs text-indigo-500 hover:text-indigo-700">Refresh</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Activity & Tabs */}
        <div className="lg:col-span-2 space-y-6">
           {/* Tab Navigation */}
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="flex border-b border-slate-200">
               <button 
                onClick={() => setActiveTab('timeline')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'timeline' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
               >
                 Activity Timeline
               </button>
               <button 
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'notes' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
               >
                 Notes
               </button>
               <button 
                onClick={() => setActiveTab('email')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'email' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
               >
                 Email
               </button>
             </div>

             <div className="p-6 min-h-[400px]">
               {activeTab === 'timeline' && (
                 <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:w-0.5 before:-translate-x-px before:bg-slate-200 before:h-full before:content-['']">
                    {lead.activities.length === 0 ? (
                      <div className="text-center text-slate-400 py-8 italic ml-10">No recent activity.</div>
                    ) : (
                      lead.activities.map((activity, idx) => (
                        <div key={activity.id} className="relative flex items-start gap-4">
                           <div className={`absolute left-0 mt-1 flex h-10 w-10 items-center justify-center rounded-full ring-8 ring-white ${
                             activity.type === 'status_change' ? 'bg-blue-100 text-blue-600' :
                             activity.type === 'email' ? 'bg-indigo-100 text-indigo-600' :
                             activity.type === 'meeting' ? 'bg-amber-100 text-amber-600' :
                             'bg-slate-100 text-slate-600'
                           }`}>
                             {activity.type === 'email' && <Mail size={16} />}
                             {activity.type === 'meeting' && <Calendar size={16} />}
                             {activity.type === 'status_change' && <Clock size={16} />}
                             {activity.type === 'note' && <MoreHorizontal size={16} />}
                           </div>
                           <div className="ml-12 w-full">
                             <div className="flex justify-between items-start">
                               <p className="text-sm font-medium text-slate-900">{activity.content}</p>
                               <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                                 {new Date(activity.timestamp).toLocaleDateString()}
                               </span>
                             </div>
                             <p className="text-xs text-slate-500 mt-0.5">by {activity.user}</p>
                           </div>
                        </div>
                      ))
                    )}
                 </div>
               )}

               {activeTab === 'email' && (
                 <div className="space-y-4">
                   <div className="flex gap-2 mb-2">
                      <button 
                        onClick={() => handleGenerateDraft()} 
                        disabled={isDrafting}
                        className="text-xs flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-medium hover:bg-indigo-100"
                      >
                        <Sparkles size={12} /> Regenerate Draft
                      </button>
                   </div>
                   <textarea 
                    className="w-full h-64 p-4 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Write your email here..."
                    value={emailDraft}
                    onChange={(e) => setEmailDraft(e.target.value)}
                   />
                   <div className="flex justify-end gap-3">
                     <button className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium">Discard</button>
                     <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                       <Send size={16} /> Send Email
                     </button>
                   </div>
                 </div>
               )}

               {activeTab === 'notes' && (
                 <div className="space-y-4">
                   <textarea 
                    className="w-full h-32 p-4 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-400"
                    placeholder="Add a private note about this lead..."
                   />
                   <div className="flex justify-end">
                     <button className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-medium">
                       Save Note
                     </button>
                   </div>
                 </div>
               )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;