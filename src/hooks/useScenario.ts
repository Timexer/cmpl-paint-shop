import { useState, useCallback } from 'react';
import { type Scenario } from '../data/scenarios';
import { dialogueData } from '../data/dialogues';
import { grammarRules } from '../data/grammarRules';
import { partsScenarioData } from '../data/scenario1';

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

// Scenario 1 Specific State
interface Scenario1State {
    step: number; // 0-5
    activeCurveballId: string | null;
    outcomeId: string | null;
}

// Define Scenario 1 metadata for the Sidebar
const scenario1Definition: Scenario = {
    id: 'parts_ordering_advanced',
    name: 'Parts Ordering (Advanced)',
    clientName: 'BYD Logistics / Fleet Mgr',
    checklists: [
        {
            id: 'identify',
            text: "Identify the Part",
            keywords: [], // Logic handled manually
            suggestion: "I need to check availability for [Code]."
        },
        {
            id: 'curveball',
            text: "Clarify Details (Qty/VIN/Loc)",
            keywords: [],
            suggestion: "Confirm the details requested."
        },
        {
            id: 'negotiate',
            text: "Negotiate / Confirm Delivery",
            keywords: [],
            suggestion: "Negotiate for faster delivery if needed."
        }
    ],
    hints: {
        identify: "Ask for the catalog number.",
        curveball: "Answer the specific question asked.",
        negotiate: "Don't accept long delays without checking alternatives."
    },
    emailTask: {
        subjectHint: "Order Confirmation / Escalation",
        requiredKeywords: ["confirmed", "order"],
        instruction: "Write a professional email confirming the final arrangement."
    }
};

export function useScenario() {
    const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
    const [step, setStep] = useState<GameStep>('CHAT');
    const [messages, setMessages] = useState<Message[]>([]);
    const [completedChecks, setCompletedChecks] = useState<Record<string, boolean>>({});
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [systemMessage, setSystemMessage] = useState<string>('');

    // Scenario 1 State
    const [scenario1State, setScenario1State] = useState<Scenario1State>({ step: 0, activeCurveballId: null, outcomeId: null });

    // Initialize Scenario 1 exclusively
    const startNewScenario = useCallback(() => {
        // Reset State
        setStep('CHAT');
        setMessages([]);
        setScenario1State({ step: 1, activeCurveballId: null, outcomeId: null });
        setCompletedChecks({ identify: false, curveball: false, negotiate: false });

        // Set Scenario Definition for UI
        setCurrentScenario(scenario1Definition);
        setSystemMessage('Mission: Identify the correct part and negotiate delivery.');

        // Initial Context
        const randomContext = partsScenarioData.contexts[Math.floor(Math.random() * partsScenarioData.contexts.length)];
        setTimeout(() => {
            addMessage('client', randomContext.text);
            setSuggestions(partsScenarioData.parts.map(p => p.code));
        }, 500);
    }, []);

    const addMessage = (role: 'user' | 'client' | 'system', text: string) => {
        setMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), role, text }]);
    };

    const processUserMessage = (text: string) => {
        if (step !== 'CHAT') return;
        addMessage('user', text);
        const lowerText = text.toLowerCase();

        // Simulate thinking delay
        setTimeout(() => {
            processScenario1Logic(lowerText);
        }, 800);
    };

    // --- SCENARIO 1 LOGIC ---
    const processScenario1Logic = (lowerText: string) => {
        const s1 = scenario1State;
        let nextState = { ...s1 };
        const newChecks = { ...completedChecks };

        // STEP 1: Identify Part
        if (s1.step === 1) {
            const matchedPart = partsScenarioData.parts.find(p => lowerText.includes(p.code.toLowerCase()));
            if (matchedPart) {
                // Pick random curveball
                const curveball = partsScenarioData.curveballs[Math.floor(Math.random() * partsScenarioData.curveballs.length)];
                addMessage('client', curveball.text);
                nextState.step = 2;
                nextState.activeCurveballId = curveball.id;
                setSystemMessage(curveball.hint);
                setSuggestions(curveball.keywords.slice(0, 3)); // Simple suggestion

                // Mark first objective complete
                newChecks['identify'] = true;
            } else {
                addMessage('client', "I can't find that code. Please check the catalog (e.g., BYD-FB-2024).");
            }
        }
        // STEP 2: Handle Curveball
        else if (s1.step === 2) {
            const curveball = partsScenarioData.curveballs.find(c => c.id === s1.activeCurveballId);
            if (curveball && curveball.keywords.some(k => lowerText.includes(k))) {
                // Determine Outcome (Randomly pick D1, D2, or D3)
                const outcomes = ["D1", "D2", "D3"];
                const outcomeId = outcomes[Math.floor(Math.random() * outcomes.length)];
                // @ts-ignore
                const outcome = partsScenarioData.outcomes[outcomeId];

                addMessage('client', outcome.text);

                // Mark second objective complete
                newChecks['curveball'] = true;

                if (outcomeId === "D2") {
                    // The Trap
                    nextState.step = 3;
                    nextState.outcomeId = "D2";
                    setSystemMessage("Stock is empty. Accept delay or negotiate?");
                    setSuggestions(["Okay, 2 weeks is fine.", "I can't wait 2 weeks.", "Is there a faster way?"]);
                } else {
                    // Success (D1 or D3)
                    newChecks['negotiate'] = true;
                    finishScenario1();
                }
            } else {
                addMessage('client', "Could you clarify that? " + (curveball?.hint || ""));
            }
        }
        // STEP 3: React to Bad News (D2)
        else if (s1.step === 3) {
            const acceptKeywords = ["ok", "fine", "wait", "standard", "agree", "accept"];
            const rejectKeywords = ["no", "cant", "can't", "long", "urgent", "alternative", "faster", "quick"];

            if (acceptKeywords.some(k => lowerText.includes(k)) && !rejectKeywords.some(k => lowerText.includes(k))) {
                addMessage('client', "Understood. 2 weeks it is. I'll process the order.");
                newChecks['negotiate'] = true;
                finishScenario1();
            } else if (rejectKeywords.some(k => lowerText.includes(k))) {
                addMessage('client', partsScenarioData.negotiation.offer_tradeoff);
                nextState.step = 4;
                setSystemMessage("Air Freight costs +35%. You need authorization.");
                setSuggestions(["Let's do Air Freight.", "Can we ask Mr. Nowak?"]);
            } else {
                addMessage('client', "I need a decision. Wait 2 weeks or look for alternatives?");
            }
        }
        // STEP 4: The Authority Block
        else if (s1.step === 4) {
            const authKeywords = ["approve", "do it", "send it", "decision", "authorize", "pay"];
            const managerKeywords = ["nowak", "manager", "boss", "ask him", "connect"];

            if (managerKeywords.some(k => lowerText.includes(k))) {
                // Escalation
                addMessage('system', "CONNECTING FLEET MANAGER...");
                setTimeout(() => {
                    addMessage('client', partsScenarioData.negotiation.nowak_intro.replace(/<br>/g, '\n').replace(/<b>/g, '').replace(/<\/b>/g, ''));
                    nextState.step = 5;
                    setSystemMessage("Justify the cost to Mr. Nowak.");
                    setSuggestions(["The customer is furious.", "It protects our reputation."]);
                    setScenario1State(nextState); // Update state here to avoid race condition in timeout
                }, 1000);
                return; // Exit to let timeout handle state update
            } else if (authKeywords.some(k => lowerText.includes(k))) {
                addMessage('client', partsScenarioData.negotiation.block_authority);
            } else {
                addMessage('client', "I can't proceed without proper approval. Ask Mr. Nowak or accept the delay.");
            }
        }
        // STEP 5: The Boss Level
        else if (s1.step === 5) {
            const validReasons = ["customer", "impatient", "reputation", "angry", "wait", "service", "brand"];
            if (validReasons.some(k => lowerText.includes(k))) {
                addMessage('client', partsScenarioData.negotiation.nowak_approval);
                newChecks['negotiate'] = true;
                finishScenario1();
            } else {
                addMessage('client', "That's not a good enough reason to spend +35%. Give me a business reason (e.g. Reputation).");
            }
        }

        setScenario1State(nextState);
        setCompletedChecks(newChecks);
    };

    const finishScenario1 = () => {
        setTimeout(() => {
            setSystemMessage('Step 2: Close the conversation professionally.');
            setSuggestions(["Thank you.", "Best regards."]);
            setStep('TRANSITION');
        }, 1000);
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
        const styleErrors: string[] = [];
        const fullText = subject + " " + body;

        if (subject.length < 5 || body.length < 15) {
            return { isValid: false, errors: ["Too short. Please write a complete professional email."], missingKeywords: [] };
        }

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

        setStep('COMPLETE');
        setSystemMessage("SCENARIO COMPLETE! Click 'New Scenario' to restart.");
        return { isValid: true, errors: [], missingKeywords: [] };
    };

    // Helpers
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
