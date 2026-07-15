import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, User, Briefcase, Layout, 
  BookOpen, UserPlus, GraduationCap, Target,
  MapPin
} from 'lucide-react';

const tabs = [
  'Overview', 'Students', 'Teachers', 'Departments', 'Attendance', 
  'Fees', 'Examinations', 'Hostel', 'Library', 'Employees', 'Leads', 'Activity'
];

const overviewStats = [
  { title: 'Total Students', value: '1,250', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
  { title: 'Total Teachers', value: '85', icon: User, color: 'text-orange-500', bg: 'bg-orange-50' },
  { title: 'Total Employees', value: '120', icon: Briefcase, color: 'text-green-500', bg: 'bg-green-50' },
  { title: 'Total Departments', value: '8', icon: Layout, color: 'text-purple-500', bg: 'bg-purple-50' },
  { title: 'Total Courses', value: '15', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { title: 'Total Admissions (2024)', value: '320', icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-50' },
  { title: 'Total Alumni', value: '980', icon: GraduationCap, color: 'text-amber-500', bg: 'bg-amber-50' },
  { title: 'Total Leads', value: '510', icon: Target, color: 'text-red-500', bg: 'bg-red-50' },
];

const quickStats = [
  { title: 'Active Students', value: '1,180', color: 'text-emerald-500' },
  { title: 'Passed Out Students', value: '2,450', color: 'text-blue-500' },
  { title: 'Dropout Students', value: '120', color: 'text-red-500' },
  { title: "Today's Attendance", value: '85%', color: 'text-amber-500' },
];

function CollegeDetails() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      
      {/* Header & Breadcrumb */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">College Details</h1>
        <div className="flex items-center text-[12px] text-gray-500 font-medium">
          <Link to="/dashboard" className="hover:text-[#5a4bda] transition-colors">Dashboard</Link>
          <span className="mx-2">&gt;</span>
          <Link to="/all-colleges" className="hover:text-[#5a4bda] transition-colors">Colleges</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-800 font-semibold">College Details</span>
        </div>
      </div>

      {/* Top Cards Profile & Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* College Profile */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-50 border border-gray-200 shrink-0 overflow-hidden p-2 flex items-center justify-center">
            <img src="https://ui-avatars.com/api/?name=A+B&background=random&color=fff&size=100" alt="College Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-gray-800 leading-tight">ABC Polytechnic College</h2>
              <span className="inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-bold rounded-md bg-green-100 text-green-600 w-fit">
                Active
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
              <div className="flex text-[13px]">
                <span className="text-gray-500 w-28 shrink-0">College Code :</span>
                <span className="font-semibold text-gray-800">ABC001</span>
              </div>
              <div className="flex text-[13px]">
                <span className="text-gray-500 w-24 shrink-0">Contact :</span>
                <span className="font-semibold text-gray-800">0123456789</span>
              </div>
              <div className="flex text-[13px]">
                <span className="text-gray-500 w-28 shrink-0">AICTE Code :</span>
                <span className="font-semibold text-gray-800">AICTE12345</span>
              </div>
              <div className="flex text-[13px]">
                <span className="text-gray-500 w-24 shrink-0">Website :</span>
                <a href="#" className="font-semibold text-[#5a4bda] hover:underline">www.abccollege.com</a>
              </div>
              <div className="flex text-[13px]">
                <span className="text-gray-500 w-28 shrink-0">Affiliation No :</span>
                <span className="font-semibold text-gray-800">AFF12345</span>
              </div>
              <div className="flex text-[13px] sm:col-span-2">
                <span className="text-gray-500 w-28 shrink-0">Email :</span>
                <span className="font-semibold text-gray-800">abc@college.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Principal Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          <h3 className="text-[14px] font-bold text-gray-800 mb-5">Principal Information</h3>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border border-gray-200">
               <img src="https://i.pravatar.cc/150?img=11" alt="Principal" className="w-full h-full object-cover" />
            </div>
            <div>
              <h4 className="text-[15px] font-bold text-gray-800">Dr. Rajesh Kumar</h4>
              <p className="text-[12px] text-gray-500 font-medium">Principal</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center text-[13px]">
              <span className="text-gray-500 w-16 shrink-0">Mobile :</span>
              <span className="font-semibold text-gray-800">9876543210</span>
            </div>
            <div className="flex items-center text-[13px]">
              <span className="text-gray-500 w-16 shrink-0">Email :</span>
              <span className="font-semibold text-gray-800">principal@abccollege.com</span>
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
      {activeTab === 'Overview' && (
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
                123, College Road,<br/>
                Lucknow, Uttar Pradesh<br/>
                India - 226001
              </div>
              <div className="flex-1 w-full bg-gray-100 rounded-xl min-h-[160px] relative overflow-hidden flex items-center justify-center border border-gray-200">
                {/* Placeholder for map */}
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}></div>
                <div className="z-10 flex flex-col items-center gap-2 text-gray-400">
                  <MapPin size={32} className="text-red-500" />
                  <span className="text-[12px] font-bold">Map View</span>
                </div>
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
      )}

    </div>
  );
}

export default CollegeDetails;
