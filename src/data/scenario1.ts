export const partsScenarioData = {
    // F. AGENT NAMES (Randomized for variety)
    agentNames: [
        "Wei Chen", "Li Zhang", "Jun Liu", "Min Wang",
        "Tao Yang", "Yan Zhao", "Lei Huang", "Jing Wu",
        "Hui Zhou", "Fang Xu"
    ],

    // A. CORE PARTS
    parts: [
        { id: "A1", name: "Front Bumper", code: "BYD-FB-2024" },
        { id: "A2", name: "Rear Left Door", code: "BYD-RLD-889" },
        { id: "A3", name: "Windshield", code: "BYD-WS-115" },
        { id: "A4", name: "Headlight Assembly", code: "BYD-HL-LED-04" },
        { id: "A5", name: "Side Mirror L", code: "BYD-SM-L-22" },
        { id: "A6", name: "Radiator Grille", code: "BYD-RG-Sport-X" },
        { id: "A7", name: "Rear Bumper", code: "BYD-RB-Sen-09" },
        { id: "A8", name: "Fender Liner", code: "BYD-FL-Right" },
        { id: "A9", name: "Hood Latch", code: "BYD-HL-Mech-01" },
        { id: "A10", name: "Tailgate Strut", code: "BYD-TS-Pwr" }
    ],

    // B. CLIENT CONTEXTS (The 'Why')
    contexts: [
        { id: "B1", text: "Hi Darek. Responding to your ticket. Which catalog number do you need me to check availability for?" },
        { id: "B2", text: "Darek, quick heads up—the truck leaves in 10 minutes. If you need that part added, I need the catalog number NOW." },
        { id: "B3", text: "Hi. We saw your report that we sent the wrong item yesterday. What is the CORRECT catalog number you need for the replacement?" }
    ],

    // C. CURVEBALLS (The 'Wait, check this')
    curveballs: [
        {
            id: "C1",
            text: "Got the code. My screen lists the order as **1 unit**. Is that correct, or do you need **2**?",
            keywords: ["1", "one", "2", "two", "quantity", "confirm", "units"],
            hint: "Confirm the quantity (1 or 2)."
        },
        {
            id: "C2",
            text: "Hold on. There are two variants (Sport vs Std). Please give me the **last 4 digits of the VIN** to verify.",
            keywords: ["vin", "8842", "1234", "9999", "number"],
            hint: "Provide a VIN (e.g. 8842)."
        },
        {
            id: "C3",
            text: "Found it. Quickly—is this going to the **Piaseczno** shop or **Praga**?",
            keywords: ["piaseczno", "praga", "warsaw", "mszczonow", "location", "shop"],
            hint: "Choose a location."
        }
    ],

    // D. OUTCOMES (The Result)
    outcomes: {
        "D1": { text: "Perfect. It's booked. Arrival is confirmed for **next Friday**.", type: "success" },
        "D3": { text: "Lucky day. We actually have a spare in Warsaw. It will arrive **tomorrow morning**.", type: "success" },

        // D2 IS THE TRAP
        "D2": {
            text: "Unfortunately, stock is empty in EU. It's coming from Shenzhen, China (**2 weeks delay**). Can you accept this?",
            type: "negotiation"
        }
    },

    // E. NEGOTIATION SCRIPT (Only for D2)
    negotiation: {
        // Step 1: Logistics offers trade-off
        offer_tradeoff: "I understand. The only alternative is **Air Freight** (4-5 days), but this adds a **35% cost premium**.",

        // Step 2: Darek tries to accept/approve cost himself (The Block)
        block_authority: "Darek, I can't take your authorization for a premium that high. I need the **Fleet Manager (Mr. Nowak)** to approve it. Please ask him.",

        // Step 3: Mr. Nowak enters
        nowak_intro: "<b>[SYSTEM: CONNECTING FLEET MANAGER...]</b><br><br>Darek, I'm Mr. Nowak. Logistics says you want Air Freight (+35%). Before I pay that, **justify it**. Is the car blocking the line, or is the customer just impatient?",

        // Step 4: Success
        nowak_approval: "Understood. Customer reputation is key. I authorize **Air Freight**. I'll email Logistics now."
    }
};
