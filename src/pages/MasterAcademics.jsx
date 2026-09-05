import { useState, useEffect } from 'react';
import { Edit, Trash2, ChevronRight, Plus, X, AlertTriangle } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../components/Skeleton';

const MasterAcademics = () => {
  const [activeMenu, setActiveMenu] = useState('Courses');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  
  // For dynamic dropdown options
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const sideMenu = [
    { name: 'Courses' },
    { name: 'Branches' },
    { name: 'Semesters' },
    { name: 'Subjects' },
    { name: 'Designations' }
  ];

  const endpoints = {
    Courses: '/superadmin/academics/departments',
    Branches: '/superadmin/academics/courses',
    Semesters: '/superadmin/academics/semesters',
    Subjects: '/superadmin/academics/subjects',
    Designations: '/superadmin/academics/designations'
  };

  const tableColumns = {
    Courses: [
      { key: 'name', label: 'Course Name' },
      { key: 'totalFaculty', label: 'Total Faculty' }
    ],
    Branches: [
      { key: 'code', label: 'Branch Code' },
      { key: 'name', label: 'Branch Name' },
      { key: 'department', label: 'Course' },
      { key: 'hod', label: 'HOD Name (Default)' },
      { key: 'duration', label: 'Duration' },
      { key: 'status', label: 'Status' }
    ],
    Semesters: [
      { key: 'semesterNumber', label: 'Semester No.' },
      { key: 'startDate', label: 'Start Date' },
      { key: 'status', label: 'Status' }
    ],
    Subjects: [
      { key: 'code', label: 'Subject Code' },
      { key: 'name', label: 'Subject Name' },
      { key: 'department', label: 'Course' },
      { key: 'courseName', label: 'Branch' },
      { key: 'semester', label: 'Semester' },
      { key: 'status', label: 'Status' }
    ],
    Designations: [
      { key: 'name', label: 'Designation Name' },
      { key: 'description', label: 'Description' },
      { key: 'level', label: 'Level' },
      { key: 'status', label: 'Status' }
    ]
  };

  const getFormFields = () => {
    const fields = {
      Courses: [
        { key: 'name', label: 'Course Name', type: 'text', required: true },
        { key: 'totalFaculty', label: 'Total Faculty (Default)', type: 'number', required: false }
      ],
      Branches: [
        { key: 'code', label: 'Branch Code', type: 'text', required: true, disabled: isEditing },
        { key: 'name', label: 'Branch Name', type: 'text', required: true },
        { 
          key: 'department', 
          label: 'Course', 
          type: 'select', 
          required: true,
          options: departments.map(d => ({ value: d.name, label: d.name }))
        },
        { key: 'hod', label: 'HOD Name (Default/Optional)', type: 'text', required: false },
        { key: 'duration', label: 'Duration (Years)', type: 'number', required: true },
        { key: 'totalSemesters', label: 'Total Semesters', type: 'number', required: true },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select', 
          required: false,
          options: [
            { value: 'Active', label: 'Active' },
            { value: 'Inactive', label: 'Inactive' }
          ]
        }
      ],
      Semesters: [
        { key: 'semesterNumber', label: 'Semester Number', type: 'number', required: true },
        { key: 'startDate', label: 'Start Date', type: 'date', required: true },
        { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Upcoming', 'Completed'], required: false }
      ],
      Subjects: [
        { key: 'code', label: 'Subject Code', type: 'text', required: true, disabled: isEditing },
        { key: 'name', label: 'Subject Name', type: 'text', required: true },
        { 
          key: 'department', 
          label: 'Course', 
          type: 'select', 
          required: true,
          options: departments.map(d => ({ value: d.name, label: d.name }))
        },
        { 
          key: 'courseName', 
          label: 'Branch', 
          type: 'select', 
          required: true,
          options: courses.filter(c => !formData.department || c.department === formData.department).map(c => ({ value: c.name, label: c.name }))
        },
        { 
          key: 'semester', 
          label: 'Semester', 
          type: 'select', 
          required: true,
          options: Array.from(new Set(semesters.map(s => s.semesterNumber))).sort((a,b)=>a-b).map(num => ({ value: num, label: `Semester ${num}` }))
        },
        { key: 'credits', label: 'Credits', type: 'number', required: true },
        { key: 'theory', label: 'Theory Marks', type: 'number', required: false },
        { key: 'practical', label: 'Practical Marks', type: 'number', required: false },
        { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'], required: false }
      ],
      Designations: [
        { key: 'name', label: 'Designation Name', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'text', required: false },
        { key: 'level', label: 'Level', type: 'text', required: false },
        { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'], required: false }
      ]
    };
    return fields[activeMenu] || [];
  };

  const formFields = getFormFields();

  // Fetch data when menu changes
  useEffect(() => {
    fetchData();
  }, [activeMenu]);

  // Fetch all dropdown options when modal opens
  useEffect(() => {
    if (showModal) {
      fetchDropdownOptions();
    }
  }, [showModal, activeMenu]);

  const fetchDropdownOptions = async () => {
    try {
      const deptRes = await axiosInstance.get('/superadmin/academics/departments');
      const coursesRes = await axiosInstance.get('/superadmin/academics/courses');
      const semestersRes = await axiosInstance.get('/superadmin/academics/semesters');

      const depts = Array.isArray(deptRes.data) ? deptRes.data : (deptRes.data?.data || []);
      const crs = Array.isArray(coursesRes.data) ? coursesRes.data : (coursesRes.data?.data || []);
      const sems = Array.isArray(semestersRes.data) ? semestersRes.data : (semestersRes.data?.data || []);
      
      setDepartments(depts);
      setCourses(crs);
      setSemesters(sems);
    } catch (error) {
      console.error('Failed to fetch dropdown options', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(endpoints[activeMenu]);
      
      let result = [];
      if (Array.isArray(res.data)) {
        result = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        result = res.data.data;
      }
      
      setData(result);
    } catch (error) {
      console.error(`Error fetching ${activeMenu}:`, error);
      toast.error(`Failed to fetch ${activeMenu.toLowerCase()}`);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setSelectedItem(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEditClick = (item) => {
    setIsEditing(true);
    setSelectedItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axiosInstance.put(`${endpoints[activeMenu]}/${selectedItem._id}`, formData);
        toast.success(`${activeMenu.slice(0, -1)} updated successfully`);
      } else {
        const response = await axiosInstance.post(endpoints[activeMenu], formData);
        toast.success(response.data?.message || `${activeMenu.slice(0, -1)} created successfully`);
      }
      setShowModal(false);
      setFormData({});
      setSelectedItem(null);
      setIsEditing(false);
      
      setTimeout(() => {
        fetchData();
      }, 300);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || `Failed to save ${activeMenu.toLowerCase()}`;
      if (errorMsg.includes('E11000 duplicate key')) {
        toast.error(`A master ${activeMenu.slice(0, -1).toLowerCase()} with this name or code already exists.`);
      } else {
        toast.error(errorMsg);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`${endpoints[activeMenu]}/${selectedItem._id}`);
      toast.success(`${activeMenu.slice(0, -1)} deleted successfully`);
      setShowDeleteModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to delete ${activeMenu.toLowerCase()}`);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'text-[#15803d] bg-[#dcfce3]';
      case 'Inactive': return 'text-[#dc2626] bg-[#fee2e2]';
      case 'Upcoming': return 'text-[#d97706] bg-[#fef3c7]';
      case 'Completed': return 'text-[#7c3aed] bg-[#ede9fe]';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col md:flex-row h-full font-['Inter'] w-full overflow-hidden">
      
      {/* Inner Sidebar */}
      <div className="w-full md:w-[240px] border-b md:border-b-0 md:border-r border-gray-100 p-4 md:p-0 md:py-4 flex flex-row md:flex-col flex-wrap md:flex-nowrap justify-start gap-2 md:gap-0 flex-shrink-0">
        <div className="px-6 py-2 pb-4">
            <h2 className="font-bold text-gray-800 tracking-wide text-sm">MASTER ACADEMICS</h2>
            <p className="text-xs text-gray-500 mt-1">Manage global templates</p>
        </div>
        {sideMenu.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveMenu(item.name)}
            className={`w-auto md:w-full flex-shrink-0 flex items-center justify-between px-4 md:px-6 py-2 md:py-3.5 transition-all text-left rounded-full md:rounded-none md:rounded-r-full border md:border-transparent ${
              activeMenu === item.name 
                ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white font-medium shadow-sm' 
                : 'bg-white md:bg-transparent border-gray-200 text-gray-600 hover:bg-gray-50 md:hover:bg-gray-50 md:text-gray-700 font-medium'
            }`}
          >
            <span className="text-[13px] md:text-[14px] whitespace-nowrap">{item.name}</span>
            <ChevronRight size={16} className={`hidden md:block ${activeMenu === item.name ? 'text-white' : 'text-gray-400'}`} />
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header inside content */}
        <div className="flex items-center justify-between p-4 md:p-6 gap-2 border-b border-gray-100 md:border-none mb-2 md:mb-0">
          <h2 className="text-[17px] md:text-[18px] font-bold text-[#8b5cf6] font-['Outfit']">{activeMenu} (Master)</h2>
          <button 
            onClick={handleAddClick}
            className="bg-[#8b5cf6] hover:bg-purple-700 text-white px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm font-['Inter'] flex-shrink-0"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline">Add Master {activeMenu.slice(0, -1)}</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto px-4 md:px-6 pb-6">
          {loading ? (
            <TableSkeleton rows={5} columns={4} />
          ) : !Array.isArray(data) || data.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 text-sm">No master {activeMenu.toLowerCase()} found</p>
            </div>
          ) : (
            <div className="inline-block w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F9FAFB] border-y border-gray-100">
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800 whitespace-nowrap">#</th>
                    {tableColumns[activeMenu]?.map((col) => (
                      <th key={col.key} className="py-4 px-6 text-[13px] font-bold text-gray-800 whitespace-nowrap">
                        {col.label}
                      </th>
                    ))}
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800 whitespace-nowrap text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(data) && data.map((row, index) => (
                    <tr key={row._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 text-[13px] text-gray-600 font-semibold whitespace-nowrap">{index + 1}</td>
                      {tableColumns[activeMenu]?.map((col) => (
                        <td key={col.key} className="py-4 px-6 text-[13px] text-gray-800 font-medium whitespace-nowrap">
                          {col.label === 'Status' ? (
                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide inline-block ${getStatusColor(row[col.key])}`}>
                              {row[col.key]}
                            </span>
                          ) : col.key.includes('Date') ? (
                            formatDate(row[col.key])
                          ) : (
                            row[col.key] || 'N/A'
                          )}
                        </td>
                      ))}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                          <button 
                            onClick={() => handleEditClick(row)}
                            className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm flex-shrink-0"
                            title="Edit"
                          >
                            <Edit size={14} strokeWidth={2} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(row)}
                            className="w-8 h-8 rounded border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm bg-red-50/50 flex-shrink-0"
                            title="Delete"
                          >
                            <Trash2 size={14} strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <AcademicsModal
          title={isEditing ? `Edit Master ${activeMenu.slice(0, -1)}` : `Add Master ${activeMenu.slice(0, -1)}`}
          fields={formFields}
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleFormSubmit}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedItem && (
        <DeleteConfirmationModal
          title={`Delete Master ${activeMenu.slice(0, -1)}`}
          message={`Are you sure you want to delete ${selectedItem.name || selectedItem.code || selectedItem.id}?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

// Modal Components
const AcademicsModal = ({ title, fields, formData, onInputChange, onSubmit, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {fields?.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.type === 'select' ? (
                <select
                  value={formData[field.key] || ''}
                  onChange={(e) => onInputChange(field.key, e.target.value)}
                  required={field.required}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] text-sm"
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((opt) => {
                    const value = typeof opt === 'string' ? opt : opt.value;
                    const label = typeof opt === 'string' ? opt : opt.label;
                    return (
                      <option key={value} value={value}>{label}</option>
                    );
                  })}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={formData[field.key] || ''}
                  onChange={(e) => onInputChange(field.key, e.target.value)}
                  disabled={field.disabled}
                  required={field.required}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-[#8b5cf6] text-white py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
            >
              {formData._id ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-red-50">
          <AlertTriangle size={24} className="text-red-600" />
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>

        <div className="px-6 py-6">
          <p className="text-gray-600 text-sm">{message}</p>
        </div>

        <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MasterAcademics;
