import { useState, useEffect } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight, Eye, Edit, Power, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../components/Skeleton';

function AllColleges() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const res = await axiosInstance.get('/colleges');
      setColleges(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load colleges');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await axiosInstance.patch(`/colleges/${id}/status`, {});
      
      setColleges(colleges.map(c => 
        c._id === id ? { ...c, isActive: res.data.isActive } : c
      ));
      toast.success(res.data.message);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <span className="font-semibold text-gray-800">Are you sure you want to delete this college?</span>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axiosInstance.delete(`/colleges/${id}`);
                setColleges(colleges.filter(c => c._id !== id));
                toast.success('College deleted successfully');
              } catch (err) {
                console.error(err);
                toast.error('Failed to delete college');
              }
            }}
            className="px-3 py-1.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  // Get unique states for the filter dropdown
  const uniqueStates = [...new Set(colleges.map(c => c.state).filter(s => s))];

  // Filtering Logic
  const filteredColleges = colleges.filter((college) => {
    const matchesSearch = 
      college.collegeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.collegeCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesState = stateFilter ? college.state === stateFilter : true;
    
    const matchesStatus = statusFilter 
      ? (statusFilter === 'Active' ? college.isActive : !college.isActive) 
      : true;

    return matchesSearch && matchesState && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredColleges.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedColleges = filteredColleges.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      {/* Header & Breadcrumb */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">All Colleges</h1>
        <div className="flex items-center text-[12px] text-gray-500 font-medium">
          <Link to="/dashboard" className="hover:text-[#5a4bda] transition-colors">Dashboard</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-800 font-semibold">All Colleges</span>
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
                placeholder="Search college name, code..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50/80 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            
            {/* Dropdowns */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select 
                value={stateFilter} 
                onChange={(e) => { setStateFilter(e.target.value); setCurrentPage(1); }} 
                className="flex-1 sm:flex-none px-4 py-2 bg-gray-50/80 border border-gray-200 rounded-lg text-[13px] text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent outline-none cursor-pointer"
              >
                <option value="">State : All</option>
                {uniqueStates.map((st, i) => (
                  <option key={i} value={st}>{st}</option>
                ))}
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
              Create College
            </button>
          </Link>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          {loading ? (
            <div className="p-4"><TableSkeleton rows={8} columns={9} /></div>
          ) : (
            <table className="w-full min-w-[900px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-4 px-5 text-[12px] font-bold text-gray-600">Logo</th>
                  <th className="py-4 px-5 text-[12px] font-bold text-gray-600">College Name</th>
                  <th className="py-4 px-5 text-[12px] font-bold text-gray-600">College Code</th>
                  <th className="py-4 px-5 text-[12px] font-bold text-gray-600">Principal Name</th>
                  <th className="py-4 px-5 text-[12px] font-bold text-gray-600">City</th>
                  <th className="py-4 px-5 text-[12px] font-bold text-gray-600">State</th>
                  <th className="py-4 px-5 text-[12px] font-bold text-gray-600 text-center">Students</th>
                  <th className="py-4 px-5 text-[12px] font-bold text-gray-600 text-center">Status</th>
                  <th className="py-4 px-5 text-[12px] font-bold text-gray-600 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedColleges.length > 0 ? paginatedColleges.map((college) => (
                  <tr key={college._id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                    <td className="py-3 px-5">
                      <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden shrink-0">
                        {college.collegeLogo ? (
                          <img src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${college.collegeLogo}`} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <img src={`https://ui-avatars.com/api/?name=${college.collegeName.charAt(0)}&background=random&color=fff&size=36`} alt="Logo" className="w-full h-full object-cover" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <Link to={`/college-details/${college._id}`} className="text-[13px] font-semibold text-gray-800 hover:text-[#5a4bda] hover:underline transition-colors">
                        {college.collegeName}
                      </Link>
                    </td>
                    <td className="py-3 px-5 text-[13px] text-gray-600">{college.collegeCode}</td>
                    <td className="py-3 px-5 text-[13px] text-gray-600">{college.principalName || 'N/A'}</td>
                    <td className="py-3 px-5 text-[13px] text-gray-600">{college.city || 'N/A'}</td>
                    <td className="py-3 px-5 text-[13px] text-gray-600">{college.state || 'N/A'}</td>
                    <td className="py-3 px-5 text-[13px] text-gray-600 text-center font-medium">{college.studentsCount || 0}</td>
                    <td className="py-3 px-5 text-center">
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-bold rounded-md ${
                        college.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                      }`}>
                        {college.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/college-details/${college._id}`}>
                          <button title="View Details" className="p-1.5 text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                            <Eye size={15} />
                          </button>
                        </Link>
                        <Link to={`/edit-college/${college._id}`}>
                          <button title="Edit College" className="p-1.5 text-gray-500 hover:text-indigo-600 bg-gray-100 hover:bg-indigo-50 rounded-lg transition-colors">
                            <Edit size={15} />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleToggleStatus(college._id, college.isActive)}
                          title={college.isActive ? 'Deactivate' : 'Activate'} 
                          className={`p-1.5 rounded-lg transition-colors ${college.isActive ? 'text-orange-500 hover:text-orange-600 bg-orange-50 hover:bg-orange-100' : 'text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100'}`}
                        >
                          <Power size={15} />
                        </button>
                        <button 
                          onClick={() => handleDelete(college._id)}
                          title="Delete College" 
                          className="p-1.5 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="9" className="py-10 text-center text-[13px] text-gray-500">
                      No colleges found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredColleges.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
            <p className="text-[12px] text-gray-500 font-medium">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredColleges.length)} of {filteredColleges.length} entries
            </p>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              
              {/* Simple page numbers */}
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
    </div>
  );
}

export default AllColleges;
