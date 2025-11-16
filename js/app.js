// colorQ - Main Application Controller
class ColorLab {
  constructor() {
    this.state = {
      selectedColor: null,
      selectedTool: "brush",
      brushSize: 20,
      brushOpacity: 1,
      isDrawing: false,
      mixMode: "draw", // 'draw' or 'instant'
      effects: {
        glow: false,
        sparkle: false,
        symmetry: false,
      },
      settings: {
        theme: "light",
        animationSpeed: "normal",
        soundEffects: true,
        autoSave: true,
      },
    };

    this.canvas = null;
    this.canvasEngine = null;
    this.colorManager = null;
    this.settingsManager = null;
    this.storageManager = null;

    this.init();
  }

  async init() {
    try {
      // Initialize managers
      this.storageManager = new StorageManager();
      this.settingsManager = new SettingsManager(this);
      this.colorManager = new ColorManager(this);
      this.canvasEngine = new CanvasEngine(this);

      // Load project from URL params
      this.loadProjectFromURL();

      // Load saved settings
      await this.loadSettings();

      // Setup UI
      this.setupEventListeners();
      this.setupKeyboardShortcuts();

      // Initialize components
      await this.colorManager.init();
      await this.canvasEngine.init();

      // Show app
      this.showApp();

      // Show welcome if first time
      if (!this.storageManager.get("hasVisited")) {
        this.showWelcome();
        this.storageManager.set("hasVisited", true);
      }
    } catch (error) {
      console.error("Failed to initialize colorQ:", error);
      this.showToast("Failed to load application", "error");
    }
  }

  async loadSettings() {
    const savedSettings = this.storageManager.get("settings");
    if (savedSettings) {
      this.state.settings = { ...this.state.settings, ...savedSettings };
    }

    // Apply theme
    document.body.setAttribute("data-theme", this.state.settings.theme);
  }

  setupEventListeners() {
    // Header buttons
    document.getElementById("settings-btn").addEventListener("click", () => {
      this.settingsManager.show();
    });

    document.getElementById("help-btn").addEventListener("click", () => {
      this.showHelp();
    });

    // Home button
    const homeBtn = document.getElementById("home-btn");
    if (homeBtn) {
      homeBtn.addEventListener("click", () => {
        window.location.href = "index.html";
      });
    }

    // Menu toggle for mobile
    document.getElementById("menu-toggle").addEventListener("click", () => {
      this.toggleMobileMenu();
    });

    // Panel toggles
    const colorToggle = document.getElementById("color-panel-toggle");
    if (colorToggle) {
      colorToggle.addEventListener("click", () => {
        this.togglePanel("color-panel");
      });
    }

    const toolsToggle = document.getElementById("tools-panel-toggle");
    if (toolsToggle) {
      toolsToggle.addEventListener("click", () => {
        this.togglePanel("tools-panel");
      });
    }

    // Sidebar toggle buttons (when panels are collapsed)
    const colorSidebarToggle = document.getElementById("color-sidebar-toggle");
    if (colorSidebarToggle) {
      colorSidebarToggle.addEventListener("click", () => {
        this.showPanel("color-panel");
      });
    }

    const toolsSidebarToggle = document.getElementById("tools-sidebar-toggle");
    if (toolsSidebarToggle) {
      toolsSidebarToggle.addEventListener("click", () => {
        this.showPanel("tools-panel");
      });
    }

    // Tool buttons
    document.querySelectorAll(".tool-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tool = e.target.closest(".tool-btn").dataset.tool;
        if (tool) {
          this.selectTool(tool);
        }
      });
    });

    // Mode buttons
    document.getElementById("draw-mode-btn").addEventListener("click", () => {
      this.setMixMode("draw");
    });

    document.getElementById("instant-mix-btn").addEventListener("click", () => {
      this.setMixMode("instant");
    });

    // Mixed color double-click events
    document
      .getElementById("mixed-color-preview")
      .addEventListener("dblclick", () => {
        this.copyMixedColorToClipboard();
      });

    document
      .getElementById("mixed-color-hex")
      .addEventListener("dblclick", () => {
        this.copyMixedColorToClipboard();
      });

    // Brush controls
    document.getElementById("brush-size").addEventListener("input", (e) => {
      this.setBrushSize(parseInt(e.target.value));
    });

    document.getElementById("brush-opacity").addEventListener("input", (e) => {
      this.setBrushOpacity(parseFloat(e.target.value));
    });

    // Action buttons
    document.getElementById("undo-btn").addEventListener("click", () => {
      this.canvasEngine.undo();
    });

    document.getElementById("redo-btn").addEventListener("click", () => {
      this.canvasEngine.redo();
    });

    document.getElementById("clear-btn").addEventListener("click", () => {
      this.clearCanvas();
    });

    // Effects
    document.getElementById("glow-effect").addEventListener("change", (e) => {
      this.toggleEffect("glow", e.target.checked);
    });

    document
      .getElementById("sparkle-effect")
      .addEventListener("change", (e) => {
        this.toggleEffect("sparkle", e.target.checked);
      });

    document.getElementById("symmetry-mode").addEventListener("change", (e) => {
      this.toggleEffect("symmetry", e.target.checked);
    });

    // Tool actions
    document.getElementById("surprise-btn").addEventListener("click", () => {
      this.surpriseMe();
    });

    document.getElementById("export-btn").addEventListener("click", () => {
      this.exportCanvas();
    });

    // Auto-save
    if (this.state.settings.autoSave) {
      setInterval(() => {
        this.autoSave();
      }, 30000); // Every 30 seconds
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Prevent shortcuts when typing in inputs
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          this.selectTool("brush");
          break;
        case "e":
          e.preventDefault();
          this.selectTool("eraser");
          break;
        case "c":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            this.focusColorSearch();
          }
          break;
        case "z":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.shiftKey) {
              this.canvasEngine.redo();
            } else {
              this.canvasEngine.undo();
            }
          }
          break;
        case "s":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.exportCanvas();
          }
          break;
        case " ":
          e.preventDefault();
          this.surpriseMe();
          break;
        case "m":
          e.preventDefault();
          this.toggleMixMode();
          break;
      }
    });
  }

  showApp() {
    setTimeout(() => {
      document.getElementById("loading-screen").style.opacity = "0";
      setTimeout(() => {
        document.getElementById("loading-screen").style.display = "none";
        document.getElementById("app").classList.remove("hidden");
        document.getElementById("app").classList.add("visible");
      }, 500);
    }, 1000);
  }

  selectTool(tool) {
    this.state.selectedTool = tool;

    // Update UI
    document.querySelectorAll(".tool-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelector(`[data-tool="${tool}"]`).classList.add("active");

    // Update canvas cursor
    this.canvasEngine.setTool(tool);

    this.playSound("select");
  }

  setBrushSize(size) {
    this.state.brushSize = size;
    document.getElementById("brush-size-value").textContent = size;
    this.canvasEngine.setBrushSize(size);
  }

  setBrushOpacity(opacity) {
    this.state.brushOpacity = opacity;
    document.getElementById("brush-opacity-value").textContent =
      Math.round(opacity * 100) + "%";
    this.canvasEngine.setBrushOpacity(opacity);
  }

  toggleEffect(effect, enabled) {
    this.state.effects[effect] = enabled;
    this.canvasEngine.setEffect(effect, enabled);
    this.playSound("toggle");
  }

  selectColor(color, name) {
    this.state.selectedColor = color;
    this.canvasEngine.setColor(color);

    // Update current color display
    this.updateCurrentColorDisplay(color, name);

    // Hide welcome message
    const overlay = document.getElementById("canvas-overlay");
    if (overlay) {
      overlay.classList.add("hidden");
    }

    // Update project status
    this.updateProjectStatus("Modified");

    // Show selected color feedback
    this.showToast(`Selected ${name || "color"}`, "success");

    this.playSound("select");
  }

  updateCurrentColorDisplay(color, name) {
    // This method is kept for compatibility but mixed color is updated separately
  }

  updateMixedColorDisplay(color) {
    const preview = document.getElementById("mixed-color-preview");
    const hex = document.getElementById("mixed-color-hex");

    if (color) {
      preview.style.background = color;
      hex.textContent = color.toUpperCase();
      preview.style.opacity = "1";
    } else {
      preview.style.background = "#ffffff";
      hex.textContent = "#FFFFFF";
      preview.style.opacity = "0.3";
    }
  }

  copyMixedColorToClipboard() {
    const hex = document.getElementById("mixed-color-hex").textContent;
    navigator.clipboard
      .writeText(hex)
      .then(() => {
        this.showToast(`Copied ${hex}`, "success");
      })
      .catch(() => {
        this.showToast("Failed to copy to clipboard", "error");
      });
  }

  clearCanvas() {
    if (
      confirm(
        "Are you sure you want to clear the canvas? This action cannot be undone."
      )
    ) {
      this.canvasEngine.clear();
      this.updateProjectStatus("Cleared");
      this.showToast("Canvas cleared", "success");
      this.playSound("clear");
    }
  }

  surpriseMe() {
    const randomColor = this.colorManager.getRandomColor();
    this.selectColor(randomColor.hex, randomColor.name);
    this.canvasEngine.createSurpriseEffect();
    this.showToast(`Selected ${randomColor.name}!`, "success");
    this.playSound("surprise");
  }

  exportCanvas() {
    try {
      const dataURL = this.canvasEngine.export();
      const link = document.createElement("a");
      link.download = `color-lab-${Date.now()}.png`;
      link.href = dataURL;
      link.click();

      this.showToast("Artwork exported successfully!", "success");
      this.playSound("export");
    } catch (error) {
      console.error("Export failed:", error);
      this.showToast("Failed to export artwork", "error");
    }
  }

  autoSave() {
    if (this.canvasEngine.hasChanges()) {
      const imageData = this.canvasEngine.getImageData();
      this.storageManager.set("autoSave", {
        imageData: imageData,
        timestamp: Date.now(),
        settings: this.state,
      });

      this.updateProjectStatus("Auto-saved");
    }
  }

  togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    const sidebarToggle = document.getElementById(
      panelId.replace("-panel", "-sidebar-toggle")
    );

    if (panel) {
      const isHidden = panel.classList.contains("hidden");
      panel.classList.toggle("hidden");

      // Show/hide corresponding sidebar toggle button
      if (sidebarToggle) {
        if (isHidden) {
          sidebarToggle.classList.add("hidden");
        } else {
          sidebarToggle.classList.remove("hidden");
        }
      }
    }
  }

  showPanel(panelId) {
    const panel = document.getElementById(panelId);
    const sidebarToggle = document.getElementById(
      panelId.replace("-panel", "-sidebar-toggle")
    );

    if (panel) {
      panel.classList.remove("hidden");

      // Hide corresponding sidebar toggle button
      if (sidebarToggle) {
        sidebarToggle.classList.add("hidden");
      }
    }
  }

  toggleMobileMenu() {
    document.getElementById("color-panel").classList.toggle("open");
  }

  focusColorSearch() {
    document.getElementById("color-search").focus();
  }

  updateProjectStatus(status) {
    const statusEl = document.getElementById("auto-save");
    statusEl.textContent = status;

    // Reset to 'Saved' after 2 seconds
    if (status !== "Saved") {
      setTimeout(() => {
        statusEl.textContent = "Saved";
      }, 2000);
    }
  }

  showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
            <div class="toast-message">${message}</div>
        `;

    document.getElementById("toast-container").appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add("show"), 100);

    // Remove toast
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  showWelcome() {
    this.showToast(
      "Welcome to colorQ! Choose a color and start creating.",
      "success"
    );
  }

  showHelp() {
    const helpContent = `
            <h3>Keyboard Shortcuts</h3>
            <ul>
                <li><strong>B</strong> - Brush tool</li>
                <li><strong>E</strong> - Eraser tool</li>
                <li><strong>C</strong> - Focus color search</li>
                <li><strong>Ctrl+Z</strong> - Undo</li>
                <li><strong>Ctrl+Shift+Z</strong> - Redo</li>
                <li><strong>Ctrl+S</strong> - Export</li>
                <li><strong>Space</strong> - Surprise me</li>
            </ul>
        `;

    // You could implement a help modal here
    this.showToast("Press F1 for help or check the documentation", "success");
  }

  playSound(type) {
    if (!this.state.settings.soundEffects) return;

    // Simple sound feedback using Web Audio API
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const frequencies = {
        select: 800,
        toggle: 600,
        clear: 400,
        surprise: 1000,
        export: 1200,
      };

      oscillator.frequency.setValueAtTime(
        frequencies[type] || 600,
        audioContext.currentTime
      );
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.1,
        audioContext.currentTime + 0.01
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.1
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Silently fail if audio context is not available
    }
  }

  // Public API for other modules
  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
  }

  loadProjectFromURL() {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("project");
    const projectName = params.get("name");
    const canvasSize = params.get("size");
    const background = params.get("bg");

    if (projectId && projectName) {
      document.getElementById("project-name").textContent = projectName;

      // Set canvas size if specified
      if (canvasSize) {
        const [width, height] = canvasSize.split("x").map(Number);
        if (width && height) {
          setTimeout(() => {
            this.canvasEngine.setCanvasSize(width, height);
          }, 100);
        }
      }

      // Set background if specified
      if (background && background !== "white") {
        setTimeout(() => {
          this.canvasEngine.setBackground(background);
        }, 100);
      }
    }
  }

  setMixMode(mode) {
    this.state.mixMode = mode;

    // Update UI - only one mode active at a time
    document.getElementById("draw-mode-btn").classList.remove("active");
    document.getElementById("instant-mix-btn").classList.remove("active");

    if (mode === "draw") {
      document.getElementById("draw-mode-btn").classList.add("active");
      this.showToast("Draw Mode - Gradual color blending", "success");
    } else {
      document.getElementById("instant-mix-btn").classList.add("active");
      this.showToast(
        "Instant Mix Mode - Click to mix entire canvas",
        "success"
      );
    }

    // Update canvas mode
    this.canvasEngine.setMixMode(this.state.mixMode);
    this.playSound("toggle");
  }

  toggleMixMode() {
    const newMode = this.state.mixMode === "draw" ? "instant" : "draw";
    this.setMixMode(newMode);
  }

  updateSettings(newSettings) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.storageManager.set("settings", this.state.settings);

    // Apply theme change
    if (newSettings.theme) {
      document.body.setAttribute("data-theme", newSettings.theme);
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.colorLab = new ColorLab();
});
