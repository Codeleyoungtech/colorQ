// Settings Manager
class SettingsManager {
  constructor(app) {
    this.app = app;
    this.init();
  }

  init() {
    const modal = document.getElementById('settings-modal');
    const closeBtn = document.getElementById('settings-close');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }
    
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.hide();
      });
    }

    // Setup theme buttons
    this.setupThemeButtons();
    
    // Setup other settings
    this.setupOtherSettings();
    
    // Load and apply saved theme
    setTimeout(() => this.loadTheme(), 100);
  }

  setupThemeButtons() {
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const theme = e.target.dataset.theme;
        this.setTheme(theme);
      });
    });
  }

  setupOtherSettings() {
    // Animation speed
    const animationSpeed = document.getElementById('animation-speed');
    if (animationSpeed) {
      animationSpeed.addEventListener('change', (e) => {
        this.updateSetting('animationSpeed', e.target.value);
      });
    }

    // Sound effects
    const soundEffects = document.getElementById('sound-effects');
    if (soundEffects) {
      soundEffects.addEventListener('change', (e) => {
        this.updateSetting('soundEffects', e.target.checked);
      });
    }

    // Auto save
    const autoSave = document.getElementById('auto-save');
    if (autoSave) {
      autoSave.addEventListener('change', (e) => {
        this.updateSetting('autoSave', e.target.checked);
      });
    }
  }

  setTheme(theme) {
    // Update UI
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const themeBtn = document.querySelector(`[data-theme="${theme}"]`);
    if (themeBtn) themeBtn.classList.add('active');
    
    // Remove old theme classes
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-pastel', 'theme-nature');
    
    // Apply theme
    document.body.setAttribute('data-theme', theme);
    document.body.classList.add('theme-' + theme);
    
    // Save theme
    this.updateSetting('theme', theme);
    
    // Show feedback
    if (this.app.showToast) {
      this.app.showToast(`Theme changed to ${theme}`, 'success');
    }
  }

  loadTheme() {
    const savedSettings = this.app.storageManager.get('settings');
    const theme = savedSettings?.theme || 'light';
    
    // Remove old theme classes
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-pastel', 'theme-nature');
    
    // Apply theme to body
    document.body.setAttribute('data-theme', theme);
    document.body.classList.add('theme-' + theme);
    
    // Update UI
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const themeBtn = document.querySelector(`[data-theme="${theme}"]`);
    if (themeBtn) {
      themeBtn.classList.add('active');
    }
    
    // Load other settings
    if (savedSettings) {
      if (savedSettings.animationSpeed) {
        const animationSelect = document.getElementById('animation-speed');
        if (animationSelect) animationSelect.value = savedSettings.animationSpeed;
      }
      
      if (typeof savedSettings.soundEffects === 'boolean') {
        const soundCheckbox = document.getElementById('sound-effects');
        if (soundCheckbox) soundCheckbox.checked = savedSettings.soundEffects;
      }
      
      if (typeof savedSettings.autoSave === 'boolean') {
        const autoSaveCheckbox = document.getElementById('auto-save');
        if (autoSaveCheckbox) autoSaveCheckbox.checked = savedSettings.autoSave;
      }
    }
  }

  updateSetting(key, value) {
    const currentSettings = this.app.storageManager.get('settings') || {};
    currentSettings[key] = value;
    this.app.storageManager.set('settings', currentSettings);
    
    // Update app state
    if (this.app.state && this.app.state.settings) {
      this.app.state.settings[key] = value;
    }
  }

  show() {
    document.getElementById('settings-modal').classList.add('active');
  }

  hide() {
    document.getElementById('settings-modal').classList.remove('active');
  }
}