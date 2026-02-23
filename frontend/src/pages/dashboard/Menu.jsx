import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMenu, createMenuItem, updateMenuItem, deleteMenuItem, generateDescription, createOrder, generateOrderInstructions, getRecommendations } from '../../services/api';
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
                    <h1 className="text-2xl font-bold text-white">
                        {(user?.role === 'admin' || user?.role === 'owner')
                            ? `Menu Management ${selectedRestaurant ? `• ${selectedRestaurant.name}` : ''}`
                            : selectedRestaurant ? `${selectedRestaurant.name} Menu` : 'Our Menu'}
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {(user?.role === 'admin' || user?.role === 'owner')
                            ? `Manage items for ${selectedRestaurant?.name || 'your restaurant'}`
                            : `Discover the flavors of ${selectedRestaurant?.name || 'our kitchen'}`}
                    </p>
                </div>

                {(user?.role === 'admin' || user?.role === 'owner') ? (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOpenModal()}
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-600/20 transition-all duration-300 group"
                    >
                        <PlusIcon className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                        Add New Item
                    </motion.button>
                ) : (
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-3 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 transition group"
                    >
                        <ShoppingCartIcon className="w-6 h-6 text-indigo-400" />
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-black font-bold">
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
                        <div className="w-16 h-16 border-4 border-gray-800 border-t-indigo-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full animate-pulse"></div>
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
                            className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 mb-8"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <SparklesIcon className="w-5 h-5 text-indigo-400" />
                                <h2 className="text-lg font-bold text-white uppercase tracking-wider">AI Recommended for You</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {recommendations.map((item) => (
                                    <div key={item._id} className="bg-black/40 border border-gray-800 rounded-xl p-4 flex gap-4 group">
                                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-white truncate text-sm">{item.name}</h4>
                                            <p className="text-xs text-gray-400 truncate mb-2">{item.category}</p>
                                            <button
                                                onClick={() => addToCart(item)}
                                                className="text-[10px] font-bold text-indigo-400 hover:text-white uppercase transition-colors"
                                            >
                                                Add to cart
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
                            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-800 p-12 text-center"
                        >
                            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center">
                                <XMarkIcon className="w-10 h-10 text-red-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No Restaurant Selected</h3>
                            <p className="text-gray-400 mb-6">You must select a restaurant to manage menu items.</p>
                        </motion.div>
                    ) : menuItems.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-800 p-12 text-center"
                        >
                            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                                <PhotoIcon className="w-10 h-10 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                {(user?.role === 'admin' || user?.role === 'owner')
                                    ? 'No Menu Items Yet'
                                    : 'Menu Coming Soon'}
                            </h3>
                            <p className="text-gray-400 mb-6">
                                {(user?.role === 'admin' || user?.role === 'owner')
                                    ? 'Get started by adding your first menu item'
                                    : 'This restaurant hasn\'t added any items to their menu yet.'}
                            </p>
                            {(user?.role === 'admin' || user?.role === 'owner') && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleOpenModal()}
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium"
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
                                            className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-800 overflow-hidden hover:border-indigo-500/50 transition-all duration-300"
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
                                                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition">
                                                        {item.name}
                                                    </h3>
                                                    <div className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1 rounded-full">
                                                        <span className="text-white font-bold text-sm">₹{item.price}</span>
                                                    </div>
                                                </div>

                                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                                    {item.description}
                                                </p>

                                                {/* Action Buttons */}
                                                {(user?.role === 'admin' || user?.role === 'owner') ? (
                                                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleOpenModal(item)}
                                                            className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                                                        >
                                                            <PencilIcon className="h-5 w-5" />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleDelete(item._id)}
                                                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </motion.button>
                                                    </div>
                                                ) : (
                                                    <div className="pt-2 border-t border-gray-800">
                                                        <button
                                                            onClick={() => addToCart(item)}
                                                            disabled={item.stock === 0}
                                                            className="w-full py-2 bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {item.stock > 0 ? 'Add to Order' : 'Out of Stock'}
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
                            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl w-full max-w-md border border-gray-800 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-800">
                                <h2 className="text-xl font-bold text-white">
                                    {currentItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                                </h2>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </motion.button>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Item Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                        placeholder="e.g., Grilled Salmon"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-300">
                                            Description
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleAiGenerate}
                                            disabled={isAiGenerating}
                                            className="flex items-center text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
                                        >
                                            {isAiGenerating ? (
                                                <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mr-1"></div>
                                            ) : (
                                                <SparklesOutline className="w-3 h-3 mr-1" />
                                            )}
                                            {isAiGenerating ? 'Generating...' : 'AI Generate'}
                                        </button>
                                    </div>
                                    <textarea
                                        required
                                        rows="3"
                                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                        placeholder="Describe your dish..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Price ($)
                                        </label>
                                        <div className="relative">
                                            <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type="number"
                                                required
                                                step="0.01"
                                                min="0"
                                                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                                placeholder="29.99"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Stock
                                        </label>
                                        <div className="relative">
                                            <CubeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                                placeholder="50"
                                                value={formData.stock}
                                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Category
                                    </label>
                                    <div className="relative">
                                        <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <select
                                            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-10 py-3 text-white appearance-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition cursor-pointer"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.name} value={cat.name} className="bg-gray-800">
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Image URL
                                    </label>
                                    <div className="relative">
                                        <PhotoIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type="text"
                                            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                            placeholder="https://example.com/image.jpg"
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-2.5 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-800 rounded-xl transition"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isLoading}
                                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Saving...' : 'Save Item'}
                                    </motion.button>
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
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-gray-900 border-l border-gray-800 z-50 flex flex-col"
                        >
                            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <ShoppingCartIcon className="w-6 h-6 text-indigo-400" />
                                    <h2 className="text-xl font-bold text-white">Your Order</h2>
                                </div>
                                <button onClick={() => setIsCartOpen(false)} className="p-2 text-gray-500 hover:text-white transition">
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {cart.length === 0 ? (
                                    <div className="text-center py-20">
                                        <ShoppingCartIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                        <p className="text-gray-500">Your cart is empty</p>
                                    </div>
                                ) : (
                                    cart.map((item) => (
                                        <div key={item._id} className="flex justify-between items-center bg-gray-800/30 p-4 rounded-xl border border-gray-800">
                                            <div>
                                                <h4 className="font-bold text-white">{item.name}</h4>
                                                <p className="text-indigo-400 text-sm">{item.quantity}x ₹{item.price}</p>
                                            </div>
                                            <button onClick={() => removeFromCart(item._id)} className="text-gray-500 hover:text-red-400 transition">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))
                                )}

                                {cart.length > 0 && (
                                    <div className="mt-6 space-y-5">

                                        {/* Order Type Toggle */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Order Type</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['Dine-In', 'Home Delivery'].map(type => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => setOrderType(type)}
                                                        className={`py-3 rounded-xl text-sm font-bold border transition-all ${orderType === type
                                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                                                : 'bg-gray-800/40 border-gray-700 text-gray-400 hover:border-indigo-500/50'
                                                            }`}
                                                    >
                                                        {type === 'Dine-In' ? '🍽️ Dine-In' : '🛵 Home Delivery'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Table Number (Dine-In only) */}
                                        {orderType === 'Dine-In' && (
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Table Number</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition text-sm"
                                                    placeholder="Enter your table number"
                                                    value={tableNumber}
                                                    onChange={e => setTableNumber(e.target.value)}
                                                />
                                            </div>
                                        )}

                                        {/* Delivery Address (Home Delivery only) */}
                                        {orderType === 'Home Delivery' && (
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Delivery Address</label>
                                                <textarea
                                                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition text-sm"
                                                    placeholder="Enter your full delivery address..."
                                                    rows="2"
                                                    value={deliveryAddress}
                                                    onChange={e => setDeliveryAddress(e.target.value)}
                                                />
                                            </div>
                                        )}

                                        {/* Payment Method */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Payment Method</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[{ id: 'Cash', icon: '💵' }, { id: 'Card', icon: '💳' }, { id: 'UPI', icon: '📱' }].map(method => (
                                                    <button
                                                        key={method.id}
                                                        type="button"
                                                        onClick={() => setPaymentMethod(method.id)}
                                                        className={`py-3 rounded-xl text-sm font-bold border transition-all ${paymentMethod === method.id
                                                                ? 'bg-green-600/80 border-green-500 text-white shadow-lg shadow-green-600/20'
                                                                : 'bg-gray-800/40 border-gray-700 text-gray-400 hover:border-green-500/50'
                                                            }`}
                                                    >
                                                        <span className="block text-lg mb-0.5">{method.icon}</span>
                                                        {method.id}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Special Instructions */}
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Special Instructions</label>
                                                <button
                                                    onClick={handleAiGenerateInstructions}
                                                    disabled={isAiGeneratingInstructions || !cartInstructions}
                                                    className="flex items-center text-xs font-medium text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                                                >
                                                    {isAiGeneratingInstructions ? 'Polishing...' : 'AI Polish'}
                                                    <SparklesOutline className="w-3 h-3 ml-1" />
                                                </button>
                                            </div>
                                            <textarea
                                                className="w-full bg-gray-800/50 border border-gray-800 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition"
                                                placeholder="e.g., spicy, no onions..."
                                                rows="2"
                                                value={cartInstructions}
                                                onChange={(e) => setCartInstructions(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className="p-6 border-t border-gray-800 space-y-4 bg-gray-900/50">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Total Price</span>
                                        <span className="text-2xl font-bold text-white">
                                            ₹{cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={isLoading}
                                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-600/20 transition-all disabled:opacity-50"
                                    >
                                        Place Order
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