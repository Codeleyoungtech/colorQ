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
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
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
    
    // Render levels with staggered animation
    this.levels.forEach((level, index) => {
      setTimeout(() => {
        const card = this.createLevelCard(level);
        container.appendChild(card);
        
        // Animate in
        requestAnimationFrame(() => {
          card.style.transform = 'translateY(0)';
          card.style.opacity = '1';
        });
      }, index * 50);
    });
  }

  createLevelCard(level) {
    const card = document.createElement('div');
    card.className = `level-card-item ${this.getLevelStatus(level)}`;
    card.style.transform = 'translateY(50px)';
    card.style.opacity = '0';
    card.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
    
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
});

// Export for use by other modules
window.progressRealm = progressRealm;