import { useState, useEffect, useCallback } from 'react';
import {
  Mail, Phone, Building2, Sparkles, Search, 
  RefreshCw, MessageSquare, CheckCircle2,
  Clock, Trash2, Eye, X, Layers,
  PhoneCall} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  New: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-500 text-white'
  },
  Contacted: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    badge: 'bg-blue-500 text-white'
  },
  'In Progress': {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    badge: 'bg-amber-500 text-white'
  },
  Converted: {
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
    badge: 'bg-purple-500 text-white'
  },
  Closed: {
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-400',
    badge: 'bg-slate-500 text-white'
  }
};

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    inProgress: 0,
    converted: 0,
    closed: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [notesInput, setNotesInput] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);

  // Fetch enquiries list from backend
  const fetchEnquiries = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== 'All') params.append('status', selectedStatus);
      if (search.trim()) params.append('search', search.trim());

      const res = await axiosInstance.get(`/enquiries?${params.toString()}`);
      if (res.data?.success) {
        setEnquiries(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching enquiries:', err);
      toast.error('Failed to load enquiries');
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [selectedStatus, search]);

  // Fetch metrics & counts
  const fetchStats = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/enquiries/stats');
      if (res.data?.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchEnquiries(true);
    fetchStats();
  }, [fetchEnquiries, fetchStats]);

  // Listen for real-time enquiries sent by SocketContext
  useEffect(() => {
    const handleLiveEnquiry = (event) => {
      const newLead = event.detail;
      if (!newLead) return;

      // Prepend lead to enquiries table if matching status or status is 'All'
      setEnquiries((prev) => {
        const exists = prev.some((item) => item._id === newLead._id);
        if (exists) return prev;
        if (selectedStatus === 'All' || selectedStatus === 'New') {
          return [newLead, ...prev];
        }
        return prev;
      });

      // Update counters
      fetchStats();
    };

    window.addEventListener('enquiries_updated', handleLiveEnquiry);
    window.addEventListener('new_enquiry_received', handleLiveEnquiry);

    return () => {
      window.removeEventListener('enquiries_updated', handleLiveEnquiry);
      window.removeEventListener('new_enquiry_received', handleLiveEnquiry);
    };
  }, [selectedStatus, fetchStats]);

  // Handle status update
  const handleStatusChange = async (enquiryId, newStatus) => {
    try {
      const res = await axiosInstance.patch(`/enquiries/${enquiryId}/status`, {
        status: newStatus
      });

      if (res.data?.success) {
        toast.success(`Status updated to "${newStatus}"`);
        setEnquiries((prev) =>
          prev.map((e) => (e._id === enquiryId ? { ...e, status: newStatus } : e))
        );
        if (selectedEnquiry && selectedEnquiry._id === enquiryId) {
          setSelectedEnquiry((prev) => ({ ...prev, status: newStatus }));
        }
        fetchStats();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update status');
    }
  };

  // Handle saving internal follow-up notes
  const handleSaveNotes = async () => {
    if (!selectedEnquiry) return;
    setSavingNotes(true);
    try {
      const res = await axiosInstance.patch(`/enquiries/${selectedEnquiry._id}/status`, {
        notes: notesInput
      });

      if (res.data?.success) {
        toast.success('Notes saved successfully');
        setSelectedEnquiry((prev) => ({ ...prev, notes: notesInput }));
        setEnquiries((prev) =>
          prev.map((e) => (e._id === selectedEnquiry._id ? { ...e, notes: notesInput } : e))
        );
      }
    } catch (err) {
      console.error('Error saving notes:', err);
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  // Handle enquiry deletion
  const handleDelete = async (enquiryId, name) => {
    if (!window.confirm(`Are you sure you want to delete lead from "${name}"?`)) {
      return;
    }

    setIsDeleting(enquiryId);
    try {
      const res = await axiosInstance.delete(`/enquiries/${enquiryId}`);
      if (res.data?.success) {
        toast.success('Enquiry deleted');
        setEnquiries((prev) => prev.filter((e) => e._id !== enquiryId));
        if (selectedEnquiry?._id === enquiryId) {
          setSelectedEnquiry(null);
        }
        fetchStats();
      }
    } catch (err) {
      console.error('Error deleting enquiry:', err);
      toast.error('Failed to delete enquiry');
    } finally {
      setIsDeleting(null);
    }
  };

  const openDetails = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setNotesInput(enquiry.notes || '');
  };

  const formatDateParts = (isoString) => {
    if (!isoString) return { date: 'Just now', time: '' };
    const date = new Date(isoString);
    const dateStr = date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return { date: dateStr, time: timeStr };
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
              Website Enquiries & Leads
            </h1>
          </div>
          <p className="text-slate-500 text-sm">
            Live prospective college demos and consultation inquiries submitted via DigiCampusPro website.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchEnquiries(true);
              fetchStats();
              toast.success('Leads list refreshed');
            }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total */}
        <div 
          onClick={() => setSelectedStatus('All')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'All'
              ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg border-slate-900 ring-2 ring-slate-900/20'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${selectedStatus === 'All' ? 'text-slate-300' : 'text-slate-500'}`}>
              Total Leads
            </span>
            <Layers className={`w-4 h-4 ${selectedStatus === 'All' ? 'text-slate-400' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-['Outfit',sans-serif]">
            {stats.total || 0}
          </div>
          <div className={`mt-1 text-[11px] ${selectedStatus === 'All' ? 'text-emerald-400' : 'text-slate-400'}`}>
            All time submissions
          </div>
        </div>

        {/* New */}
        <div 
          onClick={() => setSelectedStatus('New')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'New'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border-emerald-600 ring-2 ring-emerald-600/20'
              : 'bg-white border-emerald-100 hover:border-emerald-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${selectedStatus === 'New' ? 'text-emerald-100' : 'text-emerald-700'}`}>
              New Leads
            </span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-['Outfit',sans-serif]">
            {stats.new || 0}
          </div>
          <div className={`mt-1 text-[11px] ${selectedStatus === 'New' ? 'text-emerald-100' : 'text-emerald-600'}`}>
            Action needed
          </div>
        </div>

        {/* Contacted */}
        <div 
          onClick={() => setSelectedStatus('Contacted')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'Contacted'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border-blue-600 ring-2 ring-blue-600/20'
              : 'bg-white border-blue-100 hover:border-blue-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${selectedStatus === 'Contacted' ? 'text-blue-100' : 'text-blue-700'}`}>
              Contacted
            </span>
            <PhoneCall className={`w-4 h-4 ${selectedStatus === 'Contacted' ? 'text-blue-200' : 'text-blue-400'}`} />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-['Outfit',sans-serif]">
            {stats.contacted || 0}
          </div>
          <div className={`mt-1 text-[11px] ${selectedStatus === 'Contacted' ? 'text-blue-100' : 'text-slate-400'}`}>
            Call/message done
          </div>
        </div>

        {/* In Progress */}
        <div 
          onClick={() => setSelectedStatus('In Progress')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'In Progress'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 border-amber-600 ring-2 ring-amber-600/20'
              : 'bg-white border-amber-100 hover:border-amber-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${selectedStatus === 'In Progress' ? 'text-amber-100' : 'text-amber-700'}`}>
              In Progress
            </span>
            <Clock className={`w-4 h-4 ${selectedStatus === 'In Progress' ? 'text-amber-200' : 'text-amber-400'}`} />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-['Outfit',sans-serif]">
            {stats.inProgress || 0}
          </div>
          <div className={`mt-1 text-[11px] ${selectedStatus === 'In Progress' ? 'text-amber-100' : 'text-slate-400'}`}>
            Demo scheduled
          </div>
        </div>

        {/* Converted */}
        <div 
          onClick={() => setSelectedStatus('Converted')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'Converted'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border-purple-600 ring-2 ring-purple-600/20'
              : 'bg-white border-purple-100 hover:border-purple-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${selectedStatus === 'Converted' ? 'text-purple-100' : 'text-purple-700'}`}>
              Converted
            </span>
            <CheckCircle2 className={`w-4 h-4 ${selectedStatus === 'Converted' ? 'text-purple-200' : 'text-purple-400'}`} />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-['Outfit',sans-serif]">
            {stats.converted || 0}
          </div>
          <div className={`mt-1 text-[11px] ${selectedStatus === 'Converted' ? 'text-purple-100' : 'text-purple-600'}`}>
            Onboarded as college
          </div>
        </div>

        {/* Closed */}
        <div 
          onClick={() => setSelectedStatus('Closed')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'Closed'
              ? 'bg-slate-700 text-white shadow-lg border-slate-700 ring-2 ring-slate-700/20'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${selectedStatus === 'Closed' ? 'text-slate-300' : 'text-slate-500'}`}>
              Closed / Lost
            </span>
            <X className={`w-4 h-4 ${selectedStatus === 'Closed' ? 'text-slate-400' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-['Outfit',sans-serif]">
            {stats.closed || 0}
          </div>
          <div className={`mt-1 text-[11px] ${selectedStatus === 'Closed' ? 'text-slate-300' : 'text-slate-400'}`}>
            Archived leads
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, college, phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-slate-50/50"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['All', 'New', 'Contacted', 'In Progress', 'Converted', 'Closed'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedStatus === status
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries Table / Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 text-sm">Loading website enquiries...</p>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Mail className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 font-['Outfit',sans-serif]">
              No enquiries found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search
                ? `No leads matched your search query "${search}". Try clearing the search filter.`
                : 'No enquiries have been submitted with this status yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[980px]">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-[240px]">Educator / Prospect</th>
                  <th className="py-3 px-4 w-[230px]">College / Institute</th>
                  <th className="py-3 px-4 w-[200px]">Contact Info</th>
                  <th className="py-3 px-4 w-[170px]">Modules</th>
                  <th className="py-3 px-4 w-[140px] text-center">Status</th>
                  <th className="py-3 px-4 w-[120px]">Received</th>
                  <th className="py-3 px-4 w-[90px] text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {enquiries.map((item) => {
                  const statusStyle = STATUS_CONFIG[item.status] || STATUS_CONFIG.New;
                  const isNew = item.status === 'New';
                  const dateInfo = formatDateParts(item.createdAt);

                  return (
                    <tr
                      key={item._id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isNew ? 'bg-emerald-50/15' : ''
                      }`}
                    >
                      {/* Name & ID */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200 shadow-2xs">
                            {item.fullName ? item.fullName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900 text-[13px]">{item.fullName}</span>
                              {isNew && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500 text-white tracking-wider">
                                  NEW
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              {item.enquiryNo && (
                                <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded font-medium border border-slate-200">
                                  #{item.enquiryNo}
                                </span>
                              )}
                              <span className="truncate max-w-[130px]" title={item.institutionType}>
                                {item.institutionType || 'College'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Institute */}
                      <td className="py-3 px-4 min-w-[200px] max-w-[240px]">
                        <div className="font-medium text-slate-800 text-[13px] truncate" title={item.collegeName}>
                          {item.collegeName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="truncate">{item.studentStrength || 'Strength N/A'}</span>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${item.phone}`}
                            className="text-xs font-semibold text-slate-800 hover:text-emerald-700 transition-colors flex items-center gap-1"
                            title="Call phone"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{item.phone}</span>
                          </a>
                          <a
                            href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hello ${item.fullName}, thank you for contacting DigiCampusPro regarding an ERP demo for ${item.collegeName}. When would be a good time for a quick 10-minute walkthrough?`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="mt-0.5">
                          <a
                            href={`mailto:${item.email}`}
                            className="text-[11px] text-slate-500 hover:text-emerald-700 truncate max-w-[180px] inline-flex items-center gap-1 transition-colors"
                            title={item.email}
                          >
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{item.email}</span>
                          </a>
                        </div>
                      </td>

                      {/* Modules - Compact Single-Line */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {item.selectedModules && item.selectedModules.length > 0 ? (
                            <>
                              <span
                                className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium truncate max-w-[110px] inline-block border border-slate-200/60"
                                title={item.selectedModules[0]}
                              >
                                {item.selectedModules[0]}
                              </span>
                              {item.selectedModules.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => openDetails(item)}
                                  className="px-1.5 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold cursor-pointer transition-colors"
                                  title={item.selectedModules.join(', ')}
                                >
                                  +{item.selectedModules.length - 1}
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Full Suite</span>
                          )}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item._id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border focus:outline-none transition-all cursor-pointer shadow-2xs ${statusStyle.bg}`}
                        >
                          <option value="New">🟢 New</option>
                          <option value="Contacted">🔵 Contacted</option>
                          <option value="In Progress">🟡 In Progress</option>
                          <option value="Converted">🟣 Converted</option>
                          <option value="Closed">⚪ Closed</option>
                        </select>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-xs">
                        <div className="font-medium text-slate-800">{dateInfo.date}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{dateInfo.time}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openDetails(item)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                            title="View Lead Details & Notes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hello ${item.fullName}, thank you for contacting DigiCampusPro regarding an ERP demo for ${item.collegeName}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(item._id, item.fullName)}
                            disabled={isDeleting === item._id}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details & Follow-up Notes Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#03150D] to-[#0A2618] text-white flex items-center justify-between border-b border-emerald-900/40">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                  {selectedEnquiry.fullName ? selectedEnquiry.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold font-['Outfit',sans-serif]">
                      {selectedEnquiry.fullName}
                    </h3>
                    {selectedEnquiry.enquiryNo && (
                      <span className="font-mono text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                        #{selectedEnquiry.enquiryNo}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-200/80">
                    {selectedEnquiry.collegeName} • {selectedEnquiry.institutionType}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
              {/* Quick Contact Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a
                  href={`tel:${selectedEnquiry.phone}`}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-[11px] text-slate-500 font-medium">Direct Phone</div>
                    <div className="text-xs font-bold text-slate-900 truncate">{selectedEnquiry.phone}</div>
                  </div>
                </a>

                <a
                  href={`mailto:${selectedEnquiry.email}`}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-[11px] text-slate-500 font-medium">Official Mail</div>
                    <div className="text-xs font-bold text-slate-900 truncate">{selectedEnquiry.email}</div>
                  </div>
                </a>

                <a
                  href={`https://wa.me/${selectedEnquiry.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hello ${selectedEnquiry.fullName}, thank you for contacting DigiCampusPro regarding an ERP walkthrough for ${selectedEnquiry.collegeName}. We would be delighted to demonstrate our platform.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-[11px] text-emerald-700 font-medium">WhatsApp</div>
                    <div className="text-xs font-bold text-emerald-900">Open Chat Now</div>
                  </div>
                </a>
              </div>

              {/* Institute Details Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Institutional Specifications</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Institution Type:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedEnquiry.institutionType}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Student Strength:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedEnquiry.studentStrength}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Received On:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{formatDate(selectedEnquiry.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Current Lead Status:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedEnquiry.status}</p>
                  </div>
                </div>
              </div>

              {/* Modules of Interest */}
              {selectedEnquiry.selectedModules && selectedEnquiry.selectedModules.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>Modules of Interest</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEnquiry.selectedModules.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
                      >
                        ✓ {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Message from Prospect */}
              {selectedEnquiry.message && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Message / Timelines
                  </h4>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-normal">
                    {selectedEnquiry.message}
                  </div>
                </div>
              )}

              {/* Internal Notes & Follow-up Log */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Internal Sales Notes & Follow-up Log
                  </h4>
                  <span className="text-[11px] text-slate-400">Visible only to SuperAdmins</span>
                </div>
                <textarea
                  rows={3}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Record call summary, client expectations, scheduled demo date..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-slate-50"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {savingNotes ? 'Saving Notes...' : 'Save Notes'}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Update Status:</span>
                <select
                  value={selectedEnquiry.status}
                  onChange={(e) => handleStatusChange(selectedEnquiry._id, e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="New">🟢 New</option>
                  <option value="Contacted">🔵 Contacted</option>
                  <option value="In Progress">🟡 In Progress</option>
                  <option value="Converted">🟣 Converted</option>
                  <option value="Closed">⚪ Closed</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Enquiries;
