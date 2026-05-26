// Theme Management
class ThemeManager {
    constructor() {
        this.init();
    }
    
    init() {
        // Load saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            this.setDarkMode();
        } else {
            this.setLightMode();
        }
        
        // Setup theme toggles
        this.setupToggles();
    }
    
    setDarkMode() {
        document.body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        this.updateToggleIcons(true);
    }
    
    setLightMode() {
        document.body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        this.updateToggleIcons(false);
    }
    
    toggleTheme() {
        if (document.body.classList.contains('dark')) {
            this.setLightMode();
        } else {
            this.setDarkMode();
        }
    }
    
    updateToggleIcons(isDark) {
        const icons = document.querySelectorAll('.theme-toggle i, .theme-toggle-mobile i');
        icons.forEach(icon => {
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        });
        
        const texts = document.querySelectorAll('.theme-toggle span');
        texts.forEach(text => {
            text.innerText = isDark ? 'Tema Claro' : 'Tema Escuro';
        });
    }
    
    setupToggles() {
        const toggles = document.querySelectorAll('.theme-toggle, .theme-toggle-mobile');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', () => this.toggleTheme());
        });
    }
}

// Initialize theme manager
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});