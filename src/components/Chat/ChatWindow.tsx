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
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    messages,
    suggestions,
    onSendMessage,
    inputDisabled,
    inputValue,
    setInputValue
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
        <div className="flex flex-col h-full bg-gray-50 relative">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && !inputDisabled && (
                <div className="px-4 py-2 bg-white border-t border-gray-100 overflow-x-auto whitespace-nowrap flex items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase mr-2 flex-shrink-0">Suggestions:</span>
                    <div className="flex space-x-2">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => setInputValue(s)}
                                className="bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full border border-orange-200 transition-colors"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="bg-white p-4 border-t border-gray-200 shadow-sm z-10">
                <div className="flex gap-2 max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={inputDisabled}
                        placeholder="Type your response here..."
                        className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition disabled:bg-gray-100 disabled:text-gray-400"
                    />
                    <button
                        onClick={handleSend}
                        disabled={inputDisabled || !inputValue.trim()}
                        className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white rounded-full w-12 h-12 flex items-center justify-center transition shadow-sm flex-shrink-0"
                    >
                        <Send className="w-5 h-5 ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
};
