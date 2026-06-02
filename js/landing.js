document.addEventListener('DOMContentLoaded', async () => {
    const authForm = document.getElementById('auth-form');
    const authSubmit = document.getElementById('auth-submit');
    const authSwitchAction = document.getElementById('auth-switch-action');
    const authSwitchText = document.getElementById('auth-switch-text');
    const nameGroup = document.getElementById('name-group');
    const authSubtitle = document.getElementById('auth-subtitle');
    const authError = document.getElementById('auth-error');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const nameInput = document.getElementById('name');
    const emailSuggestion = document.getElementById('email-suggestion');
    const suggestionLink = document.getElementById('suggestion-link');

    // Flow state variables
    let isSignUp = false;
    let checkedEmail = "";
    let isChecking = false;

    // Check if user is already logged in, redirect to dashboard immediately
    if (window.cricIqAuth) {
        const user = await window.cricIqAuth.getUser();
        if (user) {
            window.location.href = 'dashboard.html';
            return;
        }
    }

    // Debounce helper to avoid slamming the database on every keystroke
    function debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Helper map for common email domain typos
    const domainMap = {
        'gamil.com': 'gmail.com',
        'gmaill.com': 'gmail.com',
        'gmal.com': 'gmail.com',
        'gamil.co': 'gmail.com',
        'gml.com': 'gmail.com',
        'yaho.com': 'yahoo.com',
        'yhoo.com': 'yahoo.com',
        'yaho.co': 'yahoo.com',
        'outlok.com': 'outlook.com',
        'outlk.com': 'outlook.com',
        'hotmal.com': 'hotmail.com',
        'hotmil.com': 'hotmail.com',
        'icoud.com': 'icloud.com'
    };

    function checkEmailTypos(email) {
        const parts = email.split('@');
        if (parts.length !== 2) {
            emailSuggestion.style.display = 'none';
            return null;
        }

        const username = parts[0];
        const domain = parts[1].toLowerCase();

        if (domainMap[domain]) {
            const suggestion = `${username}@${domainMap[domain]}`;
            suggestionLink.textContent = suggestion;
            emailSuggestion.style.display = 'block';
            return suggestion;
        } else {
            emailSuggestion.style.display = 'none';
            return null;
        }
    }

    // Click handler for suggestion replacement
    emailSuggestion.addEventListener('click', () => {
        const suggestedEmail = suggestionLink.textContent;
        if (suggestedEmail) {
            emailInput.value = suggestedEmail;
            emailSuggestion.style.display = 'none';
            emailInput.style.borderColor = '';
            authError.style.display = 'none';
            
            // Re-run status check instantly on correct email
            checkUserStatus();
        }
    });

    // Update layout elements based on sign-up / sign-in state
    function updateFormLayout(signUpState) {
        isSignUp = signUpState;
        
        if (isSignUp) {
            authSubmit.textContent = 'Create Account';
            authSubtitle.textContent = "Welcome! We didn't find an account for this email. Let's create one.";
            authSwitchText.textContent = 'Already have an account?';
            authSwitchAction.textContent = 'Sign in';
            
            nameGroup.classList.add('expanded');
            nameInput.setAttribute('required', 'true');
            nameInput.setAttribute('tabindex', '0');
        } else {
            authSubmit.textContent = 'Sign In';
            authSubtitle.textContent = 'Sign in to access your intelligent dashboard.';
            authSwitchText.textContent = "Don't have an account?";
            authSwitchAction.textContent = 'Create one';
            
            nameGroup.classList.remove('expanded');
            nameInput.removeAttribute('required');
            nameInput.setAttribute('tabindex', '-1');
            nameInput.value = '';
        }
    }

    // Manual Toggle Listener
    authSwitchAction.addEventListener('click', (e) => {
        e.preventDefault();
        authError.style.display = 'none';
        
        // Toggle state and update layout
        updateFormLayout(!isSignUp);
    });

    // Reset layout back to default "Sign In"
    function resetToSignIn() {
        checkedEmail = "";
        updateFormLayout(false);
    }

    // Function to check user status based on the typed email
    async function checkUserStatus() {
        const email = emailInput.value.trim();

        if (!email) {
            resetToSignIn();
            emailInput.style.borderColor = '';
            authError.style.display = 'none';
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            // Only show formatting error if user has typed at least 3 characters
            // to avoid displaying error prematurely on the first keystroke.
            if (email.length >= 3) {
                authError.textContent = 'Please enter a valid email address (e.g., you@example.com).';
                authError.style.display = 'block';
                authError.style.color = 'var(--danger)';
                emailInput.style.borderColor = 'var(--danger)';
            }
            resetToSignIn();
            return;
        }

        // Format is valid -> Clear visual error status
        emailInput.style.borderColor = '';
        authError.style.display = 'none';

        // 2. Prevent checking again if this email has already been validated
        if (email.toLowerCase() === checkedEmail.toLowerCase()) {
            return;
        }

        isChecking = true;

        try {
            const { exists, error } = await window.cricIqAuth.checkEmailExists(email);
            isChecking = false;

            if (error) {
                console.error("Failed to query user status:", error);
                return; // Fail silently to not interrupt typing flow
            }

            checkedEmail = email;

            // Update form dynamically depending on email status
            updateFormLayout(!exists);
            
            // Adjust subtitle specifically for the auto-check state
            if (exists) {
                authSubtitle.textContent = 'Welcome back! Enter your password to sign in.';
            } else {
                authSubtitle.textContent = "Welcome! We didn't find an account for this email. Let's create one.";
            }

        } catch (err) {
            console.error(err);
            isChecking = false;
        }
    }

    // Check triggers:
    // - On input (debounced by 600ms)
    // - On blur (when leaving the email field)
    // - On password focus (when moving cursor into the password input)
    emailInput.addEventListener('input', debounce(checkUserStatus, 600));
    emailInput.addEventListener('blur', checkUserStatus);
    passwordInput.addEventListener('focus', checkUserStatus);

    // Form Submission Handler
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        authError.style.display = 'none';
        authError.style.color = 'var(--danger)';

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Perform final email validation check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            authError.textContent = 'Please enter a valid email address.';
            authError.style.display = 'block';
            emailInput.style.borderColor = 'var(--danger)';
            emailInput.focus();
            return;
        } else {
            emailInput.style.borderColor = '';
        }

        // If a check query is still running in the background, wait for it to finish first
        if (isChecking) {
            authSubmit.disabled = true;
            authSubmit.textContent = 'Verifying...';
            
            const checkInterval = setInterval(() => {
                if (!isChecking) {
                    clearInterval(checkInterval);
                    authSubmit.disabled = false;
                    executeAuth();
                }
            }, 100);
            return;
        }

        executeAuth();

        async function executeAuth() {
            if (isSignUp) {
                // Sign Up flow (New User)
                const fullName = nameInput.value.trim();
                authSubmit.disabled = true;
                authSubmit.textContent = 'Creating Account...';

                const { data, error } = await window.cricIqAuth.signUp(email, password, fullName);
                authSubmit.disabled = false;
                authSubmit.textContent = 'Create Account';

                if (error) {
                    authError.textContent = error.message;
                    authError.style.display = 'block';
                } else {
                    if (data && data.session) {
                        window.location.href = 'dashboard.html';
                    } else {
                        authError.style.color = 'var(--accent-primary)';
                        authError.textContent = 'Account created successfully! Please check your email to confirm your account.';
                        authError.style.display = 'block';
                    }
                }
            } else {
                // Sign In flow (Existing User)
                authSubmit.disabled = true;
                authSubmit.textContent = 'Signing In...';

                const { data, error } = await window.cricIqAuth.signIn(email, password);
                authSubmit.disabled = false;
                authSubmit.textContent = 'Sign In';

                if (error) {
                    authError.textContent = error.message;
                    authError.style.display = 'block';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }
        }
    });

    const headerSigninBtn = document.getElementById('header-signin-btn');
    if (headerSigninBtn) {
        headerSigninBtn.addEventListener('click', () => {
            if (emailInput) {
                emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => emailInput.focus(), 600);
            }
        });
    }
});
