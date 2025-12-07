import React from 'react';
import { MOCK_TASKS } from '../constants';
import { CheckSquare, Calendar, AlertCircle } from 'lucide-react';

const Tasks: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-500">Stay on top of your follow-ups.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
          + New Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['High', 'Medium', 'Low'].map((priority) => {
          const tasks = MOCK_TASKS.filter(t => t.priority === priority.toLowerCase());
          const colorClass = priority === 'High' ? 'text-red-600 bg-red-50' : priority === 'Medium' ? 'text-amber-600 bg-amber-50' : 'text-blue-600 bg-blue-50';
          const dotClass = priority === 'High' ? 'bg-red-500' : priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500';

          return (
            <div key={priority} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${dotClass}`}></span>
                  {priority} Priority
                </h3>
                <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-600 font-medium">{tasks.length}</span>
              </div>
              
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                     <div className="flex items-start gap-3">
                       <button className="mt-0.5 text-slate-300 hover:text-indigo-600 transition-colors">
                         <CheckSquare size={20} />
                       </button>
                       <div className="flex-1">
                         <p className={`text-sm font-medium text-slate-900 ${task.completed ? 'line-through text-slate-400' : ''}`}>
                           {task.title}
                         </p>
                         {task.relatedLeadName && (
                           <p className="text-xs text-indigo-600 mt-1 hover:underline">
                             Linked to: {task.relatedLeadName}
                           </p>
                         )}
                         <div className="flex items-center gap-3 mt-3">
                           <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md ${new Date(task.dueDate) < new Date() ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
                              <Calendar size={12} />
                              {new Date(task.dueDate).toLocaleDateString()}
                           </div>
                           <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                             SJ
                           </div>
                         </div>
                       </div>
                     </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                    <p className="text-sm text-slate-400">No {priority.toLowerCase()} priority tasks.</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default Tasks;