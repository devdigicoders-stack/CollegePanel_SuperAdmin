import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, CheckCircle2, XCircle, Clock, Search, 
  Building2, Phone, Mail, User, ShieldCheck, 
  Lock, Unlock, Filter, RefreshCw, ExternalLink,
  MessageCircle, ArrowUpRight, Bed, UtensilsCrossed, 
  Library, AlertCircle, ShieldAlert, Check, X, DoorOpen,
  Eye, Calendar, Info, ChevronRight, Layers, Sliders
} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

export const ALL_CAMPUS_MODULES = [
  {
    key: 'hostel',
    name: 'Hostel Management',
    desc: 'Rooms, Bed Allotment, In/Out, Assets & Leaves',
    icon: Bed,
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  {
    key: 'mess',
    name: 'Mess Management',
    desc: 'Meal Menus, Student Enrollment, Stock & Food Logs',
    icon: UtensilsCrossed,
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  {
    key: 'library',
    name: 'Library Management',
    desc: 'Books Catalog, Issue/Return Desk & Automated Fines',
    icon: Library,
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  {
    key: 'complaints',
    name: 'Complaint & Discipline',
    desc: 'Student Complaints, Room Issues & Action Logs',
    icon: ShieldAlert,
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200'
  },
  {
    key: 'security',
    name: 'Campus Security & Gatepass',
    desc: 'Gate Security, Visitor Logs & Check-in Desk',
    icon: DoorOpen,
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200'
  },
  {
    key: 'all',
    name: '⚡ Full Premium Suite (All Modules)',
    desc: 'Master switch to unlock/lock all 5 modules simultaneously',
    icon: Sparkles,
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
  }
];

const UpgradeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, locked: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [processingModuleKey, setProcessingModuleKey] = useState(null);

  // Full Details Modal state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedTab !== 'All') params.append('status', selectedTab);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const res = await axiosInstance.get(`/upgrade-requests/superadmin?${params}`);
      setRequests(res.data.requests || []);
      if (res.data.stats) setStats(res.data.stats);
    } catch (err) {
      console.error('Error fetching upgrade requests:', err);
      toast.error('Failed to load upgrade requests');
    } finally {
      setLoading(false);
    }
  }, [selectedTab, searchTerm]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Approve & Unlock
  const handleApprove = async (request) => {
    if (!window.confirm(`Are you sure you want to UNLOCK / ACTIVATE "${request.moduleName}" for ${request.collegeName}?`)) {
      return;
    }

    try {
      setProcessingId(request._id);
      const res = await axiosInstance.patch(`/upgrade-requests/superadmin/${request._id}/approve`);
      toast.success(res.data.message || 'Module unlocked and activated successfully!');
      
      if (selectedRequest && selectedRequest._id === request._id) {
        setSelectedRequest(prev => ({
          ...prev,
          status: 'Approved',
          collegeId: {
            ...prev.collegeId,
            isPremiumUnlocked: res.data.college?.isPremiumUnlocked,
            unlockedModules: res.data.college?.unlockedModules || []
          }
        }));
      }
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  // Lock & Deactivate
  const handleLock = async (request) => {
    if (!window.confirm(`Are you sure you want to LOCK / DEACTIVATE "${request.moduleName}" for ${request.collegeName}? This will immediately restrict access for that college admin.`)) {
      return;
    }

    try {
      setProcessingId(request._id);
      const res = await axiosInstance.patch(`/upgrade-requests/superadmin/${request._id}/lock`);
      toast.success(res.data.message || 'Module locked and deactivated successfully!');
      
      if (selectedRequest && selectedRequest._id === request._id) {
        setSelectedRequest(prev => ({
          ...prev,
          status: 'Locked',
          collegeId: {
            ...prev.collegeId,
            isPremiumUnlocked: res.data.college?.isPremiumUnlocked,
            unlockedModules: res.data.college?.unlockedModules || []
          }
        }));
      }
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to lock request');
    } finally {
      setProcessingId(null);
    }
  };

  // Reject Request
  const handleReject = async (request) => {
    const reason = window.prompt(`Enter rejection reason for ${request.collegeName} (optional):`, 'License criteria not met');
    if (reason === null) return;

    try {
      setProcessingId(request._id);
      const res = await axiosInstance.patch(`/upgrade-requests/superadmin/${request._id}/reject`, { notes: reason });
      toast.success(res.data.message || 'Request rejected');
      
      if (selectedRequest && selectedRequest._id === request._id) {
        setSelectedRequest(prev => ({ ...prev, status: 'Rejected' }));
      }
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  // Direct toggle individual module for a college from Details Modal
  const handleToggleModule = async (collegeId, moduleKey, currentStatus) => {
    try {
      const enable = !currentStatus;
      setProcessingModuleKey(moduleKey);
      const res = await axiosInstance.patch(`/upgrade-requests/superadmin/college/${collegeId}/toggle-module`, {
        moduleKey,
        enable
      });
      toast.success(res.data.message || `Module ${enable ? 'unlocked' : 'locked'}!`);

      // Update local state in modal
      setSelectedRequest(prev => {
        if (!prev) return null;
        return {
          ...prev,
          collegeId: {
            ...prev.collegeId,
            isPremiumUnlocked: res.data.college?.isPremiumUnlocked,
            unlockedModules: res.data.college?.unlockedModules || []
          }
        };
      });

      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle module');
    } finally {
      setProcessingModuleKey(null);
    }
  };

  const isModuleActiveForCollege = (collegeObj, moduleKey) => {
    if (!collegeObj) return false;
    if (collegeObj.isPremiumUnlocked) return true;
    const unlocked = collegeObj.unlockedModules || [];
    if (unlocked.includes('all')) return true;
    return unlocked.includes(moduleKey);
  };

  const renderSingleBadge = (k, customLabel) => {
    let icon = Sparkles;
    let color = 'bg-amber-50 text-amber-800 border-amber-200';
    let label = customLabel || k?.toUpperCase();

    if (k === 'hostel') {
      icon = Bed;
      color = 'bg-blue-50 text-blue-800 border-blue-200';
      label = customLabel || 'HOSTEL';
    } else if (k === 'mess') {
      icon = UtensilsCrossed;
      color = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      label = customLabel || 'MESS';
    } else if (k === 'library') {
      icon = Library;
      color = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      label = customLabel || 'LIBRARY';
    } else if (k === 'complaints') {
      icon = ShieldAlert;
      color = 'bg-rose-50 text-rose-800 border-rose-200';
      label = customLabel || 'COMPLAINTS';
    } else if (k === 'security') {
      icon = DoorOpen;
      color = 'bg-teal-50 text-teal-800 border-teal-200';
      label = customLabel || 'SECURITY';
    } else if (k === 'all') {
      icon = Sparkles;
      color = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      label = '⚡ FULL SUITE';
    }

    const IconComp = icon;
    return (
      <span key={k} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border shadow-2xs ${color}`}>
        <IconComp size={12} />
        {label}
      </span>
    );
  };

  const getModuleBadge = (key, name, moduleKeys) => {
    if (key === 'all' || name?.includes('Full Premium Suite')) {
      return renderSingleBadge('all', '⚡ FULL SUITE (ALL)');
    }

    let keys = [];
    if (Array.isArray(moduleKeys) && moduleKeys.length > 0) {
      keys = moduleKeys;
    } else if (key && key.includes(',')) {
      keys = key.split(',').map(s => s.trim());
    } else if (key) {
      keys = [key];
    }

    if (keys.length > 1) {
      return (
        <div className="flex flex-wrap gap-1.5 max-w-xs">
          {keys.map(k => renderSingleBadge(k))}
        </div>
      );
    }

    return renderSingleBadge(keys[0] || 'all', name);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1a2035] via-[#242d4a] to-[#1a2035] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#008744]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
                <Sparkles size={11} className="stroke-[3]" />
                CAMPUS LICENSING & ACCESS CONTROL
              </span>
              <span className="text-xs text-gray-300 font-medium">
                Live Module Management
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Premium Upgrade & License Control
            </h1>
            <p className="text-sm text-gray-300 mt-1 max-w-xl">
              Manage real-time module activation requests. Approve, lock/deactivate, or toggle individual premium modules per college with full isolation.
            </p>
          </div>

          <button
            onClick={fetchRequests}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs backdrop-blur-sm border border-white/15 flex items-center gap-2 transition-all self-stretch sm:self-auto justify-center"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-amber-400' : ''} />
            Refresh Requests
          </button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#008744] flex items-center justify-center font-bold flex-shrink-0">
            <Building2 size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-[11.5px] font-medium text-gray-500">Total Submissions</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-amber-100 bg-amber-50/20 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold flex-shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-800">{stats.pending}</div>
            <div className="text-[11.5px] font-semibold text-amber-700">Pending Review</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-emerald-100 bg-emerald-50/20 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-800">{stats.approved}</div>
            <div className="text-[11.5px] font-semibold text-emerald-700">Active / Unlocked</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 bg-slate-50/40 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold flex-shrink-0">
            <Lock size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{stats.locked || 0}</div>
            <div className="text-[11.5px] font-semibold text-slate-600">Locked / Inactive</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3.5 col-span-2 lg:col-span-1">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold flex-shrink-0">
            <XCircle size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-800">{stats.rejected}</div>
            <div className="text-[11.5px] font-medium text-rose-600">Rejected / Closed</div>
          </div>
        </div>

      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Controls Bar: Search & Status Tabs */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
            {['All', 'Pending', 'Approved', 'Locked', 'Rejected'].map((tab) => {
              const isActive = selectedTab === tab;
              let count = null;
              if (tab === 'Pending') count = stats.pending;
              if (tab === 'Approved') count = stats.approved;
              if (tab === 'Locked') count = stats.locked;
              if (tab === 'Rejected') count = stats.rejected;

              return (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab === 'Approved' ? 'Active' : tab === 'Locked' ? 'Locked' : tab}
                  {count !== null && count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-slate-900 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search college, person, phone, module..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#008744]/20 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#008744]" />
              <p className="text-xs font-medium">Loading upgrade requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-14 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto text-gray-400 mb-3">
                <Sparkles size={24} />
              </div>
              <h3 className="text-sm font-bold text-gray-800">No Requests Found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {selectedTab === 'Pending' 
                  ? 'There are no pending requests right now. All requests have been processed.'
                  : 'No module upgrade requests match your current filters.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5 min-w-[220px]">College Info</th>
                  <th className="py-3.5 px-4 min-w-[170px]">Contact Person</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Requested Module(s)</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Submitted Date</th>
                  <th className="py-3.5 px-4 min-w-[150px]">Current Status</th>
                  <th className="py-3.5 px-5 text-right min-w-[220px]">Actions & Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {requests.map((req) => {
                  const isPending = req.status === 'Pending';
                  const isApproved = req.status === 'Approved';
                  const isLocked = req.status === 'Locked' || req.status === 'Inactive';
                  const isRejected = req.status === 'Rejected';
                  const isProcessing = processingId === req._id;

                  return (
                    <tr 
                      key={req._id} 
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      onClick={() => {
                        setSelectedRequest(req);
                        setShowDetailsModal(true);
                      }}
                    >
                      
                      {/* College Info */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-gray-900 text-[13px] group-hover:text-[#008744] transition-colors">
                          {req.collegeName}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                          <span className="bg-gray-100 text-gray-700 px-1.5 py-0.2 rounded font-mono font-bold text-[10px]">
                            {req.collegeId?.collegeCode || 'COLLEGE'}
                          </span>
                          <span>•</span>
                          <span>{req.collegeId?.collegeType || 'Institution'}</span>
                        </div>
                        {req.collegeId?.adminEmail && (
                          <div className="text-[10.5px] text-gray-400 mt-0.5 truncate max-w-[200px]">
                            {req.collegeId.adminEmail}
                          </div>
                        )}
                      </td>

                      {/* Contact Person */}
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                          <User size={13} className="text-gray-400" />
                          {req.contactPerson}
                        </div>
                        <div className="mt-1 flex items-center gap-2.5 text-[11px] text-gray-600">
                          <a 
                            href={`tel:${req.phone}`} 
                            className="hover:text-[#008744] flex items-center gap-1 font-mono font-medium"
                            title="Call Contact"
                          >
                            <Phone size={11} className="text-gray-400" />
                            {req.phone}
                          </a>
                          <a
                            href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 font-bold"
                            title="Open WhatsApp"
                          >
                            <MessageCircle size={12} />
                            Chat
                          </a>
                        </div>
                      </td>

                      {/* Requested Module */}
                      <td className="py-4 px-4">
                        {getModuleBadge(req.moduleKey, req.moduleName, req.moduleKeys)}
                        {req.notes && (
                          <p className="text-[10.5px] text-gray-400 mt-1 italic max-w-xs truncate">
                            Note: {req.notes}
                          </p>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="py-4 px-4 text-gray-500 whitespace-nowrap">
                        <div className="font-medium text-gray-800">
                          {new Date(req.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {new Date(req.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock size={12} />
                            Pending Review
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <CheckCircle2 size={12} />
                            Unlocked & Active
                          </span>
                        )}
                        {isLocked && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                            <Lock size={12} className="text-slate-600" />
                            Locked / Inactive
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            <XCircle size={12} />
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(req)}
                                disabled={isProcessing}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-all flex items-center gap-1 disabled:opacity-50"
                                title="Approve and unlock requested modules"
                              >
                                <Check size={13} className="stroke-[3]" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(req)}
                                disabled={isProcessing}
                                className="px-2 py-1.5 rounded-lg bg-gray-100 hover:bg-rose-50 text-gray-600 hover:text-rose-700 font-semibold text-[11px] transition-all flex items-center gap-1 disabled:opacity-50"
                                title="Reject request"
                              >
                                <X size={13} />
                                Reject
                              </button>
                            </>
                          )}

                          {isApproved && (
                            <button
                              onClick={() => handleLock(req)}
                              disabled={isProcessing}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[11px] shadow-2xs transition-all flex items-center gap-1 disabled:opacity-50"
                              title="Lock modules and make inactive for this college"
                            >
                              <Lock size={12} className="text-amber-800" />
                              Lock / Inactivate
                            </button>
                          )}

                          {isLocked && (
                            <button
                              onClick={() => handleApprove(req)}
                              disabled={isProcessing}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-all flex items-center gap-1 disabled:opacity-50"
                              title="Re-unlock and activate modules"
                            >
                              <Unlock size={12} />
                              Unlock / Activate
                            </button>
                          )}

                          {isRejected && (
                            <button
                              onClick={() => handleApprove(req)}
                              disabled={isProcessing}
                              className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition-colors"
                            >
                              Re-approve
                            </button>
                          )}

                          {/* Full Details & Module Control Modal Trigger */}
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setShowDetailsModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-slate-200 text-gray-700 transition-colors"
                            title="View Full Details & Module Controls"
                          >
                            <Eye size={15} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* Full Details & Live Module Control Center Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#1a2035] via-[#242d4a] to-[#1a2035] p-5 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
                  <Sliders size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-white leading-tight">
                      {selectedRequest.collegeName}
                    </h3>
                    <span className="bg-white/20 text-white text-[10px] font-mono px-2 py-0.5 rounded-md font-bold">
                      {selectedRequest.collegeId?.collegeCode || 'COLLEGE'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-0.5 flex items-center gap-2">
                    <span>{selectedRequest.collegeId?.collegeType || 'Institution'}</span>
                    <span>•</span>
                    <span>{selectedRequest.collegeId?.adminEmail || 'admin@college.com'}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              
              {/* Request Overview Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Info size={13} className="text-[#008744]" />
                    Upgrade Request Details
                  </span>
                  <div>
                    {selectedRequest.status === 'Approved' && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10.5px]">
                        Active & Unlocked
                      </span>
                    )}
                    {(selectedRequest.status === 'Locked' || selectedRequest.status === 'Inactive') && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 font-bold text-[10.5px]">
                        Locked / Inactive
                      </span>
                    )}
                    {selectedRequest.status === 'Pending' && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10.5px]">
                        Pending Review
                      </span>
                    )}
                    {selectedRequest.status === 'Rejected' && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10.5px]">
                        Rejected
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <span className="text-[10.5px] font-bold text-slate-400 block uppercase">Requester Contact</span>
                    <div className="font-semibold text-slate-800 mt-0.5 text-[12.5px]">
                      {selectedRequest.contactPerson}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-slate-600 font-mono">
                      <span>{selectedRequest.phone}</span>
                      <a
                        href={`https://wa.me/${selectedRequest.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 font-bold hover:underline flex items-center gap-0.5 text-[11px]"
                      >
                        <MessageCircle size={11} /> WhatsApp
                      </a>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10.5px] font-bold text-slate-400 block uppercase">Requested Module(s)</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {getModuleBadge(selectedRequest.moduleKey, selectedRequest.moduleName, selectedRequest.moduleKeys)}
                    </div>
                    <div className="text-[10.5px] text-slate-400 mt-1">
                      Submitted on: {new Date(selectedRequest.createdAt).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {selectedRequest.notes && (
                  <div className="pt-2 border-t border-slate-200 text-[11.5px] text-slate-600">
                    <span className="font-bold text-slate-700">Notes / Reason:</span> {selectedRequest.notes}
                  </div>
                )}
              </div>

              {/* Master Module Control Center for this College */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-[13px] font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Layers size={15} className="text-amber-500" />
                      Live Module Licensing Control
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Toggle ON/OFF to instantly activate or deactivate specific features for this college in real time.
                    </p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 bg-white shadow-2xs overflow-hidden">
                  {ALL_CAMPUS_MODULES.map((mod) => {
                    const ModIcon = mod.icon;
                    const isActive = isModuleActiveForCollege(selectedRequest.collegeId, mod.key);
                    const isProcessingThis = processingModuleKey === mod.key;

                    return (
                      <div 
                        key={mod.key}
                        className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                          isActive ? 'bg-amber-50/20' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isActive ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-slate-100 text-slate-500'
                          }`}>
                            <ModIcon size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800 text-xs truncate">
                                {mod.name}
                              </span>
                              {isActive ? (
                                <span className="text-[9.5px] font-extrabold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide border border-emerald-200">
                                  ACTIVE & UNLOCKED
                                </span>
                              ) : (
                                <span className="text-[9.5px] font-extrabold px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wide border border-slate-200">
                                  LOCKED
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{mod.desc}</p>
                          </div>
                        </div>

                        {/* Interactive Toggle Switch */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            disabled={isProcessingThis}
                            onClick={() => handleToggleModule(selectedRequest.collegeId?._id, mod.key, isActive)}
                            className={`w-12 h-6.5 rounded-full p-1 transition-all duration-200 flex items-center ${
                              isActive ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                            } disabled:opacity-50`}
                            title={isActive ? 'Click to Lock' : 'Click to Unlock'}
                          >
                            <div className="w-4.5 h-4.5 rounded-full bg-white shadow-md flex items-center justify-center text-[9px] font-bold">
                              {isProcessingThis ? (
                                <RefreshCw size={10} className="animate-spin text-slate-600" />
                              ) : isActive ? (
                                <Check size={10} className="text-emerald-700 stroke-[3]" />
                              ) : (
                                <X size={10} className="text-slate-400 stroke-[2]" />
                              )}
                            </div>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                {selectedRequest.status === 'Approved' ? (
                  <button
                    onClick={() => handleLock(selectedRequest)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Lock size={13} />
                    Lock All Requested Modules
                  </button>
                ) : selectedRequest.status === 'Locked' || selectedRequest.status === 'Inactive' ? (
                  <button
                    onClick={() => handleApprove(selectedRequest)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Unlock size={13} />
                    Unlock & Re-activate Request
                  </button>
                ) : selectedRequest.status === 'Pending' ? (
                  <button
                    onClick={() => handleApprove(selectedRequest)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Check size={13} className="stroke-[3]" />
                    Approve & Unlock Now
                  </button>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="px-5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors shadow-2xs"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default UpgradeRequests;
