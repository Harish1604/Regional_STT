"""
Configurable system prompts for the LLM layer.
Designed to be easily swapped for domain-specific use cases
(e.g., real-estate voice bot) in future versions.
"""

# Mapping of language codes to full language names
LANGUAGE_NAMES = {
    "ta": "Tamil (தமிழ்)",
    "hi": "Hindi (हिन्दी)",
    "te": "Telugu (తెలుగు)",
    "ml": "Malayalam (മലയാളം)",
    "kn": "Kannada (ಕನ್ನಡ)",
    "bn": "Bengali (বাংলা)",
    "gu": "Gujarati (ગુજરાતી)",
    "mr": "Marathi (मराठी)",
    "pa": "Punjabi (ਪੰਜਾਬੀ)",
    "ur": "Urdu (اردو)",
    "as": "Assamese (অসমীয়া)",
    "or": "Odia (ଓଡ଼ିଆ)",
    "sa": "Sanskrit (संस्कृतम्)",
    "ne": "Nepali (नेपाली)",
    "sd": "Sindhi (سنڌي)",
    "kok": "Konkani (कोंकणी)",
    "doi": "Dogri (डोगरी)",
    "mai": "Maithili (मैथिली)",
    "sat": "Santali (ᱥᱟᱱᱛᱟᱲᱤ)",
    "ks": "Kashmiri (कॉशुर)",
    "mni": "Manipuri (ꯃꯤꯇꯩꯂꯣꯟ)",
    "brx": "Bodo (बड़ो)",
    "en": "English",
}


def get_language_name(code: str) -> str:
    """Get the full language name for a language code."""
    return LANGUAGE_NAMES.get(code, code)


def get_system_prompt(language: str) -> str:
    """
    Generate a system prompt that instructs the LLM to:
    1. Reply in the same language as the user
    2. Be concise and conversational
    3. Never translate to English unless asked

    Args:
        language: ISO 639-1 language code (e.g., 'ta', 'hi')

    Returns:
        System prompt string for the LLM.
    """
    lang_name = get_language_name(language)

    return f"""You are a helpful, friendly multilingual assistant designed for Indian language speakers.

CRITICAL LANGUAGE RULES:
- The user is speaking in {lang_name} (language code: {language}).
- You MUST reply ENTIRELY in {lang_name}.
- Use the native script of {lang_name} for your response.
- Do NOT translate to English unless the user explicitly asks for English.
- Do NOT mix English words unnecessarily. Use natural {lang_name} vocabulary.

CONVERSATION STYLE:
- Be concise and conversational.
- Keep responses helpful but not overly long.
- Be warm, polite, and culturally appropriate.
- If you don't understand something, ask for clarification in {lang_name}.
- Use simple, everyday language that is easy to understand.

CONTEXT:
- This is a voice-based interaction. The user's message was transcribed from speech.
- There may be minor transcription errors — try to understand the intent.
- Reply naturally as if having a spoken conversation."""


def get_translation_prompt(source_lang: str, target_lang: str) -> str:
    """
    Generate a few-shot translation prompt.
    Includes worked examples per language to ground the model and prevent
    hallucination. Critical for llama3 which struggles with zero-shot
    Indian language translation.

    Args:
        source_lang: ISO 639-1 source language code
        target_lang: ISO 639-1 target language code

    Returns:
        Translation prompt string with few-shot examples.
    """
    src_name = get_language_name(source_lang)
    tgt_name = get_language_name(target_lang)

    # Few-shot examples per source language
    examples = _get_translation_examples(source_lang, target_lang)
    examples_text = ""
    for ex in examples:
        examples_text += f"\n{src_name}: {ex['src']}\n{tgt_name}: {ex['tgt']}\n"

    return f"""You are a multilingual translation agent for Indian regional language speech transcripts.

The input may be in Tamil, Hindi, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Odia, Assamese, Urdu, or a code-mixed combination with English.

Your task is to translate the transcript into {tgt_name}. Output ONLY the translated text and absolutely nothing else.

Rules:
- Preserve the original meaning exactly.
- Do not answer the user.
- Do not summarize.
- Do not explain.
- Preserve names, places, dates, numbers, IDs, addresses, and domain-specific terms unless they clearly have a standard English translation.
- If the transcript is colloquial spoken language, rewrite it as natural English without changing meaning.
- If English words are already present, keep them naturally in the sentence.
- If the input is code-mixed, translate only the non-English parts while preserving the full intended meaning.
- If any phrase is ambiguous, translate conservatively and do not invent missing content.
- Output the translation as raw text only. No markdown. No extra text. No conversational filler.

Examples:{examples_text}
Now translate this:
Transcript:"""


# ---- Few-shot translation examples per language ----

_TRANSLATION_EXAMPLES = {
    "ta": {
        "en": [
            {"src": "வணக்கம் எப்படி இருக்கீங்க", "tgt": "Hello, how are you?"},
            {"src": "நான் காலையில சாப்பிட்டேன்", "tgt": "I ate in the morning"},
            {"src": "நாளைக்கு ட்ரெயின்ல போகணும்", "tgt": "I need to go by train tomorrow"},
            {"src": "நாளைக்கு எனக்கு பர்த்டே", "tgt": "Tomorrow is my birthday"},
            {"src": "டிரான்ஸ்லேஷன் ஒழுங்காக ஒர்க் ஆகலாது", "tgt": "The translation is not working properly"},
        ],
    },
    "hi": {
        "en": [
            {"src": "नमस्ते आप कैसे हैं", "tgt": "Hello, how are you?"},
            {"src": "मैंने सुबह खाना खाया", "tgt": "I ate food in the morning"},
            {"src": "कल मुझे ट्रेन से जाना है", "tgt": "I have to go by train tomorrow"},
        ],
    },
    "te": {
        "en": [
            {"src": "నమస్కారం మీరు ఎలా ఉన్నారు", "tgt": "Hello, how are you?"},
            {"src": "నేను ఉదయం తిన్నాను", "tgt": "I ate in the morning"},
            {"src": "రేపు ట్రైన్ లో వెళ్ళాలి", "tgt": "I need to go by train tomorrow"},
        ],
    },
    "ml": {
        "en": [
            {"src": "നമസ്കാരം സുഖമാണോ", "tgt": "Hello, how are you?"},
            {"src": "ഞാൻ രാവിലെ കഴിച്ചു", "tgt": "I ate in the morning"},
            {"src": "നാളെ ട്രെയിനിൽ പോകണം", "tgt": "I need to go by train tomorrow"},
        ],
    },
    "kn": {
        "en": [
            {"src": "ನಮಸ್ಕಾರ ಹೇಗಿದ್ದೀರಿ", "tgt": "Hello, how are you?"},
            {"src": "ನಾನು ಬೆಳಿಗ್ಗೆ ತಿಂದೆ", "tgt": "I ate in the morning"},
            {"src": "ನಾಳೆ ಟ್ರೈನ್ ನಲ್ಲಿ ಹೋಗಬೇಕು", "tgt": "I need to go by train tomorrow"},
        ],
    },
    "bn": {
        "en": [
            {"src": "নমস্কার কেমন আছেন", "tgt": "Hello, how are you?"},
            {"src": "আমি সকালে খেয়েছি", "tgt": "I ate in the morning"},
            {"src": "কাল ট্রেনে যেতে হবে", "tgt": "I have to go by train tomorrow"},
        ],
    },
    "gu": {
        "en": [
            {"src": "નમસ્તે કેમ છો", "tgt": "Hello, how are you?"},
            {"src": "મેં સવારે ખાધું", "tgt": "I ate in the morning"},
            {"src": "કાલે ટ્રેનમાં જવું છે", "tgt": "I need to go by train tomorrow"},
        ],
    },
    "mr": {
        "en": [
            {"src": "नमस्कार कसे आहात", "tgt": "Hello, how are you?"},
            {"src": "मी सकाळी जेवलो", "tgt": "I ate in the morning"},
            {"src": "उद्या ट्रेनने जायचे आहे", "tgt": "I have to go by train tomorrow"},
        ],
    },
    "pa": {
        "en": [
            {"src": "ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਕਿਵੇਂ ਹੋ", "tgt": "Hello, how are you?"},
            {"src": "ਮੈਂ ਸਵੇਰੇ ਖਾਣਾ ਖਾਧਾ", "tgt": "I ate food in the morning"},
            {"src": "ਕੱਲ੍ਹ ਟ੍ਰੇਨ ਨਾਲ ਜਾਣਾ ਹੈ", "tgt": "I have to go by train tomorrow"},
        ],
    },
    "ur": {
        "en": [
            {"src": "السلام علیکم آپ کیسے ہیں", "tgt": "Hello, how are you?"},
            {"src": "میں نے صبح کھانا کھایا", "tgt": "I ate food in the morning"},
            {"src": "کل ٹرین سے جانا ہے", "tgt": "I have to go by train tomorrow"},
        ],
    },
}


def _get_translation_examples(
    source_lang: str, target_lang: str
) -> list[dict]:
    """
    Get few-shot examples for a language pair.
    Falls back to generic examples if the pair isn't defined.
    """
    lang_examples = _TRANSLATION_EXAMPLES.get(source_lang, {})
    examples = lang_examples.get(target_lang, [])

    if not examples:
        # Fallback: generic examples
        return [
            {"src": "(greeting)", "tgt": "Hello, how are you?"},
        ]

    return examples


def get_domain_prompt(language: str, domain: str = "general") -> str:
    """
    Get a domain-specific prompt. Currently only 'general' is implemented.
    This is the extension point for adding domain-specific behavior
    (e.g., real-estate, healthcare, education).

    Args:
        language: ISO 639-1 language code
        domain: Domain identifier (default: 'general')

    Returns:
        Domain-specific prompt addition.
    """
    domain_prompts = {
        "general": "",
        # Future domains can be added here:
        # "real_estate": """
        # You are a real-estate assistant helping users find properties,
        # understand pricing, and navigate the home buying process.
        # You have expertise in Indian real estate markets.
        # """,
    }

    return domain_prompts.get(domain, "")
