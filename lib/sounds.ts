let sharedCtx: AudioContext | null = null;

export function playSound(type: "open" | "close" | "connected" | "reverted" | "new_user") {
  try {
    if (typeof window === "undefined") return;
    
    if (!sharedCtx) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      sharedCtx = new AudioContext();
    }
    
    if (sharedCtx.state === "suspended") {
      sharedCtx.resume();
    }

    const osc = sharedCtx.createOscillator();
    const gain = sharedCtx.createGain();
    
    osc.connect(gain);
    gain.connect(sharedCtx.destination);
    
    const now = sharedCtx.currentTime + 0.05;
    
    if (type === "open") {
      // Ascending sweep
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "close") {
      // Descending sweep
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "connected") {
      // Happy chime (human connected)
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.1, now + 0.1);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.1, now + 0.2);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === "reverted") {
      // Gentle double beep (reverted to bot)
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(350, now + 0.15);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
      gain.gain.setValueAtTime(0.3, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === "new_user") {
      // Alert ping
      osc.type = "square";
      osc.frequency.setValueAtTime(880, now); // A5
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (e) {
    console.error("Audio engine failed", e);
  }
}
