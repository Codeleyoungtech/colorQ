// Special Effects Module
class SpecialEffects {
  constructor(canvasEngine) {
    this.canvas = canvasEngine;
    this.effects = {
      particles: true,
      gravity: false,
      glow: false,
      sparkles: false,
      mirror: false,
      kaleidoscope: false
    };
    this.particles = [];
    this.init();
  }

  init() {
    this.setupEffectLoop();
  }

  setupEffectLoop() {
    const animate = () => {
      if (this.effects.particles) {
        this.updateParticles();
      }
      if (this.effects.gravity) {
        this.applyGravity();
      }
      requestAnimationFrame(animate);
    };
    animate();
  }

  // Particle explosion on click
  createParticleExplosion(x, y, color) {
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color: color,
        life: 1,
        decay: 0.02,
        size: Math.random() * 4 + 2
      });
    }
  }

  updateParticles() {
    const ctx = this.canvas.ctx;
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.1; // gravity
      particle.life -= particle.decay;

      if (particle.life > 0) {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      }
      return false;
    });
  }

  // Gravity paint mode
  applyGravity() {
    const ctx = this.canvas.ctx;
    const imageData = ctx.getImageData(0, 0, this.canvas.canvas.width, this.canvas.canvas.height);
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    for (let y = height - 2; y >= 0; y--) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const belowIndex = ((y + 1) * width + x) * 4;

        if (data[index + 3] > 0 && data[belowIndex + 3] === 0) {
          // Move pixel down
          data[belowIndex] = data[index];
          data[belowIndex + 1] = data[index + 1];
          data[belowIndex + 2] = data[index + 2];
          data[belowIndex + 3] = data[index + 3];

          data[index] = 0;
          data[index + 1] = 0;
          data[index + 2] = 0;
          data[index + 3] = 0;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  // Glow effect
  applyGlow(ctx, x, y, size, color) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = size * 2;
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Sparkle trail
  createSparkleTrail(x, y) {
    if (Math.random() < 0.3) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: '#ffffff',
        life: 1,
        decay: 0.05,
        size: Math.random() * 3 + 1,
        twinkle: Math.random() * Math.PI * 2
      });
    }
  }

  // Mirror drawing
  applyMirror(ctx, x, y, size, color, mode = 'horizontal') {
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    if (mode === 'horizontal' || mode === 'both') {
      const mirrorX = centerX * 2 - x;
      ctx.beginPath();
      ctx.arc(mirrorX, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    if (mode === 'vertical' || mode === 'both') {
      const mirrorY = centerY * 2 - y;
      ctx.beginPath();
      ctx.arc(x, mirrorY, size, 0, Math.PI * 2);
      ctx.fill();
    }

    if (mode === 'both') {
      const mirrorX = centerX * 2 - x;
      const mirrorY = centerY * 2 - y;
      ctx.beginPath();
      ctx.arc(mirrorX, mirrorY, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Kaleidoscope mode
  applyKaleidoscope(ctx, x, y, size, color) {
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const segments = 8;

    for (let i = 0; i < segments; i++) {
      const angle = (i * Math.PI * 2) / segments;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const relX = x - centerX;
      const relY = y - centerY;

      const rotX = relX * cos - relY * sin + centerX;
      const rotY = relX * sin + relY * cos + centerY;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(rotX, rotY, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Canvas shake effect
  shakeCanvas() {
    const canvas = this.canvas.canvas;
    const originalTransform = canvas.style.transform;
    
    let shakeCount = 0;
    const maxShakes = 10;
    
    const shake = () => {
      if (shakeCount < maxShakes) {
        const x = (Math.random() - 0.5) * 10;
        const y = (Math.random() - 0.5) * 10;
        canvas.style.transform = `translate(${x}px, ${y}px)`;
        shakeCount++;
        setTimeout(shake, 50);
      } else {
        canvas.style.transform = originalTransform;
      }
    };
    
    shake();
  }

  // Time-lapse recording
  startTimelapseRecording() {
    this.timelapseFrames = [];
    this.recordingInterval = setInterval(() => {
      this.timelapseFrames.push(this.canvas.canvas.toDataURL());
    }, 500);
  }

  stopTimelapseRecording() {
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      return this.timelapseFrames;
    }
    return [];
  }

  // Pressure sensitivity simulation
  simulatePressure(velocity) {
    return Math.min(1, Math.max(0.1, velocity / 10));
  }

  setEffect(effect, enabled) {
    this.effects[effect] = enabled;
  }

  getEffect(effect) {
    return this.effects[effect];
  }
}