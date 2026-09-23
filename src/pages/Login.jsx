import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const token = localStorage.getItem('superadmin_token');
    if (token) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/superadmin/login`, {
        email,
        password
      });

      // Save token and info to local storage
      localStorage.setItem('superadmin_token', response.data.token);
      localStorage.setItem('superadmin_info', JSON.stringify(response.data));

      toast.success('Login successful!');
      
      // Redirect to the page they tried to visit or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to login');
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0FDF4] via-white to-[#E8F5EE] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-emerald-900/10 w-full max-w-[420px] p-8">
        
        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-8 mt-2">
          <div className="mb-4 inline-flex items-center justify-center p-3 rounded-2xl bg-white shadow-md border border-emerald-500/20">
            <img 
              src="/DigiCampus Logo.png" 
              alt="DigiCampusPro Logo" 
              className="h-12 w-auto object-contain" 
            />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[24px] font-black text-[#111827] tracking-wide font-['Outfit']">DigiCampusPro</h1>
            <span className="text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-[#FFA000] to-[#FF6000] text-white px-2 py-0.5 rounded-full shadow-xs">SUPER ADMIN</span>
          </div>
          <p className="text-[11px] text-[#008744] font-bold tracking-widest uppercase">Master Administration Console</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[13px] font-medium text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[13px] font-semibold text-[#4a5568] mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#008744] focus:border-transparent outline-none transition-all text-sm placeholder-gray-400"
              placeholder="superadmin@gmail.com"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#4a5568] mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#008744] focus:border-transparent outline-none transition-all text-sm placeholder-gray-400"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-emerald-600/25 text-sm font-bold text-white bg-gradient-to-r from-[#008744] to-[#00A651] hover:from-[#007338] hover:to-[#008744] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008744] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </div>
        </form>

        {/* <div className="mt-10 mb-2 text-center">
          <p className="text-[11px] text-[#a0aec0]">
            © 2026 DigiCampusPro || All rights reserved.
          </p>
        </div> */}
      </div>
    </div>
  );
}

export default Login;
