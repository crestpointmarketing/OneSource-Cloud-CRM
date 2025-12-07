import { Lead, LeadStatus, LeadSource, Task, DashboardStats, EmailTemplate } from './types';

export const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Alice Freeman',
    company: 'TechNova Solutions',
    email: 'alice.f@technova.com',
    phone: '+1 (555) 123-4567',
    status: LeadStatus.ENGAGED,
    source: LeadSource.WEBSITE,
    tags: ['Enterprise', 'SaaS'],
    owner: 'Sarah Johnson',
    lastContact: '2023-10-25T14:30:00Z',
    activities: [
      { id: 'a1', type: 'email', content: 'Sent introductory proposal', timestamp: '2023-10-25T14:30:00Z', user: 'Sarah Johnson' },
      { id: 'a2', type: 'note', content: 'Interested in the API integration features.', timestamp: '2023-10-24T10:00:00Z', user: 'Sarah Johnson' },
      { id: 'a3', type: 'status_change', content: 'Changed status to Engaged', timestamp: '2023-10-24T09:55:00Z', user: 'System' }
    ]
  },
  {
    id: '2',
    name: 'Bob Smith',
    company: 'Global Logistics',
    email: 'bsmith@glogistics.net',
    phone: '+1 (555) 987-6543',
    status: LeadStatus.PROPOSAL,
    source: LeadSource.LINKEDIN,
    tags: ['Logistics', 'High Value'],
    owner: 'Mike Chen',
    lastContact: '2023-10-26T09:15:00Z',
    activities: [
      { id: 'b1', type: 'meeting', content: 'Demo with procurement team', timestamp: '2023-10-26T09:15:00Z', user: 'Mike Chen' },
      { id: 'b2', type: 'email', content: 'Sent pricing breakdown', timestamp: '2023-10-20T16:00:00Z', user: 'Mike Chen' }
    ]
  },
  {
    id: '3',
    name: 'Carol Danvers',
    company: 'Stark Industries',
    email: 'cdanvers@stark.com',
    status: LeadStatus.NEW,
    source: LeadSource.REFERRAL,
    tags: ['Defense', 'Enterprise'],
    owner: 'Sarah Johnson',
    lastContact: '2023-10-27T11:00:00Z',
    activities: [
      { id: 'c1', type: 'status_change', content: 'Lead Created', timestamp: '2023-10-27T11:00:00Z', user: 'System' },
      { id: 'c2', type: 'email', content: 'Automated Welcome Email Sent', timestamp: '2023-10-27T11:01:00Z', user: 'System' }
    ]
  },
  {
    id: '4',
    name: 'David Kim',
    company: 'NextGen AI',
    email: 'dkim@nextgen.ai',
    phone: '+1 (415) 555-0199',
    status: LeadStatus.QUALIFICATION,
    source: LeadSource.EVENT,
    tags: ['Startup', 'AI'],
    owner: 'Alex Roe',
    lastContact: '2023-10-23T15:45:00Z',
    activities: []
  },
  {
    id: '5',
    name: 'Eva Green',
    company: 'Green Earth',
    email: 'eva@greenearth.org',
    status: LeadStatus.WON,
    source: LeadSource.WEBSITE,
    tags: ['Non-Profit'],
    owner: 'Sarah Johnson',
    lastContact: '2023-10-22T10:00:00Z',
    activities: []
  }
];

export const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'Follow up with Alice regarding proposal', dueDate: '2023-10-28', completed: false, assignedTo: 'Sarah Johnson', relatedLeadId: '1', relatedLeadName: 'Alice Freeman', priority: 'high' },
  { id: 't2', title: 'Prepare Q4 Report', dueDate: '2023-10-30', completed: false, assignedTo: 'Sarah Johnson', priority: 'medium' },
  { id: 't3', title: 'Call David Kim', dueDate: '2023-10-29', completed: true, assignedTo: 'Alex Roe', relatedLeadId: '4', relatedLeadName: 'David Kim', priority: 'low' }
];

export const MOCK_STATS: DashboardStats = {
  totalLeads: 142,
  newLeadsThisWeek: 12,
  conversionRate: 24.5,
  pendingTasks: 8
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: 'bg-blue-100 text-blue-800',
  [LeadStatus.ENGAGED]: 'bg-indigo-100 text-indigo-800',
  [LeadStatus.QUALIFICATION]: 'bg-purple-100 text-purple-800',
  [LeadStatus.PROPOSAL]: 'bg-amber-100 text-amber-800',
  [LeadStatus.NEGOTIATION]: 'bg-orange-100 text-orange-800',
  [LeadStatus.WON]: 'bg-green-100 text-green-800',
  [LeadStatus.LOST]: 'bg-slate-100 text-slate-800',
};

export const MOCK_TEMPLATES: EmailTemplate[] = [
  {
    id: 'temp_1',
    name: 'Initial Outreach',
    subject: 'Introduction to OneSource Cloud',
    body: 'Hi {{Customer Name}},\n\nI hope this email finds you well. I noticed that {{Company Name}} is doing great work in the industry, and I wanted to reach out to introduce OneSource Cloud.\n\nBest,\n{{My Name}}',
    lastModified: '2023-10-15'
  },
  {
    id: 'temp_2',
    name: 'Meeting Follow-up',
    subject: 'Great speaking with you today',
    body: 'Hi {{Customer Name}},\n\nThanks for taking the time to chat today. As discussed, I am attaching the additional information regarding our enterprise plans.\n\nLet me know if you have any questions.\n\nBest,\n{{My Name}}',
    lastModified: '2023-10-20'
  }
];