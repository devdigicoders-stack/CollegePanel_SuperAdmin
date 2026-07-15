import { Building2, Users, Briefcase, User, PlayCircle, StopCircle } from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

Highcharts.setOptions({
  chart: { style: { fontFamily: 'inherit' } },
  credits: { enabled: false },
  title: { text: null },
  legend: { enabled: false }
});

const HCR = HighchartsReact && HighchartsReact.default ? HighchartsReact.default : HighchartsReact;

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
    data: [200, 400, 200, 400, 1100, 600, 500, 900, 700, 900, 400, 600], 
    color: '#5a4bda', lineWidth: 3
  }]
};

const studentCountOptions = {
  chart: { type: 'column', height: 280, backgroundColor: 'transparent' },
  xAxis: { 
    categories: ['College A', 'College B', 'College C', 'College D', 'College E'],
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
    data: [400, 300, 250, 200, 220], 
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
    data: [200, 400, 200, 250, 700, 450, 650, 700, 550, 400, 300, 150], 
    color: '#8b5cf6' 
  }]
};

const statCards = [
  { title: 'Total Colleges', value: '25', icon: Building2, color: 'text-blue-500', bg: 'bg-blue-50' },
  { title: 'Active Colleges', value: '20', icon: PlayCircle, color: 'text-green-500', bg: 'bg-green-50' },
  { title: 'Inactive Colleges', value: '5', icon: StopCircle, color: 'text-red-500', bg: 'bg-red-50' },
  { title: 'Total Admins', value: '25', icon: User, color: 'text-orange-500', bg: 'bg-orange-50' },
  { title: 'Total Students', value: '12,548', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
  { title: 'Total Teachers', value: '1,245', icon: Briefcase, color: 'text-cyan-500', bg: 'bg-cyan-50' },
  { title: 'Total Employees', value: '2,356', icon: User, color: 'text-indigo-500', bg: 'bg-indigo-50' },
];

function Dashboard() {
  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-[14px] p-4 sm:p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all group">
            <div className={`w-[48px] h-[48px] sm:w-[52px] sm:h-[52px] rounded-[12px] flex items-center justify-center shrink-0 ${stat.bg} ${stat.color} group-hover:scale-105 transition-transform`}>
              <stat.icon size={22} strokeWidth={1.8} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[11px] sm:text-[12px] font-semibold text-gray-500 mb-0.5 tracking-wide">{stat.title}</p>
              <p className="text-[20px] sm:text-[22px] font-bold text-gray-800 leading-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pb-6">
        
        {/* Monthly College Registration */}
        <div className="bg-white p-4 sm:p-6 rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-[14px] sm:text-[15px] font-bold text-gray-800">Monthly College Registration</h3>
            <select className="text-[11px] sm:text-[12px] font-medium border border-gray-200 rounded-md text-gray-600 bg-white px-2 py-1 sm:px-2.5 sm:py-1.5 outline-none cursor-pointer">
              <option>2024</option>
            </select>
          </div>
          <div className="h-[240px] sm:h-[280px] w-full">
            <HCR highcharts={Highcharts} options={monthlyRegOptions} containerProps={{ style: { width: '100%', height: '100%' } }} />
          </div>
        </div>

        {/* College-wise Student Count */}
        <div className="bg-white p-4 sm:p-6 rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-[14px] sm:text-[15px] font-bold text-gray-800">College-wise Student Count</h3>
            <select className="text-[11px] sm:text-[12px] font-medium border border-gray-200 rounded-md text-gray-600 bg-white px-2 py-1 sm:px-2.5 sm:py-1.5 outline-none cursor-pointer">
              <option>2024</option>
            </select>
          </div>
          <div className="h-[240px] sm:h-[280px] w-full">
            <HCR highcharts={Highcharts} options={studentCountOptions} containerProps={{ style: { width: '100%', height: '100%' } }} />
          </div>
        </div>

        {/* Monthly Admission Growth */}
        <div className="bg-white p-4 sm:p-6 rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-[14px] sm:text-[15px] font-bold text-gray-800">Monthly Admission Growth</h3>
            <select className="text-[11px] sm:text-[12px] font-medium border border-gray-200 rounded-md text-gray-600 bg-white px-2 py-1 sm:px-2.5 sm:py-1.5 outline-none cursor-pointer">
              <option>2024</option>
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
