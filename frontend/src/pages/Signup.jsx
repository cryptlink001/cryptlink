import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    phoneNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signup } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...signupData } = formData;
      await signup(signupData);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-black p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">CryptLink</h1>
          <p className="text-cyber-gray">Join the revolution</p>
        </div>

        {/* Signup Form */}
        <div className="glass-dark rounded-2xl border border-gray-800 p-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Create Account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-gray w-5 h-5" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="cyber-input w-full pl-10 pr-4 py-3 rounded-lg text-white placeholder-gray-400"
                  placeholder="Choose a username"
                  required
                  minLength="3"
                  maxLength="30"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-gray w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="cyber-input w-full pl-10 pr-4 py-3 rounded-lg text-white placeholder-gray-400"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Display Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="cyber-input w-full px-4 py-3 rounded-lg text-white placeholder-gray-400"
                placeholder="Your display name"
              />
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-gray w-5 h-5" />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="cyber-input w-full pl-10 pr-4 py-3 rounded-lg text-white placeholder-gray-400"
                  placeholder="+1234567890"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-gray w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="cyber-input w-full pl-10 pr-12 py-3 rounded-lg text-white placeholder-gray-400"
                  placeholder="Create a strong password"
                  required
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyber-gray hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-gray w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="cyber-input w-full pl-10 pr-12 py-3 rounded-lg text-white placeholder-gray-400"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyber-gray hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-cyber-purple focus:ring-cyber-purple mt-1"
                required
              />
              <label className="ml-2 text-sm text-gray-300">
                I agree to the{' '}
                <a href="#" className="text-cyber-purple hover:text-cyber-blue transition-colors">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-cyber-purple hover:text-cyber-blue transition-colors">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="cyber-button w-full py-3 px-4 rounded-lg bg-gradient-to-r from-cyber-purple to-cyber-blue text-white font-semibold hover:shadow-cyber-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-cyber-gray">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-cyber-purple hover:text-cyber-blue transition-colors font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Privacy Features */}
        <div className="mt-8 p-4 glass-dark rounded-lg border border-gray-800">
          <h3 className="text-white font-semibold mb-3">Privacy Features</h3>
          <ul className="space-y-2 text-sm text-cyber-gray">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-cyber-green rounded-full mr-2"></div>
              Username-only identity (no phone/email visible)
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-cyber-green rounded-full mr-2"></div>
              End-to-end encryption for messages
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-cyber-green rounded-full mr-2"></div>
              Hide online status and last seen
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-cyber-green rounded-full mr-2"></div>
              Incognito mode for browsing
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Signup;
