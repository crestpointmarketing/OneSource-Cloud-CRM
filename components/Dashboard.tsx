import React from 'react';
import { MOCK_STATS, MOCK_LEADS, STATUS_COLORS } from '../constants';
import { Users, TrendingUp, CheckCircle, Clock, ArrowRight, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LeadStatus } from '../types';

const Dashboard: React.FC = () => {
  // Process data for charts
  const leadsByStatus = Object.values(LeadStatus).map(status => ({
    name: status,
    count: MOCK_LEADS.filter(l => l.status === status).length
  }));

  const stats = [
    { label: 'Total Leads', value: MOCK_STATS.totalLeads, change: '+12%', icon: <Users size={22} />, color: 'text-blue-600 bg-blue-50', border: 'border-blue-100' },
    { label: 'Conversion Rate', value: `${MOCK_STATS.conversionRate}%`, change: '+2.4%', icon: <TrendingUp size={22} />, color: 'text-emerald-600 bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Pending Tasks', value: MOCK_STATS.pendingTasks, change: '-4', icon: <Clock size={22} />, color: 'text-amber-600 bg-amber-50', border: 'border-amber-100' },
    { label: 'Won Deals', value: '38', change: '+5', icon: <CheckCircle size={22} />, color: 'text-sky-600 bg-sky-50', border: 'border-sky-100' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] rounded-2xl p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, Sarah! 👋</h1>
            <p className="text-slate-300">You have <span className="text-white font-semibold">4 tasks</span> pending and <span className="text-white font-semibold">12 new leads</span> to review today.</p>
          </div>
          <button className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-sky-600/30">
            <Zap size={18} />
            Quick Action
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className={`bg-white p-6 rounded-xl border ${stat.border} shadow-sm hover:shadow-md transition-all duration-300 group`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Pipeline Overview</h2>
              <p className="text-sm text-slate-500">Distribution of leads by current status</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg p-2 outline-none focus:ring-2 focus:ring-sky-500/20">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Quarter</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsByStatus} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 11}} 
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                  itemStyle={{color: '#0f172a', fontWeight: 600}}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                   {leadsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                        entry.name === 'Won' ? '#10b981' : // Emerald
                        entry.name === 'Lost' ? '#cbd5e1' : // Slate
                        '#0ea5e9' // Sky Blue
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Updates</h2>
          <div className="space-y-6 flex-1">
            {MOCK_LEADS.slice(0, 4).map((lead) => (
              <div key={lead.id} className="flex gap-4 items-start group">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 text-slate-600 font-bold text-xs group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors">
                  {lead.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {lead.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Updated status to <span className="font-medium text-slate-700">{lead.status}</span></p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${STATUS_COLORS[lead.status]}`}>
                      {lead.status}
                    </span>
                    <span className="text-[10px] text-slate-400">2h ago</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 text-sm text-slate-600 font-medium hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-100 hover:border-sky-100">
            View All Activity <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;