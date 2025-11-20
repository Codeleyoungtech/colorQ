// Canvas Engine - Smooth Color Mixing
class CanvasEngine {
    constructor(app) {
        this.app = app;
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;
        this.hasUnsavedChanges = false;
        this.mixMode = 'draw';
    }

    async init() {
        this.canvas = document.getElementById('main-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.imageSmoothingEnabled = true;
        
        this.setupEventListeners();
        this.saveState();
        
        // Load saved canvas after a short delay
        setTimeout(() => {
            this.loadFromStorage();
        }, 100);
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.startDrawing({ clientX: touch.clientX, clientY: touch.clientY });
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isDrawing) {
                const touch = e.touches[0];
                this.draw({ clientX: touch.clientX, clientY: touch.clientY });
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopDrawing();
        });
    }

    startDrawing(e) {
        const state = this.app.getState();
        if (!state.selectedColor) {
            this.app.showToast('Please select a color first!', 'error');
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Dispatch draw start event for gamification
        document.dispatchEvent(new CustomEvent('canvasDrawStart'));

        if (this.mixMode === 'instant') {
            this.instantMix(state.selectedColor, x, y);
            return;
        }

        // Draw mode
        this.isDrawing = true;
        this.lastX = x;
        this.lastY = y;

        if (state.selectedTool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
        }

        // Draw initial dot
        this.drawSmoothDot(x, y, state);
    }

    draw(e) {
        if (!this.isDrawing || this.mixMode === 'instant') return;
        
        const state = this.app.getState();
        if (!state.selectedColor) return;

        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        // Draw smooth line with blending
        this.drawSmoothLine(this.lastX, this.lastY, currentX, currentY, state);

        this.lastX = currentX;
        this.lastY = currentY;
        this.hasUnsavedChanges = true;
    }

    drawSmoothDot(x, y, state) {
        if (state.selectedTool === 'eraser') {
            this.ctx.globalAlpha = state.brushOpacity;
            this.ctx.beginPath();
            this.ctx.arc(x, y, state.brushSize / 2, 0, Math.PI * 2);
            this.ctx.fill();
            return;
        }

        // Get existing color for blending
        const existingColor = this.getPixelColor(x, y);
        
        if (existingColor.a > 0) {
            // Blend with existing color
            const newColor = this.hexToRgb(state.selectedColor);
            const blendFactor = state.brushOpacity * 0.3;
            const blended = this.blendColors(existingColor, newColor, blendFactor);
            this.ctx.fillStyle = this.rgbToHex(blended);
            this.ctx.globalAlpha = 1;
        } else {
            this.ctx.fillStyle = state.selectedColor;
            this.ctx.globalAlpha = state.brushOpacity;
        }
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, state.brushSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawSmoothLine(x1, y1, x2, y2, state) {
        if (state.selectedTool === 'eraser') {
            this.ctx.globalAlpha = state.brushOpacity;
            this.ctx.lineWidth = state.brushSize;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
            return;
        }

        // Calculate distance for interpolation
        const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const steps = Math.max(1, Math.floor(distance / 2));
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = x1 + (x2 - x1) * t;
            const y = y1 + (y2 - y1) * t;
            
            const existingColor = this.getPixelColor(x, y);
            
            if (existingColor.a > 0) {
                // Blend with existing color
                const newColor = this.hexToRgb(state.selectedColor);
                const blendFactor = state.brushOpacity * 0.25;
                const blended = this.blendColors(existingColor, newColor, blendFactor);
                
                this.ctx.fillStyle = this.rgbToHex(blended);
                this.ctx.globalAlpha = 1;
            } else {
                this.ctx.fillStyle = state.selectedColor;
                this.ctx.globalAlpha = state.brushOpacity;
            }
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, state.brushSize / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    instantMix(newColor, clickX, clickY) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        const newRgb = this.hexToRgb(newColor);
        let hasExistingColor = false;
        
        // Check if canvas has any content
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] > 0) {
                hasExistingColor = true;
                break;
            }
        }
        
        // Create ripple effect
        this.createRippleEffect(clickX, clickY);
        
        if (!hasExistingColor) {
            // Fill empty canvas with selected color
            this.ctx.fillStyle = newColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Mix with existing colors
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];
                
                if (a > 0) {
                    const existingColor = { r, g, b, a: a / 255 };
                    const blended = this.blendColors(existingColor, newRgb, 0.5);
                    
                    data[i] = blended.r;
                    data[i + 1] = blended.g;
                    data[i + 2] = blended.b;
                } else {
                    data[i] = newRgb.r;
                    data[i + 1] = newRgb.g;
                    data[i + 2] = newRgb.b;
                    data[i + 3] = 255;
                }
            }
            this.ctx.putImageData(imageData, 0, 0);
        }
        
        this.saveState();
        this.saveToStorage();
        this.hasUnsavedChanges = true;
        this.updateMixedColorDisplay();
    }

    createRippleEffect(x, y) {
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.border = '2px solid rgba(255, 255, 255, 0.8)';
        ripple.style.borderRadius = '50%';
        ripple.style.pointerEvents = 'none';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.animation = 'rippleExpand 0.5s ease-out forwards';
        
        this.canvas.parentElement.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
    }

    getPixelColor(x, y) {
        const imageData = this.ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1);
        const data = imageData.data;
        return {
            r: data[0],
            g: data[1],
            b: data[2],
            a: data[3] / 255
        };
    }

    blendColors(color1, color2, mixFactor) {
        const factor = Math.max(0, Math.min(1, mixFactor));
        return {
            r: Math.round(color1.r * (1 - factor) + color2.r * factor),
            g: Math.round(color1.g * (1 - factor) + color2.g * factor),
            b: Math.round(color1.b * (1 - factor) + color2.b * factor),
            a: Math.max(color1.a, color2.a)
        };
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
            a: 1
        } : { r: 0, g: 0, b: 0, a: 1 };
    }

    rgbToHex(rgb) {
        return "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
    }

    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.saveState();
            this.updateMixedColorDisplay();
            this.saveToStorage();
            // Dispatch draw end event for gamification
            document.dispatchEvent(new CustomEvent('canvasDrawEnd'));
        }
    }

    saveToStorage() {
        try {
            const canvasData = this.canvas.toDataURL();
            localStorage.setItem('canvasPersist', canvasData);
        } catch (error) {
            console.error('Failed to save canvas:', error);
        }
    }

    loadFromStorage() {
        try {
            const canvasData = localStorage.getItem('canvasPersist');
            if (canvasData) {
                const img = new Image();
                img.onload = () => {
                    this.ctx.drawImage(img, 0, 0);
                    this.saveState();
                    // Hide welcome message since canvas has content
                    const overlay = document.getElementById('canvas-overlay');
                    if (overlay) overlay.classList.add('hidden');
                };
                img.src = canvasData;
            }
        } catch (error) {
            console.error('Failed to load canvas:', error);
        }
    }
    
    updateMixedColorDisplay() {
        // Sample the dominant color from canvas center area
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const sampleSize = 50;
        
        const imageData = this.ctx.getImageData(
            centerX - sampleSize/2, 
            centerY - sampleSize/2, 
            sampleSize, 
            sampleSize
        );
        
        const dominantColor = this.getDominantColor(imageData);
        this.app.updateMixedColorDisplay(dominantColor);
    }
    
    getDominantColor(imageData) {
        const data = imageData.data;
        const colorCounts = {};
        let maxCount = 0;
        let dominantColor = null;
        
        // Sample every 4th pixel for performance
        for (let i = 0; i < data.length; i += 16) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            if (a > 0) {
                const color = this.rgbToHex({ r, g, b });
                colorCounts[color] = (colorCounts[color] || 0) + 1;
                
                if (colorCounts[color] > maxCount) {
                    maxCount = colorCounts[color];
                    dominantColor = color;
                }
            }
        }
        
        return dominantColor;
    }

    setMixMode(mode) {
        this.mixMode = mode;
        const cursor = mode === 'instant' ? 'pointer' : 'crosshair';
        this.canvas.style.cursor = cursor;
    }

    setTool(tool) {
        const cursors = {
            brush: this.mixMode === 'instant' ? 'pointer' : 'crosshair',
            eraser: 'grab'
        };
        this.canvas.style.cursor = cursors[tool] || 'crosshair';
    }

    setColor(color) {
        // Color is handled in draw methods
    }

    setBrushSize(size) {
        // Size is handled in draw methods
    }

    setBrushOpacity(opacity) {
        // Opacity is handled in draw methods
    }

    setEffect(effect, enabled) {
        // Effects can be added here
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.saveState();
        this.hasUnsavedChanges = false;
        document.dispatchEvent(new CustomEvent('canvasCleared'));
    }

    saveState() {
        this.historyIndex++;
        if (this.historyIndex < this.history.length) {
            this.history.length = this.historyIndex;
        }
        
        this.history.push(this.canvas.toDataURL());
        
        if (this.history.length > this.maxHistory) {
            this.history.shift();
            this.historyIndex--;
        }
        
        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState();
            document.dispatchEvent(new CustomEvent('undoAction'));
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState();
        }
    }

    restoreState() {
        const img = new Image();
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = this.history[this.historyIndex];
        this.updateUndoRedoButtons();
    }

    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        if (undoBtn) undoBtn.disabled = this.historyIndex <= 0;
        if (redoBtn) redoBtn.disabled = this.historyIndex >= this.history.length - 1;
    }

    createSurpriseEffect() {
        const state = this.app.getState();
        if (!state.selectedColor) return;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.ctx.fillStyle = state.selectedColor;
        this.ctx.globalAlpha = 0.7;
        
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const radius = 50 + Math.random() * 100;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5 + Math.random() * 10, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.saveState();
        this.saveToStorage();
    }

    setCanvasSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.imageSmoothingEnabled = true;
    }
    
    setBackground(bg) {
        if (bg === 'black') {
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.saveState();
    }

    export() {
        return this.canvas.toDataURL('image/png');
    }

    getImageData() {
        return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    hasChanges() {
        return this.hasUnsavedChanges;
    }
}