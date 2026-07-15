import React, { useState } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight, Eye, Edit, Power, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const dummyColleges = [
  { id: 1, name: 'ABC Polytechnic College', code: 'ABC001', principal: 'Dr. Rajesh Kumar', city: 'Lucknow', state: 'Uttar Pradesh', students: 1250, status: 'Active' },
  { id: 2, name: 'XYZ Polytechnic College', code: 'XY2002', principal: 'Dr. Sandeep Singh', city: 'Kanpur', state: 'Uttar Pradesh', students: 980, status: 'Active' },
  { id: 3, name: 'PQR Polytechnic College', code: 'PQR003', principal: 'Dr. Anil Sharma', city: 'Agra', state: 'Uttar Pradesh', students: 750, status: 'Active' },
  { id: 4, name: 'LMN Polytechnic College', code: 'LMN004', principal: 'Dr. Vivek Patel', city: 'Jaipur', state: 'Rajasthan', students: 1100, status: 'Inactive' },
  { id: 5, name: 'RST Polytechnic College', code: 'RST005', principal: 'Dr. Meena Joshi', city: 'Bhopal', state: 'Madhya Pradesh', students: 860, status: 'Active' },
  { id: 6, name: 'UVW Polytechnic College', code: 'UVW006', principal: 'Dr. Ajay Verma', city: 'Indore', state: 'Madhya Pradesh', students: 920, status: 'Active' },
  { id: 7, name: 'GHI Polytechnic College', code: 'GHI007', principal: 'Dr. Pooja Sharma', city: 'Patna', state: 'Bihar', students: 670, status: 'Inactive' },
];

const activeCollegesData = dummyColleges.filter(c => c.status === 'Active');

function ActiveColleges() {
  const [searchTerm, setSearchTerm] = useState('');
  
  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      {/* Header & Breadcrumb */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Active Colleges</h1>
        <div className="flex items-center text-[12px] text-gray-500 font-medium">
          <Link to="/dashboard" className="hover:text-[#5a4bda] transition-colors">Dashboard</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-800 font-semibold">Active Colleges</span>
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
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Dropdowns */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select className="flex-1 sm:flex-none px-4 py-2 bg-gray-50/80 border border-gray-200 rounded-lg text-[13px] text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent outline-none cursor-pointer">
                <option value="">State : All</option>
                <option value="UP">Uttar Pradesh</option>
                <option value="MP">Madhya Pradesh</option>
                <option value="RJ">Rajasthan</option>
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
        <div className="flex-1 overflow-auto">
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
              {activeCollegesData.map((college) => (
                <tr key={college.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                  <td className="py-3 px-5">
                    <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden shrink-0">
                      <img src={`https://ui-avatars.com/api/?name=${college.name.charAt(0)}&background=random&color=fff&size=36`} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="py-3 px-5">
                    <Link to="/college-details" className="text-[13px] font-semibold text-gray-800 hover:text-[#5a4bda] hover:underline transition-colors">
                      {college.name}
                    </Link>
                  </td>
                  <td className="py-3 px-5 text-[13px] text-gray-600">{college.code}</td>
                  <td className="py-3 px-5 text-[13px] text-gray-600">{college.principal}</td>
                  <td className="py-3 px-5 text-[13px] text-gray-600">{college.city}</td>
                  <td className="py-3 px-5 text-[13px] text-gray-600">{college.state}</td>
                  <td className="py-3 px-5 text-[13px] text-gray-600 text-center font-medium">{college.students}</td>
                  <td className="py-3 px-5 text-center">
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-bold rounded-md ${
                      college.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                    }`}>
                      {college.status}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link to="/college-details">
                        <button title="View Details" className="p-1.5 text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                          <Eye size={15} />
                        </button>
                      </Link>
                      <button title="Edit College" className="p-1.5 text-gray-500 hover:text-indigo-600 bg-gray-100 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit size={15} />
                      </button>
                      <button title="Deactivate" className="p-1.5 text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                        <Power size={15} />
                      </button>
                      <button title="Delete College" className="p-1.5 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
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

export default ActiveColleges;
