// Storage Manager
class StorageManager {
  constructor() {
    this.prefix = 'colorQ_';
  }

  get(key) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch {
      console.warn('Storage failed');
    }
  }

  remove(key) {
    localStorage.removeItem(this.prefix + key);
  }
}