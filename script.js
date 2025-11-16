class QuantumColorLab {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.selectedColor = null;
        this.selectedColorName = '';
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.brushSize = 20;
        this.particles = [];
        
        this.colorData = {
            '#FF3366': 'Crimson Pulse',
            '#00FFCC': 'Neon Mint',
            '#3366FF': 'Electric Blue',
            '#FFCC00': 'Solar Flare',
            '#CC00FF': 'Violet Storm',
            '#FF6600': 'Phoenix Fire'
        };
        
        this.init();
    }

    init() {
        this.setupEntranceAnimation();
        this.setupCanvas();
        this.setupColorOrbs();
        this.setupEventListeners();
        this.setupQuantumCursor();
        this.setupParticleSystem();
        this.startAnimationLoop();
    }

    setupEntranceAnimation() {
        setTimeout(() => {
            document.getElementById('entrance-overlay').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('entrance-overlay').style.display = 'none';
                document.getElementById('app').classList.remove('hidden');
                document.getElementById('app').classList.add('visible');
            }, 500);
        }, 3000);
    }

    setupCanvas() {
        this.canvas = document.getElementById('paint-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set high DPI canvas
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        
        // Enable smooth rendering
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    setupEventListeners() {
        // Canvas drawing
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });

        // Control buttons
        document.getElementById('clear-canvas').addEventListener('click', () => this.clearCanvas());
        document.getElementById('surprise-mode').addEventListener('click', () => this.quantumMix());
        document.getElementById('save-creation').addEventListener('click', () => this.saveCreation());
    }

    setupQuantumCursor() {
        const cursor = document.createElement('div');
        cursor.className = 'quantum-cursor';
        document.body.appendChild(cursor);
        this.currentCursor = cursor;

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX - 15 + 'px';
            cursor.style.top = e.clientY - 15 + 'px';
            
            if (this.selectedColor) {
                cursor.style.setProperty('--cursor-color', this.selectedColor);
                cursor.style.opacity = '1';
            } else {
                cursor.style.opacity = '0.3';
            }
        });
    }

    setupColorOrbs() {
        Object.entries(this.colorData).forEach(([color, name]) => {
            const orb = document.querySelector(`[data-color="${color}"]`);
            if (orb) {
                orb.style.setProperty('--orb-color', color);
                orb.addEventListener('click', () => this.selectColor(color, name));
            }
        });
    }
    
    setupParticleSystem() {
        const particleContainer = document.querySelector('.particle-system');
        
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (6 + Math.random() * 4) + 's';
            particleContainer.appendChild(particle);
        }
    }

    selectColor(color, name) {
        this.selectedColor = color;
        this.selectedColorName = name;
        
        // Update UI
        document.querySelectorAll('.color-orb').forEach(orb => {
            orb.classList.remove('selected');
        });
        
        document.querySelector(`[data-color="${color}"]`).classList.add('selected');
        
        // Update color display
        document.querySelector('.color-name').textContent = name;
        document.querySelector('.color-code').textContent = color;
        document.querySelector('.color-preview').style.background = color;
        document.querySelector('.color-preview').style.boxShadow = `0 0 20px ${color}`;
        
        // Hide instruction text
        document.querySelector('.canvas-frame').classList.add('active');
        
        // Create selection particles
        this.createSelectionEffect(color);
    }

    startDrawing(e) {
        if (!this.selectedColor) return;
        
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
        
        // Create quantum spark effect
        this.createQuantumSpark(this.lastX, this.lastY);
    }
    
    draw(e) {
        if (!this.isDrawing || !this.selectedColor) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        // Draw smooth line
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.selectedColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.globalAlpha = 0.8;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();
        
        // Add glow effect
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.strokeStyle = this.selectedColor;
        this.ctx.lineWidth = this.brushSize * 2;
        this.ctx.globalAlpha = 0.1;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();
        
        // Create trail particles
        if (Math.random() < 0.3) {
            this.createQuantumSpark(currentX, currentY);
        }
        
        this.lastX = currentX;
        this.lastY = currentY;
    }
    
    stopDrawing() {
        this.isDrawing = false;
    }

    createQuantumSpark(x, y) {
        for (let i = 0; i < 3; i++) {
            const spark = document.createElement('div');
            spark.className = 'quantum-spark';
            spark.style.left = x + 'px';
            spark.style.top = y + 'px';
            spark.style.setProperty('--spark-x', (Math.random() - 0.5) * 100 + 'px');
            spark.style.setProperty('--spark-y', (Math.random() - 0.5) * 100 + 'px');
            
            this.canvas.parentElement.appendChild(spark);
            
            setTimeout(() => {
                spark.remove();
            }, 1000);
        }
    }

    quantumMix() {
        const colors = Object.keys(this.colorData);
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const colorName = this.colorData[randomColor];
        
        this.selectColor(randomColor, colorName);
        
        // Create quantum explosion effect
        this.createQuantumExplosion();
    }
    
    createQuantumExplosion() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const angle = (i / 20) * Math.PI * 2;
                const distance = 50 + Math.random() * 100;
                const x = centerX + Math.cos(angle) * distance;
                const y = centerY + Math.sin(angle) * distance;
                
                this.createQuantumSpark(x, y);
            }, i * 50);
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Reset selection
        document.querySelectorAll('.color-orb').forEach(orb => {
            orb.classList.remove('selected');
        });
        
        this.selectedColor = null;
        this.selectedColorName = '';
        
        // Reset UI
        document.querySelector('.color-name').textContent = 'Select a quantum color';
        document.querySelector('.color-code').textContent = '#000000';
        document.querySelector('.color-preview').style.background = '#cccccc';
        document.querySelector('.color-preview').style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.1)';
        document.querySelector('.canvas-frame').classList.remove('active');
    }

    saveCreation() {
        const link = document.createElement('a');
        link.download = `quantum-creation-${Date.now()}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
    }
    
    createSelectionEffect(color) {
        const orb = document.querySelector(`[data-color="${color}"]`);
        const rect = orb.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'quantum-spark';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
            particle.style.setProperty('--spark-x', (Math.random() - 0.5) * 200 + 'px');
            particle.style.setProperty('--spark-y', (Math.random() - 0.5) * 200 + 'px');
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 1000);
        }
    }











    startAnimationLoop() {
        const animate = () => {
            // Subtle canvas glow effect
            if (this.selectedColor) {
                const frame = document.querySelector('.canvas-frame');
                frame.style.boxShadow = `
                    0 0 50px ${this.selectedColor}30,
                    inset 0 0 50px rgba(255, 255, 255, 0.5)
                `;
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }


}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new QuantumColorLab();
});

