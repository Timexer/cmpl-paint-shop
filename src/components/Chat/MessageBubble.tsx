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
                "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm flex flex-col items-start transition-colors",
                isUser ? "bg-orange-600 text-white rounded-br-none" : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-none"
            )}>
                {/* Sender Name */}
                <div className="flex items-center mb-1 opacity-80 text-xs font-bold uppercase tracking-wider">
                    <div className="mr-2">
                        {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    </div>
                    {message.senderName || (isUser ? 'You' : 'System')}
                </div>

                {/* Message Text */}
                <div>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
            </div>
        </motion.div>
    );
};
