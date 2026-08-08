import { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ChefHat, Smartphone, Sun, Moon, Briefcase, Building } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import AuthContext from '../../context/AuthContext';
import VerifyOtpModal from '../../components/auth/VerifyOtpModal';
import { countries } from '../../utils/countries';
import { useTheme } from '../../context/ThemeContext';

const OwnerLogin = () => {
    const [formData, setFormData] = useState({
        identifier: '',
        countryCode: '+91',
        password: '',
    });

    const { identifier, countryCode, password } = formData;
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { login, loginWithGoogle, verifyUserOtp } = useContext(AuthContext);
    const [successMessage, setSuccessMessage] = useState(location.state?.message || null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    // OTP Modal State
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpMethod, setOtpMethod] = useState('');
    const [isOtpLoading, setIsOtpLoading] = useState(false);

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setIsLoading(true);
                setError(null);
                const result = await loginWithGoogle(tokenResponse.credential || tokenResponse.access_token, 'owner');
                if (result.role !== 'owner' && result.role !== 'admin') {
                    throw new Error('This portal is only for restaurant owners and admins.');
                }
                navigate('/dashboard');
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Google Login failed');
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => setError('Google Login Failed')
    });

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const cleanIdentifier = identifier.trim();

        if (!cleanIdentifier) {
            setError('Please enter your email address or phone number');
            setIsLoading(false);
            return;
        }

        const isEmail = cleanIdentifier.includes('@');
        const identifierToUse = isEmail 
            ? cleanIdentifier 
            : (cleanIdentifier.startsWith('+') ? cleanIdentifier : `${countryCode}${cleanIdentifier}`);

        try {
            const result = await login(identifierToUse, password.trim());
            if (result && result.requiresOtp) {
                setOtpMethod(result.method);
                setShowOtpModal(true);
            } else {
                if (result.role !== 'owner' && result.role !== 'admin') {
                    // Prevent user from logging in here
                    setError('This portal is strictly for restaurant partners. Please use the regular login.');
                    // In a real app we might want to log them out here since login() already set the token
                    localStorage.removeItem('token');
                    return;
                }
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Login Error:', err);
            setError(err.response?.data?.message || err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (otp) => {
        setIsOtpLoading(true);
        try {
            const cleanIdentifier = identifier.trim();
            const isEmail = cleanIdentifier.includes('@');
            const formattedPhone = cleanIdentifier.startsWith('+') ? cleanIdentifier : `${countryCode}${cleanIdentifier}`;

            const payload = { otp };
            if (otpMethod === 'email' || isEmail) payload.email = cleanIdentifier;
            else payload.phone = formattedPhone;
            
            const result = await verifyUserOtp(payload);
            
            if (result.role !== 'owner' && result.role !== 'admin') {
                setError('This portal is strictly for restaurant partners. Please use the regular login.');
                localStorage.removeItem('token');
                setShowOtpModal(false);
                return;
            }

            setShowOtpModal(false);
            navigate('/dashboard');
        } catch (err) {
            throw err;
        } finally {
            setIsOtpLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sans" style={{ background: 'var(--bg-primary)' }}>
            {/* Left Side - Login Form for Owners */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative shadow-2xl z-20 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
                {/* Theme Toggle - top left */}
                <button
                    onClick={toggleTheme}
                    className="theme-toggle absolute top-6 left-6 z-20 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    title="Toggle theme"
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5 text-gray-500" /> : <Moon className="w-5 h-5 text-gray-500" />}
                </button>
                
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md relative z-10"
                >
                    {/* Form Header */}
                    <div className="mb-10">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center space-x-3 mb-6"
                        >
                            <div className="w-12 h-12 bg-[#f97316] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                                <ChefHat className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <span className="text-2xl font-light tracking-wider text-gray-900 dark:text-white">DINE</span>
                                <span className="text-2xl font-bold text-[#f97316] ml-1">PARTNER</span>
                            </div>
                        </motion.div>
                        <motion.h2 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl font-extrabold mb-3 text-gray-900 dark:text-white"
                        >
                            Partner Portal
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-base text-gray-600 dark:text-gray-400"
                        >
                            Manage your business securely.
                        </motion.p>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6 relative"
                        >
                            <p className="text-sm text-green-600 dark:text-green-400 text-center">{successMessage}</p>
                            <button 
                                onClick={() => setSuccessMessage(null)}
                                className="absolute top-2 right-2 text-green-500/50 hover:text-green-500 transition"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </motion.div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6"
                        >
                            <p className="text-sm text-[#f97316] dark:text-red-400 text-center font-medium">{error}</p>
                        </motion.div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* Unified Email or Phone Field */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <label 
                                htmlFor="identifier" 
                                className={`text-sm font-semibold mb-2 block transition-colors duration-300 ${
                                    focusedField === 'identifier' ? 'text-[#f97316]' : 'text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                Work Email or Phone
                            </label>
                            <div className="relative group">
                                <div className={`relative flex items-center bg-gray-50 dark:bg-gray-800/50 border ${focusedField === 'identifier' ? 'border-[#f97316] shadow-[0_0_0_4px_rgba(79,70,229,0.1)]' : 'border-gray-200 dark:border-gray-700'} rounded-xl transition-all overflow-hidden`}>
                                    {!identifier.includes('@') ? (
                                        <div className="flex items-center pl-4 border-r border-gray-200 dark:border-gray-700 shrink-0">
                                            <Smartphone className={`w-5 h-5 mr-2 transition-colors duration-300 ${
                                                focusedField === 'identifier' ? 'text-[#f97316]' : 'text-gray-400'
                                            }`} />
                                            <select
                                                name="countryCode"
                                                value={countryCode}
                                                onChange={onChange}
                                                onFocus={() => setFocusedField('identifier')}
                                                onBlur={() => setFocusedField(null)}
                                                className="bg-transparent text-sm font-bold py-4 pr-2 focus:outline-none cursor-pointer text-gray-900 dark:text-white"
                                            >
                                                {countries.map((c) => (
                                                    <option key={`${c.iso}-${c.code}`} value={c.code} className="bg-white text-black dark:bg-gray-900 dark:text-white">
                                                        {c.iso} ({c.code})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                                            <Mail className={`w-5 h-5 transition-colors duration-300 ${
                                                focusedField === 'identifier' ? 'text-[#f97316]' : 'text-gray-400'
                                            }`} />
                                        </div>
                                    )}
                                    <input
                                        id="identifier"
                                        name="identifier"
                                        type="text"
                                        autoComplete="username"
                                        value={identifier}
                                        onChange={onChange}
                                        onFocus={() => setFocusedField('identifier')}
                                        onBlur={() => setFocusedField(null)}
                                        className={`w-full bg-transparent py-4 text-sm font-medium focus:outline-none transition-all text-gray-900 dark:text-white ${
                                            identifier.includes('@') ? 'pl-12 pr-4' : 'pl-4 pr-4'
                                        }`}
                                        placeholder="partner@restaurant.com"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Password Field */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <label 
                                htmlFor="password" 
                                className={`text-sm font-semibold mb-2 block transition-colors duration-300 ${
                                    focusedField === 'password' ? 'text-[#f97316]' : 'text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                Password
                            </label>
                            <div className="relative">
                                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                                    focusedField === 'password' ? 'text-[#f97316]' : 'text-gray-400'
                                }`} />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={onChange}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    className={`w-full bg-gray-50 dark:bg-gray-800/50 border ${focusedField === 'password' ? 'border-[#f97316] shadow-[0_0_0_4px_rgba(79,70,229,0.1)]' : 'border-gray-200 dark:border-gray-700'} rounded-xl py-4 pl-12 pr-6 text-sm font-medium focus:outline-none transition-all text-gray-900 dark:text-white`}
                                    placeholder="••••••••"
                                />
                            </div>
                        </motion.div>

                        {/* Forgot Password */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex justify-end"
                        >
                            <Link
                                to="/forgot-password"
                                className="text-sm font-semibold text-[#f97316] hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-all"
                            >
                                Forgot password?
                            </Link>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-[#f97316] text-white rounded-xl text-base font-bold shadow-lg shadow-orange-500/30 hover:bg-indigo-700 hover:shadow-orange-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                                {isLoading ? 'Authenticating...' : 'Access Dashboard'}
                            </button>
                        </motion.div>
                        
                        {/* Google Auth */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 font-medium">Or continue with</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleGoogleLogin()}
                                disabled={isLoading}
                                className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl py-4 flex items-center justify-center space-x-3 transition duration-300 disabled:opacity-50"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span className="text-gray-700 dark:text-gray-200 font-semibold">Google</span>
                            </button>
                        </motion.div>
                    </form>
                </motion.div>
            </div>

            {/* Right Side - Professional Dashboard Image */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:block lg:w-1/2 relative bg-gray-900 overflow-hidden"
            >
                <div className="absolute inset-0">
                    <img 
                        src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80" 
                        alt="Restaurant Management"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-indigo-900/40 mix-blend-multiply"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
                </div>

                {/* Overlay Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-16 text-white z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h3 className="text-4xl font-bold mb-4">Empower Your Business</h3>
                        <p className="text-lg text-gray-300 max-w-lg mb-8 leading-relaxed">
                            Access real-time analytics, manage your team, and streamline operations from our centralized partner portal.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                                    <Building className="w-5 h-5 text-indigo-400" />
                                </div>
                                <span className="font-medium">Multi-location</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                                    <ChefHat className="w-5 h-5 text-indigo-400" />
                                </div>
                                <span className="font-medium">Kitchen Display</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
            
            <VerifyOtpModal
                isOpen={showOtpModal}
                onClose={() => setShowOtpModal(false)}
                onVerify={handleVerifyOtp}
                email={identifier.includes('@') ? identifier.trim() : ''}
                phone={!identifier.includes('@') ? (identifier.trim().startsWith('+') ? identifier.trim() : `${countryCode}${identifier.trim()}`) : ''}
                method={otpMethod || (identifier.includes('@') ? 'email' : 'phone')}
                isLoading={isOtpLoading}
                colorTheme="indigo"
            />
        </div>
    );
};

export default OwnerLogin;
