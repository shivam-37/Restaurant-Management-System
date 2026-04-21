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
  Menu,
  X,
  ChefHat,
  Monitor,
  Zap
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
  const isLoading = restaurants.length === 0;

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
    <div className="min-h-screen overflow-hidden" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 -left-40 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-40 right-0 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      {/* Modern Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 backdrop-blur-xl border-b border-black/5"
        style={{ background: 'var(--navbar-bg)' }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 md:h-24">
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/20">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black uppercase tracking-tighter leading-none">Restaurant</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mt-1">Manager</span>
              </div>
            </motion.div>

            <div className="hidden lg:flex items-center gap-10">
              {['Features', 'Restaurants', 'Enterprise', 'Support'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity">
                  {item}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={toggleTheme} 
                className="w-10 h-10 flex items-center justify-center theme-card-item border border-black/5 rounded-xl hover:border-amber-500/30 transition-all"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-600" />}
              </button>
              <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 px-4 transition-opacity">
                Matrix Portal
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="px-8 py-3.5 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-500/30 hover:bg-amber-600 transition-all flex items-center gap-2"
                >
                  Initiate Trial
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            </div>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden w-10 h-10 flex items-center justify-center theme-card-item rounded-xl border border-black/5 text-amber-500">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden border-t border-black/5 overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
              <div className="px-6 py-8 space-y-4">
                {['Features', 'Restaurants', 'Enterprise', 'Support'].map(item => (
                  <a key={item} href={`#${item.toLowerCase()}`} className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-40 py-2">
                    {item}
                  </a>
                ))}
                <div className="pt-6 grid grid-cols-2 gap-4">
                  <Link to="/login" className="flex items-center justify-center px-6 py-4 theme-card-item rounded-2xl text-[10px] font-black uppercase tracking-widest border border-black/5">Portal</Link>
                  <Link to="/register" className="flex items-center justify-center px-6 py-4 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">Sign Up</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* High-Contrast Hero Section */}
      <section className="relative pt-16 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-500/10 border border-amber-500/10 rounded-full mb-8">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-600">Smart Management System</span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
                The New <br />
                <span className="text-amber-500">Restaurant</span> <br />
                <span className="opacity-40">System.</span>
              </h1>

              <p className="text-xl font-medium opacity-40 leading-relaxed max-w-lg mb-12 uppercase tracking-widest text-[11px]">
                Effortlessly manage your restaurant operations. Automate orders, track sales, and optimize your business with precision.
              </p>

              <div className="flex flex-wrap gap-6">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register"
                    className="px-10 py-5 bg-amber-500 text-white rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-amber-500/40 hover:bg-amber-600 transition-all flex items-center gap-4"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/demo"
                    className="px-10 py-5 theme-card-item border border-black/5 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.3em] hover:border-amber-500/30 transition-all flex items-center gap-4"
                  >
                    <Play className="w-4 h-4 text-amber-500 fill-amber-500" />
                    View Demo
                  </Link>
                </motion.div>
              </div>

              {/* Verified Grid */}
              <div className="mt-16 pt-8 border-t border-black/5 grid grid-cols-3 gap-6">
                {[
                  { value: '42%', label: 'Profit Delta' },
                  { value: '2.5s', label: 'Order Velocity' },
                  { value: '99.9%', label: 'Uptime Protocol' }
                ].map((item, idx) => (
                  <div key={idx}>
                    <p className="text-2xl font-black uppercase tracking-tighter">{item.value}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-10 bg-amber-500/20 rounded-full blur-[100px] opacity-20 animate-pulse" />
              <div className="relative theme-card rounded-[3rem] p-4 border border-black/5 shadow-2xl overflow-hidden group">
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                  alt="Restaurant Interoir"
                  className="w-full h-[600px] object-cover rounded-[2.5rem] group-hover:scale-105 transition-transform duration-[2s]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-12 left-12 right-12">
                  <div className="p-6 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2">Management System</p>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white">Interactive Dashboard</h3>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Manifest */}
      <section id="features" className="py-32 relative bg-black/[0.02]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-24">
            <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Key Features</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-8">
              Superior <span className="text-amber-500">Infrastructural</span> <br /> Capabilities.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Zap />, title: "Fast Processing", desc: "Proprietary order processing logic delivering sub-second execution." },
              { icon: <BarChart3 />, title: "Detailed Analytics", desc: "Deterministic sales mapping and trend forecasting with high accuracy." },
              { icon: <Shield />, title: "Secure System", desc: "Military-grade encryption protocols securing every transaction." },
              { icon: <Smartphone />, title: "Mobile Friendly", desc: "Full administrative control from any mobile device." },
              { icon: <UtensilsCrossed />, title: "Menu Management", desc: "Easily manage your dishes and categories in real-time." },
              { icon: <CheckCircle />, title: "Maximum Uptime", desc: "Robust architecture ensuring continuous operational availability." }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                whileHover={{ y: -10 }}
                className="theme-card p-10 rounded-[2.5rem] border border-black/5 hover:shadow-2xl hover:shadow-amber-500/5 hover:border-amber-500/20 transition-all duration-500 group"
              >
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-4">{feature.title}</h3>
                <p className="text-xs font-medium opacity-40 leading-relaxed uppercase tracking-widest">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Terminal Footer */}
      <footer className="py-24 border-t border-black/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            < ChefHat className="w-12 h-12 text-amber-500 mx-auto mb-8 animate-bounce" />
            <h3 className="text-2xl font-black uppercase tracking-widest mb-12 opacity-20">Restaurant Management System</h3>
            <div className="flex flex-wrap justify-center gap-10">
              {['Encryption', 'Compliance', 'Architecture', 'Status'].map(item => (
                <span key={item} className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{item}</span>
              ))}
            </div>
            <div className="mt-20 pt-10 border-t border-black/5 flex flex-col md:flex-row justify-between items-center opacity-30 gap-6">
              <p className="text-[9px] font-black uppercase tracking-[0.3em]">© 2026 Restaurant Management. All rights reserved.</p>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-600">Local System</p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;