import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

const PremiumModal = ({ isOpen, onClose, quote, author, message }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="relative w-full max-w-md bg-[#1a1c23] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden p-8 flex flex-col items-center text-center"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Animated Checkmark */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 20,
                                delay: 0.2
                            }}
                            className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6"
                        >
                            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                        </motion.div>

                        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                            Payment Successful
                        </h2>
                        
                        <p className="text-gray-400 mb-8 font-medium">
                            {message || "Thank you for your order! It has been securely placed."}
                        </p>

                        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-8" />

                        {/* Quote Box */}
                        <div className="w-full bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
                            <p className="text-emerald-400 font-serif italic text-lg mb-3">
                                "{quote || "Good food is the foundation of genuine happiness."}"
                            </p>
                            <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">
                                — {author || "Auguste Escoffier"}
                            </p>
                        </div>

                        {/* Action Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            className="mt-8 w-full py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/25 transition-all"
                        >
                            Continue
                        </motion.button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PremiumModal;
