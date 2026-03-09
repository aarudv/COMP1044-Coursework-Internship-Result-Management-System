const loginForm = document.getElementById('loginForm');
const loginCard = document.getElementById('loginCard');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('errorMessage');
const errorTextSpan = document.getElementById('errorTextSpan');
const togglePasswordIcon = document.getElementById('showPasswordIcon');
const themeToggleBtn = document.getElementById('themeToggle');
const loginBtn = document.getElementById('loginBtn');

// 1. Form Validation
loginForm.addEventListener('submit', function(event) {
    event.preventDefault(); 

    // Reset shake animation
    loginCard.classList.remove('shake');
    void loginCard.offsetWidth;

    const usernameValue = usernameInput.value.trim();
    const passwordValue = passwordInput.value.trim();

    // Prevent invalid/empty data
    if (usernameValue === "" || passwordValue === "") {
        errorTextSpan.textContent = "Please fill in both fields.";
        errorMessage.style.display = "block";
        loginCard.classList.add('shake');
    } else {
        errorMessage.style.display = "none";
        
        // Interactive Button State
        loginBtn.textContent = "Authenticating... ⏳";
        loginBtn.style.opacity = "0.8";
        
        // Simulate delay for effect
        setTimeout(() => {
            alert("Please Try Again!");
            loginBtn.textContent = "Secure Login ➡️";
            loginBtn.style.opacity = "1";
        }, 1500);
    }
});

// 2. Clickable Emoji to Show/Hide Password
togglePasswordIcon.addEventListener('click', function() {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        this.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        this.textContent = '👁️'
    }
});

// 3. Dark Mode Toggle
themeToggleBtn.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        this.textContent = '☀️ Light Mode';
    } else {
        this.textContent = '🌙 Dark Mode';
    }
});