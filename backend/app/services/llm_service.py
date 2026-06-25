"""
LLM Service abstraction layer.
Supports multiple providers: Gemini (default), OpenAI, Ollama.
The active provider is selected via the LLM_PROVIDER env variable.
"""

import time
from abc import ABC, abstractmethod

from app.config import settings
from app.prompts.system_prompts import get_system_prompt, get_domain_prompt
from app.utils.logger import get_logger

log = get_logger(__name__)


class BaseLLMService(ABC):
    """Abstract base class for LLM services."""

    @abstractmethod
    def generate_reply(
        self,
        message: str,
        language: str,
        history: list[dict],
    ) -> dict:
        """
        Generate a reply to the user's message.

        Args:
            message: The user's transcript text.
            language: ISO 639-1 language code.
            history: List of past messages [{"role": "user"|"assistant", "text": "..."}].

        Returns:
            dict with keys:
                - reply: str
                - latency_ms: int
        """
        pass

    def _build_messages(
        self, message: str, language: str, history: list[dict]
    ) -> tuple[str, list[dict]]:
        """
        Build the system prompt and message list for the LLM.

        Returns:
            (system_prompt, messages_list)
        """
        system_prompt = get_system_prompt(language)
        domain_addition = get_domain_prompt(language)
        if domain_addition:
            system_prompt += "\n\n" + domain_addition

        # Build messages from history
        messages = []
        for item in history:
            role = item.get("role", "user")
            text = item.get("text", "")
            if role in ("user", "assistant") and text:
                messages.append({"role": role, "content": text})

        # Add current message
        messages.append({"role": "user", "content": message})

        return system_prompt, messages


class GeminiLLMService(BaseLLMService):
    """Google Gemini LLM service implementation."""

    def __init__(self):
        self.model_name = settings.gemini_model
        self.client = None
        self._init_client()

    def _init_client(self):
        """Initialize the Gemini client."""
        try:
            from google import genai

            self.client = genai.Client(api_key=settings.gemini_api_key)
            log.info(f"Gemini client initialized with model: {self.model_name}")
        except ImportError:
            log.error("google-genai package not installed. Run: pip install google-genai")
            raise
        except Exception as e:
            log.error(f"Failed to initialize Gemini client: {e}")
            raise

    def generate_reply(
        self,
        message: str,
        language: str,
        history: list[dict],
    ) -> dict:
        """Generate a reply using Google Gemini."""
        start_time = time.time()

        system_prompt, messages = self._build_messages(message, language, history)

        log.info(
            f"LLM request | provider: gemini | model: {self.model_name} | "
            f"language: {language} | message_length: {len(message)}"
        )

        try:
            from google.genai import types

            # Build contents for Gemini
            contents = []
            for msg in messages:
                role = "user" if msg["role"] == "user" else "model"
                contents.append(
                    types.Content(
                        role=role,
                        parts=[types.Part.from_text(text=msg["content"])],
                    )
                )

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.7,
                    max_output_tokens=1024,
                ),
            )

            reply = response.text.strip() if response.text else ""
            latency_ms = int((time.time() - start_time) * 1000)

            log.info(
                f"LLM response | latency: {latency_ms}ms | "
                f"reply_length: {len(reply)}"
            )

            return {"reply": reply, "latency_ms": latency_ms}

        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            log.error(f"Gemini LLM failed after {latency_ms}ms: {e}")
            raise RuntimeError(f"LLM generation failed: {e}") from e


class OpenAILLMService(BaseLLMService):
    """OpenAI LLM service implementation."""

    def __init__(self):
        self.model_name = settings.openai_model
        self.client = None
        self._init_client()

    def _init_client(self):
        """Initialize the OpenAI client."""
        try:
            from openai import OpenAI

            self.client = OpenAI(api_key=settings.openai_api_key)
            log.info(f"OpenAI client initialized with model: {self.model_name}")
        except ImportError:
            log.error("openai package not installed. Run: pip install openai")
            raise

    def generate_reply(
        self,
        message: str,
        language: str,
        history: list[dict],
    ) -> dict:
        """Generate a reply using OpenAI."""
        start_time = time.time()

        system_prompt, messages = self._build_messages(message, language, history)

        log.info(
            f"LLM request | provider: openai | model: {self.model_name} | "
            f"language: {language}"
        )

        try:
            openai_messages = [{"role": "system", "content": system_prompt}]
            for msg in messages:
                openai_messages.append(
                    {"role": msg["role"], "content": msg["content"]}
                )

            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=openai_messages,
                temperature=0.7,
                max_tokens=1024,
            )

            reply = response.choices[0].message.content.strip()
            latency_ms = int((time.time() - start_time) * 1000)

            log.info(f"LLM response | latency: {latency_ms}ms")

            return {"reply": reply, "latency_ms": latency_ms}

        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            log.error(f"OpenAI LLM failed after {latency_ms}ms: {e}")
            raise RuntimeError(f"LLM generation failed: {e}") from e


class OllamaLLMService(BaseLLMService):
    """Ollama (local) LLM service implementation."""

    def __init__(self):
        self.model_name = settings.ollama_model
        self.base_url = settings.ollama_base_url
        log.info(
            f"Ollama service initialized: {self.base_url} | "
            f"model: {self.model_name}"
        )

    def generate_reply(
        self,
        message: str,
        language: str,
        history: list[dict],
    ) -> dict:
        """Generate a reply using Ollama."""
        import requests

        start_time = time.time()

        system_prompt, messages = self._build_messages(message, language, history)

        log.info(
            f"LLM request | provider: ollama | model: {self.model_name} | "
            f"language: {language}"
        )

        try:
            ollama_messages = [{"role": "system", "content": system_prompt}]
            for msg in messages:
                ollama_messages.append(
                    {"role": msg["role"], "content": msg["content"]}
                )

            response = requests.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": self.model_name,
                    "messages": ollama_messages,
                    "stream": False,
                },
                timeout=60,
            )
            response.raise_for_status()
            data = response.json()

            reply = data.get("message", {}).get("content", "").strip()
            latency_ms = int((time.time() - start_time) * 1000)

            log.info(f"LLM response | latency: {latency_ms}ms")

            return {"reply": reply, "latency_ms": latency_ms}

        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            log.error(f"Ollama LLM failed after {latency_ms}ms: {e}")
            raise RuntimeError(f"LLM generation failed: {e}") from e


def create_llm_service() -> BaseLLMService:
    """
    Factory function to create the configured LLM service.
    Reads LLM_PROVIDER from settings.
    """
    provider = settings.llm_provider.lower()

    if provider == "gemini":
        return GeminiLLMService()
    elif provider == "openai":
        return OpenAILLMService()
    elif provider == "ollama":
        return OllamaLLMService()
    else:
        raise ValueError(
            f"Unknown LLM provider: '{provider}'. "
            f"Supported: 'gemini', 'openai', 'ollama'"
        )
