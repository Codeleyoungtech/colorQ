// Storage Manager - Local Storage with Error Handling
class StorageManager {
    constructor() {
        this.prefix = 'colorlab_';
        this.isAvailable = this.checkAvailability();
    }

    checkAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage is not available:', e);
            return false;
        }
    }

    set(key, value) {
        if (!this.isAvailable) return false;
        
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(this.prefix + key, serialized);
            return true;
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
            return false;
        }
    }

    get(key, defaultValue = null) {
        if (!this.isAvailable) return defaultValue;
        
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Failed to read from localStorage:', e);
            return defaultValue;
        }
    }

    remove(key) {
        if (!this.isAvailable) return false;
        
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (e) {
            console.error('Failed to remove from localStorage:', e);
            return false;
        }
    }

    clear() {
        if (!this.isAvailable) return false;
        
        try {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (e) {
            console.error('Failed to clear localStorage:', e);
            return false;
        }
    }

    getAll() {
        if (!this.isAvailable) return {};
        
        const items = {};
        try {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(this.prefix)) {
                    const cleanKey = key.replace(this.prefix, '');
                    items[cleanKey] = this.get(cleanKey);
                }
            });
        } catch (e) {
            console.error('Failed to get all items from localStorage:', e);
        }
        
        return items;
    }

    getStorageSize() {
        if (!this.isAvailable) return 0;
        
        let total = 0;
        try {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(this.prefix)) {
                    total += localStorage.getItem(key).length;
                }
            });
        } catch (e) {
            console.error('Failed to calculate storage size:', e);
        }
        
        return total;
    }

    exportData() {
        const data = this.getAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `color-lab-data-${Date.now()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    Object.entries(data).forEach(([key, value]) => {
                        this.set(key, value);
                    });
                    resolve(data);
                } catch (error) {
                    reject(new Error('Invalid file format'));
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
}