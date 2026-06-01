document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) return;

    // Check localStorage for theme
    const currentTheme = localStorage.getItem('theme') || 'dark';
    
    if (currentTheme === 'light') {
        document.documentElement.classList.add('light-theme');
        themeToggleBtn.textContent = '🌙';
    } else {
        themeToggleBtn.textContent = '☀️';
    }

    themeToggleBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('light-theme');
        
        let theme = 'dark';
        if (document.documentElement.classList.contains('light-theme')) {
            theme = 'light';
            themeToggleBtn.textContent = '🌙';
        } else {
            themeToggleBtn.textContent = '☀️';
        }
        
        localStorage.setItem('theme', theme);
    });
});
