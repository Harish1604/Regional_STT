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
