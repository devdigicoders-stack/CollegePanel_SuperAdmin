import { useState, useEffect } from 'react';
import { Search, Edit, Plus, ChevronLeft, ChevronRight, Key, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

function AllAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Password Reset Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetTargetId, setResetTargetId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await axiosInstance.get('/colleges');
      
      const adminList = res.data.map(college => {
        const isAlsoPrincipal = 
          (college.principalName && college.adminName && college.principalName.toLowerCase() === college.adminName.toLowerCase()) || 
          (college.principalEmail && college.adminEmail && college.principalEmail.toLowerCase() === college.adminEmail.toLowerCase());

        return {
          id: college._id,
          name: college.adminName || 'Unknown Admin',
          email: college.adminEmail || 'N/A',
          mobile: college.adminMobile || 'N/A',
          college: college.collegeName,
          password: college.rawPassword || 'N/A', // Displaying raw password
          role: isAlsoPrincipal ? 'Principal / Admin' : 'Admin',
          status: college.isActive ? 'Active' : 'Inactive',
          collegeId: college._id
        };
      });

      setAdmins(adminList);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResetModal = (collegeId) => {
    setResetTargetId(collegeId);
    setNewPassword('');
    setIsResetModalOpen(true);
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.trim().length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsResetting(true);
    try {
      // We send it as FormData because the PUT endpoint expects upload.single() middleware compatibility
      const formData = new FormData();
      formData.append('password', newPassword);

      await axiosInstance.put(`/colleges/${resetTargetId}`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Real-time UI update
      setAdmins(admins.map(admin => 
        admin.collegeId === resetTargetId 
          ? { ...admin, password: newPassword } 
          : admin
      ));

      toast.success('Password updated successfully');
      setIsResetModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsResetting(false);
    }
  };

  // Filtering Logic
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch = 
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.college.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter 
      ? (roleFilter === 'principal' ? admin.role.includes('Principal') : admin.role === 'Admin')
      : true;
      
    const matchesStatus = statusFilter ? admin.status === statusFilter : true;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAdmins = filteredAdmins.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col relative">
      {/* Header & Breadcrumb */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">All College Admins</h1>
        <div className="flex items-center text-[12px] text-gray-500 font-medium">
          <Link to="/dashboard" className="hover:text-[#5a4bda] transition-colors">Dashboard</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-800 font-semibold">All Admins</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        
        {/* Filters and Actions */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-[280px]">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search admin name, email, college..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50/80 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            
            {/* Dropdowns */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select 
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                className="flex-1 sm:flex-none px-4 py-2 bg-gray-50/80 border border-gray-200 rounded-lg text-[13px] text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent outline-none cursor-pointer"
              >
                <option value="">Role : All</option>
                <option value="principal">Principal / Admin</option>
                <option value="admin">Admin</option>
              </select>

              <select 
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="flex-1 sm:flex-none px-4 py-2 bg-gray-50/80 border border-gray-200 rounded-lg text-[13px] text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent outline-none cursor-pointer"
              >
                <option value="">Status : All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <Link to="/create-college" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-5 py-2 text-[13px] font-bold text-white bg-[#5a4bda] rounded-lg shadow-sm hover:bg-[#4d3ecc] transition-colors flex items-center justify-center gap-2">
              <Plus size={16} />
              Create Admin
            </button>
          </Link>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">Loading admins...</div>
          ) : (
            <table className="w-full min-w-[900px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-4 px-5 text-[12px] font-bold text-gray-600">Profile</th>
                  <th className="py-4 px-5 text-[12px] font-bold text-gray-600">Admin Name</th>
                  <th className="py-4 px-5 text-[12px] font-bold text-gray-600">Email Address</th>
                  <th className="py-4 px-5 text-[12px] font-bold text-gray-600">Mobile Number</th>
                  <th className="py-4 px-5 text-[12px] font-bold text-gray-600">Assigned College</th>
                  <th className="py-4 px-5 text-[12px] font-bold text-gray-600">Password</th>
                  <th className="py-4 px-5 text-[12px] font-bold text-gray-600">Role</th>
                  <th className="py-4 px-5 text-[12px] font-bold text-gray-600 text-center">Status</th>
                  <th className="py-4 px-5 text-[12px] font-bold text-gray-600 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAdmins.length > 0 ? paginatedAdmins.map((admin) => (
                  <tr key={admin.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                    <td className="py-3 px-5">
                      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-gray-200 bg-indigo-50">
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name)}&background=random&color=fff&size=36`} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <span className="text-[13px] font-semibold text-gray-800">{admin.name}</span>
                    </td>
                    <td className="py-3 px-5 text-[13px] text-gray-600">{admin.email}</td>
                    <td className="py-3 px-5 text-[13px] text-gray-600 font-medium">{admin.mobile}</td>
                    <td className="py-3 px-5">
                      <Link to={`/college-details/${admin.collegeId}`} className="text-[13px] font-semibold text-[#5a4bda] hover:underline">
                        {admin.college}
                      </Link>
                    </td>
                    <td className="py-3 px-5 text-[13px] font-mono text-gray-600">{admin.password}</td>
                    <td className="py-3 px-5 text-[13px] text-gray-600">{admin.role}</td>
                    <td className="py-3 px-5 text-center">
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-bold rounded-md ${
                        admin.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                      }`}>
                        {admin.status}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/edit-college/${admin.collegeId}`}>
                          <button title="Edit Admin Details" className="p-1.5 text-gray-500 hover:text-indigo-600 bg-gray-100 hover:bg-indigo-50 rounded-lg transition-colors">
                            <Edit size={15} />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleOpenResetModal(admin.collegeId)}
                          title="Reset Password" 
                          className="p-1.5 text-orange-500 hover:text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                        >
                          <Key size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="9" className="py-10 text-center text-[13px] text-gray-500">
                      No admins found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredAdmins.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
            <p className="text-[12px] text-gray-500 font-medium">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAdmins.length)} of {filteredAdmins.length} entries
            </p>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-[13px] transition-colors ${
                    page === currentPage 
                    ? 'bg-[#5a4bda] text-white font-bold shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 text-orange-600">
                <Key size={18} />
                <h3 className="font-bold text-gray-800">Reset Password</h3>
              </div>
              <button 
                onClick={() => setIsResetModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <p className="text-[13px] text-gray-500 mb-4">Enter a new secure password for this college admin.</p>
              
              <div className="mb-5">
                <label className="block text-[12px] font-bold text-gray-700 mb-1.5">New Password</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="e.g. NewPass123!" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsResetModalOpen(false)}
                  className="flex-1 px-4 py-2 text-[13px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleResetPassword}
                  disabled={isResetting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-[13px] font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-70"
                >
                  {isResetting ? 'Saving...' : (
                    <>
                      <Check size={16} />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AllAdmins;
