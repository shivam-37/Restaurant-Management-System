import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBagIcon, StarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { getRestaurantDetails, getMenu } from '../../services/api';
import AuthContext from '../../context/AuthContext';

const RestaurantStorefront = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resData = await getRestaurantDetails(id);
                setRestaurant(resData.data);
                
                const menuData = await getMenu(id);
                setMenuItems(menuData.data);
            } catch (error) {
                console.error("Failed to fetch restaurant data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i._id === item._id);
            if (existing) {
                return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i._id === item._id);
            if (existing.quantity === 1) {
                return prev.filter(i => i._id !== item._id);
            }
            return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity - 1 } : i);
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#111] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-gray-800 border-t-red-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen bg-[#111] text-white flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold mb-4">Restaurant not found</h1>
                <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-red-600 rounded-full">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden selection:bg-red-500/30">
            {/* Navigation */}
            <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-10 py-6 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <span className="text-2xl font-serif font-bold text-white tracking-tight">{restaurant.name || 'Huff & Puff'}</span>
                </div>
                
                <div className="hidden md:flex items-center space-x-10">
                    <a href="#home" className="text-sm text-white/90 hover:text-white transition-colors">Home</a>
                    <a href="#menu" className="text-sm text-white/60 hover:text-white transition-colors">Menu</a>
                    <a href="#about" className="text-sm text-white/60 hover:text-white transition-colors">About Us</a>
                    <a href="#contact" className="text-sm text-white/60 hover:text-white transition-colors">Contact</a>
                </div>

                <div className="flex items-center space-x-6">
                    <button onClick={() => setIsCartOpen(true)} className="relative p-2 hover:bg-white/5 rounded-full transition-colors">
                        <ShoppingBagIcon className="w-6 h-6 text-white/80" />
                        {cart.length > 0 && (
                            <span className="absolute top-0 right-0 w-4 h-4 bg-red-600 rounded-full text-[10px] flex items-center justify-center font-bold">
                                {cart.reduce((acc, item) => acc + item.quantity, 0)}
                            </span>
                        )}
                    </button>
                    {user ? (
                        <button onClick={() => navigate('/dashboard')} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-sm font-medium rounded-full transition-colors">
                            Dashboard
                        </button>
                    ) : (
                        <button onClick={() => navigate('/login')} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-sm font-medium rounded-full transition-colors">
                            Sign Up
                        </button>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    {/* Background decorations based on image */}
                    <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px]"></div>
                </div>

                <div className="container mx-auto px-10 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-2xl"
                    >
                        <h1 className="text-6xl md:text-8xl font-serif font-normal leading-[1.1] mb-8">
                            <span className="font-sans font-light tracking-tight text-white/90">it's not just</span><br/>
                            Food, <span className="font-sans font-light tracking-tight text-white/90">It's an</span><br/>
                            Experience.
                        </h1>
                        
                        <div className="flex items-center space-x-4 mb-12">
                            <button onClick={() => document.getElementById('menu').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-red-600 hover:bg-red-700 text-sm font-semibold rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-600/20">
                                View Menu
                            </button>
                            <button className="px-8 py-4 bg-white text-black hover:bg-gray-100 text-sm font-semibold rounded-full transition-all hover:scale-105 active:scale-95">
                                Book A Table
                            </button>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex -space-x-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-12 h-12 rounded-full border-2 border-[#0a0a0a] overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                <div className="w-12 h-12 rounded-full border-2 border-[#0a0a0a] bg-gray-800 flex items-center justify-center text-xs font-bold">
                                    4k+
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-white/60 mb-1">Reviews</p>
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => <StarSolid key={i} className="w-4 h-4" />)}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="relative hidden md:block"
                    >
                        {/* Huge circular background for the dish */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1a1a1a] rounded-full shadow-2xl"></div>
                        
                        {/* Floating elements */}
                        <motion.div 
                            animate={{ y: [0, -20, 0] }} 
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="absolute -right-10 top-20 text-7xl drop-shadow-2xl z-20"
                        >
                            🍅
                        </motion.div>
                        <motion.div 
                            animate={{ y: [0, 20, 0] }} 
                            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                            className="absolute -left-10 bottom-20 text-7xl drop-shadow-2xl z-20 opacity-80"
                        >
                            🍃
                        </motion.div>

                        {/* Main dish */}
                        <img 
                            src={restaurant.image || "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop"} 
                            alt="Featured Dish" 
                            className="relative z-10 w-[700px] h-[700px] object-cover rounded-full drop-shadow-[0_30px_50px_rgba(0,0,0,0.8)] border-[12px] border-[#1a1a1a]"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Menu Section */}
            <section id="menu" className="py-20 relative z-10">
                <div className="container mx-auto px-10">
                    <h2 className="text-4xl font-serif mb-16 text-center">Featured Items</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {menuItems.slice(0, 8).map((item, idx) => (
                            <motion.div 
                                key={item._id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="bg-[#151515] rounded-[2rem] p-6 pt-0 relative mt-16 group hover:bg-[#1c1c1c] transition-colors"
                            >
                                <div className="flex justify-center -mt-16 mb-6">
                                    <div className="w-40 h-40 rounded-full border-4 border-[#0a0a0a] overflow-hidden bg-[#222] shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                        <img 
                                            src={item.image} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover"
                                            onError={e => e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop"}
                                        />
                                    </div>
                                </div>
                                
                                <div className="text-center">
                                    <h3 className="text-xl font-bold mb-1 line-clamp-1">{item.name}</h3>
                                    <p className="text-xs text-white/40 uppercase tracking-wider mb-6 line-clamp-1">{item.category}</p>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-xl font-bold text-red-500">₹{item.price}</span>
                                        {cart.find(i => i._id === item._id) ? (
                                            <div className="flex items-center space-x-3 bg-red-600 rounded-2xl px-2 h-10">
                                                <button onClick={() => removeFromCart(item)} className="text-white hover:text-white/80 font-bold px-2">-</button>
                                                <span className="text-white font-bold">{cart.find(i => i._id === item._id).quantity}</span>
                                                <button onClick={() => addToCart(item)} className="text-white hover:text-white/80 font-bold px-2">+</button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => addToCart(item)}
                                                className="w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center hover:bg-red-700 hover:scale-110 transition-all active:scale-95"
                                            >
                                                <ShoppingBagIcon className="w-5 h-5 text-white" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    {menuItems.length === 0 && (
                        <p className="text-center text-white/40">No menu items available.</p>
                    )}
                </div>
            </section>
            
            {/* Simple Footer */}
            <footer className="py-10 border-t border-white/5 text-center text-white/40 text-sm">
                <p>&copy; {new Date().getFullYear()} {restaurant.name}. All rights reserved.</p>
            </footer>

            {/* Cart Drawer */}
            <AnimatePresence>
                {isCartOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-end"
                        onClick={() => setIsCartOpen(false)}
                    >
                        <motion.div 
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="w-full max-w-md bg-[#111] h-full shadow-2xl border-l border-white/10 flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h2 className="text-2xl font-serif">Your Order</h2>
                                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full">✕</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {cart.length === 0 ? (
                                    <p className="text-white/40 text-center mt-10">Your cart is empty.</p>
                                ) : (
                                    cart.map(item => (
                                        <div key={item._id} className="flex gap-4 bg-[#1a1a1a] p-4 rounded-2xl">
                                            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                                            <div className="flex-1">
                                                <h4 className="font-bold">{item.name}</h4>
                                                <p className="text-red-500 font-bold text-sm">₹{item.price}</p>
                                            </div>
                                            <div className="flex flex-col items-center justify-between bg-black/50 rounded-lg w-8 py-1">
                                                <button onClick={() => addToCart(item)} className="text-white/60 hover:text-white">+</button>
                                                <span className="text-sm font-bold">{item.quantity}</span>
                                                <button onClick={() => removeFromCart(item)} className="text-white/60 hover:text-white">-</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            {cart.length > 0 && (
                                <div className="p-6 border-t border-white/10 bg-[#0a0a0a]">
                                    <div className="flex justify-between mb-4 font-bold text-lg">
                                        <span>Total</span>
                                        <span className="text-red-500">₹{cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)}</span>
                                    </div>
                                    <button onClick={() => navigate('/dashboard')} className="w-full py-4 bg-red-600 hover:bg-red-700 font-bold rounded-2xl transition-colors">
                                        Checkout in Dashboard
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RestaurantStorefront;
