export interface ChecklistItem {
    id: string;
    text: string;
    keywords: string[];
    suggestion: string;
}

export interface Scenario {
    id: string;
    name: string;
    clientName: string;
    checklists: ChecklistItem[];
    hints: Record<string, string>;
    emailTask: {
        subjectHint: string;
        requiredKeywords: string[];
        instruction: string;
    };
    introText?: string;
}

export const scenarioDefinitions: Scenario[] = [
    {
        id: 'parts_delivery',
        name: 'Parts Ordering',
        clientName: "BYD Parts Dept",
        checklists: [
            {
                id: 'cat_num',
                text: "Provide Catalog Number (BYD-FB-2024)",
                keywords: ["byd", "fb", "2024", "number"],
                suggestion: "I need to check availability for BYD-FB-2024."
            },
            {
                id: 'ask_date',
                text: "Ask for 'Delivery Date'",
                keywords: ["when", "date", "arrive", "delivery", "time"],
                suggestion: "When will it be delivered?"
            }
        ],
        hints: { cat_num: "What is the part number?", ask_date: "Ask when it arrives." },
        emailTask: {
            subjectHint: "Order Confirmation: BYD-FB-2024",
            requiredKeywords: ["confirmed", "tuesday", "order"],
            instruction: "Write an email to your team confirming the part arrives Next Tuesday."
        }
    },
    {
        id: 'jotform_status',
        name: 'JotForm Follow-up',
        clientName: "BYD Regional Manager",
        checklists: [
            {
                id: 'platform',
                text: "Mention 'JotForm'",
                keywords: ["jotform", "system", "app"],
                suggestion: "Please check JotForm."
            },
            {
                id: 'quantity',
                text: "Mention '40 pending cars'",
                keywords: ["40", "forty", "cars", "estimates"],
                suggestion: "We have 40 estimates waiting."
            },
            {
                id: 'action',
                text: "Ask to 'Approve'",
                keywords: ["approve", "accept", "confirm", "sign"],
                suggestion: "Please approve them so we can start."
            }
        ],
        hints: { platform: "Which system?", quantity: "How many?", action: "What do you need me to do?" },
        emailTask: {
            subjectHint: "Urgent: 40 Approvals",
            requiredKeywords: ["approved", "40", "jotform"],
            instruction: "Send a 'Written Confirmation' email summarizing that he agreed to approve the cars."
        },
        introText: "Hello Darek. I'm looking at the system and I see a lot of pending estimates. We need to move these."
    },
    {
        id: 'invoice_check',
        name: 'Invoice Verification',
        clientName: "BYD Finance Dept",
        checklists: [
            {
                id: 'doc_type',
                text: "Mention 'October Invoices'",
                keywords: ["invoice", "bill", "october"],
                suggestion: "Did you receive the October invoices?"
            },
            {
                id: 'action',
                text: "Ask if 'Received/Processed'",
                keywords: ["receive", "get", "process", "status"],
                suggestion: "Have they been processed?"
            }
        ],
        hints: { doc_type: "Which invoices?", action: "What do you want to know?" },
        emailTask: {
            subjectHint: "Payment Status: October",
            requiredKeywords: ["received", "processed", "october"],
            instruction: "Write an email to your boss confirming BYD has received the invoices."
        },
        introText: "Hi Darek. Just doing our monthly reconciliation. I'm missing confirmation on the last batch of documents."
    },
    {
        id: 'repair_timeline',
        name: 'Repair Timeline',
        clientName: "Impatient Client",
        checklists: [
            {
                id: 'location',
                text: "Explain 'Part is in China'",
                keywords: ["china", "asia", "abroad"],
                suggestion: "The part is currently in China."
            },
            {
                id: 'warehouse',
                text: "Mention 'Not in Holland'",
                keywords: ["holland", "netherlands", "europe", "stock"],
                suggestion: "There is no stock in the Holland warehouse."
            },
            {
                id: 'delay',
                text: "Give Timeline (2 Weeks)",
                keywords: ["2 weeks", "two weeks", "14 days"],
                suggestion: "It will take 2 weeks to arrive."
            }
        ],
        hints: { location: "Where is the part?", warehouse: "Is it in Europe?", delay: "How long?" },
        emailTask: {
            subjectHint: "Delay Notification: White BYD",
            requiredKeywords: ["china", "2 weeks", "delay"],
            instruction: "Send a formal delay notification email to the client."
        },
        introText: "Hello? Is this Darek? I've been waiting for my white BYD for three days. Where is the part?"
    },
    {
        id: 'comm_channel',
        name: 'Communication Platform',
        clientName: "BYD Representative",
        checklists: [
            {
                id: 'refusal',
                text: "Refuse 'WhatsApp'",
                keywords: ["no", "not", "prefer", "better", "instead"],
                suggestion: "Please do not use WhatsApp."
            },
            {
                id: 'method',
                text: "Request 'Email'",
                keywords: ["email", "mail", "outlook"],
                suggestion: "Please send it via Email."
            },
            {
                id: 'reason',
                text: "Reason: 'Documentation'",
                keywords: ["document", "record", "history", "file", "policy"],
                suggestion: "We need it for documentation purposes."
            }
        ],
        hints: { refusal: "Is WhatsApp okay?", method: "What should I use?", reason: "Why email?" },
        emailTask: {
            subjectHint: "Communication Policy",
            requiredKeywords: ["email", "documentation", "policy"],
            instruction: "Write a polite email confirming that all future files must be sent via email."
        },
        introText: "Hi. I'm sending you the photos via WhatsApp now. Is that okay? It's much faster for me."
    }
];
