import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/solid';
import AuthContext from '../context/AuthContext';
import { getRestaurants } from '../services/api';

const RestaurantList = ({ restaurants: propsRestaurants, loading: propsLoading }) => {
    const { restaurants: ctxRestaurants, refreshRestaurants, setSelectedRestaurant } = useContext(AuthContext);
    const navigate = useNavigate();

    // On mount load restaurants if not already cached
    useEffect(() => {
        if (propsRestaurants === undefined && ctxRestaurants.length === 0) {
            refreshRestaurants();
        }
    }, []);

    // Prefer context list; fall back to props
    const restaurants = propsRestaurants !== undefined ? propsRestaurants : ctxRestaurants;
    const loading = propsRestaurants !== undefined ? (propsLoading ?? false) : ctxRestaurants.length === 0;

    const handleSelect = (restaurant) => {
        setSelectedRestaurant(restaurant);
        navigate('/dashboard');
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-8 p-8 max-w-4xl mx-auto">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-64 rounded-[3rem] animate-pulse" style={{ background: 'var(--bg-secondary)' }}></div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 p-8 max-w-4xl mx-auto">
            {Array.isArray(restaurants) && restaurants.map((restaurant) => (
                <motion.div
                    key={restaurant._id}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="group relative theme-card rounded-[3rem] overflow-hidden cursor-pointer hover:border-[#f97316]/50 flex flex-col md:flex-row items-center gap-6 p-4 border border-black/5 dark:border-white/5"
                    onClick={() => handleSelect(restaurant)}
                >
                    <div className="w-full md:w-64 h-64 shrink-0 relative overflow-hidden rounded-[2rem]">
                        {restaurant.image ? (
                            <img
                                src={restaurant.image}
                                alt={restaurant.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#f97316]/10 to-[#f97316]/20 flex items-center justify-center">
                                <h2 className="text-3xl font-black text-black/10 dark:text-white/10 uppercase tracking-widest">{restaurant.name}</h2>
                            </div>
                        )}
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 border border-white/10">
                            <StarIcon className="w-4 h-4 text-yellow-500" />
                            <span className="text-xs font-bold text-white">{restaurant.rating || '4.5'}</span>
                        </div>
                    </div>

                    <div className="flex-1 p-2 md:p-6 text-left">
                        <h3 className="text-3xl font-bold mb-3 group-hover:text-[#f97316] transition-colors">
                            {restaurant.name}
                        </h3>

                        <p className="text-sm text-gray-400 mb-6 max-w-sm leading-relaxed">
                            {restaurant.description || 'Experience the finest dining with our curated menu.'}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                            <div className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4" />
                                <span>20-30 min</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPinIcon className="w-4 h-4" />
                                <span className="truncate max-w-[200px]">{restaurant.address?.split(',')[0] || '1.2 miles'}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                                {(restaurant.cuisine || 'Restaurant').split(',').slice(0, 2).map(tag => (
                                    <span key={tag} className="text-xs font-black uppercase tracking-wider px-3 py-1.5 bg-black/5 dark:bg-white/5 rounded-lg opacity-80">
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                className="bg-[#f97316] text-white text-sm font-bold px-6 py-3 rounded-full shadow-[0_10px_30px_rgba(249,115,22,0.3)] hover:bg-orange-600 transition-colors"
                            >
                                View Menu
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default RestaurantList;
