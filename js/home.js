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
    this.loadStats();
    this.updateStatsDisplay();
    this.setupEventListeners();
    this.updateStreakDisplay();
    this.checkDailyLogin();
    this.loadRecentProjects();
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
    if (xpStat) xpStat.textContent = this.stats.totalXP;
    if (projectsStat) projectsStat.textContent = this.stats.projects;
    if (gemsStat) gemsStat.textContent = this.stats.gems;
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
        // Navigate to app with achievements open
        window.location.href = 'app.html?achievements=true';
      });
    }

    // Settings button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        this.showSettings();
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
    this.updateQuestButton();
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

    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const theme = e.target.dataset.theme;
        this.changeTheme(theme);
        
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
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

  changeTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('selectedTheme', theme);
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
    const cards = document.querySelectorAll('.stat-card');
    let currentIndex = 0;
    
    cards.forEach((card, index) => {
      let startY = 0;
      let currentY = 0;
      let isDragging = false;
      
      const handleStart = (e) => {
        if (index !== currentIndex) return;
        isDragging = true;
        startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
        card.classList.add('swiping');
      };
      
      const handleMove = (e) => {
        if (!isDragging || index !== currentIndex) return;
        e.preventDefault();
        currentY = (e.type === 'mousemove' ? e.clientY : e.touches[0].clientY) - startY;
        
        if (currentY < 0) {
          const progress = Math.min(Math.abs(currentY) / 100, 1);
          card.style.transform = `translateY(${currentY}px) rotateX(${progress * 20}deg) scale(${1 - progress * 0.2})`;
          card.style.opacity = 1 - progress * 0.5;
        }
      };
      
      const handleEnd = () => {
        if (!isDragging || index !== currentIndex) return;
        isDragging = false;
        card.classList.remove('swiping');
        
        if (currentY < -80) {
          card.classList.add('swiped-up');
          currentIndex = (currentIndex + 1) % cards.length;
          this.updateCardStack();
          setTimeout(() => {
            card.classList.remove('swiped-up');
            card.style.transform = '';
            card.style.opacity = '';
          }, 300);
        } else {
          card.style.transform = '';
          card.style.opacity = '';
        }
        currentY = 0;
      };
      
      card.addEventListener('mousedown', handleStart);
      card.addEventListener('touchstart', handleStart, { passive: false });
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchend', handleEnd);
    });
  }
  
  updateCardStack() {
    const cards = document.querySelectorAll('.stat-card');
    cards.forEach((card, index) => {
      const stackIndex = (index + cards.length - 1) % cards.length;
      card.style.zIndex = cards.length - stackIndex;
      card.style.transform = `translateY(${stackIndex * 4}px) scale(${1 - stackIndex * 0.02})`;
    });
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
});