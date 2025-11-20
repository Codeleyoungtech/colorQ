// Home Page Controller
class HomeApp {
    constructor() {
        this.storageManager = new StorageManager();
        this.projects = [];
        this.settings = {
            theme: 'light'
        };
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.loadProjects();
        this.loadStats();
        this.setupEventListeners();
        this.renderProjects();
    }

    loadSettings() {
        const saved = this.storageManager.get('settings');
        if (saved) {
            this.settings = { ...this.settings, ...saved };
            document.body.setAttribute('data-theme', this.settings.theme);
        }
    }

    loadProjects() {
        this.projects = this.storageManager.get('projects') || [];
    }

    loadStats() {
        const userStats = this.storageManager.get('userStats') || { level: 1, total_xp: 0, login_streak: 0 };
        document.getElementById('level-stat').textContent = userStats.level;
        document.getElementById('xp-stat').textContent = userStats.total_xp;
        document.getElementById('projects-stat').textContent = this.projects.length;
        document.getElementById('streak-stat').textContent = userStats.login_streak;
    }

    saveProjects() {
        this.storageManager.set('projects', this.projects);
    }

    setupEventListeners() {
        // New project button
        document.getElementById('new-project-btn').addEventListener('click', () => {
            this.showNewProjectModal();
        });

        // Settings button
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showSettingsModal();
        });

        // Clear recent projects
        document.getElementById('clear-recent').addEventListener('click', () => {
            this.clearProjects();
        });

        // New project modal
        document.getElementById('new-project-close').addEventListener('click', () => {
            this.hideNewProjectModal();
        });

        document.getElementById('cancel-project').addEventListener('click', () => {
            this.hideNewProjectModal();
        });

        document.getElementById('create-project').addEventListener('click', () => {
            this.createProject();
        });

        // Background options
        document.querySelectorAll('.bg-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.bg-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
            });
        });

        // Settings modal
        document.getElementById('settings-close').addEventListener('click', () => {
            this.hideSettingsModal();
        });

        // Theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setTheme(btn.dataset.theme);
            });
        });

        // Import button
        document.getElementById('import-btn').addEventListener('click', () => {
            this.importProject();
        });

        // Achievements button
        document.getElementById('achievements-btn').addEventListener('click', () => {
            this.showAchievements();
        });
    }

    showNewProjectModal() {
        document.getElementById('new-project-modal').classList.add('active');
        document.getElementById('project-name').focus();
    }

    hideNewProjectModal() {
        document.getElementById('new-project-modal').classList.remove('active');
        this.resetNewProjectForm();
    }

    resetNewProjectForm() {
        document.getElementById('project-name').value = '';
        document.getElementById('canvas-size').value = '800x600';
        document.querySelectorAll('.bg-option').forEach(o => o.classList.remove('active'));
        document.querySelector('[data-bg="white"]').classList.add('active');
    }

    createProject() {
        const name = document.getElementById('project-name').value.trim() || 'Untitled Project';
        const size = document.getElementById('canvas-size').value;
        const bg = document.querySelector('.bg-option.active').dataset.bg;
        
        const project = {
            id: Date.now().toString(),
            name: name,
            canvasSize: size,
            background: bg,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            thumbnail: null
        };

        // Save project and redirect to editor
        this.projects.unshift(project);
        this.saveProjects();
        
        // Redirect to editor with project data
        const params = new URLSearchParams({
            project: project.id,
            name: project.name,
            size: project.canvasSize,
            bg: project.background
        });
        
        window.location.href = `app.html?${params.toString()}`;
    }

    renderProjects() {
        const grid = document.getElementById('projects-grid');
        const emptyState = document.getElementById('empty-state');
        
        if (this.projects.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        grid.style.display = 'grid';
        emptyState.style.display = 'none';
        
        grid.innerHTML = this.projects.map(project => `
            <div class="project-card" data-project-id="${project.id}">
                <div class="project-thumbnail">
                    ${project.thumbnail ? 
                        `<img src="${project.thumbnail}" alt="${project.name}">` :
                        `<div class="placeholder">🎨</div>`
                    }
                    <div class="project-actions">
                        <button class="action-btn-small" onclick="homeApp.deleteProject('${project.id}')" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"></polyline>
                                <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1 2-2h4a2,2 0 0,1 2,2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="project-info">
                    <div class="project-name">${project.name}</div>
                    <div class="project-meta">
                        <span>${this.formatDate(project.modifiedAt)}</span>
                        <span>${project.canvasSize}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click listeners to project cards
        grid.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.project-actions')) {
                    this.openProject(card.dataset.projectId);
                }
            });
        });
    }

    openProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            const params = new URLSearchParams({
                project: project.id,
                name: project.name,
                size: project.canvasSize,
                bg: project.background
            });
            
            // Store CLQ data for loading in editor
            if (project.clqData) {
                localStorage.setItem('loadCLQ', JSON.stringify(project.clqData));
            }
            
            window.location.href = `app.html?${params.toString()}`;
        }
    }

    deleteProject(projectId) {
        if (confirm('Are you sure you want to delete this project?')) {
            this.projects = this.projects.filter(p => p.id !== projectId);
            this.saveProjects();
            this.renderProjects();
        }
    }

    clearProjects() {
        if (confirm('Are you sure you want to clear all recent projects?')) {
            this.projects = [];
            this.saveProjects();
            this.renderProjects();
        }
    }

    showSettingsModal() {
        document.getElementById('settings-modal').classList.add('active');
        this.loadSettingsUI();
    }

    hideSettingsModal() {
        document.getElementById('settings-modal').classList.remove('active');
    }

    loadSettingsUI() {
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === this.settings.theme);
        });
    }

    setTheme(theme) {
        this.settings.theme = theme;
        this.storageManager.set('settings', this.settings);
        document.body.setAttribute('data-theme', theme);
        
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
    }

    importProject() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.clq,image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.name.endsWith('.clq')) {
                    // Import CLQ project
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        try {
                            const projectData = JSON.parse(event.target.result);
                            const project = {
                                id: Date.now().toString(),
                                name: projectData.name || file.name.replace('.clq', ''),
                                canvasSize: '800x600',
                                background: 'white',
                                createdAt: new Date().toISOString(),
                                modifiedAt: new Date().toISOString(),
                                thumbnail: projectData.canvas,
                                clqData: projectData
                            };
                            
                            this.projects.unshift(project);
                            this.saveProjects();
                            this.renderProjects();
                            this.showToast(`CLQ project imported: ${project.name}`, 'success');
                        } catch (error) {
                            this.showToast('Invalid CLQ file', 'error');
                        }
                    };
                    reader.readAsText(file);
                } else {
                    // Import image
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const project = {
                            id: Date.now().toString(),
                            name: file.name.replace(/\.[^/.]+$/, ""),
                            canvasSize: '800x600',
                            background: 'white',
                            createdAt: new Date().toISOString(),
                            modifiedAt: new Date().toISOString(),
                            thumbnail: event.target.result,
                            importedImage: event.target.result
                        };
                        
                        this.projects.unshift(project);
                        this.saveProjects();
                        this.renderProjects();
                    };
                    reader.readAsDataURL(file);
                }
            }
        };
        input.click();
    }

    showAchievements() {
        const userStats = this.storageManager.get('userStats') || {};
        const achievements = userStats.achievements_unlocked || [];
        this.showToast(`🏆 ${achievements.length} achievements unlocked! Level ${userStats.level || 1}, ${userStats.total_xp || 0} XP`, 'success');
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<div class="toast-message">${message}</div>`;
        
        const container = document.getElementById('toast-container') || this.createToastContainer();
        container.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        
        return date.toLocaleDateString();
    }
}

// Initialize home app
const homeApp = new HomeApp();