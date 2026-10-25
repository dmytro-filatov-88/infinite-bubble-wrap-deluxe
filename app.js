/**
 * Infinite Bubble Wrap Deluxe 🫧✨
 * Pure HTML5 Canvas, Web Audio API & Physics-inspired ASMR Toy
 * Zero-Build, High-Performance 120 FPS Drag-Popping Engine
 */

(function () {
  'use strict';

  // --- AUDIO SYNTHESIS ENGINE ---
  class ProceduralAudioEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.compressor = null;
      this.isMuted = false;
      this.activeVoices = 0;
      this.maxVoices = 48; // Limit simultaneous voices to prevent CPU strain during sweeps
    }

    init() {
      if (this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();

      // Master Limiter / Dynamics Compressor to prevent clipping during rapid 120fps sweeps
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(8, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);
    }

    resume() {
      if (!this.ctx) this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime, 0.02);
      }
      return this.isMuted;
    }

    playPop(mode, col = 0, row = 0, pitchVariation = 1.0) {
      if (this.isMuted || !this.ctx || this.activeVoices > this.maxVoices) return;
      this.resume();

      const t = this.ctx.currentTime;
      this.activeVoices++;

      try {
        switch (mode) {
          case 'classic':
            this._synthClassic(t, pitchVariation);
            break;
          case 'crystal':
            this._synthCrystal(t, pitchVariation);
            break;
          case 'timpani':
            this._synthTimpani(t, col, row, pitchVariation);
            break;
          case 'laser':
            this._synthLaser(t, pitchVariation);
            break;
          case 'gold':
            this._synthGold(t, pitchVariation);
            break;
          default:
            this._synthClassic(t, pitchVariation);
        }
      } catch (e) {
        // Fallback gracefully
      }

      setTimeout(() => {
        this.activeVoices = Math.max(0, this.activeVoices - 1);
      }, 300);
    }

    // 1. Classic Plastic ASMR Snap & Low Thump
    _synthClassic(t, pitch) {
      const p = pitch * (0.9 + Math.random() * 0.2);

      // Transient snap (bandpassed micro noise)
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.025);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200 * p, t);
      filter.frequency.exponentialRampToValueAtTime(350 * p, t + 0.02);
      filter.Q.setValueAtTime(3.0, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.9, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noise.start(t);

      // Tactile Sine Thump
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420 * p, t);
      osc.frequency.exponentialRampToValueAtTime(80 * p, t + 0.045);

      oscGain.gain.setValueAtTime(0.8, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.055);
    }

    // 2. Crunchy Glass Shatter & Prismatic Chime
    _synthCrystal(t, pitch) {
      const p = pitch * (0.95 + Math.random() * 0.15);
      const carrierFreq = (1600 + Math.random() * 600) * p;

      // FM Carrier & Modulator
      const carrier = this.ctx.createOscillator();
      const mod = this.ctx.createOscillator();
      const modGain = this.ctx.createGain();
      const mainGain = this.ctx.createGain();

      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(carrierFreq, t);

      mod.type = 'sine';
      mod.frequency.setValueAtTime(carrierFreq * 2.76, t);

      modGain.gain.setValueAtTime(carrierFreq * 1.5, t);
      modGain.gain.exponentialRampToValueAtTime(1, t + 0.09);

      mod.connect(modGain);
      modGain.connect(carrier.frequency);

      mainGain.gain.setValueAtTime(0.7, t);
      mainGain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

      carrier.connect(mainGain);
      mainGain.connect(this.masterGain);

      mod.start(t);
      carrier.start(t);
      mod.stop(t + 0.12);
      carrier.stop(t + 0.12);

      // Micro Shimmer Ping
      const ping = this.ctx.createOscillator();
      const pingGain = this.ctx.createGain();
      ping.type = 'triangle';
      ping.frequency.setValueAtTime(3200 * p, t + 0.005);
      pingGain.gain.setValueAtTime(0.35, t + 0.005);
      pingGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      ping.connect(pingGain);
      pingGain.connect(this.masterGain);
      ping.start(t + 0.005);
      ping.stop(t + 0.07);
    }

    // 3. Orchestral Kettle Drum / Timpani with Harmonic Resonance
    _synthTimpani(t, col, row, pitch) {
      // Map column & row to pentatonic musical scale
      const pentatonic = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
      const noteIdx = Math.abs((col * 3 + row) % pentatonic.length);
      const baseFreq = pentatonic[noteIdx] * pitch;

      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      // Timpani membrane pitch relax
      osc.frequency.setValueAtTime(baseFreq * 1.4, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq, t + 0.06);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(baseFreq * 5, t);
      filter.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.35);

      oscGain.gain.setValueAtTime(0.85, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.42);
    }

    // 4. Retro Sci-Fi Laser Pew Zap
    _synthLaser(t, pitch) {
      const p = pitch * (0.9 + Math.random() * 0.2);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(2600 * p, t);
      osc.frequency.exponentialRampToValueAtTime(90 * p, t + 0.075);

      gain.gain.setValueAtTime(0.65, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.085);
    }

    // 5. 24K Golden Mega Boom & Coin Shower
    _synthGold(t, pitch) {
      const p = pitch * (0.95 + Math.random() * 0.1);

      // Deep Sub-Bass Impact
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(140 * p, t);
      sub.frequency.exponentialRampToValueAtTime(45 * p, t + 0.3);

      subGain.gain.setValueAtTime(1.0, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      sub.connect(subGain);
      subGain.connect(this.masterGain);
      sub.start(t);
      sub.stop(t + 0.55);

      // Cascading Gold Coin Clinks (4 staggered high bell pings)
      const freqs = [2100, 2650, 3180, 4200];
      freqs.forEach((freq, i) => {
        const pingT = t + 0.03 * i;
        const bell = this.ctx.createOscillator();
        const bellGain = this.ctx.createGain();
        bell.type = 'sine';
        bell.frequency.setValueAtTime(freq * p, pingT);

        bellGain.gain.setValueAtTime(0.35, pingT);
        bellGain.gain.exponentialRampToValueAtTime(0.001, pingT + 0.12);

        bell.connect(bellGain);
        bellGain.connect(this.masterGain);

        bell.start(pingT);
        bell.stop(pingT + 0.13);
      });
    }

    // Sound effect: Steamroller heavy motor rumble & crunch
    playRollerCrunch() {
      if (this.isMuted || !this.ctx) return;
      this.resume();
      const t = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(55, t);
      osc.frequency.linearRampToValueAtTime(65, t + 0.1);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.13);
    }

    // Sound effect: Fresh roll unrolling whoosh
    playUnroll() {
      if (this.isMuted || !this.ctx) return;
      this.resume();
      const t = this.ctx.currentTime;

      const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, t);
      filter.frequency.exponentialRampToValueAtTime(2400, t + 0.15);
      filter.frequency.exponentialRampToValueAtTime(600, t + 0.35);
      filter.Q.setValueAtTime(2.5, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(t);
    }

    // Sound effect: God bubble massive celestial detonator
    playGodExplosion() {
      if (this.isMuted || !this.ctx) return;
      this.resume();
      const t = this.ctx.currentTime;

      // Deep rumble
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, t);
      osc.frequency.exponentialRampToValueAtTime(25, t + 1.2);

      gain.gain.setValueAtTime(1.0, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 1.45);

      // Choir chord
      [261.63, 329.63, 392.00, 523.25, 659.25].forEach((freq, idx) => {
        const chordOsc = this.ctx.createOscillator();
        const chordGain = this.ctx.createGain();
        chordOsc.type = 'triangle';
        chordOsc.frequency.setValueAtTime(freq, t + idx * 0.02);

        chordGain.gain.setValueAtTime(0.2, t + idx * 0.02);
        chordGain.gain.exponentialRampToValueAtTime(0.001, t + 1.6);

        chordOsc.connect(chordGain);
        chordGain.connect(this.masterGain);
        chordOsc.start(t + idx * 0.02);
        chordOsc.stop(t + 1.65);
      });
    }
  }

  // --- PARTICLE PHYSICS SYSTEM ---
  class ParticleEngine {
    constructor() {
      this.particles = [];
      this.maxParticles = 600;
    }

    spawn(x, y, mode, count = 8) {
      for (let i = 0; i < count; i++) {
        if (this.particles.length >= this.maxParticles) {
          this.particles.shift();
        }

        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 6.5;
        const p = {
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (mode === 'gold' || mode === 'crystal' ? 2 : 0),
          size: 2 + Math.random() * 5,
          alpha: 1.0,
          decay: 0.02 + Math.random() * 0.03,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 0.3,
          gravity: mode === 'crystal' || mode === 'gold' ? 0.15 : 0.02,
          mode,
          color: this._getParticleColor(mode),
          type: this._getParticleType(mode)
        };
        this.particles.push(p);
      }
    }

    _getParticleColor(mode) {
      switch (mode) {
        case 'classic':
          return `hsl(${190 + Math.random() * 25}, 85%, ${70 + Math.random() * 25}%)`;
        case 'crystal':
          return `hsl(${220 + Math.random() * 60}, 95%, ${80 + Math.random() * 20}%)`;
        case 'timpani':
          return `hsl(${30 + Math.random() * 30}, 90%, ${60 + Math.random() * 30}%)`;
        case 'laser':
          return Math.random() > 0.5 ? '#06b6d4' : '#ec4899';
        case 'gold':
          return `hsl(${42 + Math.random() * 15}, 98%, ${65 + Math.random() * 25}%)`;
        default:
          return '#38bdf8';
      }
    }

    _getParticleType(mode) {
      if (mode === 'timpani' && Math.random() > 0.4) return 'note';
      if (mode === 'crystal' && Math.random() > 0.3) return 'shard';
      if (mode === 'gold' && Math.random() > 0.5) return 'coin';
      if (mode === 'laser') return 'spark';
      return 'circle';
    }

    update() {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.rot += p.vrot;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }

    draw(ctx) {
      ctx.save();
      for (const p of this.particles) {
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);

        if (p.type === 'note') {
          ctx.fillStyle = p.color;
          ctx.font = `${Math.floor(p.size * 2.8)}px sans-serif`;
          ctx.fillText('♪', -p.size, p.size);
        } else if (p.type === 'shard') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(-p.size, -p.size * 1.5);
          ctx.lineTo(p.size * 1.2, 0);
          ctx.lineTo(0, p.size * 1.5);
          ctx.closePath();
          ctx.fill();
        } else if (p.type === 'coin') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 1.4, p.size * 0.9, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (p.type === 'spark') {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size, -1, p.size * 2, 2);
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
      ctx.restore();
    }
  }

  // --- GOD BUBBLE EASTER EGG CLASS ---
  class GodBubble {
    constructor(canvasWidth, canvasHeight) {
      this.active = false;
      this.x = canvasWidth / 2;
      this.y = canvasHeight / 2;
      this.baseRadius = 110;
      this.currentRadius = 110;
      this.targetRadius = 110;
      this.presses = 0;
      this.maxPresses = 10;
      this.pulsePhase = 0;
      this.shake = 0;
    }

    spawn(width, height) {
      this.active = true;
      this.x = width / 2;
      this.y = height / 2;
      this.presses = 0;
      this.currentRadius = this.baseRadius;
      this.targetRadius = this.baseRadius;
    }

    hitTest(px, py) {
      if (!this.active) return false;
      const dx = px - this.x;
      const dy = py - this.y;
      return dx * dx + dy * dy <= this.currentRadius * this.currentRadius;
    }

    pump() {
      if (!this.active) return false;
      this.presses++;
      this.targetRadius = this.baseRadius + this.presses * 18;
      this.shake = 12;
      return this.presses >= this.maxPresses;
    }

    update() {
      if (!this.active) return;
      this.pulsePhase += 0.08;
      this.currentRadius += (this.targetRadius - this.currentRadius) * 0.2;
      if (this.shake > 0) this.shake *= 0.88;
    }

    draw(ctx) {
      if (!this.active) return;
      ctx.save();
      const shakeX = (Math.random() - 0.5) * this.shake;
      const shakeY = (Math.random() - 0.5) * this.shake;
      const cx = this.x + shakeX;
      const cy = this.y + shakeY;
      const r = this.currentRadius + Math.sin(this.pulsePhase) * 6;

      // Cosmic Outer Aura
      const aura = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 1.8);
      aura.addColorStop(0, 'rgba(192, 132, 252, 0.5)');
      aura.addColorStop(0.5, 'rgba(124, 58, 237, 0.25)');
      aura.addColorStop(1, 'rgba(124, 58, 237, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Giant Bubble Body
      const bodyGrad = ctx.createRadialGradient(
        cx - r * 0.35, cy - r * 0.35, r * 0.1,
        cx, cy, r
      );
      bodyGrad.addColorStop(0, '#ffffff');
      bodyGrad.addColorStop(0.2, '#fbcfe8');
      bodyGrad.addColorStop(0.5, '#c084fc');
      bodyGrad.addColorStop(0.85, '#6366f1');
      bodyGrad.addColorStop(1, '#312e81');

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Iridescent Rim
      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Glossy Glint
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.35, cy - r * 0.35, r * 0.3, r * 0.15, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Pressure Badge
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 8;
      ctx.fillText(`PUMP: ${this.presses}/${this.maxPresses}`, cx, cy);

      ctx.restore();
    }
  }

  // --- STEAMROLLER WEAPON / EASTER EGG CLASS ---
  class Steamroller {
    constructor() {
      this.active = false;
      this.x = -200;
      this.y = 0;
      this.speed = 18;
      this.width = 180;
      this.height = 0;
    }

    start(canvasHeight) {
      this.active = true;
      this.x = -this.width;
      this.y = 0;
      this.height = canvasHeight;
    }

    update(canvasWidth, onPopLine) {
      if (!this.active) return;
      const prevX = this.x;
      this.x += this.speed;

      // Pop all bubbles rolled over in this slice
      if (onPopLine) {
        onPopLine(prevX, this.x);
      }

      if (this.x > canvasWidth + 250) {
        this.active = false;
      }
    }

    draw(ctx) {
      if (!this.active) return;
      ctx.save();
      // Draw industrial roller bar
      const grad = ctx.createLinearGradient(this.x - 30, 0, this.x + 30, 0);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(0.3, '#f97316');
      grad.addColorStop(0.5, '#fef08a');
      grad.addColorStop(0.7, '#f97316');
      grad.addColorStop(1, '#0f172a');

      ctx.fillStyle = grad;
      ctx.fillRect(this.x - 35, 0, 70, this.height);

      // Warning hazard stripes along roller edge
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 6;
      ctx.setLineDash([16, 16]);
      ctx.beginPath();
      ctx.moveTo(this.x - 30, 0);
      ctx.lineTo(this.x - 30, this.height);
      ctx.stroke();

      ctx.restore();
    }
  }

  // --- MAIN APPLICATION LOGIC ---
  class InfiniteBubbleWrapApp {
    constructor() {
      this.canvas = document.getElementById('bubble-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.audio = new ProceduralAudioEngine();
      this.particles = new ParticleEngine();
      this.godBubble = new GodBubble(window.innerWidth, window.innerHeight);
      this.roller = new Steamroller();

      this.currentMode = 'classic';
      this.totalPopped = parseInt(localStorage.getItem('bored_ai_bubble_popped') || '0', 10);
      this.currentCombo = 0;
      this.comboTimer = null;
      this.ppsHistory = [];
      this.lastPPS = 0;

      // Infinite Hex Grid Parameters
      this.radius = 32;
      this.hexSpacingX = this.radius * Math.sqrt(3);
      this.hexSpacingY = this.radius * 1.5;
      this.scrollX = 0;
      this.scrollY = 0;
      this.isDraggingScroll = false;
      this.isInteracting = false;
      this.lastPointerX = 0;
      this.lastPointerY = 0;

      // State Map for popped cells: key: "c,r", value: { time, mode, scale }
      this.poppedMap = new Map();

      // Screen Shake
      this.screenShake = 0;

      // DOM Elements
      this.elTotal = document.getElementById('stat-total');
      this.elPPS = document.getElementById('stat-pps');
      this.elCombo = document.getElementById('stat-combo');
      this.elComboBar = document.getElementById('combo-bar');
      this.elToast = document.getElementById('combo-toast');
      this.elAudioBanner = document.getElementById('audio-banner');
      this.elAudioIcon = document.getElementById('audio-icon');

      this.init();
    }

    init() {
      this.updateTotalDisplay();
      this.setupCanvasSize();
      this.bindEvents();

      // Start continuous requestAnimationFrame 120 FPS game loop
      requestAnimationFrame(this.loop.bind(this));

      // Periodic PPS (Pops Per Second) calculation
      setInterval(() => {
        const now = performance.now();
        this.ppsHistory = this.ppsHistory.filter(t => now - t < 1000);
        this.lastPPS = this.ppsHistory.length;
        this.elPPS.innerHTML = `${this.lastPPS} <small>pps</small>`;
      }, 250);
    }

    setupCanvasSize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = Math.floor(this.width * dpr);
      this.canvas.height = Math.floor(this.height * dpr);
      this.ctx.resetTransform();
      this.ctx.scale(dpr, dpr);

      // Adaptive bubble radius for small mobile screens
      if (this.width < 600) {
        this.radius = 26;
      } else {
        this.radius = 32;
      }
      this.hexSpacingX = this.radius * Math.sqrt(3);
      this.hexSpacingY = this.radius * 1.5;
    }

    bindEvents() {
      window.addEventListener('resize', () => this.setupCanvasSize());

      // Mode Switchers
      document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.currentMode = btn.dataset.mode;
          this.audio.resume();
        });
      });

      // Action Buttons
      document.getElementById('btn-roller').addEventListener('click', () => this.triggerSteamroller());
      document.getElementById('btn-god-bubble').addEventListener('click', () => this.triggerGodBubble());
      document.getElementById('btn-fresh').addEventListener('click', () => this.freshRoll());
      document.getElementById('btn-audio').addEventListener('click', () => {
        const muted = this.audio.toggleMute();
        this.elAudioIcon.textContent = muted ? '🔇' : '🔊';
      });

      // Pointer Interactivity (Supports Mouse & Touch at 120 FPS)
      this.canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
      this.canvas.addEventListener('pointermove', (e) => this.onPointerMove(e));
      window.addEventListener('pointerup', () => this.onPointerUp());
      window.addEventListener('pointercancel', () => this.onPointerUp());

      // Wheel / Trackpad Scroll (Infinite Scroll Sheet)
      window.addEventListener('wheel', (e) => {
        this.scrollY += e.deltaY * 0.7;
        this.scrollX += e.deltaX * 0.7;
      }, { passive: true });

      // Keyboard Shortcuts
      window.addEventListener('keydown', (e) => {
        if (e.repeat) return;
        const key = e.key.toLowerCase();
        if (key === '1') this.switchMode('classic');
        else if (key === '2') this.switchMode('crystal');
        else if (key === '3') this.switchMode('timpani');
        else if (key === '4') this.switchMode('laser');
        else if (key === '5') this.switchMode('gold');
        else if (key === ' ' || e.code === 'Space') {
          e.preventDefault();
          this.triggerSteamroller();
        } else if (key === 'g') {
          this.triggerGodBubble();
        } else if (key === 'r') {
          this.freshRoll();
        } else if (key === 'm') {
          const muted = this.audio.toggleMute();
          this.elAudioIcon.textContent = muted ? '🔇' : '🔊';
        }
      });
    }

    switchMode(mode) {
      this.currentMode = mode;
      document.querySelectorAll('.mode-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.mode === mode);
      });
      this.audio.resume();
    }

    onPointerDown(e) {
      this.isInteracting = true;
      this.dismissAudioBanner();
      this.audio.resume();

      const rect = this.canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      this.lastPointerX = px;
      this.lastPointerY = py;

      // Check God Bubble first
      if (this.godBubble.active && this.godBubble.hitTest(px, py)) {
        this.audio.playPop('timpani', 0, 0, 1.5);
        const exploded = this.godBubble.pump();
        if (exploded) {
          this.detonateGodBubble();
        }
        return;
      }

      this.popAtPoint(px, py);
    }

    onPointerMove(e) {
      if (!this.isInteracting) return;
      const rect = this.canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      // High-speed sweep drag interpolation:
      // When dragging quickly across the screen, step along the segment to avoid skipping bubbles!
      const dx = px - this.lastPointerX;
      const dy = py - this.lastPointerY;
      const dist = Math.hypot(dx, dy);
      const stepSize = this.radius * 0.45;

      if (dist > stepSize) {
        const steps = Math.min(Math.floor(dist / stepSize), 20);
        for (let i = 1; i <= steps; i++) {
          const interpX = this.lastPointerX + (dx * i) / steps;
          const interpY = this.lastPointerY + (dy * i) / steps;
          this.popAtPoint(interpX, interpY);
        }
      }

      this.popAtPoint(px, py);
      this.lastPointerX = px;
      this.lastPointerY = py;
    }

    onPointerUp() {
      this.isInteracting = false;
    }

    dismissAudioBanner() {
      if (this.elAudioBanner && !this.elAudioBanner.classList.contains('hidden')) {
        this.elAudioBanner.classList.add('hidden');
      }
    }

    // Convert Screen (X, Y) to Hex Grid coordinates (col, row)
    getHexCoords(px, py) {
      const worldX = px + this.scrollX;
      const worldY = py + this.scrollY;

      const approxRow = Math.round(worldY / this.hexSpacingY);
      const rowOffset = (approxRow % 2 !== 0) ? this.hexSpacingX / 2 : 0;
      const approxCol = Math.round((worldX - rowOffset) / this.hexSpacingX);

      return { col: approxCol, row: approxRow };
    }

    // Convert Hex (col, row) to Screen (X, Y)
    getScreenCoords(col, row) {
      const rowOffset = (row % 2 !== 0) ? this.hexSpacingX / 2 : 0;
      const worldX = col * this.hexSpacingX + rowOffset;
      const worldY = row * this.hexSpacingY;
      return {
        x: worldX - this.scrollX,
        y: worldY - this.scrollY
      };
    }

    popAtPoint(px, py) {
      // Hit-test hex coordinates in neighborhood to ensure precision
      const center = this.getHexCoords(px, py);
      const candidates = [
        center,
        { col: center.col + 1, row: center.row },
        { col: center.col - 1, row: center.row },
        { col: center.col, row: center.row + 1 },
        { col: center.col, row: center.row - 1 }
      ];

      for (const { col, row } of candidates) {
        const screen = this.getScreenCoords(col, row);
        const distSq = (px - screen.x) ** 2 + (py - screen.y) ** 2;

        if (distSq <= (this.radius * 0.95) ** 2) {
          this.executePop(col, row, screen.x, screen.y);
          break;
        }
      }
    }

    executePop(col, row, screenX, screenY) {
      const key = `${col},${row}`;
      if (this.poppedMap.has(key)) return; // Already popped

      const now = performance.now();
      const mode = this.currentMode;

      // Mark popped
      this.poppedMap.set(key, {
        time: now,
        mode: mode,
        col: col,
        row: row
      });

      // Audio synthesis
      const pitchVar = 0.9 + Math.random() * 0.25;
      this.audio.playPop(mode, col, row, pitchVar);

      // Tactile Haptic buzz on supported mobile devices
      if (navigator.vibrate) {
        try { navigator.vibrate(12); } catch (e) {}
      }

      // Visual particles & effects
      const particleCount = mode === 'gold' ? 24 : (mode === 'crystal' ? 14 : 8);
      this.particles.spawn(screenX, screenY, mode, particleCount);

      if (mode === 'gold') {
        this.screenShake = 6;
      }

      // Track statistics & combos
      this.totalPopped++;
      this.ppsHistory.push(now);
      this.updateTotalDisplay();
      this.incrementCombo();
    }

    incrementCombo() {
      this.currentCombo++;
      this.elCombo.textContent = `${this.currentCombo}x`;
      this.elComboBar.style.width = '100%';

      clearTimeout(this.comboTimer);

      // Check milestones for arcade popup toast
      if (this.currentCombo === 10) this.showToast('🫧 POP-TASTIC! (10x)');
      else if (this.currentCombo === 25) this.showToast('⚡ BUBBLE MANIA! (25x)');
      else if (this.currentCombo === 50) this.showToast('🔥 HYPER SWEEP! (50x)');
      else if (this.currentCombo === 100) this.showToast('👑 ASMR GODLIKE! (100x)');
      else if (this.currentCombo === 200) this.showToast('🚀 UNSTOPPABLE TRANSCENDENCE! (200x)');

      // Decay timer: 1.2s to chain the combo
      this.comboTimer = setTimeout(() => {
        this.currentCombo = 0;
        this.elCombo.textContent = '0x';
        this.elComboBar.style.width = '0%';
      }, 1200);
    }

    showToast(text) {
      this.elToast.textContent = text;
      this.elToast.classList.add('show');
      setTimeout(() => {
        this.elToast.classList.remove('show');
      }, 1400);
    }

    updateTotalDisplay() {
      this.elTotal.textContent = this.totalPopped.toLocaleString();
      localStorage.setItem('bored_ai_bubble_popped', String(this.totalPopped));
    }

    freshRoll() {
      this.audio.playUnroll();
      this.poppedMap.clear();
      this.currentCombo = 0;
      this.elCombo.textContent = '0x';
      this.showToast('🔄 FRESH SHEET UNROLLED!');
      this.screenShake = 4;
    }

    triggerSteamroller() {
      if (this.roller.active) return;
      this.roller.start(this.height);
      this.showToast('🚜 STEAMROLLER DEPLOYED!');

      // Vibrate if available
      if (navigator.vibrate) {
        try { navigator.vibrate([40, 60, 40, 60, 40]); } catch (e) {}
      }
    }

    triggerGodBubble() {
      if (this.godBubble.active) return;
      this.godBubble.spawn(this.width, this.height);
      this.showToast('⚡ THE GOD BUBBLE DESCENDS!');
    }

    detonateGodBubble() {
      this.godBubble.active = false;
      this.screenShake = 25;
      this.audio.playGodExplosion();

      // Huge shower of particles
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          this.particles.spawn(this.godBubble.x, this.godBubble.y, 'gold', 30);
          this.particles.spawn(this.godBubble.x, this.godBubble.y, 'crystal', 20);
        }, i * 60);
      }

      // Pop every bubble currently visible in screen
      const minCol = Math.floor((this.scrollX) / this.hexSpacingX) - 1;
      const maxCol = Math.ceil((this.scrollX + this.width) / this.hexSpacingX) + 1;
      const minRow = Math.floor((this.scrollY) / this.hexSpacingY) - 1;
      const maxRow = Math.ceil((this.scrollY + this.height) / this.hexSpacingY) + 1;

      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          const screen = this.getScreenCoords(c, r);
          this.executePop(c, r, screen.x, screen.y);
        }
      }

      this.showToast('💥 SUPERNOVA DETONATION!');
    }

    // Main 120 FPS Animation Loop
    loop(timestamp) {
      // Screen Shake
      let offsetX = 0;
      let offsetY = 0;
      if (this.screenShake > 0) {
        offsetX = (Math.random() - 0.5) * this.screenShake;
        offsetY = (Math.random() - 0.5) * this.screenShake;
        this.screenShake *= 0.9;
        if (this.screenShake < 0.2) this.screenShake = 0;
      }

      this.ctx.save();
      this.ctx.translate(offsetX, offsetY);

      // Clear Canvas
      this.ctx.clearRect(-10, -10, this.width + 20, this.height + 20);

      // Render Virtualized Visible Bubble Wrap Grid
      this.drawBubbleGrid();

      // Update & Draw Steamroller
      if (this.roller.active) {
        this.roller.update(this.width, (prevX, currX) => {
          this.audio.playRollerCrunch();
          const colMin = Math.floor((prevX + this.scrollX) / this.hexSpacingX) - 1;
          const colMax = Math.ceil((currX + this.scrollX) / this.hexSpacingX) + 1;
          const rowMin = Math.floor(this.scrollY / this.hexSpacingY) - 1;
          const rowMax = Math.ceil((this.scrollY + this.height) / this.hexSpacingY) + 1;

          for (let r = rowMin; r <= rowMax; r++) {
            for (let c = colMin; c <= colMax; c++) {
              const s = this.getScreenCoords(c, r);
              if (s.x >= prevX - 30 && s.x <= currX + 30) {
                this.executePop(c, r, s.x, s.y);
              }
            }
          }
        });
        this.roller.draw(this.ctx);
      }

      // Update & Draw God Bubble Easter Egg
      if (this.godBubble.active) {
        this.godBubble.update();
        this.godBubble.draw(this.ctx);
      }

      // Update & Draw Particles
      this.particles.update();
      this.particles.draw(this.ctx);

      this.ctx.restore();

      requestAnimationFrame(this.loop.bind(this));
    }

    drawBubbleGrid() {
      const margin = this.radius * 2;
      const minCol = Math.floor((this.scrollX - margin) / this.hexSpacingX) - 1;
      const maxCol = Math.ceil((this.scrollX + this.width + margin) / this.hexSpacingX) + 1;
      const minRow = Math.floor((this.scrollY - margin) / this.hexSpacingY) - 1;
      const maxRow = Math.ceil((this.scrollY + this.height + margin) / this.hexSpacingY) + 1;

      const r = this.radius;

      for (let row = minRow; row <= maxRow; row++) {
        const rowOffset = (row % 2 !== 0) ? this.hexSpacingX / 2 : 0;
        for (let col = minCol; col <= maxCol; col++) {
          const screenX = col * this.hexSpacingX + rowOffset - this.scrollX;
          const screenY = row * this.hexSpacingY - this.scrollY;

          // Frustum Culling
          if (screenX < -margin || screenX > this.width + margin ||
              screenY < -margin || screenY > this.height + margin) {
            continue;
          }

          const key = `${col},${row}`;
          const poppedInfo = this.poppedMap.get(key);

          if (poppedInfo) {
            this.drawPoppedBubble(screenX, screenY, r, poppedInfo.mode);
          } else {
            this.drawIntactBubble(screenX, screenY, r, this.currentMode);
          }
        }
      }
    }

    drawIntactBubble(x, y, r, mode) {
      const ctx = this.ctx;
      ctx.save();

      // Outer Ambient Shadow Ring
      ctx.beginPath();
      ctx.arc(x, y + 2, r * 0.95, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fill();

      // Mode-specific rendering
      if (mode === 'classic') {
        // Translucent Plastic Dome
        const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r * 0.9);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        grad.addColorStop(0.3, 'rgba(186, 230, 253, 0.45)');
        grad.addColorStop(0.7, 'rgba(56, 189, 248, 0.25)');
        grad.addColorStop(0.95, 'rgba(2, 132, 199, 0.55)');
        grad.addColorStop(1, 'rgba(3, 105, 161, 0.7)');

        ctx.beginPath();
        ctx.arc(x, y, r * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = 'rgba(125, 211, 252, 0.55)';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // High-gloss Specular Crescent
        ctx.beginPath();
        ctx.ellipse(x - r * 0.32, y - r * 0.32, r * 0.35, r * 0.16, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fill();

      } else if (mode === 'crystal') {
        // Crystalline Diamond Bubble
        const grad = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, r * 0.05, x, y, r * 0.9);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, 'rgba(224, 231, 255, 0.8)');
        grad.addColorStop(0.7, 'rgba(129, 140, 248, 0.4)');
        grad.addColorStop(1, 'rgba(67, 56, 202, 0.7)');

        ctx.beginPath();
        ctx.arc(x, y, r * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Facet lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x - r * 0.6, y);
        ctx.lineTo(x, y - r * 0.8);
        ctx.lineTo(x + r * 0.6, y);
        ctx.lineTo(x, y + r * 0.8);
        ctx.closePath();
        ctx.stroke();

      } else if (mode === 'timpani') {
        // Spun Brass / Kettle Drum Membrane
        const grad = ctx.createRadialGradient(x, y, r * 0.1, x, y, r * 0.9);
        grad.addColorStop(0, '#fed7aa');
        grad.addColorStop(0.5, '#ea580c');
        grad.addColorStop(0.85, '#9a3412');
        grad.addColorStop(1, '#431407');

        ctx.beginPath();
        ctx.arc(x, y, r * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Center acoustic ring
        ctx.beginPath();
        ctx.arc(x, y, r * 0.35, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(254, 215, 170, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

      } else if (mode === 'laser') {
        // Cyberpunk Hologram Bubble
        const grad = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 0.9);
        grad.addColorStop(0, 'rgba(34, 211, 238, 0.9)');
        grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.4)');
        grad.addColorStop(0.9, 'rgba(8, 145, 178, 0.8)');
        grad.addColorStop(1, 'rgba(236, 72, 153, 0.9)');

        ctx.beginPath();
        ctx.arc(x, y, r * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2.0;
        ctx.stroke();

        // Laser Reticle cross
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - r * 0.5, y);
        ctx.lineTo(x + r * 0.5, y);
        ctx.moveTo(x, y - r * 0.5);
        ctx.lineTo(x, y + r * 0.5);
        ctx.stroke();

      } else if (mode === 'gold') {
        // 24K Molten Gold Leaf
        const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.05, x, y, r * 0.9);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.2, '#fef08a');
        grad.addColorStop(0.6, '#f59e0b');
        grad.addColorStop(0.85, '#d97706');
        grad.addColorStop(1, '#78350f');

        ctx.beginPath();
        ctx.arc(x, y, r * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(x - r * 0.35, y - r * 0.35, r * 0.32, r * 0.15, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
      }

      ctx.restore();
    }

    drawPoppedBubble(x, y, r, mode) {
      const ctx = this.ctx;
      ctx.save();

      // Deflated flat plastic puckering ring
      ctx.beginPath();
      ctx.arc(x, y, r * 0.88, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Crinkled / Torn Micro Crease Lines
      ctx.strokeStyle = mode === 'gold' ? 'rgba(245, 158, 11, 0.35)' :
                        (mode === 'crystal' ? 'rgba(165, 180, 252, 0.35)' : 'rgba(148, 163, 184, 0.3)');
      ctx.lineWidth = 1.0;
      ctx.beginPath();

      // Center popped puncture hole
      ctx.arc(x, y, r * 0.22, 0, Math.PI * 2);

      // Wrinkle lines radiating from puncture
      ctx.moveTo(x - r * 0.22, y);
      ctx.lineTo(x - r * 0.6, y - r * 0.2);

      ctx.moveTo(x + r * 0.22, y);
      ctx.lineTo(x + r * 0.55, y + r * 0.3);

      ctx.moveTo(x, y - r * 0.22);
      ctx.lineTo(x + r * 0.15, y - r * 0.55);

      ctx.moveTo(x, y + r * 0.22);
      ctx.lineTo(x - r * 0.2, y + r * 0.55);

      ctx.stroke();

      ctx.restore();
    }
  }

  // Launch when DOM is ready
  window.addEventListener('DOMContentLoaded', () => {
    new InfiniteBubbleWrapApp();
  });
})();
