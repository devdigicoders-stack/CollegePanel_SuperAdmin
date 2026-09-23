import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Building2, Save, X, Upload, MapPin, Search, BookOpen } from 'lucide-react';
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

  const [masterAcademics, setMasterAcademics] = useState({
    courses: [],
    departments: [],
    semesters: [],
    subjects: [],
    designations: []
  });

  const [selectedAcademics, setSelectedAcademics] = useState({
    courses: [],
    departments: [],
    semesters: [],
    subjects: [],
    designations: []
  });

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [cRes, dRes, sRes, subRes, desRes] = await Promise.all([
          axiosInstance.get('/superadmin/academics/courses'),
          axiosInstance.get('/superadmin/academics/departments'),
          axiosInstance.get('/superadmin/academics/semesters'),
          axiosInstance.get('/superadmin/academics/subjects'),
          axiosInstance.get('/superadmin/academics/designations')
        ]);
        setMasterAcademics({
          courses: Array.isArray(cRes.data) ? cRes.data : (cRes.data?.data || []),
          departments: Array.isArray(dRes.data) ? dRes.data : (dRes.data?.data || []),
          semesters: Array.isArray(sRes.data) ? sRes.data : (sRes.data?.data || []),
          subjects: Array.isArray(subRes.data) ? subRes.data : (subRes.data?.data || []),
          designations: Array.isArray(desRes.data) ? desRes.data : (desRes.data?.data || [])
        });
      } catch (error) {
        console.error('Error fetching master academics', error);
      }
    };
    fetchMasterData();
  }, []);

  const handleAcademicSelect = (type, id) => {
    setSelectedAcademics(prev => {
      const isSelected = prev[type].includes(id);
      return {
        ...prev,
        [type]: isSelected ? prev[type].filter(i => i !== id) : [...prev[type], id]
      };
    });
  };

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
      submitData.append('academics', JSON.stringify(selectedAcademics));

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
          <Link to="/dashboard" className="hover:text-[#008744] transition-colors">Dashboard</Link>
          <span className="mx-2">&gt;</span>
          <Link to="/all-colleges" className="hover:text-[#008744] transition-colors">All Colleges</Link>
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
                <input type="text" name="collegeName" required value={formData.collegeName} onChange={handleInputChange} placeholder="Enter college name" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008744] focus:border-transparent transition-all" />
              </div>
              
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">College Code<span className="text-red-500">*</span></label>
                <input type="text" name="collegeCode" required value={formData.collegeCode} onChange={handleInputChange} placeholder="Enter college code" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008744] focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">College Type<span className="text-red-500">*</span></label>
                <select name="collegeType" required value={formData.collegeType} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008744] focus:border-transparent transition-all outline-none">
                  <option value="" className="text-gray-500">Select type</option>
                  <option value="Government">Government</option>
                  <option value="Private">Private</option>
                  <option value="Aided">Aided</option>
                  <option value="PPP">PPP</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">AICTE Code</label>
                <input type="text" name="aicteCode" value={formData.aicteCode} onChange={handleInputChange} placeholder="Enter AICTE code" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008744] focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Affiliation Number</label>
                <input type="text" name="affiliationNumber" value={formData.affiliationNumber} onChange={handleInputChange} placeholder="Enter affiliation number" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008744] focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Established Year</label>
                <input type="number" name="establishedYear" value={formData.establishedYear} onChange={handleInputChange} placeholder="e.g. 2005" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008744] focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Contact Number</label>
                <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="Enter contact number" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008744] focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Website</label>
                <input type="url" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://..." className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008744] focus:border-transparent transition-all" />
              </div>
            </div>

            <div className="lg:w-[320px] shrink-0">
               <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">College Logo</label>
               <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
               <div onClick={() => fileInputRef.current.click()} className="w-full h-[180px] border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center justify-center gap-3 transition-colors hover:border-[#008744] hover:bg-[#008744]/5 cursor-pointer overflow-hidden">
                 {imagePreview ? (
                   <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-2" />
                 ) : (
                   <>
                     <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center">
                        <Upload size={20} className="text-gray-400" />
                     </div>
                     <button type="button" className="px-4 py-1.5 bg-[#008744]/10 text-[#008744] text-[12px] font-bold rounded-md hover:bg-[#008744]/20 transition-colors">
                       Upload Logo
                     </button>
                     <span className="text-[11px] text-gray-400 font-medium">JPG, PNG, GIF (Max. 2MB)</span>
                   </>
                 )}
               </div>
               
               <div className="mt-5">
                 <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Official Email</label>
                 <input type="email" name="officialEmail" value={formData.officialEmail} onChange={handleInputChange} placeholder="Enter email" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008744] focus:border-transparent transition-all" />
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
              <textarea name="address" value={formData.address} onChange={handleInputChange} rows="2" placeholder="Enter complete address" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008744] focus:border-transparent transition-all resize-none"></textarea>
            </div>
            
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Enter city" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008744] focus:border-transparent transition-all" />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">District</label>
              <input type="text" name="district" value={formData.district} onChange={handleInputChange} placeholder="Enter district" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008744] focus:border-transparent transition-all" />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">State</label>
              <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="Enter state" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008744] focus:border-transparent transition-all" />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">PIN Code</label>
              <input type="text" name="pinCode" value={formData.pinCode} onChange={handleInputChange} placeholder="Enter PIN code" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008744] focus:border-transparent transition-all" />
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white p-6 sm:p-8 rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
          <h2 className="text-[16px] font-bold text-gray-800 mb-6 flex items-center gap-2">
            <MapPin size={18} className="text-[#008744]" /> Location (Google Maps)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-6">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Latitude<span className="text-red-500">*</span></label>
              <input type="number" step="any" name="lat" required value={formData.lat} onChange={handleInputChange} placeholder="e.g. 28.7041" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008744] focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Longitude<span className="text-red-500">*</span></label>
              <input type="number" step="any" name="lng" required value={formData.lng} onChange={handleInputChange} placeholder="e.g. 77.1025" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008744] focus:border-transparent transition-all" />
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
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008744] focus:border-transparent shadow-sm"
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

        {/* Master Academics Assignment */}
        <div className="bg-white p-6 sm:p-8 rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
          <h2 className="text-[16px] font-bold text-gray-800 mb-6 flex items-center gap-2">
            <BookOpen size={18} className="text-[#008744]" /> Assign Master Academics
          </h2>
          <p className="text-[13px] text-gray-500 mb-6">
            Select additional master records to add to this college. Existing college records will not be duplicated.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Courses (Departments) */}
            <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col h-64">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 text-[13px] flex justify-between items-center">
                <span>Courses</span>
                <span className="text-[11px] bg-white px-2 py-0.5 rounded-full border border-gray-200">{selectedAcademics.departments.length} selected</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 custom-scrollbar">
                {masterAcademics.departments.length === 0 ? (
                   <div className="text-[12px] text-gray-400 italic text-center py-4">No master courses found</div>
                ) : masterAcademics.departments.map(dept => (
                  <label key={dept._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-[#008744] focus:ring-[#008744]"
                      checked={selectedAcademics.departments.includes(dept._id)}
                      onChange={() => handleAcademicSelect('departments', dept._id)}
                    />
                    <span className="text-[13px] text-gray-700">{dept.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Branches (Courses) */}
            <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col h-64">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 text-[13px] flex justify-between items-center">
                <span>Branches</span>
                <span className="text-[11px] bg-white px-2 py-0.5 rounded-full border border-gray-200">{selectedAcademics.courses.length} selected</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 custom-scrollbar">
                {masterAcademics.courses.length === 0 ? (
                   <div className="text-[12px] text-gray-400 italic text-center py-4">No master branches found</div>
                ) : masterAcademics.courses.map(course => (
                  <label key={course._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-[#008744] focus:ring-[#008744]"
                      checked={selectedAcademics.courses.includes(course._id)}
                      onChange={() => handleAcademicSelect('courses', course._id)}
                    />
                    <div className="flex flex-col">
                       <span className="text-[13px] text-gray-700 font-medium">{course.name}</span>
                       <span className="text-[11px] text-gray-400">{course.code} | {course.department}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Semesters */}
            <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col h-64">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 text-[13px] flex justify-between items-center">
                <span>Semesters</span>
                <span className="text-[11px] bg-white px-2 py-0.5 rounded-full border border-gray-200">{selectedAcademics.semesters.length} selected</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 custom-scrollbar">
                {masterAcademics.semesters.length === 0 ? (
                   <div className="text-[12px] text-gray-400 italic text-center py-4">No master semesters found</div>
                ) : masterAcademics.semesters.map(sem => (
                  <label key={sem._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-[#008744] focus:ring-[#008744]"
                      checked={selectedAcademics.semesters.includes(sem._id)}
                      onChange={() => handleAcademicSelect('semesters', sem._id)}
                    />
                    <span className="text-[13px] text-gray-700">Semester {sem.semesterNumber}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Subjects */}
            <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col h-64 md:col-span-2 lg:col-span-1">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 text-[13px] flex justify-between items-center">
                <span>Subjects</span>
                <span className="text-[11px] bg-white px-2 py-0.5 rounded-full border border-gray-200">{selectedAcademics.subjects.length} selected</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 custom-scrollbar">
                {masterAcademics.subjects.length === 0 ? (
                   <div className="text-[12px] text-gray-400 italic text-center py-4">No master subjects found</div>
                ) : masterAcademics.subjects.map(sub => (
                  <label key={sub._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-[#008744] focus:ring-[#008744]"
                      checked={selectedAcademics.subjects.includes(sub._id)}
                      onChange={() => handleAcademicSelect('subjects', sub._id)}
                    />
                    <div className="flex flex-col">
                       <span className="text-[13px] text-gray-700 font-medium">{sub.name}</span>
                       <span className="text-[11px] text-gray-400">{sub.code} | Sem {sub.semester} | {sub.courseName}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Designations */}
            <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col h-64 md:col-span-2 lg:col-span-2">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 text-[13px] flex justify-between items-center">
                <span>Designations</span>
                <span className="text-[11px] bg-white px-2 py-0.5 rounded-full border border-gray-200">{selectedAcademics.designations.length} selected</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 flex flex-row flex-wrap gap-2 custom-scrollbar items-start content-start">
                {masterAcademics.designations.length === 0 ? (
                   <div className="text-[12px] text-gray-400 italic text-center py-4 w-full">No master designations found</div>
                ) : masterAcademics.designations.map(des => (
                  <label key={des._id} className="flex items-center gap-2 p-2 px-3 rounded-full hover:bg-gray-50 cursor-pointer transition-colors border border-gray-200">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-[#008744] focus:ring-[#008744]"
                      checked={selectedAcademics.designations.includes(des._id)}
                      onChange={() => handleAcademicSelect('designations', des._id)}
                    />
                    <span className="text-[13px] text-gray-700">{des.name}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Combined Principal & Admin Information */}
        <div className="bg-white p-6 sm:p-8 rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
          <h2 className="text-[16px] font-bold text-gray-800 mb-6">Key Personnel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Principal Name</label>
                <input type="text" name="principalName" value={formData.principalName} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008744]/20 focus:border-[#008744] transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Principal Email</label>
                <input type="email" name="principalEmail" value={formData.principalEmail} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008744]/20 focus:border-[#008744] transition-all" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Principal Qualification</label>
                <input type="text" name="principalQualification" value={formData.principalQualification} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008744]/20 focus:border-[#008744] transition-all" />
              </div>

              <div className="md:col-span-2 mt-4 border-t border-gray-100 pt-4">
                <h3 className="text-[14px] font-bold text-gray-800 mb-4">College Admin Credentials</h3>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Admin Name <span className="text-red-500">*</span></label>
                <input type="text" name="adminName" required value={formData.adminName} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008744]/20 focus:border-[#008744] transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Admin Email <span className="text-red-500">*</span></label>
                <input type="email" name="adminEmail" required value={formData.adminEmail} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008744]/20 focus:border-[#008744] transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Admin Mobile</label>
                <input type="text" name="adminMobile" value={formData.adminMobile} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008744]/20 focus:border-[#008744] transition-all" />
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mt-2">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Username <span className="text-red-500">*</span></label>
                  <input type="text" name="username" required value={formData.username} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008744]/20 focus:border-[#008744] transition-all" />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">New Password</label>
                  <input type="text" name="password" value={formData.password} onChange={handleInputChange} placeholder="Leave blank to keep unchanged" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008744]/20 focus:border-[#008744] transition-all" />
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
          <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-2.5 text-[13px] font-bold text-white bg-[#008744] rounded-lg shadow-sm hover:bg-[#007338] transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
            <Save size={16} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </form>

    </div>
  );
}

export default EditCollege;
