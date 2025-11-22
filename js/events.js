// Weekly Theme Events System
class EventsSystem {
  constructor(app) {
    this.app = app;
    this.currentEvent = null;
    
    // 52-week event calendar
    this.events = [
      { week: 1, name: 'New Year Sparkle', theme: 'sparkle', colors: ['#FFD700', '#FF6B35', '#FFFFFF'], brushes: ['sparkle', 'neon'] },
      { week: 6, name: 'Valentine Hearts', theme: 'love', colors: ['#FF1744', '#E91E63', '#F8BBD9'], brushes: ['heart', 'glow'] },
      { week: 12, name: 'Spring Bloom', theme: 'nature', colors: ['#4CAF50', '#8BC34A', '#FFEB3B'], brushes: ['flower', 'watercolor'] },
      { week: 16, name: 'Easter Pastels', theme: 'pastel', colors: ['#E1BEE7', '#B39DDB', '#90CAF9'], brushes: ['soft', 'cloud'] },
      { week: 20, name: 'Summer Vibes', theme: 'summer', colors: ['#FF9800', '#FFC107', '#00BCD4'], brushes: ['sun', 'wave'] },
      { week: 24, name: 'Pride Rainbow', theme: 'pride', colors: ['#E40303', '#FF8C00', '#FFED00', '#008018', '#0078D4', '#732982'], brushes: ['rainbow', 'pride'] },
      { week: 28, name: 'Ocean Deep', theme: 'ocean', colors: ['#006064', '#0097A7', '#00BCD4'], brushes: ['wave', 'bubble'] },
      { week: 32, name: 'Neon Nights', theme: 'neon', colors: ['#FF073A', '#39FF14', '#00FFFF'], brushes: ['neon', 'electric'] },
      { week: 36, name: 'Autumn Leaves', theme: 'autumn', colors: ['#FF5722', '#FF9800', '#FFC107'], brushes: ['leaf', 'wind'] },
      { week: 40, name: 'Spooky Halloween', theme: 'halloween', colors: ['#FF5722', '#000000', '#FF9800'], brushes: ['ghost', 'pumpkin'] },
      { week: 44, name: 'Thanksgiving Warm', theme: 'thanksgiving', colors: ['#8D6E63', '#FF8A65', '#FFCC02'], brushes: ['warm', 'cozy'] },
      { week: 48, name: 'Winter Frost', theme: 'winter', colors: ['#E3F2FD', '#BBDEFB', '#2196F3'], brushes: ['frost', 'snow'] },
      { week: 50, name: 'Christmas Magic', theme: 'christmas', colors: ['#C62828', '#2E7D32', '#FFD700'], brushes: ['star', 'magic'] }
    ];
    
    this.init();
  }
  
  init() {
    this.checkCurrentEvent();
    this.createEventUI();
  }
  
  checkCurrentEvent() {
    const now = new Date();
    const weekNumber = this.getWeekNumber(now);
    
    this.currentEvent = this.events.find(event => event.week === weekNumber);
    
    if (this.currentEvent) {
      this.activateEvent();
    }
  }
  
  getWeekNumber(date) {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
  }
  
  activateEvent() {
    if (!this.currentEvent) return;
    
    // Store event state
    localStorage.setItem('activeEvent', JSON.stringify(this.currentEvent));
    
    // Unlock event brushes
    this.unlockEventBrushes();
    
    // Apply event theme
    this.applyEventTheme();
    
    // Show event notification
    this.showEventNotification();
  }
  
  unlockEventBrushes() {
    const unlockedBrushes = JSON.parse(localStorage.getItem('unlockedBrushes') || '[]');
    
    this.currentEvent.brushes.forEach(brush => {
      if (!unlockedBrushes.includes(brush)) {
        unlockedBrushes.push(brush);
      }
    });
    
    localStorage.setItem('unlockedBrushes', JSON.stringify(unlockedBrushes));
  }
  
  applyEventTheme() {
    document.body.setAttribute('data-event-theme', this.currentEvent.theme);
    
    // Add event colors to palette
    if (this.app.colorManager) {
      this.currentEvent.colors.forEach(color => {
        this.app.colorManager.addToRecent(color);
      });
    }
  }
  
  showEventNotification() {
    const notification = document.createElement('div');
    notification.className = 'event-notification';
    notification.innerHTML = `
      <div class="event-content">
        <h3>🎉 ${this.currentEvent.name} Event!</h3>
        <p>Exclusive brushes and colors unlocked!</p>
        <div class="event-colors">
          ${this.currentEvent.colors.map(color => 
            `<div class="event-color" style="background: ${color}"></div>`
          ).join('')}
        </div>
        <button onclick="this.parentElement.parentElement.remove()">Got it!</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 8000);
  }
  
  createEventUI() {
    if (!this.currentEvent) return;
    
    const eventBanner = document.createElement('div');
    eventBanner.className = 'event-banner';
    eventBanner.innerHTML = `
      <div class="event-info">
        <span class="event-icon">🎉</span>
        <span class="event-text">${this.currentEvent.name} Event Active!</span>
      </div>
    `;
    
    const header = document.querySelector('.app-header');
    if (header) {
      header.appendChild(eventBanner);
    }
  }
  
  getCurrentEvent() {
    return this.currentEvent;
  }
  
  isEventActive() {
    return !!this.currentEvent;
  }
}