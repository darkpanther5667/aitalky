type SpeechCallback = (isPlaying: boolean, currentText?: string) => void;

class SpeechManager {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private audioAbortController: AbortController | null = null;
  private listeners: Set<SpeechCallback> = new Set();
  private rate: number = 1.0;
  private currentText: string = "";
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      if ("speechSynthesis" in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (voices && voices.length > 0) {
      this.cachedVoices = voices;
    }
  }

  public subscribe(cb: SpeechCallback) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify(isPlaying: boolean, text?: string) {
    this.listeners.forEach((cb) => cb(isPlaying, text));
  }

  public setRate(newRate: number) {
    this.rate = newRate;
    if (this.currentAudio) {
      this.currentAudio.playbackRate = newRate;
    } else if (this.currentUtterance && this.synth?.speaking) {
      const text = this.currentText;
      this.stop();
      this.speak(text);
    }
  }

  public getRate() {
    return this.rate;
  }

  public isSpeaking(): boolean {
    if (this.currentAudio && !this.currentAudio.paused && !this.currentAudio.ended) {
      return true;
    }
    return !!(this.synth && (this.synth.speaking || this.synth.pending));
  }

  public async speak(text: string, voiceName: "Aoede" | "Puck" = "Aoede") {
    this.stop();

    if (!text || !text.trim()) return;
    this.currentText = text;
    this.notify(true, text);

    // 1. Try server-side Studio Neural Voice first (Gemini Flash Neural Audio)
    try {
      this.audioAbortController = new AbortController();
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.slice(0, 600),
          voice: voiceName,
        }),
        signal: this.audioAbortController.signal,
      });

      if (res.ok) {
        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.playbackRate = this.rate;

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          this.notify(false);
        };

        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          this.fallbackSpeak(text);
        };

        this.currentAudio = audio;
        await audio.play();
        return;
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.warn("[Speech] Neural TTS fetch failed, using natural browser voice:", err);
    }

    // 2. High-fidelity browser speech synthesis fallback
    this.fallbackSpeak(text);
  }

  private fallbackSpeak(text: string) {
    if (!this.synth) {
      this.notify(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.rate * 0.96; // Slightly calmer tempo for editorial broadcast
    utterance.pitch = 0.98; // Richer, deeper journalistic resonance

    const voices = this.cachedVoices.length > 0 ? this.cachedVoices : this.synth.getVoices();

    // Priority ranking: Microsoft Natural > Google Neural > Apple Enhanced > Standard English
    const priorityVoice =
      voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Online"))) ||
      voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Neural"))) ||
      voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Enhanced") || v.name.includes("Daniel") || v.name.includes("Samantha"))) ||
      voices.find((v) => v.lang === "en-US" || v.lang === "en-GB") ||
      voices.find((v) => v.lang.startsWith("en"));

    if (priorityVoice) {
      utterance.voice = priorityVoice;
    }

    utterance.onstart = () => {
      this.notify(true, text);
    };

    utterance.onend = () => {
      this.notify(false);
      this.currentUtterance = null;
    };

    utterance.onerror = () => {
      this.notify(false);
      this.currentUtterance = null;
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public pause() {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      this.notify(false, this.currentText);
    } else if (this.synth && this.synth.speaking) {
      this.synth.pause();
      this.notify(false, this.currentText);
    }
  }

  public resume() {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
      this.notify(true, this.currentText);
    } else if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.notify(true, this.currentText);
    }
  }

  public stop() {
    if (this.audioAbortController) {
      this.audioAbortController.abort();
      this.audioAbortController = null;
    }

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }

    this.notify(false);
  }
}

export const speechManager = typeof window !== "undefined" ? new SpeechManager() : null;

