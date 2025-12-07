import React, { useState, useRef } from 'react';
import { Mail, User, Shield, Bell, Plus, Trash2, Edit2, Save, X, ChevronRight, Layout } from 'lucide-react';
import { MOCK_TEMPLATES } from '../constants';
import { EmailTemplate } from '../types';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState<EmailTemplate[]>(MOCK_TEMPLATES);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null);
  
  const bodyInputRef = useRef<HTMLTextAreaElement>(null);

  const tabs = [
    { id: 'general', label: 'General', icon: <Layout size={18} /> },
    { id: 'templates', label: 'Email Templates', icon: <Mail size={18} /> },
    { id: 'team', label: 'Team & Roles', icon: <User size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
  ];

  const handleEdit = (template: EmailTemplate) => {
    setCurrentTemplate({ ...template });
    setIsEditing(true);
  };

  const handleCreate = () => {
    setCurrentTemplate({
      id: `temp_${Date.now()}`,
      name: 'New Template',
      subject: '',
      body: '',
      lastModified: new Date().toISOString().split('T')[0]
    });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleSave = () => {
    if (!currentTemplate) return;
    
    setTemplates(prev => {
      const exists = prev.find(t => t.id === currentTemplate.id);
      if (exists) {
        return prev.map(t => t.id === currentTemplate.id ? { ...currentTemplate, lastModified: new Date().toISOString().split('T')[0] } : t);
      } else {
        return [...prev, { ...currentTemplate, lastModified: new Date().toISOString().split('T')[0] }];
      }
    });
    setIsEditing(false);
    setCurrentTemplate(null);
  };

  const insertVariable = (variable: string) => {
    if (!currentTemplate || !bodyInputRef.current) return;
    
    const start = bodyInputRef.current.selectionStart;
    const end = bodyInputRef.current.selectionEnd;
    const text = currentTemplate.body;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    
    const newBody = before + variable + after;
    
    setCurrentTemplate({ ...currentTemplate, body: newBody });
    
    // Defer focus restoration to allow state update to render
    setTimeout(() => {
      if (bodyInputRef.current) {
        bodyInputRef.current.focus();
        bodyInputRef.current.setSelectionRange(start + variable.length, start + variable.length);
      }
    }, 0);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex-shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-fit">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-semibold text-slate-800">System Settings</h2>
        </div>
        <nav className="p-2 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setIsEditing(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                {tab.icon}
                {tab.label}
              </div>
              {activeTab === tab.id && <ChevronRight size={16} />}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {activeTab === 'templates' ? (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Email Templates</h3>
                <p className="text-xs text-slate-500">Manage standard replies and outreach templates.</p>
              </div>
              {!isEditing && (
                <button 
                  onClick={handleCreate}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus size={16} /> New Template
                </button>
              )}
            </div>

            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              {!isEditing ? (
                <div className="grid gap-4">
                  {templates.map(template => (
                    <div key={template.id} className="group border border-slate-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-sm transition-all bg-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-slate-900">{template.name}</h4>
                          <p className="text-sm text-slate-500 mt-1">Subject: <span className="text-slate-700 italic">{template.subject}</span></p>
                          <p className="text-xs text-slate-400 mt-2">Last modified: {template.lastModified}</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(template)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(template.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {templates.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                      No templates found. Create one to get started.
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col h-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="space-y-4 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Template Name</label>
                        <input 
                          type="text" 
                          value={currentTemplate?.name}
                          onChange={(e) => setCurrentTemplate(prev => prev ? { ...prev, name: e.target.value } : null)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                          placeholder="e.g., Intro Email"
                        />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Subject Line</label>
                         <input 
                          type="text" 
                          value={currentTemplate?.subject}
                          onChange={(e) => setCurrentTemplate(prev => prev ? { ...prev, subject: e.target.value } : null)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                          placeholder="Email subject..."
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col flex-1 h-[calc(100%-140px)]">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-slate-700">Email Body</label>
                        <div className="flex gap-2 text-xs">
                          <span className="text-slate-400">Insert variable:</span>
                          {['{{Customer Name}}', '{{Company Name}}', '{{My Name}}'].map(v => (
                            <button 
                              key={v}
                              onClick={() => insertVariable(v)}
                              className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 transition-colors font-medium code"
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea 
                        ref={bodyInputRef}
                        value={currentTemplate?.body}
                        onChange={(e) => setCurrentTemplate(prev => prev ? { ...prev, body: e.target.value } : null)}
                        className="w-full flex-1 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-mono leading-relaxed resize-none"
                        placeholder="Hi {{Customer Name}}..."
                        style={{ minHeight: '300px' }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm transition-colors"
                    >
                      <Save size={16} /> Save Template
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              {tabs.find(t => t.id === activeTab)?.icon}
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">{tabs.find(t => t.id === activeTab)?.label} Settings</h3>
            <p>This section is under development.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;