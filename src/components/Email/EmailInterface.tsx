import React, { useState } from 'react';
import { Mail, Send, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { type EmailFeedback } from '../../hooks/useScenario';

interface EmailInterfaceProps {
    clientName: string;
    instruction: string;
    onSend: (subject: string, body: string) => EmailFeedback;
}

export const EmailInterface: React.FC<EmailInterfaceProps> = ({ clientName, instruction, onSend }) => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [feedback, setFeedback] = useState<EmailFeedback | null>(null);
    const [isSent, setIsSent] = useState(false);

    const handleSend = () => {
        const result = onSend(subject, body);
        setFeedback(result);
        if (result.isValid) {
            setIsSent(true);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col h-full bg-white dark:bg-gray-900 p-6 md:p-8 overflow-y-auto"
        >
            <div className="border-b dark:border-gray-800 pb-4 mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                    <Mail className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" />
                    Step 3: Follow-up Email
                </h2>
                <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800/50 font-medium" title={instruction}>
                    <Info className="w-3 h-3 inline mr-1" />
                    {instruction}
                </span>
            </div>

            <div className="space-y-5 flex-1 flex flex-col max-w-3xl mx-auto w-full">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">To:</label>
                    <input
                        type="text"
                        value={clientName}
                        disabled
                        className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-600 dark:text-gray-300 font-medium"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Subject:</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        disabled={isSent}
                        placeholder="Type subject here..."
                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-50 dark:disabled:bg-gray-800/50 disabled:text-gray-500 dark:text-white dark:placeholder-gray-500"
                    />
                </div>

                <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Body:</label>
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        disabled={isSent}
                        placeholder="Dear..."
                        className="w-full h-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition disabled:bg-gray-50 dark:disabled:bg-gray-800/50 disabled:text-gray-500 dark:text-white dark:placeholder-gray-500 font-sans"
                    />
                </div>

                <button
                    onClick={handleSend}
                    disabled={isSent}
                    className={`w-full py-3.5 rounded-lg font-bold text-white shadow-md transition flex items-center justify-center ${isSent
                        ? 'bg-green-600 cursor-default'
                        : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 active:scale-[0.99]'
                        }`}
                >
                    {isSent ? (
                        <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Email Sent Successfully
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5 mr-2" />
                            Send Email
                        </>
                    )}
                </button>

                {/* Feedback Area */}
                {feedback && !feedback.isValid && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-4"
                    >
                        <div className="flex items-start">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-red-800 dark:text-red-200 text-sm mb-1">Please fix the following issues:</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-red-700 dark:text-red-300">
                                    {feedback.errors.map((err, i) => (
                                        <li key={i}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                )}

                {isSent && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg p-4 text-center"
                    >
                        <p className="text-green-800 dark:text-green-200 font-bold text-lg">
                            <CheckCircle className="w-6 h-6 inline mr-2 mb-1" />
                            Scenario Complete!
                        </p>
                        <p className="text-green-700 dark:text-green-300 text-sm mt-1">Great job documenting the interaction.</p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};
