from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
model_name = "NifeLabs/indictrans2-indic-en-1B"
try:
    print(f"Loading {model_name}...")
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    print("Tokenizer loaded.")
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name, trust_remote_code=True)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Failed: {e}")
