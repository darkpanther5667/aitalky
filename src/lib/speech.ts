type SpeechCallback = (isPlaying: boolean, currentText?: string) => void;

class SpeechManager {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<SpeechCallback> = new Set();
  private rate: number = 1.0;
  private currentText: string = "";

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
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
    if (this.currentUtterance && this.synth?.speaking) {
      // Re-trigger with new rate if currently playing
      const text = this.currentText;
      this.stop();
      this.speak(text);
    }
  }

  public getRate() {
    return this.rate;
  }

  public isSpeaking(): boolean {
    return !!(this.synth && (this.synth.speaking || this.synth.pending));
  }

  public speak(text: string) {
    if (!this.synth) return;

    this.stop();

    if (!text.trim()) return;

    this.currentText = text;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.rate;
    utterance.pitch = 1.0;

    // Pick crisp english voice if available
    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Natural") ||
          v.name.includes("Google") ||
          v.name.includes("Samantha") ||
          v.name.includes("Daniel") ||
          v.name.includes("Alex"))
    ) || voices.find((v) => v.lang.startsWith("en"));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
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
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
      this.notify(false, this.currentText);
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.notify(true, this.currentText);
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.notify(false);
      this.currentUtterance = null;
    }
  }
}

export const speechManager = typeof window !== "undefined" ? new SpeechManager() : null;
