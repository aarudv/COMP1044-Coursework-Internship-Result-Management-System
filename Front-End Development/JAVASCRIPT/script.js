// Safely grab elements (some might not exist on the current page)
const loginForm = document.getElementById('loginForm');
const loginCard = document.getElementById('loginCard');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('errorMessage');
const errorTextSpan = document.getElementById('errorTextSpan');
const togglePasswordIcon = document.getElementById('showPasswordIcon');
const themeToggleBtn = document.getElementById('themeToggle');
const loginBtn = document.getElementById('loginBtn');

// 1. Form Validation (only runs if the login form is on the screen)
if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); 
        loginCard.classList.remove('shake');
        void loginCard.offsetWidth; 

        const usernameValue = usernameInput.value.trim();
        const passwordValue = passwordInput.value.trim();

        if (usernameValue === "" || passwordValue === "") {
            errorTextSpan.textContent = "Please fill in both fields.";
            errorMessage.style.display = "block";
            loginCard.classList.add('shake'); 
        } else {
            errorMessage.style.display = "none";
            loginBtn.textContent = "Authenticating... ⏳";
            loginBtn.style.opacity = "0.8";
            
            setTimeout(() => {
                alert("Validation passed! Ready to link to PHP dashboard.");
                // Simulate redirect for testing:
                window.location.href = "admin_dashboard.html";
            }, 1000);
        }
    });
}

// 2. Password Toggle (only runs on the login page)
if (togglePasswordIcon) {
    togglePasswordIcon.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            this.textContent = '🙈'; 
        } else {
            passwordInput.type = 'password';
            this.textContent = '👁️'; 
        }
    });
}

// 3. Dark Mode Toggle (runs on ALL pages because the button is everywhere)
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            this.textContent = '☀️ Light Mode';
        } else {
            this.textContent = '🌙 Dark Mode';
        }
    });
}














// --- ADMIN DASHBOARD FUNCTIONS ---

// 4. SPA Tab Switching
function openTab(tabId) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active-tab'));

    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabId).classList.add('active-tab');
    event.currentTarget.classList.add('active');
}

// 5. Live Search Filter for Results Table
function filterTable() {
    const input = document.getElementById("searchBar");
    const filter = input.value.toUpperCase();
    const table = document.getElementById("resultsTable");
    if(!table) return; // Exit if table isn't on page
    
    const tr = table.getElementsByTagName("tr");

    for (let i = 1; i < tr.length; i++) { 
        let tdID = tr[i].getElementsByTagName("td")[0]; 
        let tdName = tr[i].getElementsByTagName("td")[1]; 
        
        if (tdID || tdName) {
            let idValue = tdID.textContent || tdID.innerText;
            let nameValue = tdName.textContent || tdName.innerText;
            
            if (idValue.toUpperCase().indexOf(filter) > -1 || nameValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = ""; 
            } else {
                tr[i].style.display = "none"; 
            }
        }
    }
}











// --- ASSESSOR DASHBOARD: LIVE CALCULATOR ---

const markInputs = document.querySelectorAll('.mark-input');
const liveTotal = document.getElementById('liveTotal');
const gradeStatus = document.getElementById('gradeStatus');

if (markInputs.length > 0) {
    markInputs.forEach(input => {
        input.addEventListener('input', function() {
            
            // 1. Validation: Enforce maximum weightages
            let maxAllowed = parseFloat(this.getAttribute('data-max'));
            let currentValue = parseFloat(this.value);

            if (currentValue > maxAllowed) {
                this.value = maxAllowed; // Force it down to the max
                this.style.borderColor = '#ff4d4d'; // Flash red
                setTimeout(() => this.style.borderColor = 'var(--input-border)', 800);
            } else if (currentValue < 0) {
                this.value = 0; // Prevent negative numbers
            }

            // 2. Calculation: Update Live Total
            let currentTotal = 0;
            markInputs.forEach(inp => {
                let val = parseFloat(inp.value);
                if (!isNaN(val)) {
                    currentTotal += val;
                }
            });
            
            liveTotal.textContent = currentTotal;

            // 3. Dynamic Grade Status (Pass/Fail Colors)
            if (currentTotal >= 40) {
                liveTotal.style.color = '#23d5ab'; // Greenish Pass
                gradeStatus.textContent = "Status: PASS";
                gradeStatus.style.color = '#23d5ab';
            } else if (currentTotal > 0) {
                liveTotal.style.color = '#ff4d4d'; // Red Fail
                gradeStatus.textContent = "Status: FAIL";
                gradeStatus.style.color = '#ff4d4d';
            } else {
                liveTotal.style.color = 'var(--primary)';
                gradeStatus.textContent = "";
            }
        });
    });
}