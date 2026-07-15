import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Camera } from 'lucide-react';

function Profile() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
            <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover rounded-full" />
            <button className="absolute bottom-0 right-2 bg-[#5a4bda] text-white p-2 rounded-full border-2 border-white hover:bg-[#4d3ecc] transition-colors shadow-md">
              <Camera size={14} />
            </button>
          </div>

          <h2 className="text-xl font-bold text-white mb-1 tracking-wide">Super Admin</h2>
          <p className="text-[13px] text-gray-300 mb-2">superadmin@gmail.com</p>
          <p className="text-[13px] text-gray-300 font-medium mb-6">9876543210</p>
          
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
                  <input type="text" defaultValue="Super Admin" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <label className="text-[13px] font-semibold text-gray-600 sm:w-24 shrink-0">Email</label>
                  <input type="email" defaultValue="superadmin@gmail.com" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <label className="text-[13px] font-semibold text-gray-600 sm:w-24 shrink-0">Mobile</label>
                  <input type="text" defaultValue="9876543210" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
                </div>

                <div className="flex sm:pl-[120px] pt-2">
                  <button className="px-6 py-2.5 text-[13px] font-bold text-white bg-[#5a4bda] rounded-lg shadow-md shadow-indigo-500/20 hover:bg-[#4d3ecc] transition-colors">
                    Update Profile
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
              <button className="px-8 py-2.5 text-[13px] font-bold text-white bg-[#5a4bda] rounded-lg shadow-md shadow-indigo-500/20 hover:bg-[#4d3ecc] transition-colors">
                Update Password
              </button>
            </div>
            
          </div>
          
        </div>

      </div>
    </div>
  );
}

export default Profile;
