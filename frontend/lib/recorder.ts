/**
 * Browser audio recorder using the MediaRecorder API.
 * Records audio from the user's microphone and produces a Blob.
 */

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private _isRecording = false;

  /**
   * Check if recording is in progress.
   */
  get isRecording(): boolean {
    return this._isRecording;
  }

  /**
   * Request microphone permission and start recording.
   *
   * @throws Error if microphone access is denied or unavailable
   */
  async start(): Promise<void> {
    if (this._isRecording) {
      throw new Error("Already recording");
    }

    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      this.audioChunks = [];

      // Choose the best supported MIME type
      const mimeType = this.getSupportedMimeType();

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(250); // Collect data every 250ms
      this._isRecording = true;
    } catch (err) {
      this.cleanup();

      if (err instanceof DOMException) {
        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          throw new Error(
            "Microphone permission denied. Please allow microphone access in your browser settings."
          );
        }
        if (
          err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError"
        ) {
          throw new Error(
            "No microphone found. Please connect a microphone and try again."
          );
        }
      }

      throw new Error(
        `Failed to start recording: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  /**
   * Stop recording and return the recorded audio as a Blob.
   *
   * @returns Promise<Blob> - The recorded audio blob
   */
  async stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this._isRecording) {
        reject(new Error("Not recording"));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType =
          this.mediaRecorder?.mimeType || "audio/webm;codecs=opus";
        const blob = new Blob(this.audioChunks, { type: mimeType });

        this.cleanup();
        resolve(blob);
      };

      this.mediaRecorder.onerror = (event) => {
        this.cleanup();
        reject(new Error("Recording error occurred"));
      };

      this.mediaRecorder.stop();
      this._isRecording = false;
    });
  }

  /**
   * Cancel recording without producing output.
   */
  cancel(): void {
    if (this.mediaRecorder && this._isRecording) {
      this.mediaRecorder.stop();
    }
    this._isRecording = false;
    this.cleanup();
  }

  /**
   * Get the best supported audio MIME type.
   */
  private getSupportedMimeType(): string {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/ogg",
      "audio/mp4",
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return "audio/webm"; // fallback
  }

  /**
   * Clean up media resources.
   */
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
}
