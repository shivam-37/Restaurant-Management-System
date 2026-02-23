import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { getRestaurants } from '../../../services/api';
import AuthContext from '../../../context/AuthContext';
import {
    BuildingStorefrontIcon,
    StarIcon,
    MapPinIcon,
    UserIcon,
    ArrowRightIcon,
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const RestaurantManagement = ({ onSelect }) => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { setSelectedRestaurant } = useContext(AuthContext);

    const handleSelect = (restaurant) => {
        console.log(`Admin selecting restaurant: ${restaurant.name} (${restaurant._id})`);
        setSelectedRestaurant(restaurant);
        if (onSelect) {
            console.log("Switching to Overview tab...");
            onSelect('Overview');
        }
    };

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const { data } = await getRestaurants();
            setRestaurants(data);
        } catch (error) {
            console.error("Failed to fetch restaurants");
        } finally {
            setLoading(false);
        }
    };

    const filteredRestaurants = restaurants.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cuisine?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/40 p-6 rounded-2xl border border-gray-800">
                <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search restaurants or cuisines..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition font-medium text-sm">
                        <AdjustmentsHorizontalIcon className="w-4 h-4" />
                        Filters
                    </button>
                    <p className="text-sm text-gray-400 font-medium">
                        Total: <span className="text-white">{filteredRestaurants.length}</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRestaurants.map((restaurant, idx) => (
                    <motion.div
                        key={restaurant._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -5 }}
                        className="group bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300"
                    >
                        {/* Status Banner */}
                        <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-500/10 rounded-xl">
                                    <BuildingStorefrontIcon className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
                                    <StarIcon className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm font-bold text-white">{restaurant.rating || '4.5'}</span>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors mb-1">
                                {restaurant.name}
                            </h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-4">
                                {restaurant.cuisine || 'Global Cuisine'}
                            </p>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <MapPinIcon className="w-4 h-4 text-gray-500" />
                                    <span className="truncate">{restaurant.address || 'Location Hidden'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <UserIcon className="w-4 h-4 text-gray-500" />
                                    <span>Managed by Owner</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleSelect(restaurant);
                                }}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white p-3 rounded-xl font-bold text-sm transition-all transform group-active:scale-95 shadow-lg shadow-indigo-600/20"
                            >
                                View Details & Live Analytics
                                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredRestaurants.length === 0 && (
                <div className="text-center py-20 bg-gray-900/20 border border-gray-800 border-dashed rounded-3xl">
                    <BuildingStorefrontIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400">No restaurants found</h3>
                    <p className="text-gray-500">Try adjusting your search terms</p>
                </div>
            )}
        </div>
    );
};

export default RestaurantManagement;
