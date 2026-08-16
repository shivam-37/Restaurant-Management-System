import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getMenu, getRestaurantDetails, createGuestOrder, getUpsellRecommendation } from '../services/api';
import { ShoppingCartIcon, XMarkIcon, PlusIcon, MinusIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const GuestMenu = () => {
    const { restaurantId, tableNumber } = useParams();
    const navigate = useNavigate();
    
    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    
    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    
    const [upsellRecommendation, setUpsellRecommendation] = useState(null);
    const [isUpsellLoading, setIsUpsellLoading] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    useEffect(() => {
        fetchRestaurantAndMenu();
    }, [restaurantId]);

    useEffect(() => {
        const fetchUpsell = async () => {
            if (isCartOpen && cart.length > 0 && restaurant) {
                setIsUpsellLoading(true);
                try {
                    const { data } = await getUpsellRecommendation(cart, restaurant._id);
                    setUpsellRecommendation(data);
                } catch (err) {
                    console.error("Upsell fetch failed", err);
                } finally {
                    setIsUpsellLoading(false);
                }
            }
        };
        fetchUpsell();
    }, [isCartOpen, cart.length, restaurant]);

    const fetchRestaurantAndMenu = async () => {
        try {
            const [resData, menuData] = await Promise.all([
                getRestaurantDetails(restaurantId),
                getMenu(restaurantId)
            ]);
            setRestaurant(resData.data);
            setMenu(menuData.data);
            const cats = ['All', ...new Set(menuData.data.map(i => i.category))];
            setCategories(cats);
        } catch (error) {
            console.error("Failed to fetch menu", error);
        }
    };

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i._id === item._id);
            if (existing) {
                return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.map(i => i._id === id ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0));
    };

    const handlePlaceOrder = async () => {
        if (!guestName.trim()) {
            return alert("Please enter your name");
        }
        
        setIsLoading(true);
        try {
            const orderData = {
                restaurantId,
                tableNumber: parseInt(tableNumber),
                items: cart.map(item => ({
                    menuItem: item._id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalPrice: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
                guestName,
                guestPhone,
                orderType: 'Dine-In',
                paymentMethod: 'Cash' // For simplicity in guest checkout
            };

            await createGuestOrder(orderData);
            setCart([]);
            setIsCartOpen(false);
            setOrderPlaced(true);
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to place order');
        } finally {
            setIsLoading(false);
        }
    };

    if (orderPlaced) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <CheckCircleIcon className="w-24 h-24 text-green-500 mb-6" />
                <h1 className="text-3xl font-black mb-2 uppercase tracking-tighter">Order Received!</h1>
                <p className="opacity-60 mb-8">Your order has been sent to the kitchen. It will be brought to Table {tableNumber} shortly.</p>
                <button 
                    onClick={() => setOrderPlaced(false)}
                    className="px-8 py-4 bg-orange-600 text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-orange-700 transition"
                >
                    Order More
                </button>
            </div>
        );
    }

    const filteredMenu = activeCategory === 'All' ? menu : menu.filter(m => m.category === activeCategory);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-black dark:text-white pb-24">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-[#fafafa]/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-black/5 p-6">
                <h1 className="text-2xl font-black uppercase tracking-tighter">{restaurant?.name || 'Loading...'}</h1>
                <p className="text-sm font-bold text-orange-600">Table {tableNumber}</p>
            </div>

            {/* Categories */}
            <div className="p-6 pb-2 overflow-x-auto hide-scrollbar">
                <div className="flex gap-2 w-max">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                                activeCategory === cat 
                                ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/30' 
                                : 'bg-black/5 hover:bg-black/10'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMenu.map(item => (
                    <div key={item._id} className="theme-card rounded-3xl p-5 border border-black/5 flex flex-col justify-between">
                        <div>
                            <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-black/5">
                                {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-black text-lg uppercase tracking-tight">{item.name}</h3>
                                <span className="font-black text-orange-600">₹{item.price}</span>
                            </div>
                            <p className="text-xs opacity-60 font-medium mb-4 line-clamp-2">{item.description}</p>
                        </div>
                        <button
                            onClick={() => addToCart(item)}
                            disabled={!item.isAvailable}
                            className="w-full py-4 bg-black/5 hover:bg-orange-600 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                            {item.isAvailable ? 'Add to Order' : 'Out of Stock'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Floating Cart Button */}
            {cartCount > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-sm px-6">
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="w-full py-4 bg-orange-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-orange-600/40 hover:bg-orange-700 transition-all flex items-center justify-between px-8"
                    >
                        <span className="flex items-center gap-2"><ShoppingCartIcon className="w-5 h-5" /> {cartCount} Items</span>
                        <span>View Order</span>
                    </button>
                </div>
            )}

            {/* Cart Drawer */}
            <AnimatePresence>
                {isCartOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                            onClick={() => setIsCartOpen(false)}
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="fixed bottom-0 left-0 w-full h-[90vh] bg-white dark:bg-[#0f0f0f] rounded-t-[3rem] z-50 flex flex-col shadow-2xl"
                        >
                            <div className="p-6 border-b border-black/5 flex items-center justify-between shrink-0">
                                <h2 className="text-xl font-black uppercase tracking-tighter">Your Order</h2>
                                <button onClick={() => setIsCartOpen(false)} className="p-3 bg-black/5 hover:bg-black/10 rounded-full transition">
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {cart.map((item) => (
                                    <div key={item._id} className="flex gap-4 items-center">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black/5 shrink-0">
                                            {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black uppercase tracking-tight text-sm mb-1">{item.name}</h4>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">₹{item.price}</span>
                                                <div className="flex items-center gap-3 bg-black/5 rounded-lg px-2 py-1">
                                                    <button onClick={() => removeFromCart(item._id)} className="p-1 hover:text-orange-500 transition"><MinusIcon className="w-3 h-3" /></button>
                                                    <span className="text-xs font-black">{item.quantity}</span>
                                                    <button onClick={() => addToCart(item)} className="p-1 hover:text-orange-500 transition"><PlusIcon className="w-3 h-3" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* AI Upsell */}
                                {(isUpsellLoading || upsellRecommendation) && (
                                    <div className="mt-4 border border-orange-500/20 rounded-2xl p-4 bg-orange-500/5 relative overflow-hidden">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 flex items-center gap-2 mb-3">
                                            <SparklesIcon className="w-4 h-4" /> AI Suggestion
                                        </h3>
                                        {isUpsellLoading ? (
                                            <div className="animate-pulse flex gap-3">
                                                <div className="w-12 h-12 bg-black/10 rounded-xl"></div>
                                                <div className="flex-1 space-y-2 py-1">
                                                    <div className="h-3 bg-black/10 rounded w-3/4"></div>
                                                </div>
                                            </div>
                                        ) : upsellRecommendation?.item ? (
                                            <div className="flex gap-4 items-center">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                                                    <img src={upsellRecommendation.item.image} alt={upsellRecommendation.item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-black text-xs uppercase truncate">{upsellRecommendation.item.name}</h4>
                                                        <span className="text-[10px] font-black text-orange-600">₹{upsellRecommendation.item.price}</span>
                                                    </div>
                                                    <p className="text-[9px] font-bold opacity-60 mt-0.5 leading-tight">{upsellRecommendation.reason}</p>
                                                </div>
                                                <button
                                                    onClick={() => addToCart(upsellRecommendation.item)}
                                                    className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center shrink-0 hover:bg-orange-700 transition shadow-md"
                                                >
                                                    <PlusIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                )}

                                <div className="space-y-4 pt-6 border-t border-black/5">
                                    <div>
                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2 block">Your Name</label>
                                        <input 
                                            type="text" 
                                            value={guestName}
                                            onChange={e => setGuestName(e.target.value)}
                                            placeholder="Enter your name" 
                                            className="w-full bg-black/5 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2 block">Phone (Optional)</label>
                                        <input 
                                            type="tel" 
                                            value={guestPhone}
                                            onChange={e => setGuestPhone(e.target.value)}
                                            placeholder="Enter your phone number" 
                                            className="w-full bg-black/5 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-black/5 shrink-0">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Total</span>
                                    <span className="text-2xl font-black uppercase tracking-tighter">₹{cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}</span>
                                </div>
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={isLoading || cart.length === 0}
                                    className="w-full py-5 bg-orange-600 text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-orange-600/40 hover:bg-orange-700 transition disabled:opacity-50"
                                >
                                    {isLoading ? 'Sending...' : 'Place Order'}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GuestMenu;
