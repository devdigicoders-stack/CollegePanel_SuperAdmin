import React, { useState } from 'react';
import { Search, MoreVertical, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const dummyAdmins = [
  { id: 1, name: 'Dr. Rajesh Kumar', email: 'rajesh@abccollege.com', mobile: '9876543210', college: 'ABC Polytechnic College', role: 'Principal / Admin', status: 'Active' },
  { id: 2, name: 'Dr. Sandeep Singh', email: 'sandeep@xyzcollege.com', mobile: '9876543211', college: 'XYZ Polytechnic College', role: 'Admin', status: 'Active' },
  { id: 3, name: 'Dr. Anil Sharma', email: 'anil@pqrcollege.com', mobile: '9876543212', college: 'PQR Polytechnic College', role: 'Principal / Admin', status: 'Active' },
  { id: 4, name: 'Dr. Vivek Patel', email: 'vivek@lmncollege.com', mobile: '9876543213', college: 'LMN Polytechnic College', role: 'Admin', status: 'Inactive' },
  { id: 5, name: 'Dr. Meena Joshi', email: 'meena@rstcollege.com', mobile: '9876543214', college: 'RST Polytechnic College', role: 'Principal / Admin', status: 'Active' },
  { id: 6, name: 'Dr. Ajay Verma', email: 'ajay@uvwcollege.com', mobile: '9876543215', college: 'UVW Polytechnic College', role: 'Admin', status: 'Active' },
  { id: 7, name: 'Dr. Pooja Sharma', email: 'pooja@ghicollege.com', mobile: '9876543216', college: 'GHI Polytechnic College', role: 'Principal / Admin', status: 'Inactive' },
];

function AllAdmins() {
  const [searchTerm, setSearchTerm] = useState('');
  
  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
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
                placeholder="Search admin name, email..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50/80 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Dropdowns */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select className="flex-1 sm:flex-none px-4 py-2 bg-gray-50/80 border border-gray-200 rounded-lg text-[13px] text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent outline-none cursor-pointer">
                <option value="">Role : All</option>
                <option value="principal">Principal</option>
                <option value="admin">Admin</option>
              </select>

              <select className="flex-1 sm:flex-none px-4 py-2 bg-gray-50/80 border border-gray-200 rounded-lg text-[13px] text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent outline-none cursor-pointer">
                <option value="">Status : All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Since admin creation is handled in "Create College" as per earlier convo, this can be linked there or just omitted. We will keep it for consistency. */}
          <Link to="/create-college" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-5 py-2 text-[13px] font-bold text-white bg-[#5a4bda] rounded-lg shadow-sm hover:bg-[#4d3ecc] transition-colors flex items-center justify-center gap-2">
              <Plus size={16} />
              Create Admin
            </button>
          </Link>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-[900px] text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-5 text-[12px] font-bold text-gray-600">Profile</th>
                <th className="py-4 px-5 text-[12px] font-bold text-gray-600">Admin Name</th>
                <th className="py-4 px-5 text-[12px] font-bold text-gray-600">Email Address</th>
                <th className="py-4 px-5 text-[12px] font-bold text-gray-600">Mobile Number</th>
                <th className="py-4 px-5 text-[12px] font-bold text-gray-600">Assigned College</th>
                <th className="py-4 px-5 text-[12px] font-bold text-gray-600">Role</th>
                <th className="py-4 px-5 text-[12px] font-bold text-gray-600 text-center">Status</th>
                <th className="py-4 px-5 text-[12px] font-bold text-gray-600 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {dummyAdmins.map((admin) => (
                <tr key={admin.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                  <td className="py-3 px-5">
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-gray-200">
                      <img src={`https://ui-avatars.com/api/?name=${admin.name}&background=random&color=fff&size=36`} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="py-3 px-5">
                    <span className="text-[13px] font-semibold text-gray-800">{admin.name}</span>
                  </td>
                  <td className="py-3 px-5 text-[13px] text-gray-600">{admin.email}</td>
                  <td className="py-3 px-5 text-[13px] text-gray-600 font-medium">{admin.mobile}</td>
                  <td className="py-3 px-5">
                    <span className="text-[13px] font-semibold text-[#5a4bda]">{admin.college}</span>
                  </td>
                  <td className="py-3 px-5 text-[13px] text-gray-600">{admin.role}</td>
                  <td className="py-3 px-5 text-center">
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-bold rounded-md ${
                      admin.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                    }`}>
                      {admin.status}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-center">
                    <button className="p-1.5 text-gray-400 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 sm:p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-gray-500 font-medium">Showing 1 to 7 of 25 entries</p>
          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#5a4bda] text-white font-bold text-[13px] shadow-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 font-medium text-[13px] hover:bg-gray-100 transition-colors">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 font-medium text-[13px] hover:bg-gray-100 transition-colors">
              3
            </button>
            <span className="text-gray-400">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AllAdmins;
