import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, ChefHat, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const ResetPassword = () => {
    const { theme } = useTheme();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState(null); // 'success', 'error', 'loading'
    const [message, setMessage] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const { resetPassword } = useContext(AuthContext);

    const query = new URLSearchParams(location.search);
    const token = query.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid or missing reset token. Please request a new reset link.');
        }
    }, [token]);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            setStatus('error');
            setMessage('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match.');
            return;
        }

        setStatus('loading');
        try {
            await resetPassword({ token, password });
            setStatus('success');
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || err.message || 'Failed to reset password. Please try again.');
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center py-12 px-4" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            {/* Background Pattern */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--text-primary) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            
            {/* Logo */}
            <div className="absolute top-8 right-8">
                <Link to="/" className="flex items-center space-x-2 group">
                    <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20 group-hover:scale-105 transition-transform">
                        <ChefHat className="w-5 h-5 text-rose-500" />
                    </div>
                </Link>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-4 shadow-lg shadow-rose-500/10">
                        <Lock className="w-8 h-8 text-rose-500" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-rose-500">Choose New Password</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Enter and confirm your new password below.</p>
                </div>

                <div className="theme-card-item rounded-3xl p-8 border border-rose-500/20 shadow-2xl relative overflow-hidden" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                    {status === 'success' ? (
                        <div className="text-center space-y-6 py-4">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </motion.div>
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Password Updated!</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Your password has been changed successfully. Redirecting to login...</p>
                            </div>
                            <Link to="/login" className="w-full flex items-center justify-center gap-2 py-4 bg-rose-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-rose-500/25 hover:bg-rose-600 transition-all">
                                <span>Go to Login</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={onSubmit}>
                            {status === 'error' && (
                                <div className="bg-orange-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
                                    <p className="text-sm text-orange-500 font-medium">{message}</p>
                                </div>
                            )}

                            {token ? (
                                <>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-semibold mb-2 block text-gray-700 dark:text-gray-200">New Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full theme-card-item border border-black/10 dark:border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm font-medium focus:outline-none focus:border-rose-500 transition-all"
                                                    placeholder="At least 6 characters"
                                                />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 transition cursor-pointer">
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-semibold mb-2 block text-gray-700 dark:text-gray-200">Confirm Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="password"
                                                    required
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full theme-card-item border border-black/10 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:outline-none focus:border-rose-500 transition-all"
                                                    placeholder="Confirm new password"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full py-4 bg-rose-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-rose-500/25 hover:bg-rose-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                    >
                                        {status === 'loading' ? 'Resetting Password...' : (
                                            <>Save New Password <ArrowRight className="w-4 h-4" /></>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <Link to="/forgot-password" className="w-full block text-center py-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl text-sm font-bold hover:bg-rose-500/20 transition-all">Request Password Reset</Link>
                            )}
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
