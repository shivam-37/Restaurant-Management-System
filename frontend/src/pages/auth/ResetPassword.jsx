import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, ChefHat, CheckCircle2, Eye, EyeOff } from 'lucide-react';
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
            setMessage('Invalid or missing reset token. Please request a new link.');
        }
    }, [token]);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }

        setStatus('loading');
        try {
            await resetPassword(token, password);
            setStatus('success');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || err.message || 'Something went wrong');
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center py-12 px-4 shadow-inner" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            {/* Dynamic Pattern Background */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--text-primary) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            
            {/* Logo */}
            <div className="absolute top-8 right-8">
                <Link to="/" className="flex items-center space-x-2 group">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                        <ChefHat className="w-5 h-5 text-white" />
                    </div>
                </Link>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/10 mb-6 shadow-inner">
                        <Lock className="w-8 h-8 text-amber-600" />
                    </div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-3">Target <span className="text-amber-500">Reset</span></h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Account Sovereignty Recovery</p>
                </div>

                <div className="theme-card rounded-[2.5rem] p-10 border border-black/5 shadow-2xl relative overflow-hidden">
                    {status === 'success' ? (
                        <div className="text-center space-y-6">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                                <CheckCircle2 className="w-8 h-8 text-amber-600" />
                            </motion.div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight mb-2">Protocol Success</h3>
                                <p className="text-[11px] font-medium opacity-40 uppercase tracking-widest mt-2">Password sovereignty restored. Redirecting to Matrix Portal...</p>
                            </div>
                            <Link to="/login" className="w-full flex items-center justify-center gap-4 py-4 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">
                                <span>Portal Access</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={onSubmit}>
                            {status === 'error' && (
                                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4">
                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center">{message}</p>
                                </div>
                            )}

                            {token ? (
                                <>
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-1">New Signature</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20 group-focus-within:opacity-100 group-focus-within:text-amber-500 transition-all" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full theme-card-item border border-black/5 rounded-2xl py-5 pl-12 pr-12 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-amber-500/30 transition-all"
                                                    placeholder="Minimum 8 characters"
                                                />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 hover:opacity-100 transition">
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-1">Verify Signature</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20 group-focus-within:opacity-100 group-focus-within:text-amber-500 transition-all" />
                                                <input
                                                    type="password"
                                                    required
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full theme-card-item border border-black/5 rounded-2xl py-5 pl-12 pr-6 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-amber-500/30 transition-all"
                                                    placeholder="Confirm signature"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full py-5 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-amber-500/30 hover:bg-amber-600 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                                    >
                                        {status === 'loading' ? 'Updating Cluster...' : (
                                            <>Override Credentials <ArrowRight className="w-4 h-4" /></>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <Link to="/forgot-password" className="w-full block text-center py-5 theme-card-item border border-black/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-amber-500/30 transition-all">Request New Protocol</Link>
                            )}
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
