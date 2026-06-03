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

    // Check if user is already logged in, check profile completion
    if (window.cricIqAuth) {
        const user = await window.cricIqAuth.getUser();
        if (user) {
            const { data: profile } = await window.cricIqAuth.getProfile(user.id);
            if (!profile || !profile.username || !profile.favorite_team) {
                showOnboardingForm(user, profile);
                return;
            } else {
                window.location.href = 'dashboard.html';
                return;
            }
        }
    }

    // IPL Teams Data for onboarding
    const iplTeams = [
        { id: 'CSK', name: 'Chennai Super Kings', color: '#F9CD05' },
        { id: 'MI', name: 'Mumbai Indians', color: '#004BA0' },
        { id: 'RCB', name: 'Royal Challengers Bengaluru', color: '#EC1C24' },
        { id: 'KKR', name: 'Kolkata Knight Riders', color: '#2E0854' },
        { id: 'SRH', name: 'Sunrisers Hyderabad', color: '#FF822A' },
        { id: 'DC', name: 'Delhi Capitals', color: '#00008B' },
        { id: 'RR', name: 'Rajasthan Royals', color: '#EA1A85' },
        { id: 'PBKS', name: 'Punjab Kings', color: '#DD1F2D' },
        { id: 'LSG', name: 'Lucknow Super Giants', color: '#A72056' },
        { id: 'GT', name: 'Gujarat Titans', color: '#1B2133' }
    ];

    function showOnboardingForm(user, profile) {
        // Hide normal auth form and header, show onboarding form
        document.querySelector('.auth-header').style.display = 'none';
        document.getElementById('auth-form').style.display = 'none';
        document.querySelector('.divider').style.display = 'none';
        document.getElementById('google-signin-btn').style.display = 'none';
        document.getElementById('auth-switch-container').style.display = 'none';
        
        const onboardingSection = document.getElementById('onboarding-section');
        onboardingSection.style.display = 'block';

        const form = document.getElementById('onboarding-form');
        const nameInput = document.getElementById('onboarding-name');
        const usernameInput = document.getElementById('onboarding-username');
        const usernameStatus = document.getElementById('username-status');
        const avatarGrid = document.getElementById('avatar-grid');
        const selectedAvatarInput = document.getElementById('selected-avatar');
        const submitBtn = document.getElementById('onboarding-submit');
        const teamDropdown = document.getElementById('team-dropdown');
        const teamDropdownSelected = document.getElementById('team-dropdown-selected');
        const teamDropdownOptions = document.getElementById('team-dropdown-options');
        const selectedTeamInput = document.getElementById('selected-team');

        // Pre-fill Name
        if (user.user_metadata && user.user_metadata.full_name) {
            nameInput.value = user.user_metadata.full_name;
        } else if (profile && profile.name) {
            nameInput.value = profile.name;
        }

        // Generate Avatar Grid
        const generateAvatars = () => {
            avatarGrid.innerHTML = '';
            for (let i = 1; i <= 10; i++) {
                const seed = `CricIQ_${user.id}_${i}`;
                const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=transparent`;
                const div = document.createElement('div');
                div.className = 'avatar-option';
                div.innerHTML = `<img src="${url}" alt="Avatar ${i}">`;
                div.addEventListener('click', () => {
                    document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
                    div.classList.add('selected');
                    selectedAvatarInput.value = url;
                    validateForm();
                });
                avatarGrid.appendChild(div);
            }
        };
        generateAvatars();

        // Populate Custom Team Dropdown
        teamDropdownOptions.innerHTML = '';
        iplTeams.forEach(team => {
            const div = document.createElement('div');
            div.className = 'dropdown-item';
            div.innerHTML = `
                <div class="team-logo-small" style="background-color: ${team.color};">${team.id}</div>
                <span>${team.name}</span>
            `;
            div.addEventListener('click', () => {
                teamDropdownSelected.innerHTML = div.innerHTML;
                selectedTeamInput.value = team.id;
                teamDropdown.classList.remove('open');
                validateForm();
            });
            teamDropdownOptions.appendChild(div);
        });

        teamDropdownSelected.addEventListener('click', () => {
            teamDropdown.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (!teamDropdown.contains(e.target)) {
                teamDropdown.classList.remove('open');
            }
        });

        // Username uniqueness validation
        let usernameTimeout;
        let isUsernameValid = false;

        const checkUsername = async () => {
            const val = usernameInput.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
            usernameInput.value = val;

            if (val.length < 3) {
                usernameStatus.textContent = 'Username must be at least 3 characters.';
                usernameStatus.className = 'input-status-msg error';
                isUsernameValid = false;
                validateForm();
                return;
            }

            usernameStatus.textContent = 'Checking availability...';
            usernameStatus.className = 'input-status-msg';

            const { exists } = await window.cricIqAuth.checkUsernameExists(val);
            if (exists) {
                const alt1 = val + Math.floor(Math.random() * 100);
                const alt2 = val + '_' + new Date().getFullYear();
                usernameStatus.innerHTML = `Taken. Try: <span style="text-decoration:underline;cursor:pointer;" onclick="document.getElementById('onboarding-username').value='${alt1}';document.getElementById('onboarding-username').dispatchEvent(new Event('input'))">${alt1}</span>`;
                usernameStatus.className = 'input-status-msg error';
                isUsernameValid = false;
            } else {
                usernameStatus.textContent = 'Username is available!';
                usernameStatus.className = 'input-status-msg success';
                isUsernameValid = true;
            }
            validateForm();
        };

        usernameInput.addEventListener('input', () => {
            clearTimeout(usernameTimeout);
            isUsernameValid = false;
            validateForm();
            usernameTimeout = setTimeout(checkUsername, 500);
        });

        if (!usernameInput.value && nameInput.value) {
            usernameInput.value = nameInput.value.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
            checkUsername();
        }
        nameInput.addEventListener('input', validateForm);

        function validateForm() {
            if (nameInput.value.trim() && isUsernameValid && selectedAvatarInput.value && selectedTeamInput.value) {
                submitBtn.disabled = false;
            } else {
                submitBtn.disabled = true;
            }
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!submitBtn.disabled) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Saving...';
                
                const profileData = {
                    name: nameInput.value.trim(),
                    username: usernameInput.value.trim().toLowerCase(),
                    favorite_team: selectedTeamInput.value,
                    avatar_url: selectedAvatarInput.value
                };

                const { error } = await window.cricIqAuth.updateProfile(user.id, profileData);
                
                if (error) {
                    alert("Failed to save profile. Please try again.");
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Complete & Go to Dashboard';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }
        });

        // Sign Out from Onboarding
        const signoutBtn = document.getElementById('onboarding-signout-btn');
        if (signoutBtn) {
            signoutBtn.addEventListener('click', async () => {
                signoutBtn.textContent = 'Signing out...';
                try {
                    await window.cricIqAuth.signOut();
                } catch (err) {
                    console.error("Sign out error:", err);
                }
                // Force clear localStorage in case Supabase library failed or session is cached
                for (let key in localStorage) {
                    if (key.startsWith('sb-')) {
                        localStorage.removeItem(key);
                    }
                }
                window.location.reload();
            });
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

    // Popular email providers
    const POPULAR_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];

    // Helper function to calculate Levenshtein distance (edit distance)
    function getLevenshteinDistance(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    function checkEmailTypos(email) {
        const parts = email.split('@');
        if (parts.length !== 2) {
            emailSuggestion.style.display = 'none';
            return null;
        }

        const username = parts[0];
        const domain = parts[1].toLowerCase();

        // If domain is already exact, no suggestion is needed
        if (POPULAR_DOMAINS.includes(domain)) {
            emailSuggestion.style.display = 'none';
            return null;
        }

        let closestDomain = null;
        let minDistance = 3; // Allows maximum of 2 single-character differences

        for (const popDomain of POPULAR_DOMAINS) {
            const distance = getLevenshteinDistance(domain, popDomain);
            if (distance < minDistance) {
                minDistance = distance;
                closestDomain = popDomain;
            }
        }

        if (closestDomain && minDistance <= 2) {
            const suggestion = `${username}@${closestDomain}`;
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
            emailSuggestion.style.display = 'none';
            return;
        }

        // Check for typos in domain
        checkEmailTypos(email);

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
                        const user = await window.cricIqAuth.getUser();
                        const { data: profile } = await window.cricIqAuth.getProfile(user.id);
                        showOnboardingForm(user, profile);
                    } else {
                        // Email verification is required -> Show dynamic 6-digit OTP screen inside the card
                        authForm.style.display = 'none';
                        const switchText = document.querySelector('.auth-switch');
                        if (switchText) {
                            switchText.style.display = 'none';
                        }
                        
                        // Hide subtitle
                        authSubtitle.style.display = 'none';
                        
                        // Create success verification element
                        const successState = document.createElement('div');
                        successState.style.textAlign = 'center';
                        successState.style.padding = '1rem 0';
                        successState.style.animation = 'verifyFadeIn 0.5s ease-out forwards';
                        successState.innerHTML = `
                            <style>
                                @keyframes verifyFadeIn {
                                    from { opacity: 0; transform: translateY(10px); }
                                    to { opacity: 1; transform: translateY(0); }
                                }
                                .otp-input-container {
                                    display: flex;
                                    justify-content: center;
                                    gap: 0.5rem;
                                    margin: 1.5rem 0;
                                }
                                .otp-field {
                                    width: 1.85rem;
                                    height: 2.75rem;
                                    font-size: 1.35rem;
                                    font-weight: 700;
                                    text-align: center;
                                    background: rgba(0, 0, 0, 0.2);
                                    border: 1px solid rgba(255, 255, 255, 0.1);
                                    border-radius: 10px;
                                    color: #ffffff;
                                    outline: none;
                                    transition: all 0.2s ease;
                                }
                                .otp-field:focus {
                                    background: rgba(0, 0, 0, 0.3);
                                    border-color: var(--accent-primary);
                                    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
                                }
                                
                                :root.light-theme .otp-field {
                                    background: #ffffff;
                                    border: 1px solid rgba(0, 0, 0, 0.15);
                                    color: #0f172a;
                                }
                                :root.light-theme .otp-field:focus {
                                    background: #ffffff;
                                    border-color: var(--accent-primary);
                                    box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.1);
                                }
                                
                                .otp-subtitle {
                                    color: #94a3b8;
                                    line-height: 1.5;
                                    font-size: 0.9rem;
                                    margin: 0;
                                }
                                .otp-subtitle strong {
                                    color: #ffffff;
                                    font-weight: 600;
                                }
                                
                                :root.light-theme .otp-subtitle {
                                    color: #475569;
                                }
                                :root.light-theme .otp-subtitle strong {
                                    color: #0f172a;
                                }

                                .otp-envelope {
                                    font-size: 3rem; 
                                    margin-bottom: 1rem;
                                    color: #ffffff;
                                }
                                :root.light-theme .otp-envelope {
                                    color: #0f172a;
                                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
                                }

                                .otp-error-msg {
                                    color: var(--danger);
                                    font-size: 0.85rem;
                                    margin-top: 0.5rem;
                                    display: none;
                                }
                            </style>
                            <div class="otp-envelope">✉️</div>
                            <h3 style="margin-bottom: 0.5rem; color: var(--accent-primary); font-size: 1.35rem; font-weight: 700;">Verify Your Account</h3>
                            <p class="otp-subtitle">
                                We sent an 8-digit confirmation code to <br><strong style="font-weight: 600;">${email}</strong>.
                            </p>
                            
                            <div class="otp-input-container">
                                <input type="text" maxlength="1" class="otp-field" pattern="[0-9]" inputmode="numeric" required autocomplete="off">
                                <input type="text" maxlength="1" class="otp-field" pattern="[0-9]" inputmode="numeric" required autocomplete="off">
                                <input type="text" maxlength="1" class="otp-field" pattern="[0-9]" inputmode="numeric" required autocomplete="off">
                                <input type="text" maxlength="1" class="otp-field" pattern="[0-9]" inputmode="numeric" required autocomplete="off">
                                <input type="text" maxlength="1" class="otp-field" pattern="[0-9]" inputmode="numeric" required autocomplete="off">
                                <input type="text" maxlength="1" class="otp-field" pattern="[0-9]" inputmode="numeric" required autocomplete="off">
                                <input type="text" maxlength="1" class="otp-field" pattern="[0-9]" inputmode="numeric" required autocomplete="off">
                                <input type="text" maxlength="1" class="otp-field" pattern="[0-9]" inputmode="numeric" required autocomplete="off">
                            </div>
                            
                            <div id="otp-error" class="otp-error-msg"></div>
                            
                            <button id="verify-submit-btn" type="button" class="btn-primary btn-glow" style="border: none; margin-top: 1rem;">Verify & Sign In</button>
                            
                            <p style="margin-top: 1.5rem; font-size: 0.85rem; color: #64748b;">
                                Didn't receive the code? <a href="#" id="verify-back-link" style="color: var(--accent-primary); text-decoration: none; font-weight: 600;">Back to Sign In</a>
                            </p>
                        `;
                        
                        authForm.parentElement.appendChild(successState);
                        
                        const otpFields = document.querySelectorAll('.otp-field');
                        const verifyBtn = document.getElementById('verify-submit-btn');
                        const otpError = document.getElementById('otp-error');
                        const backLink = document.getElementById('verify-back-link');
                        
                        // Automatic focus shifting behavior for the OTP fields
                        otpFields.forEach((field, index) => {
                            // Autofocus the first field
                            if (index === 0) field.focus();
                            
                            field.addEventListener('input', (e) => {
                                // Allow only numeric inputs
                                field.value = field.value.replace(/[^0-9]/g, '');
                                
                                if (field.value.length === 1 && index < otpFields.length - 1) {
                                    otpFields[index + 1].focus();
                                }
                            });
                            
                            field.addEventListener('keydown', (e) => {
                                if (e.key === 'Backspace' && field.value.length === 0 && index > 0) {
                                    otpFields[index - 1].focus();
                                }
                            });
                        });
                        
                        // Call verifyOtp on verifyBtn click
                        verifyBtn.addEventListener('click', async (e) => {
                            e.preventDefault();
                            let token = "";
                            otpFields.forEach(field => {
                                token += field.value;
                            });
                            
                            if (token.length !== 8) {
                                otpError.textContent = "Please enter all 8 digits of the verification code.";
                                otpError.style.display = 'block';
                                return;
                            }
                            
                            otpError.style.display = 'none';
                            verifyBtn.disabled = true;
                            verifyBtn.textContent = 'Verifying...';
                            
                            const { data, error } = await window.cricIqAuth.verifyOtp(email, token);
                            verifyBtn.disabled = false;
                            verifyBtn.textContent = 'Verify & Sign In';
                            
                            if (error) {
                                otpError.textContent = error.message || "Invalid verification code. Please check your spelling.";
                                otpError.style.display = 'block';
                                
                                // Highlight inputs in red to indicate failure
                                otpFields.forEach(field => {
                                    field.style.borderColor = 'var(--danger)';
                                });
                            } else {
                                // Success -> Show Onboarding
                                const user = await window.cricIqAuth.getUser();
                                const { data: profile } = await window.cricIqAuth.getProfile(user.id);
                                successState.style.display = 'none';
                                showOnboardingForm(user, profile);
                            }
                        });
                        
                        if (backLink) {
                            backLink.addEventListener('click', (e) => {
                                e.preventDefault();
                                window.location.reload();
                            });
                        }
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
                    const user = await window.cricIqAuth.getUser();
                    const { data: profile } = await window.cricIqAuth.getProfile(user.id);
                    if (!profile || !profile.username || !profile.favorite_team) {
                        showOnboardingForm(user, profile);
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                }
            }
        }
    });

    const googleSigninBtn = document.getElementById('google-signin-btn');
    if (googleSigninBtn) {
        googleSigninBtn.addEventListener('click', async () => {
            googleSigninBtn.disabled = true;
            const originalContent = googleSigninBtn.innerHTML;
            googleSigninBtn.innerHTML = 'Connecting to Google...';
            
            const { error } = await window.cricIqAuth.signInWithGoogle();
            if (error) {
                googleSigninBtn.disabled = false;
                googleSigninBtn.innerHTML = originalContent;
                authError.textContent = error.message || "Failed to initialize Google Sign-In.";
                authError.style.display = 'block';
            }
        });
    }

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
