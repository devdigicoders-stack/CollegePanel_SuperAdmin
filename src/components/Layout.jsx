import { useState } from 'react';
import { 
  Menu, Search, Maximize, User, ChevronDown, Home,
  Building2, FileText, 
  PlayCircle, StopCircle, Plus, X, LogOut
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const superadminInfo = JSON.parse(localStorage.getItem('superadmin_info') || '{}');
  const avatarUrl = superadminInfo.profileImage 
    ? `${import.meta.env.VITE_API_URL.replace('/api', '')}${superadminInfo.profileImage}`
    : null;

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <span className="font-semibold text-gray-800">Are you sure you want to logout?</span>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              localStorage.removeItem('superadmin_token');
              localStorage.removeItem('superadmin_info');
              setIsSidebarOpen(false);
              navigate('/login');
              toast.success('Logged out successfully');
            }}
            className="px-3 py-1.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  return (
    <div className="flex h-screen bg-[#f3f5f8] overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[260px] bg-[#1a2035] text-white flex flex-col 
        transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between lg:justify-center h-[70px] border-b border-gray-700/50 px-4">
          <div className="flex items-center gap-3">
             <div className="bg-transparent border border-purple-500/30 p-1.5 rounded-lg flex items-center justify-center">
               <Building2 size={22} className="text-[#8b5cf6]"/>
             </div>
             <span className="font-bold text-[15px] tracking-wide text-gray-100">POLYTECHNIC ERP</span>
          </div>
          <button 
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-5 custom-scrollbar">
          <div className="px-4 mb-4">
            <Link to="/dashboard" onClick={() => setIsSidebarOpen(false)}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${isActive('/dashboard') ? 'bg-[#5a4bda] shadow-lg shadow-indigo-500/20' : 'hover:bg-gray-800/50'}`}>
                <Home size={20} className={isActive('/dashboard') ? 'text-white' : 'text-gray-400'} />
                <span className={`text-sm font-semibold ${isActive('/dashboard') ? 'text-white' : 'text-gray-300'}`}>Dashboard</span>
              </div>
            </Link>
          </div>

          <div className="mt-6">
            <span className="px-8 text-[11px] font-bold text-gray-500 tracking-wider uppercase">COLLEGES</span>
            <ul className="mt-3 space-y-1.5 px-4">
              <li>
                <Link to="/all-colleges" onClick={() => setIsSidebarOpen(false)}>
                  <div className={`flex items-center justify-between px-4 py-2.5 text-[13px] rounded-lg cursor-pointer transition-colors ${isActive('/all-colleges') ? 'bg-[#5a4bda]/10 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800/50'}`}>
                    <div className="flex items-center gap-3">
                      <Building2 size={18} className={isActive('/all-colleges') ? 'text-[#8b5cf6]' : 'text-gray-400'} />
                      <span className="font-medium">All Colleges</span>
                    </div>
                  </div>
                </Link>
              </li>
              <li>
                <Link to="/create-college" onClick={() => setIsSidebarOpen(false)}>
                  <div className={`flex items-center gap-3 px-4 py-2.5 text-[13px] rounded-lg cursor-pointer transition-colors ${isActive('/create-college') ? 'bg-[#5a4bda]/10 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800/50'}`}>
                    <Plus size={18} className={isActive('/create-college') ? 'text-[#8b5cf6]' : 'text-gray-400'} />
                    <span className="font-medium">Create College</span>
                  </div>
                </Link>
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <span className="px-8 text-[11px] font-bold text-gray-500 tracking-wider uppercase">COLLEGE ADMINS</span>
            <ul className="mt-3 space-y-1.5 px-4">
              <li>
                <Link to="/all-admins" onClick={() => setIsSidebarOpen(false)}>
                  <div className={`flex items-center justify-between px-4 py-2.5 text-[13px] rounded-lg cursor-pointer transition-colors ${isActive('/all-admins') ? 'bg-[#5a4bda]/10 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800/50'}`}>
                    <div className="flex items-center gap-3">
                      <User size={18} className={isActive('/all-admins') ? 'text-[#8b5cf6]' : 'text-gray-400'} />
                      <span className="font-medium">All Admins</span>
                    </div>
                  </div>
                </Link>
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <span className="px-8 text-[11px] font-bold text-gray-500 tracking-wider uppercase">REPORTS</span>
            <ul className="mt-3 space-y-1.5 px-4">
              <li>
                <Link to="/reports" onClick={() => setIsSidebarOpen(false)}>
                  <div className={`flex items-center justify-between px-4 py-2.5 text-[13px] rounded-lg cursor-pointer transition-colors ${isActive('/reports') ? 'bg-[#5a4bda]/10 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800/50'}`}>
                    <div className="flex items-center gap-3">
                      <FileText size={18} className={isActive('/reports') ? 'text-[#8b5cf6]' : 'text-gray-400'} />
                      <span className="font-medium">View Reports</span>
                    </div>
                  </div>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Logout Button - Fixed at bottom */}
        <div className="px-4 py-4 border-t border-gray-700/50 shrink-0">
          <div onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-red-400 hover:text-white hover:bg-red-500/20 transition-all group">
            <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
            <span className="text-[13px] font-semibold">Logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-5">
            <button 
              className="text-gray-500 hover:text-gray-800 transition-colors p-1"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            {/* Title depends on route, but for now we let pages handle their own headers or we can keep it dynamic */}
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 tracking-tight hidden sm:block">
              {location.pathname === '/create-college' ? 'Create College' : 'Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-5">

            
            <Link to="/profile" className="flex items-center gap-2 sm:gap-3 sm:pl-5 sm:border-l border-gray-200 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Admin" className="w-full h-full object-cover" />
                ) : (
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(superadminInfo.name || 'Admin')}&background=5a4bda&color=fff`} 
                    alt="Admin Placeholder" 
                    className="w-full h-full object-cover" 
                  />
                )}
              </div>
              <div className="hidden sm:block">
                <p className="text-[13px] font-bold text-gray-800 leading-tight">{superadminInfo.name}</p>
                <p className="text-[11px] font-medium text-gray-500">Super Admin</p>
              </div>
              <ChevronDown size={16} className="text-gray-400 hidden sm:block ml-1"/>
            </Link>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-[#f8f9fc] w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
