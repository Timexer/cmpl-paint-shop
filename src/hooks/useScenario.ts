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
    senderName?: string;
}

export interface EmailFeedback {
    isValid: boolean;
    errors: string[];
    missingKeywords: string[];
}

// Scenario 1 Specific State
interface Scenario1State {
    step: number; // 0-5, 10 (Closing)
    activeCurveballId: string | null;
    outcomeId: string | null;
    agentName: string;
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
    const [scenario1State, setScenario1State] = useState<Scenario1State>({
        step: 0,
        activeCurveballId: null,
        outcomeId: null,
        agentName: 'BYD Support'
    });

    // Initialize Scenario 1 exclusively
    const startNewScenario = useCallback(() => {
        // Pick random agent name
        // @ts-ignore
        const randomName = partsScenarioData.agentNames ? partsScenarioData.agentNames[Math.floor(Math.random() * partsScenarioData.agentNames.length)] : "Wei Chen";

        // Reset State
        setStep('CHAT');
        setMessages([]);
        setScenario1State({
            step: 1,
            activeCurveballId: null,
            outcomeId: null,
            agentName: randomName
        });
        setCompletedChecks({ identify: false, curveball: false, negotiate: false });

        // Set Scenario Definition for UI
        setCurrentScenario(scenario1Definition);
        setSystemMessage(`Connected to ${randomName} (BYD Logistics). Identify the correct part.`);

        // Initial Context
        const randomContext = partsScenarioData.contexts[Math.floor(Math.random() * partsScenarioData.contexts.length)];
        setTimeout(() => {
            addMessage('client', randomContext.text, randomName);
            setSuggestions(partsScenarioData.parts.map(p => p.code));
        }, 500);
    }, []);

    const getSenderName = (role: 'user' | 'client' | 'system', s1State: Scenario1State) => {
        if (role === 'user') return 'You (Darek)';
        if (role === 'system') return 'System';

        // If we are in the Boss Level (Step 5)
        if (s1State.step === 5) {
            return 'Mr. Nowak (Fleet Mgr)';
        }

        // Otherwise, use the randomized agent name
        return `${s1State.agentName} (BYD Support)`;
    };

    const addMessage = (role: 'user' | 'client' | 'system', text: string, specificSenderName?: string) => {
        setMessages(prev => {
            // We need to access the current state here, but since we are inside a state setter, 
            // we can't easily access the *other* state (scenario1State).
            // So we rely on the caller passing specificSenderName OR we use a default if not provided.
            // Ideally, we should pass the current state to addMessage or use a ref.
            // For simplicity, we will calculate it based on the *current* render's state, 
            // which might be slightly off if called immediately after a state set, but usually fine for chat.
            // BETTER: Pass the name explicitly from the logic function.

            const sender = specificSenderName;
            return [...prev, { id: Date.now().toString() + Math.random(), role, text, senderName: sender }];
        });
    };

    const processUserMessage = (text: string) => {
        if (step !== 'CHAT') return;
        // For user message, we don't need to pass sender name, the UI or getSenderName logic can handle it, 
        // but let's be consistent with the new interface.
        addMessage('user', text, 'You (Darek)');
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

        // Helper to add message with correct sender
        const reply = (text: string) => {
            addMessage('client', text, getSenderName('client', nextState));
        };

        // Helper for Closing Funnel
        const triggerClosingPhase = (aiResponse: string) => {
            reply(aiResponse);
            nextState.step = 10;
            setSystemMessage("Objective Complete. Close the conversation professionally.");
            setSuggestions(["Thank you, noted.", "Thanks for the help.", "Understood, bye."]);
            newChecks['negotiate'] = true; // Ensure final check is marked
        };

        // STEP 1: Identify Part
        if (s1.step === 1) {
            const matchedPart = partsScenarioData.parts.find(p => lowerText.includes(p.code.toLowerCase()));
            if (matchedPart) {
                // Pick random curveball
                const curveball = partsScenarioData.curveballs[Math.floor(Math.random() * partsScenarioData.curveballs.length)];
                reply(curveball.text);
                nextState.step = 2;
                nextState.activeCurveballId = curveball.id;
                setSystemMessage(curveball.hint);
                setSuggestions(curveball.keywords.slice(0, 3));
                newChecks['identify'] = true;
            } else {
                reply("I can't find that code. Please check the catalog (e.g., BYD-FB-2024).");
            }
        }
        // STEP 2: Handle Curveball
        else if (s1.step === 2) {
            const curveball = partsScenarioData.curveballs.find(c => c.id === s1.activeCurveballId);
            if (curveball && curveball.keywords.some(k => lowerText.includes(k))) {
                // Determine Outcome
                const outcomes = ["D1", "D2", "D3"];
                const outcomeId = outcomes[Math.floor(Math.random() * outcomes.length)];
                // @ts-ignore
                const outcome = partsScenarioData.outcomes[outcomeId];

                newChecks['curveball'] = true;

                if (outcomeId === "D2") {
                    // The Trap
                    reply(outcome.text);
                    nextState.step = 3;
                    nextState.outcomeId = "D2";
                    setSystemMessage("Stock is empty. Accept delay or negotiate?");
                    setSuggestions(["Okay, 2 weeks is fine.", "I can't wait 2 weeks.", "Is there a faster way?"]);
                } else {
                    // Success (D1 or D3) -> Closing Funnel
                    triggerClosingPhase(outcome.text);
                }
            } else {
                reply("Could you clarify that? " + (curveball?.hint || ""));
            }
        }
        // STEP 3: React to Bad News (D2)
        else if (s1.step === 3) {
            const acceptKeywords = ["ok", "fine", "wait", "standard", "agree", "accept"];
            const rejectKeywords = ["no", "cant", "can't", "long", "urgent", "alternative", "faster", "quick"];

            if (acceptKeywords.some(k => lowerText.includes(k)) && !rejectKeywords.some(k => lowerText.includes(k))) {
                // User accepts delay immediately
                triggerClosingPhase("Understood. 2 weeks it is. I'll process the order.");
            } else if (rejectKeywords.some(k => lowerText.includes(k))) {
                reply(partsScenarioData.negotiation.offer_tradeoff);
                nextState.step = 4;
                setSystemMessage("Air Freight costs +35%. You need authorization.");
                setSuggestions(["Let's do Air Freight.", "Can we ask Mr. Nowak?", "Actually, I'll wait."]);
            } else {
                reply("I need a decision. Wait 2 weeks or look for alternatives?");
            }
        }
        // STEP 4: The Authority Block (Negotiation)
        else if (s1.step === 4) {
            const authKeywords = ["approve", "do it", "send it", "decision", "authorize", "pay", "air", "freight"];
            const managerKeywords = ["nowak", "manager", "boss", "ask him", "connect"];
            const backDownKeywords = ["accept", "delay", "wait", "standard", "nevermind", "cancel"];

            // PATH A: The Missing Link (User accepts the delay after seeing price)
            if (backDownKeywords.some(k => lowerText.includes(k))) {
                triggerClosingPhase("Understood. The cost is high, so we will stick to the standard shipment (2 weeks). I've booked it.");
            }
            // PATH C: User Escalates (The Hero Path)
            else if (managerKeywords.some(k => lowerText.includes(k))) {
                addMessage('system', "CONNECTING FLEET MANAGER...", "System");
                setTimeout(() => {
                    // We need to update state to step 5 BEFORE sending the message so getSenderName works correctly
                    // But we are in a timeout. We can manually pass the sender name.
                    addMessage('client', partsScenarioData.negotiation.nowak_intro.replace(/<br>/g, '\n').replace(/<b>/g, '').replace(/<\/b>/g, ''), "Mr. Nowak (Fleet Mgr)");

                    // We need to trigger a state update here.
                    // Since we can't easily access the latest 'nextState' variable from the outer scope in this timeout if we just use setScenario1State,
                    // we should be careful. 
                    // Actually, we can just update the state.
                    setScenario1State(prev => ({ ...prev, step: 5 }));
                    setSystemMessage("Justify the cost to Mr. Nowak.");
                    setSuggestions(["The customer is furious.", "It protects our reputation."]);
                }, 1000);

                // We return here to avoid the setScenario1State(nextState) at the bottom overwriting the timeout's intent
                // But we need to make sure 'nextState' isn't used.
                // Actually, let's just update nextState here and NOT return, but we need the timeout for the effect.
                // Let's use the timeout only for the message, and update state immediately? 
                // No, the message needs to appear after "CONNECTING".
                // Let's just return and let the timeout handle the state update.
                return;
            }
            // PATH B: User tries to self-approve (The Block)
            else if (authKeywords.some(k => lowerText.includes(k))) {
                reply(partsScenarioData.negotiation.block_authority);
            } else {
                reply("Please be clear: Do we 'accept the delay' or should I 'ask Mr. Nowak'?");
            }
        }
        // STEP 5: The Boss Level
        else if (s1.step === 5) {
            const validReasons = ["customer", "impatient", "reputation", "angry", "wait", "service", "brand"];
            if (validReasons.some(k => lowerText.includes(k))) {
                triggerClosingPhase(partsScenarioData.negotiation.nowak_approval);
            } else {
                reply("That's not a good enough reason to spend +35%. Give me a business reason (e.g. Reputation).");
            }
        }
        // STEP 10: The Universal Closer
        else if (s1.step === 10) {
            // User has typed "Thanks" or "Bye"
            reply("You're welcome, Darek. Have a good day.");
            finishScenario1();
        }

        setScenario1State(nextState);
        setCompletedChecks(newChecks);
    };

    const finishScenario1 = () => {
        setTimeout(() => {
            setStep('TRANSITION');
            setSystemMessage('Step 3: Send a formal follow-up email to close the ticket.');
        }, 1000);
    };

    const handleTransition = (text: string) => {
        addMessage('user', text, 'You (Darek)');
        setTimeout(() => {
            addMessage('client', getFallback('generic_closer'), 'System'); // Or just keep it simple
            setTimeout(() => {
                setStep('EMAIL');
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
