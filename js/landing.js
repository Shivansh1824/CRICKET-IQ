document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('auth-form');
    const authSubmit = document.getElementById('auth-submit');
    const authSwitchAction = document.getElementById('auth-switch-action');
    const authSwitchText = document.getElementById('auth-switch-text');
    const nameGroup = document.getElementById('name-group');
    const authSubtitle = document.getElementById('auth-subtitle');

    let isSignUp = false;

    authSwitchAction.addEventListener('click', (e) => {
        e.preventDefault();
        isSignUp = !isSignUp;

        if (isSignUp) {
            authSubtitle.textContent = 'Create an account to get started.';
            authSubmit.textContent = 'Sign Up';
            authSwitchText.textContent = 'Already have an account?';
            authSwitchAction.textContent = 'Sign in';
            nameGroup.classList.add('expanded');
            nameGroup.querySelector('input').setAttribute('required', 'true');
        } else {
            authSubtitle.textContent = 'Sign in to access your intelligent dashboard.';
            authSubmit.textContent = 'Sign In';
            authSwitchText.textContent = "Don't have an account?";
            authSwitchAction.textContent = 'Create one';
            nameGroup.classList.remove('expanded');
            nameGroup.querySelector('input').removeAttribute('required');
        }
    });

    const headerSigninBtn = document.getElementById('header-signin-btn');
    if (headerSigninBtn) {
        headerSigninBtn.addEventListener('click', () => {
            const emailInput = document.getElementById('email');
            if (emailInput) {
                emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => {
                    emailInput.focus();
                }, 600);
            }
        });
    }
});
