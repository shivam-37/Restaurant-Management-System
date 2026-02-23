import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/solid';
import AuthContext from '../context/AuthContext';
import { getRestaurants } from '../services/api';

const RestaurantList = ({ restaurants: propsRestaurants, loading: propsLoading }) => {
    const [restaurants, setRestaurants] = useState(propsRestaurants || []);
    const [loading, setLoading] = useState(propsLoading !== undefined ? propsLoading : true);
    const { setSelectedRestaurant } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSelect = (restaurant) => {
        setSelectedRestaurant(restaurant);
        navigate('/dashboard');
    };

    useEffect(() => {
        // Only fetch if props were not provided
        if (propsRestaurants === undefined) {
            const fetchRestaurants = async () => {
                try {
                    const { data } = await getRestaurants();
                    setRestaurants(data);
                } catch (error) {
                    console.error("Failed to fetch restaurants", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchRestaurants();
        } else {
            setRestaurants(propsRestaurants);
            setLoading(propsLoading);
        }
    }, [propsRestaurants, propsLoading]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-64 bg-gray-900/50 rounded-3xl animate-pulse"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8 max-w-7xl mx-auto">
            {restaurants.map((restaurant) => (
                <motion.div
                    key={restaurant._id}
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="group relative bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl overflow-hidden cursor-pointer hover:border-indigo-500/50"
                    onClick={() => handleSelect(restaurant)}
                >
                    <div className="h-48 relative overflow-hidden">
                        {restaurant.image ? (
                            <img
                                src={restaurant.image}
                                alt={restaurant.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center">
                                <h2 className="text-3xl font-black text-white/10 uppercase tracking-widest">{restaurant.name}</h2>
                            </div>
                        )}
                        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 border border-white/10">
                            <StarIcon className="w-4 h-4 text-yellow-500" />
                            <span className="text-xs font-bold text-white">{restaurant.rating || '4.5'}</span>
                        </div>
                    </div>

                    <div className="p-6">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                            {restaurant.name}
                        </h3>

                        <p className="text-sm text-gray-400 mb-4 line-clamp-2 h-10">
                            {restaurant.description || 'Experience the finest dining with our curated menu.'}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4" />
                                <span>20-30 min</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPinIcon className="w-4 h-4" />
                                <span className="truncate max-w-[100px]">{restaurant.address?.split(',')[0] || '1.2 miles'}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                                {(restaurant.cuisine || 'Restaurant').split(',').slice(0, 2).map(tag => (
                                    <span key={tag} className="text-[10px] uppercase font-black tracking-wider px-2 py-1 bg-white/5 rounded-md text-gray-500">
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
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
