// Daily Quest System - Modern Redesign
class DailyQuestSystem {
  constructor(app) {
    this.app = app;
    this.currentQuest = null;
    this.questTimer = null;
    this.timeRemaining = 180; // 3 minutes
    this.questActive = false;
    this.similarityTimer = null;
    this.isExpanded = false;
    
    this.questTemplates = [
      { id: 'cat', name: 'Cute Cat', colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'], difficulty: 'easy', gems: 50 },
      { id: 'galaxy', name: 'Galaxy Swirl', colors: ['#667eea', '#764ba2', '#f093fb'], difficulty: 'medium', gems: 75 },
      { id: 'pizza', name: 'Pizza Slice', colors: ['#FFD93D', '#FF6B35', '#6BCF7F'], difficulty: 'easy', gems: 50 },
      { id: 'sunset', name: 'Sunset Sky', colors: ['#FF512F', '#F09819', '#FFBE0B'], difficulty: 'medium', gems: 75 },
      { id: 'flower', name: 'Spring Flower', colors: ['#FF6B9D', '#C44569', '#F8B500'], difficulty: 'easy', gems: 50 },
      { id: 'ocean', name: 'Ocean Wave', colors: ['#0575E6', '#021B79', '#00F2FE'], difficulty: 'hard', gems: 100 },
      { id: 'rainbow', name: 'Rainbow Arc', colors: ['#FF0000', '#00FF00', '#0000FF'], difficulty: 'hard', gems: 100 },
      { id: 'forest', name: 'Forest Path', colors: ['#134E5E', '#71B280', '#2E8B57'], difficulty: 'medium', gems: 75 },
      { id: 'fire', name: 'Campfire', colors: ['#FF4E50', '#F9D423', '#FC913A'], difficulty: 'medium', gems: 75 },
      { id: 'space', name: 'Space Rocket', colors: ['#232526', '#414345', '#FF6B6B'], difficulty: 'hard', gems: 100 }
    ];
    
    this.init();
  }

  init() {
    this.loadDailyQuest();
    this.createQuestUI();
  }

  loadDailyQuest() {
    const today = new Date().toDateString();
    const savedQuest = localStorage.getItem('dailyQuest');
    
    if (!savedQuest || JSON.parse(savedQuest).date !== today) {
      this.generateDailyQuest();
    } else {
      this.currentQuest = JSON.parse(savedQuest);
    }
  }

  generateDailyQuest() {
    const today = new Date().toDateString();
    const dayIndex = new Date().getDate() % this.questTemplates.length;
    const template = this.questTemplates[dayIndex];
    
    this.currentQuest = {
      ...template,
      date: today,
      completed: false,
      score: 0,
      attempts: 0
    };
    
    localStorage.setItem('dailyQuest', JSON.stringify(this.currentQuest));
  }

  createQuestUI() {
    // Add quest button to home screen
    const homeActions = document.querySelector('.actions-section');
    if (homeActions) {
      const questBtn = document.createElement('button');
      questBtn.className = 'quest-btn-home';
      questBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="12,2 15.09,8.26 22,9 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9 8.91,8.26"></polygon>
        </svg>
        🎯 Today's Quest: ${this.currentQuest.name}
      `;
      questBtn.addEventListener('click', () => this.startQuest());
      homeActions.insertBefore(questBtn, homeActions.firstChild);
    }
  }

  startQuest() {
    if (this.currentQuest.completed) {
      this.showToast('Quest already completed today! Come back tomorrow.', 'info');
      return;
    }

    // Navigate to app with quest parameters
    const questProjectId = 'quest_' + Date.now();
    const params = new URLSearchParams({
      quest: 'true',
      project: questProjectId,
      name: 'Quest: ' + this.currentQuest.name,
      new: 'true'
    });
    
    window.location.href = `app.html?${params.toString()}`;
  }

  showQuestModal() {
    const modal = document.createElement('div');
    modal.className = 'quest-modal';
    modal.innerHTML = `
      <div class="quest-modal-content">
        <div class="quest-modal-header">
          <h2 class="quest-modal-title">🎯 Daily Quest</h2>
          <p class="quest-modal-subtitle">${this.currentQuest.name}</p>
        </div>
        <div class="quest-modal-target">
          <div class="quest-modal-target-image">
            ${this.generateTargetSVG()}
          </div>
          <div class="quest-colors">
            ${this.currentQuest.colors.map(color => 
              `<div class="quest-color" style="background: ${color}"></div>`
            ).join('')}
          </div>
        </div>
        <div class="quest-modal-actions">
          <button class="quest-btn quest-btn-secondary" onclick="this.closest('.quest-modal').remove()">Cancel</button>
          <button class="quest-btn quest-btn-primary" id="start-quest-btn">Start Quest!</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('start-quest-btn').addEventListener('click', () => {
      modal.remove();
      this.beginQuest();
    });
  }

  beginQuest() {
    this.questActive = true;
    this.timeRemaining = 180;
    this.currentQuest.attempts++;
    
    // Clear canvas and set quest colors
    this.app.canvasEngine.clear();
    this.setQuestColors();
    
    // Start timer
    this.startTimer();
    
    // Show quest UI
    this.showQuestFAB();
    
    this.showToast('Quest started! Recreate the target image!', 'success');
  }

  showQuestFAB() {
    // Remove existing quest UI
    const existingFAB = document.querySelector('.quest-fab');
    const existingPanel = document.querySelector('.quest-panel');
    if (existingFAB) existingFAB.remove();
    if (existingPanel) existingPanel.remove();
    
    // Create FAB
    const fab = document.createElement('button');
    fab.className = 'quest-fab';
    fab.innerHTML = `
      <span class="quest-fab-icon">✨</span>
      <span class="quest-fab-timer" id="quest-fab-timer">3:00</span>
    `;
    
    // Create Panel
    const panel = document.createElement('div');
    panel.className = 'quest-panel';
    panel.innerHTML = `
      <div class="quest-panel-header">
        <h3 class="quest-panel-title">Quest: ${this.currentQuest.name}</h3>
        <button class="quest-close-btn" id="quest-close">×</button>
      </div>
      <div class="quest-panel-content">
        <div class="quest-name">${this.currentQuest.name}</div>
        <div class="quest-difficulty">${this.currentQuest.difficulty}</div>
        
        <div class="quest-timer-big" id="quest-timer-big">
          <div class="quest-timer-number" id="quest-timer-number">3:00</div>
          <div class="quest-timer-label">Time Remaining</div>
        </div>
        
        <div class="quest-target-section">
          <div class="quest-target-label">Target</div>
          <div class="quest-target-image">
            ${this.generateTargetSVG()}
          </div>
        </div>
        
        <div class="quest-progress-section">
          <div class="quest-progress-header">
            <span class="quest-progress-label">Similarity</span>
            <span class="quest-progress-value" id="quest-progress-value">0%</span>
          </div>
          <div class="quest-progress-bar">
            <div class="quest-progress-fill" id="quest-progress-fill"></div>
          </div>
        </div>
        
        <div class="quest-actions">
          <button class="quest-btn quest-btn-secondary" id="quest-hint">Hint</button>
          <button class="quest-btn quest-btn-primary" id="quest-submit">Submit</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(fab);
    document.body.appendChild(panel);
    
    // Event listeners
    fab.addEventListener('click', () => this.togglePanel());
    document.getElementById('quest-close').addEventListener('click', () => this.togglePanel());
    document.getElementById('quest-submit').addEventListener('click', () => this.endQuest());
    document.getElementById('quest-hint').addEventListener('click', () => this.showHint());
    
    // Start similarity tracking
    this.startSimilarityTracking();
  }

  togglePanel() {
    const panel = document.querySelector('.quest-panel');
    const fab = document.querySelector('.quest-fab');
    
    if (panel && fab) {
      this.isExpanded = !this.isExpanded;
      panel.classList.toggle('open', this.isExpanded);
      fab.style.display = this.isExpanded ? 'none' : 'flex';
    }
  }

  startTimer() {
    this.questTimer = setInterval(() => {
      this.timeRemaining--;
      this.updateTimerDisplay();
      
      if (this.timeRemaining <= 0) {
        this.endQuest();
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Update FAB timer
    const fabTimer = document.getElementById('quest-fab-timer');
    if (fabTimer) fabTimer.textContent = display;
    
    // Update panel timer
    const panelTimer = document.getElementById('quest-timer-number');
    if (panelTimer) panelTimer.textContent = display;
    
    // Add urgency styling
    const fab = document.querySelector('.quest-fab');
    const timerBig = document.getElementById('quest-timer-big');
    
    if (this.timeRemaining <= 30) {
      fab?.classList.add('urgent');
      timerBig?.classList.add('urgent');
    }
  }

  startSimilarityTracking() {
    this.similarityTimer = setInterval(() => {
      if (this.questActive) {
        const similarity = this.scoreArtwork();
        this.updateSimilarityDisplay(similarity);
      }
    }, 2000);
  }

  updateSimilarityDisplay(similarity) {
    const progressValue = document.getElementById('quest-progress-value');
    const progressFill = document.getElementById('quest-progress-fill');
    
    if (progressValue && progressFill) {
      progressValue.textContent = similarity + '%';
      progressFill.style.width = similarity + '%';
    }
  }

  endQuest() {
    if (!this.questActive) return;
    
    this.questActive = false;
    clearInterval(this.questTimer);
    clearInterval(this.similarityTimer);
    
    // Mark quest project as submitted
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('project');
    if (projectId) {
      localStorage.setItem('questSubmitted_' + projectId, 'true');
    }
    
    // Remove quest UI
    const fab = document.querySelector('.quest-fab');
    const panel = document.querySelector('.quest-panel');
    if (fab) fab.remove();
    if (panel) panel.remove();
    
    // Score and show results
    const score = this.scoreArtwork();
    this.currentQuest.score = Math.max(this.currentQuest.score, score);
    this.currentQuest.completed = true;
    
    const baseGems = this.currentQuest.gems;
    const timeBonus = this.timeRemaining > 0 ? Math.floor(this.timeRemaining / 10) : 0;
    const streakMultiplier = this.getStreakMultiplier();
    const finalGems = Math.floor((baseGems * (score / 100) + timeBonus) * streakMultiplier);
    
    this.awardRewards(finalGems, score + timeBonus);
    localStorage.setItem('dailyQuest', JSON.stringify(this.currentQuest));
    
    if (this.app.canvasEngine) {
      this.app.canvasEngine.saveAsProject();
    }
    
    setTimeout(() => {
      this.showQuestResults(score, finalGems, timeBonus);
    }, 500);
  }

  showQuestResults(score, gems, timeBonus = 0) {
    const modal = document.createElement('div');
    modal.className = 'quest-results-modal';
    
    const getRank = (score) => {
      if (score >= 90) return { rank: 'S', message: '🏆 LEGENDARY!' };
      if (score >= 80) return { rank: 'A', message: '🎉 AMAZING!' };
      if (score >= 70) return { rank: 'B', message: '👏 GREAT!' };
      if (score >= 60) return { rank: 'C', message: '👍 GOOD!' };
      return { rank: 'D', message: '💪 KEEP TRYING!' };
    };
    
    const result = getRank(score);
    
    modal.innerHTML = `
      <div class="quest-results-content">
        <h2>🎯 Quest Complete!</h2>
        <div class="quest-score-circle">
          <div class="quest-score-number">${score}%</div>
          <div class="quest-score-label">Similarity</div>
        </div>
        <div class="quest-rewards">
          <div class="quest-reward-item">
            <div class="quest-reward-icon">💎</div>
            <div class="quest-reward-amount">+${gems} Gems</div>
          </div>
          <div class="quest-reward-item">
            <div class="quest-reward-icon">⭐</div>
            <div class="quest-reward-amount">+${score + timeBonus} XP</div>
          </div>
        </div>
        <p>${result.message}</p>
        <div class="quest-modal-actions">
          <button class="quest-btn quest-btn-secondary" onclick="this.closest('.quest-results-modal').remove()">Close</button>
          <button class="quest-btn quest-btn-primary" onclick="window.app?.canvasEngine?.shareArtwork()">Share</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Trigger confetti for high scores
    if (score >= 90 && this.app.animationEngine) {
      this.app.animationEngine.celebrateAchievement('Quest Master!');
    }
  }

  generateTargetSVG() {
    const template = this.currentQuest;
    const colors = template.colors;
    
    const patterns = {
      cat: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="60" r="25" fill="${colors[0]}"/>
        <circle cx="42" cy="52" r="6" fill="${colors[1]}"/>
        <circle cx="58" cy="52" r="6" fill="${colors[1]}"/>
        <path d="M35 35 L45 45 L35 45 Z" fill="${colors[0]}"/>
        <path d="M65 35 L55 45 L65 45 Z" fill="${colors[0]}"/>
      </svg>`,
      
      galaxy: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="35" fill="${colors[0]}"/>
        <circle cx="50" cy="50" r="22" fill="${colors[1]}"/>
        <circle cx="50" cy="50" r="10" fill="${colors[2]}"/>
      </svg>`,
      
      pizza: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 20 L80 80 L20 80 Z" fill="${colors[0]}"/>
        <circle cx="40" cy="65" r="4" fill="${colors[1]}"/>
        <circle cx="60" cy="60" r="4" fill="${colors[1]}"/>
        <circle cx="50" cy="70" r="4" fill="${colors[2]}"/>
      </svg>`,
      
      sunset: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="100" height="33" fill="${colors[0]}"/>
        <rect x="0" y="33" width="100" height="33" fill="${colors[1]}"/>
        <rect x="0" y="66" width="100" height="34" fill="${colors[2]}"/>
      </svg>`,
      
      flower: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="8" fill="${colors[1]}"/>
        <ellipse cx="50" cy="35" rx="8" ry="15" fill="${colors[0]}"/>
        <ellipse cx="65" cy="50" rx="15" ry="8" fill="${colors[0]}"/>
        <ellipse cx="50" cy="65" rx="8" ry="15" fill="${colors[0]}"/>
        <ellipse cx="35" cy="50" rx="15" ry="8" fill="${colors[0]}"/>
      </svg>`,
      
      ocean: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 60 Q25 40 50 60 T100 60 L100 100 L0 100 Z" fill="${colors[0]}"/>
        <path d="M0 70 Q25 50 50 70 T100 70 L100 100 L0 100 Z" fill="${colors[1]}"/>
        <path d="M0 80 Q25 60 50 80 T100 80 L100 100 L0 100 Z" fill="${colors[2]}"/>
      </svg>`,
      
      rainbow: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 80 A30 30 0 0 1 80 80" stroke="${colors[0]}" stroke-width="8" fill="none"/>
        <path d="M25 80 A25 25 0 0 1 75 80" stroke="${colors[1]}" stroke-width="8" fill="none"/>
        <path d="M30 80 A20 20 0 0 1 70 80" stroke="${colors[2]}" stroke-width="8" fill="none"/>
      </svg>`,
      
      forest: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="70" width="100" height="30" fill="${colors[2]}"/>
        <rect x="10" y="40" width="15" height="40" fill="${colors[1]}"/>
        <rect x="40" y="30" width="20" height="50" fill="${colors[0]}"/>
        <rect x="75" y="45" width="15" height="35" fill="${colors[1]}"/>
      </svg>`,
      
      fire: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="75" rx="25" ry="15" fill="${colors[0]}"/>
        <path d="M50 75 Q35 60 40 40 Q45 50 50 35 Q55 50 60 40 Q65 60 50 75" fill="${colors[1]}"/>
        <path d="M50 65 Q42 55 45 45 Q48 50 50 40 Q52 50 55 45 Q58 55 50 65" fill="${colors[2]}"/>
      </svg>`,
      
      space: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="100" height="100" fill="${colors[0]}"/>
        <polygon points="50,20 45,70 55,70" fill="${colors[2]}"/>
        <polygon points="45,70 35,85 65,85 55,70" fill="${colors[1]}"/>
        <circle cx="20" cy="25" r="2" fill="white"/>
        <circle cx="75" cy="35" r="1.5" fill="white"/>
        <circle cx="85" cy="60" r="1" fill="white"/>
      </svg>`
    };
    
    return patterns[template.id] || patterns.cat;
  }

  scoreArtwork() {
    const canvas = this.app.canvasEngine.canvas;
    const imageData = this.app.canvasEngine.ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let colorMatches = 0;
    let totalPixels = 0;
    let colorVariety = new Set();
    
    for (let i = 0; i < data.length; i += 32) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      if (a > 0) {
        totalPixels++;
        const hexColor = this.rgbToHex({ r, g, b });
        colorVariety.add(hexColor);
        
        for (const questColor of this.currentQuest.colors) {
          if (this.isColorSimilar(hexColor, questColor)) {
            colorMatches++;
            break;
          }
        }
      }
    }
    
    const colorScore = totalPixels > 0 ? (colorMatches / totalPixels) * 70 : 0;
    const varietyScore = Math.min(colorVariety.size / this.currentQuest.colors.length, 1) * 20;
    const coverageScore = Math.min(totalPixels / 1000, 1) * 10;
    
    return Math.min(100, Math.floor(colorScore + varietyScore + coverageScore));
  }

  isColorSimilar(color1, color2) {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    const distance = Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );
    
    return distance < 120;
  }

  hexToRgb(hex) {
    if (typeof hex === 'object') return hex;
    
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  rgbToHex(rgb) {
    return "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
  }

  setQuestColors() {
    this.currentQuest.colors.forEach(color => {
      this.app.colorManager.addToRecent(color);
    });
    this.app.colorManager.renderRecentColors();
  }

  getStreakMultiplier() {
    const streak = this.app.gamificationEngine ? this.app.gamificationEngine.userStats.login_streak : 1;
    if (streak >= 7) return 5;
    if (streak >= 3) return 2;
    return 1;
  }

  awardRewards(gems, xp) {
    const currentGems = parseInt(localStorage.getItem('gems') || '0');
    localStorage.setItem('gems', (currentGems + gems).toString());
    
    if (this.app.gamificationEngine) {
      this.app.gamificationEngine.awardXP(xp);
    }
  }

  showHint() {
    const hints = {
      cat: "Start with the main body shape, then add facial features",
      galaxy: "Create concentric circles with the darkest color outside",
      pizza: "Draw a triangle base, then add circular toppings",
      sunset: "Use horizontal strokes blending from red to yellow",
      flower: "Start with the center, then add petals around it",
      ocean: "Create wave-like curves with blue gradients",
      rainbow: "Draw an arc using all three colors in sequence",
      forest: "Layer different shades of green vertically",
      fire: "Use upward strokes with red at bottom, yellow at top",
      space: "Dark background with bright colored rocket shape"
    };
    
    const hint = hints[this.currentQuest.id] || "Use the provided colors creatively!";
    this.showToast(`💡 Hint: ${hint}`, 'info');
  }

  showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = 'background: #333; color: white; padding: 12px 16px; border-radius: 8px; margin-bottom: 8px; opacity: 0; transition: opacity 0.3s;';
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => toast.style.opacity = '1', 100);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  getCurrentQuest() {
    return this.currentQuest;
  }

  isQuestActive() {
    return this.questActive;
  }

  showModal() {
    this.showQuestModal();
  }
}