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
        { role: 'assistant', content: "Hello! I'm your AI assistant powered by NVIDIA Qwen. How can I help you today?" }
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

            // Clean up thinking tags from Qwen if they appear, as they can bulk up the response 
            // The model generates <thought> tags but it may be better to strip them or display nicely
            // Let's strip <think>...</think> tags if they exist.
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
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-8 right-8 z-50 p-4 rounded-full shadow-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center ${isOpen ? 'hidden' : ''}`}
            >
                <div className="relative">
                    <ChatBubbleLeftRightIcon className="w-8 h-8" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                    </span>
                </div>
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: "spring", bounce: 0.3 }}
                        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 w-[calc(100vw-32px)] sm:w-[380px] h-[550px] sm:h-[600px] max-h-[80vh] flex flex-col bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <SparklesIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white leading-tight">AI Assistant</h3>
                                    <p className="text-xs text-indigo-400 font-medium">Powered by Qwen</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Chat Messages Log */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/50 scrollbar-thin scrollbar-thumb-gray-800">
                            {messages.map((msg, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={index}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-sm'
                                        : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-tl-sm'
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
                                    <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
                                        <div className="flex gap-1 items-center h-5">
                                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-100"></span>
                                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-200"></span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-4 bg-gray-900 border-t border-gray-800">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your message..."
                                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-full px-5 py-3 pr-12 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder-gray-500"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
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
