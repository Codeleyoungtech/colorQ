// Animation and Micro-interactions Module
class AnimationEngine {
  constructor(app) {
    this.app = app;
    this.animationSpeed = 'normal';
    this.particles = [];
    this.confettiActive = false;
    
    this.init();
  }

  init() {
    this.setupRippleEffects();
    this.setupElasticAnimations();
    this.setupMorphingTransitions();
    this.setupLoadingSkeletons();
    this.createParticleSystem();
  }

  setupRippleEffects() {
    // Add ripple effect to all buttons
    document.addEventListener('click', (e) => {
      const button = e.target.closest('button, .color-swatch, .tool-btn, .nav-item, .fab-item');
      if (!button) return;

      this.createRipple(button, e);
    });
  }

  createRipple(element, event) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  }

  setupElasticAnimations() {
    // Add elastic bounce to buttons
    document.addEventListener('mousedown', (e) => {
      const button = e.target.closest('button, .color-swatch, .tool-btn');
      if (!button) return;

      button.style.transform = 'scale(0.95)';
      button.style.transition = 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)';
    });

    document.addEventListener('mouseup', (e) => {
      const button = e.target.closest('button, .color-swatch, .tool-btn');
      if (!button) return;

      button.style.transform = 'scale(1)';
      button.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    });

    // Touch events for mobile
    document.addEventListener('touchstart', (e) => {
      const button = e.target.closest('button, .color-swatch, .tool-btn');
      if (!button) return;

      button.style.transform = 'scale(0.95)';
      button.style.transition = 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)';
    });

    document.addEventListener('touchend', (e) => {
      const button = e.target.closest('button, .color-swatch, .tool-btn');
      if (!button) return;

      button.style.transform = 'scale(1)';
      button.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    });
  }

  setupMorphingTransitions() {
    // Smooth transitions between UI states
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const element = mutation.target;
          if (element.classList.contains('active') || element.classList.contains('hidden')) {
            this.animateStateChange(element);
          }
        }
      });
    });

    // Observe all interactive elements
    document.querySelectorAll('button, .panel, .modal').forEach(element => {
      observer.observe(element, { attributes: true });
    });
  }

  animateStateChange(element) {
    element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    
    if (element.classList.contains('hidden')) {
      element.style.opacity = '0';
      element.style.transform = 'translateY(-10px)';
    } else {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }
  }

  setupLoadingSkeletons() {
    // Create skeleton loaders for async content
    this.createSkeletonLoader = (container, type = 'default') => {
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton-loader';
      
      switch (type) {
        case 'color-grid':
          skeleton.innerHTML = Array(12).fill(0).map(() => 
            '<div class="skeleton-item skeleton-color"></div>'
          ).join('');
          break;
        case 'project-card':
          skeleton.innerHTML = `
            <div class="skeleton-item skeleton-image"></div>
            <div class="skeleton-item skeleton-text"></div>
            <div class="skeleton-item skeleton-text short"></div>
          `;
          break;
        default:
          skeleton.innerHTML = '<div class="skeleton-item skeleton-default"></div>';
      }
      
      container.appendChild(skeleton);
      return skeleton;
    };
  }

  createParticleSystem() {
    this.particleCanvas = document.createElement('canvas');
    this.particleCanvas.className = 'particle-canvas';
    this.particleCanvas.width = window.innerWidth;
    this.particleCanvas.height = window.innerHeight;
    document.body.appendChild(this.particleCanvas);
    
    this.particleCtx = this.particleCanvas.getContext('2d');
    
    // Resize handler
    window.addEventListener('resize', () => {
      this.particleCanvas.width = window.innerWidth;
      this.particleCanvas.height = window.innerHeight;
    });
    
    this.startParticleLoop();
  }

  startParticleLoop() {
    const animate = () => {
      this.particleCtx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);
      
      // Update and draw particles
      this.particles = this.particles.filter(particle => {
        particle.update();
        particle.draw(this.particleCtx);
        return particle.life > 0;
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }

  createConfetti(x, y, colors = ['#ff6b9d', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']) {
    for (let i = 0; i < 30; i++) {
      this.particles.push(new ConfettiParticle(x, y, colors[Math.floor(Math.random() * colors.length)]));
    }
  }

  createSparkles(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new SparkleParticle(x, y));
    }
  }

  createColorExplosion(x, y, color) {
    for (let i = 0; i < 20; i++) {
      this.particles.push(new ColorParticle(x, y, color));
    }
  }

  // Achievement celebration animation
  celebrateAchievement(achievementName) {
    const modal = document.createElement('div');
    modal.className = 'achievement-modal';
    modal.innerHTML = `
      <div class="achievement-content">
        <div class="achievement-icon">🏆</div>
        <h3>Achievement Unlocked!</h3>
        <p>${achievementName}</p>
        <div class="achievement-sparkles"></div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Trigger confetti
    this.createConfetti(window.innerWidth / 2, window.innerHeight / 2);
    
    // Animate modal
    setTimeout(() => modal.classList.add('show'), 100);
    
    // Auto remove
    setTimeout(() => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 500);
    }, 3000);
  }

  // Level up animation
  levelUpAnimation(newLevel) {
    const levelUp = document.createElement('div');
    levelUp.className = 'level-up-animation';
    levelUp.innerHTML = `
      <div class="level-up-content">
        <div class="level-number">${newLevel}</div>
        <div class="level-text">LEVEL UP!</div>
        <div class="level-rays"></div>
      </div>
    `;
    
    document.body.appendChild(levelUp);
    
    // Trigger celebration effects
    this.createConfetti(window.innerWidth / 2, window.innerHeight / 2);
    
    setTimeout(() => levelUp.classList.add('show'), 100);
    setTimeout(() => {
      levelUp.classList.remove('show');
      setTimeout(() => levelUp.remove(), 1000);
    }, 2000);
  }

  // Color preview animation
  animateColorPreview(element, color) {
    const preview = document.createElement('div');
    preview.className = 'color-preview-popup';
    preview.style.backgroundColor = color;
    
    const rect = element.getBoundingClientRect();
    preview.style.left = rect.left + rect.width / 2 + 'px';
    preview.style.top = rect.top - 60 + 'px';
    
    document.body.appendChild(preview);
    
    setTimeout(() => preview.classList.add('show'), 10);
    setTimeout(() => {
      preview.classList.remove('show');
      setTimeout(() => preview.remove(), 300);
    }, 1000);
  }

  // Smooth elastic scrolling
  smoothScrollTo(element, duration = 500) {
    const start = window.pageYOffset;
    const target = element.getBoundingClientRect().top + start;
    const distance = target - start;
    let startTime = null;

    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      
      window.scrollTo(0, start + distance * easeInOutCubic(progress));
      
      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  }

  // Morphing button animation
  morphButton(button, newIcon, newText) {
    button.style.transform = 'scale(0.8)';
    button.style.opacity = '0.7';
    
    setTimeout(() => {
      if (newIcon) {
        const icon = button.querySelector('svg');
        if (icon) icon.innerHTML = newIcon;
      }
      if (newText) {
        const text = button.querySelector('span');
        if (text) text.textContent = newText;
      }
      
      button.style.transform = 'scale(1)';
      button.style.opacity = '1';
    }, 150);
  }

  // Floating animation for elements
  addFloatingAnimation(element, intensity = 'subtle') {
    const intensities = {
      subtle: { distance: 5, duration: 3000 },
      normal: { distance: 10, duration: 2000 },
      strong: { distance: 20, duration: 1500 }
    };
    
    const config = intensities[intensity];
    
    const animate = () => {
      element.style.transform = `translateY(${Math.sin(Date.now() / config.duration) * config.distance}px)`;
      requestAnimationFrame(animate);
    };
    
    animate();
  }

  // Pulse animation for notifications
  pulseElement(element, color = '#3b82f6') {
    element.style.boxShadow = `0 0 0 0 ${color}`;
    element.style.animation = 'pulse 2s infinite';
    
    setTimeout(() => {
      element.style.animation = '';
      element.style.boxShadow = '';
    }, 2000);
  }

  // Shake animation for errors
  shakeElement(element) {
    element.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
      element.style.animation = '';
    }, 500);
  }
}

// Particle classes
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 10;
    this.vy = (Math.random() - 0.5) * 10;
    this.life = 1;
    this.decay = Math.random() * 0.02 + 0.01;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.2; // gravity
    this.life -= this.decay;
  }

  draw(ctx) {
    ctx.globalAlpha = this.life;
  }
}

class ConfettiParticle extends Particle {
  constructor(x, y, color) {
    super(x, y);
    this.color = color;
    this.size = Math.random() * 8 + 4;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 10;
  }

  update() {
    super.update();
    this.rotation += this.rotationSpeed;
  }

  draw(ctx) {
    super.draw(ctx);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation * Math.PI / 180);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

class SparkleParticle extends Particle {
  constructor(x, y) {
    super(x, y);
    this.size = Math.random() * 4 + 2;
    this.twinkle = Math.random() * Math.PI * 2;
  }

  update() {
    super.update();
    this.twinkle += 0.2;
  }

  draw(ctx) {
    super.draw(ctx);
    const alpha = (Math.sin(this.twinkle) + 1) / 2;
    ctx.globalAlpha = this.life * alpha;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

class ColorParticle extends Particle {
  constructor(x, y, color) {
    super(x, y);
    this.color = color;
    this.size = Math.random() * 6 + 3;
  }

  draw(ctx) {
    super.draw(ctx);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}