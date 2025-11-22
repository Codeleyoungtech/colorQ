// Art Shop System
class ShopSystem {
  constructor(app) {
    this.app = app;
    this.shopItems = [
      // Brush Packs
      { id: 'neon_pack', name: 'Neon Pack', type: 'brushes', price: 100, items: ['neon', 'electric', 'glow'], icon: '⚡' },
      { id: 'watercolor_pro', name: 'Watercolor Pro', type: 'brushes', price: 150, items: ['watercolor', 'wet', 'blend'], icon: '🎨' },
      { id: 'galaxy_brushes', name: 'Galaxy Brushes', type: 'brushes', price: 200, items: ['star', 'nebula', 'cosmic'], icon: '🌌' },
      { id: 'nature_pack', name: 'Nature Pack', type: 'brushes', price: 120, items: ['leaf', 'flower', 'tree'], icon: '🌿' },
      
      // Themes
      { id: 'dark_mode', name: 'Dark Mode', type: 'theme', price: 50, items: ['dark'], icon: '🌙' },
      { id: 'cyberpunk', name: 'Cyberpunk', type: 'theme', price: 200, items: ['cyberpunk'], icon: '🤖' },
      { id: 'pastel_dream', name: 'Pastel Dream', type: 'theme', price: 100, items: ['pastel'], icon: '🦄' },
      { id: 'ocean_depths', name: 'Ocean Depths', type: 'theme', price: 150, items: ['ocean'], icon: '🌊' },
      
      // Avatars
      { id: 'artist_cat', name: 'Artist Cat', type: 'avatar', price: 75, items: ['cat'], icon: '🐱' },
      { id: 'paint_robot', name: 'Paint Robot', type: 'avatar', price: 100, items: ['robot'], icon: '🤖' },
      { id: 'magic_unicorn', name: 'Magic Unicorn', type: 'avatar', price: 125, items: ['unicorn'], icon: '🦄' },
      
      // Special Effects
      { id: 'particle_fx', name: 'Particle Effects', type: 'effects', price: 80, items: ['particles'], icon: '✨' },
      { id: 'mirror_mode', name: 'Mirror Mode', type: 'effects', price: 60, items: ['mirror'], icon: '🪞' },
      { id: 'time_lapse', name: 'Time Lapse', type: 'effects', price: 150, items: ['timelapse'], icon: '⏱️' }
    ];
    
    this.init();
  }
  
  init() {
    this.loadPurchases();
    this.createShopButton();
  }
  
  loadPurchases() {
    this.purchases = JSON.parse(localStorage.getItem('shopPurchases') || '[]');
  }
  
  createShopButton() {
    const gemsDisplay = document.querySelector('.gems-display');
    if (gemsDisplay) {
      const shopBtn = document.createElement('button');
      shopBtn.className = 'shop-btn';
      shopBtn.innerHTML = '🛍️ Shop';
      shopBtn.addEventListener('click', () => this.showShop());
      gemsDisplay.appendChild(shopBtn);
    }
  }
  
  showShop() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay shop-modal active';
    modal.innerHTML = `
      <div class="modal shop-content">
        <div class="modal-header">
          <h2>🛍️ Art Shop</h2>
          <div class="gems-balance">💎 ${this.getGems()} Gems</div>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        <div class="modal-content">
          <div class="shop-categories">
            <button class="category-btn active" data-category="all">All</button>
            <button class="category-btn" data-category="brushes">Brushes</button>
            <button class="category-btn" data-category="theme">Themes</button>
            <button class="category-btn" data-category="avatar">Avatars</button>
            <button class="category-btn" data-category="effects">Effects</button>
          </div>
          <div class="shop-grid" id="shop-grid">
            ${this.renderShopItems()}
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.setupShopEvents(modal);
  }
  
  renderShopItems(category = 'all') {
    const items = category === 'all' ? this.shopItems : this.shopItems.filter(item => item.type === category);
    
    return items.map(item => {
      const owned = this.purchases.includes(item.id);
      const canAfford = this.getGems() >= item.price;
      
      return `
        <div class="shop-item ${owned ? 'owned' : ''} ${!canAfford && !owned ? 'locked' : ''}">
          <div class="item-icon">${item.icon}</div>
          <div class="item-info">
            <h3>${item.name}</h3>
            <p>${item.items.length} items</p>
          </div>
          <div class="item-price">
            ${owned ? 
              '<span class="owned-badge">✓ Owned</span>' : 
              `<button class="buy-btn" ${!canAfford ? 'disabled' : ''} onclick="shopSystem.buyItem('${item.id}')">
                💎 ${item.price}
              </button>`
            }
          </div>
        </div>
      `;
    }).join('');
  }
  
  setupShopEvents(modal) {
    // Category filtering
    modal.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        modal.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        const category = e.target.dataset.category;
        const grid = modal.querySelector('#shop-grid');
        grid.innerHTML = this.renderShopItems(category);
      });
    });
  }
  
  buyItem(itemId) {
    const item = this.shopItems.find(i => i.id === itemId);
    if (!item) return;
    
    const currentGems = this.getGems();
    if (currentGems < item.price) {
      this.app.showToast('Not enough gems! 💎', 'error');
      return;
    }
    
    if (this.purchases.includes(itemId)) {
      this.app.showToast('Already owned! ✓', 'info');
      return;
    }
    
    // Deduct gems
    const newGems = currentGems - item.price;
    localStorage.setItem('gems', newGems.toString());
    
    // Add to purchases
    this.purchases.push(itemId);
    localStorage.setItem('shopPurchases', JSON.stringify(this.purchases));
    
    // Unlock items
    this.unlockItems(item);
    
    // Update UI
    this.updateShopUI();
    
    // Show success
    this.app.showToast(`${item.name} purchased! 🎉`, 'success');
    
    // Trigger confetti
    if (this.app.animationEngine) {
      this.app.animationEngine.celebrateAchievement(`${item.name} Unlocked!`);
    }
  }
  
  unlockItems(item) {
    switch (item.type) {
      case 'brushes':
        const unlockedBrushes = JSON.parse(localStorage.getItem('unlockedBrushes') || '[]');
        item.items.forEach(brush => {
          if (!unlockedBrushes.includes(brush)) {
            unlockedBrushes.push(brush);
          }
        });
        localStorage.setItem('unlockedBrushes', JSON.stringify(unlockedBrushes));
        break;
        
      case 'theme':
        const unlockedThemes = JSON.parse(localStorage.getItem('unlockedThemes') || '[]');
        item.items.forEach(theme => {
          if (!unlockedThemes.includes(theme)) {
            unlockedThemes.push(theme);
          }
        });
        localStorage.setItem('unlockedThemes', JSON.stringify(unlockedThemes));
        break;
        
      case 'avatar':
        localStorage.setItem('selectedAvatar', item.items[0]);
        break;
        
      case 'effects':
        const unlockedEffects = JSON.parse(localStorage.getItem('unlockedEffects') || '[]');
        item.items.forEach(effect => {
          if (!unlockedEffects.includes(effect)) {
            unlockedEffects.push(effect);
          }
        });
        localStorage.setItem('unlockedEffects', JSON.stringify(unlockedEffects));
        break;
    }
  }
  
  updateShopUI() {
    const modal = document.querySelector('.shop-modal');
    if (modal) {
      const gemsBalance = modal.querySelector('.gems-balance');
      if (gemsBalance) {
        gemsBalance.textContent = `💎 ${this.getGems()} Gems`;
      }
      
      const grid = modal.querySelector('#shop-grid');
      const activeCategory = modal.querySelector('.category-btn.active').dataset.category;
      grid.innerHTML = this.renderShopItems(activeCategory);
    }
  }
  
  getGems() {
    return parseInt(localStorage.getItem('gems') || '0');
  }
  
  hasPurchased(itemId) {
    return this.purchases.includes(itemId);
  }
  
  getUnlockedBrushes() {
    return JSON.parse(localStorage.getItem('unlockedBrushes') || '[]');
  }
  
  getUnlockedThemes() {
    return JSON.parse(localStorage.getItem('unlockedThemes') || '[]');
  }
}