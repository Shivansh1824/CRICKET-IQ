// Run immediately to prevent flash of wrong theme (FOUC)
(function() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    if (currentTheme === 'light') {
        document.documentElement.classList.add('light-theme');
    } else {
        document.documentElement.classList.remove('light-theme');
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) return;

    // Sync button state with current class
    const isLight = document.documentElement.classList.contains('light-theme');
    themeToggleBtn.textContent = isLight ? '🌙' : '☀️';

    themeToggleBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('light-theme');
        
        const isLightNow = document.documentElement.classList.contains('light-theme');
        themeToggleBtn.textContent = isLightNow ? '🌙' : '☀️';
        const theme = isLightNow ? 'light' : 'dark';
        localStorage.setItem('theme', theme);
        
        // Dispatch custom event for dynamic components like Chart.js to update colors
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    });
});

