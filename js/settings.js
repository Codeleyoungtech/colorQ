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
  }

  show() {
    document.getElementById('settings-modal').classList.add('active');
  }

  hide() {
    document.getElementById('settings-modal').classList.remove('active');
  }
}