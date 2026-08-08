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
    const { restaurants: ctxRestaurants, refreshRestaurants, setSelectedRestaurant } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const loading = ctxRestaurants.length === 0;

    const handleSelect = (restaurant) => {
        console.log(`Admin selecting restaurant: ${restaurant.name} (${restaurant._id})`);
        setSelectedRestaurant(restaurant);
        if (onSelect) {
            console.log("Switching to Overview tab...");
            onSelect('Overview');
        }
    };

    useEffect(() => {
        if (ctxRestaurants.length === 0) {
            refreshRestaurants();
        }
    }, []);

    const filteredRestaurants = ctxRestaurants.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cuisine?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f97316]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-rose-500/5 p-8 rounded-[2rem] border border-rose-500/10">
                <div className="relative flex-1 max-w-lg">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
                    <input
                        type="text"
                        placeholder="Search restaurants or cuisines..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full theme-card-item border border-black/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold placeholder:opacity-40 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-3 px-6 py-4 theme-card-item rounded-2xl border border-black/5 hover:border-rose-500/50 transition-all font-black text-[10px] uppercase tracking-widest">
                        <AdjustmentsHorizontalIcon className="w-4 h-4" />
                        Filter
                    </button>
                    <div className="h-10 w-px bg-black/5 mx-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                        Total Restaurants: <span className="opacity-100 text-rose-600 dark:text-rose-400">{filteredRestaurants.length}</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRestaurants.map((restaurant, idx) => (
                    <motion.div
                        key={restaurant._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -8 }}
                        className="group theme-card border border-black/5 rounded-[2.5rem] overflow-hidden hover:border-rose-500 transition-all duration-500 shadow-sm hover:shadow-2xl"
                    >
                        {/* Interactive Status Bar */}
                        <div className="h-2 bg-gradient-to-r from-rose-600 via-purple-600 to-pink-500 group-hover:h-3 transition-all duration-500"></div>

                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-rose-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-rose-500/5">
                                    <BuildingStorefrontIcon className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                                </div>
                                <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-4 py-2 rounded-xl border border-black/5">
                                    <StarIcon className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm font-black tracking-tighter">{restaurant.rating || '4.5'}</span>
                                </div>
                            </div>

                            <h3 className="text-2xl font-black tracking-tighter group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors mb-2 leading-none">
                                {restaurant.name}
                            </h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-8 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                {restaurant.cuisine || 'Cuisine Type'}
                            </p>

                            <div className="space-y-4 mb-10">
                                <div className="flex items-center gap-4 text-sm font-bold opacity-60">
                                    <MapPinIcon className="w-5 h-5 text-rose-500 shrink-0" />
                                    <span className="truncate">{restaurant.address || 'No address provided'}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm font-bold opacity-60">
                                    <UserIcon className="w-5 h-5 text-purple-500 shrink-0" />
                                    <span>Owner Verified</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleSelect(restaurant);
                                }}
                                className="w-full flex items-center justify-center gap-3 bg-rose-600 dark:bg-rose-600 text-white p-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all transform group-active:scale-95 shadow-xl shadow-rose-600/30 hover:bg-rose-700 hover:-translate-y-1"
                            >
                                Manage Restaurant
                                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredRestaurants.length === 0 && (
                <div className="text-center py-24 theme-card border border-black/5 border-dashed rounded-[3rem]">
                    <BuildingStorefrontIcon className="w-20 h-20 opacity-10 mx-auto mb-6" />
                    <h3 className="text-2xl font-black uppercase tracking-tighter opacity-40">No Results Found</h3>
                    <p className="opacity-20 font-bold uppercase tracking-widest text-xs mt-2">Try a different search term</p>
                </div>
            )}
        </div>
    );
};

export default RestaurantManagement;
