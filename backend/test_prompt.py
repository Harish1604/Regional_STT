import json
import requests
from app.prompts.system_prompts import get_translation_prompt, get_language_name

source_language = "ta"
target_language = "en"
text = "நாளைக்கு எனக்கு பர்த்டே உனக்கு இன்னைக்கு பர்த்டே சொல்ல முடியுமா"

system_prompt = get_translation_prompt(source_language, target_language)
full_prompt = f"{system_prompt}\n\n{text}"

response = requests.post(
    "http://localhost:11434/api/generate",
    json={
        "model": "llama3",
        "prompt": full_prompt,
        "stream": False,
        "format": "json",
        "options": {
            "num_predict": 256,
            "temperature": 0.1,
        },
    },
)

print(response.json().get("response"))
