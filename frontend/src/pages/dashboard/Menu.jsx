import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMenu, createMenuItem, updateMenuItem, deleteMenuItem, generateDescription, createOrder, generateOrderInstructions, getRecommendations, generateFullMenuItem } from '../../services/api';
import { SparklesIcon as SparklesOutline, ShoppingCartIcon, SparklesIcon } from '@heroicons/react/24/outline';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    PhotoIcon,
    CurrencyDollarIcon,
    CubeIcon,
    TagIcon,
    MinusIcon
} from '@heroicons/react/24/outline';

import AuthContext from '../../context/AuthContext';
import { useContext } from 'react';

const Menu = () => {
    const { user, selectedRestaurant } = useContext(AuthContext);
    const [menuItems, setMenuItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [isAiFullGenerating, setIsAiFullGenerating] = useState(false);
    const [aiDishPrompt, setAiDishPrompt] = useState("");
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartInstructions, setCartInstructions] = useState('');
    const [orderType, setOrderType] = useState('Dine-In');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [tableNumber, setTableNumber] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [isAiGeneratingInstructions, setIsAiGeneratingInstructions] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Main Course',
        image: 'https://via.placeholder.com/150',
        stock: 0
    });
    const [recommendations, setRecommendations] = useState([]);
    const [isAiLoading, setIsAiLoading] = useState(false);

    useEffect(() => {
        fetchMenu();
        if (user?.role === 'user') {
            fetchAIRecommendations();
        }
    }, [user?.role, selectedRestaurant?._id]);

    const fetchAIRecommendations = async () => {
        setIsAiLoading(true);
        try {
            const { data } = await getRecommendations(selectedRestaurant?._id);
            setRecommendations(data);
        } catch (error) {
            console.error("Failed to fetch recommendations", error);
        } finally {
            setIsAiLoading(false);
        }
    };

    const fetchMenu = async () => {
        setIsLoading(true);
        try {
            const { data } = await getMenu(selectedRestaurant?._id);
            setMenuItems(data);
        } catch (error) {
            console.error("Failed to fetch menu", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setCurrentItem(item);
            setFormData({
                name: item.name,
                description: item.description,
                price: item.price,
                category: item.category,
                image: item.image,
                stock: item.stock || 0
            });
        } else {
            setCurrentItem(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                category: 'Main Course',
                image: 'https://via.placeholder.com/150',
                stock: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedRestaurant?._id) {
            alert('Please select or create a restaurant first in the dashboard/settings.');
            return;
        }

        setIsLoading(true);
        try {
            if (currentItem) {
                await updateMenuItem(currentItem._id, formData);
            } else {
                await createMenuItem({ ...formData, restaurantId: selectedRestaurant._id });
            }
            await fetchMenu();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to save menu item:', error.response?.data?.message || error.message);
            alert(`Failed to save menu item: ${error.response?.data?.message || 'Server error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            setIsLoading(true);
            try {
                await deleteMenuItem(id);
                await fetchMenu();
            } catch (error) {
                alert('Failed to delete item');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleAiGenerate = async () => {
        if (!formData.name) {
            alert('Please enter an item name first');
            return;
        }
        setIsAiGenerating(true);
        try {
            const { data } = await generateDescription({
                name: formData.name,
                category: formData.category
            });
            setFormData(prev => ({ ...prev, description: data.description }));
        } catch (error) {
            console.error("AI Generation failed", error);
            alert('AI Generation failed. Please check your API key.');
        } finally {
            setIsAiGenerating(false);
        }
    };

    const handleAiFullGenerate = async () => {
        if (!aiDishPrompt.trim()) {
            alert("Please tell the AI what dish you'd like to create.");
            return;
        }
        setIsAiFullGenerating(true);
        try {
            const { data } = await generateFullMenuItem(aiDishPrompt);
            setFormData({
                name: data.name || '',
                description: data.description || '',
                price: formData.price || '',
                category: data.category || 'Main Course',
                image: data.image || 'https://via.placeholder.com/150',
                stock: formData.stock || 0
            });
            setAiDishPrompt('');
        } catch (error) {
            console.error("Full AI Generation failed", error);
            alert("Failed to generate the dish via AI.");
        } finally {
            setIsAiFullGenerating(false);
        }
    };

    const handleAiGenerateInstructions = async () => {
        if (!cartInstructions) {
            alert('Please enter some notes for the kitchen first');
            return;
        }
        setIsAiGeneratingInstructions(true);
        try {
            const { data } = await generateOrderInstructions({ prompt: cartInstructions });
            setCartInstructions(data.instructions);
        } catch (error) {
            console.error("AI Instruction Generation failed", error);
        } finally {
            setIsAiGeneratingInstructions(false);
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
        setIsCartOpen(true);
    };

    const removeFromCart = (itemId) => {
        setCart(prev => prev.filter(i => i._id !== itemId));
    };

    const handlePlaceOrder = async () => {
        if (cart.length === 0) return;
        if (!selectedRestaurant) {
            alert('Please select a restaurant first');
            return;
        }
        if (orderType === 'Home Delivery' && !deliveryAddress.trim()) {
            alert('Please enter a delivery address');
            return;
        }
        if (orderType === 'Dine-In' && !tableNumber) {
            alert('Please enter your table number');
            return;
        }
        setIsLoading(true);
        try {
            const orderData = {
                items: cart.map(item => ({
                    menuItem: item._id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalPrice: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
                tableNumber: orderType === 'Dine-In' ? (parseInt(tableNumber) || 1) : 0,
                specialInstructions: cartInstructions,
                restaurantId: selectedRestaurant._id,
                orderType,
                paymentMethod,
                deliveryAddress: orderType === 'Home Delivery' ? deliveryAddress : ''
            };
            await createOrder(orderData);
            alert('Order placed successfully!');
            setCart([]);
            setCartInstructions('');
            setIsCartOpen(false);
        } catch (error) {
            alert('Failed to place order');
        } finally {
            setIsLoading(false);
        }
    };

    const categories = [
        { name: 'Main Course', color: 'from-blue-500 to-cyan-500' },
        { name: 'Appetizer', color: 'from-purple-500 to-pink-500' },
        { name: 'Dessert', color: 'from-green-500 to-emerald-500' },
        { name: 'Beverage', color: 'from-orange-500 to-red-500' }
    ];

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.3 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">
                        {(user?.role === 'admin' || user?.role === 'owner')
                            ? `Menu Management`
                            : `Restaurant Menu`}
                    </h1>
                    <p className="opacity-60 text-sm font-medium mt-1 uppercase tracking-widest">
                        {(user?.role === 'admin' || user?.role === 'owner')
                            ? `Restaurant: ${selectedRestaurant?.name || 'Central Unit'}`
                            : `Menu for: ${selectedRestaurant?.name || 'Local Kitchen'}`}
                    </p>
                </div>

                {(user?.role === 'admin' || user?.role === 'owner') ? (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenModal()}
                        className="flex items-center px-8 py-4 bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-amber-600/30 hover:bg-amber-700 transition-all group"
                    >
                        <PlusIcon className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform duration-500" />
                        Add Menu Item
                    </motion.button>
                ) : (
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-4 theme-card rounded-2xl hover:border-amber-500 transition-all group shadow-lg"
                    >
                        <ShoppingCartIcon className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform" />
                        {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-amber-600 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white/10 font-black shadow-lg">
                                {cart.length}
                            </span>
                        )}
                    </button>
                )}
            </motion.div>

            {/* Loading State */}
            {isLoading && !menuItems.length ? (
                <div className="flex items-center justify-center h-64">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-gray-800 border-t-amber-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-amber-600 to-purple-600 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* AI Recommendations Section */}
                     {user?.role === 'user' && recommendations.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="theme-card border border-amber-500/10 rounded-[2.5rem] p-8 mb-10 overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
                                <SparklesIcon className="w-32 h-32 text-amber-500" />
                            </div>
                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <SparklesIcon className="w-5 h-5 text-amber-500" />
                                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-amber-600/80">Autonomous Suggestions</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                                {recommendations.map((item) => (
                                    <div key={item._id} className="theme-card-item rounded-2xl p-5 flex gap-5 group border border-transparent hover:border-amber-500/20 transition-all cursor-pointer">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg border border-white/10">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black truncate text-sm uppercase tracking-tight">{item.name}</h4>
                                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">{item.category}</p>
                                            <button
                                                onClick={() => addToCart(item)}
                                                className="text-[10px] font-black text-amber-500 hover:text-amber-600 uppercase tracking-widest mt-3 flex items-center gap-1 transition-colors"
                                            >
                                                Authorize <PlusIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Menu Items Grid */}
                    {!selectedRestaurant ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="theme-card rounded-2xl p-12 text-center"
                        >
                            <div className="w-20 h-20 mx-auto mb-4 bg-red-500/10 rounded-2xl flex items-center justify-center">
                                <XMarkIcon className="w-10 h-10 text-red-500" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No Restaurant Selected</h3>
                            <p className="opacity-60 mb-6">You must select a restaurant to manage menu items.</p>
                        </motion.div>
                    ) : menuItems.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="theme-card rounded-2xl p-12 text-center"
                        >
                            <div className="w-20 h-20 mx-auto mb-4 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                                <PhotoIcon className="w-10 h-10 text-amber-500" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {(user?.role === 'admin' || user?.role === 'owner')
                                    ? 'No Menu Items Yet'
                                    : 'Menu Coming Soon'}
                            </h3>
                            <p className="opacity-60 mb-6">
                                {(user?.role === 'admin' || user?.role === 'owner')
                                    ? 'Get started by adding your first menu item'
                                    : 'This restaurant hasn\'t added any items to their menu yet.'}
                            </p>
                            {(user?.role === 'admin' || user?.role === 'owner') && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleOpenModal()}
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-purple-600 text-white rounded-xl font-medium"
                                >
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    Add Your First Item
                                </motion.button>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            <AnimatePresence>
                                {menuItems.map((item) => {
                                    const categoryColor = categories.find(c => c.name === item.category)?.color || 'from-gray-500 to-gray-600';

                                    return (
                                        <motion.div
                                            key={item._id}
                                            variants={fadeInUp}
                                            layout
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            whileHover={{ y: -8 }}
                                            className="group relative theme-card rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all duration-300"
                                        >
                                            {/* Image */}
                                            <div className="relative h-48 overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10" />
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />

                                                {/* Category Badge */}
                                                <div className="absolute top-3 left-3 z-20">
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${categoryColor} text-white shadow-lg`}>
                                                        {item.category}
                                                    </span>
                                                </div>

                                                {/* Stock Badge */}
                                                <div className="absolute top-3 right-3 z-20">
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${(item.stock || 0) > 0
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                        }`}>
                                                        {(item.stock || 0) > 0 ? `${item.stock} in stock` : 'Out of stock'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-5">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="text-lg font-bold group-hover:text-amber-500 transition">
                                                        {item.name}
                                                    </h3>
                                                    <div className="flex items-center bg-amber-600 px-3 py-1 rounded-full">
                                                        <span className="text-white font-bold text-sm">₹{item.price}</span>
                                                    </div>
                                                </div>

                                                <p className="opacity-60 text-sm mb-4 line-clamp-2">
                                                    {item.description}
                                                </p>

                                                {/* Action Buttons */}
                                                {(user?.role === 'admin' || user?.role === 'owner') ? (
                                                    <div className="flex justify-end gap-3 pt-5 border-t border-black/5">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1, rotate: -5 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleOpenModal(item)}
                                                            className="p-3 theme-card-item rounded-xl text-amber-500 hover:bg-amber-600 hover:text-white transition-all shadow-md"
                                                        >
                                                            <PencilIcon className="h-5 w-5" />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleDelete(item._id)}
                                                            className="p-3 theme-card-item rounded-xl text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-md"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </motion.button>
                                                    </div>
                                                ) : (
                                                    <div className="pt-5 border-t border-black/5">
                                                        <button
                                                            onClick={() => addToCart(item)}
                                                            disabled={item.stock === 0}
                                                            className="w-full py-4 bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-amber-600/20 active:scale-95 transition-all disabled:opacity-50"
                                                        >
                                                            {item.stock > 0 ? 'Add To Cart' : 'Out of Stock'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            className="theme-card rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b">
                                <h2 className="text-xl font-bold">
                                    {currentItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                                </h2>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 opacity-60 hover:opacity-100 transition"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </motion.button>
                            </div>

                            {/* AI Magic Generator */}
                            {!currentItem && (
                                <div className="px-8 pt-8 pb-0">
                                    <div className="theme-card border border-amber-500/20 rounded-[2rem] p-6 flex flex-col gap-4 relative overflow-hidden bg-amber-500/5">
                                        <div className="absolute top-0 right-0 p-6 opacity-[0.05]">
                                            <SparklesOutline className="w-20 h-20 text-amber-500" />
                                        </div>
                                        <div className="relative z-10">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 flex items-center gap-2 mb-3">
                                                <SparklesIcon className="w-4 h-4" /> Neural Synthesis
                                            </h3>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    className="flex-1 theme-card-item border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 font-bold placeholder:opacity-30"
                                                    placeholder="Describe culinary vision..."
                                                    value={aiDishPrompt}
                                                    onChange={(e) => setAiDishPrompt(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAiFullGenerate())}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAiFullGenerate}
                                                    disabled={isAiFullGenerating}
                                                    className="px-6 py-3 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2 shadow-xl shadow-amber-600/30"
                                                >
                                                    {isAiFullGenerating ? (
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : "Synthesize"}
                                                </button>
                                            </div>
                                            <p className="text-[10px] font-bold opacity-40 mt-3 uppercase tracking-wider">Automates description, categorization, and visual mapping.</p>
                                        </div>
                                    </div>
                                </div>
                            )}                            {/* Modal Form */}
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1 mb-2">Item Designation</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full theme-card-item border border-black/5 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-bold placeholder:opacity-30"
                                            placeholder="e.g., SEARING SALMON"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">Technical Description</label>
                                            <button
                                                type="button"
                                                onClick={handleAiGenerate}
                                                disabled={isAiGenerating}
                                                className="flex items-center text-[9px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-600 transition-colors disabled:opacity-50"
                                            >
                                                {isAiGenerating ? (
                                                    <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-1.5"></div>
                                                ) : (
                                                    <SparklesIcon className="w-3 h-3 mr-1.5" />
                                                )}
                                                Synthesis
                                            </button>
                                        </div>
                                        <textarea
                                            required
                                            rows="4"
                                            className="w-full theme-card-item border border-black/5 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-bold placeholder:opacity-30 resize-none"
                                            placeholder="Elucidate the item characteristics..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1 mb-2">Value Units (₹)</label>
                                            <div className="relative">
                                                <CurrencyDollarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20" />
                                                <input
                                                    type="number"
                                                    required
                                                    step="0.01"
                                                    className="w-full theme-card-item border border-black/5 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-bold placeholder:opacity-30"
                                                    placeholder="999"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1 mb-2">Inventory Count</label>
                                            <div className="relative">
                                                <CubeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20" />
                                                <input
                                                    type="number"
                                                    required
                                                    className="w-full theme-card-item border border-black/5 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-bold placeholder:opacity-30"
                                                    placeholder="50"
                                                    value={formData.stock}
                                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1 mb-2">Classification</label>
                                        <div className="relative">
                                            <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20" />
                                            <select
                                                className="w-full theme-card-item border border-black/5 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-bold appearance-none cursor-pointer"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.name} value={cat.name} className="theme-card-item">{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1 mb-2">Visual Mapping (URL)</label>
                                        <div className="relative">
                                            <PhotoIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20" />
                                            <input
                                                type="text"
                                                className="w-full theme-card-item border border-black/5 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-bold placeholder:opacity-30"
                                                placeholder="https://..."
                                                value={formData.image}
                                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 theme-card-item border border-black/5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black/5 transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-[2] py-4 bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-amber-600/40 hover:bg-amber-700 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {isLoading ? 'Processing...' : (currentItem ? 'Authorize Mutation' : 'Authorize Insertion')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="fixed right-0 top-0 h-full w-full max-w-md theme-card border-l border-black/5 z-50 flex flex-col shadow-2xl"
                        >
                            <div className="p-8 border-b border-black/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-600/10 rounded-xl">
                                        <ShoppingCartIcon className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black uppercase tracking-tighter">Order Cartage</h2>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{cart.length} Manifest Items</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    className="p-3 hover:bg-black/5 rounded-full transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                                        <ShoppingCartIcon className="w-16 h-16 mb-4" />
                                        <p className="font-black uppercase tracking-widest text-[10px]">Manifest Empty</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {cart.map((item) => (
                                            <div key={item._id} className="theme-card-item rounded-3xl p-5 border border-black/5 flex gap-5 items-center group">
                                                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-black uppercase tracking-tight text-sm mb-1">{item.name}</h4>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">₹{item.price}</span>
                                                        <div className="flex items-center gap-3 theme-card-item rounded-lg px-2 py-1">
                                                            <button onClick={() => removeFromCart(item._id)} className="p-1 hover:text-red-500 transition-colors">
                                                                <MinusIcon className="w-3 h-3" />
                                                            </button>
                                                            <span className="text-xs font-black">{item.quantity}</span>
                                                            <button onClick={() => addToCart(item)} className="p-1 hover:text-amber-500 transition-colors">
                                                                <PlusIcon className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="mt-8 space-y-6">
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2 block">Service Protocol</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {['Dine-In', 'Home Delivery'].map(type => (
                                                        <button
                                                            key={type}
                                                            onClick={() => setOrderType(type)}
                                                            className={`py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${orderType === type ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'theme-card-item border border-black/5 opacity-50 hover:opacity-100'}`}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {orderType === 'Dine-In' ? (
                                                <div>
                                                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2 block">Table Allocation</label>
                                                    <input
                                                        type="number"
                                                        placeholder="Table Number"
                                                        value={tableNumber}
                                                        onChange={(e) => setTableNumber(e.target.value)}
                                                        className="w-full theme-card-item border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold placeholder:opacity-30"
                                                    />
                                                </div>
                                            ) : (
                                                <div>
                                                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2 block">Delivery Coordinates</label>
                                                    <textarea
                                                        placeholder="Address Protocol"
                                                        value={deliveryAddress}
                                                        onChange={(e) => setDeliveryAddress(e.target.value)}
                                                        className="w-full theme-card-item border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold placeholder:opacity-30 h-24 resize-none"
                                                    />
                                                </div>
                                            )}

                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 mb-2 block">Settlement Method</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {['Cash', 'Card', 'UPI'].map(method => (
                                                        <button
                                                            key={method}
                                                            onClick={() => setPaymentMethod(method)}
                                                            className={`py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${paymentMethod === method ? 'bg-emerald-600 text-white shadow-lg' : 'theme-card-item border border-black/5 opacity-50'}`}
                                                        >
                                                            {method}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="relative">
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Preparation Directives</label>
                                                    <button
                                                        onClick={handleAiGenerateInstructions}
                                                        disabled={isAiGeneratingInstructions}
                                                        className="flex items-center text-[9px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-600"
                                                    >
                                                        <SparklesIcon className={`w-3 h-3 mr-1 ${isAiGeneratingInstructions ? 'animate-spin' : ''}`} />
                                                        AI Polish
                                                    </button>
                                                </div>
                                                <textarea
                                                    placeholder="Special instructions..."
                                                    value={cartInstructions}
                                                    onChange={(e) => setCartInstructions(e.target.value)}
                                                    className="w-full theme-card-item border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold placeholder:opacity-30 h-24 resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className="p-8 theme-card-item border-t border-black/5 space-y-6 bg-black/[0.02]">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Total Quantum</span>
                                        <span className="text-2xl font-black uppercase tracking-tighter">₹{cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}</span>
                                    </div>

                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={isLoading}
                                        className="w-full py-5 bg-amber-600 text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-amber-600/40 hover:bg-amber-700 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {isLoading ? 'Transmitting...' : 'Authorize Transaction'}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Menu;
