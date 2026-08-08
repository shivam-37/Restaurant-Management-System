import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useContext } from 'react';
import RestaurantList from '../../components/RestaurantList';
import AuthContext from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Menu as MenuIcon, X } from 'lucide-react';

const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { refreshRestaurants } = useContext(AuthContext);

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
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>
      
      {/* Navbar */}
      <nav className="w-full bg-[#0a0a0a] py-6 px-6 lg:px-12 flex items-center justify-between z-50 sticky top-0 border-b border-white/5">
        <Link to="/" className="text-2xl font-black tracking-tight text-[#f97316]">
          WorldPlate
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <a href="#" className="px-4 py-1.5 bg-[#f97316]/20 text-[#f97316] rounded-full">Home</a>
          <a href="#restaurants" className="hover:text-[#f97316] transition-colors">Menu</a>
          <a href="#about" className="hover:text-[#f97316] transition-colors">About Us</a>
          <a href="#specials" className="hover:text-[#f97316] transition-colors">Specials</a>
          <a href="#contact" className="hover:text-[#f97316] transition-colors">Contact</a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 text-white/50 hover:text-white transition-colors" title="Toggle Theme">
            {theme === 'dark' ? <Sun className="w-5 h-5 text-[#f97316]" /> : <Moon className="w-5 h-5 text-[#f97316]" />}
          </button>
          
          <Link to="/login" className="hidden md:block text-sm font-semibold hover:text-[#f97316] transition-colors">Sign In</Link>
          <span className="hidden md:block text-white/30">/</span>
          <Link to="/register" className="hidden md:block text-sm font-semibold hover:text-[#f97316] transition-colors">Register</Link>
          <Link to="/owner/login" className="hidden md:block text-xs px-3 py-1 border border-[#f97316]/30 text-[#f97316] rounded-full hover:bg-[#f97316] hover:text-white transition-all ml-2">Partner</Link>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-[#f97316]">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="md:hidden bg-[#111] overflow-hidden px-6">
             <div className="py-6 flex flex-col gap-4">
                <a href="#restaurants" className="text-white hover:text-[#f97316]">Menu</a>
                <a href="#about" className="text-white hover:text-[#f97316]">About Us</a>
                <Link to="/login" className="text-white hover:text-[#f97316]">Sign In</Link>
                <Link to="/register" className="text-[#f97316]">Register</Link>
                <Link to="/owner/login" className="text-[#f97316]">Partner Portal</Link>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-5xl lg:text-7xl font-bold leading-tight"
          >
            Experience the <br/>
            <span className="text-[#f97316] underline decoration-4 underline-offset-8">Taste</span> of the <br/>
            World
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-gray-400 max-w-md text-sm leading-relaxed"
          >
            From classic favorites to exotic delights, explore a diverse menu inspired by cuisines from across the globe.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <Link to="/register" className="inline-block px-8 py-3 bg-[#f97316] text-white font-bold rounded-full hover:bg-orange-600 transition-colors shadow-[0_10px_30px_rgba(249,115,22,0.3)]">
              Learn More
            </Link>
          </motion.div>
        </div>

        <div className="flex-1 relative">
          <motion.img 
            initial={{ opacity: 0, scale: 0.9, rotate: -10 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.8 }}
            src="https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=1000&auto=format&fit=crop" 
            alt="Ramen Bowl" 
            className="w-full max-w-[500px] mx-auto rounded-full object-cover shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-8 border-[#111]"
            style={{ aspectRatio: '1/1' }}
          />

          {/* Floating Card */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6, type: 'spring' }}
            className="absolute -bottom-10 -left-10 bg-white text-black p-4 pr-12 rounded-2xl flex items-center gap-6 shadow-2xl max-w-sm hidden sm:flex"
          >
            <div>
              <h4 className="font-bold text-lg leading-tight">Great food and lots<br/>of discounted prices</h4>
              <p className="text-xs text-gray-500 mt-2">People grabbed the offer</p>
            </div>
            <div className="text-center absolute -right-12 bg-gray-100 rounded-full w-24 h-24 flex flex-col justify-center border-4 border-white shadow-xl">
               <span className="font-black text-2xl">50%</span>
               <span className="text-[10px] font-bold">offer on Now</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Best Delivered Section & Restaurants */}
      <section id="restaurants" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold inline-block border-x-4 border-[#f97316] px-6 py-2">Our Best <span className="text-[#f97316]">Delivered</span></h2>
        </div>

        {/* Example featured item card styled like the image */}
        <div className="bg-[#111]/80 border border-white/5 rounded-[3rem] p-4 lg:p-8 flex flex-col md:flex-row items-center gap-8 mb-20 max-w-4xl mx-auto relative overflow-hidden">
           <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop" className="w-64 h-64 object-cover rounded-[3rem] shadow-2xl border-4 border-[#1a1a1a]" alt="Breakfast Specials" />
           <div className="flex-1 text-left">
             <h3 className="text-3xl font-bold mb-3">Breakfast Specials</h3>
             <p className="text-sm text-gray-400 mb-6 max-w-sm leading-relaxed">Explore our top-rated food categories, crafted to satisfy every craving. From delicious breakfasts to late night snacks.</p>
             <div className="flex items-center justify-between">
                <span className="text-4xl font-bold">$99/-</span>
                <Link to="/login" className="px-6 py-3 bg-[#f97316] text-white font-bold rounded-full hover:bg-orange-600 transition-colors">Order Now</Link>
             </div>
           </div>
        </div>

        {/* Existing Restaurants List (integrated to keep functionality) */}
        <div className="mt-12">
           <h3 className="text-xl font-bold mb-8 text-center text-white/60 uppercase tracking-widest">Explore Restaurants Near You</h3>
           <RestaurantList />
        </div>
      </section>

      {/* What They Say */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold inline-block border-x-4 border-[#f97316] px-6 py-2 mb-16">What They <span className="text-[#f97316]">Say?</span></h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
             <div key={i} className="bg-[#111]/80 border border-white/5 rounded-3xl p-8 text-left">
                <div className="flex items-center gap-4 mb-6">
                  <img src={`https://i.pravatar.cc/100?img=${i+12}`} className="w-12 h-12 rounded-full" alt="User" />
                  <div>
                    <h4 className="font-bold">John Smith</h4>
                    <div className="flex text-[#f97316] text-sm">★★★★★</div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">Absolutely loved the flavors! The food was fresh, and the delivery was super fast. Highly recommend!</p>
             </div>
          ))}
        </div>
      </section>

      {/* Meet Our Chefs */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto text-center mb-10">
         <h2 className="text-3xl font-bold inline-block border-x-4 border-[#f97316] px-6 py-2 mb-16">Meet Our <span className="text-[#f97316]">Chefs</span></h2>
         
         <div className="bg-[#111]/80 border border-white/5 rounded-[3rem] p-8 flex flex-col md:flex-row items-center gap-12 max-w-4xl mx-auto">
             <img src="https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop" className="w-64 h-64 object-cover rounded-3xl shadow-2xl" alt="Chef" />
             <div className="flex-1 text-left">
                <p className="text-sm text-gray-400 leading-relaxed mb-6">Our expert chefs bring passion, skill, and creativity to every dish, ensuring an unforgettable dining experience. With years of experience and a love for flavors, they craft each meal to perfection using only the finest ingredients.</p>
                <button className="px-8 py-2 border border-[#f97316] text-[#f97316] rounded-full hover:bg-[#f97316] hover:text-white transition-colors text-sm font-bold">View All</button>
             </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] border-t border-white/5 py-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
           <div className="col-span-1 md:col-span-2">
             <h3 className="text-xl font-black tracking-tight text-[#f97316] mb-4">WorldPlate</h3>
             <p className="text-xs text-gray-500 max-w-xs leading-relaxed">At WorldPlate, we're always excited to hear from you. Whether you have a project in mind or just want to chat, contact us!</p>
           </div>
           <div>
             <h4 className="font-bold mb-4 text-sm">Quick Links</h4>
             <div className="flex flex-col gap-2 text-xs text-gray-500">
               <a href="#" className="hover:text-[#f97316]">Home</a>
               <a href="#about" className="hover:text-[#f97316]">About Us</a>
               <a href="#restaurants" className="hover:text-[#f97316]">Menu</a>
             </div>
           </div>
           <div>
             <h4 className="font-bold mb-4 text-sm">Sign Up Newsletter</h4>
             <div className="flex gap-2">
               <input type="email" placeholder="Enter email" className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-xs w-full focus:outline-none focus:border-[#f97316]" />
               <button className="bg-[#f97316] text-white px-4 py-2 rounded-lg text-xs font-bold">Subscribe</button>
             </div>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;