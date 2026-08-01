import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithAi } from '../services/api';
import {
    ChatBubbleLeftRightIcon,
    XMarkIcon,
    PaperAirplaneIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

const ChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm your AI assistant powered by Llama 3.1. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input.trim() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const { data } = await chatWithAi(newMessages);
            let replyContent = data.reply;
            if (replyContent.includes('<think>') && replyContent.includes('</think>')) {
                replyContent = replyContent.replace(/<think>[\s\S]*?<\/think>\n?/g, '');
            }
            setMessages(prev => [...prev, { role: 'assistant', content: replyContent }]);
        } catch (error) {
            console.error("AI Chat Error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'm sorry, I encountered an error connecting to the AI. Please make sure the API key is configured correctly in the backend."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-8 right-8 z-[100] p-4 rounded-2xl shadow-2xl bg-gradient-to-r from-rose-600 to-purple-600 text-white flex items-center justify-center shadow-rose-600/30 border border-white/20 backdrop-blur-sm ${isOpen ? 'hidden' : ''}`}
            >
                <div className="relative">
                    <ChatBubbleLeftRightIcon className="w-8 h-8" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                </div>
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[100] w-[calc(100vw-32px)] sm:w-[400px] h-[600px] max-h-[85vh] flex flex-col theme-card rounded-[2rem] shadow-2xl shadow-rose-500/10 border border-black/5 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 bg-gradient-to-b from-rose-500/5 to-transparent border-b border-black/5 relative backdrop-blur-xl z-10">
                            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent"></div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-600/20">
                                    <SparklesIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-black uppercase tracking-tighter text-lg leading-none">Dine AI</h3>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-rose-500 mt-1">Powered by Llama 3.1</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2.5 opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chat Messages Log */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-rose-500/20 relative z-0">
                            {messages.map((msg, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    key={index}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] rounded-[1.5rem] px-5 py-4 text-sm font-medium leading-relaxed shadow-sm ${
                                        msg.role === 'user'
                                        ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-tr-sm shadow-rose-600/20'
                                        : 'theme-card-item border border-black/5 rounded-tl-sm'
                                        }`}>
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="theme-card-item border border-black/5 rounded-[1.5rem] rounded-tl-sm px-5 py-4 shadow-sm">
                                        <div className="flex gap-1.5 items-center h-5">
                                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce"></span>
                                            <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-100"></span>
                                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce delay-200"></span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-6 border-t border-black/5 bg-gradient-to-t from-black/5 dark:from-white/5 to-transparent relative z-10 backdrop-blur-xl">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Message Dine AI..."
                                    className="w-full theme-card-item border border-black/10 dark:border-white/10 rounded-2xl px-6 py-4 pr-14 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:opacity-40"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 p-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-20 disabled:hover:bg-rose-600 transition-all shadow-lg shadow-rose-600/20 active:scale-95"
                                >
                                    <PaperAirplaneIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatAssistant;
