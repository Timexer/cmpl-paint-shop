import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { type Message } from '../../hooks/useScenario';

interface ChatWindowProps {
    messages: Message[];
    suggestions: string[];
    onSendMessage: (text: string) => void;
    inputDisabled: boolean;
    inputValue: string;
    setInputValue: (val: string) => void;
    isTyping: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    messages,
    suggestions,
    onSendMessage,
    inputDisabled,
    inputValue,
    setInputValue,
    isTyping
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = () => {
        if (inputValue.trim()) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 relative">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 scroller">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex justify-start mb-4">
                        <div className="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs px-4 py-3 rounded-2xl rounded-bl-none border border-gray-200 dark:border-gray-700 shadow-sm flex items-center">
                            <span className="animate-pulse mr-1">●</span>
                            <span className="animate-pulse mr-1 delay-75">●</span>
                            <span className="animate-pulse delay-150">●</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && !inputDisabled && (
                <div className="px-4 py-2 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 overflow-x-auto whitespace-nowrap flex items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase mr-2 flex-shrink-0">Suggestions:</span>
                    <div className="flex space-x-2">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => setInputValue(s)}
                                className="bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-300 text-xs px-3 py-1 rounded-full border border-orange-200 dark:border-orange-800/50 transition-colors"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            {/* Input Area or Transition Button */}
            <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 shadow-sm z-10 transition-colors">
                {inputDisabled ? (
                    <button
                        onClick={() => onSendMessage("Proceed to Email")}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-transform transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                        <Send className="w-5 h-5 mr-2" />
                        Proceed to Email Task
                    </button>
                ) : (
                    <div className="flex gap-2 max-w-4xl mx-auto">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={inputDisabled}
                            placeholder="Type your response here..."
                            className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-3 text-gray-900 dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400"
                        />
                        <button
                            onClick={handleSend}
                            disabled={inputDisabled || !inputValue.trim()}
                            className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-full w-12 h-12 flex items-center justify-center transition shadow-sm flex-shrink-0"
                        >
                            <Send className="w-5 h-5 ml-1" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
