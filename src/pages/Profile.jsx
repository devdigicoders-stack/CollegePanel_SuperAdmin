import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Camera } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function Profile() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({ name: '', email: '', mobile: '', profileImage: '' });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/superadmin/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData({
        name: res.data.name,
        email: res.data.email,
        mobile: res.data.mobile,
        profileImage: res.data.profileImage
      });
      if (res.data.profileImage) {
        setImagePreview(`${import.meta.env.VITE_API_URL.replace('/api', '')}${res.data.profileImage}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load profile');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem('superadmin_token');
      
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('email', profileData.email);
      formData.append('mobile', profileData.mobile);
      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }

      const res = await axios.put(`${import.meta.env.VITE_API_URL}/superadmin/profile`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Profile updated successfully!');
      // Update local storage info
      localStorage.setItem('superadmin_info', JSON.stringify(res.data));
      // Update preview with new URL
      if (res.data.profileImage) {
        setImagePreview(`${import.meta.env.VITE_API_URL.replace('/api', '')}${res.data.profileImage}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    
    try {
      setIsChangingPassword(true);
      const token = localStorage.getItem('superadmin_token');
      await axios.put(`${import.meta.env.VITE_API_URL}/superadmin/change-password`, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full">
      {/* Header & Breadcrumb */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">My Profile</h1>
        <div className="flex items-center text-[12px] text-gray-500 font-medium">
          <Link to="/dashboard" className="hover:text-[#5a4bda] transition-colors">Dashboard</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-800 font-semibold">My Profile</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Sidebar Profile Card */}
        <div className="w-full lg:w-[300px] bg-[#1a2035] rounded-2xl shadow-lg overflow-hidden shrink-0 flex flex-col items-center py-10 relative">
          
          <div className="w-32 h-32 rounded-full bg-white p-1.5 mb-6 relative shadow-xl">
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-full" 
              />
            ) : (
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'Admin')}&background=5a4bda&color=fff&size=150`}
                alt="Profile Placeholder"
                className="w-full h-full object-cover rounded-full"
              />
            )}
            <button 
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-0 right-2 bg-[#5a4bda] text-white p-2 rounded-full border-2 border-white hover:bg-[#4d3ecc] transition-colors shadow-md cursor-pointer"
            >
              <Camera size={14} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <h2 className="text-xl font-bold text-white mb-1 tracking-wide">{profileData.name}</h2>
          <p className="text-[13px] text-gray-300 mb-2">{profileData.email}</p>
          <p className="text-[13px] text-gray-300 font-medium mb-6">{profileData.mobile}</p>
          
          <div className="mt-2 inline-flex items-center justify-center px-4 py-1.5 bg-white/10 text-white text-[12px] font-bold rounded-lg backdrop-blur-sm border border-white/10">
            Super Administrator
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Profile Information */}
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-6 sm:p-8">
            <h3 className="text-[16px] font-bold text-gray-800 mb-6">Profile Information</h3>
            
            <div className="flex flex-col md:flex-row gap-8">
              
              <div className="flex-1 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <label className="text-[13px] font-semibold text-gray-600 sm:w-24 shrink-0">Name</label>
                  <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <label className="text-[13px] font-semibold text-gray-600 sm:w-24 shrink-0">Email</label>
                  <input type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <label className="text-[13px] font-semibold text-gray-600 sm:w-24 shrink-0">Mobile</label>
                  <input type="text" value={profileData.mobile} onChange={(e) => setProfileData({...profileData, mobile: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
                </div>

                <div className="flex sm:pl-[120px] pt-2">
                  <button onClick={handleUpdateProfile} disabled={isUpdating} className="px-6 py-2.5 text-[13px] font-bold text-white bg-[#5a4bda] rounded-lg shadow-md shadow-indigo-500/20 hover:bg-[#4d3ecc] transition-colors disabled:opacity-70">
                    {isUpdating ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-6 sm:p-8">
            <h3 className="text-[16px] font-bold text-gray-800 mb-6">Change Password</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-[13px] font-semibold text-gray-700">Current Password</label>
                <div className="relative w-full md:w-1/2 md:pr-3">
                  <input 
                    type={showCurrentPassword ? "text" : "password"} 
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                    placeholder="Enter current password" 
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] pr-10 focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-gray-700">New Password</label>
                <div className="relative">
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    placeholder="Enter new password" 
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] pr-10 focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-gray-700">Confirm Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    placeholder="Confirm new password" 
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] pr-10 focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

            </div>

            <div className="mt-8 flex justify-center md:justify-start">
              <button onClick={handleChangePassword} disabled={isChangingPassword} className="px-8 py-2.5 text-[13px] font-bold text-white bg-[#5a4bda] rounded-lg shadow-md shadow-indigo-500/20 hover:bg-[#4d3ecc] transition-colors disabled:opacity-70">
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
            
          </div>
          
        </div>

      </div>
    </div>
  );
}

export default Profile;
