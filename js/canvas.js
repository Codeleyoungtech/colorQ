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
        this.enhancedTool = null;
        this.rainbowHue = 0;
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
        // Check if quest is submitted and project is read-only
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('project');
        if (projectId && localStorage.getItem('questSubmitted_' + projectId) === 'true') {
            this.app.showToast('Quest completed! This project is now read-only.', 'info');
            return;
        }
        
        const state = this.app.getState();
        if (!state.selectedColor && state.selectedTool !== 'eraser') {
            this.app.showToast('Please select a color first!', 'error');
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // Store current tool state to prevent switching during draw
        this.currentDrawTool = state.selectedTool;
        this.currentDrawColor = state.selectedColor;
        this.currentEnhancedTool = state.enhancedTool;

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

        // Draw initial dot
        this.drawSmoothDot(x, y, this.getDrawState());
    }

    draw(e) {
        if (!this.isDrawing || this.mixMode === 'instant') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const currentX = (e.clientX - rect.left) * scaleX;
        const currentY = (e.clientY - rect.top) * scaleY;

        // Use stored draw state to prevent tool switching
        const drawState = this.getDrawState();
        
        // Draw smooth line with blending
        this.drawSmoothLine(this.lastX, this.lastY, currentX, currentY, drawState);

        this.lastX = currentX;
        this.lastY = currentY;
        this.hasUnsavedChanges = true;
    }

    drawSmoothDot(x, y, state) {
        // Check for enhanced tools first
        if (state.enhancedTool) {
            this.drawEnhancedTool(x, y, state);
            return;
        }

        if (state.selectedTool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.globalAlpha = state.brushOpacity;
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.fillStyle = state.selectedColor;
            this.ctx.globalAlpha = state.brushOpacity;
        }
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, state.brushSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Reset composite operation
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = 1;
    }

    drawSmoothLine(x1, y1, x2, y2, state) {
        if (!this.isDrawing) return;
        
        // Check for enhanced tools first
        if (state.enhancedTool) {
            const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const steps = Math.max(1, Math.floor(distance / 2));
            
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const x = x1 + (x2 - x1) * t;
                const y = y1 + (y2 - y1) * t;
                this.drawEnhancedTool(x, y, state);
            }
            return;
        }

        if (state.selectedTool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.globalAlpha = state.brushOpacity;
            this.ctx.lineWidth = state.brushSize;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.fillStyle = state.selectedColor;
            this.ctx.globalAlpha = state.brushOpacity;
            
            const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const steps = Math.max(1, Math.floor(distance / 2));
            
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const x = x1 + (x2 - x1) * t;
                const y = y1 + (y2 - y1) * t;
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, state.brushSize / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        // Reset composite operation
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = 1;
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
            
            // Clear stored draw state
            this.currentDrawTool = null;
            this.currentDrawColor = null;
            this.currentEnhancedTool = null;
            
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
            
            // Auto-save as project
            this.saveAsProject();
        } catch (error) {
            console.error('Failed to save canvas:', error);
        }
    }

    saveAsProject() {
        try {
            const canvasData = this.canvas.toDataURL();
            if (canvasData && canvasData.length > 100) {
                const urlParams = new URLSearchParams(window.location.search);
                const projectId = urlParams.get('project') || 'project_' + Date.now();
                const projectName = document.getElementById('project-name')?.textContent || 'Untitled Project';
                const isQuest = urlParams.get('quest') === 'true';
                
                // Check if quest is submitted
                const questSubmitted = localStorage.getItem('questSubmitted_' + projectId) === 'true';
                
                const projectData = {
                    id: projectId,
                    name: projectName,
                    canvas: canvasData,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    isQuest: isQuest,
                    questSubmitted: questSubmitted
                };
                
                localStorage.setItem(projectId, JSON.stringify(projectData));
            }
        } catch (error) {
            console.error('Failed to save project:', error);
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
        // Store effect state for drawing operations
        if (!this.effects) this.effects = {};
        this.effects[effect] = enabled;
        
        // Apply visual feedback
        const canvas = this.canvas;
        if (effect === 'glow' && enabled) {
            canvas.style.filter = 'drop-shadow(0 0 10px rgba(255,255,255,0.5))';
        } else if (effect === 'glow' && !enabled) {
            canvas.style.filter = 'none';
        }
    }

    setEnhancedTool(tool) {
        this.enhancedTool = tool;
    }

    drawEnhancedTool(x, y, state) {
        const size = state.brushSize / 2;
        
        switch (state.enhancedTool) {
            case 'rainbow':
                this.rainbowHue = (this.rainbowHue + 5) % 360;
                this.ctx.globalCompositeOperation = 'source-over';
                this.ctx.fillStyle = `hsl(${this.rainbowHue}, 100%, 50%)`;
                this.ctx.globalAlpha = state.brushOpacity;
                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case 'watercolor':
                this.ctx.globalCompositeOperation = 'source-over';
                this.ctx.fillStyle = state.selectedColor;
                this.ctx.globalAlpha = 0.1 * state.brushOpacity;
                for (let i = 0; i < 5; i++) {
                    const offsetX = (Math.random() - 0.5) * size * 2;
                    const offsetY = (Math.random() - 0.5) * size * 2;
                    const radius = size * (0.5 + Math.random() * 0.5);
                    this.ctx.beginPath();
                    this.ctx.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                this.ctx.globalAlpha = 1;
                break;
                
            case 'neon':
                this.ctx.globalCompositeOperation = 'lighter';
                this.ctx.fillStyle = state.selectedColor;
                this.ctx.shadowColor = state.selectedColor;
                this.ctx.shadowBlur = size * 2;
                this.ctx.globalAlpha = state.brushOpacity;
                this.ctx.beginPath();
                this.ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
                this.ctx.globalCompositeOperation = 'source-over';
                break;
                
            case 'stamp':
                const stamps = ['⭐', '❤️', '🌸', '🦋', '🌙'];
                const stamp = stamps[Math.floor(Math.random() * stamps.length)];
                this.ctx.font = `${size * 2}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillStyle = state.selectedColor;
                this.ctx.globalAlpha = state.brushOpacity;
                this.ctx.fillText(stamp, x, y);
                break;
                
            case 'pattern':
                this.ctx.globalCompositeOperation = 'source-over';
                this.ctx.fillStyle = state.selectedColor;
                this.ctx.globalAlpha = state.brushOpacity;
                for (let i = 0; i < 5; i++) {
                    const dx = (Math.random() - 0.5) * size * 2;
                    const dy = (Math.random() - 0.5) * size * 2;
                    this.ctx.beginPath();
                    this.ctx.arc(x + dx, y + dy, 2, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                break;
        }
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
        // Removed paint splash effect - surprise me now only selects color
        return;
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

    exportWithWatermark() {
        // Create temporary canvas with watermark
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        
        // Draw original artwork
        tempCtx.drawImage(this.canvas, 0, 0);
        
        // Add watermark
        tempCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        tempCtx.fillRect(0, tempCanvas.height - 40, tempCanvas.width, 40);
        
        tempCtx.fillStyle = '#FFFFFF';
        tempCtx.font = 'bold 16px Arial';
        tempCtx.textAlign = 'center';
        tempCtx.fillText('Made with colorQ ✨', tempCanvas.width / 2, tempCanvas.height - 20);
        
        return tempCanvas.toDataURL('image/png');
    }

    async shareArtwork() {
        try {
            const dataUrl = this.exportWithWatermark();
            
            // Convert to blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            
            const file = new File([blob], 'colorQ-artwork.png', { type: 'image/png' });
            
            // Check if Web Share API is supported
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'Check out my colorQ artwork!',
                    text: 'I just created this amazing art in colorQ! 🎨✨ #colorQ #DigitalArt',
                    files: [file]
                });
                
                this.app.showToast('Shared successfully! 🎉', 'success');
                
                // Award gems for sharing
                if (this.app.gemsSystem) {
                    this.app.gemsSystem.addGems(10);
                    this.app.showToast('+10 gems for sharing! 💎', 'success');
                }
            } else {
                // Fallback: download image
                const link = document.createElement('a');
                link.download = 'colorQ-artwork.png';
                link.href = dataUrl;
                link.click();
                
                this.app.showToast('Artwork downloaded! Share it on social media 📱', 'success');
            }
        } catch (error) {
            console.error('Share failed:', error);
            this.app.showToast('Share cancelled or failed', 'info');
        }
    }

    getImageData() {
        return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    hasChanges() {
        return this.hasUnsavedChanges;
    }
    
    // Get consistent draw state during drawing operation
    getDrawState() {
        if (this.isDrawing) {
            // Use stored state during drawing to prevent tool switching
            return {
                selectedTool: this.currentDrawTool,
                selectedColor: this.currentDrawColor,
                enhancedTool: this.currentEnhancedTool,
                brushSize: this.app.getState().brushSize,
                brushOpacity: this.app.getState().brushOpacity
            };
        }
        return this.app.getState();
    }
}