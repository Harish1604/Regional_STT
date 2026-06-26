import os
import sys
import json
from app.services.audio_service import AudioService
from app.services.stt_service import STTService

def main():
    print("Initializing services...")
    audio_service = AudioService()
    stt_service = STTService()
    stt_service.load_model()
    
    input_path = "test.webm"
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found.")
        sys.exit(1)
        
    print(f"Testing audio preprocessing for {input_path}...")
    try:
        processed_path = audio_service.preprocess(input_path)
        print(f"Audio preprocessed successfully! Saved to: {processed_path}")
        
        print("Transcribing...")
        # test.wav is a Tamil sample
        result = stt_service.transcribe(processed_path, "ta")
        print("STT Result:")
        print(json.dumps(result, indent=2))
        
        # Cleanup
        if os.path.exists(processed_path):
            os.remove(processed_path)
            print("Cleaned up temporary processed file.")
    except Exception as e:
        print(f"Pipeline test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
