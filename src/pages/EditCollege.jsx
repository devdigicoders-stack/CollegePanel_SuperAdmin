import React, { useState, useEffect } from 'react';
import { Building2, Save, X, Upload } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function EditCollege() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    collegeName: '',
    collegeCode: '',
    collegeType: '',
    aicteCode: '',
    affiliationNumber: '',
    establishedYear: '',
    contactNumber: '',
    website: '',
    officialEmail: '',
    address: '',
    city: '',
    district: '',
    state: '',
    pinCode: '',
    principalName: '',
    principalEmail: '',
    principalQualification: '',
    adminName: '',
    adminEmail: '',
    adminMobile: '',
    username: '',
    password: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchCollegeData();
  }, [id]);

  const fetchCollegeData = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/colleges/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const col = res.data;
      setFormData({
        collegeName: col.collegeName || '',
        collegeCode: col.collegeCode || '',
        collegeType: col.collegeType || '',
        aicteCode: col.aicteCode || '',
        affiliationNumber: col.affiliationNumber || '',
        establishedYear: col.establishedYear || '',
        contactNumber: col.contactNumber || '',
        website: col.website || '',
        officialEmail: col.officialEmail || '',
        address: col.address || '',
        city: col.city || '',
        district: col.district || '',
        state: col.state || '',
        pinCode: col.pinCode || '',
        principalName: col.principalName || '',
        principalEmail: col.principalEmail || '',
        principalQualification: col.principalQualification || '',
        adminName: col.adminName || '',
        adminEmail: col.adminEmail || '',
        adminMobile: col.adminMobile || '',
        username: col.username || '',
        password: '' // Keep password empty initially
      });

      if (col.collegeLogo) {
        setImagePreview(`${import.meta.env.VITE_API_URL.replace('/api', '')}${col.collegeLogo}`);
      }

    } catch (err) {
      console.error(err);
      toast.error('Failed to load college data');
      navigate('/all-colleges');
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Please select an image file');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('superadmin_token');
      const submitData = new FormData();

      Object.keys(formData).forEach(key => {
        // Skip password if it's empty
        if (key === 'password' && !formData[key]) {
          return;
        }
        submitData.append(key, formData[key]);
      });

      if (imageFile) {
        submitData.append('collegeLogo', imageFile);
      }

      const res = await axios.put(`${import.meta.env.VITE_API_URL}/colleges/${id}`, submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success(res.data.message);
      navigate('/all-colleges');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update college');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="flex items-center justify-center h-full text-gray-500">Loading details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Edit College</h1>
        <div className="flex items-center text-[12px] text-gray-500 font-medium">
          <Link to="/dashboard" className="hover:text-[#5a4bda] transition-colors">Dashboard</Link>
          <span className="mx-2">&gt;</span>
          <Link to="/all-colleges" className="hover:text-[#5a4bda] transition-colors">All Colleges</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-800 font-semibold">Edit College</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Form Sections */}
        <div className="p-6 sm:p-8 space-y-10">
          
          {/* 1. College Basic Details */}
          <section>
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 size={18} />
              </div>
              <h2 className="text-[16px] font-bold text-gray-800">College Basic Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-6 mb-2">
                <div className="w-24 h-24 rounded-full bg-gray-50 border border-gray-200 shrink-0 overflow-hidden relative group">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <Upload size={24} />
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer transition-all">
                    <span className="text-[11px] text-white font-medium">Change Logo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
                <div>
                  <p className="text-[14px] font-bold text-gray-800 mb-1">College Logo</p>
                  <p className="text-[12px] text-gray-500 max-w-xs">Upload a new logo to update. Recommended size 256x256px.</p>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">College Name <span className="text-red-500">*</span></label>
                <input type="text" name="collegeName" required value={formData.collegeName} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda]/20 focus:border-[#5a4bda] transition-all" />
              </div>
              
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">College Code <span className="text-red-500">*</span></label>
                <input type="text" name="collegeCode" required value={formData.collegeCode} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda]/20 focus:border-[#5a4bda] transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">College Type <span className="text-red-500">*</span></label>
                <select name="collegeType" required value={formData.collegeType} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda]/20 focus:border-[#5a4bda] transition-all">
                  <option value="">Select Type</option>
                  <option value="Government">Government</option>
                  <option value="Private">Private</option>
                  <option value="Aided">Aided</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">AICTE Code</label>
                <input type="text" name="aicteCode" value={formData.aicteCode} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda]/20 focus:border-[#5a4bda] transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Affiliation Number</label>
                <input type="text" name="affiliationNumber" value={formData.affiliationNumber} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda]/20 focus:border-[#5a4bda] transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Established Year</label>
                <input type="number" name="establishedYear" value={formData.establishedYear} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda]/20 focus:border-[#5a4bda] transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Contact Number</label>
                <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda]/20 focus:border-[#5a4bda] transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Website</label>
                <input type="url" name="website" value={formData.website} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda]/20 focus:border-[#5a4bda] transition-all" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Official Email</label>
                <input type="email" name="officialEmail" value={formData.officialEmail} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda]/20 focus:border-[#5a4bda] transition-all" />
              </div>
            </div>
          </section>

          {/* 2. Address Details */}
          <section>
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <Building2 size={18} />
              </div>
              <h2 className="text-[16px] font-bold text-gray-800">Address Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div className="md:col-span-2">
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Address</label>
                <textarea name="address" rows="3" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda]/20 focus:border-[#5a4bda] transition-all resize-none"></textarea>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda]/20 focus:border-[#5a4bda] transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">District</label>
                <input type="text" name="district" value={formData.district} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda]/20 focus:border-[#5a4bda] transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">State</label>
                <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda]/20 focus:border-[#5a4bda] transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Pin Code</label>
                <input type="text" name="pinCode" value={formData.pinCode} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda]/20 focus:border-[#5a4bda] transition-all" />
              </div>
            </div>
          </section>

          {/* 3. Principal & Admin Details */}
          <section>
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                <Building2 size={18} />
              </div>
              <h2 className="text-[16px] font-bold text-gray-800">Key Personnel</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Principal Name</label>
                <input type="text" name="principalName" value={formData.principalName} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda]/20 focus:border-[#5a4bda] transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Principal Email</label>
                <input type="email" name="principalEmail" value={formData.principalEmail} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda]/20 focus:border-[#5a4bda] transition-all" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Principal Qualification</label>
                <input type="text" name="principalQualification" value={formData.principalQualification} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda]/20 focus:border-[#5a4bda] transition-all" />
              </div>

              <div className="md:col-span-2 mt-4 border-t border-gray-100 pt-4">
                <h3 className="text-[14px] font-bold text-gray-800 mb-4">College Admin Credentials</h3>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Admin Name <span className="text-red-500">*</span></label>
                <input type="text" name="adminName" required value={formData.adminName} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda]/20 focus:border-[#5a4bda] transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Admin Email <span className="text-red-500">*</span></label>
                <input type="email" name="adminEmail" required value={formData.adminEmail} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda]/20 focus:border-[#5a4bda] transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Admin Mobile</label>
                <input type="text" name="adminMobile" value={formData.adminMobile} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda]/20 focus:border-[#5a4bda] transition-all" />
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mt-2">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Username <span className="text-red-500">*</span></label>
                  <input type="text" name="username" required value={formData.username} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda]/20 focus:border-[#5a4bda] transition-all" />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">New Password</label>
                  <input type="text" name="password" value={formData.password} onChange={handleInputChange} placeholder="Leave blank to keep unchanged" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda]/20 focus:border-[#5a4bda] transition-all" />
                </div>
              </div>

            </div>
          </section>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-end gap-3">
          <Link to="/all-colleges" className="w-full sm:w-auto">
            <button type="button" className="w-full sm:w-auto px-6 py-2.5 text-[13px] font-bold text-gray-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <X size={16} />
              Cancel
            </button>
          </Link>
          <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-2.5 text-[13px] font-bold text-white bg-[#5a4bda] rounded-lg shadow-sm hover:bg-[#4d3ecc] transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
            <Save size={16} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </form>

    </div>
  );
}

export default EditCollege;
