import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { createRestaurant } from '../../services/api';
import AuthContext from '../../context/AuthContext';
import {
    SparklesIcon,
    HomeIcon,
    ArrowRightIcon,
    CameraIcon,
    MapPinIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';

const CreateRestaurant = () => {
    const { setSelectedRestaurant } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        cuisine: '',
        image: '',
        tablesCount: 4
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Create default tables based on tablesCount
            const tables = Array.from({ length: formData.tablesCount }, (_, i) => ({
                number: i + 1,
                capacity: i % 2 === 0 ? 4 : 2,
                status: 'Available'
            }));

            const { data } = await createRestaurant({
                name: formData.name,
                description: formData.description,
                address: formData.address,
                cuisine: formData.cuisine,
                image: formData.image,
                tables
            });

            setSelectedRestaurant(data);
        } catch (error) {
            console.error('Failed to create restaurant:', error);
            alert('Failed to create restaurant. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-[40px] p-8 md:p-12 border border-gray-800 shadow-2xl relative overflow-hidden"
            >
                {/* Decorative blobs */}
                <div className="absolute top-0 -left-20 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 -right-20 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl"></div>

                <div className="relative">
                    <motion.div variants={fadeInUp} initial="initial" animate="animate" className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-600/20">
                            <SparklesIcon className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4">Welcome, Owner!</h1>
                        <p className="text-gray-400 text-lg">Let's set up your premium restaurant page.</p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
                            <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Restaurant Name</label>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition-opacity"></div>
                                <div className="relative">
                                    <HomeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. The Gourmet Haven"
                                        className="w-full bg-black/40 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder-gray-700"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.15 }}>
                                <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Cuisine Type</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Italian, Sushi, Fusion"
                                    className="w-full bg-black/40 border border-gray-800 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder-gray-700"
                                    value={formData.cuisine}
                                    onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                                />
                            </motion.div>

                            <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.2 }}>
                                <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Description</label>
                                <input
                                    type="text"
                                    placeholder="Short catchy description"
                                    className="w-full bg-black/40 border border-gray-800 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder-gray-700"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </motion.div>
                        </div>

                        <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.25 }}>
                            <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Address / Location</label>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition-opacity"></div>
                                <div className="relative">
                                    <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400" />
                                    <input
                                        type="text"
                                        placeholder="e.g. 123 Luxury Lane, Foodie City"
                                        className="w-full bg-black/40 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder-gray-700"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.3 }}>
                                <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Number of Tables</label>
                                <div className="relative group">
                                    <UserGroupIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400" />
                                    <input
                                        type="number"
                                        min="1"
                                        max="50"
                                        className="w-full bg-black/40 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                                        value={formData.tablesCount}
                                        onChange={(e) => setFormData({ ...formData, tablesCount: parseInt(e.target.value) })}
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.4 }}>
                                <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Restaurant Logo/Image</label>
                                <div className="w-full bg-black/40 border border-gray-800 border-dashed rounded-2xl py-4 flex items-center justify-center cursor-pointer hover:bg-white/5 transition group">
                                    <CameraIcon className="w-6 h-6 text-gray-600 group-hover:text-indigo-400 mr-2" />
                                    <span className="text-sm text-gray-600 group-hover:text-indigo-400">Click to upload</span>
                                </div>
                            </motion.div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/20 flex items-center justify-center group"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Create My Restaurant</span>
                                    <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
                                </>
                            )}
                        </motion.button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default CreateRestaurant;
