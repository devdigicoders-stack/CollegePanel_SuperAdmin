import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Download, Filter, FileSpreadsheet, Building2, UserCheck, Users, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const reportTypes = [
  { id: 'students', label: 'Student Reports', icon: Users },
  { id: 'colleges', label: 'College Reports', icon: Building2 },
  { id: 'admissions', label: 'Admission Reports', icon: UserCheck }
];

function Reports() {
  const [activeReport, setActiveReport] = useState('colleges');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  
  // Data State
  const [colleges, setColleges] = useState([]);
  const [generatedData, setGeneratedData] = useState([]);

  // Filter State
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/colleges`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setColleges(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load colleges for filter');
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedData([]); // Clear previous data
    
    try {
      const token = localStorage.getItem('superadmin_token');
      let url = '';
      
      // Build query params
      const params = new URLSearchParams();
      if (selectedCollege !== 'all') params.append('collegeId', selectedCollege);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const queryString = params.toString() ? `?${params.toString()}` : '';

      if (activeReport === 'colleges') {
        // Fetch colleges locally or from API if we want full fresh data
        let filtered = [...colleges];
        if (selectedCollege !== 'all') {
          filtered = filtered.filter(c => c._id === selectedCollege);
        }
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          filtered = filtered.filter(c => new Date(c.createdAt) >= start);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          filtered = filtered.filter(c => new Date(c.createdAt) <= end);
        }
        setGeneratedData(filtered);
      } else if (activeReport === 'students') {
        url = `${import.meta.env.VITE_API_URL}/reports/students${queryString}`;
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        setGeneratedData(res.data);
      } else if (activeReport === 'admissions') {
        url = `${import.meta.env.VITE_API_URL}/reports/admissions${queryString}`;
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        setGeneratedData(res.data);
      }

      setReportGenerated(true);
      toast.success('Report generated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate report');
      setReportGenerated(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTabChange = (id) => {
    setActiveReport(id);
    setReportGenerated(false);
    setGeneratedData([]);
  };

  const exportToExcel = () => {
    if (generatedData.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    let dataToExport = [];
    
    if (activeReport === 'colleges') {
      dataToExport = generatedData.map((item, index) => ({
        'S.No': index + 1,
        'College Code': item.collegeCode,
        'College Name': item.collegeName,
        'Type': item.collegeType,
        'Admin Name': item.adminName,
        'Created Date': new Date(item.createdAt).toLocaleDateString('en-GB'),
        'Status': item.isActive ? 'Active' : 'Inactive'
      }));
    } else if (activeReport === 'students') {
      dataToExport = generatedData.map((item, index) => ({
        'S.No': index + 1,
        'Student ID': item.studentId,
        'Student Name': item.studentName,
        'College': item.collegeId?.collegeName || 'N/A',
        'Course': item.course,
        'Enrollment Date': new Date(item.enrollmentDate).toLocaleDateString('en-GB'),
        'Status': item.status
      }));
    } else if (activeReport === 'admissions') {
      dataToExport = generatedData.map((item, index) => ({
        'S.No': index + 1,
        'Reference ID': item.referenceId,
        'Entity Name': item.entityName,
        'College': item.collegeId?.collegeName || 'N/A',
        'Date': new Date(item.date).toLocaleDateString('en-GB'),
        'Value': item.countValue,
        'Status': item.status
      }));
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${activeReport}_report.xlsx`);
  };

  const exportToPDF = () => {
    if (generatedData.length === 0) {
      toast.error('No data to export');
      return;
    }

    const doc = new jsPDF();
    doc.text(`${activeReport.charAt(0).toUpperCase() + activeReport.slice(1)} Report`, 14, 15);
    
    let head = [[]];
    let body = [];

    if (activeReport === 'colleges') {
      head = [['S.No', 'College Code', 'College Name', 'Type', 'Admin Name', 'Created Date', 'Status']];
      body = generatedData.map((item, index) => [
        index + 1,
        item.collegeCode,
        item.collegeName,
        item.collegeType,
        item.adminName,
        new Date(item.createdAt).toLocaleDateString('en-GB'),
        item.isActive ? 'Active' : 'Inactive'
      ]);
    } else if (activeReport === 'students') {
      head = [['S.No', 'Student ID', 'Student Name', 'College', 'Course', 'Enrollment Date', 'Status']];
      body = generatedData.map((item, index) => [
        index + 1,
        item.studentId,
        item.studentName,
        item.collegeId?.collegeName || 'N/A',
        item.course,
        new Date(item.enrollmentDate).toLocaleDateString('en-GB'),
        item.status
      ]);
    } else if (activeReport === 'admissions') {
      head = [['S.No', 'Reference ID', 'Entity Name', 'College', 'Date', 'Value', 'Status']];
      body = generatedData.map((item, index) => [
        index + 1,
        item.referenceId,
        item.entityName,
        item.collegeId?.collegeName || 'N/A',
        new Date(item.date).toLocaleDateString('en-GB'),
        item.countValue,
        item.status
      ]);
    }

    autoTable(doc, {
      head: head,
      body: body,
      startY: 25,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [90, 75, 218] }
    });

    doc.save(`${activeReport}_report.pdf`);
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

      <div className="flex flex-col gap-6">
        
        {/* Report Types (Horizontal Tabs) */}
        <div className="bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-2">
          <div className="flex flex-wrap items-center gap-2">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleTabChange(type.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${
                  activeReport === type.id
                    ? 'bg-[#5a4bda] text-white shadow-md shadow-indigo-500/20'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <type.icon size={16} className={activeReport === type.id ? 'text-white' : 'text-gray-400'} />
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters & Generated Report */}
        <div className="flex flex-col gap-6">
          
          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Filter size={18} className="text-[#5a4bda]" />
              <h3 className="text-[15px] font-bold text-gray-800">Filter Criteria</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <div>
                <label className="block text-[12px] font-bold text-gray-600 mb-2">Select College</label>
                <select 
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent outline-none cursor-pointer"
                >
                  <option value="all">All Colleges</option>
                  {colleges.map(c => (
                    <option key={c._id} value={c._id}>{c.collegeName}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-[12px] font-bold text-gray-600 mb-2">Start Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent outline-none" 
                />
              </div>
              
              <div>
                <label className="block text-[12px] font-bold text-gray-600 mb-2">End Date</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent outline-none" 
                />
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
                  <h3 className="text-[15px] font-bold text-gray-800">
                    {activeReport === 'colleges' && 'College Reports'}
                    {activeReport === 'students' && 'Student Reports'}
                    {activeReport === 'admissions' && 'Admission Reports'}
                  </h3>
                  <p className="text-[12px] text-gray-500 font-medium mt-0.5">Showing {generatedData.length} records found.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={exportToExcel}
                    className="px-4 py-2 text-[12px] font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <FileSpreadsheet size={14} className="text-green-600" />
                    Export Excel
                  </button>
                  <button 
                    onClick={exportToPDF}
                    className="px-4 py-2 text-[12px] font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <Download size={14} className="text-red-500" />
                    Download PDF
                  </button>
                </div>
              </div>
              
              <div className="overflow-auto max-h-[500px]">
                {activeReport === 'colleges' && (
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600">S.No</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600">College Code</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600">College Name</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600">Type</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600">Admin Name</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600">Created Date</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedData.length > 0 ? generatedData.map((item, index) => (
                        <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                          <td className="py-3 px-5 text-[13px] text-gray-600">{index + 1}</td>
                          <td className="py-3 px-5 text-[13px] font-semibold text-[#5a4bda]">{item.collegeCode}</td>
                          <td className="py-3 px-5 text-[13px] text-gray-800 font-medium">{item.collegeName}</td>
                          <td className="py-3 px-5 text-[13px] text-gray-600">{item.collegeType}</td>
                          <td className="py-3 px-5 text-[13px] text-gray-600">{item.adminName}</td>
                          <td className="py-3 px-5 text-[13px] text-gray-600">{new Date(item.createdAt).toLocaleDateString('en-GB')}</td>
                          <td className="py-3 px-5 text-center">
                            <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-bold rounded-md ${item.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                              {item.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="7" className="py-10 text-center text-[13px] text-gray-500">
                            No colleges match your filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}

                {activeReport === 'students' && (
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200">
                      <tr>
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
                      {generatedData.length > 0 ? generatedData.map((item, index) => (
                        <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                          <td className="py-3 px-5 text-[13px] text-gray-600">{index + 1}</td>
                          <td className="py-3 px-5 text-[13px] font-semibold text-[#5a4bda]">{item.studentId}</td>
                          <td className="py-3 px-5 text-[13px] text-gray-800 font-medium">{item.studentName}</td>
                          <td className="py-3 px-5 text-[13px] text-gray-600">{item.collegeId?.collegeName || 'N/A'}</td>
                          <td className="py-3 px-5 text-[13px] text-gray-600">{item.course}</td>
                          <td className="py-3 px-5 text-[13px] text-gray-600">{new Date(item.enrollmentDate).toLocaleDateString('en-GB')}</td>
                          <td className="py-3 px-5 text-center">
                            <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-bold rounded-md ${item.status === 'Active' ? 'bg-green-100 text-green-600' : (item.status === 'Graduated' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-500')}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="7" className="py-10 text-center text-[13px] text-gray-500">
                            No students match your filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}

                {activeReport === 'admissions' && (
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600">S.No</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600">Reference ID</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600">Entity Name</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600">College</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600">Date</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600">Value / Count</th>
                        <th className="py-3 px-5 text-[12px] font-bold text-gray-600 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedData.length > 0 ? generatedData.map((item, index) => (
                        <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                          <td className="py-3 px-5 text-[13px] text-gray-600">{index + 1}</td>
                          <td className="py-3 px-5 text-[13px] font-semibold text-[#5a4bda]">{item.referenceId}</td>
                          <td className="py-3 px-5 text-[13px] text-gray-800 font-medium">{item.entityName}</td>
                          <td className="py-3 px-5 text-[13px] text-gray-600">{item.collegeId?.collegeName || 'N/A'}</td>
                          <td className="py-3 px-5 text-[13px] text-gray-600">{new Date(item.date).toLocaleDateString('en-GB')}</td>
                          <td className="py-3 px-5 text-[13px] text-gray-800 font-bold">{item.countValue}</td>
                          <td className="py-3 px-5 text-center">
                            <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-bold rounded-md ${item.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="7" className="py-10 text-center text-[13px] text-gray-500">
                            No admissions match your filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}

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
