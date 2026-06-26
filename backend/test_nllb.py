from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch

model_name = "facebook/nllb-200-distilled-600M"
try:
    print(f"Loading {model_name}...")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name, device_map="cuda", torch_dtype=torch.float16)
    
    text = "அங்க கிராமர் மிஸ்டேக்ஸ் இருக்கு அதை மட்டும் பாட்டு கரெக்டாக கான்செட்"
    # tam_Tam is Tamil in NLLB
    inputs = tokenizer(text, return_tensors="pt").to("cuda")
    
    # Generate English (eng_Latn)
    generated_tokens = model.generate(
        **inputs,
        forced_bos_token_id=tokenizer.lang_code_to_id["eng_Latn"],
        max_length=100
    )
    result = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]
    print(f"Translation: {result}")
except Exception as e:
    print(f"Failed: {e}")
