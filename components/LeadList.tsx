import React, { useState, useRef, useEffect } from 'react';
import { MOCK_LEADS, STATUS_COLORS } from '../constants';
import { LeadStatus, Lead, LeadSource } from '../types';
import { Search, Filter, Plus, Mail, Phone, Calendar, Trash2, Tag, X, CheckCircle, AlertCircle, RefreshCw, Download, Upload, Bookmark, ChevronDown, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SavedFilter {
  id: string;
  name: string;
  criteria: {
    status: string;
    source: string;
    tag: string;
    date: string;
    search: string;
  };
}

const LeadList: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state for leads to allow modification (Deletion, Tagging, Import)
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
  const [tagFilter, setTagFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('All');
  
  // Saved Filters State
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() => {
    const saved = localStorage.getItem('crm_saved_filters');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSaveFilterModal, setShowSaveFilterModal] = useState(false);
  const [showSavedViewsDropdown, setShowSavedViewsDropdown] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');

  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Batch Action UI State
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  // Feedback Toast State
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Helper for Date Logic
  const checkDateFilter = (dateString: string, filter: string) => {
    if (filter === 'All') return true;
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Reset hours for accurate "Today" check
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);

    switch (filter) {
      case 'today':
        return dateStart.getTime() === todayStart.getTime();
      case 'week':
        return diffDays <= 7;
      case 'month':
        return diffDays <= 30;
      case '3months':
        return diffDays <= 90;
      case 'older':
        return diffDays > 90;
      default:
        return true;
    }
  };

  // Filter Logic
  const filteredLeads = leads.filter(lead => {
    // 1. Search
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Status
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;

    // 3. Source
    const matchesSource = sourceFilter === 'All' || lead.source === sourceFilter;

    // 4. Tag
    const matchesTag = tagFilter === 'All' || lead.tags.includes(tagFilter);

    // 5. Date
    const matchesDate = checkDateFilter(lead.lastContact, dateFilter);

    return matchesSearch && matchesStatus && matchesSource && matchesTag && matchesDate;
  });

  // Unique tags for suggestions and filter dropdown
  const allTags = Array.from(new Set(leads.flatMap(l => l.tags))).sort();

  // Helper to show toast
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setSourceFilter('All');
    setTagFilter('All');
    setDateFilter('All');
  };

  // Saved Filter Logic
  const handleSaveFilter = () => {
    if (!newFilterName.trim()) return;
    
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: newFilterName,
      criteria: {
        status: statusFilter,
        source: sourceFilter,
        tag: tagFilter,
        date: dateFilter,
        search: searchTerm
      }
    };
    
    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem('crm_saved_filters', JSON.stringify(updated));
    
    setShowSaveFilterModal(false);
    setNewFilterName('');
    setShowSavedViewsDropdown(false);
    showToast('Current view saved successfully');
  };

  const handleApplyFilter = (filter: SavedFilter) => {
    setStatusFilter(filter.criteria.status);
    setSourceFilter(filter.criteria.source);
    setTagFilter(filter.criteria.tag);
    setDateFilter(filter.criteria.date);
    setSearchTerm(filter.criteria.search);
    
    setShowSavedViewsDropdown(false);
    showToast(`Applied view: ${filter.name}`);
  };

  const handleDeleteFilter = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = savedFilters.filter(f => f.id !== id);
    setSavedFilters(updated);
    localStorage.setItem('crm_saved_filters', JSON.stringify(updated));
    showToast('Saved view deleted');
  };

  // Selection Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredLeads.map(l => l.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const isAllSelected = filteredLeads.length > 0 && selectedIds.size === filteredLeads.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < filteredLeads.length;

  // Batch Action Handlers
  const handleBatchDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.size} leads? This action cannot be undone.`)) {
      setLeads(prev => prev.filter(l => !selectedIds.has(l.id)));
      showToast(`Successfully deleted ${selectedIds.size} leads.`);
      setSelectedIds(new Set());
    }
  };

  const handleBatchTag = () => {
    if (!newTag.trim()) return;
    setLeads(prev => prev.map(lead => {
      if (selectedIds.has(lead.id) && !lead.tags.includes(newTag)) {
        return { ...lead, tags: [...lead.tags, newTag] };
      }
      return lead;
    }));
    showToast(`Added tag "${newTag}" to ${selectedIds.size} leads.`);
    setNewTag('');
    setShowTagModal(false);
    setSelectedIds(new Set());
  };

  const handleBatchEmail = () => {
    setIsSendingEmail(true);
    // Simulate API call
    setTimeout(() => {
      setIsSendingEmail(false);
      showToast(`Emails successfully queued for ${selectedIds.size} recipients.`);
      setSelectedIds(new Set());
    }, 1500);
  };

  // Import/Export Handlers
  const handleExport = () => {
    // Export selected items if any, otherwise export the current filtered view
    const dataToExport = selectedIds.size > 0 
      ? leads.filter(l => selectedIds.has(l.id))
      : filteredLeads;

    if (dataToExport.length === 0) {
      showToast('No leads to export', 'error');
      return;
    }

    const headers = ['Name', 'Company', 'Email', 'Phone', 'Status', 'Source', 'Tags', 'Last Contact'];
    const csvRows = [headers.join(',')];

    for (const lead of dataToExport) {
      const row = [
        `"${lead.name}"`,
        `"${lead.company}"`,
        `"${lead.email}"`,
        `"${lead.phone || ''}"`,
        `"${lead.status}"`,
        `"${lead.source}"`,
        `"${lead.tags.join(';')}"`, // Join tags with semicolon
        `"${lead.lastContact}"`
      ];
      csvRows.push(row.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Exported ${dataToExport.length} leads to CSV`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let newLeads: Lead[] = [];

        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            newLeads = parsed.map((l: any) => ({
                ...l,
                id: l.id || `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                activities: l.activities || [],
                tags: l.tags || []
            }));
          }
        } else if (file.name.endsWith('.csv')) {
           const lines = content.split('\n');
           // Simple CSV parser assuming headers in first row
           // Regex to handle commas inside quotes
           const splitCSV = (str: string) => str.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim());
           
           const headers = splitCSV(lines[0]).map(h => h.toLowerCase());
           
           for(let i=1; i<lines.length; i++) {
              if(!lines[i].trim()) continue;
              const values = splitCSV(lines[i]);
              
              if (values.length < headers.length) continue;

              const lead: any = {
                  id: `import_${Date.now()}_${i}`,
                  status: LeadStatus.NEW,
                  source: LeadSource.WEBSITE,
                  tags: [],
                  activities: [],
                  lastContact: new Date().toISOString(),
                  owner: 'Unassigned',
                  phone: ''
              };

              headers.forEach((h, index) => {
                  const val = values[index];
                  if (h === 'name') lead.name = val;
                  else if (h === 'company') lead.company = val;
                  else if (h === 'email') lead.email = val;
                  else if (h === 'phone') lead.phone = val;
                  else if (h === 'status') lead.status = Object.values(LeadStatus).includes(val as any) ? val : LeadStatus.NEW;
                  else if (h === 'source') lead.source = Object.values(LeadSource).includes(val as any) ? val : LeadSource.WEBSITE;
                  else if (h === 'tags') lead.tags = val ? val.split(';').map(t => t.trim()) : [];
              });

              if (lead.name && lead.email) {
                  newLeads.push(lead as Lead);
              }
           }
        } else {
          showToast('Unsupported file format. Please use .json or .csv', 'error');
          return;
        }

        if (newLeads.length > 0) {
          setLeads(prev => [...prev, ...newLeads]);
          showToast(`Imported ${newLeads.length} leads successfully`);
        } else {
          showToast('No valid leads found in file', 'error');
        }

      } catch (err) {
        console.error(err);
        showToast('Failed to parse file', 'error');
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 relative min-h-[500px] max-w-7xl mx-auto">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".csv,.json"
      />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800' : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-800'}`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leads</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and track your prospects.</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={handleImportClick}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
          >
            <Upload size={16} />
            Import
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
          >
            <Download size={16} />
            Export
          </button>
          <button className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md shadow-sky-600/20 text-sm">
            <Plus size={18} />
            Add New Lead
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
        {/* Top Row: Search and Quick Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search leads by name, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-700 dark:text-slate-200 placeholder-slate-400 bg-white dark:bg-slate-800 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
             {/* Saved Views Dropdown */}
             <div className="relative relative-dropdown">
                <button
                  onClick={() => setShowSavedViewsDropdown(!showSavedViewsDropdown)}
                  className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors w-full md:w-auto justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Bookmark size={16} className="text-sky-500" />
                    <span>Saved Views</span>
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${showSavedViewsDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {showSavedViewsDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowSavedViewsDropdown(false)}
                    ></div>
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                      <div className="py-2 max-h-60 overflow-y-auto">
                        <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">My Views</p>
                        {savedFilters.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-slate-500 italic text-center">
                            No saved views yet
                          </div>
                        ) : (
                          savedFilters.map(filter => (
                            <div key={filter.id} className="flex items-center justify-between px-2 py-1 mx-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 group cursor-pointer" onClick={() => handleApplyFilter(filter)}>
                              <span className="text-sm text-slate-700 dark:text-slate-200 font-medium px-2 truncate">{filter.name}</span>
                              <button 
                                onClick={(e) => handleDeleteFilter(e, filter.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="border-t border-slate-100 dark:border-slate-700 p-2">
                        <button 
                          onClick={() => { setShowSaveFilterModal(true); setShowSavedViewsDropdown(false); }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
                        >
                          <Plus size={14} /> Save Current View
                        </button>
                      </div>
                    </div>
                  </>
                )}
             </div>

            {(searchTerm || statusFilter !== 'All' || sourceFilter !== 'All' || tagFilter !== 'All' || dateFilter !== 'All') && (
              <button 
                onClick={resetFilters}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-sky-600 px-3 py-2 rounded-lg hover:bg-sky-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                <RefreshCw size={14} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Dropdown Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wide">Status</label>
            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-sky-500 bg-white dark:bg-slate-800 appearance-none transition-colors"
              >
                <option value="All">All Statuses</option>
                {Object.values(LeadStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Source Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wide">Source</label>
            <div className="relative">
              <select 
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-sky-500 bg-white dark:bg-slate-800 appearance-none transition-colors"
              >
                <option value="All">All Sources</option>
                {Object.values(LeadSource).map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
              <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Tag Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wide">Tags</label>
            <div className="relative">
              <select 
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-sky-500 bg-white dark:bg-slate-800 appearance-none transition-colors"
              >
                <option value="All">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
              <Tag size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Date Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wide">Last Contact</label>
            <div className="relative">
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-sky-500 bg-white dark:bg-slate-800 appearance-none transition-colors"
              >
                <option value="All">Any Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="older">More than 3 Months</option>
              </select>
              <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-20">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                <th className="px-6 py-4 w-10">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-sky-600 focus:ring-sky-500 dark:bg-slate-700 cursor-pointer"
                      checked={isAllSelected}
                      ref={input => { if (input) input.indeterminate = isIndeterminate; }}
                      onChange={handleSelectAll}
                    />
                  </div>
                </th>
                <th className="px-6 py-4">Lead Name</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Last Contact</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredLeads.map((lead) => (
                <tr 
                  key={lead.id} 
                  className={`transition-colors group ${selectedIds.has(lead.id) ? 'bg-sky-50/60 dark:bg-sky-900/20' : 'hover:bg-slate-50/80 dark:hover:bg-slate-700/50'}`}
                >
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-sky-600 focus:ring-sky-500 dark:bg-slate-700 cursor-pointer"
                      checked={selectedIds.has(lead.id)}
                      onChange={() => toggleSelection(lead.id)}
                    />
                  </td>
                  <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/leads/${lead.id}`)}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-sm">
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{lead.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{lead.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium cursor-pointer" onClick={() => navigate(`/leads/${lead.id}`)}>
                    {lead.company}
                  </td>
                  <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/leads/${lead.id}`)}>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${STATUS_COLORS[lead.status]}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 cursor-pointer" onClick={() => navigate(`/leads/${lead.id}`)}>
                    {lead.source}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 cursor-pointer" onClick={() => navigate(`/leads/${lead.id}`)}>
                    {new Date(lead.lastContact).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg" title="Email">
                        <Mail size={16} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg" title="Call">
                        <Phone size={16} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg" title="Schedule">
                        <Calendar size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                       <Filter size={32} className="text-slate-300 dark:text-slate-600 mb-2" />
                       <p className="font-medium text-slate-900 dark:text-white">No leads found</p>
                       <p className="text-sm">Try adjusting your filters or search terms.</p>
                       <button onClick={resetFilters} className="text-sky-600 dark:text-sky-400 text-sm font-medium hover:underline mt-2">
                         Clear all filters
                       </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
          <span className="font-medium">Showing {filteredLeads.length} leads</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors font-medium" disabled>Previous</button>
            <button className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors font-medium" disabled>Next</button>
          </div>
        </div>
      </div>

      {/* Batch Action Floating Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-[calc(50%+9rem)] bg-[#0f172a] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-40 animate-in slide-in-from-bottom-4 duration-300 border border-slate-700">
          <div className="flex items-center gap-3">
             <span className="bg-sky-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{selectedIds.size}</span>
             <span className="font-medium text-sm text-slate-200">Selected</span>
          </div>
          <div className="h-4 w-px bg-slate-700"></div>
          <div className="flex items-center gap-2">
             <button 
              onClick={handleBatchEmail}
              disabled={isSendingEmail}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium disabled:opacity-50"
            >
               {isSendingEmail ? (
                 <span className="animate-pulse">Sending...</span>
               ) : (
                 <>
                  <Mail size={16} /> Send Email
                 </>
               )}
             </button>
             <button 
               onClick={() => setShowTagModal(true)}
               className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium"
             >
               <Tag size={16} /> Add Tag
             </button>
             <button 
               onClick={handleBatchDelete}
               className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-red-900/50 text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
             >
               <Trash2 size={16} /> Delete
             </button>
          </div>
          <div className="h-4 w-px bg-slate-700 ml-2"></div>
          <button 
            onClick={() => setSelectedIds(new Set())}
            className="text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Add Tag Modal */}
      {showTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 transform transition-all scale-100 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Tag to {selectedIds.size} Leads</h3>
            <input 
              type="text" 
              autoFocus
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none mb-4"
              placeholder="Enter tag name (e.g. 'Priority')"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBatchTag()}
            />
            
            {/* Suggested Tags */}
            {allTags.length > 0 && (
              <div className="mb-6">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 uppercase font-semibold">Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button 
                      key={tag}
                      onClick={() => setNewTag(tag)}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs rounded-md border border-slate-200 dark:border-slate-600 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setShowTagModal(false); setNewTag(''); }}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleBatchTag}
                disabled={!newTag.trim()}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 text-sm font-medium disabled:opacity-50"
              >
                Add Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Filter Modal */}
      {showSaveFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 transform transition-all scale-100 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Save Custom View</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Give your current filter combination a name to easily access it later.</p>
            <input 
              type="text" 
              autoFocus
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none mb-6"
              placeholder="e.g. 'High Value - Tech'"
              value={newFilterName}
              onChange={(e) => setNewFilterName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveFilter()}
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setShowSaveFilterModal(false); setNewFilterName(''); }}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveFilter}
                disabled={!newFilterName.trim()}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={16} /> Save View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadList;