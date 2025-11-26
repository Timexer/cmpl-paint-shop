import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Terminal } from 'lucide-react';
import { clsx } from 'clsx';
import { type Message } from '../../hooks/useScenario';

export const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    if (isSystem) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center my-2"
            >
                <div className="bg-yellow-50 text-yellow-800 text-xs px-3 py-1 rounded-full border border-yellow-200 flex items-center shadow-sm">
                    <Terminal className="w-3 h-3 mr-2" />
                    {message.text}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: isUser ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={clsx(
                "flex w-full mb-4",
                isUser ? "justify-end" : "justify-start"
            )}
        >
            <div className={clsx(
                "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm flex items-start",
                isUser ? "bg-orange-600 text-white rounded-br-none" : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
            )}>
                <div className="mt-1 mr-3 flex-shrink-0">
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
            </div>
        </motion.div>
    );
};
