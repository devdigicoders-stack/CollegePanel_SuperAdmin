import React, { useState, useRef, useCallback } from 'react';
import { Upload, Eye, EyeOff, MapPin, Search } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'];
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

function CreateCollege() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return toast.error('File size must be less than 2MB');
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.collegeName || !formData.collegeCode || !formData.collegeType || !formData.adminName || !formData.adminEmail || !formData.username || !formData.password) {
      return toast.error('Please fill all required fields (*)');
    }

    try {
      setIsSubmitting(true);
      
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      if (logoFile) {
        submitData.append('collegeLogo', logoFile);
      }

      await axiosInstance.post('/colleges', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('College created successfully!');
      
      // Reset form
      setFormData({
        collegeName: '', collegeCode: '', collegeType: '', aicteCode: '',
        affiliationNumber: '', establishedYear: '', contactNumber: '', website: '', officialEmail: '',
        address: '', city: '', district: '', state: '', pinCode: '',
        principalName: '', principalEmail: '', principalQualification: '',
        adminName: '', adminEmail: '', adminMobile: '', username: '', password: '',
        lat: '', lng: '', radius: '50'
      });
      setLogoFile(null);
      setLogoPreview('');
      
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create college');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center text-[12px] text-gray-500 font-medium">
        <span className="cursor-pointer hover:text-[#5a4bda] transition-colors">Dashboard</span>
        <span className="mx-2">&gt;</span>
        <span className="cursor-pointer hover:text-[#5a4bda] transition-colors">Colleges</span>
        <span className="mx-2">&gt;</span>
        <span className="text-gray-800 font-semibold">Create College</span>
      </div>

      <div className="space-y-6">
        {/* College Information */}
        <div className="bg-white p-6 sm:p-8 rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
          <h2 className="text-[16px] font-bold text-gray-800 mb-6">College Information</h2>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">College Name<span className="text-red-500">*</span></label>
                <input type="text" name="collegeName" value={formData.collegeName} onChange={handleInputChange} placeholder="Enter college name" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
              </div>
              
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">College Code<span className="text-red-500">*</span></label>
                <input type="text" name="collegeCode" value={formData.collegeCode} onChange={handleInputChange} placeholder="Enter college code" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">College Type<span className="text-red-500">*</span></label>
                <select name="collegeType" value={formData.collegeType} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all outline-none">
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
                <input type="text" name="establishedYear" value={formData.establishedYear} onChange={handleInputChange} placeholder="e.g. 1995" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Contact Number</label>
                <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="Enter contact number" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Website</label>
                <input type="text" name="website" value={formData.website} onChange={handleInputChange} placeholder="Enter website" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
              </div>

            </div>

            <div className="lg:w-[320px] shrink-0">
               <div className="flex justify-between items-end mb-1.5">
                  <label className="block text-[13px] font-semibold text-gray-700">College Logo</label>
               </div>
               
               <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
               
               <div onClick={() => fileInputRef.current.click()} className="w-full h-[180px] border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center justify-center gap-3 transition-colors hover:border-[#5a4bda] hover:bg-[#5a4bda]/5 cursor-pointer overflow-hidden">
                 {logoPreview ? (
                   <img src={logoPreview} alt="Preview" className="w-full h-full object-contain p-2" />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Principal Information */}
          <div className="bg-white p-6 sm:p-8 rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
            <h2 className="text-[16px] font-bold text-gray-800 mb-6">Principal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
               <div className="sm:col-span-2">
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Principal Name</label>
                  <input type="text" name="principalName" value={formData.principalName} onChange={handleInputChange} placeholder="Enter principal name" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
               </div>
               
               <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Email</label>
                  <input type="email" name="principalEmail" value={formData.principalEmail} onChange={handleInputChange} placeholder="Enter email" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
               </div>

               <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Qualification</label>
                  <input type="text" name="principalQualification" value={formData.principalQualification} onChange={handleInputChange} placeholder="Enter qualification" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
               </div>
            </div>
          </div>

          {/* Admin Information */}
          <div className="bg-white p-6 sm:p-8 rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
            <h2 className="text-[16px] font-bold text-gray-800 mb-6">Admin Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
               <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Admin Name<span className="text-red-500">*</span></label>
                  <input type="text" name="adminName" value={formData.adminName} onChange={handleInputChange} placeholder="Enter admin name" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
               </div>
               
               <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Admin Email<span className="text-red-500">*</span></label>
                  <input type="email" name="adminEmail" value={formData.adminEmail} onChange={handleInputChange} placeholder="Enter admin email" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
               </div>

               <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Admin Mobile</label>
                  <input type="text" name="adminMobile" value={formData.adminMobile} onChange={handleInputChange} placeholder="Enter mobile number" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
               </div>

               <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Username<span className="text-red-500">*</span></label>
                  <input type="text" name="username" value={formData.username} onChange={handleInputChange} placeholder="Enter username" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
               </div>

               <div className="sm:col-span-2">
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Password<span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password" 
                      className="w-full pl-4 pr-10 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 mt-8">
          <button 
            type="button"
            className="w-full sm:w-auto px-6 py-2.5 text-[13px] font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-2.5 text-[13px] font-bold text-white bg-[#5a4bda] rounded-lg shadow-md shadow-indigo-500/20 hover:bg-[#4d3ecc] transition-colors disabled:opacity-70"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
          <button 
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 text-[13px] font-bold text-white bg-[#5a4bda] rounded-lg shadow-md shadow-indigo-500/20 hover:bg-[#4d3ecc] transition-colors disabled:opacity-70"
          >
            {isSubmitting ? 'Saving...' : 'Save & Send Credentials'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default CreateCollege;
