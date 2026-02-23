import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import RestaurantList from '../../components/RestaurantList';
import { getRestaurants } from '../../services/api';

const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const { data } = await getRestaurants();
        setRestaurants(data);
      } catch (error) {
        console.error("Failed to fetch restaurants", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { staggerChildren: 0.15 }
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Modern Gradient Background - Dark Mode */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90 -z-10" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5 -z-10" />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 backdrop-blur-lg bg-black/80 border-b border-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                RestoManager
              </span>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition font-medium">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition font-medium">Pricing</a>
              <a href="#about" className="text-gray-300 hover:text-white transition font-medium">About</a>
              <a href="#contact" className="text-gray-300 hover:text-white transition font-medium">Contact</a>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login" className="px-5 py-2 text-gray-300 hover:text-white transition font-medium">
                Sign In
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl hover:shadow-indigo-600/20 transition-all duration-300 flex items-center space-x-2 group"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </Link>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition text-gray-300"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black border-t border-gray-800"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition">Features</a>
              <a href="#pricing" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition">Pricing</a>
              <a href="#about" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition">About</a>
              <a href="#contact" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition">Contact</a>
              <div className="pt-4 space-y-3">
                <Link to="/login" className="block px-4 py-2 text-center text-gray-300 hover:bg-gray-800 rounded-lg transition">
                  Sign In
                </Link>
                <Link to="/register" className="block px-4 py-2 text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg">
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 md:pt-20 md:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-full px-4 py-2 border border-indigo-600/20"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-400">AI-Powered Restaurant Management</span>
              </motion.div>

              {/* Heading */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-gray-200">Manage your</span>
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  restaurant smarter
                </span>
                <br />
                <span className="text-gray-200">with AI</span>
              </h1>

              <p className="text-xl text-gray-400 max-w-xl leading-relaxed">
                Streamline operations, boost profits, and create amazing dining experiences with our intelligent restaurant management platform.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register"
                    className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold text-lg shadow-2xl shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-300 inline-flex items-center space-x-2"
                  >
                    <span>Start Free Trial</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/demo"
                    className="px-8 py-4 bg-gray-900 text-gray-300 rounded-2xl font-semibold text-lg border border-gray-800 hover:border-indigo-600/50 hover:bg-gray-800 transition-all duration-300 inline-flex items-center space-x-2 group"
                  >
                    <Play className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition" />
                    <span>Watch Demo</span>
                  </Link>
                </motion.div>
              </div>

              {/* Social Proof */}
              <div className="pt-8 flex items-center space-x-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-gray-800 bg-gradient-to-br from-indigo-600 to-purple-600" />
                  ))}
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-400">Join {restaurants.length > 0 ? `${restaurants.length}` : 'many'} happy restaurant owners</p>
                </div>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[40px] blur-3xl opacity-20 animate-pulse" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                  alt="Restaurant Interior"
                  className="w-full h-[500px] object-cover opacity-90"
                />
                {/* Floating Stats Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute bottom-8 left-8 bg-gray-900/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-gray-800"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Revenue increase</p>
                      <p className="text-2xl font-bold text-white">+42%</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Restaurant Selection Section */}
      {restaurants.length > 0 && (
        <section id="restaurants" className="py-20 bg-black relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              {...fadeInUp}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <span className="text-indigo-400 font-semibold text-sm uppercase tracking-wider">Explore</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
                Browse <span className="text-indigo-400">Our Restaurants</span>
              </h2>
              <p className="text-xl text-gray-400">
                Pick your favorite spot and start ordering right away
              </p>
            </motion.div>
            <RestaurantList restaurants={restaurants} loading={isLoading} />
          </div>
        </section>
      )}

      {/* Features Section */}
      <section id="features" className="relative py-20 md:py-32 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeInUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-indigo-400 font-semibold text-sm uppercase tracking-wider">Features</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
              Everything you need to run a <span className="text-indigo-400">successful restaurant</span>
            </h2>
            <p className="text-xl text-gray-400">
              Powerful tools that work together to streamline your operations and grow your business
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <Smartphone className="w-6 h-6" />,
                title: "Smart Order Management",
                desc: "Process orders 3x faster with AI-powered kitchen display and real-time updates.",
                color: "from-blue-500 to-cyan-500",
                stats: "2.5s avg. processing"
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Advanced Analytics",
                desc: "Real-time insights into sales, inventory, and staff performance with predictive trends.",
                color: "from-purple-500 to-pink-500",
                stats: "99.9% accuracy"
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Customer CRM",
                desc: "Build lasting relationships with automated marketing and loyalty programs.",
                color: "from-green-500 to-emerald-500",
                stats: "40% retention increase"
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Staff Management",
                desc: "Optimize schedules and track performance with intelligent shift planning.",
                color: "from-orange-500 to-red-500",
                stats: "20% cost reduction"
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Secure Payments",
                desc: "PCI-compliant payment processing with support for all major payment methods.",
                color: "from-indigo-500 to-purple-500",
                stats: "Bank-level security"
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: "Inventory Tracking",
                desc: "Automated inventory management with waste reduction and supplier integration.",
                color: "from-yellow-500 to-orange-500",
                stats: "15% waste reduction"
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-800"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300`} />
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} p-3 mb-6 shadow-lg`}>
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 mb-4">{feature.desc}</p>
                <div className="flex items-center text-sm font-medium text-indigo-400">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>{feature.stats}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-900 to-black">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: "98%", label: "Customer Satisfaction", icon: "😊" },
              { value: "5k+", label: "Orders Daily", icon: "📦" },
              { value: restaurants.length > 0 ? `${restaurants.length}` : '0', label: "Active Restaurants", icon: "🏪" },
              { value: "24/7", label: "Customer Support", icon: "🎯" }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="text-center text-white"
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm md:text-base text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-900 to-black rounded-[50px] p-12 md:p-20 shadow-2xl relative overflow-hidden border border-gray-800"
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
            <div className="absolute top-0 -left-20 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 -right-20 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to transform your restaurant?
              </h2>
              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                Join thousands of successful restaurants already using RestoManager to grow their business.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register"
                    className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 inline-flex items-center space-x-2"
                  >
                    <span>Start Free Trial</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/contact"
                    className="px-8 py-4 bg-transparent text-white rounded-2xl font-semibold text-lg border-2 border-gray-800 hover:border-indigo-600/50 hover:bg-gray-900 transition-all duration-300"
                  >
                    Contact Sales
                  </Link>
                </motion.div>
              </div>
              <p className="text-gray-500 mt-6 text-sm">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <UtensilsCrossed className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  RestoManager
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Revolutionizing restaurant management with AI-powered solutions.
              </p>
            </div>

            {[
              { title: "Product", links: ["Features", "Pricing", "Demo", "Integrations"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
              { title: "Support", links: ["Help Center", "Contact", "Privacy", "Terms"] }
            ].map((column, idx) => (
              <div key={idx}>
                <h4 className="font-semibold text-white mb-4">{column.title}</h4>
                <ul className="space-y-2">
                  {column.links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="text-gray-400 hover:text-indigo-400 text-sm transition">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2026 RestoManager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;