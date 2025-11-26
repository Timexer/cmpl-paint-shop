const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function generateDialogue(
    systemContext: string,
    taskInstruction: string,
    userMessage: string,
    fallbackText: string
): Promise<string> {

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        console.warn("Gemini API Key missing. Using fallback.");
        return fallbackText;
    }

    const fullPrompt = `
        SYSTEM INSTRUCTIONS:
        ${systemContext}
        
        CURRENT INTERACTION:
        User (Darek) said: "${userMessage || '(Conversation Start)'}"
        
        YOUR TASK:
        ${taskInstruction}
        
        REMEMBER:
        - Keep it under 40 words.
        - Sound natural, not robotic.
        - Do not output quotes around the text.
    `;

    const requestBody = {
        contents: [{
            parts: [{ text: fullPrompt }]
        }]
    };

    try {
        const response = await fetch(`${API_URL}?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text.trim();
        } else {
            console.error("API Error: No candidates returned", data);
            return fallbackText;
        }
    } catch (error) {
        console.error("Network/API Error:", error);
        return fallbackText;
    }
}
