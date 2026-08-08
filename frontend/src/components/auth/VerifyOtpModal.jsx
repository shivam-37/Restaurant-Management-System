import { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, ArrowRight, ChefHat, Clock, RotateCcw, CheckCircle2 } from 'lucide-react';
import AuthContext from '../../context/AuthContext';

const VerifyOtpModal = ({ isOpen, onClose, onVerify, onResendOtp, email, phone, method, isLoading, colorTheme = 'rose' }) => {
    const isIndigo = colorTheme === 'indigo';
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
    const [isResending, setIsResending] = useState(false);

    const { sendOtp } = useContext(AuthContext);
    const inputRefs = useRef([]);

    // Reset state & start timer when modal opens
    useEffect(() => {
        if (isOpen) {
            setOtpDigits(['', '', '', '', '', '']);
            setError(null);
            setSuccessMessage(null);
            setTimeLeft(120); // Reset timer to 2 minutes
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 150);
        }
    }, [isOpen]);

    // Timer countdown effect
    useEffect(() => {
        if (!isOpen || timeLeft <= 0) return;

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
    }, [isOpen, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleDigitChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newDigits = [...otpDigits];
        if (value.length > 1) {
            const pastedDigits = value.slice(0, 6).split('');
            pastedDigits.forEach((digit, i) => {
                if (i < 6) newDigits[i] = digit;
            });
            setOtpDigits(newDigits);
            const focusIndex = Math.min(pastedDigits.length, 5);
            inputRefs.current[focusIndex]?.focus();
            return;
        }

        newDigits[index] = value;
        setOtpDigits(newDigits);
        setError(null);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResend = async () => {
        if (timeLeft > 0 || isResending) return;
        setIsResending(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if (onResendOtp) {
                await onResendOtp();
            } else if (sendOtp) {
                const payload = method === 'email' ? { email } : { phone };
                await sendOtp(payload);
            }
            setSuccessMessage('A new verification code has been sent!');
            setOtpDigits(['', '', '', '', '', '']);
            setTimeLeft(120);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to resend verification code');
        } finally {
            setIsResending(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const fullOtp = otpDigits.join('');
        if (fullOtp.length !== 6) {
            setError('Please enter all 6 digits of the verification code');
            return;
        }
        try {
            await onVerify(fullOtp);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Verification failed. Please try again.');
        }
    };

    const fullOtp = otpDigits.join('');

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
                    />

                    {/* Modal Centered Container */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="theme-card-item rounded-3xl p-8 max-w-md w-full shadow-2xl pointer-events-auto relative border border-rose-500/20"
                            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center border border-black/10 dark:border-white/10 text-gray-400 hover:text-rose-500 transition cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Modal Header */}
                            <div className="text-center mb-6">
                                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg ${isIndigo ? 'bg-[#f97316]/10 border-[#f97316]/20 shadow-orange-500/10' : 'bg-rose-500/10 border-rose-500/20 shadow-rose-500/10'} border`}>
                                    <ChefHat className={`w-8 h-8 ${isIndigo ? 'text-[#f97316]' : 'text-rose-500'}`} />
                                </div>
                                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Verify Your Account
                                </h2>
                                <p className="text-xs text-gray-700 dark:text-gray-400 max-w-xs mx-auto">
                                    We sent a 6-digit code to your {method === 'email' ? 'email' : 'phone'}:
                                    <br />
                                    <span className={`font-bold tracking-wider mt-1 inline-block ${isIndigo ? 'text-[#f97316]' : 'text-rose-500'}`}>
                                        {method === 'email' ? email : phone}
                                    </span>
                                </p>
                            </div>

                            {/* Error Alert */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-orange-500/10 border border-red-500/30 rounded-2xl p-3 mb-4"
                                >
                                    <p className="text-xs text-orange-500 font-medium text-center">{error}</p>
                                </motion.div>
                            )}

                            {/* OTP Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* 6 Digit Inputs Box Grid */}
                                <div className="flex justify-center items-center gap-1.5 sm:gap-2 my-4">
                                    {otpDigits.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleDigitChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            className={`w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 focus:outline-none transition-all shrink-0 focus:ring-2 ${isIndigo ? 'focus:border-[#f97316] focus:ring-indigo-600/20' : 'focus:border-rose-500 focus:ring-rose-500/20'}`}
                                        />
                                    ))}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading || fullOtp.length !== 6}
                                    className={`w-full py-4 text-white rounded-2xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${isIndigo ? 'bg-[#f97316] shadow-orange-500/25 hover:bg-indigo-700' : 'bg-rose-500 shadow-rose-500/25 hover:bg-rose-600'}`}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Verifying...</span>
                                        </div>
                                    ) : (
                                        <>Verify Code <ArrowRight className="w-4 h-4" /></>
                                    )}
                                </button>

                                {/* Resend Code & 2-Minute Timer Section */}
                                <div className="pt-1 flex flex-col items-center justify-center gap-2">
                                    {timeLeft > 0 ? (
                                        <div className={`flex items-center gap-2 text-xs text-gray-700 dark:text-gray-400 px-4 py-2 rounded-xl border ${isIndigo ? 'bg-[#f97316]/5 border-[#f97316]/10' : 'bg-rose-500/5 border-rose-500/10'}`}>
                                            <Clock className={`w-4 h-4 animate-pulse ${isIndigo ? 'text-[#f97316]' : 'text-rose-500'}`} />
                                            <span>Resend code in</span>
                                            <span className={`font-mono font-bold ${isIndigo ? 'text-[#f97316]' : 'text-rose-500'}`}>{formatTime(timeLeft)}</span>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResend}
                                            disabled={isResending}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 border ${isIndigo ? 'text-[#f97316] hover:text-indigo-700 bg-[#f97316]/10 hover:bg-[#f97316]/20 border-[#f97316]/20' : 'text-rose-500 hover:text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20'}`}
                                        >
                                            <RotateCcw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                                            <span>{isResending ? 'Sending Code...' : 'Send Code Again'}</span>
                                        </button>
                                    )}

                                    {successMessage && (
                                        <motion.p
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-xs text-emerald-500 font-semibold flex items-center gap-1 mt-1"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            {successMessage}
                                        </motion.p>
                                    )}
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default VerifyOtpModal;
