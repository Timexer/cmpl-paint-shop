export const dialogueData = {
    parts_delivery: {
        opening: [
            "Hello Darek, BYD Parts Department here. How can I help you today?",
            "Good morning CMPL. I have the inventory system open. What do you need to check?",
            "Hi Darek. Ready to check stock availability. Which part number are you looking for?"
        ],
        answer: [
            "Checking... Okay, I see that number. It is scheduled to arrive Next Tuesday.",
            "Let me look. Yes, stock is confirmed. It will be at your shop Next Tuesday.",
            "Found it. That catalog number is in transit. Expect it Next Tuesday."
        ]
    },
    jotform_status: {
        opening: [
            "Hi Darek. I am quite busy today. Is there something urgent regarding the estimates?",
            "Hello. I haven't checked the system yet. Do we have pending work?",
            "Good morning. What is the status of the fleet repairs? Are we waiting for me?"
        ],
        answer: [
            "Oh, I did not realize there were 40 of them! I will log into JotForm and approve them now.",
            "Sorry for the delay. I see the notification for 40 cars now. I am clicking approve.",
            "Understood. 40 cars is a lot. I will process the JotForm approvals immediately."
        ]
    },
    invoice_check: {
        opening: [
            "Hello CMPL. Finance Department speaking. How can we assist you?",
            "Hi Darek. We are processing payments today. Do you have a question about a bill?",
            "Good morning. Accounts Payable here. What can I check for you?"
        ],
        answer: [
            "Let me check the ledger... Yes, we received the October invoices yesterday. Payment is scheduled.",
            "Checking... found it. The October paperwork is all here. We will pay it this week.",
            "Yes, I see the email with the October invoices. Everything looks correct."
        ]
    },
    repair_timeline: {
        opening: [
            "Darek, where is my white BYD Seal? You said it would be ready today!",
            "Hello. I am calling about the white BYD. Why is it not finished yet?",
            "Hi. I need my car back. What is happening with the white BYD Seal?"
        ],
        answer: [
            "I understand. If the part is in China, we have no choice. I will wait 2 weeks.",
            "That is frustrating, but I understand logistics. 2 weeks is acceptable.",
            "Okay. If Holland is empty, we must order from China. I agree to the 2 week delay."
        ]
    },
    comm_channel: {
        opening: [
            "Hi Darek. I have the crash photos. I will just WhatsApp them to you, okay?",
            "Hello. I am at the yard. Can I send the documents via WhatsApp? It's faster.",
            "Hi. Is it cool if I forward the order details to your personal WhatsApp?"
        ],
        answer: [
            "Fine. I understand you need it for documentation. I will email them instead.",
            "Okay, policy is policy. I will send everything to your Outlook email.",
            "Understood. Keeping records is important. I am sending an email now."
        ]
    },
    fallbacks: {
        generic_error: [
            "I didn't catch that. Could you please repeat?",
            "Can you be more specific?",
            "I am not sure I understand. Please say again."
        ],
        generic_closer: [
            "Thank you, Darek. Goodbye.",
            "Talk to you later. Bye.",
            "Have a good day."
        ]
    }
};
