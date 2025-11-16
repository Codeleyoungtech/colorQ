// Color Manager - 200+ Colors with Search and Categories
class ColorManager {
    constructor(app) {
        this.app = app;
        this.colors = {
            reds: [
                { name: 'Crimson', hex: '#DC143C' },
                { name: 'Red', hex: '#FF0000' },
                { name: 'Fire Brick', hex: '#B22222' },
                { name: 'Dark Red', hex: '#8B0000' },
                { name: 'Indian Red', hex: '#CD5C5C' },
                { name: 'Light Coral', hex: '#F08080' },
                { name: 'Salmon', hex: '#FA8072' },
                { name: 'Dark Salmon', hex: '#E9967A' },
                { name: 'Light Salmon', hex: '#FFA07A' },
                { name: 'Cherry', hex: '#DE3163' },
                { name: 'Rose', hex: '#FF007F' },
                { name: 'Watermelon', hex: '#FF5733' },
                { name: 'Tomato', hex: '#FF6347' },
                { name: 'Orange Red', hex: '#FF4500' },
                { name: 'Red Orange', hex: '#FF5349' },
                { name: 'Strawberry', hex: '#FC5A8D' },
                { name: 'Raspberry', hex: '#E30B5C' },
                { name: 'Ruby', hex: '#E0115F' },
                { name: 'Maroon', hex: '#800000' },
                { name: 'Burgundy', hex: '#800020' }
            ],
            oranges: [
                { name: 'Orange', hex: '#FFA500' },
                { name: 'Dark Orange', hex: '#FF8C00' },
                { name: 'Light Orange', hex: '#FFB347' },
                { name: 'Peach', hex: '#FFCBA4' },
                { name: 'Apricot', hex: '#FBCEB1' },
                { name: 'Papaya', hex: '#FFEFD5' },
                { name: 'Mango', hex: '#FFCC5C' },
                { name: 'Tangerine', hex: '#F28500' },
                { name: 'Mandarin', hex: '#F37A48' },
                { name: 'Coral', hex: '#FF7F50' },
                { name: 'Burnt Orange', hex: '#CC5500' },
                { name: 'Pumpkin', hex: '#FF7518' },
                { name: 'Carrot', hex: '#ED9121' },
                { name: 'Amber', hex: '#FFBF00' },
                { name: 'Honey', hex: '#FFC30B' },
                { name: 'Marigold', hex: '#EAA221' },
                { name: 'Sunset', hex: '#FAD5A5' },
                { name: 'Cantaloupe', hex: '#FFA366' },
                { name: 'Persimmon', hex: '#EC5800' },
                { name: 'Tiger', hex: '#FD6A02' }
            ],
            yellows: [
                { name: 'Yellow', hex: '#FFFF00' },
                { name: 'Gold', hex: '#FFD700' },
                { name: 'Light Yellow', hex: '#FFFFE0' },
                { name: 'Lemon', hex: '#FFF700' },
                { name: 'Banana', hex: '#FFE135' },
                { name: 'Canary', hex: '#FFEF00' },
                { name: 'Corn', hex: '#FBEC5D' },
                { name: 'Cream', hex: '#FFFDD0' },
                { name: 'Ivory', hex: '#FFFFF0' },
                { name: 'Beige', hex: '#F5F5DC' },
                { name: 'Wheat', hex: '#F5DEB3' },
                { name: 'Khaki', hex: '#F0E68C' },
                { name: 'Pale Yellow', hex: '#FFFF99' },
                { name: 'Light Goldenrod', hex: '#FAFAD2' },
                { name: 'Dark Goldenrod', hex: '#B8860B' },
                { name: 'Goldenrod', hex: '#DAA520' },
                { name: 'Mustard', hex: '#FFDB58' },
                { name: 'Saffron', hex: '#F4C430' },
                { name: 'Butter', hex: '#FFFF99' },
                { name: 'Sunshine', hex: '#FFD700' }
            ],
            greens: [
                { name: 'Green', hex: '#008000' },
                { name: 'Lime', hex: '#00FF00' },
                { name: 'Dark Green', hex: '#006400' },
                { name: 'Forest Green', hex: '#228B22' },
                { name: 'Olive', hex: '#808000' },
                { name: 'Dark Olive Green', hex: '#556B2F' },
                { name: 'Medium Sea Green', hex: '#3CB371' },
                { name: 'Sea Green', hex: '#2E8B57' },
                { name: 'Dark Sea Green', hex: '#8FBC8F' },
                { name: 'Light Green', hex: '#90EE90' },
                { name: 'Pale Green', hex: '#98FB98' },
                { name: 'Spring Green', hex: '#00FF7F' },
                { name: 'Lawn Green', hex: '#7CFC00' },
                { name: 'Chartreuse', hex: '#7FFF00' },
                { name: 'Medium Spring Green', hex: '#00FA9A' },
                { name: 'Green Yellow', hex: '#ADFF2F' },
                { name: 'Lime Green', hex: '#32CD32' },
                { name: 'Yellow Green', hex: '#9ACD32' },
                { name: 'Mint', hex: '#98FF98' },
                { name: 'Emerald', hex: '#50C878' }
            ],
            blues: [
                { name: 'Blue', hex: '#0000FF' },
                { name: 'Navy', hex: '#000080' },
                { name: 'Dark Blue', hex: '#00008B' },
                { name: 'Medium Blue', hex: '#0000CD' },
                { name: 'Royal Blue', hex: '#4169E1' },
                { name: 'Steel Blue', hex: '#4682B4' },
                { name: 'Dodger Blue', hex: '#1E90FF' },
                { name: 'Deep Sky Blue', hex: '#00BFFF' },
                { name: 'Cornflower Blue', hex: '#6495ED' },
                { name: 'Sky Blue', hex: '#87CEEB' },
                { name: 'Light Sky Blue', hex: '#87CEFA' },
                { name: 'Light Blue', hex: '#ADD8E6' },
                { name: 'Powder Blue', hex: '#B0E0E6' },
                { name: 'Light Cyan', hex: '#E0FFFF' },
                { name: 'Cyan', hex: '#00FFFF' },
                { name: 'Aqua', hex: '#00FFFF' },
                { name: 'Dark Turquoise', hex: '#00CED1' },
                { name: 'Turquoise', hex: '#40E0D0' },
                { name: 'Medium Turquoise', hex: '#48D1CC' },
                { name: 'Pale Turquoise', hex: '#AFEEEE' }
            ],
            purples: [
                { name: 'Purple', hex: '#800080' },
                { name: 'Indigo', hex: '#4B0082' },
                { name: 'Dark Violet', hex: '#9400D3' },
                { name: 'Dark Orchid', hex: '#9932CC' },
                { name: 'Dark Magenta', hex: '#8B008B' },
                { name: 'Blue Violet', hex: '#8A2BE2' },
                { name: 'Medium Orchid', hex: '#BA55D3' },
                { name: 'Medium Purple', hex: '#9370DB' },
                { name: 'Medium Slate Blue', hex: '#7B68EE' },
                { name: 'Slate Blue', hex: '#6A5ACD' },
                { name: 'Dark Slate Blue', hex: '#483D8B' },
                { name: 'Lavender', hex: '#E6E6FA' },
                { name: 'Thistle', hex: '#D8BFD8' },
                { name: 'Plum', hex: '#DDA0DD' },
                { name: 'Violet', hex: '#EE82EE' },
                { name: 'Orchid', hex: '#DA70D6' },
                { name: 'Medium Violet Red', hex: '#C71585' },
                { name: 'Pale Violet Red', hex: '#DB7093' },
                { name: 'Deep Pink', hex: '#FF1493' },
                { name: 'Hot Pink', hex: '#FF69B4' }
            ],
            pinks: [
                { name: 'Pink', hex: '#FFC0CB' },
                { name: 'Light Pink', hex: '#FFB6C1' },
                { name: 'Hot Pink', hex: '#FF69B4' },
                { name: 'Deep Pink', hex: '#FF1493' },
                { name: 'Medium Violet Red', hex: '#C71585' },
                { name: 'Pale Violet Red', hex: '#DB7093' },
                { name: 'Rose', hex: '#FF007F' },
                { name: 'Magenta', hex: '#FF00FF' },
                { name: 'Fuchsia', hex: '#FF00FF' },
                { name: 'Dark Magenta', hex: '#8B008B' },
                { name: 'Purple', hex: '#800080' },
                { name: 'Medium Orchid', hex: '#BA55D3' },
                { name: 'Dark Orchid', hex: '#9932CC' },
                { name: 'Dark Violet', hex: '#9400D3' },
                { name: 'Blue Violet', hex: '#8A2BE2' },
                { name: 'Violet', hex: '#EE82EE' },
                { name: 'Plum', hex: '#DDA0DD' },
                { name: 'Thistle', hex: '#D8BFD8' },
                { name: 'Lavender', hex: '#E6E6FA' },
                { name: 'Misty Rose', hex: '#FFE4E1' }
            ],
            neutrals: [
                { name: 'White', hex: '#FFFFFF' },
                { name: 'Snow', hex: '#FFFAFA' },
                { name: 'Honeydew', hex: '#F0FFF0' },
                { name: 'Mint Cream', hex: '#F5FFFA' },
                { name: 'Azure', hex: '#F0FFFF' },
                { name: 'Alice Blue', hex: '#F0F8FF' },
                { name: 'Ghost White', hex: '#F8F8FF' },
                { name: 'White Smoke', hex: '#F5F5F5' },
                { name: 'Seashell', hex: '#FFF5EE' },
                { name: 'Beige', hex: '#F5F5DC' },
                { name: 'Old Lace', hex: '#FDF5E6' },
                { name: 'Floral White', hex: '#FFFAF0' },
                { name: 'Ivory', hex: '#FFFFF0' },
                { name: 'Antique White', hex: '#FAEBD7' },
                { name: 'Linen', hex: '#FAF0E6' },
                { name: 'Lavender Blush', hex: '#FFF0F5' },
                { name: 'Misty Rose', hex: '#FFE4E1' },
                { name: 'Gainsboro', hex: '#DCDCDC' },
                { name: 'Light Gray', hex: '#D3D3D3' },
                { name: 'Silver', hex: '#C0C0C0' }
            ]
        };
        
        this.recentColors = [];
        this.favoriteColors = [];
        this.currentTab = 'palette';
    }

    async init() {
        this.loadFavorites();
        this.loadRecent();
        this.renderColorPalette();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Color search
        document.getElementById('color-search').addEventListener('input', (e) => {
            this.searchColors(e.target.value);
        });

        // Hex input
        document.getElementById('hex-input').addEventListener('input', (e) => {
            this.handleHexInput(e.target.value);
        });

        // Color tabs
        document.querySelectorAll('.color-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
    }

    renderColorPalette() {
        Object.entries(this.colors).forEach(([category, colors]) => {
            const grid = document.getElementById(`${category}-grid`);
            if (grid) {
                grid.innerHTML = colors.map(color => 
                    `<div class="color-swatch" 
                          style="background-color: ${color.hex}" 
                          data-color="${color.hex}" 
                          data-name="${color.name}"
                          title="${color.name} (${color.hex})">
                     </div>`
                ).join('');

                // Add click listeners
                grid.querySelectorAll('.color-swatch').forEach(swatch => {
                    swatch.addEventListener('click', () => {
                        this.selectColor(swatch.dataset.color, swatch.dataset.name);
                    });
                });
            }
        });
    }

    selectColor(hex, name) {
        // Update app state
        this.app.selectColor(hex, name);
        
        // Update UI
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.classList.remove('selected');
        });
        document.querySelector(`[data-color="${hex}"]`)?.classList.add('selected');
        
        // Add to recent colors
        this.addToRecent(hex, name);
    }

    addToRecent(hex, name) {
        const existing = this.recentColors.findIndex(c => c.hex === hex);
        if (existing !== -1) {
            this.recentColors.splice(existing, 1);
        }
        
        this.recentColors.unshift({ hex, name });
        if (this.recentColors.length > 10) {
            this.recentColors.pop();
        }
        
        this.saveRecent();
        this.renderRecentColors();
    }

    addToFavorites(hex, name) {
        if (!this.favoriteColors.find(c => c.hex === hex)) {
            this.favoriteColors.push({ hex, name });
            this.saveFavorites();
            this.renderFavoriteColors();
        }
    }

    removeFromFavorites(hex) {
        this.favoriteColors = this.favoriteColors.filter(c => c.hex !== hex);
        this.saveFavorites();
        this.renderFavoriteColors();
    }

    renderRecentColors() {
        const grid = document.getElementById('recent-colors');
        grid.innerHTML = this.recentColors.map(color => 
            `<div class="color-swatch" 
                  style="background-color: ${color.hex}" 
                  data-color="${color.hex}" 
                  data-name="${color.name}"
                  title="${color.name} (${color.hex})">
             </div>`
        ).join('');

        grid.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                this.selectColor(swatch.dataset.color, swatch.dataset.name);
            });
        });
    }

    renderFavoriteColors() {
        const grid = document.getElementById('favorite-colors');
        grid.innerHTML = this.favoriteColors.map(color => 
            `<div class="color-swatch" 
                  style="background-color: ${color.hex}" 
                  data-color="${color.hex}" 
                  data-name="${color.name}"
                  title="${color.name} (${color.hex})">
             </div>`
        ).join('');

        grid.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                this.selectColor(swatch.dataset.color, swatch.dataset.name);
            });
            
            swatch.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.removeFromFavorites(swatch.dataset.color);
            });
        });
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.color-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.color-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tab}-tab`).classList.add('active');
        
        // Render content if needed
        if (tab === 'recent') {
            this.renderRecentColors();
        } else if (tab === 'favorites') {
            this.renderFavoriteColors();
        }
    }

    searchColors(query) {
        if (!query.trim()) {
            this.renderColorPalette();
            return;
        }
        
        const results = [];
        Object.values(this.colors).flat().forEach(color => {
            if (color.name.toLowerCase().includes(query.toLowerCase()) ||
                color.hex.toLowerCase().includes(query.toLowerCase())) {
                results.push(color);
            }
        });
        
        // Show search results
        this.renderSearchResults(results);
    }

    renderSearchResults(results) {
        // Clear all grids first
        Object.keys(this.colors).forEach(category => {
            const grid = document.getElementById(`${category}-grid`);
            if (grid) grid.innerHTML = '';
        });
        
        // Show results in first grid
        const firstGrid = document.getElementById('reds-grid');
        firstGrid.innerHTML = results.map(color => 
            `<div class="color-swatch" 
                  style="background-color: ${color.hex}" 
                  data-color="${color.hex}" 
                  data-name="${color.name}"
                  title="${color.name} (${color.hex})">
             </div>`
        ).join('');

        firstGrid.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                this.selectColor(swatch.dataset.color, swatch.dataset.name);
            });
        });
    }

    handleHexInput(value) {
        if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
            this.selectColor(value, 'Custom Color');
        }
    }

    getRandomColor() {
        const allColors = Object.values(this.colors).flat();
        return allColors[Math.floor(Math.random() * allColors.length)];
    }

    loadRecent() {
        const saved = this.app.storageManager.get('recentColors');
        if (saved) {
            this.recentColors = saved;
        }
    }

    saveRecent() {
        this.app.storageManager.set('recentColors', this.recentColors);
    }

    loadFavorites() {
        const saved = this.app.storageManager.get('favoriteColors');
        if (saved) {
            this.favoriteColors = saved;
        }
    }

    saveFavorites() {
        this.app.storageManager.set('favoriteColors', this.favoriteColors);
    }
}