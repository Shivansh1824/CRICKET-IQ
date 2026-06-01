document.addEventListener('DOMContentLoaded', () => {
    const tabSignin = document.getElementById('tab-signin');
    const tabSignup = document.getElementById('tab-signup');
    const authSubmit = document.getElementById('auth-submit');

    tabSignin.addEventListener('click', () => {
        tabSignin.classList.add('active');
        tabSignup.classList.remove('active');
        authSubmit.textContent = 'Sign In';
    });

    tabSignup.addEventListener('click', () => {
        tabSignup.classList.add('active');
        tabSignin.classList.remove('active');
        authSubmit.textContent = 'Sign Up';
    });
});
