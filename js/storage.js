// Storage Manager
class StorageManager {
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.warn('Storage failed');
    }
  }

  remove(key) {
    localStorage.removeItem(key);
  }
}