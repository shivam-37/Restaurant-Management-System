import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, ChefHat, Eye, EyeOff, Shield, Smartphone } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import AuthContext from '../../context/AuthContext';
import VerifyOtpModal from '../../components/auth/VerifyOtpModal';
import { countries } from '../../utils/countries';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        countryCode: '+91',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'user',
    });

    const { name, email, countryCode, phone, password, confirmPassword, role } = formData;

    const navigate = useNavigate();
    const { register, loginWithGoogle, verifyUserOtp, sendOtp } = useContext(AuthContext);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    // OTP Modal State
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpMethod, setOtpMethod] = useState(''); // 'email' or 'phone'
    const [isOtpLoading, setIsOtpLoading] = useState(false);
    const [isOtpSending, setIsOtpSending] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

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

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
        } else if (!email && !phone) {
            setError('Please provide either an email or phone number');
            setIsLoading(false);
        } else if (email && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            setError('Please enter a valid email address');
            setIsLoading(false);
        } else {
            try {
                // Combine country code and phone
                const fullPhone = phone ? `${countryCode}${phone}` : '';
                await register(name.trim(), email.trim(), fullPhone.trim(), password.trim(), role);
                
                // Redirect to login with success message
                navigate('/login', { 
                    state: { 
                        message: 'Account created successfully! Please sign in to verify your account.' 
                    } 
                });
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Registration failed');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleVerifyOtp = async (otp) => {
        setIsOtpLoading(true);
        try {
            const payload = { otp };
            if (otpMethod === 'email') payload.email = email;
            else payload.phone = `${countryCode}${phone}`;
            
            await verifyUserOtp(payload);
            setShowOtpModal(false);
            navigate('/dashboard');
        } catch (err) {
            throw err;
        } finally {
            setIsOtpLoading(false);
        }
    };

    const handleSendOtp = async () => {
        if (!phone) {
            setError('Please enter a phone number first');
            return;
        }
        setIsOtpSending(true);
        setError(null);
        setOtpMethod('phone');
        try {
            const fullPhone = `${countryCode}${phone}`;
            await sendOtp({ phone: fullPhone });
            setOtpSent(true);
            setTimeout(() => setOtpSent(false), 30000); // Reset after 30s
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsOtpSending(false);
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
        <div className="min-h-screen bg-black flex font-sans">
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
                <div className="absolute inset-0 flex flex-col justify-between p-12 text-white z-10">
                    {/* Logo at top */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center space-x-3"
                    >
                        <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
                            <div className="w-14 h-14 bg-amber-500/10 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
                                <ChefHat className="w-7 h-7 text-amber-500" />
                            </div>
                            <div>
                                <span className="text-2xl font-light tracking-wider text-white">RESTO</span>
                                <span className="text-2xl font-bold text-amber-500 ml-2">MANAGER</span>
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
                                <span className="text-amber-500">US</span>
                            </h1>
                            <p className="text-xl text-gray-400 leading-relaxed">
                                Create your account and start managing your restaurant with powerful tools and insights.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Right Side - Registration Form with Pure Black Background */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-black relative">
                {/* Subtle Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent"></div>
                
                {/* Animated Dots */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 right-20 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>
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
                            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
                                <ChefHat className="w-6 h-6 text-amber-500" />
                            </div>
                            <span className="text-2xl font-light text-white">RESTO</span>
                            <span className="text-2xl font-bold text-amber-500">MANAGER</span>
                        </Link>
                    </div>

                    {/* Form Header */}
                    <div className="text-center mb-8">
                        <motion.h2 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl font-black text-white mb-2"
                        >
                            CREATE ACCOUNT
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-500"
                        >
                            Join Resto Manager today
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
                                className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                                    focusedField === 'name' ? 'text-amber-500' : 'text-gray-500'
                                }`}
                            >
                                Full Name
                            </label>
                            <div className="relative group">
                                <div className={`absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl blur-lg transition-opacity duration-300 ${
                                    focusedField === 'name' ? 'opacity-30' : 'opacity-0'
                                }`}></div>
                                <div className="relative">
                                    <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                                        focusedField === 'name' ? 'text-amber-500' : 'text-gray-600'
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
                                        className="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Email Field */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <label 
                                htmlFor="email" 
                                className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                                    focusedField === 'email' ? 'text-amber-500' : 'text-gray-500'
                                }`}
                            >
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className={`absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl blur-lg transition-opacity duration-300 ${
                                    focusedField === 'email' ? 'opacity-30' : 'opacity-0'
                                }`}></div>
                                <div className="relative">
                                    <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                                        focusedField === 'email' ? 'text-amber-500' : 'text-gray-600'
                                    }`} />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={email}
                                        onChange={onChange}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300"
                                        placeholder="manager@restaurant.com"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Phone Field - FIXED VERSION */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.45 }}
                        >
                            <label 
                                htmlFor="phone" 
                                className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                                    focusedField === 'phone' ? 'text-amber-500' : 'text-gray-500'
                                }`}
                            >
                                Phone Number
                            </label>
                            <div className="relative group">
                                <div className={`absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl blur-lg transition-opacity duration-300 ${
                                    focusedField === 'phone' ? 'opacity-30' : 'opacity-0'
                                }`}></div>
                                    <div className="relative flex items-center bg-gray-900/50 border border-gray-800 rounded-xl focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/50 transition-all duration-300">
                                        {/* Smartphone Icon */}
                                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                                            <Smartphone className={`w-5 h-5 transition-colors duration-300 ${
                                                focusedField === 'phone' ? 'text-amber-500' : 'text-gray-600'
                                            }`} />
                                        </div>
                                        <select
                                            name="countryCode"
                                            value={countryCode}
                                            onChange={onChange}
                                            onFocus={() => setFocusedField('phone')}
                                            onBlur={() => setFocusedField(null)}
                                            className="bg-transparent border-r border-gray-800 text-white pl-12 pr-2 py-4 focus:outline-none focus:ring-0 cursor-pointer min-w-[120px] max-w-[150px] text-sm"
                                        >
                                            {countries.map((c) => (
                                                <option key={`${c.iso}-${c.code}`} value={c.code} className="bg-gray-900">
                                                    {c.iso} ({c.code})
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={phone}
                                            onChange={onChange}
                                            onFocus={() => setFocusedField('phone')}
                                            onBlur={() => setFocusedField(null)}
                                            className="flex-1 bg-transparent py-4 pl-4 pr-24 text-white placeholder-gray-600 focus:outline-none transition-all duration-300"
                                            placeholder="1234567890"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSendOtp}
                                            disabled={isOtpSending || otpSent || !phone}
                                            className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                                                otpSent 
                                                    ? 'bg-green-500/20 text-green-500 border border-green-500/20' 
                                                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-white'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {isOtpSending ? '...' : otpSent ? 'SENT' : 'SEND OTP'}
                                        </button>
                                    </div>
                                </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Enter number without country code
                            </p>
                        </motion.div>

                        {/* Role Selection */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <label 
                                htmlFor="role" 
                                className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                                    focusedField === 'role' ? 'text-amber-500' : 'text-gray-500'
                                }`}
                            >
                                Register As
                            </label>
                            <div className="relative group">
                                <div className={`absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl blur-lg transition-opacity duration-300 ${
                                    focusedField === 'role' ? 'opacity-30' : 'opacity-0'
                                }`}></div>
                                <div className="relative">
                                    <Shield className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                                        focusedField === 'role' ? 'text-amber-500' : 'text-gray-600'
                                    }`} />
                                    <select
                                        id="role"
                                        name="role"
                                        value={role}
                                        onChange={onChange}
                                        onFocus={() => setFocusedField('role')}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-4 pl-12 pr-10 text-white appearance-none focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300 cursor-pointer"
                                    >
                                        <option value="user" className="bg-gray-900">User - Regular Account</option>
                                        <option value="owner" className="bg-gray-900">Owner - Restaurant Manager</option>
                                        <option value="admin" className="bg-gray-900">Admin - Monitoring Access</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
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
                                className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                                    focusedField === 'password' ? 'text-amber-500' : 'text-gray-500'
                                }`}
                            >
                                Password
                            </label>
                            <div className="relative group">
                                <div className={`absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl blur-lg transition-opacity duration-300 ${
                                    focusedField === 'password' ? 'opacity-30' : 'opacity-0'
                                }`}></div>
                                <div className="relative">
                                    <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                                        focusedField === 'password' ? 'text-amber-500' : 'text-gray-600'
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
                                        className="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-4 pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300"
                                        placeholder="Create a password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-amber-500 transition"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                                className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                                    focusedField === 'confirmPassword' ? 'text-amber-500' : 'text-gray-500'
                                }`}
                            >
                                Confirm Password
                            </label>
                            <div className="relative group">
                                <div className={`absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl blur-lg transition-opacity duration-300 ${
                                    focusedField === 'confirmPassword' ? 'opacity-30' : 'opacity-0'
                                }`}></div>
                                <div className="relative">
                                    <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                                        focusedField === 'confirmPassword' ? 'text-amber-500' : 'text-gray-600'
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
                                        className="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-4 pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300"
                                        placeholder="Confirm your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-amber-500 transition"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                                                        ? 'bg-amber-500'
                                                        : password.length >= 8
                                                            ? 'bg-amber-400'
                                                            : 'bg-amber-300'
                                                    : 'bg-gray-800'
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
                                className="h-4 w-4 mt-1 rounded border-gray-700 bg-gray-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-500">
                                I agree to the{' '}
                                <a href="#" className="text-amber-500 hover:text-amber-400 transition">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="#" className="text-amber-500 hover:text-amber-400 transition">
                                    Privacy Policy
                                </a>
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
                                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-4 px-4 rounded-xl transition duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-black relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                <span className="relative flex items-center justify-center">
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            CREATING ACCOUNT...
                                        </>
                                    ) : (
                                        <>
                                            CREATE ACCOUNT
                                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </motion.div>

                        {/* Sign In Link */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.1 }}
                            className="text-center pt-4 border-t border-gray-800"
                        >
                            <p className="text-gray-500">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="text-amber-500 hover:text-amber-400 font-semibold inline-flex items-center group"
                                >
                                    SIGN IN
                                    <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                                    <div className="w-full border-t border-gray-800"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-black text-gray-500">Or continue with</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleGoogleLogin()}
                                disabled={isLoading}
                                className="w-full bg-gray-900/50 hover:bg-gray-800 border border-gray-800 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition duration-300 disabled:opacity-50"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span>Google</span>
                            </button>
                        </motion.div>
                    </form>
                </motion.div>
            </div>
            
            <VerifyOtpModal
                isOpen={showOtpModal}
                onClose={() => setShowOtpModal(false)}
                onVerify={handleVerifyOtp}
                email={otpMethod === 'email' ? email : ''}
                phone={otpMethod === 'phone' ? phone : ''}
                method={otpMethod}
                isLoading={isOtpLoading}
            />
        </div>
    );
};

export default Register;