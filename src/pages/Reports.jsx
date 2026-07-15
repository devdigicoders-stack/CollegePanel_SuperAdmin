import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Download, Filter, FileSpreadsheet, Calendar, Building2, UserCheck, CreditCard, Users } from 'lucide-react';

const reportTypes = [
  { id: 'students', label: 'Student Reports', icon: Users },
  { id: 'colleges', label: 'College Reports', icon: Building2 },
  { id: 'admissions', label: 'Admission Reports', icon: UserCheck },
  { id: 'fees', label: 'Fee & Revenue', icon: CreditCard },
  { id: 'attendance', label: 'Attendance', icon: Calendar },
];

function Reports() {
  const [activeReport, setActiveReport] = useState('students');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col h-full gap-6">
      {/* Header & Breadcrumb */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Reports & Analytics</h1>
        <div className="flex items-center text-[12px] text-gray-500 font-medium">
          <Link to="/dashboard" className="hover:text-[#5a4bda] transition-colors">Dashboard</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-800 font-semibold">Reports</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Panel - Report Types */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-4 h-fit">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4 px-2">Report Categories</h3>
          <div className="space-y-1">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => { setActiveReport(type.id); setReportGenerated(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-semibold transition-all ${
                  activeReport === type.id
                    ? 'bg-[#5a4bda] text-white shadow-md shadow-indigo-500/20'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <type.icon size={18} className={activeReport === type.id ? 'text-white' : 'text-gray-400'} />
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel - Filters & Generated Report */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Filter size={18} className="text-[#5a4bda]" />
              <h3 className="text-[15px] font-bold text-gray-800">Filter Criteria</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <div>
                <label className="block text-[12px] font-bold text-gray-600 mb-2">Select College</label>
                <select className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent outline-none cursor-pointer">
                  <option value="all">All Colleges</option>
                  <option value="abc">ABC Polytechnic College</option>
                  <option value="xyz">XYZ Polytechnic College</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[12px] font-bold text-gray-600 mb-2">Start Date</label>
                <input type="date" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent outline-none" />
              </div>
              
              <div>
                <label className="block text-[12px] font-bold text-gray-600 mb-2">End Date</label>
                <input type="date" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent outline-none" />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-6 py-2.5 text-[13px] font-bold text-white bg-[#5a4bda] rounded-lg shadow-md shadow-indigo-500/20 hover:bg-[#4d3ecc] transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  <>
                    <FileText size={16} />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Report View */}
          {reportGenerated ? (
            <div className="bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-[15px] font-bold text-gray-800">Generated Results</h3>
                  <p className="text-[12px] text-gray-500 font-medium mt-0.5">Showing report data for selected criteria.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 text-[12px] font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
                    <FileSpreadsheet size={14} className="text-green-600" />
                    Export Excel
                  </button>
                  <button className="px-4 py-2 text-[12px] font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
                    <Download size={14} className="text-red-500" />
                    Download PDF
                  </button>
                </div>
              </div>
              
              <div className="overflow-auto">
                {activeReport === 'students' ? (
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600">S.No</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600">Student ID</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600">Student Name</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600">College</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600">Course</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600">Enrollment Date</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: 1, sid: 'STU202301', name: 'Rahul Sharma', college: 'ABC Polytechnic College', course: 'Computer Science', date: '12 Aug 2023', status: 'Active' },
                        { id: 2, sid: 'STU202302', name: 'Priya Patel', college: 'ABC Polytechnic College', course: 'Civil Eng.', date: '14 Aug 2023', status: 'Active' },
                        { id: 3, sid: 'STU202303', name: 'Amit Kumar', college: 'XYZ Polytechnic College', course: 'Mechanical Eng.', date: '15 Aug 2023', status: 'Active' },
                        { id: 4, sid: 'STU202304', name: 'Neha Gupta', college: 'PQR Polytechnic College', course: 'Electrical Eng.', date: '18 Aug 2023', status: 'Inactive' },
                        { id: 5, sid: 'STU202305', name: 'Vikas Singh', college: 'ABC Polytechnic College', course: 'Computer Science', date: '20 Aug 2023', status: 'Active' },
                      ].map((item) => (
                        <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                          <td className="py-3 px-5 text-[13px] text-gray-600">{item.id}</td>
                          <td className="py-3 px-5 text-[13px] font-semibold text-[#5a4bda]">{item.sid}</td>
                          <td className="py-3 px-5 text-[13px] text-gray-800 font-medium">{item.name}</td>
                          <td className="py-3 px-5 text-[13px] text-gray-600 font-semibold">{item.college}</td>
                          <td className="py-3 px-5 text-[13px] text-gray-600">{item.course}</td>
                          <td className="py-3 px-5 text-[13px] text-gray-600">{item.date}</td>
                          <td className="py-3 px-5 text-center">
                            <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-bold rounded-md ${item.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600">S.No</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600">Reference ID</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600">Entity Name</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600">Date</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600">Count / Value</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((item) => (
                        <tr key={item} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                          <td className="py-3 px-5 text-[13px] text-gray-600">{item}</td>
                          <td className="py-3 px-5 text-[13px] font-semibold text-[#5a4bda]">REF-{Math.floor(Math.random() * 10000)}</td>
                          <td className="py-3 px-5 text-[13px] text-gray-800 font-medium">Sample Entity Data {item}</td>
                          <td className="py-3 px-5 text-[13px] text-gray-600">12 Oct 2024</td>
                          <td className="py-3 px-5 text-[13px] text-gray-800 font-bold">{Math.floor(Math.random() * 500) + 100}</td>
                          <td className="py-3 px-5 text-center">
                            <span className="inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-bold rounded-md bg-green-100 text-green-600">
                              Completed
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="p-4 border-t border-gray-100 text-center">
                <p className="text-[12px] text-gray-500 font-medium">End of report data.</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <FileText size={28} className="text-gray-300" />
              </div>
              <h3 className="text-[16px] font-bold text-gray-700 mb-1">No Report Generated</h3>
              <p className="text-[13px] text-gray-500 max-w-sm">
                Please select your criteria and click the "Generate Report" button above to view the data.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Reports;
