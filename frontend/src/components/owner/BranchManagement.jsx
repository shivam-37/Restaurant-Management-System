import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import {
    BuildingStorefrontIcon,
    StarIcon,
    MapPinIcon,
    ArrowRightIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import CreateRestaurant from './CreateRestaurant';

const BranchManagement = ({ onSelect }) => {
    const { myRestaurants, setSelectedRestaurant, selectedRestaurant } = useContext(AuthContext);
    const [isCreating, setIsCreating] = useState(false);

    const handleSelect = (restaurant) => {
        setSelectedRestaurant(restaurant);
        if (onSelect) {
            onSelect('Overview');
        }
    };

    if (isCreating) {
        return (
            <div className="relative">
                <button 
                    onClick={() => setIsCreating(false)}
                    className="absolute top-4 right-4 z-50 text-xs font-bold uppercase px-4 py-2 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                    Cancel Creation
                </button>
                <CreateRestaurant onSuccess={() => setIsCreating(false)} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-orange-500/5 p-8 rounded-[2rem] border border-orange-500/10">
                <div>
                    <h2 className="text-2xl font-black tracking-tighter">My Branches</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">
                        Manage your {myRestaurants.length} location(s)
                    </p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-6 py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-600/30 hover:bg-orange-700 transition-all active:scale-95"
                >
                    <PlusIcon className="w-5 h-5" /> Add New Branch
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {myRestaurants.map((restaurant, idx) => {
                    const isSelected = selectedRestaurant?._id === restaurant._id;
                    return (
                        <motion.div
                            key={restaurant._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -8 }}
                            className={`group theme-card border rounded-[2.5rem] overflow-hidden transition-all duration-500 shadow-sm hover:shadow-2xl ${
                                isSelected ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-black/5 hover:border-orange-500'
                            }`}
                        >
                            <div className={`h-2 transition-all duration-500 ${isSelected ? 'bg-orange-500 h-3' : 'bg-gradient-to-r from-orange-600 via-purple-600 to-pink-500 group-hover:h-3'}`}></div>

                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-4 bg-orange-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-orange-500/5">
                                        <BuildingStorefrontIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-4 py-2 rounded-xl border border-black/5">
                                        <StarIcon className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                        <span className="text-sm font-black tracking-tighter">{restaurant.rating || '4.5'}</span>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black tracking-tighter group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors mb-2 leading-none">
                                    {restaurant.name}
                                </h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-8 flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></span>
                                    {restaurant.cuisine || 'Cuisine Type'} {isSelected && '(Active)'}
                                </p>

                                <div className="space-y-4 mb-10">
                                    <div className="flex items-center gap-4 text-sm font-bold opacity-60">
                                        <MapPinIcon className="w-5 h-5 text-orange-500 shrink-0" />
                                        <span className="truncate">{restaurant.address || 'No address provided'}</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleSelect(restaurant);
                                    }}
                                    disabled={isSelected}
                                    className={`w-full flex items-center justify-center gap-3 p-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all transform shadow-xl ${
                                        isSelected 
                                            ? 'bg-black/5 text-black/40 dark:bg-white/5 dark:text-white/40 cursor-not-allowed' 
                                            : 'bg-orange-600 text-white group-active:scale-95 shadow-orange-600/30 hover:bg-orange-700 hover:-translate-y-1'
                                    }`}
                                >
                                    {isSelected ? 'Currently Managing' : 'Switch to Branch'}
                                    {!isSelected && <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-2 transition-transform" />}
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default BranchManagement;
