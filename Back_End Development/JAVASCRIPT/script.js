// helper function so i dont have to write fetch() over and over
async function apiCall(url, method = 'GET', data = null) {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (data) options.body = JSON.stringify(data);
    try {
        const response = await fetch(url, options);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: 'Network error. Please try again.' };
    }
}


// ---- LOGIN PAGE ----

const loginForm = document.getElementById('loginForm');
const loginCard = document.getElementById('loginCard');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('errorMessage');
const errorTextSpan = document.getElementById('errorTextSpan');
const togglePasswordIcon = document.getElementById('showPasswordIcon');
const themeToggleBtn = document.getElementById('themeToggle');
const loginBtn = document.getElementById('loginBtn');

if (loginForm) {
    const contactAdminHelper = document.getElementById('contactAdminHelper');

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        loginCard.classList.remove('shake');
        void loginCard.offsetWidth; // force browser to restart animation

        const usernameValue = usernameInput.value.trim();
        const passwordValue = passwordInput.value.trim();

        if (usernameValue === "" || passwordValue === "") {
            errorTextSpan.textContent = "Please fill in both fields.";
            errorMessage.style.display = "block";
            contactAdminHelper.style.display = "none";
            loginCard.classList.add('shake');
            return;
        }

        // show loading while we wait for the server
        loginBtn.textContent = "Authenticating... ⏳";
        loginBtn.style.opacity = "0.8";
        loginBtn.disabled = true;

        // send login request to the backend
        const result = await apiCall('php/login_process.php', 'POST', {
            username: usernameValue,
            password: passwordValue
        });

        if (result.success) {
            errorMessage.style.display = "none";
            contactAdminHelper.style.display = "none";
            setTimeout(() => { window.location.href = result.redirect; }, 500);
        } else {
            errorTextSpan.textContent = result.message;
            errorMessage.style.display = "block";
            contactAdminHelper.style.display = "block";
            loginCard.classList.add('shake');
            loginBtn.textContent = "Secure Login ➡️";
            loginBtn.style.opacity = "1";
            loginBtn.disabled = false;
        }
    });
}

// toggle password visibility
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


// ---- DARK MODE ----

if (themeToggleBtn) {
    // check if they had dark mode on last time
    if (localStorage.getItem('themePreference') === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggleBtn.innerHTML = '☀️ Light Mode';
    }

    themeToggleBtn.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            this.innerHTML = '☀️ Light Mode';
            localStorage.setItem('themePreference', 'dark');
        } else {
            this.innerHTML = '🌙 Dark Mode';
            localStorage.setItem('themePreference', 'light');
        }
        // charts need to update their colours when theme changes
        reloadCurrentCharts();
    });
}


// ---- TAB SWITCHING ----
// works like a single page app - hides and shows sections without reloading

function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active-tab'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    const selectedTab = document.getElementById(tabId);
    if (selectedTab) selectedTab.classList.add('active-tab');

    const targetBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn => btn.getAttribute('onclick')?.includes(tabId));
    if (targetBtn) targetBtn.classList.add('active');

    // remember which tab they were on
    localStorage.setItem('lastActiveTab', tabId);

    // fetch fresh data whenever they switch tabs
    if (tabId === 'dashboardHome') { loadAdminStats(); loadAdminCharts(); }
    if (tabId === 'userManage') { loadStudentsTable(); loadAssessorsTable(); }
    if (tabId === 'internManage') { loadInternshipsTable(); loadDropdowns(); }
    if (tabId === 'viewResults') loadResultsTable();
    if (tabId === 'analytics') loadAdminAnalytics();
    if (tabId === 'assessorHome') { loadAssessorStats(); loadAssessorDashboardCharts(); }
    if (tabId === 'assessStudent') loadAssessorStudents();
    if (tabId === 'viewHistory') loadAssessmentHistory();
    if (tabId === 'assessorAnalytics') loadAssessorAnalytics();
}

// when the page loads, go back to whatever tab they were on
window.addEventListener('DOMContentLoaded', () => {
    const savedTab = localStorage.getItem('lastActiveTab');
    if (savedTab && document.getElementById(savedTab)) {
        openTab(savedTab);
    } else {
        if (document.getElementById('dashboardHome')) { loadAdminStats(); loadAdminCharts(); }
        if (document.getElementById('assessorHome')) { loadAssessorStats(); loadAssessorDashboardCharts(); }
    }
});


// ---- LIVE SEARCH ----
// filters the results table as you type

function filterTable() {
    const input = document.getElementById("searchBar");
    const filter = input.value.toUpperCase();
    const table = document.getElementById("resultsTable");
    if (!table) return;
    const tr = table.getElementsByTagName("tr");
    for (let i = 1; i < tr.length; i++) {
        let tdID = tr[i].getElementsByTagName("td")[0];
        let tdName = tr[i].getElementsByTagName("td")[1];
        if (tdID || tdName) {
            let idValue = tdID.textContent;
            let nameValue = tdName.textContent;
            tr[i].style.display = (idValue.toUpperCase().includes(filter) || nameValue.toUpperCase().includes(filter)) ? "" : "none";
        }
    }
}


// ---- TOAST NOTIFICATIONS ----
// little popup messages that slide in from the right

const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}


// ---- CSV EXPORT ----
// grabs the table data and downloads it as a .csv file

function downloadCSV(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) return;
    let csv = [];
    let rows = table.querySelectorAll("tr");
    for (let i = 0; i < rows.length; i++) {
        let row = [];
        let cols = rows[i].querySelectorAll("td, th");
        for (let j = 0; j < cols.length; j++) {
            let data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, "").trim();
            if (data.includes(",")) data = `"${data}"`;
            // skip the action column (the edit/delete buttons)
            if (data !== "Action" && !data.includes("✏️")) row.push(data);
        }
        if (row.length > 0) csv.push(row.join(","));
    }
    const csvFile = new Blob(["\uFEFF" + csv.join("\n")], { type: "text/csv;charset=utf-8;" });
    const downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    showToast("📥 CSV Exported Successfully!", "success");
}

const exportBtn = document.getElementById('exportCsvBtn');
if (exportBtn) {
    exportBtn.addEventListener('click', () => downloadCSV('resultsTable', 'Student_Results_Export.csv'));
}

// print button - opens the browser print dialog
const printBtn = document.getElementById('printReportBtn');
if (printBtn) {
    printBtn.addEventListener('click', () => {
        showToast("🖨️ Preparing print preview...", "success");
        setTimeout(() => window.print(), 500);
    });
}


// ---- LIVE MARK CALCULATOR (assessor grading form) ----
// adds up all the marks in real time and shows pass/fail

const markInputs = document.querySelectorAll('.mark-input');
const liveTotal = document.getElementById('liveTotal');
const gradeStatus = document.getElementById('gradeStatus');

if (markInputs.length > 0) {
    markInputs.forEach(input => {
        input.addEventListener('input', function() {
            let maxAllowed = parseFloat(this.getAttribute('data-max'));
            let currentValue = parseFloat(this.value);

            // clamp value to the allowed max
            if (currentValue > maxAllowed) {
                this.value = maxAllowed;
                this.style.borderColor = '#ff4d4d';
                setTimeout(() => this.style.borderColor = 'var(--input-border)', 800);
            } else if (currentValue < 0) {
                this.value = 0;
            }

            // add up everything
            let currentTotal = 0;
            markInputs.forEach(inp => {
                let val = parseFloat(inp.value);
                if (!isNaN(val)) currentTotal += val;
            });
            liveTotal.textContent = currentTotal;

            // colour it green if passing, red if failing
            if (currentTotal >= 40) {
                liveTotal.style.color = '#23d5ab';
                gradeStatus.textContent = "Status: PASS";
                gradeStatus.style.color = '#23d5ab';
            } else if (currentTotal > 0) {
                liveTotal.style.color = '#ff4d4d';
                gradeStatus.textContent = "Status: FAIL";
                gradeStatus.style.color = '#ff4d4d';
            } else {
                liveTotal.style.color = 'var(--primary)';
                gradeStatus.textContent = "";
            }
        });
    });
}


// ---- ANIMATED KPI COUNTERS ----
// makes the numbers count up from 0 instead of just appearing

function animateCounter(elementId, targetValue) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const target = parseInt(targetValue) || 0;
    const duration = 800;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out curve
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}


// ---- SCORE BADGES ----
// returns a coloured badge based on the score

function getScoreBadge(score) {
    if (score === null || score === undefined) return '<span class="score-badge pending">Pending</span>';
    const s = parseInt(score);
    if (s >= 75) return `<span class="score-badge high">${s}%</span>`;
    if (s >= 40) return `<span class="score-badge mid">${s}%</span>`;
    return `<span class="score-badge low">${s}%</span>`;
}


// ---- CHART HELPERS ----
// picks the right colours depending on light/dark mode

function getChartColors() {
    const isDark = document.body.classList.contains('dark-mode');
    return {
        textColor: isDark ? '#ffffff' : '#333333',
        gridColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        barColors: ['#0056b3', '#23d5ab', '#ff6b6b', '#ffc107', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'],
        barColorsDark: ['#4da3ff', '#23d5ab', '#ff6b6b', '#ffc107', '#a78bfa', '#22d3ee', '#fb923c', '#f472b6'],
        pieColors: ['#0056b3', '#23d5ab', '#ff6b6b', '#ffc107', '#8b5cf6', '#06b6d4'],
    };
}

// keep track of charts so we can destroy and recreate them
let chartInstances = {};

function createChart(canvasId, config) {
    if (chartInstances[canvasId]) chartInstances[canvasId].destroy();
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    const chart = new Chart(canvas, config);
    chartInstances[canvasId] = chart;
    return chart;
}

function reloadCurrentCharts() {
    const savedTab = localStorage.getItem('lastActiveTab');
    if (savedTab === 'dashboardHome') loadAdminCharts();
    if (savedTab === 'analytics') loadAdminAnalytics();
    if (savedTab === 'assessorHome') loadAssessorDashboardCharts();
    if (savedTab === 'assessorAnalytics') loadAssessorAnalytics();
}


// ---- CONFIRMATION MODAL ----
// shows a nicer popup instead of the default browser confirm()

function showConfirmModal(title, message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-box">
            <h3>⚠️ ${title}</h3>
            <p>${message}</p>
            <div class="modal-actions">
                <button class="btn-cancel" id="modalCancel">Cancel</button>
                <button class="btn-danger" id="modalConfirm">Delete</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('#modalCancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#modalConfirm').addEventListener('click', () => { overlay.remove(); onConfirm(); });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); }); // close if they click outside
}


// =============================================
//           ADMIN DASHBOARD STUFF
// =============================================

// load the KPI numbers at the top with the counting animation
async function loadAdminStats() {
    const result = await apiCall('php/admin_get_stats.php');
    if (result.success) {
        animateCounter('statStudents', result.students);
        animateCounter('statAssessors', result.assessors);
        animateCounter('statInternships', result.internships);
    }
}

// overview charts on the main admin tab
async function loadAdminCharts() {
    const result = await apiCall('php/admin_get_chart_data.php');
    if (!result.success) return;
    const colors = getChartColors();
    const isDark = document.body.classList.contains('dark-mode');
    const palette = isDark ? colors.barColorsDark : colors.barColors;

    if (result.scores.length > 0) {
        createChart('overviewScoreChart', {
            type: 'bar',
            data: {
                labels: result.scores.map(s => s.student_name),
                datasets: [{ label: 'Final Score', data: result.scores.map(s => s.final_score), backgroundColor: result.scores.map((_, i) => palette[i % palette.length]), borderRadius: 6, borderSkipped: false }]
            },
            options: {
                responsive: true, plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, max: 100, ticks: { color: colors.textColor }, grid: { color: colors.gridColor } }, x: { ticks: { color: colors.textColor }, grid: { display: false } } }
            }
        });
    }

    if (result.programmes.length > 0) {
        createChart('overviewProgrammeChart', {
            type: 'doughnut',
            data: { labels: result.programmes.map(p => p.programme), datasets: [{ data: result.programmes.map(p => p.count), backgroundColor: colors.pieColors, borderWidth: 0 }] },
            options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: colors.textColor, padding: 15 } } } }
        });
    }
}

// the full analytics page with all four charts
async function loadAdminAnalytics() {
    const result = await apiCall('php/admin_get_chart_data.php');
    if (!result.success) return;
    const colors = getChartColors();
    const isDark = document.body.classList.contains('dark-mode');
    const palette = isDark ? colors.barColorsDark : colors.barColors;

    // student scores bar chart
    if (result.scores.length > 0) {
        createChart('analyticsScoreChart', {
            type: 'bar',
            data: { labels: result.scores.map(s => s.student_name), datasets: [{ label: 'Final Score', data: result.scores.map(s => s.final_score), backgroundColor: result.scores.map((_, i) => palette[i % palette.length]), borderRadius: 6, borderSkipped: false }] },
            options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100, ticks: { color: colors.textColor }, grid: { color: colors.gridColor } }, x: { ticks: { color: colors.textColor }, grid: { display: false } } } }
        });
    }

    // radar chart showing average marks per criteria
    if (result.criteria) {
        const c = result.criteria;
        createChart('analyticsRadarChart', {
            type: 'radar',
            data: { labels: ['Tasks', 'Health & Safety', 'Knowledge', 'Report', 'Language', 'Lifelong Learn.', 'Project Mgmt', 'Time Mgmt'], datasets: [{ label: 'Average Score', data: [c.avg_tasks, c.avg_health, c.avg_knowledge, c.avg_report, c.avg_clarity, c.avg_lifelong, c.avg_project, c.avg_time], backgroundColor: 'rgba(0,86,179,0.2)', borderColor: isDark ? '#4da3ff' : '#0056b3', pointBackgroundColor: isDark ? '#4da3ff' : '#0056b3', borderWidth: 2 }] },
            options: { responsive: true, scales: { r: { beginAtZero: true, ticks: { color: colors.textColor }, grid: { color: colors.gridColor }, pointLabels: { color: colors.textColor, font: { size: 11 } } } }, plugins: { legend: { labels: { color: colors.textColor } } } }
        });
    }

    // horizontal bar showing how many students each assessor has
    if (result.workload.length > 0) {
        createChart('analyticsWorkloadChart', {
            type: 'bar',
            data: { labels: result.workload.map(w => w.assessor_name), datasets: [{ label: 'Students Assigned', data: result.workload.map(w => w.student_count), backgroundColor: isDark ? '#23d5ab' : '#0056b3', borderRadius: 6, borderSkipped: false }] },
            options: { indexAxis: 'y', responsive: true, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { color: colors.textColor, stepSize: 1 }, grid: { color: colors.gridColor } }, y: { ticks: { color: colors.textColor }, grid: { display: false } } } }
        });
    }

    // programme distribution doughnut
    if (result.programmes.length > 0) {
        createChart('analyticsProgrammeChart', {
            type: 'doughnut',
            data: { labels: result.programmes.map(p => p.programme), datasets: [{ data: result.programmes.map(p => p.count), backgroundColor: colors.pieColors, borderWidth: 0 }] },
            options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: colors.textColor, padding: 15 } } } }
        });
    }
}

// fill the students table
async function loadStudentsTable() {
    const result = await apiCall('php/admin_get_students.php');
    const tbody = document.getElementById('studentsTableBody');
    if (!tbody || !result.success) return;

    tbody.innerHTML = '';
    if (result.students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4"><div class="empty-state"><div class="empty-icon">📭</div><p>No students registered yet</p></div></td></tr>';
        return;
    }
    result.students.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${s.student_id}</td><td>${s.student_name}</td><td>${s.programme}</td>
            <td><button onclick="editStudent(${s.student_id}, '${s.student_name.replace(/'/g, "\\'")}', '${s.programme.replace(/'/g, "\\'")}')">✏️</button>
            <button onclick="deleteStudent(${s.student_id}, '${s.student_name.replace(/'/g, "\\'")}')">🗑️</button></td>`;
        tbody.appendChild(tr);
    });
}

// add student form handler
const addStudentForm = document.getElementById('addStudentForm');
if (addStudentForm) {
    addStudentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('newStudentName').value.trim();
        const programme = document.getElementById('newStudentProgramme').value.trim();
        if (!name || !programme) { showToast("Please fill in all fields.", "error"); return; }

        const result = await apiCall('php/admin_add_student.php', 'POST', { student_name: name, programme: programme });
        showToast(result.message, result.success ? "success" : "error");
        if (result.success) { addStudentForm.reset(); loadStudentsTable(); loadAdminStats(); }
    });
}

// edit uses a simple prompt popup
function editStudent(id, name, programme) {
    const newName = prompt("Edit Student Name:", name);
    if (newName === null) return;
    const newProgramme = prompt("Edit Programme:", programme);
    if (newProgramme === null) return;

    apiCall('php/admin_update_student.php', 'POST', { student_id: id, student_name: newName.trim(), programme: newProgramme.trim() })
    .then(result => { showToast(result.message, result.success ? "success" : "error"); if (result.success) loadStudentsTable(); });
}

// delete shows a nice modal first
function deleteStudent(id, name) {
    showConfirmModal(`Delete "${name}"?`, 'This action cannot be undone.', () => {
        apiCall('php/admin_delete_student.php', 'POST', { student_id: id })
        .then(result => { showToast(result.message, result.success ? "success" : "error"); if (result.success) { loadStudentsTable(); loadAdminStats(); } });
    });
}

// fill the assessors table (now with edit/delete buttons and workload column)
async function loadAssessorsTable() {
    const result = await apiCall('php/admin_get_assessors.php');
    const tbody = document.getElementById('assessorsTableBody');
    if (!tbody || !result.success) return;

    tbody.innerHTML = '';
    if (result.assessors.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📭</div><p>No assessors registered yet</p></div></td></tr>';
        return;
    }
    result.assessors.forEach(a => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${a.assessor_id}</td><td>${a.assessor_name}</td><td>${a.email}</td><td>${a.workload}</td>
            <td><button onclick="editAssessor(${a.assessor_id}, '${a.assessor_name.replace(/'/g, "\\'")}', '${a.email.replace(/'/g, "\\'")}')">✏️</button>
            <button onclick="deleteAssessor(${a.assessor_id}, '${a.assessor_name.replace(/'/g, "\\'")}')">🗑️</button></td>`;
        tbody.appendChild(tr);
    });
}

// add assessor form handler
const addAssessorForm = document.getElementById('addAssessorForm');
if (addAssessorForm) {
    addAssessorForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('newAssessorName').value.trim();
        const email = document.getElementById('newAssessorEmail').value.trim();
        if (!name || !email) { showToast("Please fill in all fields.", "error"); return; }

        const result = await apiCall('php/admin_add_assessor.php', 'POST', { assessor_name: name, email: email });
        showToast(result.message, result.success ? "success" : "error");
        if (result.success) { addAssessorForm.reset(); loadAssessorsTable(); loadAdminStats(); }
    });
}

function editAssessor(id, name, email) {
    const newName = prompt("Edit Assessor Name:", name);
    if (newName === null) return;
    const newEmail = prompt("Edit Email:", email);
    if (newEmail === null) return;
    apiCall('php/admin_update_assessor.php', 'POST', { assessor_id: id, assessor_name: newName.trim(), email: newEmail.trim() })
    .then(result => { showToast(result.message, result.success ? "success" : "error"); if (result.success) loadAssessorsTable(); });
}

function deleteAssessor(id, name) {
    showConfirmModal(`Delete "${name}"?`, 'This will also remove their login account.', () => {
        apiCall('php/admin_delete_assessor.php', 'POST', { assessor_id: id })
        .then(result => { showToast(result.message, result.success ? "success" : "error"); if (result.success) { loadAssessorsTable(); loadAdminStats(); } });
    });
}

// populate the dropdowns on the internship assignment page
async function loadDropdowns() {
    const studentsResult = await apiCall('php/admin_get_students.php');
    const studentSelect = document.getElementById('assignStudentSelect');
    if (studentSelect && studentsResult.success) {
        studentSelect.innerHTML = '<option value="">-- Choose a student --</option>';
        studentsResult.students.forEach(s => { studentSelect.innerHTML += `<option value="${s.student_id}">${s.student_id} - ${s.student_name}</option>`; });
    }

    const assessorsResult = await apiCall('php/admin_get_assessors.php');
    const assessorSelect = document.getElementById('assignAssessorSelect');
    if (assessorSelect && assessorsResult.success) {
        assessorSelect.innerHTML = '<option value="">-- Choose an assessor --</option>';
        assessorsResult.assessors.forEach(a => { assessorSelect.innerHTML += `<option value="${a.assessor_id}">${a.assessor_name} (${a.workload} students)</option>`; });
    }
}

async function loadInternshipsTable() {
    const result = await apiCall('php/admin_get_internships.php');
    const tbody = document.getElementById('internshipsTableBody');
    if (!tbody || !result.success) return;
    tbody.innerHTML = '';
    if (result.internships.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3"><div class="empty-state"><div class="empty-icon">📭</div><p>No internships assigned yet</p></div></td></tr>';
        return;
    }
    result.internships.forEach(i => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${i.student_name}</td><td>${i.company_name}</td><td>${i.assessor_name}</td>`;
        tbody.appendChild(tr);
    });
}

// assign internship form handler
const assignInternshipForm = document.getElementById('assignInternshipForm');
if (assignInternshipForm) {
    assignInternshipForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const studentId = document.getElementById('assignStudentSelect').value;
        const assessorId = document.getElementById('assignAssessorSelect').value;
        const company = document.getElementById('assignCompanyName').value.trim();
        if (!studentId || !assessorId || !company) { showToast("Please fill in all fields.", "error"); return; }

        const result = await apiCall('php/admin_assign_internship.php', 'POST', { student_id: parseInt(studentId), assessor_id: parseInt(assessorId), company_name: company });
        showToast(result.message, result.success ? "success" : "error");
        if (result.success) { assignInternshipForm.reset(); loadInternshipsTable(); loadAdminStats(); }
    });
}

// results table with coloured score badges
async function loadResultsTable() {
    const result = await apiCall('php/admin_get_results.php');
    const tbody = document.getElementById('resultsTableBody');
    if (!tbody || !result.success) return;
    tbody.innerHTML = '';
    if (result.results.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📭</div><p>No results available yet</p></div></td></tr>';
        return;
    }
    result.results.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${r.student_id}</td><td>${r.student_name}</td><td>${r.company_name}</td><td>${r.assessor_name}</td><td>${getScoreBadge(r.final_score)}</td>`;
        tbody.appendChild(tr);
    });
}


// =============================================
//          ASSESSOR DASHBOARD STUFF
// =============================================

async function loadAssessorStats() {
    const result = await apiCall('php/assessor_get_stats.php');
    if (result.success) {
        animateCounter('statAssigned', result.total_assigned);
        animateCounter('statCompleted', result.completed);
        animateCounter('statPending', result.pending);
    }
}

// charts on the assessor home page
async function loadAssessorDashboardCharts() {
    const result = await apiCall('php/assessor_get_chart_data.php');
    if (!result.success) return;
    const colors = getChartColors();
    const isDark = document.body.classList.contains('dark-mode');
    const palette = isDark ? colors.barColorsDark : colors.barColors;

    if (result.student_scores.length > 0) {
        createChart('assessorScoreChart', {
            type: 'bar',
            data: { labels: result.student_scores.map(s => s.student_name), datasets: [{ label: 'Final Score', data: result.student_scores.map(s => s.final_score), backgroundColor: result.student_scores.map((_, i) => palette[i % palette.length]), borderRadius: 6, borderSkipped: false }] },
            options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100, ticks: { color: colors.textColor }, grid: { color: colors.gridColor } }, x: { ticks: { color: colors.textColor }, grid: { display: false } } } }
        });
    }

    if (result.criteria) {
        const c = result.criteria;
        createChart('assessorRadarChart', {
            type: 'radar',
            data: { labels: ['Tasks', 'Health & Safety', 'Knowledge', 'Report', 'Language', 'Lifelong Learn.', 'Project Mgmt', 'Time Mgmt'], datasets: [{ label: 'Avg Score', data: [c.avg_tasks, c.avg_health, c.avg_knowledge, c.avg_report, c.avg_clarity, c.avg_lifelong, c.avg_project, c.avg_time], backgroundColor: 'rgba(35,213,171,0.2)', borderColor: '#23d5ab', pointBackgroundColor: '#23d5ab', borderWidth: 2 }] },
            options: { responsive: true, scales: { r: { beginAtZero: true, ticks: { color: colors.textColor }, grid: { color: colors.gridColor }, pointLabels: { color: colors.textColor, font: { size: 11 } } } }, plugins: { legend: { labels: { color: colors.textColor } } } }
        });
    }
}

// dedicated analytics page for assessor
async function loadAssessorAnalytics() {
    const result = await apiCall('php/assessor_get_chart_data.php');
    if (!result.success) return;
    const colors = getChartColors();
    const isDark = document.body.classList.contains('dark-mode');
    const palette = isDark ? colors.barColorsDark : colors.barColors;

    if (result.student_scores.length > 0) {
        createChart('analyticsAssessorScoreChart', {
            type: 'bar',
            data: { labels: result.student_scores.map(s => s.student_name), datasets: [{ label: 'Final Score', data: result.student_scores.map(s => s.final_score), backgroundColor: result.student_scores.map((_, i) => palette[i % palette.length]), borderRadius: 6, borderSkipped: false }] },
            options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100, ticks: { color: colors.textColor }, grid: { color: colors.gridColor } }, x: { ticks: { color: colors.textColor }, grid: { display: false } } } }
        });
    }

    if (result.criteria) {
        const c = result.criteria;
        createChart('analyticsAssessorRadarChart', {
            type: 'radar',
            data: { labels: ['Tasks', 'Health & Safety', 'Knowledge', 'Report', 'Language', 'Lifelong Learn.', 'Project Mgmt', 'Time Mgmt'], datasets: [{ label: 'Avg Score', data: [c.avg_tasks, c.avg_health, c.avg_knowledge, c.avg_report, c.avg_clarity, c.avg_lifelong, c.avg_project, c.avg_time], backgroundColor: 'rgba(35,213,171,0.2)', borderColor: '#23d5ab', pointBackgroundColor: '#23d5ab', borderWidth: 2 }] },
            options: { responsive: true, scales: { r: { beginAtZero: true, ticks: { color: colors.textColor }, grid: { color: colors.gridColor }, pointLabels: { color: colors.textColor, font: { size: 11 } } } }, plugins: { legend: { labels: { color: colors.textColor } } } }
        });
    }
}

// fill the student dropdown (only shows students that havent been graded yet)
async function loadAssessorStudents() {
    const result = await apiCall('php/assessor_get_students.php');
    const select = document.getElementById('studentSelect');
    if (!select || !result.success) return;
    select.innerHTML = '<option value="">-- Choose a student --</option>';
    if (result.students.length === 0) select.innerHTML = '<option value="">-- No pending students --</option>';
    result.students.forEach(s => { select.innerHTML += `<option value="${s.internship_id}">${s.student_id} - ${s.student_name} (${s.company_name})</option>`; });
}

// submit the assessment to the database
const submitMarksBtn = document.getElementById('submitMarksBtn');
if (submitMarksBtn) {
    submitMarksBtn.addEventListener('click', async function() {
        const internshipId = document.getElementById('studentSelect')?.value;
        if (!internshipId) { showToast("Please select a student first.", "error"); return; }

        const data = {
            internship_id: parseInt(internshipId),
            undertaking_tasks: parseInt(document.getElementById('mark_undertaking')?.value) || 0,
            health_safety: parseInt(document.getElementById('mark_health')?.value) || 0,
            theoretical_knowledge: parseInt(document.getElementById('mark_knowledge')?.value) || 0,
            report_presentation: parseInt(document.getElementById('mark_report')?.value) || 0,
            clarity_language: parseInt(document.getElementById('mark_clarity')?.value) || 0,
            lifelong_learning: parseInt(document.getElementById('mark_lifelong')?.value) || 0,
            project_management: parseInt(document.getElementById('mark_project')?.value) || 0,
            time_management: parseInt(document.getElementById('mark_time')?.value) || 0,
            comments: document.getElementById('assessmentComments')?.value || ''
        };

        const result = await apiCall('php/assessor_submit_assessment.php', 'POST', data);
        showToast(result.message, result.success ? "success" : "error");

        if (result.success) {
            document.getElementById('gradingForm').reset();
            if (liveTotal) liveTotal.textContent = "0";
            if (gradeStatus) gradeStatus.textContent = "";
            loadAssessorStudents();
            loadAssessorStats();
        }
    });
}

// ---- LIVE CHARACTER COUNTER ----
const commentBox = document.getElementById('assessmentComments');
const charCount = document.getElementById('charCount');

if (commentBox && charCount) {
    commentBox.addEventListener('input', function() {
        const currentLength = this.value.length;
        charCount.textContent = `${currentLength} / 500`;
        
        // Turn text red if they go over 450 characters
        if (currentLength > 450) {
            charCount.style.color = '#ff4d4d';
        } else {
            charCount.style.color = 'var(--text-muted)';
        }
    });
}

// assessment history table
async function loadAssessmentHistory() {
    const result = await apiCall('php/assessor_get_history.php');
    const tbody = document.getElementById('historyTableBody');
    if (!tbody || !result.success) return;
    tbody.innerHTML = '';
    if (result.history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📭</div><p>No assessments completed yet</p></div></td></tr>';
        return;
    }
    result.history.forEach(h => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${h.student_id}</td><td>${h.student_name}</td><td>${h.company_name}</td><td>${getScoreBadge(h.final_score)}</td><td><span class="status-badge submitted">✅ Submitted</span></td>`;
        tbody.appendChild(tr);
    });
}


// =============================================
//           CHANGE PASSWORD (both dashboards)
// =============================================

const changePasswordForm = document.getElementById('changePasswordForm');
if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const current = document.getElementById('currentPassword').value;
        const newPw = document.getElementById('newPassword').value;
        const confirm = document.getElementById('confirmPassword').value;

        if (!current || !newPw || !confirm) { showToast("Please fill in all fields.", "error"); return; }
        if (newPw !== confirm) { showToast("New passwords do not match.", "error"); return; }
        if (newPw.length < 6) { showToast("Password must be at least 6 characters.", "error"); return; }

        const result = await apiCall('php/change_password.php', 'POST', { current_password: current, new_password: newPw, confirm_password: confirm });
        showToast(result.message, result.success ? "success" : "error");
        if (result.success) changePasswordForm.reset();
    });
}
