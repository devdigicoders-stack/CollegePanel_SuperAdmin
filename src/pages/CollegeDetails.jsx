import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { 
  Users, User, Briefcase, Layout, 
  BookOpen, UserPlus, GraduationCap, Target,
  MapPin, AlertCircle, Eye, X} from 'lucide-react';
import { ProfileSkeleton, TableSkeleton } from '../components/Skeleton';

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

  // Filters for Students tab
  const [studentFilters, setStudentFilters] = useState({
    branch: 'All Branches',
    course: 'All Courses',
    year: 'All Years',
    session: 'All Sessions'
  });
  const [studentFilterOptions, setStudentFilterOptions] = useState({
    branches: [],
    courses: [],
    years: [],
    sessions: []
  });

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
      
      // Fetch college info
      const res = await axiosInstance.get(`/colleges/${id}`);
      setCollege(res.data);

      // Fetch lengths for Overview Stats (Run them in parallel)
      const fetchLengths = async () => {
        const endpoints = ['students', 'teachers', 'employees', 'departments', 'leads'];
        const reqs = endpoints.map(ep => axiosInstance.get(`/colleges/${id}/details/${ep}`));
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
      let params = {};
      
      if (tab === 'Students') {
        if (studentFilters.branch && studentFilters.branch !== 'All Branches') params.branch = studentFilters.branch;
        if (studentFilters.course && studentFilters.course !== 'All Courses') params.course = studentFilters.course;
        if (studentFilters.year && studentFilters.year !== 'All Years') params.year = studentFilters.year;
        if (studentFilters.session && studentFilters.session !== 'All Sessions') params.session = studentFilters.session;
      }

      const res = await axiosInstance.get(`/colleges/${id}/details/${tab.toLowerCase()}`, { params });
      setTabData(res.data);

      if (tab === 'Students' && studentFilterOptions.branches.length === 0) {
        const filterRes = await axiosInstance.get(`/colleges/${id}/details/students/filters`);
        setStudentFilterOptions({
          branches: filterRes.data.branches || [],
          courses: filterRes.data.courses || [],
          years: filterRes.data.years || [],
          sessions: filterRes.data.sessions || []
        });
      }
    } catch (err) {
      console.error(`Error fetching ${tab} data:`, err);
      setTabData([]);
    } finally {
      setTabLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Students') {
      fetchTabData('Students');
    }
  }, [studentFilters]);

  if (loading) {
    return <ProfileSkeleton />;
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
    if (tabLoading) return <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100"><TableSkeleton rows={8} columns={6} /></div>;
    if (!tabData || tabData.length === 0) return <div className="p-10 text-center text-gray-500">No data found for {activeTab}.</div>;

    let columns = [];
    let renderRow = (item, index) => null;
    let filtersUI = null;

    if (activeTab === 'Students') {
      filtersUI = (
        <div className="flex flex-wrap gap-3 mb-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
          <select 
            value={studentFilters.branch} 
            onChange={(e) => setStudentFilters(p => ({ ...p, branch: e.target.value }))}
            className="flex-1 min-w-[150px] p-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#5a4bda]"
          >
            <option>All Branches</option>
            {studentFilterOptions.branches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <select 
            value={studentFilters.course} 
            onChange={(e) => setStudentFilters(p => ({ ...p, course: e.target.value }))}
            className="flex-1 min-w-[150px] p-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#5a4bda]"
          >
            <option>All Courses</option>
            {studentFilterOptions.courses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            value={studentFilters.year} 
            onChange={(e) => setStudentFilters(p => ({ ...p, year: e.target.value }))}
            className="flex-1 min-w-[150px] p-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#5a4bda]"
          >
            <option>All Years</option>
            {studentFilterOptions.years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <select 
            value={studentFilters.session} 
            onChange={(e) => setStudentFilters(p => ({ ...p, session: e.target.value }))}
            className="flex-1 min-w-[150px] p-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#5a4bda]"
          >
            <option>All Sessions</option>
            {studentFilterOptions.sessions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      );
    }

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
        {filtersUI}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#5a4bda] to-[#4536b3]">
              <h3 className="text-lg font-bold text-white">Student Details</h3>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Basic Info Card */}
              <div className="bg-gradient-to-br from-[#5a4bda]/5 to-[#5a4bda]/10 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-[#5a4bda] flex items-center justify-center text-white text-2xl font-bold border-2 border-[#5a4bda]/20 shadow-sm shrink-0">
                    {selectedStudent.studentName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">{selectedStudent.studentName}</h4>
                    <p className="text-sm text-[#5a4bda] font-medium">{selectedStudent.course} {selectedStudent.branch ? `- ${selectedStudent.branch}` : ''}</p>
                  </div>
                  <div className="ml-auto">
                    <span className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide inline-block ${
                      selectedStudent.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                      selectedStudent.status === 'Graduated' ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedStudent.status}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mt-4 pt-4 border-t border-[#5a4bda]/10">
                  <div>
                    <span className="text-gray-500 font-medium">Enrollment No:</span>
                    <span className="ml-2 font-bold text-gray-800">{selectedStudent.studentId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Year:</span>
                    <span className="ml-2 font-bold text-gray-800">{selectedStudent.year || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Enrollment Date:</span>
                    <span className="ml-2 font-bold text-gray-800">{selectedStudent.enrollmentDate ? new Date(selectedStudent.enrollmentDate).toLocaleDateString('en-GB') : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Personal Information */}
                <div className="space-y-4">
                  <h5 className="text-[13px] font-bold text-[#5a4bda] uppercase tracking-wider border-b border-gray-200 pb-2">Personal Information</h5>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Email</label>
                      <p className="text-[13px] font-medium text-gray-800">{selectedStudent.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Mobile</label>
                      <p className="text-[13px] font-medium text-gray-800">{selectedStudent.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Date of Birth</label>
                      <p className="text-[13px] font-medium text-gray-800">{selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString('en-GB') : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Gender</label>
                      <p className="text-[13px] font-medium text-gray-800">{selectedStudent.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Category</label>
                      <p className="text-[13px] font-medium text-gray-800">{selectedStudent.category || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Religion</label>
                      <p className="text-[13px] font-medium text-gray-800">{selectedStudent.religion || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Aadhaar No</label>
                      <p className="text-[13px] font-medium text-gray-800">{selectedStudent.aadhaar || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Nationality</label>
                      <p className="text-[13px] font-medium text-gray-800">{selectedStudent.nationality || 'Indian'}</p>
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Current Address</label>
                    <p className="text-[13px] font-medium text-gray-800 leading-relaxed">{selectedStudent.address || 'N/A'}</p>
                  </div>
                  <div className="pt-1">
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Permanent Address</label>
                    <p className="text-[13px] font-medium text-gray-800 leading-relaxed">{selectedStudent.permanentAddress ? `${selectedStudent.permanentAddress}, ${selectedStudent.permanentCity || ''}, ${selectedStudent.permanentPincode || ''}` : 'N/A'}</p>
                  </div>

                  {/* Portal Credentials */}
                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <h6 className="text-[11px] font-semibold text-[#5a4bda] uppercase tracking-wider mb-3">Portal Credentials</h6>
                    <div className="flex gap-4">
                      <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Username</label>
                        <p className="text-[13px] font-bold text-gray-800">{selectedStudent.username || 'N/A'}</p>
                      </div>
                      <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Password</label>
                        <p className="text-[13px] font-bold text-gray-800">{selectedStudent.password || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Parent / Guardian Information */}
                  <div className="space-y-4">
                    <h5 className="text-[13px] font-bold text-[#5a4bda] uppercase tracking-wider border-b border-gray-200 pb-2">Parent & Guardian Details</h5>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Father's Name</label>
                        <p className="text-[13px] font-medium text-gray-800">{selectedStudent.fatherName || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Father's Mobile</label>
                        <p className="text-[13px] font-medium text-gray-800">{selectedStudent.fatherMobile || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Mother's Name</label>
                        <p className="text-[13px] font-medium text-gray-800">{selectedStudent.motherName || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Mother's Mobile</label>
                        <p className="text-[13px] font-medium text-gray-800">{selectedStudent.motherMobile || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Guardian Name</label>
                        <p className="text-[13px] font-medium text-gray-800">{selectedStudent.guardianName || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Guardian Mobile</label>
                        <p className="text-[13px] font-medium text-gray-800">{selectedStudent.guardianMobile || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Parent Occupation</label>
                        <p className="text-[13px] font-medium text-gray-800">{selectedStudent.fatherOccupation || selectedStudent.motherOccupation || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Annual Income</label>
                        <p className="text-[13px] font-medium text-gray-800">{selectedStudent.annualIncome ? `₹${selectedStudent.annualIncome}` : 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="space-y-4">
                    <h5 className="text-[13px] font-bold text-[#5a4bda] uppercase tracking-wider border-b border-gray-200 pb-2">Previous Education</h5>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">School / College</label>
                        <p className="text-[13px] font-medium text-gray-800">{selectedStudent.prevSchool || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Board / University</label>
                        <p className="text-[13px] font-medium text-gray-800">{selectedStudent.board || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Passing Year</label>
                        <p className="text-[13px] font-medium text-gray-800">{selectedStudent.passingYear || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Qualification</label>
                        <p className="text-[13px] font-medium text-gray-800">{selectedStudent.qualification || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Percentage</label>
                        <p className="text-[13px] font-bold text-gray-800">{selectedStudent.percentage ? `${selectedStudent.percentage}%` : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="mt-8">
                <h5 className="text-[13px] font-bold text-[#5a4bda] uppercase tracking-wider border-b border-gray-200 pb-2 mb-4">Uploaded Documents</h5>
                {(!selectedStudent.documents || selectedStudent.documents.length === 0) ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                    <p className="text-gray-500 text-[13px] font-medium">No documents uploaded for this student.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedStudent.documents.map((doc, idx) => (
                      <div key={idx} className="flex flex-col p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-gray-800 line-clamp-1" title={doc.name}>{doc.name}</p>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${doc.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {doc.status || 'Pending'}
                            </span>
                          </div>
                        </div>
                        {doc.url ? (
                          <a href={doc.url.startsWith('http') ? doc.url : `${import.meta.env.VITE_API_URL.replace('/api', '')}${doc.url.startsWith('/') ? doc.url : '/' + doc.url}`} target="_blank" rel="noopener noreferrer" className="mt-auto block w-full text-center px-3 py-2 text-[12px] font-bold text-[#5a4bda] bg-[#5a4bda]/5 border border-[#5a4bda]/20 rounded-lg hover:bg-[#5a4bda] hover:text-white transition-all">
                            View Document
                          </a>
                        ) : (
                          <div className="mt-auto block w-full text-center px-3 py-2 text-[12px] font-bold text-gray-400 bg-gray-50 border border-gray-100 rounded-lg cursor-not-allowed">
                            Not Uploaded
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50 rounded-b-2xl">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-[13px] font-bold hover:bg-gray-50 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default CollegeDetails;
