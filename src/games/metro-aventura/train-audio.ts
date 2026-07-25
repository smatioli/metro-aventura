export type TrainSoundState = "idle" | "accelerating" | "cruising" | "braking";

class TrainAudio {
  private context?: AudioContext;
  private master?: GainNode;
  private motor?: OscillatorNode;
  private motorGain?: GainNode;
  private railGain?: GainNode;
  private railFilter?: BiquadFilterNode;
  private enabled = true;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (enabled) this.ensureAudio();
    if (!this.context || !this.master) return;
    if (enabled) void this.context.resume();
    const now = this.context.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(enabled ? 1 : 0, now, 0.06);
  }

  setMotion(speedKmh: number, state: TrainSoundState): void {
    if (!this.enabled && !this.context) return;
    this.ensureAudio();
    if (!this.context || !this.motor || !this.motorGain || !this.railGain || !this.railFilter) return;
    void this.context.resume();
    const now = this.context.currentTime;
    const speed = Math.max(0, Math.min(70, speedKmh));
    const ratio = speed / 70;
    this.motor.frequency.setTargetAtTime(58 + ratio * 145, now, 0.08);
    this.motorGain.gain.setTargetAtTime(ratio * (state === "cruising" ? 0.045 : 0.055), now, 0.1);
    this.railGain.gain.setTargetAtTime(ratio * (state === "braking" ? 0.038 : 0.026), now, 0.12);
    this.railFilter.frequency.setTargetAtTime(420 + ratio * 900, now, 0.1);
  }

  stop(): void {
    if (!this.context || !this.motorGain || !this.railGain) return;
    const now = this.context.currentTime;
    this.motorGain.gain.setTargetAtTime(0, now, 0.18);
    this.railGain.gain.setTargetAtTime(0, now, 0.18);
  }

  private ensureAudio(): void {
    if (this.context) return;
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.gain.value = this.enabled ? 1 : 0;
    this.master.connect(this.context.destination);

    this.motor = this.context.createOscillator();
    this.motor.type = "triangle";
    this.motor.frequency.value = 58;
    this.motorGain = this.context.createGain();
    this.motorGain.gain.value = 0;
    this.motor.connect(this.motorGain).connect(this.master);
    this.motor.start();

    const noiseBuffer = this.context.createBuffer(1, this.context.sampleRate * 2, this.context.sampleRate);
    const channel = noiseBuffer.getChannelData(0);
    for (let index = 0; index < channel.length; index += 1) channel[index] = Math.random() * 2 - 1;
    const rails = this.context.createBufferSource();
    rails.buffer = noiseBuffer;
    rails.loop = true;
    this.railFilter = this.context.createBiquadFilter();
    this.railFilter.type = "bandpass";
    this.railFilter.frequency.value = 420;
    this.railFilter.Q.value = 1.2;
    this.railGain = this.context.createGain();
    this.railGain.gain.value = 0;
    rails.connect(this.railFilter).connect(this.railGain).connect(this.master);
    rails.start();
  }
}

export const trainAudio = new TrainAudio();
