import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Settings, 
  Cloud, 
  Bell, 
  Search,
  Menu,
  X,
  LogOut,
  HelpCircle
} from 'lucide-react';

const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/leads', label: 'Leads', icon: <Users size={20} /> },
    { to: '/tasks', label: 'Tasks', icon: <CheckSquare size={20} /> },
    { to: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-inter">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-[#0f172a] text-white border-r border-slate-800 transition-all duration-300">
        {/* Brand Section */}
        <div className="flex items-center gap-3 px-8 h-20 border-b border-slate-800/50 bg-[#0f172a]">
          <div className="relative">
            <div className="absolute inset-0 bg-sky-500 blur-sm opacity-50 rounded-full"></div>
            <Cloud className="text-sky-400 relative z-10" size={28} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight leading-none text-white">OneSource</span>
            <span className="text-[10px] font-medium text-sky-400 tracking-widest uppercase mt-1">Cloud CRM</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-8 px-4 space-y-2">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-sky-600/10 text-sky-400 border border-sky-600/20 shadow-[0_0_15px_rgba(56,189,248,0.1)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`
              }
            >
              <span className={({ isActive }: { isActive: boolean }) => isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-white'}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
              {item.label === 'Tasks' && (
                <span className="ml-auto bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
              )}
            </NavLink>
          ))}

          <div className="pt-8">
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Support</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
              <HelpCircle size={20} />
              <span className="font-medium">Help Center</span>
            </button>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-800/50 bg-[#0B1120]">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-sm font-bold shadow-lg text-white">
                SJ
              </div>
              <div>
                <p className="text-sm font-semibold text-white group-hover:text-sky-400 transition-colors">Sarah Johnson</p>
                <p className="text-xs text-slate-400">Sales Manager</p>
              </div>
            </div>
            <LogOut size={16} className="text-slate-500 hover:text-white transition-colors" />
          </div>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#0f172a] text-white md:hidden flex flex-col animate-in slide-in-from-left duration-200">
           <div className="flex items-center justify-between px-6 h-20 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <Cloud className="text-sky-400" size={24} />
              <span className="font-bold text-lg">OneSource</span>
            </div>
            <button onClick={toggleMobileMenu} className="text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 py-6 px-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={toggleMobileMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                {item.icon}
                <span className="font-medium text-lg">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:px-10 z-10">
          <div className="flex items-center gap-4">
            <button onClick={toggleMobileMenu} className="md:hidden text-slate-500 hover:text-slate-700">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 hidden md:block">
              <span className="text-slate-400 font-normal">OneSource / </span>
              Dashboard
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center relative group">
              <Search size={18} className="absolute left-3 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent focus:border-sky-200 rounded-full text-sm w-64 focus:outline-none focus:ring-4 focus:ring-sky-500/10 text-slate-700 placeholder-slate-400 transition-all"
              />
            </div>
            
            <button className="relative p-2.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content Scrollable Area */}
        <main className="flex-1 overflow-auto bg-[#F8FAFC] p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;