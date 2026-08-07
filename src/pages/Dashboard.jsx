import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, User, PlayCircle, StopCircle } from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

Highcharts.setOptions({
  chart: { style: { fontFamily: 'inherit' } },
  credits: { enabled: false },
  title: { text: null },
  legend: { enabled: false }
});

const HCR = HighchartsReact && HighchartsReact.default ? HighchartsReact.default : HighchartsReact;

import { CardSkeleton } from '../components/Skeleton';

function Dashboard() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalColleges: 0,
    activeColleges: 0,
    inactiveColleges: 0,
    totalAdmins: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalEmployees: 0
  });
  
  const [chartData, setChartData] = useState({
    monthlyRegistrations: new Array(12).fill(0),
    collegeWiseStudents: { categories: [], data: [] },
    monthlyAdmissions: new Array(12).fill(0)
  });

  useEffect(() => {
    fetchDashboardStats();
  }, [year]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/superadmin/dashboard-stats?year=${year}`);
      
      setStats(res.data.stats);
      setChartData(res.data.charts);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Colleges', value: stats.totalColleges, icon: Building2, color: 'text-blue-500', bg: 'bg-blue-50', link: '/all-colleges' },
    { title: 'Active Colleges', value: stats.activeColleges, icon: PlayCircle, color: 'text-green-500', bg: 'bg-green-50', link: '/all-colleges' },
    { title: 'Inactive Colleges', value: stats.inactiveColleges, icon: StopCircle, color: 'text-red-500', bg: 'bg-red-50', link: '/all-colleges' },
    { title: 'Total Admins', value: stats.totalAdmins, icon: User, color: 'text-orange-500', bg: 'bg-orange-50', link: '/all-admins' },
  ];

  const monthlyRegOptions = {
    chart: { type: 'line', height: 280, backgroundColor: 'transparent' },
    xAxis: { 
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      lineWidth: 0, tickWidth: 0, labels: { style: { color: '#94a3b8', fontSize: '11px', fontWeight: '500' } }
    },
    yAxis: { 
      title: { text: null }, 
      gridLineColor: '#f1f5f9',
      labels: { style: { color: '#94a3b8', fontSize: '11px', fontWeight: '500' } }
    },
    tooltip: { backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: 8, shadow: true },
    plotOptions: {
      line: {
        marker: { symbol: 'circle', radius: 4, fillColor: '#fff', lineWidth: 2, lineColor: '#5a4bda' }
      }
    },
    series: [{ 
      name: 'Registration', 
      data: chartData.monthlyRegistrations, 
      color: '#5a4bda', lineWidth: 3
    }]
  };

  const studentCountOptions = {
    chart: { type: 'column', height: 280, backgroundColor: 'transparent' },
    xAxis: { 
      categories: chartData.collegeWiseStudents.categories,
      lineWidth: 0, tickWidth: 0, labels: { style: { color: '#94a3b8', fontSize: '11px', fontWeight: '500' } }
    },
    yAxis: { 
      title: { text: null }, 
      gridLineColor: '#f1f5f9',
      labels: { style: { color: '#94a3b8', fontSize: '11px', fontWeight: '500' } }
    },
    tooltip: { backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: 8, shadow: true },
    plotOptions: {
      column: { pointWidth: 36, borderRadius: '10%', borderWidth: 0 }
    },
    series: [{ 
      name: 'Students', 
      data: chartData.collegeWiseStudents.data, 
      color: '#7c3aed' 
    }]
  };

  const admissionGrowthOptions = {
    chart: { type: 'area', height: 280, backgroundColor: 'transparent' },
    xAxis: { 
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      lineWidth: 0, tickWidth: 0, labels: { style: { color: '#94a3b8', fontSize: '11px', fontWeight: '500' } }
    },
    yAxis: { 
      title: { text: null }, 
      gridLineColor: '#f1f5f9',
      labels: { style: { color: '#94a3b8', fontSize: '11px', fontWeight: '500' } }
    },
    tooltip: { backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: 8, shadow: true },
    plotOptions: {
      area: {
        lineWidth: 3, marker: { enabled: false },
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [ [0, 'rgba(139, 92, 246, 0.4)'], [1, 'rgba(139, 92, 246, 0)'] ]
        }
      }
    },
    series: [{ 
      name: 'Admissions', 
      data: chartData.monthlyAdmissions, 
      color: '#8b5cf6' 
    }]
  };

  const handleYearChange = (e) => {
    setYear(parseInt(e.target.value));
  };

  const years = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);

  if (loading && stats.totalColleges === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-[16px] shadow-sm border border-gray-100 min-h-[300px] animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-[240px] bg-gray-100 rounded w-full"></div>
          </div>
          <div className="bg-white p-6 rounded-[16px] shadow-sm border border-gray-100 min-h-[300px] animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-[240px] bg-gray-100 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-6">
        {statCards.map((stat, index) => (
          <Link to={stat.link} key={index} className="bg-white rounded-[14px] p-4 sm:p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all group block cursor-pointer">
            <div className={`w-[48px] h-[48px] sm:w-[52px] sm:h-[52px] rounded-[12px] flex items-center justify-center shrink-0 ${stat.bg} ${stat.color} group-hover:scale-105 transition-transform`}>
              <stat.icon size={22} strokeWidth={1.8} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[11px] sm:text-[12px] font-semibold text-gray-500 mb-0.5 tracking-wide">{stat.title}</p>
              <p className="text-[20px] sm:text-[22px] font-bold text-gray-800 leading-tight">
                {stat.value.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pb-6">
        
        {/* Monthly College Registration */}
        <div className="bg-white p-4 sm:p-6 rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden relative">
          {loading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5a4bda]"></div></div>}
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-[14px] sm:text-[15px] font-bold text-gray-800">Monthly College Registration</h3>
            <select value={year} onChange={handleYearChange} className="text-[11px] sm:text-[12px] font-medium border border-gray-200 rounded-md text-gray-600 bg-white px-2 py-1 sm:px-2.5 sm:py-1.5 outline-none cursor-pointer">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="h-[240px] sm:h-[280px] w-full">
            <HCR highcharts={Highcharts} options={monthlyRegOptions} containerProps={{ style: { width: '100%', height: '100%' } }} />
          </div>
        </div>

        {/* College-wise Student Count */}
        <div className="bg-white p-4 sm:p-6 rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden relative">
          {loading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5a4bda]"></div></div>}
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-[14px] sm:text-[15px] font-bold text-gray-800">College-wise Student Count</h3>
            {/* No year filter for this specific chart usually, but keeping alignment */}
          </div>
          <div className="h-[240px] sm:h-[280px] w-full">
            <HCR highcharts={Highcharts} options={studentCountOptions} containerProps={{ style: { width: '100%', height: '100%' } }} />
          </div>
        </div>

        {/* Monthly Admission Growth */}
        <div className="bg-white p-4 sm:p-6 rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden relative">
          {loading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5a4bda]"></div></div>}
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-[14px] sm:text-[15px] font-bold text-gray-800">Monthly Admission Growth</h3>
            <select value={year} onChange={handleYearChange} className="text-[11px] sm:text-[12px] font-medium border border-gray-200 rounded-md text-gray-600 bg-white px-2 py-1 sm:px-2.5 sm:py-1.5 outline-none cursor-pointer">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="h-[240px] sm:h-[280px] w-full">
            <HCR highcharts={Highcharts} options={admissionGrowthOptions} containerProps={{ style: { width: '100%', height: '100%' } }} />
          </div>
        </div>

      </div>
    </>
  );
}

export default Dashboard;
