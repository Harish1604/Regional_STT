"""
Multi-language STT + Translation Pipeline Test
================================================
Generates TTS audio for each supported language using Google TTS,
sends it to the /translate endpoint, and reports results.
"""

import os
import sys
import json
import time
import requests
from gtts import gTTS

API_URL = "http://localhost:8000"
OUTPUT_DIR = "test_audio_languages"

# Test phrases in each supported language — longer texts for 10+ second audio
# Each entry: (language_code, language_name, test_phrase)
TEST_CASES = [
    ("ta", "Tamil",
     "வணக்கம் நான் நலமாக இருக்கிறேன். நேற்று நான் என் நண்பர்களுடன் கடைக்கு போனேன். "
     "அங்கே நிறைய பொருட்கள் வாங்கினோம். பிறகு நாங்கள் ஒரு உணவகத்தில் சாப்பிட்டோம். "
     "அது மிகவும் சுவையாக இருந்தது. நாளைக்கு எனக்கு ஒரு முக்கியமான சந்திப்பு இருக்கிறது."),

    ("hi", "Hindi",
     "नमस्ते मैं ठीक हूँ. कल मैं अपने दोस्तों के साथ बाज़ार गया था. "
     "हमने वहाँ बहुत सारा सामान खरीदा. उसके बाद हमने एक रेस्टोरेंट में खाना खाया. "
     "खाना बहुत स्वादिष्ट था. कल मेरी एक बहुत ज़रूरी मीटिंग है जिसके लिए मुझे तैयारी करनी है."),

    ("te", "Telugu",
     "నమస్కారం నేను బాగున్నాను. నిన్న నేను నా స్నేహితులతో కలిసి మార్కెట్‌కు వెళ్ళాను. "
     "అక్కడ మేము చాలా వస్తువులు కొన్నాము. తర్వాత మేము ఒక రెస్టారెంట్‌లో భోజనం చేశాము. "
     "అది చాలా రుచిగా ఉంది. రేపు నాకు ఒక ముఖ్యమైన సమావేశం ఉంది దానికి సిద్ధం కావాలి."),

    ("ml", "Malayalam",
     "നമസ്കാരം ഞാൻ സുഖമായിരിക്കുന്നു. ഇന്നലെ ഞാൻ എന്റെ സുഹൃത്തുക്കളോടൊപ്പം കടയിൽ പോയി. "
     "അവിടെ ഞങ്ങൾ ഒരുപാട് സാധനങ്ങൾ വാങ്ങി. അതിനുശേഷം ഞങ്ങൾ ഒരു ഹോട്ടലിൽ ഭക്ഷണം കഴിച്ചു. "
     "അത് വളരെ രുചികരമായിരുന്നു. നാളെ എനിക്ക് ഒരു പ്രധാന മീറ്റിംഗ് ഉണ്ട് അതിന് തയ്യാറാകണം."),

    ("kn", "Kannada",
     "ನಮಸ್ಕಾರ ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ. ನಿನ್ನೆ ನಾನು ನನ್ನ ಸ್ನೇಹಿತರೊಂದಿಗೆ ಅಂಗಡಿಗೆ ಹೋಗಿದ್ದೆ. "
     "ಅಲ್ಲಿ ನಾವು ತುಂಬಾ ವಸ್ತುಗಳನ್ನು ಖರೀದಿಸಿದೆವು. ನಂತರ ನಾವು ಒಂದು ಹೋಟೆಲ್‌ನಲ್ಲಿ ಊಟ ಮಾಡಿದೆವು. "
     "ಅದು ತುಂಬಾ ರುಚಿಯಾಗಿತ್ತು. ನಾಳೆ ನನಗೆ ಒಂದು ಮುಖ್ಯ ಸಭೆ ಇದೆ ಅದಕ್ಕೆ ಸಿದ್ಧತೆ ಮಾಡಬೇಕು."),

    ("bn", "Bengali",
     "নমস্কার আমি ভালো আছি. গতকাল আমি আমার বন্ধুদের সাথে বাজারে গিয়েছিলাম. "
     "সেখানে আমরা অনেক জিনিস কিনেছি. তারপর আমরা একটা রেস্টুরেন্টে খাবার খেয়েছি. "
     "খাবার খুব সুস্বাদু ছিল. আগামীকাল আমার একটা খুব গুরুত্বপূর্ণ মিটিং আছে তার জন্য প্রস্তুতি নিতে হবে."),

    ("gu", "Gujarati",
     "નમસ્તે હું સારું છું. ગઈકાલે હું મારા મિત્રો સાથે બજારમાં ગયો હતો. "
     "ત્યાં અમે ઘણી બધી વસ્તુઓ ખરીદી. પછી અમે એક રેસ્ટોરન્ટમાં જમ્યા. "
     "ખાવાનું ખૂબ સ્વાદિષ્ટ હતું. આવતીકાલે મારી એક ખૂબ મહત્વની મીટિંગ છે તેના માટે તૈયારી કરવી પડશે."),

    ("mr", "Marathi",
     "नमस्कार मी ठीक आहे. काल मी माझ्या मित्रांसोबत बाजारात गेलो होतो. "
     "तिथे आम्ही खूप सामान विकत घेतलं. त्यानंतर आम्ही एका रेस्टॉरंटमध्ये जेवलो. "
     "जेवण खूप चवदार होतं. उद्या माझी एक खूप महत्त्वाची मीटिंग आहे त्याची तयारी करायला हवी."),

    ("pa", "Punjabi",
     "ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਮੈਂ ਠੀਕ ਹਾਂ. ਕੱਲ੍ਹ ਮੈਂ ਆਪਣੇ ਦੋਸਤਾਂ ਨਾਲ ਬਜ਼ਾਰ ਗਿਆ ਸੀ. "
     "ਅਸੀਂ ਉੱਥੇ ਬਹੁਤ ਸਾਰਾ ਸਮਾਨ ਖਰੀਦਿਆ. ਉਸ ਤੋਂ ਬਾਅਦ ਅਸੀਂ ਇੱਕ ਰੈਸਟੋਰੈਂਟ ਵਿੱਚ ਖਾਣਾ ਖਾਧਾ. "
     "ਖਾਣਾ ਬਹੁਤ ਸੁਆਦੀ ਸੀ. ਕੱਲ੍ਹ ਮੇਰੀ ਇੱਕ ਬਹੁਤ ਜ਼ਰੂਰੀ ਮੀਟਿੰਗ ਹੈ ਉਸ ਲਈ ਤਿਆਰੀ ਕਰਨੀ ਪਵੇਗੀ."),

    ("ur", "Urdu",
     "السلام علیکم میں ٹھیک ہوں. کل میں اپنے دوستوں کے ساتھ بازار گیا تھا. "
     "ہم نے وہاں بہت سارا سامان خریدا. اس کے بعد ہم نے ایک ریسٹورنٹ میں کھانا کھایا. "
     "کھانا بہت لذیذ تھا. کل میری ایک بہت اہم میٹنگ ہے جس کی تیاری کرنی ہے."),
]


def generate_audio(lang_code: str, text: str, output_path: str) -> bool:
    """Generate TTS audio using Google TTS."""
    try:
        tts = gTTS(text=text, lang=lang_code, slow=False)
        tts.save(output_path)
        size_kb = os.path.getsize(output_path) / 1024
        print(f"  ✓ Audio generated: {output_path} ({size_kb:.1f} KB)")
        return True
    except Exception as e:
        print(f"  ✗ TTS generation failed: {e}")
        return False


def test_translate(audio_path: str, source_lang: str) -> dict:
    """Send audio to the /translate endpoint."""
    try:
        with open(audio_path, "rb") as f:
            files = {"file": (os.path.basename(audio_path), f, "audio/mpeg")}
            data = {
                "source_language": source_lang,
                "target_language": "en",
            }
            response = requests.post(
                f"{API_URL}/translate",
                files=files,
                data=data,
                timeout=120,
            )

        if response.status_code == 200:
            return response.json()
        else:
            return {"success": False, "error": f"HTTP {response.status_code}: {response.text[:200]}"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def main():
    # Check backend health
    print("=" * 70)
    print("Multi-language STT + Translation Pipeline Test")
    print("=" * 70)

    try:
        health = requests.get(f"{API_URL}/health", timeout=5)
        if health.json().get("status") != "ok":
            print("✗ Backend is not healthy!")
            sys.exit(1)
        print("✓ Backend is online\n")
    except Exception as e:
        print(f"✗ Cannot reach backend at {API_URL}: {e}")
        sys.exit(1)

    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Run tests
    results = []
    total_start = time.time()

    for lang_code, lang_name, test_phrase in TEST_CASES:
        print(f"\n{'─' * 70}")
        print(f"Testing: {lang_name} ({lang_code})")
        print(f"Input:   {test_phrase}")
        print(f"{'─' * 70}")

        # Step 1: Generate audio
        audio_path = os.path.join(OUTPUT_DIR, f"test_{lang_code}.mp3")
        if not generate_audio(lang_code, test_phrase, audio_path):
            results.append({
                "language": lang_name,
                "code": lang_code,
                "status": "FAIL",
                "error": "TTS generation failed",
            })
            continue

        # Step 2: Send to /translate
        print(f"  → Sending to /translate endpoint...")
        start = time.time()
        result = test_translate(audio_path, lang_code)
        elapsed = int((time.time() - start) * 1000)

        if result.get("success"):
            source_text = result.get("source_text", "")
            translated = result.get("translated_text", "")
            llm_reply = result.get("llm_reply", "")
            stt_ms = result.get("stt_latency_ms", 0)
            trans_ms = result.get("translation_latency_ms", 0)
            reply_ms = result.get("llm_reply_latency_ms", 0)
            total_ms = result.get("total_latency_ms", 0)

            print(f"  ✓ STT Output:    {source_text}")
            print(f"  ✓ Translation:   {translated}")
            if llm_reply:
                print(f"  ✓ AI Reply:      {llm_reply[:120]}...")
            print(f"  ⏱ Latency:       STT={stt_ms}ms | Trans={trans_ms}ms | Reply={reply_ms}ms | Total={total_ms}ms")

            results.append({
                "language": lang_name,
                "code": lang_code,
                "status": "PASS",
                "input_text": test_phrase,
                "stt_output": source_text,
                "translation": translated,
                "llm_reply": llm_reply[:100] if llm_reply else "",
                "stt_ms": stt_ms,
                "translation_ms": trans_ms,
                "reply_ms": reply_ms,
                "total_ms": total_ms,
            })
        else:
            error = result.get("error", "Unknown error")
            print(f"  ✗ Failed: {error}")
            results.append({
                "language": lang_name,
                "code": lang_code,
                "status": "FAIL",
                "error": error,
            })

    total_elapsed = time.time() - total_start

    # Print summary
    print(f"\n{'=' * 70}")
    print(f"RESULTS SUMMARY")
    print(f"{'=' * 70}")
    print(f"{'Language':<12} {'Code':<6} {'Status':<8} {'STT(ms)':<10} {'Trans(ms)':<10} {'Reply(ms)':<10} {'Total(ms)':<10}")
    print(f"{'─' * 76}")

    passed = 0
    failed = 0
    for r in results:
        status = r["status"]
        if status == "PASS":
            passed += 1
            print(f"{r['language']:<12} {r['code']:<6} {'✓ PASS':<8} {r.get('stt_ms',''):<10} {r.get('translation_ms',''):<10} {r.get('reply_ms',''):<10} {r.get('total_ms',''):<10}")
        else:
            failed += 1
            print(f"{r['language']:<12} {r['code']:<6} {'✗ FAIL':<8} {r.get('error', '')}")

    print(f"{'─' * 76}")
    print(f"Total: {passed} passed, {failed} failed out of {len(results)} | Time: {total_elapsed:.1f}s")
    print()

    # Save detailed results as JSON
    results_path = os.path.join(OUTPUT_DIR, "test_results.json")
    with open(results_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"Detailed results saved to: {results_path}")

    # Cleanup audio files
    # (keeping them for manual inspection)
    print(f"Audio files saved in: {OUTPUT_DIR}/")

    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
