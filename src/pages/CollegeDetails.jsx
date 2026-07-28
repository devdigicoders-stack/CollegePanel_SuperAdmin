import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, User, Briefcase, Layout, 
  BookOpen, UserPlus, GraduationCap, Target,
  MapPin, AlertCircle, Eye, X, Mail, Phone, Calendar, Hash, UserCheck
} from 'lucide-react';

const tabs = [
  'Overview', 'Students', 'Teachers', 'Departments', 'Attendance', 
  'Fees', 'Examinations', 'Hostel', 'Library', 'Employees', 'Leads', 'Activity'
];

function CollegeDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');
  const [college, setCollege] = useState(null);
  
  // States for dynamic stats
  const [overviewData, setOverviewData] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalEmployees: 0,
    totalDepartments: 0,
    totalAlumni: 0,
    totalLeads: 0,
    activeStudents: 0,
    dropouts: 0
  });

  // State for active tab data
  const [tabData, setTabData] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  // Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCollegeDetails();
  }, [id]);

  useEffect(() => {
    if (activeTab !== 'Overview') {
      fetchTabData(activeTab);
    }
  }, [activeTab, id]);

  const fetchCollegeDetails = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      
      // Fetch college info
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/colleges/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCollege(res.data);

      // Fetch lengths for Overview Stats (Run them in parallel)
      const fetchLengths = async () => {
        const endpoints = ['students', 'teachers', 'employees', 'departments', 'leads'];
        const reqs = endpoints.map(ep => axios.get(`${import.meta.env.VITE_API_URL}/colleges/${id}/details/${ep}`, { headers: { Authorization: `Bearer ${token}` } }));
        const results = await Promise.all(reqs);
        
        const students = results[0].data;
        const teachers = results[1].data;
        const employees = results[2].data;
        const departments = results[3].data;
        const leads = results[4].data;

        setOverviewData({
          totalStudents: students.length,
          totalTeachers: teachers.length,
          totalEmployees: employees.length,
          totalDepartments: departments.length,
          totalLeads: leads.length,
          totalAlumni: students.filter(s => s.status === 'Graduated').length,
          activeStudents: students.filter(s => s.status === 'Active').length,
          dropouts: students.filter(s => s.status === 'Dropped').length
        });
      };
      
      await fetchLengths();
    } catch (err) {
      console.error(err);
      setError('College not found or error loading data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async (tab) => {
    setTabLoading(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/colleges/${id}/details/${tab.toLowerCase()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTabData(res.data);
    } catch (err) {
      console.error(`Error fetching ${tab} data:`, err);
      setTabData([]);
    } finally {
      setTabLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-gray-500">Loading details...</div>;
  }

  if (error || !college) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500 gap-3">
        <AlertCircle size={40} />
        <p className="font-semibold">{error}</p>
        <Link to="/all-colleges" className="text-blue-500 hover:underline mt-2">Back to all colleges</Link>
      </div>
    );
  }

  const overviewStats = [
    { title: 'Total Students', value: overviewData.totalStudents, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Total Teachers', value: overviewData.totalTeachers, icon: User, color: 'text-orange-500', bg: 'bg-orange-50' },
    { title: 'Total Employees', value: overviewData.totalEmployees, icon: Briefcase, color: 'text-green-500', bg: 'bg-green-50' },
    { title: 'Total Departments', value: overviewData.totalDepartments, icon: Layout, color: 'text-purple-500', bg: 'bg-purple-50' },
    { title: 'Total Courses', value: '4', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-50' }, // Hardcoded as course schema doesn't exist yet
    { title: `Total Admissions (${new Date().getFullYear()})`, value: overviewData.totalStudents, icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Total Alumni', value: overviewData.totalAlumni, icon: GraduationCap, color: 'text-amber-500', bg: 'bg-amber-50' },
    { title: 'Total Leads', value: overviewData.totalLeads, icon: Target, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  const quickStats = [
    { title: 'Active Students', value: overviewData.activeStudents, color: 'text-emerald-500' },
    { title: 'Passed Out Students', value: overviewData.totalAlumni, color: 'text-blue-500' },
    { title: 'Dropout Students', value: overviewData.dropouts, color: 'text-red-500' },
    { title: "Today's Attendance", value: 'N/A', color: 'text-amber-500' },
  ];

  // Helper to render dynamic tables
  const renderTable = () => {
    if (tabLoading) return <div className="p-10 text-center text-gray-500">Loading {activeTab}...</div>;
    if (!tabData || tabData.length === 0) return <div className="p-10 text-center text-gray-500">No data found for {activeTab}.</div>;

    let columns = [];
    let renderRow = (item, index) => null;

    switch (activeTab) {
      case 'Students':
        columns = ['S.No', 'Student ID', 'Student Name', 'Course', 'Enrollment Date', 'Status', 'Action'];
        renderRow = (item, index) => (
          <>
            <td className="py-3 px-5 text-[13px] text-gray-600">{index + 1}</td>
            <td className="py-3 px-5 text-[13px] font-semibold text-[#5a4bda]">{item.studentId}</td>
            <td className="py-3 px-5 text-[13px] text-gray-800 font-medium">{item.studentName}</td>
            <td className="py-3 px-5 text-[13px] text-gray-600">{item.course}</td>
            <td className="py-3 px-5 text-[13px] text-gray-600">{new Date(item.enrollmentDate).toLocaleDateString('en-GB')}</td>
            <td className="py-3 px-5 text-[13px] font-semibold text-gray-800">{item.status}</td>
            <td className="py-3 px-5 text-[13px]">
              <button 
                onClick={() => setSelectedStudent(item)}
                className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                title="View Full Profile"
              >
                <Eye size={16} />
              </button>
            </td>
          </>
        );
        break;
      case 'Teachers':
        columns = ['S.No', 'Name', 'Department', 'Qualification', 'Experience'];
        renderRow = (item, index) => (
          <>
            <td className="py-3 px-5 text-[13px] text-gray-600">{index + 1}</td>
            <td className="py-3 px-5 text-[13px] font-semibold text-[#5a4bda]">{item.name}</td>
            <td className="py-3 px-5 text-[13px] text-gray-800 font-medium">{item.department}</td>
            <td className="py-3 px-5 text-[13px] text-gray-600">{item.qualification}</td>
            <td className="py-3 px-5 text-[13px] text-gray-600">{item.experience}</td>
          </>
        );
        break;
      case 'Departments':
        columns = ['S.No', 'Department Name', 'HOD', 'Total Faculty'];
        renderRow = (item, index) => (
          <>
            <td className="py-3 px-5 text-[13px] text-gray-600">{index + 1}</td>
            <td className="py-3 px-5 text-[13px] font-semibold text-[#5a4bda]">{item.name}</td>
            <td className="py-3 px-5 text-[13px] text-gray-800 font-medium">{item.hod}</td>
            <td className="py-3 px-5 text-[13px] text-gray-600">{item.totalFaculty}</td>
          </>
        );
        break;
      case 'Attendance':
        columns = ['S.No', 'Date', 'Present', 'Total', 'Status'];
        renderRow = (item, index) => (
          <>
            <td className="py-3 px-5 text-[13px] text-gray-600">{index + 1}</td>
            <td className="py-3 px-5 text-[13px] font-semibold text-gray-800">{new Date(item.date).toLocaleDateString('en-GB')}</td>
            <td className="py-3 px-5 text-[13px] text-emerald-600 font-bold">{item.present}</td>
            <td className="py-3 px-5 text-[13px] text-gray-600">{item.total}</td>
            <td className="py-3 px-5 text-[13px] text-gray-600">{item.status}</td>
          </>
        );
        break;
      case 'Fees':
        columns = ['S.No', 'Student Name', 'Amount', 'Date', 'Status'];
        renderRow = (item, index) => (
          <>
            <td className="py-3 px-5 text-[13px] text-gray-600">{index + 1}</td>
            <td className="py-3 px-5 text-[13px] font-semibold text-[#5a4bda]">{item.studentName}</td>
            <td className="py-3 px-5 text-[13px] text-gray-800 font-medium">₹{item.amount}</td>
            <td className="py-3 px-5 text-[13px] text-gray-600">{new Date(item.date).toLocaleDateString('en-GB')}</td>
            <td className="py-3 px-5 text-[13px] text-gray-600">{item.status}</td>
          </>
        );
        break;
      case 'Examinations':
        columns = ['S.No', 'Exam Name', 'Date', 'Status'];
        renderRow = (item, index) => (
          <>
            <td className="py-3 px-5 text-[13px] text-gray-600">{index + 1}</td>
            <td className="py-3 px-5 text-[13px] font-semibold text-[#5a4bda]">{item.examName}</td>
            <td className="py-3 px-5 text-[13px] text-gray-600">{new Date(item.date).toLocaleDateString('en-GB')}</td>
            <td className="py-3 px-5 text-[13px] text-gray-600">{item.status}</td>
          </>
        );
        break;
      case 'Hostel':
        columns = ['S.No', 'Block Name', 'Capacity', 'Warden'];
        renderRow = (item, index) => (
          <>
            <td className="py-3 px-5 text-[13px] text-gray-600">{index + 1}</td>
            <td className="py-3 px-5 text-[13px] font-semibold text-[#5a4bda]">{item.blockName}</td>
            <td className="py-3 px-5 text-[13px] text-gray-800 font-medium">{item.capacity}</td>
            <td className="py-3 px-5 text-[13px] text-gray-600">{item.warden}</td>
          </>
        );
        break;
      case 'Library':
        columns = ['S.No', 'Book Name', 'Author', 'Available Copies'];
        renderRow = (item, index) => (
          <>
            <td className="py-3 px-5 text-[13px] text-gray-600">{index + 1}</td>
            <td className="py-3 px-5 text-[13px] font-semibold text-[#5a4bda]">{item.bookName}</td>
            <td className="py-3 px-5 text-[13px] text-gray-800 font-medium">{item.author}</td>
            <td className="py-3 px-5 text-[13px] text-gray-600">{item.availableCopies}</td>
          </>
        );
        break;
      case 'Employees':
        columns = ['S.No', 'Name', 'Role', 'Department'];
        renderRow = (item, index) => (
          <>
            <td className="py-3 px-5 text-[13px] text-gray-600">{index + 1}</td>
            <td className="py-3 px-5 text-[13px] font-semibold text-[#5a4bda]">{item.name}</td>
            <td className="py-3 px-5 text-[13px] text-gray-800 font-medium">{item.role}</td>
            <td className="py-3 px-5 text-[13px] text-gray-600">{item.department}</td>
          </>
        );
        break;
      case 'Leads':
        columns = ['S.No', 'Student Name', 'Source', 'Status'];
        renderRow = (item, index) => (
          <>
            <td className="py-3 px-5 text-[13px] text-gray-600">{index + 1}</td>
            <td className="py-3 px-5 text-[13px] font-semibold text-[#5a4bda]">{item.studentName}</td>
            <td className="py-3 px-5 text-[13px] text-gray-800 font-medium">{item.source}</td>
            <td className="py-3 px-5 text-[13px] text-gray-600">{item.status}</td>
          </>
        );
        break;
      case 'Activity':
        columns = ['S.No', 'Activity Name', 'Date', 'Description'];
        renderRow = (item, index) => (
          <>
            <td className="py-3 px-5 text-[13px] text-gray-600">{index + 1}</td>
            <td className="py-3 px-5 text-[13px] font-semibold text-[#5a4bda]">{item.activityName}</td>
            <td className="py-3 px-5 text-[13px] text-gray-600">{new Date(item.date).toLocaleDateString('en-GB')}</td>
            <td className="py-3 px-5 text-[13px] text-gray-800 font-medium">{item.description}</td>
          </>
        );
        break;
      default:
        return null;
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-[15px] font-bold text-gray-800 mb-6">{activeTab} Data</h3>
        <div className="overflow-auto max-h-[500px]">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="py-3 px-5 text-[12px] font-bold text-gray-600">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tabData.map((item, index) => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                  {renderRow(item, index)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 pb-10">
      
      {/* Header & Breadcrumb */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">College Details</h1>
        <div className="flex items-center text-[12px] text-gray-500 font-medium">
          <Link to="/dashboard" className="hover:text-[#5a4bda] transition-colors">Dashboard</Link>
          <span className="mx-2">&gt;</span>
          <Link to="/all-colleges" className="hover:text-[#5a4bda] transition-colors">Colleges</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-800 font-semibold">{college.collegeName}</span>
        </div>
      </div>

      {/* Top Cards Profile & Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* College Profile */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-50 border border-gray-200 shrink-0 overflow-hidden p-2 flex items-center justify-center">
            {college.collegeLogo ? (
              <img src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${college.collegeLogo}`} alt="College Logo" className="w-full h-full object-cover rounded-full" />
            ) : (
              <img src={`https://ui-avatars.com/api/?name=${college.collegeName.charAt(0)}&background=random&color=fff&size=100`} alt="College Logo" className="w-full h-full object-cover rounded-full" />
            )}
          </div>
          
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-gray-800 leading-tight">{college.collegeName}</h2>
              <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-bold rounded-md w-fit ${
                college.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
              }`}>
                {college.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
              <div className="flex text-[13px]">
                <span className="text-gray-500 w-28 shrink-0">College Code :</span>
                <span className="font-semibold text-gray-800">{college.collegeCode}</span>
              </div>
              <div className="flex text-[13px]">
                <span className="text-gray-500 w-24 shrink-0">Contact :</span>
                <span className="font-semibold text-gray-800">{college.contactNumber || 'N/A'}</span>
              </div>
              <div className="flex text-[13px]">
                <span className="text-gray-500 w-28 shrink-0">AICTE Code :</span>
                <span className="font-semibold text-gray-800">{college.aicteCode || 'N/A'}</span>
              </div>
              <div className="flex text-[13px]">
                <span className="text-gray-500 w-24 shrink-0">Website :</span>
                <a href={college.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#5a4bda] hover:underline">
                  {college.website || 'N/A'}
                </a>
              </div>
              <div className="flex text-[13px]">
                <span className="text-gray-500 w-28 shrink-0">Affiliation No :</span>
                <span className="font-semibold text-gray-800">{college.affiliationNumber || 'N/A'}</span>
              </div>
              <div className="flex text-[13px] sm:col-span-2">
                <span className="text-gray-500 w-28 shrink-0">Email :</span>
                <span className="font-semibold text-gray-800">{college.officialEmail || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Principal Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          <h3 className="text-[14px] font-bold text-gray-800 mb-5">Principal Information</h3>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border border-gray-200">
               <img src={`https://ui-avatars.com/api/?name=${college.principalName ? college.principalName.charAt(0) : 'P'}&background=random&color=fff`} alt="Principal" className="w-full h-full object-cover" />
            </div>
            <div>
              <h4 className="text-[15px] font-bold text-gray-800">{college.principalName || 'Not Assigned'}</h4>
              <p className="text-[12px] text-gray-500 font-medium">{college.principalQualification || 'Principal'}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center text-[13px]">
              <span className="text-gray-500 w-16 shrink-0">Admin :</span>
              <span className="font-semibold text-gray-800">{college.adminMobile || 'N/A'}</span>
            </div>
            <div className="flex items-center text-[13px]">
              <span className="text-gray-500 w-16 shrink-0">Email :</span>
              <span className="font-semibold text-gray-800">{college.principalEmail || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-2 text-[13px] font-bold rounded-lg transition-colors ${
              activeTab === tab 
                ? 'bg-[#5a4bda] text-white shadow-sm' 
                : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'Overview' ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* College Overview Stats */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-[15px] font-bold text-gray-800 mb-6">College Overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {overviewStats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                      <stat.icon size={18} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-500 leading-tight mb-1">{stat.title}</p>
                      <p className="text-[16px] font-bold text-gray-800 leading-none">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
              <h3 className="text-[15px] font-bold text-gray-800 mb-4">Address Information</h3>
              <div className="mb-4 text-[13px] text-gray-600 leading-relaxed font-medium">
                {college.address ? (
                  <>
                    {college.address},<br/>
                    {college.city}, {college.state}<br/>
                    {college.district} - {college.pinCode}
                  </>
                ) : 'No address provided'}
              </div>
              <div className="flex-1 w-full bg-gray-100 rounded-xl min-h-[160px] relative overflow-hidden flex items-center justify-center border border-gray-200">
                {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(`${college.collegeName}, ${college.address || ''}, ${college.city || ''}, ${college.state || ''}`)}`}
                  ></iframe>
                ) : (
                  <>
                    <div className="absolute inset-0 opacity-30" style={{
                      backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }}></div>
                    <div className="z-10 flex flex-col items-center gap-2 text-gray-400">
                      <MapPin size={32} className="text-red-500" />
                      <span className="text-[12px] font-bold">Map View</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
          </div>

          {/* Quick Statistics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-[15px] font-bold text-gray-800 mb-6">Quick Statistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStats.map((stat, index) => (
                <div key={index} className="border-r border-gray-100 last:border-0 pr-6">
                  <p className="text-[12px] font-bold text-gray-500 mb-2">{stat.title}</p>
                  <p className={`text-[28px] font-bold leading-none ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        renderTable()
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#5a4bda] flex items-center justify-center text-white font-bold text-lg">
                  {selectedStudent.studentName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-gray-800 leading-tight">{selectedStudent.studentName}</h3>
                  <p className="text-[12px] text-gray-500 font-medium">{selectedStudent.course}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              {/* Badge Row */}
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-[12px] font-bold rounded-lg border border-blue-100">
                  <Hash size={14} /> {selectedStudent.studentId}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded-lg border ${
                  selectedStudent.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                  selectedStudent.status === 'Graduated' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-red-50 text-red-700 border-red-100'
                }`}>
                  <UserCheck size={14} /> {selectedStudent.status}
                </span>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                  <Mail size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                    <p className="text-[14px] font-semibold text-gray-800 break-all">{selectedStudent.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                  <Phone size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</p>
                    <p className="text-[14px] font-semibold text-gray-800">{selectedStudent.phone || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                  <User size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Gender</p>
                    <p className="text-[14px] font-semibold text-gray-800">{selectedStudent.gender || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                  <Calendar size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Date of Birth</p>
                    <p className="text-[14px] font-semibold text-gray-800">{selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString('en-GB') : 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100 sm:col-span-2">
                  <MapPin size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Residential Address</p>
                    <p className="text-[14px] font-semibold text-gray-800 leading-relaxed">{selectedStudent.address || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100 sm:col-span-2">
                  <BookOpen size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Enrollment Date</p>
                    <p className="text-[14px] font-semibold text-gray-800">{new Date(selectedStudent.enrollmentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2.5 bg-gray-800 text-white text-[13px] font-bold rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default CollegeDetails;
