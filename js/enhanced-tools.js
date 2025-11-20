// Enhanced Drawing Tools Module
class EnhancedTools {
  constructor(app) {
    this.app = app;
    this.tools = new Map();
    this.currentBrush = 'basic';
    this.init();
  }

  init() {
    this.registerTools();
    this.createToolUI();
  }

  registerTools() {
    this.tools.set('rainbow', new RainbowBrush());
    this.tools.set('watercolor', new WatercolorBrush());
    this.tools.set('neon', new NeonBrush());
    this.tools.set('stamp', new StampTool());
    this.tools.set('smudge', new SmudgeTool());
    this.tools.set('pattern', new PatternTool());
  }

  createToolUI() {
    const toolsPanel = document.querySelector('.tools-panel .tool-section');
    const enhancedSection = document.createElement('div');
    enhancedSection.className = 'tool-section';
    enhancedSection.innerHTML = `
      <h3>Enhanced Brushes</h3>
      <div class="enhanced-tools">
        <button class="enhanced-tool" data-tool="rainbow">🌈 Rainbow</button>
        <button class="enhanced-tool" data-tool="watercolor">💧 Watercolor</button>
        <button class="enhanced-tool" data-tool="neon">✨ Neon</button>
        <button class="enhanced-tool" data-tool="stamp">⭐ Stamps</button>
        <button class="enhanced-tool" data-tool="smudge">👆 Smudge</button>
        <button class="enhanced-tool" data-tool="pattern">📐 Pattern</button>
      </div>
    `;
    
    toolsPanel.appendChild(enhancedSection);
    
    enhancedSection.addEventListener('click', (e) => {
      const tool = e.target.dataset.tool;
      if (tool) this.selectTool(tool);
    });
  }

  selectTool(toolName) {
    this.currentBrush = toolName;
    document.querySelectorAll('.enhanced-tool').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tool="${toolName}"]`).classList.add('active');
    
    const tool = this.tools.get(toolName);
    if (tool) this.app.canvasEngine.setCustomTool(tool);
  }

  getTool(name) {
    return this.tools.get(name);
  }
}

class RainbowBrush {
  constructor() {
    this.hue = 0;
  }

  draw(ctx, x, y, size, pressure = 1) {
    this.hue = (this.hue + 2) % 360;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
    ctx.beginPath();
    ctx.arc(x, y, size * pressure, 0, Math.PI * 2);
    ctx.fill();
  }
}

class WatercolorBrush {
  draw(ctx, x, y, size, pressure = 1) {
    const alpha = 0.1 * pressure;
    ctx.globalAlpha = alpha;
    
    for (let i = 0; i < 5; i++) {
      const offsetX = (Math.random() - 0.5) * size;
      const offsetY = (Math.random() - 0.5) * size;
      const radius = size * (0.5 + Math.random() * 0.5);
      
      ctx.beginPath();
      ctx.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
  }
}

class NeonBrush {
  draw(ctx, x, y, size, pressure = 1) {
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = size * 2;
    ctx.globalCompositeOperation = 'lighter';
    
    ctx.beginPath();
    ctx.arc(x, y, size * pressure * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'source-over';
  }
}

class StampTool {
  constructor() {
    this.stamps = ['⭐', '❤️', '🌸', '🦋', '🌙'];
    this.currentStamp = 0;
  }

  draw(ctx, x, y, size) {
    ctx.font = `${size * 2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.stamps[this.currentStamp], x, y);
    this.currentStamp = (this.currentStamp + 1) % this.stamps.length;
  }
}

class SmudgeTool {
  draw(ctx, x, y, size) {
    const imageData = ctx.getImageData(x - size, y - size, size * 2, size * 2);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const offset = Math.floor(Math.random() * 20) - 10;
      const sourceIndex = Math.max(0, Math.min(data.length - 4, i + offset * 4));
      
      data[i] = data[sourceIndex];
      data[i + 1] = data[sourceIndex + 1];
      data[i + 2] = data[sourceIndex + 2];
    }
    
    ctx.putImageData(imageData, x - size, y - size);
  }
}

class PatternTool {
  constructor() {
    this.patterns = ['dots', 'stripes', 'waves'];
    this.currentPattern = 0;
  }

  draw(ctx, x, y, size) {
    switch (this.patterns[this.currentPattern]) {
      case 'dots':
        for (let i = 0; i < 5; i++) {
          const dx = (Math.random() - 0.5) * size * 2;
          const dy = (Math.random() - 0.5) * size * 2;
          ctx.beginPath();
          ctx.arc(x + dx, y + dy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case 'stripes':
        for (let i = -size; i < size; i += 4) {
          ctx.fillRect(x + i, y - size, 2, size * 2);
        }
        break;
      case 'waves':
        ctx.beginPath();
        for (let i = -size; i < size; i++) {
          const waveY = Math.sin(i * 0.1) * 5;
          ctx.lineTo(x + i, y + waveY);
        }
        ctx.stroke();
        break;
    }
  }
}