// Professional Onboarding System
window.OnboardingSystem = class OnboardingSystem {
  constructor(app) {
    this.app = app;
    this.currentStep = 0;
    this.steps = [
      {
        id: 'welcome',
        title: 'Welcome to colorQ',
        subtitle: 'Professional Digital Art Studio',
        content: 'Your complete creative toolkit with advanced color mixing, gamification, and professional drawing tools.',
        features: ['🎨 Advanced Color Mixing', '🏆 Achievement System', '💎 Gem Rewards', '🎯 Daily Challenges'],
        target: null,
        action: 'next'
      },
      {
        id: 'dashboard',
        title: 'Your Creative Dashboard',
        content: 'Track your level, XP, projects created, and gems earned. Swipe on mobile to see all stats.',
        target: '.stats-overview',
        highlight: '.stats-overview',
        action: 'next'
      },
      {
        id: 'create-project',
        title: 'Create New Projects',
        content: 'Start your artistic journey! Choose canvas sizes, backgrounds, and begin creating.',
        target: '.primary-action-group',
        highlight: '#new-project-btn',
        action: 'next'
      },
      {
        id: 'achievements',
        title: 'Achievements & Progress',
        content: 'Unlock achievements, earn XP, and track your creative milestones as you grow as an artist.',
        target: '.tertiary-actions-grid',
        highlight: '#achievements-btn',
        action: 'next'
      },
      {
        id: 'daily-features',
        title: 'Daily Features',
        content: 'Complete daily quests for gems and spin the daily wheel for rewards. Check settings for tutorials.',
        target: '.secondary-action-group',
        highlight: '#quest-btn',
        action: 'next'
      },
      {
        id: 'app-features',
        title: 'What You Can Do',
        content: 'Create digital art with advanced brushes, mix colors professionally, earn achievements, complete daily challenges, collect gems, and track your artistic progress.',
        target: null,
        action: 'next'
      },
      {
        id: 'complete',
        title: 'Ready to Create!',
        content: 'You\'re all set! Start your creative journey with colorQ. Remember: you can restart this tutorial anytime in Settings.',
        target: null,
        action: 'finish'
      }
    ];
    
    this.init();
  }
  
  init() {
    if (this.shouldShowOnboarding()) {
      setTimeout(() => this.startOnboarding(), 1500);
    }
  }
  
  shouldShowOnboarding() {
    return localStorage.getItem('hasOnboarded') !== 'true';
  }
  
  forceStart() {
    this.startOnboarding();
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
            <div class="brand-badge">
              <div class="brand-icon">🎨</div>
              <div class="brand-text">colorQ</div>
            </div>
            <div class="step-indicator">
              <div class="step-progress">
                <div class="progress-bar" id="progress-bar"></div>
              </div>
              <span class="step-text"><span id="step-current">1</span> of <span id="step-total">${this.steps.length}</span></span>
            </div>
          </div>
          <div class="tooltip-body">
            <h3 id="tooltip-title"></h3>
            <p id="tooltip-subtitle"></p>
            <p id="tooltip-content"></p>
            <div id="tooltip-features"></div>
          </div>
          <div class="tooltip-actions">
            <button id="skip-btn" class="skip-btn">Skip Tour</button>
            <button id="next-btn" class="next-btn">Continue</button>
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
          setTimeout(() => this.nextStep(), 800);
        }
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
    
    // Update progress
    const progress = ((stepIndex + 1) / this.steps.length) * 100;
    document.getElementById('progress-bar').style.width = progress + '%';
    
    // Update tooltip content
    document.getElementById('tooltip-title').textContent = step.title;
    document.getElementById('tooltip-subtitle').textContent = step.subtitle || '';
    document.getElementById('tooltip-content').textContent = step.content;
    document.getElementById('step-current').textContent = stepIndex + 1;
    
    // Update features list
    const featuresEl = document.getElementById('tooltip-features');
    if (step.features) {
      featuresEl.innerHTML = `
        <div class="feature-list">
          ${step.features.map(feature => `<div class="feature-item">${feature}</div>`).join('')}
        </div>
      `;
    } else {
      featuresEl.innerHTML = '';
    }
    
    // Update button text
    const nextBtn = document.getElementById('next-btn');
    if (step.action === 'finish') {
      nextBtn.textContent = 'Start Creating';
    } else if (step.action === 'click') {
      nextBtn.textContent = 'Try It';
      nextBtn.style.display = 'none';
    } else {
      nextBtn.textContent = 'Continue';
      nextBtn.style.display = 'block';
    }
    
    // Position tooltip and highlight
    this.positionTooltip(step);
    this.highlightElement(step.highlight);
    
    // Show action-specific instructions
    if (step.action === 'click') {
      this.showActionHint(step);
    }
  }
  
  positionTooltip(step) {
    const tooltip = document.getElementById('onboarding-tooltip');
    
    if (!step.target) {
      // Center tooltip
      tooltip.style.position = 'fixed';
      tooltip.style.top = '50%';
      tooltip.style.left = '50%';
      tooltip.style.transform = 'translate(-50%, -50%)';
      tooltip.style.maxWidth = '90vw';
      return;
    }
    
    const target = document.querySelector(step.target);
    if (!target) {
      // Fallback to center if target not found
      tooltip.style.position = 'fixed';
      tooltip.style.top = '50%';
      tooltip.style.left = '50%';
      tooltip.style.transform = 'translate(-50%, -50%)';
      return;
    }
    
    const rect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const margin = 20;
    
    // Try positioning below first
    let top = rect.bottom + margin;
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    
    // Adjust horizontal position if off screen
    if (left < margin) {
      left = margin;
    } else if (left + tooltipRect.width > window.innerWidth - margin) {
      left = window.innerWidth - tooltipRect.width - margin;
    }
    
    // If tooltip goes below viewport, position above
    if (top + tooltipRect.height > window.innerHeight - margin) {
      top = rect.top - tooltipRect.height - margin;
      
      // If still off screen, position in center
      if (top < margin) {
        top = (window.innerHeight - tooltipRect.height) / 2;
        left = (window.innerWidth - tooltipRect.width) / 2;
      }
    }
    
    tooltip.style.position = 'fixed';
    tooltip.style.top = Math.max(margin, top) + 'px';
    tooltip.style.left = Math.max(margin, left) + 'px';
    tooltip.style.transform = 'none';
    tooltip.style.maxWidth = (window.innerWidth - 2 * margin) + 'px';
  }
  
  highlightElement(selector) {
    // Remove previous highlights and spotlights
    document.querySelectorAll('.onboarding-highlight').forEach(el => {
      el.classList.remove('onboarding-highlight');
    });
    document.querySelectorAll('.onboarding-spotlight').forEach(el => {
      el.remove();
    });
    
    if (!selector) return;
    
    const element = document.querySelector(selector);
    if (element) {
      element.classList.add('onboarding-highlight');
      
      // Create spotlight effect
      this.createSpotlight(element);
      
      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  
  createSpotlight(element) {
    const rect = element.getBoundingClientRect();
    const spotlight = document.createElement('div');
    spotlight.className = 'onboarding-spotlight';
    spotlight.style.cssText = `
      position: fixed;
      top: ${rect.top - 10}px;
      left: ${rect.left - 10}px;
      width: ${rect.width + 20}px;
      height: ${rect.height + 20}px;
      border-radius: 12px;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
      pointer-events: none;
      z-index: 9998;
      animation: spotlightPulse 2s infinite;
    `;
    document.body.appendChild(spotlight);
  }
  
  showActionHint(step) {
    const hint = document.createElement('div');
    hint.className = 'onboarding-hint pulse';
    hint.innerHTML = `
      <div class="hint-content">
        <div class="hint-icon">👆</div>
        <div class="hint-text">Click here</div>
      </div>
    `;
    
    const target = document.querySelector(step.highlight || step.target);
    if (target) {
      target.style.position = 'relative';
      target.appendChild(hint);
      
      setTimeout(() => {
        if (hint.parentElement) {
          hint.remove();
        }
      }, 4000);
    }
  }
  
  nextStep() {
    this.showStep(this.currentStep + 1);
  }
  
  skipOnboarding() {
    this.completeOnboarding();
  }
  
  completeOnboarding() {
    // Remove overlay
    const overlay = document.getElementById('onboarding-overlay');
    if (overlay) {
      overlay.remove();
    }
    
    // Remove highlights and spotlights
    document.querySelectorAll('.onboarding-highlight').forEach(el => {
      el.classList.remove('onboarding-highlight');
    });
    document.querySelectorAll('.onboarding-spotlight').forEach(el => {
      el.remove();
    });
    
    // Mark as completed
    localStorage.setItem('hasOnboarded', 'true');
    
    // Show completion message
    if (this.app && this.app.showToast) {
      this.app.showToast('Welcome to colorQ! Ready to create amazing art! 🎨', 'success');
    }
  }
  
  resetOnboarding() {
    localStorage.removeItem('hasOnboarded');
  }
};