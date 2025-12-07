export enum LeadStatus {
  NEW = 'New Lead',
  ENGAGED = 'Engaged',
  QUALIFICATION = 'Qualification',
  PROPOSAL = 'Proposal',
  NEGOTIATION = 'Negotiation',
  WON = 'Won',
  LOST = 'Lost'
}

export enum LeadSource {
  WEBSITE = 'Website',
  LINKEDIN = 'LinkedIn',
  REFERRAL = 'Referral',
  EVENT = 'Event',
  COLD_CALL = 'Cold Call'
}

export interface Activity {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'note' | 'status_change';
  content: string;
  timestamp: string;
  user: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  status: LeadStatus;
  source: LeadSource;
  tags: string[];
  owner: string;
  lastContact: string;
  activities: Activity[];
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  assignedTo: string;
  relatedLeadId?: string;
  relatedLeadName?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface DashboardStats {
  totalLeads: number;
  newLeadsThisWeek: number;
  conversionRate: number;
  pendingTasks: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  lastModified: string;
}