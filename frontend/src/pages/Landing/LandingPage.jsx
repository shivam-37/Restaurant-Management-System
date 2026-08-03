import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Play,
  Star,
  Users,
  TrendingUp,
  Clock,
  Shield,
  Smartphone,
  ChevronRight,
  CheckCircle,
  BarChart3,
  UtensilsCrossed,
  Sparkles,
  Menu as MenuIcon,
  X,
  ChefHat,
  Monitor,
  Zap,
  CheckCircle2,
  HeartHandshake,
  Layers
} from 'lucide-react';
import { useState, useEffect, useContext } from 'react';
import RestaurantList from '../../components/RestaurantList';
import AuthContext from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { restaurants, refreshRestaurants } = useContext(AuthContext);

  useEffect(() => {
    refreshRestaurants();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen overflow-hidden font-sans" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Ambient Glowing Background Orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[650px] h-[650px] bg-rose-500/15 rounded-full blur-[120px] opacity-70 animate-pulse" />
        <div className="absolute bottom-[20%] right-[-10%] w-[550px] h-[550px] bg-rose-600/10 rounded-full blur-[140px] opacity-60" />
      </div>

      {/* Elegant Glassmorphism Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 backdrop-blur-xl border-b border-black/10 dark:border-white/10"
        style={{ background: 'var(--navbar-bg)' }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/25 group-hover:scale-105 transition-transform">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight">Dine Flow</span>
                <span className="text-[11px] font-semibold text-rose-500 tracking-wider">Restaurant Platform</span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-gray-600 dark:text-gray-300">
              <a href="#features" className="hover:text-rose-500 transition-colors">Features</a>
              <a href="#restaurants" className="hover:text-rose-500 transition-colors">Restaurants</a>
              <a href="#why-us" className="hover:text-rose-500 transition-colors">Why Choose Us</a>
            </div>

            {/* Actions & Theme Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Dark / Light Mode Toggle Button (Always Visible) */}
              <button 
                onClick={toggleTheme} 
                className="w-10 h-10 flex items-center justify-center theme-card-item border border-black/10 dark:border-white/10 rounded-xl hover:border-rose-500/40 transition-all cursor-pointer shrink-0"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-rose-400" /> : <Moon className="w-4 h-4 text-rose-600" />}
              </button>

              <Link 
                to="/login" 
                className="hidden md:block px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-rose-500 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/owner/login" 
                className="hidden md:block px-5 py-2.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
              >
                Partner Portal
              </Link>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="hidden md:block">
                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-500/25 hover:bg-rose-600 transition-all flex items-center gap-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

              {/* Mobile Menu Button */}
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden w-10 h-10 flex items-center justify-center theme-card-item rounded-xl border border-black/10 text-rose-500 shrink-0">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden border-t border-black/10 dark:border-white/10 overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
              <div className="px-6 py-6 space-y-4">
                <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-semibold py-2">Features</a>
                <a href="#why-us" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-semibold py-2">Why Choose Us</a>
                <a href="#restaurants" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-semibold py-2">Restaurants</a>
                
                {/* Theme Toggle Button in Mobile Menu Drawer */}
                <button 
                  onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 theme-card-item rounded-xl text-sm font-semibold border border-black/10 dark:border-white/10 my-2"
                >
                  <span>Switch Theme</span>
                  <span className="flex items-center gap-2 text-rose-500 font-bold">
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-rose-400" /> : <Moon className="w-4 h-4 text-rose-600" />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </button>

                <div className="pt-4 border-t border-black/10 dark:border-white/10 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/login" className="flex items-center justify-center px-4 py-3 theme-card-item rounded-xl text-sm font-bold border border-black/10">Login</Link>
                    <Link to="/register" className="flex items-center justify-center px-4 py-3 bg-rose-500 text-white rounded-xl text-sm font-bold shadow-md shadow-rose-500/20">Get Started</Link>
                  </div>
                  <Link to="/owner/login" className="flex items-center justify-center px-4 py-3 theme-card-item rounded-xl text-sm font-bold border border-indigo-500/30 text-indigo-600 dark:text-indigo-400">Partner Login</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold text-rose-500">Smart Restaurant Management</span>
              </div>

              {/* Title in Simple English */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
                Effortless Operations for <span className="text-rose-500">Modern Restaurants</span>
              </h1>

              {/* Description in Simple English */}
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8 max-w-xl">
                Take control of your orders, menu items, table reservations, and daily revenue with an intuitive platform designed for simplicity and speed.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mb-12">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/register"
                    className="px-8 py-4 bg-rose-500 text-white rounded-2xl text-base font-bold shadow-xl shadow-rose-500/30 hover:bg-rose-600 transition-all flex items-center gap-3"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/login"
                    className="px-8 py-4 theme-card-item border border-black/10 dark:border-white/10 rounded-2xl text-base font-semibold hover:border-rose-500/40 transition-all flex items-center gap-3"
                  >
                    <span>User Login</span>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/owner/login"
                    className="px-8 py-4 theme-card-item border border-indigo-500/30 rounded-2xl text-base font-semibold text-indigo-600 dark:text-indigo-400 hover:border-indigo-500 transition-all flex items-center gap-3"
                  >
                    <span>Partner Login</span>
                  </Link>
                </motion.div>
              </div>

              {/* Key Stats */}
              <div className="pt-8 border-t border-black/10 dark:border-white/10 grid grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl font-extrabold text-rose-500">42%</p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">Faster Table Turnover</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-rose-500">2.5s</p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">Instant Order Speed</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-rose-500">99.9%</p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">System Uptime</p>
                </div>
              </div>
            </motion.div>

            {/* Right Hero Image Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-rose-500/20 rounded-3xl blur-2xl opacity-40 animate-pulse" />
              <div className="relative theme-card rounded-3xl p-3 border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden group">
                <img
                  src="https://vegecravings.com/wp-content/uploads/2018/06/Paneer-Tikka-Masala-Recipe-Step-By-Step-Instructions.jpg"
                  alt="Special Restaurant Dish"
                  className="w-full h-[480px] object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="p-5 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl text-white">
                    <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Live Dashboard</span>
                    <h3 className="text-xl font-bold mt-1">Smart Orders & Menu Control</h3>
                    <p className="text-xs text-gray-200 mt-1">Manage kitchen tickets and table requests instantly.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-2 block">Features</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Everything You Need to Run Your Restaurant
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Simple tools built to make day-to-day operations smooth, organized, and profitable.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Zap className="w-6 h-6" />, title: "Instant Order Taking", desc: "Send customer orders directly to the kitchen with sub-second response times." },
              { icon: <BarChart3 className="w-6 h-6" />, title: "Sales & Daily Analytics", desc: "View real-time daily revenue, top-selling dishes, and sales reports." },
              { icon: <Shield className="w-6 h-6" />, title: "Secure Account Access", desc: "Protect your customer data and billing records with robust security." },
              { icon: <Smartphone className="w-6 h-6" />, title: "Mobile & Tablet Ready", desc: "Access your dashboard from any smartphone, tablet, or desktop computer." },
              { icon: <UtensilsCrossed className="w-6 h-6" />, title: "Live Menu Updates", desc: "Change item prices, add new specials, or toggle out-of-stock items in seconds." },
              { icon: <CheckCircle2 className="w-6 h-6" />, title: "Reliable Performance", desc: "Dependable uptime ensuring your restaurant never misses a table order." }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                whileHover={{ y: -6 }}
                className="theme-card-item p-8 rounded-3xl border border-black/10 dark:border-white/10 hover:border-rose-500/40 transition-all shadow-md group"
              >
                <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-us" className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-2 block">Why Choose Us</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Built Specifically for Growth & Efficiency
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover why restaurant managers and owners choose Dine Flow for their daily operations.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: <Zap className="w-6 h-6 text-rose-500" />,
                title: "Super Simple & Fast Setup",
                desc: "Get your menu, table layout, and ordering system configured in under 10 minutes without complex hardware."
              },
              {
                icon: <Smartphone className="w-6 h-6 text-rose-500" />,
                title: "Works Seamlessly on Any Device",
                desc: "Manage live orders from phones, tablets, or computers—no expensive POS hardware required."
              },
              {
                icon: <TrendingUp className="w-6 h-6 text-rose-500" />,
                title: "Maximize Sales & Table Turnover",
                desc: "Speed up kitchen processing and table service to increase repeat visits and boost monthly revenue."
              },
              {
                icon: <Shield className="w-6 h-6 text-rose-500" />,
                title: "Reliable 24/7 Security & Uptime",
                desc: "Your data is continuously protected with encrypted cloud backups and 99.9% operational availability."
              }
            ].map((reason, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                whileHover={{ scale: 1.02 }}
                className="theme-card-item p-8 rounded-3xl border border-black/10 dark:border-white/10 hover:border-rose-500/40 transition-all shadow-md flex gap-6 items-start"
              >
                <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-rose-500/20">
                  {reason.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{reason.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{reason.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Restaurants Section */}
      <section id="restaurants" className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-2 block">Our Partners</span>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">Popular Restaurants Powered by Dine Flow</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Discover dining spots using our management platform.</p>
          </motion.div>
          <RestaurantList />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-black/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6 border border-rose-500/20">
            <ChefHat className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-rose-500 mb-6">Dine Flow</h3>
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300 mb-10">
            <a href="#features" className="hover:text-rose-500 transition">Features</a>
            <a href="#restaurants" className="hover:text-rose-500 transition">Restaurants</a>
            <Link to="/login" className="hover:text-rose-500 transition">User Login</Link>
            <Link to="/owner/login" className="hover:text-indigo-500 transition">Partner Portal</Link>
            <Link to="/register" className="hover:text-rose-500 transition">Register</Link>
            <Link to="/privacy" className="hover:text-rose-500 transition">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-rose-500 transition">Terms of Service</Link>
          </div>
          <div className="pt-8 border-t border-black/10 dark:border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 dark:text-gray-400 gap-4">
            <p>© 2026 Dine Flow. All rights reserved.</p>
            <p className="text-rose-500 font-medium">Smart Restaurant Management Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;