// Mobile Optimization Module
class MobileOptimizer {
  constructor(app) {
    this.app = app;
    this.touchStartTime = 0;
    this.touchStartPos = { x: 0, y: 0 };
    this.isOneHandedMode = false;
    this.fabVisible = false;
    this.gestureThreshold = 50;
    this.longPressThreshold = 500;
    
    this.init();
  }

  init() {
    this.createFloatingActionButton();
    this.createBottomNavigation();
    this.setupTouchGestures();
    this.setupHapticFeedback();
    this.optimizeForMobile();
    this.setupPinchZoom();
    this.setupShakeToUndo();
    this.setupPanelClose();
  }

  createFloatingActionButton() {
    const fab = document.createElement('div');
    fab.className = 'fab';
    fab.innerHTML = `
      <div class="fab-main" id="fab-main">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
        </svg>
      </div>
      <div class="fab-menu" id="fab-menu">
        <button class="fab-item" data-action="brush" title="Brush">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
          </svg>
        </button>
        <button class="fab-item" data-action="eraser" title="Eraser">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 20H7l-7-7 7-7h13v14z"></path>
          </svg>
        </button>
        <button class="fab-item" data-action="colors" title="Colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        <button class="fab-item" data-action="undo" title="Undo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 7v6h6"></path>
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(fab);
    this.setupFABEvents();
  }

  setupFABEvents() {
    const fabMain = document.getElementById('fab-main');
    const fabMenu = document.getElementById('fab-menu');

    fabMain.addEventListener('click', () => {
      this.toggleFAB();
    });

    document.querySelectorAll('.fab-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.handleFABAction(action);
        this.closeFAB();
      });
    });

    // Close FAB when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.fab')) {
        this.closeFAB();
      }
    });
  }

  toggleFAB() {
    this.fabVisible = !this.fabVisible;
    const fab = document.querySelector('.fab');
    fab.classList.toggle('active', this.fabVisible);
    this.hapticFeedback('light');
  }

  closeFAB() {
    this.fabVisible = false;
    document.querySelector('.fab').classList.remove('active');
  }

  handleFABAction(action) {
    switch (action) {
      case 'brush':
        this.app.selectTool('brush');
        break;
      case 'eraser':
        this.app.selectTool('eraser');
        break;
      case 'colors':
        this.app.showPanel('color-panel');
        break;
      case 'undo':
        this.app.canvasEngine.undo();
        break;
    }
    this.hapticFeedback('medium');
  }

  createBottomNavigation() {
    const bottomNav = document.createElement('div');
    bottomNav.className = 'bottom-nav';
    bottomNav.innerHTML = `
      <button class="nav-item active" data-nav="canvas">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        </svg>
        <span>Canvas</span>
      </button>
      <button class="nav-item" data-nav="colors">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        <span>Colors</span>
      </button>
      <button class="nav-item" data-nav="tools">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
        <span>Tools</span>
      </button>
      <button class="nav-item" data-nav="export">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7,10 12,15 17,10"></polyline>
        </svg>
        <span>Export</span>
      </button>
    `;

    document.body.appendChild(bottomNav);
    this.setupBottomNavEvents();
  }

  setupBottomNavEvents() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const nav = e.currentTarget.dataset.nav;
        this.handleBottomNavAction(nav);
        
        // Update active state
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        this.hapticFeedback('light');
      });
    });
  }

  handleBottomNavAction(nav) {
    switch (nav) {
      case 'canvas':
        this.focusCanvas();
        break;
      case 'colors':
        document.getElementById('color-panel').classList.add('open');
        break;
      case 'tools':
        document.getElementById('tools-panel').classList.add('open');
        break;
      case 'export':
        this.app.exportCanvas();
        break;
    }
  }

  setupTouchGestures() {
    const canvas = document.getElementById('main-canvas');
    if (!canvas) return;

    let touchCount = 0;
    let lastTouchTime = 0;
    let initialDistance = 0;
    let initialRotation = 0;

    canvas.addEventListener('touchstart', (e) => {
      touchCount = e.touches.length;
      this.touchStartTime = Date.now();
      this.touchStartPos = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };

      if (touchCount === 2) {
        initialDistance = this.getTouchDistance(e.touches);
        initialRotation = this.getTouchRotation(e.touches);
      }

      // Long press detection
      this.longPressTimer = setTimeout(() => {
        this.handleLongPress(e);
      }, this.longPressThreshold);
    });

    canvas.addEventListener('touchmove', (e) => {
      clearTimeout(this.longPressTimer);

      if (touchCount === 2) {
        e.preventDefault();
        this.handlePinchZoom(e, initialDistance);
        this.handleRotation(e, initialRotation);
      } else if (touchCount === 1) {
        this.handleSwipeGesture(e);
      }
    });

    canvas.addEventListener('touchend', (e) => {
      clearTimeout(this.longPressTimer);
      
      const touchDuration = Date.now() - this.touchStartTime;
      const currentTime = Date.now();
      
      // Double tap detection
      if (currentTime - lastTouchTime < 300 && touchDuration < 200) {
        this.handleDoubleTap(e);
      }
      
      // Triple tap detection
      if (this.tapCount === 2 && currentTime - this.lastTapTime < 400) {
        this.handleTripleTap(e);
        this.tapCount = 0;
      } else {
        this.tapCount = (this.tapCount || 0) + 1;
        this.lastTapTime = currentTime;
        setTimeout(() => { this.tapCount = 0; }, 400);
      }
      
      lastTouchTime = currentTime;
      touchCount = 0;
    });
  }

  handleSwipeGesture(e) {
    const currentPos = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };

    const deltaX = currentPos.x - this.touchStartPos.x;
    const deltaY = currentPos.y - this.touchStartPos.y;

    if (Math.abs(deltaX) > this.gestureThreshold) {
      if (deltaX > 0) {
        this.handleSwipeRight();
      } else {
        this.handleSwipeLeft();
      }
    }

    if (Math.abs(deltaY) > this.gestureThreshold) {
      if (deltaY > 0) {
        this.handleSwipeDown();
      } else {
        this.handleSwipeUp();
      }
    }
  }

  handleSwipeLeft() {
    // Next color
    this.app.colorManager.selectNextColor();
    this.hapticFeedback('light');
  }

  handleSwipeRight() {
    // Previous color
    this.app.colorManager.selectPreviousColor();
    this.hapticFeedback('light');
  }

  handleSwipeUp() {
    // Next tool
    this.cycleTool(1);
    this.hapticFeedback('light');
  }

  handleSwipeDown() {
    // Previous tool
    this.cycleTool(-1);
    this.hapticFeedback('light');
  }

  handleLongPress(e) {
    this.showRadialMenu(e.touches[0].clientX, e.touches[0].clientY);
    this.hapticFeedback('heavy');
  }

  handleDoubleTap(e) {
    this.app.canvasEngine.undo();
    this.hapticFeedback('medium');
  }

  handleTripleTap(e) {
    this.app.canvasEngine.redo();
    this.hapticFeedback('medium');
  }

  setupPinchZoom() {
    const canvasContainer = document.querySelector('.canvas-container');
    if (!canvasContainer) return;

    let scale = 1;
    let initialScale = 1;

    canvasContainer.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        initialScale = scale;
      }
    });
  }

  handlePinchZoom(e, initialDistance) {
    const currentDistance = this.getTouchDistance(e.touches);
    const scale = currentDistance / initialDistance;
    
    const canvas = document.getElementById('main-canvas');
    canvas.style.transform = `scale(${scale})`;
  }

  handleRotation(e, initialRotation) {
    const currentRotation = this.getTouchRotation(e.touches);
    const rotation = currentRotation - initialRotation;
    
    const canvas = document.getElementById('main-canvas');
    const currentTransform = canvas.style.transform || '';
    canvas.style.transform = currentTransform + ` rotate(${rotation}deg)`;
  }

  getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getTouchRotation(touches) {
    const dx = touches[1].clientX - touches[0].clientX;
    const dy = touches[1].clientY - touches[0].clientY;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  }

  setupShakeToUndo() {
    if (!window.DeviceMotionEvent) return;

    let lastAcceleration = { x: 0, y: 0, z: 0 };
    let shakeThreshold = 15;

    window.addEventListener('devicemotion', (e) => {
      const acceleration = e.accelerationIncludingGravity;
      if (!acceleration) return;

      const deltaX = Math.abs(acceleration.x - lastAcceleration.x);
      const deltaY = Math.abs(acceleration.y - lastAcceleration.y);
      const deltaZ = Math.abs(acceleration.z - lastAcceleration.z);

      if (deltaX + deltaY + deltaZ > shakeThreshold) {
        this.handleShake();
      }

      lastAcceleration = {
        x: acceleration.x,
        y: acceleration.y,
        z: acceleration.z
      };
    });
  }

  handleShake() {
    if (Date.now() - (this.lastShake || 0) < 1000) return;
    this.lastShake = Date.now();

    if (confirm('Shake detected! Undo last action?')) {
      this.app.canvasEngine.undo();
      this.hapticFeedback('heavy');
    }
  }

  showRadialMenu(x, y) {
    const radialMenu = document.createElement('div');
    radialMenu.className = 'radial-menu';
    radialMenu.style.left = x + 'px';
    radialMenu.style.top = y + 'px';
    
    radialMenu.innerHTML = `
      <div class="radial-item" data-action="brush" style="transform: rotate(0deg) translateY(-60px) rotate(0deg)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
        </svg>
      </div>
      <div class="radial-item" data-action="eraser" style="transform: rotate(72deg) translateY(-60px) rotate(-72deg)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 20H7l-7-7 7-7h13v14z"></path>
        </svg>
      </div>
      <div class="radial-item" data-action="clear" style="transform: rotate(144deg) translateY(-60px) rotate(-144deg)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3,6 5,6 21,6"></polyline>
        </svg>
      </div>
      <div class="radial-item" data-action="export" style="transform: rotate(216deg) translateY(-60px) rotate(-216deg)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        </svg>
      </div>
      <div class="radial-item" data-action="surprise" style="transform: rotate(288deg) translateY(-60px) rotate(-288deg)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="12,2 15.09,8.26 22,9 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9 8.91,8.26"></polygon>
        </svg>
      </div>
    `;

    document.body.appendChild(radialMenu);

    // Add event listeners
    radialMenu.querySelectorAll('.radial-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.handleRadialAction(action);
        this.closeRadialMenu();
      });
    });

    // Auto close after 3 seconds
    setTimeout(() => {
      this.closeRadialMenu();
    }, 3000);

    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', this.closeRadialMenu.bind(this), { once: true });
    }, 100);
  }

  closeRadialMenu() {
    const radialMenu = document.querySelector('.radial-menu');
    if (radialMenu) {
      radialMenu.remove();
    }
  }

  handleRadialAction(action) {
    switch (action) {
      case 'brush':
        this.app.selectTool('brush');
        break;
      case 'eraser':
        this.app.selectTool('eraser');
        break;
      case 'clear':
        this.app.clearCanvas();
        break;
      case 'export':
        this.app.exportCanvas();
        break;
      case 'surprise':
        this.app.surpriseMe();
        break;
    }
  }

  cycleTool(direction) {
    const tools = ['brush', 'eraser'];
    const currentIndex = tools.indexOf(this.app.state.selectedTool);
    const newIndex = (currentIndex + direction + tools.length) % tools.length;
    this.app.selectTool(tools[newIndex]);
  }

  hapticFeedback(intensity = 'light') {
    if (!navigator.vibrate) return;

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [50],
      double: [20, 50, 20]
    };

    navigator.vibrate(patterns[intensity] || patterns.light);
  }

  optimizeForMobile() {
    // Prevent pull-to-refresh
    document.body.style.overscrollBehavior = 'none';
    
    // Prevent text selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    
    // Optimize touch targets
    this.optimizeTouchTargets();
    
    // Handle viewport changes
    this.handleViewportChanges();
    
    // Optimize for one-handed use
    this.setupOneHandedMode();
  }

  optimizeTouchTargets() {
    const buttons = document.querySelectorAll('button, .color-swatch, .tool-btn');
    buttons.forEach(button => {
      const rect = button.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        button.style.minWidth = '44px';
        button.style.minHeight = '44px';
        button.style.padding = '8px';
      }
    });
  }

  handleViewportChanges() {
    // Handle iOS Safari address bar
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', () => {
      setTimeout(setViewportHeight, 100);
    });
  }

  setupOneHandedMode() {
    let doubleTapTimer;
    
    document.addEventListener('touchend', (e) => {
      if (e.touches.length === 0) {
        if (doubleTapTimer) {
          clearTimeout(doubleTapTimer);
          doubleTapTimer = null;
          this.toggleOneHandedMode();
        } else {
          doubleTapTimer = setTimeout(() => {
            doubleTapTimer = null;
          }, 300);
        }
      }
    });
  }

  toggleOneHandedMode() {
    this.isOneHandedMode = !this.isOneHandedMode;
    document.body.classList.toggle('one-handed-mode', this.isOneHandedMode);
    
    const message = this.isOneHandedMode ? 'One-handed mode enabled' : 'One-handed mode disabled';
    this.app.showToast(message, 'success');
    this.hapticFeedback('medium');
  }

  focusCanvas() {
    document.querySelector('.canvas-area').scrollIntoView({ behavior: 'smooth' });
  }

  toggleColorPanel() {
    const panel = document.getElementById('color-panel');
    panel.classList.toggle('open');
  }

  toggleToolsPanel() {
    const panel = document.getElementById('tools-panel');
    panel.classList.toggle('open');
  }

  setupPanelClose() {
    // Close panels when clicking outside
    document.addEventListener('click', (e) => {
      const colorPanel = document.getElementById('color-panel');
      const toolsPanel = document.getElementById('tools-panel');
      
      if (!e.target.closest('#color-panel') && !e.target.closest('[data-nav="colors"]')) {
        colorPanel.classList.remove('open');
      }
      
      if (!e.target.closest('#tools-panel') && !e.target.closest('[data-nav="tools"]')) {
        toolsPanel.classList.remove('open');
      }
    });
  }
}