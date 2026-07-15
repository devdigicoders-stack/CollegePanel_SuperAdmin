import React, { useState } from 'react';
import { Upload, Eye, EyeOff } from 'lucide-react';

function CreateCollege() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="max-w-6xl mx-auto">
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
                <input type="text" placeholder="Enter college name" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
              </div>
              
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">College Code<span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter college code" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">College Type<span className="text-red-500">*</span></label>
                <select className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all outline-none">
                  <option value="">Select type</option>
                  <option value="government">Government</option>
                  <option value="private">Private</option>
                  <option value="aided">Aided</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">AICTE Code</label>
                <input type="text" placeholder="Enter AICTE code" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Affiliation Number</label>
                <input type="text" placeholder="Enter affiliation number" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Established Year</label>
                <select className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all outline-none">
                  <option value="">Select year</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Contact Number</label>
                <input type="text" placeholder="Enter contact number" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Website</label>
                <input type="text" placeholder="Enter website" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
              </div>

            </div>

            <div className="lg:w-[320px] shrink-0">
               <div className="flex justify-between items-end mb-1.5">
                  <label className="block text-[13px] font-semibold text-gray-700">College Logo</label>
               </div>
               <div className="w-full h-[180px] border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center justify-center gap-3 transition-colors hover:border-[#5a4bda] hover:bg-[#5a4bda]/5 cursor-pointer">
                 <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center">
                    <Upload size={20} className="text-gray-400" />
                 </div>
                 <button className="px-4 py-1.5 bg-[#5a4bda]/10 text-[#5a4bda] text-[12px] font-bold rounded-md hover:bg-[#5a4bda]/20 transition-colors">
                   Upload Logo
                 </button>
                 <span className="text-[11px] text-gray-400 font-medium">JPG, PNG, GIF (Max. 2MB)</span>
               </div>
               
               <div className="mt-5">
                 <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Official Email</label>
                 <input type="email" placeholder="Enter email" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
               </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white p-6 sm:p-8 rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
          <h2 className="text-[16px] font-bold text-gray-800 mb-6">Address Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
             <div className="lg:col-span-1">
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Address</label>
                <input type="text" placeholder="Enter address" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
             </div>
             
             <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">City</label>
                <input type="text" placeholder="Enter city" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
             </div>

             <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">District</label>
                <input type="text" placeholder="Enter district" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
             </div>

             <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">State</label>
                <select className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all outline-none">
                  <option value="">Select state</option>
                  <option value="mh">Maharashtra</option>
                  <option value="dl">Delhi</option>
                  <option value="up">Uttar Pradesh</option>
                </select>
             </div>

             <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">PIN Code</label>
                <input type="text" placeholder="Enter pin code" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
             </div>
          </div>
        </div>

        {/* Combined Principal & Admin Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Principal Information */}
          <div className="bg-white p-6 sm:p-8 rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
            <h2 className="text-[16px] font-bold text-gray-800 mb-6">Principal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
               <div className="sm:col-span-2">
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Principal Name</label>
                  <input type="text" placeholder="Enter principal name" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
               </div>
               
               <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Email</label>
                  <input type="email" placeholder="Enter email" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
               </div>

               <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Qualification</label>
                  <input type="text" placeholder="Enter qualification" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
               </div>
            </div>
          </div>

          {/* Admin Information */}
          <div className="bg-white p-6 sm:p-8 rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
            <h2 className="text-[16px] font-bold text-gray-800 mb-6">Admin Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
               <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Admin Name</label>
                  <input type="text" placeholder="Enter admin name" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
               </div>
               
               <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Admin Email</label>
                  <input type="email" placeholder="Enter admin email" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
               </div>

               <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Admin Mobile</label>
                  <input type="text" placeholder="Enter mobile number" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
               </div>

               <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Username</label>
                  <input type="text" placeholder="Enter username" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" />
               </div>

               <div className="sm:col-span-2">
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
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
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 mt-8 pb-4">
          <button className="w-full sm:w-auto px-6 py-2.5 text-[13px] font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button className="w-full sm:w-auto px-8 py-2.5 text-[13px] font-bold text-white bg-[#5a4bda] rounded-lg shadow-md shadow-indigo-500/20 hover:bg-[#4d3ecc] transition-colors">
            Save
          </button>
          <button className="w-full sm:w-auto px-6 py-2.5 text-[13px] font-bold text-white bg-[#5a4bda] rounded-lg shadow-md shadow-indigo-500/20 hover:bg-[#4d3ecc] transition-colors">
            Save & Send Credentials
          </button>
        </div>

      </div>
    </div>
  );
}

export default CreateCollege;
