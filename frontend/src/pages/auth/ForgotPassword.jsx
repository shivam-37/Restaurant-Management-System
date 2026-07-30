import { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Smartphone, Lock, Eye, EyeOff, ArrowRight, ChefHat, KeyRound, CheckCircle2, Clock, RotateCcw, AlertCircle, Key } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import { countries } from '../../utils/countries';
import { useTheme } from '../../context/ThemeContext';

const ForgotPassword = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { forgotPassword, resetPassword } = useContext(AuthContext);

    // Form Steps: 1 = Enter Identifier, 2 = Enter OTP & New Password, 3 = Success
    const [step, setStep] = useState(1);

    // Form Data
    const [formData, setFormData] = useState({
        identifier: '',
        countryCode: '+91',
        otpDigits: ['', '', '', '', '', ''],
        password: '',
        confirmPassword: ''
    });

    const { identifier, countryCode, otpDigits, password, confirmPassword } = formData;

    const [focusedField, setFocusedField] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [status, setStatus] = useState(null); // 'loading', 'error', 'success'
    const [message, setMessage] = useState('');
    const [targetContact, setTargetContact] = useState('');
    const [method, setMethod] = useState('email');

    // 2-Minute Resend Timer
    const [timeLeft, setTimeLeft] = useState(120);
    const [isResending, setIsResending] = useState(false);

    const otpInputRefs = useRef([]);

    // Timer countdown effect for Step 2
    useEffect(() => {
        if (step !== 2 || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [step, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const onChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newDigits = [...otpDigits];

        if (value.length > 1) {
            const pasted = value.slice(0, 6).split('');
            pasted.forEach((digit, i) => {
                if (i < 6) newDigits[i] = digit;
            });
            setFormData((prev) => ({ ...prev, otpDigits: newDigits }));
            const focusIndex = Math.min(pasted.length, 5);
            otpInputRefs.current[focusIndex]?.focus();
            return;
        }

        newDigits[index] = value;
        setFormData((prev) => ({ ...prev, otpDigits: newDigits }));

        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const getFinalIdentifier = () => {
        const cleanIdent = identifier.trim();
        if (cleanIdent.includes('@')) return cleanIdent;
        if (cleanIdent.startsWith('+')) return cleanIdent;
        return `${countryCode}${cleanIdent}`;
    };

    // Step 1: Submit Identifier to Request OTP
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        const cleanIdent = identifier.trim();
        if (!cleanIdent) {
            setStatus('error');
            setMessage('Please enter your email address or phone number.');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const finalIdent = getFinalIdentifier();
            const res = await forgotPassword({ identifier: finalIdent });
            
            setStatus(null);
            setMethod(res.method || (cleanIdent.includes('@') ? 'email' : 'phone'));
            setTargetContact(res.target || finalIdent);
            setStep(2);
            setTimeLeft(120);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || err.message || 'Failed to send OTP code.');
        }
    };

    // Resend OTP in Step 2
    const handleResendOtp = async () => {
        if (timeLeft > 0 || isResending) return;
        setIsResending(true);
        setStatus(null);
        setMessage('');

        try {
            const finalIdent = getFinalIdentifier();
            const res = await forgotPassword({ identifier: finalIdent });
            
            setTargetContact(res.target || finalIdent);
            setFormData((prev) => ({ ...prev, otpDigits: ['', '', '', '', '', ''] }));
            setTimeLeft(120);
            setMessage('A new verification code has been generated!');
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || err.message || 'Failed to resend OTP.');
        } finally {
            setIsResending(false);
        }
    };

    // Step 2: Submit OTP & New Password to Reset
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setStatus(null);
        setMessage('');

        const fullOtp = otpDigits.join('');
        if (fullOtp.length !== 6) {
            setStatus('error');
            setMessage('Please enter all 6 digits of the verification code.');
            return;
        }

        if (password.length < 6) {
            setStatus('error');
            setMessage('New password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match.');
            return;
        }

        setStatus('loading');

        try {
            const finalIdent = getFinalIdentifier();
            await resetPassword({
                identifier: finalIdent,
                otp: fullOtp,
                password: password.trim()
            });

            setStatus('success');
            setStep(3);
            setTimeout(() => {
                navigate('/login', { state: { message: 'Password reset successfully! Please log in with your new password.' } });
            }, 2500);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || err.message || 'Password reset failed.');
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center py-12 px-4" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            {/* Background Pattern */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--text-primary) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            
            {/* Top Navigation Bar */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-8 left-8">
                <Link to="/login" className="flex items-center space-x-2 text-sm font-semibold text-rose-500 hover:text-rose-600 transition group">
                    <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition" />
                    <span>Back to Login</span>
                </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="absolute top-8 right-8">
                <Link to="/" className="flex items-center space-x-3 group">
                    <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20 group-hover:scale-105 transition-transform">
                        <ChefHat className="w-5 h-5 text-rose-500" />
                    </div>
                </Link>
            </motion.div>

            {/* Main Card Container */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
                {/* Clear Title & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-4 shadow-lg shadow-rose-500/10">
                        <KeyRound className="w-8 h-8 text-rose-500" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-rose-500">Reset Your Password</h1>
                    <p className="text-sm text-gray-700 dark:text-gray-400 max-w-xs mx-auto">
                        {step === 1 ? 'Enter your email or phone number to receive a 6-digit OTP verification code.' : 'Enter the 6-digit code and choose your new password.'}
                    </p>
                </div>

                <div className="theme-card-item rounded-3xl p-8 border border-rose-500/20 shadow-2xl relative overflow-hidden" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl -z-10" />

                    {/* Step 3: Success View */}
                    {step === 3 && (
                        <div className="text-center space-y-6 py-6">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </motion.div>
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Password Reset Complete!</h3>
                                <p className="text-sm text-gray-700 dark:text-gray-400">Your password has been successfully updated. Redirecting to login...</p>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Identifier Form */}
                    {step === 1 && (
                        <form onSubmit={handleRequestOtp} className="space-y-6">
                            {status === 'error' && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                    <p className="text-sm text-red-500 font-medium">{message}</p>
                                </motion.div>
                            )}

                            <div>
                                <label htmlFor="identifier" className="text-sm font-bold mb-2 block text-gray-900 dark:text-gray-100">
                                    Email Address or Phone Number
                                </label>
                                <div className="relative group">
                                    <div className="relative flex items-center theme-card-item border border-black/10 dark:border-white/10 rounded-2xl focus-within:border-rose-500 transition-all overflow-hidden">
                                        {!identifier.includes('@') ? (
                                            <div className="flex items-center pl-4 border-r border-black/10 dark:border-white/10 shrink-0">
                                                <Smartphone className={`w-4 h-4 mr-2 transition-colors duration-300 ${focusedField === 'identifier' ? 'text-rose-500' : 'text-gray-400'}`} />
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
                                                <Mail className={`w-4 h-4 transition-colors duration-300 ${focusedField === 'identifier' ? 'text-rose-500' : 'text-gray-400'}`} />
                                            </div>
                                        )}
                                        <input
                                            id="identifier"
                                            name="identifier"
                                            type="text"
                                            required
                                            value={identifier}
                                            onChange={onChange}
                                            onFocus={() => setFocusedField('identifier')}
                                            onBlur={() => setFocusedField(null)}
                                            className={`w-full bg-transparent py-4 text-sm font-medium focus:outline-none transition-all ${identifier.includes('@') ? 'pl-12 pr-4' : 'pl-4 pr-4'}`}
                                            placeholder="your@email.com or 9876543210"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full py-4 bg-rose-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-rose-500/25 hover:bg-rose-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                                {status === 'loading' ? (
                                    <div className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Sending OTP...</span>
                                    </div>
                                ) : (
                                    <>Send Verification Code <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP Verification & Password Reset Form */}
                    {step === 2 && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            {/* Target Contact Display */}
                            <div className="bg-rose-500/5 p-4 rounded-2xl border border-rose-500/20 text-center">
                                <p className="text-xs text-gray-700 dark:text-gray-400">
                                    We sent a 6-digit verification code to your {method === 'email' ? 'email' : 'phone'}:
                                </p>
                                <p className="font-bold text-base text-rose-500 tracking-wide mt-1">
                                    {targetContact}
                                </p>
                            </div>

                            {/* Error Alert */}
                            {status === 'error' && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                    <p className="text-sm text-red-500 font-medium">{message}</p>
                                </motion.div>
                            )}

                            {/* 6-Digit OTP Input Grid */}
                            <div>
                                <label className="text-sm font-bold mb-3 block text-gray-900 dark:text-gray-100">
                                    Enter 6-Digit Verification Code
                                </label>
                                <div className="flex justify-center items-center gap-1.5 sm:gap-2">
                                    {otpDigits.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (otpInputRefs.current[index] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all shrink-0"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* 2-Minute Timer & Resend Button */}
                            <div className="flex flex-col items-center justify-center gap-2">
                                {timeLeft > 0 ? (
                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-400 bg-rose-500/5 px-4 py-2 rounded-xl border border-rose-500/10">
                                        <Clock className="w-4 h-4 text-rose-500 animate-pulse" />
                                        <span>Resend code in</span>
                                        <span className="font-mono font-bold text-rose-500">{formatTime(timeLeft)}</span>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={isResending}
                                        className="px-4 py-2 rounded-xl text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                        <RotateCcw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                                        <span>{isResending ? 'Sending...' : 'Send Code Again'}</span>
                                    </button>
                                )}
                            </div>

                            {/* New Password Field */}
                            <div>
                                <label htmlFor="password" className="text-sm font-bold mb-2 block text-gray-900 dark:text-gray-100">
                                    New Password
                                </label>
                                <div className="relative group">
                                    <div className="relative">
                                        <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === 'password' ? 'text-rose-500' : 'text-gray-400'}`} />
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={onChange}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full theme-card-item border border-black/10 dark:border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm font-medium focus:outline-none focus:border-rose-500 transition-all"
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-rose-500 transition cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label htmlFor="confirmPassword" className="text-sm font-bold mb-2 block text-gray-900 dark:text-gray-100">
                                    Confirm New Password
                                </label>
                                <div className="relative group">
                                    <div className="relative">
                                        <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === 'confirmPassword' ? 'text-rose-500' : 'text-gray-400'}`} />
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            value={confirmPassword}
                                            onChange={onChange}
                                            onFocus={() => setFocusedField('confirmPassword')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full theme-card-item border border-black/10 dark:border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm font-medium focus:outline-none focus:border-rose-500 transition-all"
                                            placeholder="Confirm new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-rose-500 transition cursor-pointer"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Reset Button */}
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full py-4 bg-rose-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-rose-500/25 hover:bg-rose-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                                {status === 'loading' ? (
                                    <div className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Resetting Password...</span>
                                    </div>
                                ) : (
                                    <>Reset Password <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
