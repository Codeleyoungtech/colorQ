// Simple Level Map UI System
class LevelMapUI {
  constructor() {
    this.levels = [];
    this.userProgress = {};
    this.tooltip = null;
    
    this.init();
  }
  
  init() {
    this.loadLevelsData();
    this.loadUserProgress();
    this.setupEventListeners();
  }
  
  loadLevelsData() {
    // Use the existing level system data or create basic levels
    if (typeof LEVEL_SYSTEM !== 'undefined') {
      this.levels = LEVEL_SYSTEM;
    } else {
      this.levels = Array.from({length: 100}, (_, i) => ({
        level: i + 1,
        title: `Level ${i + 1}`,
        xp_to_reach: (i + 1) * 100,
        milestone: (i + 1) % 10 === 0,
        unlocks: [`Unlock ${i + 1}`]
      }));
    }
  }
  
  loadUserProgress() {
    const stats = JSON.parse(localStorage.getItem('userStats') || '{}');
    this.userProgress = {
      currentLevel: stats.level || 1,
      totalXP: stats.total_xp || 0,
      completedLevels: stats.completed_levels || []
    };
  }
  
  setupEventListeners() {
    const closeBtn = document.getElementById('map-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
  }
  
  renderLevels() {
    const container = document.getElementById('levels-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    this.levels.forEach(level => {
      const levelItem = document.createElement('div');
      levelItem.className = `level-item ${this.getLevelClass(level)}`;
      levelItem.textContent = level.level;
      
      // Add milestone icon
      if (level.milestone) {
        const icon = document.createElement('div');
        icon.className = 'milestone-icon';
        icon.textContent = '👑';
        levelItem.appendChild(icon);
      }
      
      // Event listeners
      levelItem.addEventListener('click', () => this.onLevelClick(level));
      
      container.appendChild(levelItem);
    });
  }
  
  getLevelClass(level) {
    if (this.userProgress.completedLevels.includes(level.level)) {
      return level.milestone ? 'completed milestone' : 'completed';
    } else if (level.level === this.userProgress.currentLevel) {
      return level.milestone ? 'current milestone' : 'current';
    } else if (level.level > this.userProgress.currentLevel) {
      return 'locked';
    }
    return '';
  }
  
  onLevelClick(level) {
    this.showLevelDetails(level);
  }
  
  showLevelDetails(level) {
    const modal = document.createElement('div');
    modal.className = 'level-details-modal';
    modal.innerHTML = `
      <div class="level-details-content">
        <div class="level-details-header">
          <h2>Level ${level.level}</h2>
          <button class="close-details">×</button>
        </div>
        <div class="level-details-body">
          <div class="level-status ${this.getLevelClass(level)}">
            ${level.level <= this.userProgress.currentLevel ? '✓ Completed' : 
              level.level === this.userProgress.currentLevel + 1 ? '➤ Available' : '🔒 Locked'}
          </div>
          <div class="level-info">
            <p><strong>XP Required:</strong> ${level.xp_to_reach}</p>
            <p><strong>Type:</strong> ${level.milestone ? 'Milestone Level' : 'Regular Level'}</p>
          </div>
          <div class="level-unlocks">
            <h3>Unlocks:</h3>
            ${level.unlocks.map(unlock => `<div class="unlock-item">${this.getUnlockIcon(unlock)} ${unlock}</div>`).join('')}
          </div>
          <div class="level-actions">
            ${level.level <= this.userProgress.currentLevel ? 
              '<button class="start-level-btn">Create New Art</button>' : 
              level.level === this.userProgress.currentLevel + 1 ? 
              '<button class="start-level-btn">Start This Level</button>' : 
              '<button class="start-level-btn" disabled>Level Locked</button>'}
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-details').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    
    const startBtn = modal.querySelector('.start-level-btn');
    if (startBtn && !startBtn.disabled) {
      startBtn.onclick = () => {
        modal.remove();
        this.close();
        window.location.href = 'app.html?new=true';
      };
    }
    
    // Show modal
    setTimeout(() => modal.classList.add('visible'), 10);
  }
  

  
  getUnlockIcon(unlock) {
    if (unlock.includes('Brush')) return '🎨';
    if (unlock.includes('Color')) return '🌈';
    if (unlock.includes('Effect')) return '✨';
    if (unlock.includes('Realm')) return '🌍';
    if (unlock.includes('Gems')) return '💎';
    return '🎁';
  }
  
  updateProgress() {
    const xpText = document.getElementById('xp-text');
    if (xpText) {
      const currentLevel = this.userProgress.currentLevel;
      const currentXP = this.userProgress.totalXP;
      xpText.textContent = `Level ${currentLevel} • ${currentXP} XP`;
    }
  }
  
  show() {
    const modal = document.getElementById('level-map-modal');
    if (modal) {
      modal.classList.add('active');
      this.renderLevels();
      this.updateProgress();
      
      // Scroll to current level
      setTimeout(() => {
        const currentLevelItem = document.querySelector('.level-item.current');
        if (currentLevelItem) {
          currentLevelItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }
  
  close() {
    const modal = document.getElementById('level-map-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }
}

// Initialize when DOM is ready
let levelMapUI;
document.addEventListener('DOMContentLoaded', () => {
  levelMapUI = new LevelMapUI();
  
  // Add event listener to level card
  const levelCard = document.getElementById('level-card');
  if (levelCard) {
    levelCard.addEventListener('click', () => {
      levelMapUI.show();
    });
    levelCard.style.cursor = 'pointer';
  }
});