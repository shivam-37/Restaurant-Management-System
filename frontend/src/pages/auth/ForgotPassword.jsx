import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ChefHat, KeyRound, CheckCircle2 } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const ForgotPassword = () => {
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const { forgotPassword } = useContext(AuthContext);
    const [status, setStatus] = useState(null); // 'success', 'error', 'loading'
    const [message, setMessage] = useState('');
    const [resetLink, setResetLink] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const data = await forgotPassword(email.trim());
            setStatus('success');
            setMessage(data.message);
            if (data.resetLink) setResetLink(data.resetLink);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || err.message || 'Something went wrong');
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center py-12 px-4 shadow-inner" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            {/* Dynamic Pattern Background */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--text-primary) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            
            {/* Back Link */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-8 left-8">
                <Link to="/login" className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity group">
                    <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition" />
                    <span>Portal Return</span>
                </Link>
            </motion.div>

            {/* Logo */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="absolute top-8 right-8">
                <Link to="/" className="flex items-center space-x-3 group">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                        <ChefHat className="w-5 h-5 text-white" />
                    </div>
                </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/10 mb-6 shadow-inner">
                        <KeyRound className="w-8 h-8 text-amber-600" />
                    </div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-3">Recover <span className="text-amber-500">Access</span></h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Security Protocol Alpha-9</p>
                </div>

                <div className="theme-card rounded-[2.5rem] p-10 border border-black/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl -z-10" />
                    
                    {status === 'success' ? (
                        <div className="text-center space-y-6">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                                <CheckCircle2 className="w-8 h-8 text-amber-600" />
                            </motion.div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight mb-2">Instructions Sent</h3>
                                <p className="text-[11px] font-medium opacity-40 uppercase tracking-widest">{message}</p>
                            </div>
                            {resetLink && (
                                <div className="p-4 theme-card-item rounded-2xl border border-black/5">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-2">Internal Simulation Link</p>
                                    <a href={resetLink} className="text-[10px] font-bold text-amber-600 truncate block underline underline-offset-4">{resetLink}</a>
                                </div>
                            )}
                            <button onClick={() => setStatus(null)} className="w-full py-4 px-6 theme-card-item rounded-xl text-[10px] font-black uppercase tracking-widest border border-black/5 hover:border-amber-500/30 transition-all">Retry Identification</button>
                        </div>
                    ) : (
                        <form className="space-y-8" onSubmit={onSubmit}>
                            {status === 'error' && (
                                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4">
                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center">{message}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-1">Terminal ID (Email)</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20 group-focus-within:opacity-100 group-focus-within:text-amber-500 transition-all" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full theme-card-item border border-black/5 rounded-2xl py-5 pl-12 pr-6 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-amber-500/30 transition-all"
                                        placeholder="user@dfi-nodes.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full py-5 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-amber-500/30 hover:bg-amber-600 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                            >
                                {status === 'loading' ? 'Encrypting Request...' : (
                                    <>Authorize Reset <ArrowRight className="w-4 h-4" /></>
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
