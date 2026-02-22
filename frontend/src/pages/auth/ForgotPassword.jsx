import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, UtensilsCrossed, KeyRound, CheckCircle2 } from 'lucide-react';
import AuthContext from '../../context/AuthContext';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const { forgotPassword } = useContext(AuthContext);
    const [status, setStatus] = useState(null); // 'success', 'error', 'loading'
    const [message, setMessage] = useState('');
    const [resetLink, setResetLink] = useState(''); // Only for simulation purposes

    const onSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const data = await forgotPassword(email.trim());
            setStatus('success');
            setMessage(data.message);
            if (data.resetLink) {
                setResetLink(data.resetLink);
            }
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || err.message || 'Something went wrong');
        }
    };

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    return (
        <div className="min-h-screen bg-black overflow-hidden relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden -z-10">
                <div className="absolute top-0 -left-40 w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 -right-40 w-[500px] h-[500px] bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-40 left-20 w-[500px] h-[500px] bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                <div
                    className="absolute inset-0 opacity-20 w-full h-full"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            {/* Back Link */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute top-8 left-8"
            >
                <Link
                    to="/login"
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition group"
                >
                    <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition" />
                    <span>Back to Login</span>
                </Link>
            </motion.div>

            {/* Logo */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute top-8 right-8"
            >
                <Link to="/" className="flex items-center space-x-2 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur-lg group-hover:blur-xl transition-all opacity-50"></div>
                        <div className="relative w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <UtensilsCrossed className="w-4 h-4 text-white" />
                        </div>
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        RestoManager
                    </span>
                </Link>
            </motion.div>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <motion.div
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    className="text-center mb-8"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 mb-4 shadow-lg shadow-indigo-600/20"
                    >
                        <KeyRound className="w-8 h-8 text-white" />
                    </motion.div>

                    <h2 className="text-3xl font-bold text-white mb-2">
                        Reset Password
                    </h2>
                    <p className="text-gray-400">
                        Enter your email to receive reset instructions
                    </p>
                </motion.div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-800"
                >
                    {status === 'success' ? (
                        <div className="text-center space-y-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto"
                            >
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </motion.div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-white">Instructions Sent</h3>
                                <p className="text-gray-400 text-sm">{message}</p>
                            </div>

                            {resetLink && (
                                <div className="mt-6 p-4 bg-indigo-600/10 border border-indigo-600/20 rounded-xl">
                                    <p className="text-xs text-indigo-400 mb-2 font-medium uppercase tracking-wider">Simulation Only: Reset Link</p>
                                    <a
                                        href={resetLink}
                                        className="text-sm text-white hover:text-indigo-300 break-all underline underline-offset-4"
                                    >
                                        {resetLink}
                                    </a>
                                </div>
                            )}

                            <button
                                onClick={() => setStatus(null)}
                                className="w-full bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition"
                            >
                                Try another email
                            </button>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={onSubmit}>
                            {status === 'error' && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                    <p className="text-sm text-red-400 text-center">{message}</p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-400 transition" />
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="relative w-full group overflow-hidden rounded-xl font-semibold text-lg"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="relative text-white flex items-center justify-center space-x-2 py-3">
                                    {status === 'loading' ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Send Reset Link</span>
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>
                    )}
                </motion.div>
            </motion.div>

            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};

export default ForgotPassword;
