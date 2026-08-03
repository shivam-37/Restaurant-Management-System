import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, ChefHat, Eye, EyeOff, Shield, Smartphone, Sun, Moon } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import AuthContext from '../../context/AuthContext';
import VerifyOtpModal from '../../components/auth/VerifyOtpModal';
import { countries } from '../../utils/countries';
import { useTheme } from '../../context/ThemeContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        identifier: '',
        countryCode: '+91',
        password: '',
        confirmPassword: '',
        role: 'user',
    });

    const { name, identifier, countryCode, password, confirmPassword, role } = formData;

    const navigate = useNavigate();
    const { register, loginWithGoogle, verifyUserOtp } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
                // Register via Google passes the selected role
                await loginWithGoogle(tokenResponse.credential || tokenResponse.access_token, role);
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

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (!cleanIdentifier) {
            setError('Please provide an email address or phone number');
            setIsLoading(false);
            return;
        }

        const isEmail = cleanIdentifier.includes('@');
        if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanIdentifier)) {
            setError('Please enter a valid email address');
            setIsLoading(false);
            return;
        }

        const emailParam = isEmail ? cleanIdentifier : '';
        const phoneParam = isEmail ? '' : (cleanIdentifier.startsWith('+') ? cleanIdentifier : `${countryCode}${cleanIdentifier}`);

        try {
            const result = await register(name.trim(), emailParam, phoneParam, password.trim(), role);
            
            if (result && result.requiresOtp) {
                setOtpMethod(result.method);
                setShowOtpModal(true);
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Registration failed');
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
            
            await verifyUserOtp(payload);
            
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
                {/* Pure Black Background */}
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

                {/* Content Overlay - Adjusted for better vertical positioning */}
                <div className="absolute inset-0 flex flex-col justify-between p-12 text-white z-10 dark-overlay-text">
                    {/* Logo at top */}
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

                    {/* Welcome Text - Centered vertically */}
                    <div className="flex-1 flex items-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="max-w-lg"
                        >
                            <h1 className="text-7xl font-black mb-4 leading-none">
                                JOIN
                                <br />
                                <span className="text-rose-500">US</span>
                            </h1>
                            <p className="text-xl text-gray-400 leading-relaxed">
                                Create your account and start managing your restaurant with powerful tools and insights.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Right Side - Registration Form */}
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
                            Create Account
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-sm text-gray-500 dark:text-gray-400"
                        >
                            Start your restaurant journey today
                        </motion.p>
                    </div>

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

                    {/* Registration Form */}
                    <form onSubmit={onSubmit} className="space-y-5">
                        {/* Name Field */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                                <label 
                                    htmlFor="name" 
                                    className={`text-sm font-semibold mb-2 block transition-colors duration-300 ${
                                        focusedField === 'name' ? 'text-rose-500' : 'text-gray-900 dark:text-gray-100'
                                    }`}
                                >
                                    Full Name
                                </label>
                                <div className="relative group">
                                    <div className="relative">
                                        <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
                                            focusedField === 'name' ? 'text-rose-500' : 'opacity-20'
                                        }`} />
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required
                                            value={name}
                                            onChange={onChange}
                                            onFocus={() => setFocusedField('name')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full theme-card-item border border-black/5 rounded-2xl py-5 pl-12 pr-6 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-rose-500/30 transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                        </motion.div>

                        {/* Unified Email or Phone Field */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <label 
                                htmlFor="identifier" 
                                className={`text-sm font-semibold mb-2 block transition-colors duration-300 ${
                                    focusedField === 'identifier' ? 'text-rose-500' : 'text-gray-900 dark:text-gray-100'
                                }`}
                            >
                                Email Address or Phone Number
                            </label>
                            <div className="relative group">
                                <div className={`relative flex items-center theme-card-item border border-black/10 dark:border-white/10 rounded-2xl focus-within:border-rose-500 transition-all overflow-hidden`}>
                                    {!identifier.includes('@') ? (
                                        <div className="flex items-center pl-4 border-r border-black/10 dark:border-white/10 shrink-0">
                                            <Smartphone className={`w-4 h-4 mr-2 transition-colors duration-300 ${
                                                focusedField === 'identifier' ? 'text-rose-500' : 'text-gray-400'
                                            }`} />
                                            <select
                                                name="countryCode"
                                                value={countryCode}
                                                onChange={onChange}
                                                onFocus={() => setFocusedField('identifier')}
                                                onBlur={() => setFocusedField(null)}
                                                className="bg-transparent text-sm font-medium py-4 pr-2 focus:outline-none cursor-pointer"
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
                                                focusedField === 'identifier' ? 'text-rose-500' : 'text-gray-400'
                                            }`} />
                                        </div>
                                    )}
                                    <input
                                        id="identifier"
                                        name="identifier"
                                        type="text"
                                        autoComplete="email"
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
                            transition={{ delay: 0.6 }}
                        >
                                <label 
                                    htmlFor="password" 
                                    className={`text-sm font-semibold mb-2 block transition-colors duration-300 ${
                                        focusedField === 'password' ? 'text-rose-500' : 'text-gray-900 dark:text-gray-100'
                                    }`}
                                >
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="relative">
                                        <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
                                            focusedField === 'password' ? 'text-rose-500' : 'text-gray-400'
                                        }`} />
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            required
                                            value={password}
                                            onChange={onChange}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full theme-card-item border border-black/10 dark:border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm font-medium focus:outline-none focus:border-rose-500 transition-all"
                                            placeholder="Enter password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-20 hover:opacity-100 transition"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                        </motion.div>

                        {/* Confirm Password Field */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                                <label 
                                    htmlFor="confirmPassword" 
                                    className={`text-sm font-semibold mb-2 block transition-colors duration-300 ${
                                        focusedField === 'confirmPassword' ? 'text-rose-500' : 'text-gray-900 dark:text-gray-100'
                                    }`}
                                >
                                    Confirm Password
                                </label>
                                <div className="relative group">
                                    <div className="relative">
                                        <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
                                            focusedField === 'confirmPassword' ? 'text-rose-500' : 'text-gray-400'
                                        }`} />
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            required
                                            value={confirmPassword}
                                            onChange={onChange}
                                            onFocus={() => setFocusedField('confirmPassword')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full theme-card-item border border-black/10 dark:border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm font-medium focus:outline-none focus:border-rose-500 transition-all"
                                            placeholder="Confirm password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-20 hover:opacity-100 transition"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                        </motion.div>

                        {/* Password Strength Indicator */}
                        {password && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="space-y-2"
                            >
                                <div className="flex space-x-1 h-1">
                                    {[1, 2, 3, 4].map((level) => (
                                        <div
                                            key={level}
                                            className={`flex-1 rounded-full transition-all duration-300 ${
                                                password.length >= level * 3
                                                    ? password.length >= 12
                                                        ? 'bg-rose-500'
                                                        : password.length >= 8
                                                            ? 'bg-rose-400'
                                                            : 'bg-rose-300'
                                                    : 'bg-gray-300 dark:bg-gray-800'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500">
                                    Password strength: {
                                        password.length >= 12 ? 'Strong' :
                                            password.length >= 8 ? 'Medium' :
                                                password.length >= 4 ? 'Weak' : 'Too short'
                                    }
                                </p>
                            </motion.div>
                        )}

                        {/* Terms and Conditions */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className="flex items-start"
                        >
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                required
                                className="h-4 w-4 mt-1 rounded border-gray-700 bg-gray-900 text-rose-500 focus:ring-rose-500 focus:ring-offset-0"
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-400">
                                I agree to the{' '}
                                <Link to="/terms" className="text-rose-500 hover:text-rose-400 transition underline underline-offset-2">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link to="/privacy" className="text-rose-500 hover:text-rose-400 transition underline underline-offset-2">
                                    Privacy Policy
                                </Link>
                            </label>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0 }}
                        >
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-rose-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-rose-500/25 hover:bg-rose-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                >
                                    {isLoading ? 'Creating Account...' : (
                                        <>Create Account <ArrowRight className="w-4 h-4" /></>
                                    )}
                                </button>
                        </motion.div>

                        {/* Sign In Link */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.1 }}
                            className="text-center pt-8"
                        >
                            <p className="text-sm text-gray-700 dark:text-gray-400">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="text-rose-500 font-bold hover:text-rose-600 ml-1"
                                >
                                    Sign In
                                </Link>
                            </p>
                        </motion.div>

                        {/* Google Auth */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.15 }}
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

export default Register;