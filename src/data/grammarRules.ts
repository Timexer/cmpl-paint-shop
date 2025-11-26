export interface GrammarRule {
    pattern: RegExp;
    message: string;
    fix: string;
}

export const grammarRules: GrammarRule[] = [
    { pattern: /\btomorow\b/gi, message: "Spelling", fix: "tomorrow" },
    { pattern: /\brecived\b/gi, message: "Spelling", fix: "received" },
    { pattern: /\brecieved\b/gi, message: "Spelling", fix: "received" },
    { pattern: /\bwich\b/gi, message: "Spelling", fix: "which" },
    { pattern: /\buntill\b/gi, message: "Spelling", fix: "until" },
    { pattern: /\boccured\b/gi, message: "Spelling", fix: "occurred" },
    { pattern: /\bforeward\b/gi, message: "Spelling", fix: "forward" },
    { pattern: /\badress\b/gi, message: "Spelling", fix: "address" },
    { pattern: /\btruely\b/gi, message: "Spelling", fix: "truly" },
    { pattern: /\bbecouse\b/gi, message: "Spelling", fix: "because" },

    { pattern: /\bi\b/g, message: "Capitalization: 'I' is always capitalized.", fix: "I" },
    { pattern: /\bmonday\b/g, message: "Capitalization: Days of the week.", fix: "Monday" },
    { pattern: /\btuesday\b/g, message: "Capitalization: Days of the week.", fix: "Tuesday" },
    { pattern: /\bwednesday\b/g, message: "Capitalization: Days of the week.", fix: "Wednesday" },
    { pattern: /\bthursday\b/g, message: "Capitalization: Days of the week.", fix: "Thursday" },
    { pattern: /\bfriday\b/g, message: "Capitalization: Days of the week.", fix: "Friday" },
    { pattern: /\bjanuary\b/g, message: "Capitalization: Months.", fix: "January" },
    { pattern: /\boctober\b/g, message: "Capitalization: Months.", fix: "October" },
    { pattern: /\bnov(ember)?\b/g, message: "Capitalization: Months.", fix: "November" },

    { pattern: /\b(have|has) send\b/gi, message: "Grammar: Past participle required.", fix: "have sent" },
    { pattern: /\binformation are\b/gi, message: "Grammar: 'Information' is singular.", fix: "information is" },
    { pattern: /\bplease to\b/gi, message: "Grammar: Do not use 'to' after 'Please'.", fix: "please [verb]" },
    { pattern: /\bdiscuss about\b/gi, message: "Grammar: We 'discuss' something, not 'discuss about' it.", fix: "discuss the..." },
    { pattern: /\bwaiting for answer\b/gi, message: "Grammar: Missing article.", fix: "waiting for an answer" },
    { pattern: /\bon next week\b/gi, message: "Grammar: We say 'next week', not 'on next week'.", fix: "next week" },
    { pattern: /\bon last week\b/gi, message: "Grammar: We say 'last week', not 'on last week'.", fix: "last week" },
    { pattern: /\bi sent email\b/gi, message: "Grammar: Missing article.", fix: "I sent the email" },

    { pattern: /\bthx\b/gi, message: "Tone: Too informal for business.", fix: "Thank you" },
    { pattern: /\bpls\b/gi, message: "Tone: Too informal.", fix: "Please" },
    { pattern: /\basap\b/gi, message: "Tone: Can seem rude. Try full words.", fix: "as soon as possible" },
    { pattern: /\bu\b/gi, message: "Tone: Text speak.", fix: "you" },
    { pattern: /\bwanna\b/gi, message: "Tone: Slang.", fix: "want to" },
    { pattern: /\bgonna\b/gi, message: "Tone: Slang.", fix: "going to" },
    { pattern: /\bi want\b/gi, message: "Tone: A bit too direct.", fix: "I would like" },
    { pattern: /\bgive me\b/gi, message: "Tone: Too direct/imperative.", fix: "Could you please give me" },
    { pattern: /\s+(?=[.,;:?!])/g, message: "Punctuation: No space before comma/period.", fix: "Remove space" },

    {
        pattern: /\b(bitch|fuck|shit|ass|idiot|stupid|hell|damn|crap)\b/gi,
        message: "🚨 Professionalism: Inappropriate language for a business email.",
        fix: "Remove offensive term"
    },
    {
        pattern: /\b(hate|kill|die|fire)\b/gi,
        message: "Tone: This language is too aggressive.",
        fix: "Use professional language"
    },

    {
        pattern: /\b[a-z]+[A-Z][a-zA-Z]*\b/g,
        message: "Mechanics: Fix the capitalization inside this word.",
        fix: "lowercase"
    },
    {
        pattern: /\b(jotform|byd|cmpl)\b/g,
        message: "Capitalization: Proper nouns/Brand names must be capitalized.",
        fix: "Capitalize (e.g., JotForm)"
    }
];
