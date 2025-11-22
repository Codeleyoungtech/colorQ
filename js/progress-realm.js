// Progress Realm - Ultra Modern Level Progression
class ProgressRealm {
  constructor() {
    this.isOpen = false;
    this.levels = [];
    this.userProgress = {};
    this.init();
  }

  init() {
    this.loadUserProgress();
    this.loadLevels();
    this.setupEventListeners();
    this.updateLevelCard();
  }

  loadUserProgress() {
    const stats = JSON.parse(localStorage.getItem('userStats') || '{}');
    this.userProgress = {
      currentLevel: stats.level || 1,
      totalXP: stats.total_xp || 0,
      completedLevels: stats.completed_levels || [],
      streak: stats.streak || 0
    };
  }

  loadLevels() {
    // Use existing level system or create fallback
    if (typeof LEVEL_SYSTEM !== 'undefined') {
      this.levels = LEVEL_SYSTEM;
    } else {
      this.levels = Array.from({length: 100}, (_, i) => ({
        level: i + 1,
        title: this.generateLevelTitle(i + 1),
        xp_to_reach: (i + 1) * 100,
        milestone: (i + 1) % 10 === 0,
        unlocks: this.generateUnlocks(i + 1),
        realm_unlocked: (i + 1) % 25 === 0 ? `Realm ${Math.floor(i / 25) + 1}` : null
      }));
    }
  }

  generateLevelTitle(level) {
    const titles = [
      'First Stroke', 'Color Explorer', 'Brush Master', 'Palette Keeper', 'Art Weaver',
      'Hue Guardian', 'Canvas Sage', 'Paint Whisperer', 'Spectrum Lord', 'Quantum Artist',
      'Neon Dreamer', 'Prism Walker', 'Color Alchemist', 'Brush Virtuoso', 'Art Mystic',
      'Palette Wizard', 'Canvas Shaper', 'Paint Sorcerer', 'Hue Bender', 'Art Transcendent'
    ];
    return titles[(level - 1) % titles.length] || `Level ${level}`;
  }

  generateUnlocks(level) {
    const unlocks = [];
    if (level % 5 === 0) unlocks.push('🎨');
    if (level % 3 === 0) unlocks.push('🌈');
    if (level % 7 === 0) unlocks.push('✨');
    if (level % 10 === 0) unlocks.push('💎');
    if (level % 15 === 0) unlocks.push('🌟');
    return unlocks.length ? unlocks : ['🎁'];
  }

  setupEventListeners() {
    // Level card click to open realm
    const levelCard = document.getElementById('level-card');
    if (levelCard) {
      levelCard.addEventListener('click', () => this.openRealm());
    }

    // Back button to close realm
    const backBtn = document.getElementById('realm-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.closeRealm());
    }

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeRealm();
      }
    });

    // Setup swipe interactions
    this.setupSwipeInteractions();
  }

  setupSwipeInteractions() {
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    let velocity = 0;
    let lastTime = 0;
    let lastY = 0;
    let currentLevelIndex = 0;
    
    const container = document.getElementById('level-cards');
    if (!container) return;

    const handleStart = (e) => {
      if (!this.isOpen) return;
      
      isDragging = true;
      startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
      currentY = startY;
      lastY = startY;
      lastTime = Date.now();
      velocity = 0;
      
      container.style.transition = 'none';
      this.hapticFeedback('light');
    };

    const handleMove = (e) => {
      if (!isDragging || !this.isOpen) return;
      
      e.preventDefault();
      const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
      const deltaY = clientY - startY;
      const now = Date.now();
      const timeDelta = now - lastTime;
      
      if (timeDelta > 0) {
        velocity = (clientY - lastY) / timeDelta;
      }
      
      currentY = clientY;
      lastY = clientY;
      lastTime = now;
      
      // Apply drag transform with physics
      this.applyDragTransform(deltaY);
      
      // Create trail particles
      this.createTrailParticle(clientY);
    };

    const handleEnd = () => {
      if (!isDragging || !this.isOpen) return;
      
      isDragging = false;
      const deltaY = currentY - startY;
      const threshold = 100;
      const velocityThreshold = 0.5;
      
      container.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
      
      // Determine swipe direction and action
      if (deltaY < -threshold || velocity < -velocityThreshold) {
        // Swipe UP - Next level
        this.navigateToLevel(currentLevelIndex + 1);
        this.hapticFeedback('medium');
      } else if (deltaY > threshold || velocity > velocityThreshold) {
        // Swipe DOWN - Previous level
        this.navigateToLevel(currentLevelIndex - 1);
        this.hapticFeedback('medium');
      } else {
        // Snap back
        this.resetCardPositions();
        this.hapticFeedback('light');
      }
    };

    // Mouse events
    container.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    
    // Touch events
    container.addEventListener('touchstart', handleStart, { passive: false });
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
  }

  applyDragTransform(deltaY) {
    const container = document.getElementById('level-cards');
    const cards = container.querySelectorAll('.level-card-item');
    
    cards.forEach((card, index) => {
      const offset = index * 20;
      const scale = Math.max(0.8, 1 - (Math.abs(deltaY) / 1000));
      const rotation = (deltaY / 10) * (index % 2 === 0 ? 1 : -1);
      const translateY = deltaY * 0.8 + offset;
      
      card.style.transform = `translateY(${translateY}px) scale(${scale}) rotate(${rotation}deg)`;
      card.style.zIndex = cards.length - index;
      
      // Add depth shadows
      const shadowIntensity = Math.abs(deltaY) / 200;
      card.style.boxShadow = `0 ${10 + shadowIntensity * 20}px ${20 + shadowIntensity * 30}px rgba(0,0,0,${0.1 + shadowIntensity * 0.2})`;
    });
  }

  navigateToLevel(targetIndex) {
    const maxIndex = this.levels.length - 1;
    const newIndex = Math.max(0, Math.min(targetIndex, maxIndex));
    
    if (newIndex !== targetIndex) {
      this.resetCardPositions();
      return;
    }
    
    const container = document.getElementById('level-cards');
    const cards = container.querySelectorAll('.level-card-item');
    
    // Animate cards to new positions
    cards.forEach((card, index) => {
      const offset = (index - newIndex) * 120;
      const scale = index === newIndex ? 1 : 0.9;
      const opacity = Math.abs(index - newIndex) > 2 ? 0.3 : 1;
      
      card.style.transform = `translateY(${offset}px) scale(${scale})`;
      card.style.opacity = opacity;
      card.style.zIndex = index === newIndex ? 100 : 50 - Math.abs(index - newIndex);
    });
    
    // Update current level index
    this.currentLevelIndex = newIndex;
  }

  resetCardPositions() {
    const container = document.getElementById('level-cards');
    const cards = container.querySelectorAll('.level-card-item');
    
    cards.forEach((card, index) => {
      card.style.transform = 'translateY(0) scale(1) rotate(0deg)';
      card.style.opacity = '1';
      card.style.zIndex = '';
      card.style.boxShadow = '';
    });
  }

  createTrailParticle(y) {
    const particle = document.createElement('div');
    particle.className = 'trail-particle';
    particle.style.cssText = `
      position: fixed;
      left: 50%;
      top: ${y}px;
      width: 6px;
      height: 6px;
      background: linear-gradient(45deg, #FF2D92, #FF6B35);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      animation: trailFade 0.8s ease-out forwards;
    `;
    
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 800);
  }

  hapticFeedback(intensity = 'light') {
    if (!navigator.vibrate) return;
    
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [50]
    };
    
    navigator.vibrate(patterns[intensity] || patterns.light);
  }

  updateLevelCard() {
    const levelStat = document.getElementById('level-stat');
    const progressRing = document.getElementById('level-progress');
    
    if (levelStat) {
      levelStat.textContent = this.userProgress.currentLevel;
    }

    if (progressRing) {
      const currentLevel = this.levels[this.userProgress.currentLevel - 1];
      const nextLevel = this.levels[this.userProgress.currentLevel];
      
      if (currentLevel && nextLevel) {
        const xpForLevel = nextLevel.xp_to_reach - currentLevel.xp_to_reach;
        const xpProgress = this.userProgress.totalXP - currentLevel.xp_to_reach;
        const percentage = Math.min((xpProgress / xpForLevel) * 100, 100);
        const circumference = 157; // 2 * π * 25
        const offset = circumference - (percentage / 100) * circumference;
        
        progressRing.style.strokeDashoffset = offset;
      }
    }
  }

  openRealm() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    const realm = document.getElementById('progress-realm');
    const levelCard = document.getElementById('level-card');
    
    // Haptic feedback
    this.hapticFeedback('medium');
    
    // Animate level card expansion
    if (levelCard) {
      levelCard.style.transform = 'scale(1.1)';
      levelCard.style.zIndex = '9999';
      
      setTimeout(() => {
        levelCard.style.transform = 'scale(20)';
        levelCard.style.opacity = '0';
      }, 100);
    }
    
    // Show realm with delay
    setTimeout(() => {
      realm.classList.add('active');
      this.renderLevels();
      this.updateRealmProgress();
      
      // Reset level card
      if (levelCard) {
        setTimeout(() => {
          levelCard.style.transform = '';
          levelCard.style.opacity = '';
          levelCard.style.zIndex = '';
        }, 600);
      }
    }, 200);
  }

  closeRealm() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    const realm = document.getElementById('progress-realm');
    
    realm.classList.remove('active');
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }
  }

  renderLevels() {
    const container = document.getElementById('level-cards');
    if (!container) return;
    
    container.innerHTML = '';
    this.currentLevelIndex = this.userProgress.currentLevel - 1;
    
    // Render levels with staggered animation and stacking
    this.levels.forEach((level, index) => {
      setTimeout(() => {
        const card = this.createLevelCard(level, index);
        container.appendChild(card);
        
        // Animate in with stacking effect
        requestAnimationFrame(() => {
          const offset = (index - this.currentLevelIndex) * 120;
          const scale = index === this.currentLevelIndex ? 1 : 0.95;
          const zIndex = index === this.currentLevelIndex ? 100 : 50 - Math.abs(index - this.currentLevelIndex);
          
          card.style.transform = `translateY(${offset}px) scale(${scale})`;
          card.style.opacity = '1';
          card.style.zIndex = zIndex;
        });
      }, index * 30);
    });
  }

  createLevelCard(level, index) {
    const card = document.createElement('div');
    card.className = `level-card-item ${this.getLevelStatus(level)}`;
    card.style.transform = 'translateY(50px)';
    card.style.opacity = '0';
    card.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
    
    // Add depth shadows for stacking
    const shadowDepth = Math.abs(index - this.currentLevelIndex) * 5;
    card.style.boxShadow = `0 ${10 + shadowDepth}px ${20 + shadowDepth * 2}px rgba(0,0,0,${0.1 + shadowDepth * 0.02})`;
    
    const isCompleted = this.userProgress.completedLevels.includes(level.level);
    const isCurrent = level.level === this.userProgress.currentLevel;
    const isLocked = level.level > this.userProgress.currentLevel;
    
    card.innerHTML = `
      <div class="level-number">${level.level}</div>
      <div class="level-title">${level.title}</div>
      <div class="level-status ${this.getLevelStatus(level)}">
        ${isCompleted ? '✅ Completed' : isCurrent ? '⚡ Current' : '🔒 Locked'}
      </div>
      <div class="unlock-preview">
        ${level.unlocks.map(icon => `<div class="unlock-icon">${icon}</div>`).join('')}
      </div>
      <div class="xp-requirement">
        ${isCompleted ? 'Mastered' : isCurrent ? 'In Progress' : `${level.xp_to_reach} XP Required`}
      </div>
      ${isCurrent ? '<div class="floating-particles"></div>' : ''}
    `;
    
    // Add click handler
    if (!isLocked) {
      card.addEventListener('click', () => this.onLevelClick(level));
    }
    
    // Add particles for current level
    if (isCurrent) {
      this.addFloatingParticles(card);
    }
    
    return card;
  }

  getLevelStatus(level) {
    if (this.userProgress.completedLevels.includes(level.level)) return 'completed';
    if (level.level === this.userProgress.currentLevel) return 'current';
    if (level.level > this.userProgress.currentLevel) return 'locked';
    if (level.milestone) return 'milestone';
    return '';
  }

  addFloatingParticles(card) {
    const particlesContainer = card.querySelector('.floating-particles');
    if (!particlesContainer) return;
    
    setInterval(() => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 2 + 's';
      particle.style.animationDuration = (3 + Math.random() * 2) + 's';
      
      particlesContainer.appendChild(particle);
      
      setTimeout(() => particle.remove(), 4000);
    }, 800);
  }

  onLevelClick(level) {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
    
    // Close realm and navigate to create art
    this.closeRealm();
    
    setTimeout(() => {
      window.location.href = 'app.html?new=true';
    }, 300);
  }

  updateRealmProgress() {
    const progressText = document.getElementById('realm-progress-text');
    const streakDays = document.getElementById('streak-days');
    
    if (progressText) {
      const currentLevel = this.userProgress.currentLevel;
      const nextLevel = currentLevel + 1;
      const currentLevelData = this.levels[currentLevel - 1];
      const nextLevelData = this.levels[currentLevel];
      
      if (currentLevelData && nextLevelData) {
        const xpForLevel = nextLevelData.xp_to_reach - currentLevelData.xp_to_reach;
        const xpProgress = this.userProgress.totalXP - currentLevelData.xp_to_reach;
        
        progressText.textContent = `Level ${currentLevel} → Level ${nextLevel} • ${xpProgress} / ${xpForLevel} XP`;
      }
    }
    
    if (streakDays) {
      streakDays.textContent = this.userProgress.streak;
    }
  }

  // Public method to update progress from other systems
  updateProgress(newProgress) {
    this.userProgress = { ...this.userProgress, ...newProgress };
    this.updateLevelCard();
    
    if (this.isOpen) {
      this.updateRealmProgress();
    }
  }
}

// Initialize when DOM is ready
let progressRealm;
document.addEventListener('DOMContentLoaded', () => {
  progressRealm = new ProgressRealm();
  
  // Add gradient definition for progress ring
  const svg = document.querySelector('.progress-ring');
  if (svg && !document.getElementById('levelGradient')) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.id = 'levelGradient';
    gradient.innerHTML = `
      <stop offset="0%" style="stop-color:#FF2D92;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF6B35;stop-opacity:1" />
    `;
    defs.appendChild(gradient);
    svg.appendChild(defs);
  }
  
  // Add trail particle animation CSS
  if (!document.getElementById('trailParticleStyles')) {
    const style = document.createElement('style');
    style.id = 'trailParticleStyles';
    style.textContent = `
      @keyframes trailFade {
        0% { opacity: 1; transform: translateX(-50%) scale(1); }
        100% { opacity: 0; transform: translateX(-50%) scale(0.3); }
      }
    `;
    document.head.appendChild(style);
  }
});

// Export for use by other modules
window.progressRealm = progressRealm;