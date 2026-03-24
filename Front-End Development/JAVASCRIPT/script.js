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

// 1. Form Validation & Fake Authentication
if (loginForm) {
    // Grab the new helper link element
    const contactAdminHelper = document.getElementById('contactAdminHelper');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); 
        loginCard.classList.remove('shake');
        void loginCard.offsetWidth; 

        const usernameValue = usernameInput.value.trim();
        const passwordValue = passwordInput.value.trim();

        // Check 1: Are fields completely empty?
        if (usernameValue === "" || passwordValue === "") {
            errorTextSpan.textContent = "Please fill in both fields.";
            errorMessage.style.display = "block";
            contactAdminHelper.style.display = "none"; // Hide the link if they just forgot to type
            loginCard.classList.add('shake'); 
        } 
        // Check 2: Fake Database Authentication (For Video Demo)
        else if (passwordValue !== "password123") {
            errorTextSpan.textContent = "Incorrect password.";
            errorMessage.style.display = "block";
            contactAdminHelper.style.display = "block"; // SHOW the Contact Admin link!
            loginCard.classList.add('shake');
        } 
        // Check 3: Success!
        else {
            errorMessage.style.display = "none";
            contactAdminHelper.style.display = "none";
            
            loginBtn.textContent = "Authenticating... ⏳";
            loginBtn.style.opacity = "0.8";
            
            setTimeout(() => {
                // Change this to whichever dashboard you want to test routing to
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

// 3. Dark Mode Toggle
if (themeToggleBtn) {
    // A. Check memory immediately when the page loads
    if (localStorage.getItem('themePreference') === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggleBtn.innerHTML = '☀️ Light Mode';
    }

    // B. Handle the button click and save the choice
    themeToggleBtn.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            this.innerHTML = '☀️ Light Mode';
            localStorage.setItem('themePreference', 'dark'); // Save to memory
        } else {
            this.innerHTML = '🌙 Dark Mode';
            localStorage.setItem('themePreference', 'light'); // Save to memory
        }
    });
}














// --- ADMIN DASHBOARD FUNCTIONS ---

// 4. SPA Tab Switching (Now with Memory!)
function openTab(tabId) {
    // Hide all tabs
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active-tab'));

    // Remove active styling from all buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Show the selected tab
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active-tab');
    }

    // Find the correct button and highlight it
    const targetBtn = Array.from(buttons).find(btn => btn.getAttribute('onclick').includes(tabId));
    if (targetBtn) {
        targetBtn.classList.add('active');
    }

    // Save this specific tab to memory!
    localStorage.setItem('lastActiveTab', tabId);
}

// 4.5 Restore the saved tab when the dashboard loads
window.addEventListener('DOMContentLoaded', () => {
    const savedTab = localStorage.getItem('lastActiveTab');
    
    // If a saved tab exists, and we are actually on a page that has that tab, open it!
    if (savedTab && document.getElementById(savedTab)) {
        openTab(savedTab);
    }
});

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








// --- FEATURE: EXPORT TABLE TO CSV ---

function downloadCSV(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) return; // Stop if the table isn't on this page

    let csv = [];
    let rows = table.querySelectorAll("tr");
    
    // Loop through all rows
    for (let i = 0; i < rows.length; i++) {
        let row = [];
        let cols = rows[i].querySelectorAll("td, th");
        
        // Loop through all columns in the row
        for (let j = 0; j < cols.length; j++) {
            // Get the text, remove any weird line breaks
            let data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, "").trim();
            
            // If the data has a comma in it, wrap it in quotes so it doesn't break the CSV
            if (data.includes(",")) {
                data = `"${data}"`;
            }
            
            // Exclude the "Action" column (with the edit/delete emojis) from the export
            if (data !== "Action" && !data.includes("✏️")) {
                row.push(data);
            }
        }
        // Join the columns with a comma
        if (row.length > 0) csv.push(row.join(","));
    }

    // Combine all rows with a newline and create a virtual file (Blob)
    const csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
    
    // Create a temporary hidden link to trigger the download
    const downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    
    document.body.appendChild(downloadLink);
    downloadLink.click(); // Click it automatically
    document.body.removeChild(downloadLink); // Clean up

    // Trigger the premium Toast Notification if you added it!
    if (typeof showToast === "function") {
        showToast("📥 CSV Exported Successfully!", "success");
    } else {
        alert("CSV Exported Successfully!"); // Fallback if no toast
    }
}

// Attach the function to the Export Button
const exportBtn = document.getElementById('exportCsvBtn');
if (exportBtn) {
    exportBtn.addEventListener('click', () => {
        // Targets the 'resultsTable' ID and names the downloaded file
        downloadCSV('resultsTable', 'Student_Results_Export.csv');
    });
}



// --- TOAST NOTIFICATION FUNCTION ---
const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Slide in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Slide out and remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400); 
    }, 3000);
}

// --- AUTO-SAVE DRAFT FUNCTION (Assessor Dashboard) ---
const gradingForm = document.getElementById('gradingForm');

if (gradingForm) {
    const allInputs = gradingForm.querySelectorAll('input, textarea, select');

    // 1. Load saved data when the page opens
    window.addEventListener('load', () => {
        allInputs.forEach(input => {
            let saveKey = input.previousElementSibling ? input.previousElementSibling.textContent : 'commentBox';
            let savedValue = localStorage.getItem(saveKey);
            
            if (savedValue) {
                input.value = savedValue;
                input.dispatchEvent(new Event('input')); // Recalculate live total
            }
        });
    });

    // 2. Save data instantly every time they type
    allInputs.forEach(input => {
        input.addEventListener('input', function() {
            let saveKey = this.previousElementSibling ? this.previousElementSibling.textContent : 'commentBox';
            localStorage.setItem(saveKey, this.value);
        });
    });

    // 3. Clear draft and show Toast on submit
    const submitBtn = document.getElementById('submitMarksBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            localStorage.clear(); 
            showToast("✅ Assessment Submitted Successfully!", "success"); 
            gradingForm.reset(); 
            
            // Reset the calculator text
            const liveTotal = document.getElementById('liveTotal');
            const gradeStatus = document.getElementById('gradeStatus');
            if (liveTotal) liveTotal.textContent = "0"; 
            if (gradeStatus) gradeStatus.textContent = "";
        });
    }
}



// --- EXTRA FEATURE: SMART ASSIGNMENT SYSTEM (Admin Dashboard) ---
const smartAssignBtn = document.getElementById('smartAssignBtn');
const assignAssessorInput = document.getElementById('assignAssessorInput');
const smartAssignReason = document.getElementById('smartAssignReason');

if (smartAssignBtn && assignAssessorInput) {
    
    // 1. Our fake database of Assessors with their current stats
    const assessorsData = [
        { name: "Dr. Smith", workload: 6, speed: "Average" },
        { name: "Prof. Davis", workload: 8, speed: "Slow" },
        { name: "Dr. Lee", workload: 2, speed: "Fast" } // Dr. Lee is clearly the best choice!
    ];

    smartAssignBtn.addEventListener('click', () => {
        
        // 2. The Algorithm: Find the assessor with the lowest workload
        const bestAssessor = assessorsData.reduce((prev, current) => {
            return (prev.workload < current.workload) ? prev : current;
        });

        // 3. Auto-fill the input box with the winner
        assignAssessorInput.value = bestAssessor.name;
        
        // 4. Reveal the system's reasoning to the Admin
        smartAssignReason.innerHTML = `💡 <strong>System Suggestion:</strong> ${bestAssessor.name} selected. Lowest current workload (${bestAssessor.workload} students) and ${bestAssessor.speed} grading speed.`;
        smartAssignReason.style.display = "block";

        // 5. Trigger your awesome Toast Notification!
        if (typeof showToast === "function") {
            showToast(`✨ Smart Assigned to ${bestAssessor.name}!`, 'success');
        }
    });
}





// --- DASHBOARD FORM VALIDATION ---

function enableFormValidation(formId, successMessage) {
    const form = document.getElementById(formId);
    if (!form) return; 

    form.addEventListener('submit', function(event) {
        event.preventDefault(); 

        let isValid = true;
        const inputs = form.querySelectorAll('input[type="text"]');

        inputs.forEach(input => {
            if (input.value.trim() === "" && input.id !== "assignAssessorInput") {
                isValid = false;
                input.style.borderColor = '#ff4d4d'; 
                setTimeout(() => input.style.borderColor = 'var(--input-border)', 2000);
            }
        });

        if (!isValid) {
            if (typeof showToast === "function") showToast("Error: Please fill in all fields.", "error");
        } else {
            if (typeof showToast === "function") showToast(successMessage, "success");
            form.reset();
            
            const reasonText = document.getElementById('smartAssignReason');
            if (reasonText) reasonText.style.display = 'none';
        }
    });
}

// Activate the validation
enableFormValidation('addStudentForm', '✅ Student Profile Saved!');
enableFormValidation('addAssessorForm', '✅ Assessor Account Created!');
enableFormValidation('assignInternshipForm', '✅ Internship Assigned Successfully!');