import { useState, useCallback } from 'react';
import { type Scenario, scenarioDefinitions } from '../data/scenarios';
import { dialogueData } from '../data/dialogues';
import { grammarRules } from '../data/grammarRules';

export type GameStep = 'CHAT' | 'TRANSITION' | 'EMAIL' | 'COMPLETE';

export interface Message {
    id: string;
    role: 'user' | 'client' | 'system';
    text: string;
}

export interface EmailFeedback {
    isValid: boolean;
    errors: string[];
    missingKeywords: string[];
}

export function useScenario() {
    const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
    const [step, setStep] = useState<GameStep>('CHAT');
    const [messages, setMessages] = useState<Message[]>([]);
    const [completedChecks, setCompletedChecks] = useState<Record<string, boolean>>({});
    const [lastHintId, setLastHintId] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [systemMessage, setSystemMessage] = useState<string>('');

    // Initialize a random scenario
    const startNewScenario = useCallback(() => {
        const randomScenario = scenarioDefinitions[Math.floor(Math.random() * scenarioDefinitions.length)];
        setCurrentScenario(randomScenario);
        setStep('CHAT');
        setMessages([]);
        setCompletedChecks(
            randomScenario.checklists.reduce((acc, item) => ({ ...acc, [item.id]: false }), {})
        );
        setLastHintId(null);
        setSystemMessage('Mission: Complete the objectives in the left panel.');

        // Initial bot message
        setTimeout(() => {
            const opening = getVariation(randomScenario.id, 'opening');
            addMessage('client', opening);
            updateSuggestions(randomScenario, {});
        }, 500);
    }, []);

    const addMessage = (role: 'user' | 'client' | 'system', text: string) => {
        setMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), role, text }]);
    };

    const processUserMessage = (text: string) => {
        if (!currentScenario || step !== 'CHAT') return;

        addMessage('user', text);
        const lowerText = text.toLowerCase();

        // Simulate thinking delay
        setTimeout(() => {
            let newlyCompleted = false;
            let negationTriggered = false;
            const newChecks = { ...completedChecks };

            currentScenario.checklists.forEach(check => {
                if (!newChecks[check.id]) {
                    let match = check.keywords.some(k => lowerText.includes(k));

                    // Contextual confirmation for hints
                    if (!match && lastHintId === check.id) {
                        const confirmationWords = ["yes", "yeah", "correct", "right", "sure"];
                        if (confirmationWords.some(w => lowerText.includes(w))) {
                            match = true;
                        }
                    }

                    if (match) {
                        newChecks[check.id] = true;
                        newlyCompleted = true;
                    }
                }
            });

            setCompletedChecks(newChecks);

            // Check for negation in specific scenario
            if (currentScenario.id === 'comm_channel') {
                const negationWords = ["no", "nope", "cant", "can't", "don't", "dont", "not"];
                if (negationWords.some(w => lowerText === w || lowerText.startsWith(w + " "))) {
                    negationTriggered = true;
                }
            }

            // Determine response
            const allComplete = currentScenario.checklists.every(c => newChecks[c.id]);

            if (allComplete) {
                const answer = getVariation(currentScenario.id, 'answer');
                addMessage('client', answer);
                setSystemMessage('Step 2: Close the conversation professionally.');
                setSuggestions(["Thank you.", "Best regards.", "Have a nice day."]);
                setStep('TRANSITION');
            } else {
                const missingItem = currentScenario.checklists.find(c => !newChecks[c.id]);
                let responseText = "";

                if (newlyCompleted && missingItem) {
                    responseText = "Okay, I got that part. But... " + (currentScenario.hints[missingItem.id] || "can you clarify?");
                } else if (negationTriggered && currentScenario.id === 'comm_channel') {
                    responseText = "Okay, if not WhatsApp, what is the best way to send these photos?";
                } else {
                    responseText = getFallback('generic_error') + " " + (missingItem ? (currentScenario.hints[missingItem.id] || "") : "");
                }

                if (missingItem) setLastHintId(missingItem.id);
                addMessage('client', responseText);
                updateSuggestions(currentScenario, newChecks);
            }
        }, 800);
    };

    const handleTransition = (text: string) => {
        addMessage('user', text);
        setTimeout(() => {
            addMessage('client', getFallback('generic_closer'));
            setTimeout(() => {
                setStep('EMAIL');
                setSystemMessage('Step 3: Send a formal follow-up email to close the ticket.');
            }, 1500);
        }, 800);
    };

    const validateEmail = (subject: string, body: string): EmailFeedback => {
        if (!currentScenario) return { isValid: false, errors: [], missingKeywords: [] };

        const styleErrors: string[] = [];
        const fullText = subject + " " + body;

        // Sanity
        if (subject.length < 5 || body.length < 15) {
            return { isValid: false, errors: ["Too short. Please write a complete professional email."], missingKeywords: [] };
        }

        // Style & Grammar
        if (!subject.trim()) styleErrors.push("🚨 Critical: You must write a Subject line.");
        else if (['hi', 'hello'].includes(subject.toLowerCase().trim())) {
            styleErrors.push("💡 Style: Subject should be descriptive.");
        }

        if (!/^\s*(Dear|Hi|Hello|Good morning|Good afternoon)/i.test(body)) {
            styleErrors.push("💡 Structure: Start with a greeting.");
        }

        if (!/(regards|sincerely|thank|cheers|best)/i.test(body.slice(-100))) {
            styleErrors.push("💡 Structure: End with a sign-off.");
        }

        if (/^[a-z]/.test(body.trim())) {
            styleErrors.push("🔠 Mechanics: Start first sentence with capital letter.");
        }

        grammarRules.forEach(rule => {
            if (rule.pattern.test(fullText)) {
                const errorMsg = `⚠️ ${rule.message} (Try: "${rule.fix}")`;
                if (!styleErrors.includes(errorMsg)) styleErrors.push(errorMsg);
            }
        });

        if (styleErrors.length > 0) {
            return { isValid: false, errors: styleErrors, missingKeywords: [] };
        }

        // Content Check
        const lowerFullText = fullText.toLowerCase();
        const missingKeywords = currentScenario.emailTask.requiredKeywords.filter(k => !lowerFullText.includes(k));

        if (missingKeywords.length > 0) {
            return { isValid: false, errors: [`You missed key details: "${missingKeywords.join(", ")}"`], missingKeywords };
        }

        setStep('COMPLETE');
        setSystemMessage("SCENARIO COMPLETE! Click 'New Scenario' to restart.");
        return { isValid: true, errors: [], missingKeywords: [] };
    };

    const updateSuggestions = (scenario: Scenario, checks: Record<string, boolean>) => {
        const missing = scenario.checklists
            .filter(item => !checks[item.id])
            .map(item => item.suggestion);
        setSuggestions(missing);
    };

    // Helpers
    const getVariation = (id: string, type: 'opening' | 'answer') => {
        // @ts-ignore
        const options = dialogueData[id]?.[type];
        return options ? options[Math.floor(Math.random() * options.length)] : "Error";
    };

    const getFallback = (type: 'generic_error' | 'generic_closer') => {
        const options = dialogueData.fallbacks[type];
        return options[Math.floor(Math.random() * options.length)];
    };

    return {
        currentScenario,
        step,
        messages,
        completedChecks,
        suggestions,
        systemMessage,
        startNewScenario,
        processUserMessage,
        handleTransition,
        validateEmail
    };
}
