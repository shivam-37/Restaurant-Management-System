import { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ChefHat, Star, Users, Clock, Sparkles, Coffee, Smartphone, Sun, Moon } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import AuthContext from '../../context/AuthContext';
import VerifyOtpModal from '../../components/auth/VerifyOtpModal';
import { countries } from '../../utils/countries';
import { useTheme } from '../../context/ThemeContext';

const Login = () => {
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
    const [otpMethod, setOtpMethod] = useState(''); // 'email' or 'phone'
    const [isOtpLoading, setIsOtpLoading] = useState(false);

    // Google Login hook
    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setIsLoading(true);
                setError(null);
                const result = await loginWithGoogle(tokenResponse.credential || tokenResponse.access_token);
                if (result.role === 'owner') {
                    setError('Owners must use the Partner Portal to log in.');
                    localStorage.removeItem('token');
                    return;
                }
                navigate('/dashboard');
            } catch (err) {
                setError(err.response?.data?.message || 'Google Login failed');
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
                if (result.role === 'owner') {
                    setError('Owners must use the Partner Portal to log in.');
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
            if (result.role === 'owner') {
                setError('Owners must use the Partner Portal to log in.');
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

    // High-quality restaurant images for the grid
    const restaurantImages = [
        "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80", // Fine dining table
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80", // Restaurant interior
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80", // Restaurant ambiance
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80", // Chef plating
    ];

    return (
        <div className="min-h-screen flex font-sans" style={{ background: 'var(--bg-primary)' }}>
            {/* Left Side - Image Grid with Overlay */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:block lg:w-1/2 relative overflow-hidden"
            >
                {/* Pure Black Background with Grid Pattern */}
                <div className="absolute inset-0 bg-black"></div>
                
                {/* Image Grid with Opacity */}
                <div className="absolute inset-0 grid grid-cols-2 gap-0.5">
                    {restaurantImages.map((img, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 0.4, scale: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.8 }}
                            className="relative overflow-hidden"
                        >
                            <img 
                                src={img} 
                                alt="Restaurant ambiance"
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/80"></div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-12 text-white z-10 dark-overlay-text">
                    {/* Logo */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center space-x-3"
                    >
                        <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
                            <div className="w-14 h-14 bg-rose-500/10 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-rose-500/20 group-hover:bg-rose-500/20 transition-colors">
                                <ChefHat className="w-7 h-7 text-rose-500" />
                            </div>
                            <div>
                                <span className="text-2xl font-light tracking-wider text-white">DINE</span>
                                <span className="text-2xl font-bold text-rose-500 ml-2">FLOW</span>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Welcome Text */}
                    <div className="space-y-6 max-w-lg">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h1 className="text-7xl font-black mb-4 leading-none">
                                WELCOME
                                <br />
                                <span className="text-rose-500">BACK</span>
                            </h1>
                            <p className="text-xl text-gray-400 leading-relaxed">
                                Sign in to manage your restaurant operations, track performance, and deliver exceptional dining experiences.
                            </p>
                        </motion.div>

                        {/* Stats/Features */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="grid grid-cols-3 gap-4 pt-6"
                        >
                            {[
                                { icon: <Users className="w-5 h-5" />, value: "500+", label: "Restaurants" },
                                { icon: <Clock className="w-5 h-5" />, value: "24/7", label: "Support" },
                                { icon: <Star className="w-5 h-5" />, value: "4.9", label: "Rating" }
                            ].map((stat, idx) => (
                                <div key={idx} className="text-center">
                                    <div className="flex justify-center text-rose-500 mb-2">{stat.icon}</div>
                                    <div className="text-white font-bold">{stat.value}</div>
                                    <div className="text-xs text-gray-500">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Testimonial - REMOVED */}
                </div>
            </motion.div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative" style={{ background: 'var(--bg-primary)' }}>
                {/* Theme Toggle - top right */}
                <button
                    onClick={toggleTheme}
                    className="theme-toggle absolute top-6 right-6 z-20"
                    title="Toggle theme"
                >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                {/* Subtle Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent"></div>
                
                {/* Animated Dots */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 right-20 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl"></div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md relative z-10"
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <Link to="/" className="flex items-center space-x-2 group cursor-pointer">
                            <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20 group-hover:bg-rose-500/20 transition-colors">
                                <ChefHat className="w-6 h-6 text-rose-500" />
                            </div>
                            <span className="text-2xl font-light text-gray-900 dark:text-white">DINE</span>
                            <span className="text-2xl font-bold text-rose-500 ml-1">FLOW</span>
                        </Link>
                    </div>

                    {/* Form Header */}
                    <div className="text-center mb-8">
                        <motion.h2 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl font-bold mb-2 text-rose-500"
                        >
                            Sign In
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Access your restaurant dashboard
                        </motion.p>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mb-6 relative group"
                        >
                            <div className="absolute inset-0 bg-rose-500/5 blur-xl opacity-50"></div>
                            <p className="text-sm text-rose-500 text-center relative z-10">{successMessage}</p>
                            <button 
                                onClick={() => setSuccessMessage(null)}
                                className="absolute top-2 right-2 text-rose-500/50 hover:text-rose-500 transition"
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
                            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6"
                        >
                            <p className="text-sm text-red-400 text-center">{error}</p>
                        </motion.div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* Unified Email or Phone Field */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <label 
                                htmlFor="identifier" 
                                className={`text-sm font-bold mb-2 block transition-colors duration-300 ${
                                    focusedField === 'identifier' ? 'text-rose-500' : 'text-gray-900 dark:text-gray-100'
                                }`}
                            >
                                Email Address or Phone Number
                            </label>
                            <div className="relative group">
                                <div className={`relative flex items-center theme-card-item border border-black/5 rounded-2xl focus-within:border-rose-500/30 transition-all overflow-hidden`}>
                                    {!identifier.includes('@') ? (
                                        <div className="flex items-center pl-4 border-r border-black/10 dark:border-white/10 shrink-0">
                                            <Smartphone className={`w-4 h-4 mr-2 transition-colors duration-300 ${
                                                focusedField === 'identifier' ? 'text-rose-500' : 'opacity-20'
                                            }`} />
                                            <select
                                                name="countryCode"
                                                value={countryCode}
                                                onChange={onChange}
                                                onFocus={() => setFocusedField('identifier')}
                                                onBlur={() => setFocusedField(null)}
                                                className="bg-transparent text-[11px] font-black py-5 pr-2 focus:outline-none cursor-pointer"
                                            >
                                                {countries.map((c) => (
                                                    <option key={`${c.iso}-${c.code}`} value={c.code} className="bg-white text-black dark:bg-black dark:text-white">
                                                        {c.iso} ({c.code})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                                            <Mail className={`w-4 h-4 transition-colors duration-300 ${
                                                focusedField === 'identifier' ? 'text-rose-500' : 'opacity-20'
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
                                        className={`w-full bg-transparent py-4 text-sm font-medium focus:outline-none transition-all ${
                                            identifier.includes('@') ? 'pl-12 pr-4' : 'pl-4 pr-4'
                                        }`}
                                        placeholder="your@email.com or 9876543210"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Password Field */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                                <label 
                                    htmlFor="password" 
                                    className={`text-sm font-bold mb-2 block transition-colors duration-300 ${
                                        focusedField === 'password' ? 'text-rose-500' : 'text-gray-900 dark:text-gray-100'
                                    }`}
                                >
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="relative">
                                        <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
                                            focusedField === 'password' ? 'text-rose-500' : 'opacity-20'
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
                                            className="w-full theme-card-item border border-black/10 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:outline-none focus:border-rose-500 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                        </motion.div>

                        {/* Forgot Password */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex justify-end"
                        >
                            <Link
                                to="/forgot-password"
                                className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-all"
                            >
                                Forgot password?
                            </Link>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-rose-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-rose-500/25 hover:bg-rose-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                >
                                    {isLoading ? 'Signing In...' : 'Sign In'}
                                </button>
                        </motion.div>

                        {/* Terms Agreement */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-xs text-center text-gray-500 mt-6"
                        >
                            By signing in, you agree to our{' '}
                            <Link to="/terms" className="text-rose-500 hover:text-rose-600 font-semibold">
                                Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link to="/privacy" className="text-rose-500 hover:text-rose-600 font-semibold">
                                Privacy Policy
                            </Link>
                        </motion.p>

                        {/* Sign Up Link */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-center pt-6"
                        >
                            <p className="text-sm text-gray-700 dark:text-gray-400">
                                Don't have an account?{' '}
                                <Link
                                    to="/register"
                                    className="text-rose-500 hover:text-rose-600 font-bold ml-1"
                                >
                                    Create Account
                                </Link>
                            </p>
                        </motion.div>
                        
                        {/* Google Auth */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.85 }}
                        >
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-black/10 dark:border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-3 theme-bg text-gray-700 dark:text-gray-300 font-semibold">Or continue with</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleGoogleLogin()}
                                disabled={isLoading}
                                className="w-full theme-card-item hover:opacity-80 border border-black/5 rounded-2xl py-4 flex items-center justify-center space-x-3 transition duration-300 disabled:opacity-50 text-[10px] font-black uppercase tracking-widest"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span style={{ color: 'var(--text-primary)' }}>Continue with Google</span>
                            </button>
                        </motion.div>
                    </form>

                    {/* Restaurant Features */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="flex justify-center space-x-6 mt-8"
                    >
                        {[
                            { icon: <Coffee className="w-4 h-4 text-rose-500" />, text: "Fine Dining" },
                            { icon: <Sparkles className="w-4 h-4 text-rose-500" />, text: "Premium" },
                            { icon: <Star className="w-4 h-4 text-rose-500" />, text: "5-Star" }
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                <span className="text-rose-500">{feature.icon}</span>
                                <span>{feature.text}</span>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>
            
            <VerifyOtpModal
                isOpen={showOtpModal}
                onClose={() => setShowOtpModal(false)}
                onVerify={handleVerifyOtp}
                email={identifier.includes('@') ? identifier.trim() : ''}
                phone={!identifier.includes('@') ? (identifier.trim().startsWith('+') ? identifier.trim() : `${countryCode}${identifier.trim()}`) : ''}
                method={otpMethod || (identifier.includes('@') ? 'email' : 'phone')}
                isLoading={isOtpLoading}
            />
        </div>
    );
};

export default Login;