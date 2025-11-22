// Home Screen Controller
class HomeController {
  constructor() {
    this.stats = {
      level: 1,
      totalXP: 0,
      projects: 0,
      gems: 0,
      streak: 0
    };
    
    this.init();
  }

  init() {
    this.loadTheme();
    this.loadStats();
    this.updateStatsDisplay();
    this.setupEventListeners();
    this.updateStreakDisplay();
    this.checkDailyLogin();
    this.loadRecentProjects();
    this.currentIndex = 0;
    this.cardData = [
      {
        type: 'level',
        icon: '🏆',
        getValue: () => this.stats.level,
        getExtra: () => this.getLevelTitle(this.stats.level)
      },
      {
        type: 'xp', 
        icon: '⚡',
        getValue: () => this.stats.totalXP,
        getExtra: () => `${this.getXPToNext()} XP to next level`
      },
      {
        type: 'projects',
        icon: '🎨', 
        getValue: () => this.stats.projects,
        getExtra: () => this.stats.projects === 1 ? 'Artwork Created' : 'Artworks Created'
      },
      {
        type: 'gems',
        icon: '💎',
        getValue: () => this.stats.gems,
        getExtra: () => 'Premium Currency'
      }
    ];
    document.getElementById('card-counter')?.textContent && (document.getElementById('card-counter').textContent = '1');
  }

  loadStats() {
    // Load from gamification system
    const userStats = JSON.parse(localStorage.getItem('userStats') || '{}');
    this.stats.level = userStats.level || 1;
    this.stats.totalXP = userStats.total_xp || 0;
    this.stats.streak = userStats.login_streak || 0;
    
    // Load gems
    this.stats.gems = parseInt(localStorage.getItem('gems') || '0');
    
    // Count projects (CLQ files in localStorage)
    this.stats.projects = this.countProjects();
  }

  countProjects() {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('project_')) {
        count++;
      }
    }
    return count;
  }

  updateStatsDisplay() {
    const levelStat = document.getElementById('level-stat');
    const xpStat = document.getElementById('xp-stat');
    const projectsStat = document.getElementById('projects-stat');
    const gemsStat = document.getElementById('gems-stat');
    
    if (levelStat) levelStat.textContent = this.stats.level;
    if (xpStat) xpStat.textContent = this.formatNumber(this.stats.totalXP);
    if (projectsStat) projectsStat.textContent = this.stats.projects;
    if (gemsStat) gemsStat.textContent = this.formatNumber(this.stats.gems);
    
    // Update extra info
    const levelExtra = document.getElementById('level-extra');
    const xpExtra = document.getElementById('xp-extra');
    const projectsExtra = document.getElementById('projects-extra');
    const gemsExtra = document.getElementById('gems-extra');
    
    if (levelExtra) levelExtra.textContent = this.getLevelTitle(this.stats.level);
    if (xpExtra) xpExtra.textContent = `${this.getXPToNext()} XP to next level`;
    if (projectsExtra) projectsExtra.textContent = this.stats.projects === 1 ? 'Artwork Created' : 'Artworks Created';
    if (gemsExtra) gemsExtra.textContent = 'Premium Currency';
  }
  
  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
  
  getLevelTitle(level) {
    if (level >= 50) return 'Master Artist';
    if (level >= 40) return 'Expert Creator';
    if (level >= 30) return 'Skilled Artist';
    if (level >= 20) return 'Advanced User';
    if (level >= 10) return 'Creative Mind';
    if (level >= 5) return 'Rising Artist';
    return 'Beginner';
  }
  
  getXPToNext() {
    const nextLevelXP = this.stats.level * 100;
    const currentLevelXP = (this.stats.level - 1) * 100;
    return Math.max(0, nextLevelXP - this.stats.totalXP);
  }

  updateStreakDisplay() {
    const streakNumber = document.getElementById('streak-number');
    const streakDisplay = document.getElementById('streak-display');
    
    if (streakNumber) {
      streakNumber.textContent = this.stats.streak;
      
      // Add flame animation for high streaks
      if (this.stats.streak >= 7) {
        streakDisplay?.classList.add('streak-fire');
      } else if (this.stats.streak >= 3) {
        streakDisplay?.classList.add('streak-warm');
      }
    }
  }

  checkDailyLogin() {
    const today = new Date().toDateString();
    const lastLogin = localStorage.getItem('lastLoginDate');
    
    if (lastLogin !== today) {
      // Update login streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastLogin === yesterday.toDateString()) {
        this.stats.streak++;
      } else if (lastLogin !== null) {
        this.stats.streak = 1;
      } else {
        this.stats.streak = 1;
      }
      
      // Save updated stats
      const userStats = JSON.parse(localStorage.getItem('userStats') || '{}');
      userStats.login_streak = this.stats.streak;
      userStats.last_login = today;
      localStorage.setItem('userStats', JSON.stringify(userStats));
      localStorage.setItem('lastLoginDate', today);
      
      this.updateStreakDisplay();
      
      // Show streak notification
      if (this.stats.streak >= 3) {
        this.showStreakNotification();
      }
    }
  }

  showStreakNotification() {
    const notification = document.createElement('div');
    notification.className = 'streak-notification';
    notification.innerHTML = `
      <div class=\"notification-content\">
        <div class=\"notification-icon\">🔥</div>
        <div class=\"notification-text\">
          <h4>${this.stats.streak} Day Streak!</h4>
          <p>You're on fire! Keep it up!</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  setupEventListeners() {
    // Setup stat card swipe interactions
    this.setupStatCardSwipes();
    
    // New Project button
    const newProjectBtn = document.getElementById('new-project-btn');
    if (newProjectBtn) {
      newProjectBtn.addEventListener('click', () => {
        this.showNewProjectModal();
      });
    }

    // Import button
    const importBtn = document.getElementById('import-btn');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        this.importProject();
      });
    }

    // Achievements button
    const achievementsBtn = document.getElementById('achievements-btn');
    if (achievementsBtn) {
      achievementsBtn.addEventListener('click', () => {
        this.showAchievements();
      });
    }

    // Settings button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        this.showSettings();
      });
    }

    // Shop button
    const shopBtn = document.getElementById('shop-btn');
    if (shopBtn) {
      shopBtn.addEventListener('click', () => {
        if (window.shopSystem) {
          window.shopSystem.showShop();
        }
      });
    }

    // Clear recent projects
    const clearRecentBtn = document.getElementById('clear-recent');
    if (clearRecentBtn) {
      clearRecentBtn.addEventListener('click', () => {
        this.clearRecentProjects();
      });
    }

    // Daily quest button
    const questBtn = document.getElementById('daily-quest-btn');
    if (questBtn) {
      questBtn.addEventListener('click', () => {
        this.startDailyQuest();
      });
    }

    // New project modal events
    this.setupNewProjectModal();
    this.setupSettingsModal();
    this.setupAchievementsModal();
    this.setupDailyWheelModal();
    this.updateQuestButton();

    // Daily wheel button
    const wheelBtn = document.getElementById('daily-wheel-btn');
    if (wheelBtn) {
      wheelBtn.addEventListener('click', () => {
        this.showDailyWheel();
      });
    }
  }

  showNewProjectModal() {
    const modal = document.getElementById('new-project-modal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  setupNewProjectModal() {
    const modal = document.getElementById('new-project-modal');
    const closeBtn = document.getElementById('new-project-close');
    const cancelBtn = document.getElementById('cancel-project');
    const createBtn = document.getElementById('create-project');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal?.classList.remove('active');
      });
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        modal?.classList.remove('active');
      });
    }
    
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        this.createNewProject();
      });
    }

    // Background options
    document.querySelectorAll('.bg-option').forEach(option => {
      option.addEventListener('click', (e) => {
        document.querySelectorAll('.bg-option').forEach(opt => opt.classList.remove('active'));
        e.currentTarget.classList.add('active');
      });
    });

    // Close modal when clicking outside
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    }
  }

  createNewProject() {
    const projectName = document.getElementById('project-name')?.value || 'Untitled Project';
    const canvasSize = document.getElementById('canvas-size')?.value || '800x600';
    const background = document.querySelector('.bg-option.active')?.dataset.bg || 'white';
    
    // Save current work as a project before creating new one
    const canvasData = localStorage.getItem('canvasPersist');
    if (canvasData && canvasData.length > 100) {
      const projectId = 'project_' + Date.now();
      const projectData = {
        id: projectId,
        name: 'Previous Work',
        canvas: canvasData,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      };
      localStorage.setItem(projectId, JSON.stringify(projectData));
    }
    
    // Clear canvas for new project
    localStorage.removeItem('canvasPersist');
    
    // Create URL with parameters
    const params = new URLSearchParams({
      name: projectName,
      size: canvasSize,
      bg: background,
      project: 'project_' + Date.now(),
      new: 'true'
    });
    
    // Navigate to app
    window.location.href = `app.html?${params.toString()}`;
  }

  importProject() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.clq,.json';
    
    input.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const projectData = JSON.parse(event.target?.result);
            localStorage.setItem('loadCLQ', JSON.stringify(projectData));
            window.location.href = 'app.html';
          } catch (error) {
            alert('Invalid project file');
          }
        };
        reader.readAsText(file);
      }
    });
    
    input.click();
  }

  showSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  setupSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const closeBtn = document.getElementById('settings-close');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal?.classList.remove('active');
      });
    }

    // Load current theme and setup theme buttons
    this.loadThemeUI();
    
    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const theme = e.target.dataset.theme;
        this.changeTheme(theme);
        
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    // Other settings
    const animationSpeed = document.getElementById('animation-speed');
    if (animationSpeed) {
      animationSpeed.addEventListener('change', (e) => {
        this.updateSetting('animationSpeed', e.target.value);
      });
    }

    const soundEffects = document.getElementById('sound-effects');
    if (soundEffects) {
      soundEffects.addEventListener('change', (e) => {
        this.updateSetting('soundEffects', e.target.checked);
      });
    }

    const autoSave = document.getElementById('auto-save');
    if (autoSave) {
      autoSave.addEventListener('change', (e) => {
        this.updateSetting('autoSave', e.target.checked);
      });
    }

    // Close modal when clicking outside
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    }
  }

  changeTheme(theme) {
    // Remove old theme classes
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-pastel', 'theme-nature');
    
    // Apply new theme
    document.body.setAttribute('data-theme', theme);
    document.body.classList.add('theme-' + theme);
    
    // Save theme with proper key
    const settings = JSON.parse(localStorage.getItem('colorQ_settings') || '{}');
    settings.theme = theme;
    localStorage.setItem('colorQ_settings', JSON.stringify(settings));
    
    this.showToast(`Theme changed to ${theme}`, 'success');
  }

  clearRecentProjects() {
    if (confirm('Clear all recent projects? This cannot be undone.')) {
      // Clear project-related localStorage items
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('project_') || key === 'canvasPersist' || key === 'autoSave')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Update stats
      this.stats.projects = 0;
      this.updateStatsDisplay();
      
      // Clear projects grid
      const projectsGrid = document.getElementById('projects-grid');
      if (projectsGrid) {
        projectsGrid.innerHTML = '';
      }
      
      // Show empty state
      const emptyState = document.getElementById('empty-state');
      if (emptyState) {
        emptyState.style.display = 'block';
      }
    }
  }

  loadRecentProjects() {
    const projectsGrid = document.getElementById('projects-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (!projectsGrid) return;
    
    // Get all projects from localStorage
    const projects = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('project_')) {
        try {
          const projectData = JSON.parse(localStorage.getItem(key));
          projects.push(projectData);
        } catch (e) {
          console.error('Error loading project:', key);
        }
      }
    }
    
    // Sort by modified date
    projects.sort((a, b) => new Date(b.modified) - new Date(a.modified));
    
    if (projects.length === 0) {
      projectsGrid.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }
    
    projectsGrid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    // Render projects
    projectsGrid.innerHTML = projects.map(project => `
      <div class="project-card" onclick="homeController.openProject('${project.id}')">
        <div class="project-thumbnail">
          ${project.canvas ? 
            `<img src="${project.canvas}" alt="${project.name}">` : 
            '<div class="placeholder">🎨</div>'
          }
          ${project.isQuest ? '<div class="quest-badge">🎯</div>' : ''}
          ${project.questSubmitted ? '<div class="quest-submitted-badge">✅</div>' : ''}
        </div>
        <div class="project-info">
          <div class="project-name">${project.name}</div>
          <div class="project-meta">
            <span>${new Date(project.modified).toLocaleDateString()}</span>
            ${project.isQuest ? `<span class="quest-label">${project.questSubmitted ? 'Completed' : 'Quest'}</span>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  openProject(projectId) {
    const projectData = localStorage.getItem(projectId);
    if (projectData) {
      localStorage.setItem('loadProject', projectData);
      window.location.href = 'app.html?load=' + projectId;
    }
  }

  startDailyQuest() {
    // Check if quest is already completed
    const today = new Date().toDateString();
    const savedQuest = localStorage.getItem('dailyQuest');
    
    if (savedQuest) {
      const questData = JSON.parse(savedQuest);
      if (questData.date === today && questData.completed) {
        this.showToast('Quest already completed today! Come back tomorrow.', 'info');
        return;
      }
    }

    // Create quest system instance and show modal
    if (typeof DailyQuestSystem !== 'undefined') {
      const questSystem = new DailyQuestSystem({ showToast: this.showToast });
      questSystem.showModal();
    }
  }

  updateQuestButton() {
    const questBtn = document.getElementById('daily-quest-btn');
    if (!questBtn) return;

    const today = new Date().toDateString();
    const savedQuest = localStorage.getItem('dailyQuest');
    
    if (savedQuest) {
      const questData = JSON.parse(savedQuest);
      if (questData.date === today && questData.completed) {
        questBtn.classList.add('completed');
        questBtn.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4"></path>
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
          ✅ Quest Complete!
        `;
      } else {
        questBtn.classList.remove('completed');
        questBtn.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12,2 15.09,8.26 22,9 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9 8.91,8.26"></polygon>
          </svg>
          🎯 Today's Quest: ${questData.name}
        `;
      }
    }
  }

  setupStatCardSwipes() {
    // Only enable on mobile
    if (window.innerWidth > 768) return;
    
    const cards = document.querySelectorAll('.stat-card');
    const counter = document.getElementById('card-counter');
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas?.getContext('2d');
    let currentIndex = 0;
    this.particles = [];
    
    if (canvas) {
      canvas.width = 320;
      canvas.height = 160;
      this.animateParticles(ctx);
    }
    
    setTimeout(() => this.demoSwipe(), 3000);
    this.currentIndex = currentIndex;
    
    cards.forEach((card, index) => {
      let startY = 0;
      let currentY = 0;
      let isDragging = false;
      let velocity = 0;
      let lastY = 0;
      let lastTime = 0;
      
      const handleStart = (e) => {
        if (index !== currentIndex) return;
        isDragging = true;
        const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
        startY = clientY;
        lastY = clientY;
        lastTime = Date.now();
        velocity = 0;
        card.classList.add('swiping');
        this.hapticFeedback('light');
        document.querySelector('.swipe-hint')?.style.setProperty('opacity', '0');
        e.preventDefault();
      };
      
      const handleMove = (e) => {
        if (!isDragging || index !== currentIndex) return;
        e.preventDefault();
        
        const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
        const now = Date.now();
        currentY = clientY - startY;
        velocity = (clientY - lastY) / (now - lastTime);
        lastY = clientY;
        lastTime = now;
        
        const progress = Math.min(Math.abs(currentY) / 100, 1);
        
        if (currentY < 0) {
          card.style.transform = `translateY(${currentY}px) rotateX(${progress * 20}deg) scale(${1 - progress * 0.2})`;
          this.createParticles(clientY, progress, 'up');
        } else if (currentY > 0) {
          card.style.transform = `translateY(${currentY}px) rotateX(${-progress * 20}deg) scale(${1 - progress * 0.2})`;
          this.createParticles(clientY, progress, 'down');
        }
      };
      
      const handleEnd = () => {
        if (!isDragging || index !== currentIndex) return;
        isDragging = false;
        card.classList.remove('swiping');
        
        const threshold = 40;
        const velocityThreshold = 0.3;
        
        if ((currentY < -threshold || velocity < -velocityThreshold) && currentY < 0) {
          card.classList.add('swiped-up');
          currentIndex = (currentIndex + 1) % cards.length;
          if (counter) counter.textContent = currentIndex + 1;
          this.hapticFeedback('medium');
          this.updateCardStack();
          setTimeout(() => {
            card.classList.remove('swiped-up');
            card.style.transform = '';
            card.style.opacity = '';
          }, 600);
        } else if ((currentY > threshold || velocity > velocityThreshold) && currentY > 0) {
          card.classList.add('swiped-down');
          currentIndex = (currentIndex - 1 + cards.length) % cards.length;
          if (counter) counter.textContent = currentIndex + 1;
          this.hapticFeedback('medium');
          this.updateCardStack();
          setTimeout(() => {
            card.classList.remove('swiped-down');
            card.style.transform = '';
            card.style.opacity = '';
          }, 600);
        } else {
          card.style.transform = '';
          card.style.opacity = '';
        }
        currentY = 0;
        velocity = 0;
      };
      
      card.addEventListener('mousedown', handleStart);
      card.addEventListener('touchstart', handleStart, { passive: false });
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchend', handleEnd);
    });
  }
  
  createParticles(y, progress, direction) {
    if (!this.particles || Math.random() > 0.3) this.particles = this.particles || [];
    
    this.particles.push({
      x: 160 + (Math.random() - 0.5) * 60,
      y: y - 100,
      vx: (Math.random() - 0.5) * 2,
      vy: direction === 'up' ? -Math.random() * 2 : Math.random() * 2,
      life: 0.8,
      decay: 0.04,
      color: direction === 'up' ? '#3b82f6' : '#f59e0b',
      size: Math.random() * 2 + 1
    });
  }
  
  animateParticles(ctx) {
    if (!ctx || !this.particles) return;
    
    ctx.clearRect(0, 0, 320, 160);
    
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      
      return p.life > 0;
    });
    
    requestAnimationFrame(() => this.animateParticles(ctx));
  }
  
  hapticFeedback(type) {
    if (navigator.vibrate) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type] || patterns.light);
    }
  }
  
  demoSwipe() {
    const topCard = document.querySelector('.stat-card');
    if (!topCard) return;
    
    topCard.style.transform = 'translateY(-30px) rotateX(15deg) scale(0.9)';
    topCard.style.opacity = '0.7';
    
    setTimeout(() => {
      topCard.style.transform = '';
      topCard.style.opacity = '';
    }, 1000);
  }
  
  updateCardStack() {
    const cards = document.querySelectorAll('.stat-card');
    const transforms = [
      'translateY(0px) translateZ(0px) rotateX(0deg) scale(1)',
      'translateY(12px) translateZ(-30px) rotateX(3deg) rotateY(-2deg) scale(0.94)',
      'translateY(20px) translateZ(-50px) rotateX(5deg) rotateY(1deg) scale(0.88)',
      'translateY(28px) translateZ(-70px) rotateX(7deg) rotateY(-1deg) scale(0.82)'
    ];
    
    const shadows = [
      '0 25px 80px rgba(59, 130, 246, 0.3), 0 12px 30px rgba(0,0,0,0.15)',
      '0 20px 60px rgba(59, 130, 246, 0.25), 0 8px 20px rgba(0,0,0,0.12)',
      '0 15px 45px rgba(59, 130, 246, 0.2), 0 6px 15px rgba(0,0,0,0.1)',
      '0 12px 35px rgba(59, 130, 246, 0.15), 0 4px 12px rgba(0,0,0,0.08)'
    ];
    
    const backgrounds = [
      'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
      'linear-gradient(135deg, #fefefe 0%, #f1f5f9 100%)',
      'linear-gradient(135deg, #fdfdfd 0%, #e2e8f0 100%)',
      'linear-gradient(135deg, #fcfcfc 0%, #cbd5e1 100%)'
    ];
    
    cards.forEach((card, index) => {
      const stackIndex = (index + cards.length - this.currentIndex) % cards.length;
      card.style.zIndex = cards.length - stackIndex;
      card.style.transform = transforms[stackIndex];
      card.style.boxShadow = shadows[stackIndex];
      card.style.background = backgrounds[stackIndex];
      
      // Update content for current card
      if (stackIndex === 0) {
        this.updateCardContent(card, index);
      }
    });
  }
  
  updateCardContent(card, cardIndex) {
    const cardType = card.dataset.card;
    const cardInfo = this.cardData.find(c => c.type === cardType);
    
    if (cardInfo) {
      const icon = card.querySelector('.stat-icon');
      const value = card.querySelector('.stat-value');
      const extra = card.querySelector('.stat-extra');
      
      if (icon) icon.textContent = cardInfo.icon;
      if (value) value.textContent = this.formatNumber(cardInfo.getValue());
      if (extra) extra.textContent = cardInfo.getExtra();
    }
  }

  loadTheme() {
    const settings = JSON.parse(localStorage.getItem('colorQ_settings') || '{}');
    const theme = settings.theme || 'light';
    
    // Remove old theme classes
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-pastel', 'theme-nature');
    
    // Apply theme
    document.body.setAttribute('data-theme', theme);
    document.body.classList.add('theme-' + theme);
  }

  loadThemeUI() {
    const settings = JSON.parse(localStorage.getItem('colorQ_settings') || '{}');
    const theme = settings.theme || 'light';
    
    // Update theme button UI
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-theme="${theme}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }

    // Load other settings
    if (settings.animationSpeed) {
      const animationSelect = document.getElementById('animation-speed');
      if (animationSelect) animationSelect.value = settings.animationSpeed;
    }
    
    if (typeof settings.soundEffects === 'boolean') {
      const soundCheckbox = document.getElementById('sound-effects');
      if (soundCheckbox) soundCheckbox.checked = settings.soundEffects;
    }
    
    if (typeof settings.autoSave === 'boolean') {
      const autoSaveCheckbox = document.getElementById('auto-save');
      if (autoSaveCheckbox) autoSaveCheckbox.checked = settings.autoSave;
    }
  }

  updateSetting(key, value) {
    const settings = JSON.parse(localStorage.getItem('colorQ_settings') || '{}');
    settings[key] = value;
    localStorage.setItem('colorQ_settings', JSON.stringify(settings));
    
    this.showToast(`${key} updated`, 'success');
  }

  showAchievements() {
    const modal = document.getElementById('achievements-modal');
    if (modal) {
      this.loadAchievements();
      modal.classList.add('active');
    }
  }

  loadAchievements() {
    const achievements = [
      { id: 'first_stroke', name: 'First Stroke', desc: 'Make your first drawing', icon: '🎨', xp: 10, unlocked: true },
      { id: 'color_explorer', name: 'Color Explorer', desc: 'Use 50 different colors', icon: '🌈', xp: 50, unlocked: false },
      { id: 'mix_master', name: 'Mix Master', desc: 'Create 25 unique blends', icon: '🎭', xp: 100, unlocked: false },
      { id: 'streak_3', name: '3-Day Streak', desc: 'Create art 3 days in a row', icon: '🔥', xp: 30, unlocked: false },
      { id: 'speed_artist', name: 'Speed Artist', desc: 'Complete challenge under 2 minutes', icon: '⚡', xp: 75, unlocked: false },
      { id: 'night_owl', name: 'Night Owl', desc: 'Create art between 10PM-6AM', icon: '🦉', xp: 25, unlocked: false },
      { id: 'time_traveler', name: 'Time Traveler', desc: 'Spend 2 hours total in app', icon: '⏰', xp: 100, unlocked: false },
      { id: 'quest_master', name: 'Quest Master', desc: 'Complete 10 daily quests', icon: '🎯', xp: 150, unlocked: false },
      { id: 'gem_collector', name: 'Gem Collector', desc: 'Collect 500 gems', icon: '💎', xp: 80, unlocked: false },
      { id: 'level_10', name: 'Rising Star', desc: 'Reach level 10', icon: '⭐', xp: 200, unlocked: false },
      { id: 'perfectionist', name: 'Perfectionist', desc: 'Get 100% on a quest', icon: '💯', xp: 120, unlocked: false },
      { id: 'social_artist', name: 'Social Artist', desc: 'Share 5 artworks', icon: '📤', xp: 60, unlocked: false }
    ];

    const userStats = JSON.parse(localStorage.getItem('userStats') || '{}');
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalXP = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xp, 0);

    document.getElementById('achievements-unlocked').textContent = unlockedCount;
    document.getElementById('achievement-xp').textContent = totalXP;

    const grid = document.getElementById('achievement-grid');
    grid.innerHTML = achievements.map(achievement => `
      <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
          <h4>${achievement.name}</h4>
          <p>${achievement.desc}</p>
          <div class="achievement-xp">+${achievement.xp} XP</div>
        </div>
        ${achievement.unlocked ? '<div class="achievement-checkmark">✓</div>' : ''}
      </div>
    `).join('');
  }

  setupAchievementsModal() {
    const modal = document.getElementById('achievements-modal');
    const closeBtn = document.getElementById('achievements-close');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal?.classList.remove('active');
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    }
  }

  showDailyWheel() {
    const modal = document.getElementById('wheel-modal');
    if (modal) {
      this.initWheel();
      modal.classList.add('active');
    }
  }

  setupDailyWheelModal() {
    const modal = document.getElementById('wheel-modal');
    const closeBtn = document.getElementById('wheel-close');
    const spinBtn = document.getElementById('spin-wheel-btn');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal?.classList.remove('active');
      });
    }

    if (spinBtn) {
      spinBtn.addEventListener('click', () => {
        this.spinWheel();
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    }
  }

  initWheel() {
    const canvas = document.getElementById('wheel-canvas');
    const ctx = canvas.getContext('2d');
    
    this.wheelPrizes = [
      { text: '5 Gems', color: '#FF6B6B', value: 5, type: 'gems', weight: 30 },
      { text: '10 XP', color: '#4ECDC4', value: 10, type: 'xp', weight: 25 },
      { text: '10 Gems', color: '#45B7D1', value: 10, type: 'gems', weight: 20 },
      { text: '15 XP', color: '#96CEB4', value: 15, type: 'xp', weight: 15 },
      { text: '25 Gems', color: '#FFEAA7', value: 25, type: 'gems', weight: 5 },
      { text: '50 XP', color: '#DDA0DD', value: 50, type: 'xp', weight: 3 },
      { text: '50 Gems', color: '#FFB6C1', value: 50, type: 'gems', weight: 1.5 },
      { text: '100 XP', color: '#98D8C8', value: 100, type: 'xp', weight: 0.5 }
    ];
    
    this.currentRotation = 0;
    this.drawWheel(ctx, canvas);
    
    // Check if already spun today
    const today = new Date().toDateString();
    const lastSpin = localStorage.getItem('lastWheelSpin');
    const statusEl = document.getElementById('wheel-status');
    const spinBtn = document.getElementById('spin-wheel-btn');
    
    if (lastSpin === today) {
      statusEl.innerHTML = '<span class="status-text completed">Already spun today! Come back tomorrow.</span>';
      spinBtn.disabled = true;
      spinBtn.textContent = 'Come Back Tomorrow';
    } else {
      statusEl.innerHTML = '<span class="status-text ready">Ready to spin!</span>';
      spinBtn.disabled = false;
      spinBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>Spin Wheel';
    }
  }

  drawWheel(ctx, canvas) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 140;
    const sliceAngle = (2 * Math.PI) / this.wheelPrizes.length;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw wheel segments starting from top (pointer position)
    this.wheelPrizes.forEach((prize, index) => {
      const startAngle = (index * sliceAngle) - (Math.PI / 2); // Start from top
      const endAngle = startAngle + sliceAngle;
      
      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Inter';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 2;
      ctx.fillText(prize.text, radius * 0.7, 5);
      ctx.restore();
    });
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  getWeightedRandomPrize() {
    const totalWeight = this.wheelPrizes.reduce((sum, prize) => sum + prize.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < this.wheelPrizes.length; i++) {
      random -= this.wheelPrizes[i].weight;
      if (random <= 0) {
        return i;
      }
    }
    return 0;
  }

  spinWheel() {
    const canvas = document.getElementById('wheel-canvas');
    const spinBtn = document.getElementById('spin-wheel-btn');
    
    spinBtn.disabled = true;
    spinBtn.textContent = 'Spinning...';
    
    // Get weighted random result first
    const winningIndex = this.getWeightedRandomPrize();
    
    // Calculate the exact angle needed to land on the winning segment
    const sliceAngle = 360 / this.wheelPrizes.length;
    const segmentStartAngle = winningIndex * sliceAngle;
    const segmentCenterAngle = segmentStartAngle + (sliceAngle / 2);
    
    // Add multiple full rotations plus the target angle
    const spins = 5 + Math.random() * 3;
    const totalRotation = (spins * 360) + segmentCenterAngle;
    
    // Apply the rotation
    canvas.style.transform = `rotate(${totalRotation}deg)`;
    
    // Store the winning prize to show in result
    this.currentWinningPrize = this.wheelPrizes[winningIndex];
    
    setTimeout(() => {
      this.showResult(this.currentWinningPrize);
      
      // Mark as spun today
      localStorage.setItem('lastWheelSpin', new Date().toDateString());
      
      const statusEl = document.getElementById('wheel-status');
      statusEl.innerHTML = `<span class="status-text won">You won ${this.currentWinningPrize.text}! 🎉</span>`;
      
      spinBtn.textContent = 'Come Back Tomorrow';
    }, 3000);
  }

  showResult(prize) {
    const modal = document.getElementById('wheel-result-modal');
    const icon = document.getElementById('result-icon');
    const prizeText = document.getElementById('result-prize');
    const closeBtn = document.getElementById('result-close-btn');
    
    // Set prize info
    icon.textContent = prize.type === 'gems' ? '💎' : '⭐';
    prizeText.textContent = `You won ${prize.value} ${prize.type === 'gems' ? 'Gems' : 'XP'}!`;
    
    // Award the prize
    this.awardPrize(prize);
    
    // Show modal
    modal.classList.add('active');
    
    // Close button handler
    closeBtn.onclick = () => {
      modal.classList.remove('active');
    };
  }

  awardPrize(prize) {
    if (prize.type === 'gems') {
      const currentGems = parseInt(localStorage.getItem('gems') || '0');
      localStorage.setItem('gems', (currentGems + prize.value).toString());
    } else if (prize.type === 'xp') {
      const userStats = JSON.parse(localStorage.getItem('userStats') || '{}');
      userStats.total_xp = (userStats.total_xp || 0) + prize.value;
      localStorage.setItem('userStats', JSON.stringify(userStats));
    }
    
    // Update stats display
    this.loadStats();
    this.updateStatsDisplay();
  }

  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const colors = {
      success: '#10ac84',
      error: '#e74c3c',
      info: '#3498db',
      warning: '#f39c12'
    };
    
    toast.style.cssText = `
      background: ${colors[type] || colors.info};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 8px;
      opacity: 0;
      transition: opacity 0.3s;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => toast.style.opacity = '1', 100);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.homeController = new HomeController();
  
  // Initialize quest system
  if (typeof DailyQuestSystem !== 'undefined') {
    const questSystem = new DailyQuestSystem({ showToast: (msg, type) => console.log(msg) });
  }
  
  // Initialize gems system  
  if (typeof GemsSystem !== 'undefined') {
    const gemsSystem = new GemsSystem({ showToast: (msg, type) => console.log(msg) });
  }
  
  // Initialize shop system
  if (typeof ShopSystem !== 'undefined') {
    window.shopSystem = new ShopSystem({ showToast: (msg, type) => homeController.showToast(msg, type) });
  }
});