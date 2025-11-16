// Settings Manager - Theme and Preferences
class SettingsManager {
    constructor(app) {
        this.app = app;
        this.modal = null;
    }

    show() {
        this.modal = document.getElementById('settings-modal');
        this.modal.classList.add('active');
        this.setupEventListeners();
        this.loadCurrentSettings();
    }

    hide() {
        if (this.modal) {
            this.modal.classList.remove('active');
        }
    }

    setupEventListeners() {
        // Close button
        document.getElementById('settings-close').addEventListener('click', () => {
            this.hide();
        });

        // Click outside to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // Theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setTheme(btn.dataset.theme);
            });
        });

        // Settings inputs
        document.getElementById('animation-speed').addEventListener('change', (e) => {
            this.updateSetting('animationSpeed', e.target.value);
        });

        document.getElementById('sound-effects').addEventListener('change', (e) => {
            this.updateSetting('soundEffects', e.target.checked);
        });

        document.getElementById('auto-save').addEventListener('change', (e) => {
            this.updateSetting('autoSave', e.target.checked);
        });
    }

    loadCurrentSettings() {
        const settings = this.app.getState().settings;
        
        // Update theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === settings.theme);
        });

        // Update form inputs
        document.getElementById('animation-speed').value = settings.animationSpeed;
        document.getElementById('sound-effects').checked = settings.soundEffects;
        document.getElementById('auto-save').checked = settings.autoSave;
    }

    setTheme(theme) {
        // Update buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-theme="${theme}"]`).classList.add('active');

        // Apply theme
        this.updateSetting('theme', theme);
        this.app.showToast(`Switched to ${theme} theme`, 'success');
    }

    updateSetting(key, value) {
        const newSettings = { [key]: value };
        this.app.updateSettings(newSettings);
        
        // Apply specific setting changes
        this.applySettingChange(key, value);
    }

    applySettingChange(key, value) {
        switch (key) {
            case 'animationSpeed':
                this.applyAnimationSpeed(value);
                break;
            case 'soundEffects':
                // Sound effects are handled in app.js
                break;
            case 'autoSave':
                this.toggleAutoSave(value);
                break;
        }
    }

    applyAnimationSpeed(speed) {
        const root = document.documentElement;
        const speeds = {
            off: '0s',
            subtle: '0.1s',
            normal: '0.2s',
            playful: '0.4s'
        };
        
        root.style.setProperty('--transition-duration', speeds[speed] || speeds.normal);
    }

    toggleAutoSave(enabled) {
        if (enabled) {
            // Auto-save is handled in app.js
            this.app.showToast('Auto-save enabled', 'success');
        } else {
            this.app.showToast('Auto-save disabled', 'success');
        }
    }
}