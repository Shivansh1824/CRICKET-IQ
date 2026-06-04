document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    if (!window.cricIqAuth) {
        window.location.href = 'index.html';
        return;
    }

    const user = await window.cricIqAuth.getUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    const { data: profile } = await window.cricIqAuth.getProfile(user.id);
    
    // If profile is already complete, go to dashboard
    if (profile && profile.username && profile.favorite_team) {
        window.location.href = 'dashboard.html';
        return;
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
                console.error("Profile update error:", error);
                alert("Failed to save profile: " + error.message);
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
            window.location.href = 'index.html';
        });
    }
});
