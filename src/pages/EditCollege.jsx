import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Building2, Save, X, Upload, MapPin, Search } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'];
import { Link, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
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
    password: '',
    lat: '',
    lng: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const fileInputRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libraries
  });

  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Default to India center for view
  const [autocomplete, setAutocomplete] = useState(null);

  const onLoadAutocomplete = (autoC) => setAutocomplete(autoC);

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setFormData(prev => ({ ...prev, lat, lng }));
        setMapCenter({ lat, lng });
      } else {
        toast.error('Location details not found. Please try another place or click on the map.');
      }
    }
  };
  
  const onMapClick = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    }));
  }, []);

  useEffect(() => {
    fetchCollegeData();
  }, [id]);

  const fetchCollegeData = async () => {
    try {
      const res = await axiosInstance.get(`/colleges/${id}`);
      
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
        password: '',
        lat: col.location?.lat || '',
        lng: col.location?.lng || '',
        radius: col.location?.radius || '50'
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
      const submitData = new FormData();

      Object.keys(formData).forEach(key => {
        if (key === 'password' && !formData[key]) return;
        submitData.append(key, formData[key]);
      });

      if (imageFile) {
        submitData.append('collegeLogo', imageFile);
      }

      const res = await axiosInstance.put(`/colleges/${id}`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
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
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* College Information */}
        <div className="bg-white p-6 sm:p-8 rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
          <h2 className="text-[16px] font-bold text-gray-800 mb-6">College Information</h2>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">College Name<span className="text-red-500">*</span></label>
                <input type="text" name="collegeName" required value={formData.collegeName} onChange={handleInputChange} placeholder="Enter college name" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
              </div>
              
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">College Code<span className="text-red-500">*</span></label>
                <input type="text" name="collegeCode" required value={formData.collegeCode} onChange={handleInputChange} placeholder="Enter college code" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">College Type<span className="text-red-500">*</span></label>
                <select name="collegeType" required value={formData.collegeType} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all outline-none">
                  <option value="" className="text-gray-500">Select type</option>
                  <option value="Government">Government</option>
                  <option value="Private">Private</option>
                  <option value="Aided">Aided</option>
                  <option value="PPP">PPP</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">AICTE Code</label>
                <input type="text" name="aicteCode" value={formData.aicteCode} onChange={handleInputChange} placeholder="Enter AICTE code" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Affiliation Number</label>
                <input type="text" name="affiliationNumber" value={formData.affiliationNumber} onChange={handleInputChange} placeholder="Enter affiliation number" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Established Year</label>
                <input type="number" name="establishedYear" value={formData.establishedYear} onChange={handleInputChange} placeholder="e.g. 2005" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Contact Number</label>
                <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="Enter contact number" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Website</label>
                <input type="url" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://..." className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
              </div>
            </div>

            <div className="lg:w-[320px] shrink-0">
               <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">College Logo</label>
               <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
               <div onClick={() => fileInputRef.current.click()} className="w-full h-[180px] border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center justify-center gap-3 transition-colors hover:border-[#5a4bda] hover:bg-[#5a4bda]/5 cursor-pointer overflow-hidden">
                 {imagePreview ? (
                   <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-2" />
                 ) : (
                   <>
                     <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center">
                        <Upload size={20} className="text-gray-400" />
                     </div>
                     <button type="button" className="px-4 py-1.5 bg-[#5a4bda]/10 text-[#5a4bda] text-[12px] font-bold rounded-md hover:bg-[#5a4bda]/20 transition-colors">
                       Upload Logo
                     </button>
                     <span className="text-[11px] text-gray-400 font-medium">JPG, PNG, GIF (Max. 2MB)</span>
                   </>
                 )}
               </div>
               
               <div className="mt-5">
                 <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Official Email</label>
                 <input type="email" name="officialEmail" value={formData.officialEmail} onChange={handleInputChange} placeholder="Enter email" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
               </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white p-6 sm:p-8 rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
          <h2 className="text-[16px] font-bold text-gray-800 mb-6">Address Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div className="md:col-span-2">
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Complete Address</label>
              <textarea name="address" value={formData.address} onChange={handleInputChange} rows="2" placeholder="Enter complete address" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all resize-none"></textarea>
            </div>
            
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Enter city" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">District</label>
              <input type="text" name="district" value={formData.district} onChange={handleInputChange} placeholder="Enter district" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">State</label>
              <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="Enter state" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">PIN Code</label>
              <input type="text" name="pinCode" value={formData.pinCode} onChange={handleInputChange} placeholder="Enter PIN code" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white p-6 sm:p-8 rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
          <h2 className="text-[16px] font-bold text-gray-800 mb-6 flex items-center gap-2">
            <MapPin size={18} className="text-[#5a4bda]" /> Location (Google Maps)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-6">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Latitude<span className="text-red-500">*</span></label>
              <input type="number" step="any" name="lat" required value={formData.lat} onChange={handleInputChange} placeholder="e.g. 28.7041" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Longitude<span className="text-red-500">*</span></label>
              <input type="number" step="any" name="lng" required value={formData.lng} onChange={handleInputChange} placeholder="e.g. 77.1025" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
            </div>
          </div>
          
          {isLoaded ? (
            <div className="flex flex-col gap-4">
              <Autocomplete onLoad={onLoadAutocomplete} onPlaceChanged={onPlaceChanged}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for a college or location..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent shadow-sm"
                  />
                </div>
              </Autocomplete>

              <div className="h-[300px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm relative">
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={formData.lat !== '' && formData.lng !== '' ? { lat: Number(formData.lat), lng: Number(formData.lng) } : mapCenter}
                  zoom={formData.lat !== '' && formData.lng !== '' ? 16 : 5}
                  onClick={onMapClick}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: true,
                    mapTypeId: 'satellite',
                    fullscreenControl: false,
                  }}
                >
                  {formData.lat !== '' && formData.lng !== '' && (
                    <Marker 
                      position={{ lat: Number(formData.lat), lng: Number(formData.lng) }} 
                      draggable={true}
                      onDragEnd={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          lat: e.latLng.lat(),
                          lng: e.latLng.lng()
                        }));
                      }}
                    />
                  )}
                </GoogleMap>
                <div className="absolute top-2 left-2 bg-white px-3 py-1.5 rounded shadow text-[12px] font-semibold text-gray-700 z-10 pointer-events-none">
                  Search above or click on the map to set location
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[300px] w-full rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 text-[13px]">
              Loading Map...
            </div>
          )}
        </div>

        {/* Combined Principal & Admin Information */}
        <div className="bg-white p-6 sm:p-8 rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
          <h2 className="text-[16px] font-bold text-gray-800 mb-6">Key Personnel</h2>
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
