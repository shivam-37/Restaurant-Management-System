import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, ArrowLeft, Shield, FileText, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const TermsOfService = () => {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen font-sans p-6 md:p-12 relative overflow-hidden" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            {/* Background Accent Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header Nav */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-black/10 dark:border-white/10">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>

                    <Link to="/" className="flex items-center space-x-2 group cursor-pointer">
                        <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20 group-hover:bg-rose-500/20 transition-colors">
                            <ChefHat className="w-5 h-5 text-rose-500" />
                        </div>
                        <span className="text-lg font-light tracking-wider" style={{ color: 'var(--text-primary)' }}>DINE</span>
                        <span className="text-lg font-bold text-rose-500 ml-1">FLOW</span>
                    </Link>

                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                    </button>
                </div>

                {/* Page Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-rose-500/10 rounded-2xl border border-rose-500/20 mb-4 text-rose-500">
                        <FileText className="w-7 h-7" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-3">Terms of Service</h1>
                    <p className="text-xs uppercase tracking-[0.3em] opacity-50">Last updated: July 2026</p>
                </motion.div>

                {/* Content Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="theme-card-item rounded-3xl p-8 md:p-12 border border-black/5 shadow-2xl space-y-8 text-sm leading-relaxed"
                >
                    <section className="space-y-3">
                        <h2 className="text-lg font-black uppercase tracking-wider text-rose-500 flex items-center gap-2">
                            1. Acceptance of Terms
                        </h2>
                        <p className="opacity-80">
                            By creating an account or accessing Dine Flow, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-black uppercase tracking-wider text-rose-500 flex items-center gap-2">
                            2. Account Registration & Security
                        </h2>
                        <p className="opacity-80">
                            You are responsible for maintaining the confidentiality of your account credentials (email, phone number, password, and OTP codes). You agree to notify us immediately of any unauthorized access to your account.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-black uppercase tracking-wider text-rose-500 flex items-center gap-2">
                            3. Use of Restaurant Services
                        </h2>
                        <p className="opacity-80">
                            Our system provides restaurant management, order placement, table reservation, and analytics tools. You agree not to misuse the platform, attempt unauthorized API calls, or upload malicious content.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-black uppercase tracking-wider text-rose-500 flex items-center gap-2">
                            4. Orders, Payments, & Cancellations
                        </h2>
                        <p className="opacity-80">
                            All orders and reservations placed through the system are subject to confirmation by the respective restaurant owner. Prices and menu availability are managed directly by restaurant staff.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-black uppercase tracking-wider text-rose-500 flex items-center gap-2">
                            5. Limitation of Liability
                        </h2>
                        <p className="opacity-80">
                            The platform is provided on an "as is" and "as available" basis. We are not liable for any indirect, incidental, or consequential damages resulting from service interruptions or data inaccuracies.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-black uppercase tracking-wider text-rose-500 flex items-center gap-2">
                            6. Modifications to Terms
                        </h2>
                        <p className="opacity-80">
                            We reserve the right to update these terms at any time. Continued use of the platform following any modifications constitutes your acceptance of the new terms.
                        </p>
                    </section>

                    {/* Back Action */}
                    <div className="pt-6 border-t border-black/10 dark:border-white/10 flex justify-between items-center">
                        <Link
                            to="/login"
                            className="px-6 py-3 bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition"
                        >
                            Return to Sign In
                        </Link>
                        <Link
                            to="/register"
                            className="px-6 py-3 border border-rose-500/30 text-rose-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-500/10 transition"
                        >
                            Create Account
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TermsOfService;
