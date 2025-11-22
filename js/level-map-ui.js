// Level Map UI System
class LevelMapUI {
  constructor(app) {
    this.app = app;
    this.levels = [];
    this.userProgress = {};
    this.currentZoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.tooltip = null;
    this.pathPoints = [];
    
    this.init();
  }
  
  async init() {
    await this.loadLevelsData();
    this.loadUserProgress();
    this.setupEventListeners();
    this.generatePathPoints();
    this.renderPath();
    this.renderNodes();
    this.scrollToCurrent();
    this.startParticleAnimation();
  }
  
  async loadLevelsData() {
    try {
      // Use the existing level system data
      if (typeof LEVEL_SYSTEM !== 'undefined') {
        this.levels = LEVEL_SYSTEM;
      } else {
        // Fallback to basic levels
        this.levels = Array.from({length: 100}, (_, i) => ({
          level: i + 1,
          title: `Level ${i + 1}`,
          xp_to_reach: i * 100,
          milestone: (i + 1) % 5 === 0,
          unlocks: ['Basic unlock'],
          realm_unlocked: null
        }));
      }
    } catch (error) {
      console.error('Failed to load levels:', error);
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
    const viewport = document.getElementById('map-viewport');
    
    closeBtn.addEventListener('click', () => this.close());
    
    // Pan and zoom
    let startX, startY, startPanX, startPanY;
    
    viewport.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startPanX = this.panX;
      startPanY = this.panY;
    });
    
    viewport.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      this.panX = startPanX + deltaX;
      this.panY = startPanY + deltaY;
      
      this.updateTransform();
    });
    
    viewport.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
    
    // Touch events
    viewport.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        this.isDragging = true;
        startX = touch.clientX;
        startY = touch.clientY;
        startPanX = this.panX;
        startPanY = this.panY;
      }
    });
    
    viewport.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      e.preventDefault();
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      
      this.panX = startPanX + deltaX;
      this.panY = startPanY + deltaY;
      
      this.updateTransform();
    });
    
    viewport.addEventListener('touchend', () => {
      this.isDragging = false;
    });
    
    // Zoom controls
    document.getElementById('zoom-in').addEventListener('click', () => {
      this.currentZoom = Math.min(this.currentZoom * 1.2, 3);
      this.updateTransform();
    });
    
    document.getElementById('zoom-out').addEventListener('click', () => {
      this.currentZoom = Math.max(this.currentZoom / 1.2, 0.5);
      this.updateTransform();
    });
    
    // Wheel zoom
    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.currentZoom = Math.max(0.5, Math.min(3, this.currentZoom * delta));
      this.updateTransform();
    });
  }
  
  generatePathPoints() {
    this.pathPoints = [];
    const cols = 10;
    const spacing = 500;
    const amplitude = 200;
    
    for (let i = 0; i < this.levels.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      let x = col * spacing + 300;
      let y = row * 300 + 400;
      
      // Add some curve variation
      if (row % 2 === 1) {
        x = (cols - 1 - col) * spacing + 300; // Reverse direction
      }
      
      // Add wave motion
      y += Math.sin(i * 0.3) * amplitude;
      
      this.pathPoints.push({ x, y, level: i + 1 });
    }
  }
  
  renderPath() {
    const pathGroup = document.getElementById('path-group');
    pathGroup.innerHTML = '';
    
    if (this.pathPoints.length < 2) return;
    
    let pathData = `M ${this.pathPoints[0].x} ${this.pathPoints[0].y}`;
    
    for (let i = 1; i < this.pathPoints.length; i++) {
      const prev = this.pathPoints[i - 1];
      const curr = this.pathPoints[i];
      
      // Create smooth curves between points
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      
      pathData += ` Q ${midX} ${midY} ${curr.x} ${curr.y}`;
    }
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('class', 'level-path');
    
    pathGroup.appendChild(path);
  }
  
  renderNodes() {
    const nodesGroup = document.getElementById('nodes-group');
    nodesGroup.innerHTML = '';
    
    this.pathPoints.forEach((point, index) => {
      const level = this.levels[index];
      if (!level) return;
      
      const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      nodeGroup.setAttribute('class', this.getNodeClass(level));
      nodeGroup.setAttribute('data-level', level.level);
      nodeGroup.setAttribute('transform', `translate(${point.x}, ${point.y})`);
      
      // Circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('class', 'node-circle');
      circle.setAttribute('cx', '0');
      circle.setAttribute('cy', '0');
      
      // Level number
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('class', 'node-text');
      text.setAttribute('x', '0');
      text.setAttribute('y', '0');
      text.textContent = level.level;
      
      // Icon for milestones
      if (level.milestone) {
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        icon.setAttribute('class', 'node-icon');
        icon.setAttribute('x', '0');
        icon.setAttribute('y', '-15');
        icon.textContent = '👑';
        nodeGroup.appendChild(icon);
      }
      
      nodeGroup.appendChild(circle);
      nodeGroup.appendChild(text);
      
      // Event listeners
      nodeGroup.addEventListener('click', () => this.onNodeClick(level));
      nodeGroup.addEventListener('mouseenter', (e) => this.showTooltip(e, level));
      nodeGroup.addEventListener('mouseleave', () => this.hideTooltip());
      
      nodesGroup.appendChild(nodeGroup);
    });
  }
  
  getNodeClass(level) {
    const classes = ['level-node'];
    
    if (level.milestone) classes.push('milestone');
    
    if (this.userProgress.completedLevels.includes(level.level)) {
      classes.push('completed');
    } else if (level.level === this.userProgress.currentLevel) {
      classes.push('current');
    } else if (level.level > this.userProgress.currentLevel) {
      classes.push('locked');
    }
    
    return classes.join(' ');
  }
  
  onNodeClick(level) {
    if (level.level > this.userProgress.currentLevel) {
      this.showTooltip(null, level, true);
      return;
    }
    
    // Start level or show completed info
    if (level.level <= this.userProgress.currentLevel) {
      this.close();
      // Navigate to create new project
      window.location.href = 'app.html?new=true';
    }
  }
  
  showTooltip(event, level, locked = false) {
    const tooltip = document.getElementById('level-tooltip');
    
    document.getElementById('tooltip-level').textContent = level.level;
    document.getElementById('tooltip-title').textContent = level.title;
    
    const unlocksEl = document.getElementById('tooltip-unlocks');
    unlocksEl.innerHTML = level.unlocks.map(unlock => 
      `<div class="unlock-item">${this.getUnlockIcon(unlock)} ${unlock}</div>`
    ).join('');
    
    const xpEl = document.getElementById('tooltip-xp');
    const actionEl = document.getElementById('tooltip-action');
    
    if (locked) {
      xpEl.textContent = `Reach Level ${this.userProgress.currentLevel + 1} to unlock`;
      actionEl.textContent = 'Locked';
      actionEl.disabled = true;
    } else if (level.level <= this.userProgress.currentLevel) {
      xpEl.textContent = 'Completed';
      actionEl.textContent = 'Create Art';
      actionEl.disabled = false;
    } else {
      xpEl.textContent = `${level.xp_from_previous || 100} XP to unlock`;
      actionEl.textContent = 'Start Level';
      actionEl.disabled = false;
    }
    
    // Position tooltip
    if (event) {
      const rect = document.getElementById('map-viewport').getBoundingClientRect();
      tooltip.style.left = `${event.clientX - rect.left + 20}px`;
      tooltip.style.top = `${event.clientY - rect.top - 50}px`;
    }
    
    tooltip.classList.add('visible');
  }
  
  hideTooltip() {
    const tooltip = document.getElementById('level-tooltip');
    tooltip.classList.remove('visible');
  }
  
  getUnlockIcon(unlock) {
    if (unlock.includes('Brush')) return '🎨';
    if (unlock.includes('Color')) return '🌈';
    if (unlock.includes('Effect')) return '✨';
    if (unlock.includes('Realm')) return '🌍';
    if (unlock.includes('Gems')) return '💎';
    return '🎁';
  }
  
  scrollToCurrent() {
    const currentPoint = this.pathPoints[this.userProgress.currentLevel - 1];
    if (!currentPoint) return;
    
    const viewport = document.getElementById('map-viewport');
    const rect = viewport.getBoundingClientRect();
    
    this.panX = rect.width / 2 - currentPoint.x * this.currentZoom;
    this.panY = rect.height / 2 - currentPoint.y * this.currentZoom;
    
    this.updateTransform();
  }
  
  updateTransform() {
    const svg = document.getElementById('level-path-svg');
    svg.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.currentZoom})`;
  }
  
  startParticleAnimation() {
    // Add flowing particles along the path
    setInterval(() => {
      this.createPathParticle();
    }, 2000);
  }
  
  createPathParticle() {
    const particlesGroup = document.getElementById('particles-group');
    const completedLevels = this.userProgress.completedLevels.length;
    
    if (completedLevels < 2) return;
    
    const startPoint = this.pathPoints[0];
    const endPoint = this.pathPoints[Math.min(completedLevels - 1, this.pathPoints.length - 1)];
    
    const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    particle.setAttribute('class', 'path-particle');
    particle.setAttribute('cx', startPoint.x);
    particle.setAttribute('cy', startPoint.y);
    
    particlesGroup.appendChild(particle);
    
    // Animate particle along path
    const duration = 4000;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const x = startPoint.x + (endPoint.x - startPoint.x) * progress;
      const y = startPoint.y + (endPoint.y - startPoint.y) * progress;
      
      particle.setAttribute('cx', x);
      particle.setAttribute('cy', y);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        particle.remove();
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  updateProgress() {
    const xpFill = document.getElementById('xp-fill');
    const xpText = document.getElementById('xp-text');
    
    const currentLevel = this.userProgress.currentLevel;
    const currentXP = this.userProgress.totalXP;
    const levelData = this.levels[currentLevel - 1];
    const nextLevelData = this.levels[currentLevel];
    
    if (levelData && nextLevelData) {
      const xpForLevel = nextLevelData.xp_to_reach - levelData.xp_to_reach;
      const xpProgress = currentXP - levelData.xp_to_reach;
      const percentage = Math.min((xpProgress / xpForLevel) * 100, 100);
      
      xpFill.style.width = `${percentage}%`;
      xpText.textContent = `Level ${currentLevel} • ${xpProgress} / ${xpForLevel} XP`;
    }
  }
  
  show() {
    const modal = document.getElementById('level-map-modal');
    modal.classList.add('active');
    this.updateProgress();
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }
  
  close() {
    const modal = document.getElementById('level-map-modal');
    modal.classList.remove('active');
    this.hideTooltip();
  }
}

// Initialize when DOM is ready
let levelMapUI;
document.addEventListener('DOMContentLoaded', () => {
  levelMapUI = new LevelMapUI();
  
  // Add event listener to level map button
  const levelMapBtn = document.getElementById('level-map-btn');
  if (levelMapBtn) {
    levelMapBtn.addEventListener('click', () => {
      levelMapUI.show();
    });
  }
});