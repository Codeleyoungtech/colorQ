// Gamification System - Achievements, XP, Levels
class GamificationEngine {
  constructor(app) {
    this.app = app;
    this.achievements = [];
    this.userStats = {
      total_xp: 0,
      level: 1,
      colors_used: [],
      total_strokes: 0,
      time_spent: 0,
      artworks_created: 0,
      last_login: '',
      login_streak: 0,
      daily_challenges_completed: 0,
      achievements_unlocked: []
    };
    
    this.sessionStartTime = Date.now();
    this.init();
  }

  init() {
    this.loadUserStats();
    this.initializeAchievements();
    this.setupEventTracking();
    this.checkDailyLogin();
    this.generateDailyChallenge();
    this.createAchievementUI();
  }

  initializeAchievements() {
    this.achievements = [
      {
        id: 'first_draw',
        name: 'First Stroke',
        description: 'Make your first drawing',
        xp: 10,
        unlocked: false,
        icon: '🎨'
      },
      {
        id: 'color_explorer',
        name: 'Color Explorer',
        description: 'Use 50 different colors',
        xp: 50,
        progress: 0,
        target: 50,
        unlocked: false,
        icon: '🌈'
      },
      {
        id: 'mix_master',
        name: 'Mix Master',
        description: 'Create 25 unique color blends',
        xp: 100,
        progress: 0,
        target: 25,
        unlocked: false,
        icon: '🎭'
      },
      {
        id: 'daily_streak_3',
        name: '3-Day Streak',
        description: 'Create art 3 days in a row',
        xp: 30,
        unlocked: false,
        icon: '🔥'
      },
      {
        id: 'daily_streak_7',
        name: 'Week Warrior',
        description: 'Create art 7 days in a row',
        xp: 75,
        unlocked: false,
        icon: '⚡'
      },
      {
        id: 'speed_artist',
        name: 'Speed Artist',
        description: 'Complete a challenge in under 2 minutes',
        xp: 75,
        unlocked: false,
        icon: '💨'
      },
      {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Create art between 10PM and 6AM',
        xp: 25,
        unlocked: false,
        icon: '🦉'
      },
      {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Create art between 5AM and 8AM',
        xp: 25,
        unlocked: false,
        icon: '🐦'
      },
      {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Use undo 50 times',
        xp: 40,
        progress: 0,
        target: 50,
        unlocked: false,
        icon: '✨'
      },
      {
        id: 'canvas_cleaner',
        name: 'Fresh Start',
        description: 'Clear the canvas 10 times',
        xp: 20,
        progress: 0,
        target: 10,
        unlocked: false,
        icon: '🧹'
      },
      {
        id: 'tool_master',
        name: 'Tool Master',
        description: 'Use every available tool',
        xp: 60,
        progress: 0,
        target: 5,
        unlocked: false,
        icon: '🛠️'
      },
      {
        id: 'time_traveler',
        name: 'Time Traveler',
        description: 'Spend 2 hours total in the app',
        xp: 100,
        progress: 0,
        target: 7200000, // 2 hours in milliseconds
        unlocked: false,
        icon: '⏰'
      }
    ];
  }

  setupEventTracking() {
    // Track drawing events
    document.addEventListener('canvasDrawStart', () => {
      this.trackEvent('draw_start');
    });

    document.addEventListener('canvasDrawEnd', () => {
      this.trackEvent('draw_end');
    });

    document.addEventListener('colorSelected', (e) => {
      this.trackColorUsage(e.detail.color);
    });

    document.addEventListener('toolChanged', (e) => {
      this.trackToolUsage(e.detail.tool);
    });

    document.addEventListener('canvasCleared', () => {
      this.trackEvent('canvas_cleared');
    });

    document.addEventListener('undoAction', () => {
      this.trackEvent('undo_used');
    });

    // Track session time
    setInterval(() => {
      this.updateSessionTime();
    }, 60000); // Every minute
  }

  trackEvent(eventType) {
    switch (eventType) {
      case 'draw_start':
        if (!this.hasAchievement('first_draw')) {
          this.unlockAchievement('first_draw');
        }
        this.userStats.total_strokes++;
        break;
        
      case 'canvas_cleared':
        this.updateAchievementProgress('canvas_cleaner', 1);
        break;
        
      case 'undo_used':
        this.updateAchievementProgress('perfectionist', 1);
        break;
    }
    
    this.checkTimeBasedAchievements();
    this.saveUserStats();
  }

  trackColorUsage(color) {
    if (!this.userStats.colors_used.includes(color)) {
      this.userStats.colors_used.push(color);
      this.updateAchievementProgress('color_explorer', 1);
    }
    
    // Dispatch event for other systems
    document.dispatchEvent(new CustomEvent('colorSelected', { 
      detail: { color } 
    }));
  }

  trackToolUsage(tool) {
    const toolsUsed = this.userStats.tools_used || [];
    if (!toolsUsed.includes(tool)) {
      toolsUsed.push(tool);
      this.userStats.tools_used = toolsUsed;
      this.updateAchievementProgress('tool_master', 1);
    }
  }

  updateSessionTime() {
    const sessionTime = Date.now() - this.sessionStartTime;
    this.userStats.time_spent += 60000; // Add 1 minute
    this.updateAchievementProgress('time_traveler', 60000);
  }

  checkTimeBasedAchievements() {
    const hour = new Date().getHours();
    
    // Night owl (10PM - 6AM)
    if ((hour >= 22 || hour <= 6) && !this.hasAchievement('night_owl')) {
      this.unlockAchievement('night_owl');
    }
    
    // Early bird (5AM - 8AM)
    if (hour >= 5 && hour <= 8 && !this.hasAchievement('early_bird')) {
      this.unlockAchievement('early_bird');
    }
  }

  checkDailyLogin() {
    const today = new Date().toDateString();
    const lastLogin = this.userStats.last_login;
    
    if (lastLogin !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastLogin === yesterday.toDateString()) {
        this.userStats.login_streak++;
      } else {
        this.userStats.login_streak = 1;
      }
      
      this.userStats.last_login = today;
      this.checkStreakAchievements();
      this.saveUserStats();
    }
  }

  checkStreakAchievements() {
    if (this.userStats.login_streak >= 3 && !this.hasAchievement('daily_streak_3')) {
      this.unlockAchievement('daily_streak_3');
    }
    
    if (this.userStats.login_streak >= 7 && !this.hasAchievement('daily_streak_7')) {
      this.unlockAchievement('daily_streak_7');
    }
  }

  generateDailyChallenge() {
    const today = new Date().toDateString();
    const savedChallenge = localStorage.getItem('dailyChallenge');
    
    if (!savedChallenge || JSON.parse(savedChallenge).date !== today) {
      const challenges = [
        {
          id: 'sunset_3_colors',
          title: 'Sunset Palette',
          description: 'Create a sunset using only 3 colors',
          difficulty: 'easy',
          xp: 25,
          colors: ['#ff6b6b', '#ffa726', '#ffeb3b']
        },
        {
          id: 'match_color',
          title: 'Color Match',
          description: 'Match this color: #FF6B9D',
          difficulty: 'medium',
          xp: 40,
          targetColor: '#FF6B9D'
        },
        {
          id: 'warm_colors_only',
          title: 'Warm Vibes',
          description: 'Draw using only warm colors',
          difficulty: 'easy',
          xp: 30,
          colorFamily: 'warm'
        },
        {
          id: 'symmetrical_pattern',
          title: 'Mirror Art',
          description: 'Create a symmetrical pattern',
          difficulty: 'hard',
          xp: 60,
          requirement: 'symmetry'
        },
        {
          id: 'rgb_mix',
          title: 'RGB Master',
          description: 'Mix RGB(100,150,200) from primary colors',
          difficulty: 'hard',
          xp: 75,
          targetRGB: [100, 150, 200]
        }
      ];
      
      const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
      const dailyChallenge = {
        ...randomChallenge,
        date: today,
        completed: false
      };
      
      localStorage.setItem('dailyChallenge', JSON.stringify(dailyChallenge));
      this.showDailyChallengeNotification(dailyChallenge);
    }
  }

  showDailyChallengeNotification(challenge) {
    const notification = document.createElement('div');
    notification.className = 'daily-challenge-notification';
    notification.innerHTML = `
      <div class="challenge-header">
        <h3>🎯 Daily Challenge</h3>
        <span class="challenge-difficulty ${challenge.difficulty}">${challenge.difficulty}</span>
      </div>
      <h4>${challenge.title}</h4>
      <p>${challenge.description}</p>
      <div class="challenge-reward">+${challenge.xp} XP</div>
      <button class="challenge-accept-btn">Accept Challenge</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    notification.querySelector('.challenge-accept-btn').addEventListener('click', () => {
      this.acceptDailyChallenge(challenge);
      notification.remove();
    });
    
    // Auto hide after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }
    }, 10000);
  }

  acceptDailyChallenge(challenge) {
    this.currentChallenge = challenge;
    this.app.showToast(`Challenge accepted: ${challenge.title}`, 'success');
    
    // Apply challenge constraints if needed
    if (challenge.colors) {
      this.app.colorManager.setLimitedPalette(challenge.colors);
    }
  }

  completeDailyChallenge() {
    if (!this.currentChallenge) return;
    
    const challenge = JSON.parse(localStorage.getItem('dailyChallenge'));
    challenge.completed = true;
    localStorage.setItem('dailyChallenge', JSON.stringify(challenge));
    
    this.awardXP(challenge.xp);
    this.userStats.daily_challenges_completed++;
    
    this.app.animationEngine.celebrateAchievement(`Daily Challenge: ${challenge.title}`);
    this.app.showToast(`Challenge completed! +${challenge.xp} XP`, 'success');
    
    this.currentChallenge = null;
    this.saveUserStats();
  }

  unlockAchievement(achievementId) {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement || achievement.unlocked) return;
    
    achievement.unlocked = true;
    this.userStats.achievements_unlocked.push(achievementId);
    
    this.awardXP(achievement.xp);
    this.app.animationEngine.celebrateAchievement(achievement.name);
    this.app.showToast(`Achievement unlocked: ${achievement.name}!`, 'success');
    
    this.saveUserStats();
    this.updateAchievementUI();
  }

  updateAchievementProgress(achievementId, increment = 1) {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement || achievement.unlocked || !achievement.target) return;
    
    achievement.progress = (achievement.progress || 0) + increment;
    
    if (achievement.progress >= achievement.target) {
      this.unlockAchievement(achievementId);
    } else {
      this.updateAchievementUI();
    }
  }

  hasAchievement(achievementId) {
    return this.userStats.achievements_unlocked.includes(achievementId);
  }

  awardXP(amount) {
    const oldLevel = this.userStats.level;
    this.userStats.total_xp += amount;
    
    // Calculate new level (100 XP per level, increasing by 50 each level)
    let level = 1;
    let xpRequired = 100;
    let totalXpForLevel = 0;
    
    while (totalXpForLevel + xpRequired <= this.userStats.total_xp) {
      totalXpForLevel += xpRequired;
      level++;
      xpRequired += 50;
    }
    
    this.userStats.level = level;
    
    if (level > oldLevel) {
      this.app.animationEngine.levelUpAnimation(level);
      this.checkLevelUnlocks(level);
    }
    
    this.updateLevelDisplay();
  }

  checkLevelUnlocks(level) {
    const unlocks = {
      5: { type: 'brush', name: 'Star Stamp' },
      10: { type: 'brush', name: 'Neon Glow' },
      15: { type: 'brush', name: 'Watercolor' },
      20: { type: 'theme', name: 'Cyberpunk' },
      25: { type: 'effect', name: 'Aurora Glow' }
    };
    
    if (unlocks[level]) {
      const unlock = unlocks[level];
      this.app.showToast(`Level ${level} reward: ${unlock.name} unlocked!`, 'success');
    }
  }

  createAchievementUI() {
    // Create achievements panel button
    const achievementBtn = document.createElement('button');
    achievementBtn.className = 'achievement-btn';
    achievementBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="12,2 15.09,8.26 22,9 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9 8.91,8.26"></polygon>
      </svg>
      <span class="achievement-count">${this.userStats.achievements_unlocked.length}</span>
    `;
    
    document.querySelector('.header-right').appendChild(achievementBtn);
    
    achievementBtn.addEventListener('click', () => {
      this.showAchievementPanel();
    });
    
    // Create level display
    this.createLevelDisplay();
  }

  createLevelDisplay() {
    const levelDisplay = document.createElement('div');
    levelDisplay.className = 'level-display';
    levelDisplay.id = 'level-display';
    
    document.querySelector('.header-left .project-info').appendChild(levelDisplay);
    this.updateLevelDisplay();
  }

  updateLevelDisplay() {
    const levelDisplay = document.getElementById('level-display');
    if (!levelDisplay) return;
    
    const currentLevelXP = this.getCurrentLevelXP();
    const nextLevelXP = this.getNextLevelXP();
    const progress = ((this.userStats.total_xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    
    levelDisplay.innerHTML = `
      <div class="level-info">
        <span class="level-number">Lv.${this.userStats.level}</span>
        <div class="xp-bar">
          <div class="xp-progress" style="width: ${progress}%"></div>
        </div>
        <span class="xp-text">${this.userStats.total_xp} XP</span>
      </div>
    `;
  }

  getCurrentLevelXP() {
    let totalXP = 0;
    let xpRequired = 100;
    
    for (let i = 1; i < this.userStats.level; i++) {
      totalXP += xpRequired;
      xpRequired += 50;
    }
    
    return totalXP;
  }

  getNextLevelXP() {
    return this.getCurrentLevelXP() + (100 + (this.userStats.level - 1) * 50);
  }

  showAchievementPanel() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay achievement-modal';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2>🏆 Achievements</h2>
          <button class="modal-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <div class="achievement-stats">
            <div class="stat-item">
              <div class="stat-value">${this.userStats.level}</div>
              <div class="stat-label">Level</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${this.userStats.total_xp}</div>
              <div class="stat-label">Total XP</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${this.userStats.achievements_unlocked.length}</div>
              <div class="stat-label">Achievements</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${this.userStats.login_streak}</div>
              <div class="stat-label">Streak</div>
            </div>
          </div>
          <div class="achievement-grid">
            ${this.achievements.map(achievement => this.renderAchievement(achievement)).join('')}
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 100);
    
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
      }
    });
  }

  renderAchievement(achievement) {
    const isUnlocked = achievement.unlocked;
    const hasProgress = achievement.target && achievement.progress !== undefined;
    const progress = hasProgress ? (achievement.progress / achievement.target) * 100 : 0;
    
    return `
      <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
          <h4>${achievement.name}</h4>
          <p>${achievement.description}</p>
          ${hasProgress ? `
            <div class="achievement-progress">
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
              </div>
              <span class="progress-text">${achievement.progress || 0}/${achievement.target}</span>
            </div>
          ` : ''}
          <div class="achievement-xp">+${achievement.xp} XP</div>
        </div>
        ${isUnlocked ? '<div class="achievement-checkmark">✓</div>' : ''}
      </div>
    `;
  }

  updateAchievementUI() {
    const achievementCount = document.querySelector('.achievement-count');
    if (achievementCount) {
      achievementCount.textContent = this.userStats.achievements_unlocked.length;
    }
  }

  loadUserStats() {
    const saved = localStorage.getItem('userStats');
    if (saved) {
      this.userStats = { ...this.userStats, ...JSON.parse(saved) };
    }
  }

  saveUserStats() {
    localStorage.setItem('userStats', JSON.stringify(this.userStats));
  }

  // Public API
  getStats() {
    return this.userStats;
  }

  getAchievements() {
    return this.achievements;
  }

  resetProgress() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      localStorage.removeItem('userStats');
      localStorage.removeItem('dailyChallenge');
      location.reload();
    }
  }
}