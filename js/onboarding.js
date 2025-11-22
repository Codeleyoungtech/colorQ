// Interactive Onboarding System
class OnboardingSystem {
  constructor(app) {
    this.app = app;
    this.currentStep = 0;
    this.steps = [
      {
        id: 'welcome',
        title: 'Welcome to colorQ! 🎨',
        content: 'Let\'s create your first masterpiece together!',
        target: null,
        action: 'next'
      },
      {
        id: 'color-picker',
        title: 'Choose Your Colors',
        content: 'Tap any color to select it. Try the surprise button for random colors!',
        target: '.color-palette',
        highlight: '#surprise-btn',
        action: 'click'
      },
      {
        id: 'brush-tool',
        title: 'Select Your Brush',
        content: 'Choose the brush tool to start drawing on the canvas.',
        target: '[data-tool="brush"]',
        highlight: '[data-tool="brush"]',
        action: 'click'
      },
      {
        id: 'canvas-draw',
        title: 'Start Creating!',
        content: 'Draw on the canvas to create your art. Try different brush sizes!',
        target: '#main-canvas',
        highlight: '#brush-size',
        action: 'draw'
      },
      {
        id: 'daily-quest',
        title: 'Daily Quests 🎯',
        content: 'Complete daily quests to earn gems and unlock new content!',
        target: '#quest-info-btn',
        highlight: '#quest-info-btn',
        action: 'click'
      },
      {
        id: 'complete',
        title: 'You\'re Ready! 🚀',
        content: 'Start creating amazing art and sharing with the world!',
        target: null,
        action: 'finish'
      }
    ];
    
    this.init();
  }
  
  init() {
    if (this.shouldShowOnboarding()) {
      setTimeout(() => this.startOnboarding(), 1000);
    }
  }
  
  shouldShowOnboarding() {
    return !localStorage.getItem('onboardingCompleted');
  }
  
  startOnboarding() {
    this.createOnboardingOverlay();
    this.showStep(0);
  }
  
  createOnboardingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'onboarding-overlay';
    overlay.className = 'onboarding-overlay';
    overlay.innerHTML = `
      <div class="onboarding-backdrop"></div>
      <div class="onboarding-tooltip" id="onboarding-tooltip">
        <div class="tooltip-content">
          <div class="tooltip-header">
            <h3 id="tooltip-title"></h3>
            <div class="step-indicator">
              <span id="step-current">1</span> / <span id="step-total">${this.steps.length}</span>
            </div>
          </div>
          <div class="tooltip-body">
            <p id="tooltip-content"></p>
          </div>
          <div class="tooltip-actions">
            <button id="skip-btn" class="secondary-btn">Skip Tutorial</button>
            <button id="next-btn" class="primary-btn">Next</button>
          </div>
        </div>
        <div class="tooltip-arrow"></div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    this.setupOnboardingEvents();
  }
  
  setupOnboardingEvents() {
    document.getElementById('next-btn').addEventListener('click', () => {
      this.nextStep();
    });
    
    document.getElementById('skip-btn').addEventListener('click', () => {
      this.skipOnboarding();
    });
    
    // Handle step-specific actions
    document.addEventListener('click', (e) => {
      if (!document.getElementById('onboarding-overlay')) return;
      
      const currentStepData = this.steps[this.currentStep];
      if (currentStepData.action === 'click' && currentStepData.highlight) {
        const target = document.querySelector(currentStepData.highlight);
        if (target && (e.target === target || target.contains(e.target))) {
          setTimeout(() => this.nextStep(), 500);
        }
      }
    });
    
    // Handle canvas drawing
    document.addEventListener('canvasDrawStart', () => {
      if (!document.getElementById('onboarding-overlay')) return;
      
      const currentStepData = this.steps[this.currentStep];
      if (currentStepData.action === 'draw') {
        setTimeout(() => this.nextStep(), 1000);
      }
    });
  }
  
  showStep(stepIndex) {
    if (stepIndex >= this.steps.length) {
      this.completeOnboarding();
      return;
    }
    
    this.currentStep = stepIndex;
    const step = this.steps[stepIndex];
    
    // Update tooltip content
    document.getElementById('tooltip-title').textContent = step.title;
    document.getElementById('tooltip-content').textContent = step.content;
    document.getElementById('step-current').textContent = stepIndex + 1;
    
    // Update button text
    const nextBtn = document.getElementById('next-btn');
    if (step.action === 'finish') {\n      nextBtn.textContent = 'Get Started!';\n    } else if (step.action === 'click' || step.action === 'draw') {\n      nextBtn.textContent = 'Try it!';\n      nextBtn.style.display = 'none';\n    } else {\n      nextBtn.textContent = 'Next';\n      nextBtn.style.display = 'block';\n    }\n    \n    // Position tooltip and highlight\n    this.positionTooltip(step);\n    this.highlightElement(step.highlight);\n    \n    // Show action-specific instructions\n    if (step.action === 'click' || step.action === 'draw') {\n      this.showActionHint(step);\n    }\n  }\n  \n  positionTooltip(step) {\n    const tooltip = document.getElementById('onboarding-tooltip');\n    \n    if (!step.target) {\n      // Center tooltip\n      tooltip.style.position = 'fixed';\n      tooltip.style.top = '50%';\n      tooltip.style.left = '50%';\n      tooltip.style.transform = 'translate(-50%, -50%)';\n      return;\n    }\n    \n    const target = document.querySelector(step.target);\n    if (!target) return;\n    \n    const rect = target.getBoundingClientRect();\n    const tooltipRect = tooltip.getBoundingClientRect();\n    \n    // Position below target by default\n    let top = rect.bottom + 20;\n    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);\n    \n    // Adjust if tooltip goes off screen\n    if (left < 20) left = 20;\n    if (left + tooltipRect.width > window.innerWidth - 20) {\n      left = window.innerWidth - tooltipRect.width - 20;\n    }\n    \n    if (top + tooltipRect.height > window.innerHeight - 20) {\n      top = rect.top - tooltipRect.height - 20;\n    }\n    \n    tooltip.style.position = 'fixed';\n    tooltip.style.top = top + 'px';\n    tooltip.style.left = left + 'px';\n    tooltip.style.transform = 'none';\n  }\n  \n  highlightElement(selector) {\n    // Remove previous highlights\n    document.querySelectorAll('.onboarding-highlight').forEach(el => {\n      el.classList.remove('onboarding-highlight');\n    });\n    \n    if (!selector) return;\n    \n    const element = document.querySelector(selector);\n    if (element) {\n      element.classList.add('onboarding-highlight');\n      \n      // Scroll element into view\n      element.scrollIntoView({ behavior: 'smooth', block: 'center' });\n    }\n  }\n  \n  showActionHint(step) {\n    const hint = document.createElement('div');\n    hint.className = 'onboarding-hint';\n    hint.innerHTML = `\n      <div class=\"hint-content\">\n        ${step.action === 'click' ? '👆 Tap here!' : '✏️ Draw here!'}\n      </div>\n    `;\n    \n    const target = document.querySelector(step.highlight || step.target);\n    if (target) {\n      target.appendChild(hint);\n      \n      setTimeout(() => {\n        if (hint.parentElement) {\n          hint.remove();\n        }\n      }, 3000);\n    }\n  }\n  \n  nextStep() {\n    this.showStep(this.currentStep + 1);\n  }\n  \n  skipOnboarding() {\n    if (confirm('Skip the tutorial? You can always access help later.')) {\n      this.completeOnboarding();\n    }\n  }\n  \n  completeOnboarding() {\n    // Remove overlay\n    const overlay = document.getElementById('onboarding-overlay');\n    if (overlay) {\n      overlay.remove();\n    }\n    \n    // Remove highlights\n    document.querySelectorAll('.onboarding-highlight').forEach(el => {\n      el.classList.remove('onboarding-highlight');\n    });\n    \n    // Mark as completed\n    localStorage.setItem('onboardingCompleted', 'true');\n    \n    // Show completion message\n    this.app.showToast('Tutorial completed! Start creating! 🎨', 'success');\n    \n    // Award completion gems\n    if (this.app.gemsSystem) {\n      this.app.gemsSystem.addGems(50);\n      this.app.showToast('+50 gems for completing tutorial! 💎', 'success');\n    }\n  }\n  \n  resetOnboarding() {\n    localStorage.removeItem('onboardingCompleted');\n  }\n}