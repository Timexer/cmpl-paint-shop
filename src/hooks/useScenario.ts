import { useState, useCallback, useRef } from 'react';
import { type Scenario, scenarioDefinitions } from '../data/scenarios';
// import { dialogueData } from '../data/dialogues'; // Unused
import { grammarRules } from '../data/grammarRules';
import { partsScenarioData } from '../data/scenario1';
import { generateDialogue } from '../services/gemini';

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
// Scenario 1 Definition (Now handled via scenarioDefinitions import)
// const scenario1Definition: Scenario = { ... };

export function useScenario() {
    const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
    const [step, setStep] = useState<GameStep>('CHAT');
    const [messages, setMessages] = useState<Message[]>([]);
    const [completedChecks, setCompletedChecks] = useState<Record<string, boolean>>({});
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [systemMessage, setSystemMessage] = useState<string>('');
    const [isTyping, setIsTyping] = useState(false);

    // Scenario 1 State
    const [scenario1State, setScenario1State] = useState<Scenario1State>({
        step: 0,
        activeCurveballId: null,
        outcomeId: null,
        agentName: 'BYD Support'
    });

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initialize Scenario (Random between Standard and Advanced)
    const startNewScenario = useCallback(() => {
        // Clear any pending timeout from previous calls
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // 1. Pick a random scenario from the list
        const randomScenario = scenarioDefinitions[Math.floor(Math.random() * scenarioDefinitions.length)];

        // Reset Common State
        setStep('CHAT');
        setMessages([]);
        setCompletedChecks({});
        setSuggestions([]);

        // Reset Scenario 1 State (regardless of which one we picked, just to be safe)
        setScenario1State({
            step: 0,
            activeCurveballId: null,
            outcomeId: null,
            agentName: 'BYD Support'
        });

        // 2. Set the current scenario
        setCurrentScenario(randomScenario);

        // 3. Initialize Context based on Scenario Type
        if (randomScenario.id === 'parts_delivery') {
            // --- ADVANCED SCENARIO (PARTS) ---
            // Pick random agent name
            // @ts-ignore
            const randomName = partsScenarioData.agentNames ? partsScenarioData.agentNames[Math.floor(Math.random() * partsScenarioData.agentNames.length)] : "Wei Chen";

            setScenario1State({
                step: 1,
                activeCurveballId: null,
                outcomeId: null,
                agentName: randomName
            });

            // Initialize completed checks map for this scenario
            const initialChecks: Record<string, boolean> = {};
            randomScenario.checklists.forEach(c => initialChecks[c.id] = false);
            setCompletedChecks(initialChecks);

            setSystemMessage(`Connected to ${randomName} (${randomScenario.clientName}). Identify the correct part.`);

            // Initial Context (from scenario1.ts data)
            const randomContext = partsScenarioData.contexts[Math.floor(Math.random() * partsScenarioData.contexts.length)];
            timeoutRef.current = setTimeout(() => {
                addMessage('client', randomContext.text, randomName);
                setSuggestions(partsScenarioData.parts.map(p => p.code));
            }, 500);

        } else {
            // --- STANDARD SCENARIO (GENERIC) ---
            // Initialize completed checks map
            const initialChecks: Record<string, boolean> = {};
            randomScenario.checklists.forEach(c => initialChecks[c.id] = false);
            setCompletedChecks(initialChecks);

            setSystemMessage(`Connected to ${randomScenario.clientName}. Checklist active.`);
            setSuggestions(randomScenario.checklists[0].keywords.slice(0, 3)); // Suggest first task keywords

            // Generic Intro
            const intro = randomScenario.introText || `(Incoming Call from ${randomScenario.clientName}) Hello Darek, are you there?`;
            timeoutRef.current = setTimeout(() => {
                addMessage('client', intro, randomScenario.clientName);
            }, 500);
        }
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
            const sender = specificSenderName;
            return [...prev, { id: Date.now().toString() + Math.random(), role, text, senderName: sender }];
        });
    };

    const processUserMessage = (text: string) => {
        if (step !== 'CHAT') return;
        addMessage('user', text, 'You (Darek)');
        const lowerText = text.toLowerCase();

        // Simulate thinking delay
        setTimeout(() => {
            if (currentScenario?.id === 'parts_delivery') {
                processScenario1Logic(lowerText, text); // Pass original text for AI context
            } else {
                processStandardLogic(lowerText, text);
            }
        }, 800);
    };

    // --- STANDARD SCENARIO LOGIC (Generic) ---
    const processStandardLogic = async (lowerText: string, originalText: string) => {
        if (!currentScenario) return;

        let newChecks = { ...completedChecks };
        let checksUpdated = false;
        let allComplete = true;

        // Check against checklists
        currentScenario.checklists.forEach(item => {
            if (!newChecks[item.id]) {
                const match = item.keywords.some(k => lowerText.includes(k.toLowerCase()));
                if (match) {
                    newChecks[item.id] = true;
                    checksUpdated = true;
                }
            }
            if (!newChecks[item.id]) allComplete = false;
        });

        if (checksUpdated) {
            setCompletedChecks(newChecks);
        }

        // Generate Response
        setIsTyping(true);
        const persona = `You are ${currentScenario.clientName}. Context: ${currentScenario.name}.`;
        const instruction = checksUpdated
            ? "The user just completed a checklist item correctly. Acknowledge it briefly and naturaly."
            : "The user is chatting. Respond naturally to their query.";

        try {
            // Check if we need to close
            if (allComplete) {
                const closingInstruction = "All objectives complete. Tell the user to send the email now.";
                const aiResponse = await generateDialogue(persona, closingInstruction, originalText, "Understood. Please send the confirmation email now.");
                addMessage('client', aiResponse, currentScenario.clientName);

                // Force Transition Prompt
                setSystemMessage("Objective Complete. PROCEED TO EMAIL.");
                setSuggestions(["Proceed to Email"]);
            } else {
                const aiResponse = await generateDialogue(persona, instruction, originalText, "I understand.");
                addMessage('client', aiResponse, currentScenario.clientName);

                // Update suggestions to next unchecked item
                const nextItem = currentScenario.checklists.find(c => !newChecks[c.id]);
                if (nextItem) {
                    setSuggestions([nextItem.suggestion]);
                }
            }
        } catch (e) {
            addMessage('client', "Understood.", currentScenario.clientName);
        } finally {
            setIsTyping(false);
        }

        if (allComplete) {
            // Use timeout to allow the final message to be read
            setTimeout(() => {
                setStep('TRANSITION');
            }, 1000);
        }

    };

    // --- SCENARIO 1 LOGIC ---
    const processScenario1Logic = async (lowerText: string, originalText: string) => {
        const s1 = scenario1State;
        let nextState = { ...s1 };
        const newChecks = { ...completedChecks };

        // Helper to add message with correct sender (Async wrapper for AI)
        const reply = async (fallbackText: string, instruction?: string, forceSystemContext?: string) => {
            if (!instruction) {
                // Standard hardcoded reply
                addMessage('client', fallbackText, getSenderName('client', nextState));
                return;
            }

            // AI Generation
            setIsTyping(true);
            const persona = forceSystemContext || `You are ${s1.agentName}, Logistics Support at BYD. Tone: Efficient but professional.`;

            try {
                const aiResponse = await generateDialogue(persona, instruction, originalText, fallbackText);
                addMessage('client', aiResponse, getSenderName('client', nextState));
            } catch (e) {
                addMessage('client', fallbackText, getSenderName('client', nextState));
            } finally {
                setIsTyping(false);
            }
        };

        // Helper for Closing Funnel
        const triggerClosingPhase = async (fallbackText: string, instruction?: string) => {
            await reply(fallbackText, instruction);
            // We need to update state AFTER the async reply
            // Since reply is async, we can't rely on 'nextState' being mutated in place if we were using it for rendering immediately,
            // but here we are setting state at the end.
            // However, 'reply' uses 'nextState' to get sender name.
            // If we change step to 10, sender name might change? No, step 10 is still agent.

            setScenario1State(prev => ({ ...prev, step: 10 }));
            setSystemMessage("Objective Complete. Close the conversation professionally.");
            setSuggestions(["Thank you, noted.", "Thanks for the help.", "Understood, bye."]);
            setCompletedChecks(prev => ({ ...prev, negotiate: true }));
        };

        // STEP 1: Identify Part
        if (s1.step === 1) {
            const matchedPart = partsScenarioData.parts.find(p => lowerText.includes(p.code.toLowerCase()));
            if (matchedPart) {
                // Pick random curveball
                const curveball = partsScenarioData.curveballs[Math.floor(Math.random() * partsScenarioData.curveballs.length)];

                nextState.step = 2;
                nextState.activeCurveballId = curveball.id;
                setScenario1State(nextState); // Update state early for sender name consistency if needed
                setSystemMessage(curveball.hint);
                setSuggestions(curveball.keywords.slice(0, 3));
                newChecks['identify'] = true;
                setCompletedChecks(newChecks);

                await reply(curveball.text, `The user identified the part. You found a discrepancy. Say: "${curveball.text}" but phrase it naturally.`);
            } else {
                await reply("I can't find that code. Please check the catalog (e.g., BYD-FB-2024).", "User provided an invalid code. Ask them to check the catalog for the correct BYD part number.");
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
                setCompletedChecks(newChecks);

                if (outcomeId === "D2") {
                    // The Trap
                    nextState.step = 3;
                    nextState.outcomeId = "D2";
                    setScenario1State(nextState);
                    setSystemMessage("Stock is empty. Accept delay or negotiate?");
                    setSuggestions(["Okay, 2 weeks is fine.", "I can't wait 2 weeks.", "Is there a faster way?"]);

                    await reply(outcome.text, `The user clarified the details. Bad news: Stock is empty. Tell them it's coming from China (2 weeks delay). Ask if they can accept this.`);
                } else {
                    // Success (D1 or D3) -> Closing Funnel
                    await triggerClosingPhase(outcome.text, `The user clarified details. Good news: ${outcome.text}`);
                }
            } else {
                await reply("Could you clarify that? " + (curveball?.hint || ""), `User response was unclear. Ask them to clarify: ${curveball?.hint}`);
            }
        }
        // STEP 3: React to Bad News (D2)
        else if (s1.step === 3) {
            const acceptKeywords = ["ok", "fine", "wait", "standard", "agree", "accept"];
            const rejectKeywords = ["no", "cant", "can't", "long", "urgent", "alternative", "faster", "quick"];

            if (acceptKeywords.some(k => lowerText.includes(k)) && !rejectKeywords.some(k => lowerText.includes(k))) {
                // User accepts delay immediately
                await triggerClosingPhase("Understood. 2 weeks it is. I'll process the order.", "User accepted the delay. Confirm the order for standard shipment (2 weeks).");
            } else if (rejectKeywords.some(k => lowerText.includes(k))) {
                nextState.step = 4;
                setScenario1State(nextState);
                setSystemMessage("Air Freight costs +35%. You need authorization.");
                setSuggestions(["Let's do Air Freight.", "Can we ask Mr. Nowak?", "Actually, I'll wait."]);

                await reply(partsScenarioData.negotiation.offer_tradeoff, "User rejected the delay. Offer 'Air Freight' (4-5 days) but emphasize it costs +35% premium. You cannot authorize this yourself.");
            } else {
                await reply("I need a decision. Wait 2 weeks or look for alternatives?", "User was unclear. Ask them to decide: Wait 2 weeks or look for alternatives?");
            }
        }
        // STEP 4: The Authority Block (Negotiation)
        else if (s1.step === 4) {
            const authKeywords = ["approve", "do it", "send it", "decision", "authorize", "pay", "air", "freight"];
            const managerKeywords = ["nowak", "manager", "boss", "ask him", "connect"];
            const backDownKeywords = ["accept", "delay", "wait", "standard", "nevermind", "cancel"];

            // PATH A: The Missing Link (User accepts the delay after seeing price)
            if (backDownKeywords.some(k => lowerText.includes(k))) {
                await triggerClosingPhase("Understood. The cost is high, so we will stick to the standard shipment (2 weeks). I've booked it.", "User decided to wait (standard shipment) to avoid the cost. Confirm the booking for 2 weeks.");
            }
            // PATH C: User Escalates (The Hero Path)
            else if (managerKeywords.some(k => lowerText.includes(k))) {
                addMessage('system', "CONNECTING FLEET MANAGER...", "System");
                setTimeout(async () => {
                    // Update state to step 5 for Mr. Nowak persona
                    setScenario1State(prev => ({ ...prev, step: 5 }));
                    setSystemMessage("Justify the cost to Mr. Nowak.");
                    setSuggestions(["The customer is furious.", "It protects our reputation."]);

                    // We need to call reply AFTER state update, but state update is async-ish in React (batched).
                    // However, inside timeout, it's a new tick.
                    // We can force the persona context.

                    const nowakIntro = partsScenarioData.negotiation.nowak_intro.replace(/<br>/g, '\n').replace(/<b>/g, '').replace(/<\/b>/g, '');
                    setIsTyping(true);
                    try {
                        const aiResponse = await generateDialogue(
                            "You are Mr. Nowak, the Fleet Manager. Tone: Strict, business-focused, demanding justification.",
                            "The user wants Air Freight (+35%). Ask them to justify this cost. Is it critical?",
                            originalText,
                            nowakIntro
                        );
                        addMessage('client', aiResponse, "Mr. Nowak (Fleet Mgr)");
                    } catch (e) {
                        addMessage('client', nowakIntro, "Mr. Nowak (Fleet Mgr)");
                    } finally {
                        setIsTyping(false);
                    }
                }, 1000);
                return;
            }
            // PATH B: User tries to self-approve (The Block)
            else if (authKeywords.some(k => lowerText.includes(k))) {
                await reply(partsScenarioData.negotiation.block_authority, "User tried to approve the cost themselves. Block them. Say you need the Fleet Manager (Mr. Nowak) to approve this amount.");
            } else {
                await reply("Please be clear: Do we 'accept the delay' or should I 'ask Mr. Nowak'?", "User was unclear. Ask: Do they want to accept the delay or ask Mr. Nowak?");
            }
        }
        // STEP 5: The Boss Level
        else if (s1.step === 5) {
            const validReasons = ["customer", "impatient", "reputation", "angry", "wait", "service", "brand"];
            if (validReasons.some(k => lowerText.includes(k))) {
                await triggerClosingPhase(partsScenarioData.negotiation.nowak_approval, "User gave a good reason (reputation/customer). Approve the Air Freight. Tell them to close the ticket.");
            } else {
                await reply("That's not a good enough reason to spend +35%. Give me a business reason (e.g. Reputation).", "User's reason was weak. Demand a better business reason (like Reputation or Customer Satisfaction) to justify the cost.", "You are Mr. Nowak, the Fleet Manager. Tone: Strict.");
            }
        }
        // STEP 10: The Universal Closer
        else if (s1.step === 10) {
            // User has typed "Thanks" or "Bye"
            await reply("You're welcome, Darek. Have a good day.", "User said goodbye. Respond professionally and wish them a good day.");
            finishScenario1();
        }
    };

    const finishScenario1 = () => {
        setTimeout(() => {
            setStep('TRANSITION');
            setSystemMessage('Step 3: Send a formal follow-up email to close the ticket.');
        }, 1000);
    };

    const handleTransition = (text: string) => {
        if (text === "Proceed to Email" || text.toLowerCase().includes("email")) {
            setStep('EMAIL');
            return;
        }

        addMessage('user', text, 'You (Darek)');
        setTimeout(() => {
            addMessage('client', "Please send the email now.", 'System');
            setTimeout(() => {
                setStep('EMAIL');
            }, 1000);
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
    // const getFallback = ... (removed as unused)

    return {
        currentScenario,
        step,
        messages,
        completedChecks,
        suggestions,
        systemMessage,
        isTyping,
        startNewScenario,
        processUserMessage,
        handleTransition,
        validateEmail
    };
}
