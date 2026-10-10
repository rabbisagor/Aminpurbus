/**
 * Procedural Web Audio API sound generator for Aminpur Bus Simulator.
 * Provides authentic diesel bus engine rumble, melodic hydraulic air horn,
 * air brake pneumatic release, turn indicators, and boarding bells.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private engineGain: GainNode | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineSubOsc: OscillatorNode | null = null;
  private rainGain: GainNode | null = null;
  private rainSource: AudioBufferSourceNode | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.8;
  private isEngineRunning: boolean = false;
  private activeHornOscs: OscillatorNode[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.engineGain && this.ctx) {
      this.engineGain.gain.setValueAtTime(this.masterVolume * 0.25, this.ctx.currentTime);
    }
  }

  public startEngine() {
    this.initContext();
    if (!this.ctx || this.isEngineRunning) return;

    try {
      const t = this.ctx.currentTime;
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(this.masterVolume * 0.22, t);

      // Low rumble square-ish / sawtooth for diesel motor cylinders
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(45, t); // Base idle RPM

      // Sub harmonic for rich low-end rumble
      this.engineSubOsc = this.ctx.createOscillator();
      this.engineSubOsc.type = 'triangle';
      this.engineSubOsc.frequency.setValueAtTime(22.5, t);

      // Low pass filter to remove harsh buzz and sound like heavy steel block
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, t);

      this.engineOsc.connect(filter);
      this.engineSubOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start(t);
      this.engineSubOsc.start(t);
      this.isEngineRunning = true;
    } catch {
      // Audio autoplay policy handled
    }
  }

  public updateEngine(speedKmh: number, throttle: boolean) {
    if (!this.ctx || !this.isEngineRunning || !this.engineOsc || !this.engineSubOsc) return;

    const baseFreq = 42;
    const speedRatio = Math.min(Math.abs(speedKmh) / 100, 1.2);
    const throttleBonus = throttle ? 18 : 0;
    const targetFreq = baseFreq + speedRatio * 85 + throttleBonus;

    const t = this.ctx.currentTime;
    this.engineOsc.frequency.setTargetAtTime(targetFreq, t, 0.1);
    this.engineSubOsc.frequency.setTargetAtTime(targetFreq * 0.5, t, 0.1);
  }

  public stopEngine() {
    if (!this.isEngineRunning) return;
    try {
      this.engineOsc?.stop();
      this.engineSubOsc?.stop();
      this.engineOsc?.disconnect();
      this.engineSubOsc?.disconnect();
      this.isEngineRunning = false;
    } catch {
      // Ignore
    }
  }

  /**
   * Iconic Bangladeshi dual-tone musical Hydraulic Air Horn (হাইড্রোলিক হর্ন)
   */
  public playHydraulicHorn() {
    this.initContext();
    if (!this.ctx) return;

    this.stopHydraulicHorn();

    const t = this.ctx.currentTime;
    const hornFrequencies = [349.23, 440.0, 523.25]; // F4, A4, C5 pleasant energetic brass chord

    hornFrequencies.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      // Slight pitch vibrato for realistic pneumatic air pressure
      osc.frequency.linearRampToValueAtTime(freq * 1.02, t + 0.15);
      osc.frequency.linearRampToValueAtTime(freq, t + 0.3);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(this.masterVolume * 0.3, t + 0.05);
      gain.gain.setValueAtTime(this.masterVolume * 0.28, t + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

      // Low pass to simulate brass trumpet horn
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, t);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.9);
      this.activeHornOscs.push(osc);
    });
  }

  public stopHydraulicHorn() {
    this.activeHornOscs.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Safe catch
      }
    });
    this.activeHornOscs = [];
  }

  /**
   * Heavy bus pneumatic air brake release (Psssshhhh sound)
   */
  public playAirBrake() {
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, t);
    filter.Q.setValueAtTime(2.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.masterVolume * 0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
  }

  /**
   * Transmission / Gear Shift lever click
   */
  public playGearShift() {
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);

    gain.gain.setValueAtTime(this.masterVolume * 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  /**
   * Passenger boarding door chime / notification ding
   */
  public playBoardingChime() {
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [587.33, 880.0].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.12);

      gain.gain.setValueAtTime(this.masterVolume * 0.35, t + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.12);
      osc.stop(t + idx * 0.12 + 0.55);
    });
  }

  /**
   * Mission victory celebration fanfare
   */
  public playMissionSuccess() {
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A major triumphant arpeggio

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const start = t + idx * 0.12;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(this.masterVolume * 0.4, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.65);
    });
  }

  /**
   * Soft UI button click
   */
  public playButtonClick() {
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);

    gain.gain.setValueAtTime(this.masterVolume * 0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }
}

export const soundEngine = new SoundEngine();
