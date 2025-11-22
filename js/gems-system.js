// Gems System + Daily Login Wheel
class GemsSystem {
  constructor(app) {
    this.app = app;
    this.gems = parseInt(localStorage.getItem('gems') || '0');
    this.lastSpinDate = localStorage.getItem('lastSpinDate');
    
    this.wheelRewards = [
      { type: 'gems', amount: 10, weight: 30, color: '#FFD700' },
      { type: 'gems', amount: 25, weight: 25, color: '#FF6B6B' },
      { type: 'gems', amount: 50, weight: 20, color: '#4ECDC4' },
      { type: 'gems', amount: 100, weight: 15, color: '#45B7D1' },
      { type: 'gems', amount: 250, weight: 8, color: '#9B59B6' },
      { type: 'gems', amount: 500, weight: 2, color: '#FF2D92' }
    ];
    
    this.init();
  }

  init() {
    this.updateGemsDisplay();
    this.checkDailyWheel();
    this.createGemsUI();
  }

  createGemsUI() {
    // Add gems counter to header
    const headerRight = document.querySelector('.header-right');
    if (headerRight) {
      const gemsCounter = document.createElement('div');
      gemsCounter.className = 'gems-counter';
      gemsCounter.innerHTML = `
        <div class="gems-display" id="gems-display">
          <span class="gems-icon">💎</span>
          <span class="gems-amount" id="gems-amount">${this.gems}</span>
        </div>
      `;
      headerRight.insertBefore(gemsCounter, headerRight.firstChild);
    }

    // Add daily wheel button to home
    const homeActions = document.querySelector('.actions-section');
    if (homeActions && this.canSpinToday()) {
      const wheelBtn = document.createElement('button');
      wheelBtn.className = 'secondary-btn wheel-btn pulsing';
      wheelBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 6v6l4 2"></path>
        </svg>
        🎰 Daily Wheel
      `;
      wheelBtn.addEventListener('click', () => this.showDailyWheel());
      homeActions.appendChild(wheelBtn);
    }
  }

  updateGemsDisplay() {
    const gemsAmount = document.getElementById('gems-amount');
    if (gemsAmount) {
      gemsAmount.textContent = this.gems;
      
      // Animate gems change
      gemsAmount.classList.add('gems-animate');
      setTimeout(() => gemsAmount.classList.remove('gems-animate'), 500);
    }
  }

  addGems(amount) {
    this.gems += amount;
    localStorage.setItem('gems', this.gems.toString());
    this.updateGemsDisplay();
    
    // Show floating gems animation
    this.showFloatingGems(amount);
  }

  spendGems(amount) {
    if (this.gems >= amount) {
      this.gems -= amount;
      localStorage.setItem('gems', this.gems.toString());
      this.updateGemsDisplay();
      return true;
    }
    return false;
  }

  showFloatingGems(amount) {
    const gemsDisplay = document.getElementById('gems-display');
    if (!gemsDisplay) return;

    const floating = document.createElement('div');
    floating.className = 'floating-gems';
    floating.textContent = `+${amount} 💎`;
    
    const rect = gemsDisplay.getBoundingClientRect();
    floating.style.position = 'fixed';
    floating.style.left = rect.left + 'px';
    floating.style.top = rect.top + 'px';
    floating.style.zIndex = '9999';
    floating.style.pointerEvents = 'none';
    floating.style.color = '#FFD700';
    floating.style.fontWeight = 'bold';
    floating.style.fontSize = '18px';
    
    document.body.appendChild(floating);
    
    // Animate upward
    floating.animate([
      { transform: 'translateY(0px)', opacity: 1 },
      { transform: 'translateY(-50px)', opacity: 0 }
    ], {
      duration: 1000,
      easing: 'ease-out'
    }).onfinish = () => floating.remove();
  }

  canSpinToday() {
    const today = new Date().toDateString();
    return this.lastSpinDate !== today;
  }

  checkDailyWheel() {
    if (this.canSpinToday()) {
      // Show notification after delay
      setTimeout(() => {
        if (document.querySelector('.home-main')) {
          this.showWheelNotification();
        }
      }, 3000);
    }
  }

  showWheelNotification() {
    const notification = document.createElement('div');
    notification.className = 'wheel-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">🎰</div>
        <div class="notification-text">
          <h4>Daily Wheel Available!</h4>
          <p>Spin for free gems and rewards</p>
        </div>
        <button class="notification-btn" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
    
    notification.addEventListener('click', (e) => {
      if (e.target.classList.contains('notification-btn')) return;
      this.showDailyWheel();
      notification.remove();
    });
  }

  showDailyWheel() {
    if (!this.canSpinToday()) {
      this.app.showToast('Already spun today! Come back tomorrow.', 'info');
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay wheel-modal active';
    modal.innerHTML = `
      <div class="modal wheel-modal-content">
        <div class="wheel-header">
          <h2>🎰 Daily Wheel</h2>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        <div class="wheel-content">
          <div class="wheel-container">
            <canvas id="wheel-canvas" width="300" height="300"></canvas>
            <div class="wheel-pointer">▼</div>
          </div>
          <div class="wheel-info">
            <p>Spin once per day for free gems!</p>
            <button class="primary-btn" id="spin-wheel-btn">SPIN! 🎰</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    this.drawWheel();
    
    document.getElementById('spin-wheel-btn').addEventListener('click', () => {
      this.spinWheel();
    });
  }

  drawWheel() {
    const canvas = document.getElementById('wheel-canvas');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 140;
    
    let currentAngle = 0;
    const totalWeight = this.wheelRewards.reduce((sum, reward) => sum + reward.weight, 0);
    
    this.wheelRewards.forEach((reward, index) => {
      const sliceAngle = (reward.weight / totalWeight) * 2 * Math.PI;
      
      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = reward.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw text
      const textAngle = currentAngle + sliceAngle / 2;
      const textX = centerX + Math.cos(textAngle) * (radius * 0.7);
      const textY = centerY + Math.sin(textAngle) * (radius * 0.7);
      
      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${reward.amount}💎`, 0, 0);
      ctx.restore();
      
      currentAngle += sliceAngle;
    });
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
  }

  spinWheel() {
    const spinBtn = document.getElementById('spin-wheel-btn');
    spinBtn.disabled = true;
    spinBtn.textContent = 'Spinning...';
    
    // Determine reward using seeded random
    const today = new Date().toDateString();
    const seed = this.hashCode(today + this.app.gamificationEngine?.userStats?.total_xp || '0');
    const reward = this.getSeededReward(seed);
    
    // Calculate spin angle
    const totalWeight = this.wheelRewards.reduce((sum, r) => sum + r.weight, 0);
    let targetAngle = 0;
    let currentWeight = 0;
    
    for (const r of this.wheelRewards) {
      if (r === reward) {
        targetAngle = ((currentWeight + r.weight / 2) / totalWeight) * 360;
        break;
      }
      currentWeight += r.weight;
    }
    
    // Add multiple rotations + target angle
    const finalAngle = 360 * 5 + targetAngle;
    
    // Animate wheel spin
    const canvas = document.getElementById('wheel-canvas');
    let currentRotation = 0;
    const duration = 3000;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      currentRotation = finalAngle * easeOut;
      
      canvas.style.transform = `rotate(${currentRotation}deg)`;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.showWheelResult(reward);
      }
    };
    
    animate();
  }

  getSeededReward(seed) {
    // Seeded random selection
    const totalWeight = this.wheelRewards.reduce((sum, reward) => sum + reward.weight, 0);
    const random = (seed % 1000) / 1000;
    const target = random * totalWeight;
    
    let currentWeight = 0;
    for (const reward of this.wheelRewards) {
      currentWeight += reward.weight;
      if (target <= currentWeight) {
        return reward;
      }
    }
    
    return this.wheelRewards[0];
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  showWheelResult(reward) {
    // Mark as spun today
    this.lastSpinDate = new Date().toDateString();
    localStorage.setItem('lastSpinDate', this.lastSpinDate);
    
    // Award gems
    this.addGems(reward.amount);
    
    // Show result modal
    const resultModal = document.createElement('div');
    resultModal.className = 'modal-overlay wheel-result-modal active';
    resultModal.innerHTML = `
      <div class="modal wheel-result">
        <div class="result-header">
          <h2>🎉 Congratulations!</h2>
        </div>
        <div class="result-content">
          <div class="reward-display">
            <div class="reward-icon">💎</div>
            <div class="reward-amount">${reward.amount} Gems</div>
          </div>
          <div class="result-message">
            You won ${reward.amount} gems!
          </div>
          <div class="result-actions">
            <button class="primary-btn" onclick="document.querySelectorAll('.modal-overlay').forEach(m => m.remove())">
              Awesome!
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(resultModal);
    
    // Trigger confetti
    if (this.app.animationEngine) {
      this.app.animationEngine.celebrateAchievement(`Won ${reward.amount} Gems!`);
    }
    
    // Play sound
    this.app.playSound('surprise');
  }

  getGems() {
    return this.gems;
  }
}