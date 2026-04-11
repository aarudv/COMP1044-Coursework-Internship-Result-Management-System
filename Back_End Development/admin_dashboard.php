<?php
require_once 'php/check_session.php';
// only admins allowed here
if ($_SESSION['role'] !== 'admin') { header("Location: login.php"); exit; }
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Internship Management</title>
    <link rel="stylesheet" href="CSS/style.css">
    <!-- chart.js for the analytics graphs -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
</head>
<body class="dashboard-body">

    <nav class="top-nav">
        <div class="nav-logo">🎓 Admin Portal</div>
        <div class="nav-right-controls">
            <button id="themeToggle" class="theme-btn dashboard-theme-btn">🌙 Dark Mode</button>
        </div>
    </nav>

    <div class="dashboard-container">
        <aside class="sidebar">
            <button class="tab-btn active" onclick="openTab('dashboardHome')">📊 System Overview</button>
            <button class="tab-btn" onclick="openTab('userManage')">👥 Manage Users</button>
            <button class="tab-btn" onclick="openTab('internManage')">🏢 Manage Internships</button>
            <button class="tab-btn" onclick="openTab('viewResults')">📈 View Results</button>
            <button class="tab-btn" onclick="openTab('analytics')">📉 Analytics</button>
            <button class="tab-btn" onclick="openTab('profileTab')">👤 My Profile</button>
            <button class="logout-btn sidebar-logout" onclick="window.location.href='php/logout.php'">🚪 Logout</button>
        </aside>

        <main class="content-area">

            <!-- system overview tab -->
            <section id="dashboardHome" class="tab-content active-tab">
                <h2 style="color: white">Welcome back, <?php echo htmlspecialchars($_SESSION['username']); ?> 👋</h2>
                <div class="kpi-grid">
                    <div class="kpi-card">
                        <div class="kpi-icon">🎓</div>
                        <h3 id="statStudents">--</h3>
                        <p>Total Students</p>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-icon">👨‍🏫</div>
                        <h3 id="statAssessors">--</h3>
                        <p>Active Assessors</p>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-icon">🏢</div>
                        <h3 id="statInternships">--</h3>
                        <p>Internships Assigned</p>
                    </div>
                </div>
                <div class="chart-grid">
                    <div class="chart-panel">
                        <h3>📊 Student Scores</h3>
                        <canvas id="overviewScoreChart"></canvas>
                    </div>
                    <div class="chart-panel">
                        <h3>📋 Programme Distribution</h3>
                        <canvas id="overviewProgrammeChart"></canvas>
                    </div>
                </div>
            </section>

            <!-- manage users tab -->
            <section id="userManage" class="tab-content">
                <h2 style="color: white">Manage System Users</h2>
                <p style="color: var(--text-muted); margin-bottom: 15px;">Add, update, or delete Student and Assessor profiles.</p>

                <div class="dashboard-grid">
                    <div class="glass-panel">
                        <h3>➕ Add New Student</h3>
                        <form class="grid-form" id="addStudentForm">
                            <div class="input-group">
                                <label>Student Name</label>
                                <input type="text" id="newStudentName" placeholder="Full Name" required>
                            </div>
                            <div class="input-group">
                                <label>Programme</label>
                                <input type="text" id="newStudentProgramme" placeholder="e.g. Software Eng." required>
                            </div>
                            <button type="submit" class="login-btn">Save Student</button>
                        </form>

                        <hr class="section-divider">

                        <h3>➕ Create Assessor Account</h3>
                        <form class="grid-form" id="addAssessorForm">
                            <div class="input-group">
                                <label>Assessor Name</label>
                                <input type="text" id="newAssessorName" placeholder="e.g. Dr. Alan Turing" required>
                            </div>
                            <div class="input-group">
                                <label>Email / Username</label>
                                <input type="text" id="newAssessorEmail" placeholder="alan@university.edu" required>
                            </div>
                            <button type="submit" class="login-btn">Create Account</button>
                        </form>
                    </div>

                    <div class="glass-panel" style="overflow-y: auto; max-height: 550px;">
                        <h3>Registered Students</h3>
                        <table class="data-table" id="studentsTable">
                            <thead><tr><th>ID</th><th>Name</th><th>Programme</th><th>Action</th></tr></thead>
                            <tbody id="studentsTableBody"></tbody>
                        </table>
                        <hr class="section-divider">
                        <h3>Authorized Assessors</h3>
                        <table class="data-table" id="assessorsTable">
                            <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Students</th><th>Action</th></tr></thead>
                            <tbody id="assessorsTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </section>

            <!-- manage internships tab -->
            <section id="internManage" class="tab-content">
                <h2 style="color: white">Internship Assignments</h2>
                <div class="dashboard-grid">
                    <div class="glass-panel">
                        <h3>🔗 Assign Student to Assessor</h3>
                        <form class="grid-form" id="assignInternshipForm">
                            <div class="input-group">
                                <label>Select Student</label>
                                <select id="assignStudentSelect" style="width:100%;padding:12px;border-radius:6px;background:var(--input-bg);color:var(--text-main);border:1px solid var(--input-border);">
                                    <option value="">-- Choose a student --</option>
                                </select>
                            </div>
                            <div class="input-group">
                                <label>Assign Assessor</label>
                                <select id="assignAssessorSelect" style="width:100%;padding:12px;border-radius:6px;background:var(--input-bg);color:var(--text-main);border:1px solid var(--input-border);">
                                    <option value="">-- Choose an assessor --</option>
                                </select>
                            </div>
                            <div class="input-group" style="grid-column: span 2;">
                                <label>Internship Company Name</label>
                                <input type="text" id="assignCompanyName" placeholder="e.g. TechCorp Solutions" required>
                            </div>
                            <button type="submit" class="login-btn">Confirm Assignment</button>
                        </form>
                    </div>
                    <div class="glass-panel">
                        <h3>Current Assignments</h3>
                        <table class="data-table" id="internshipsTable">
                            <thead><tr><th>Student</th><th>Company</th><th>Assessor</th></tr></thead>
                            <tbody id="internshipsTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </section>

            <!-- view results tab -->
            <section id="viewResults" class="tab-content">
                <h2 style="color: white">Student Results Overview</h2>
                <div class="glass-panel">
                    <div class="input-group" style="margin-bottom: 20px;">
                        <input type="text" id="searchBar" placeholder="🔍 Live search by Student ID or Name..." onkeyup="filterTable()">
                    </div>
                    <table class="data-table" id="resultsTable">
                        <thead><tr><th>Student ID</th><th>Name</th><th>Company</th><th>Assessor</th><th>Final Score</th></tr></thead>
                        <tbody id="resultsTableBody"></tbody>
                    </table>
                </div>
                <div style="margin-top: 20px; display: flex; gap: 10px;">
                    <button type="button" class="login-btn" id="exportCsvBtn" style="width:auto;padding:10px 20px;display:inline-flex;align-items:center;gap:8px;">📥 Export CSV</button>
                    <button type="button" class="login-btn" id="printReportBtn" style="width:auto;padding:10px 20px;display:inline-flex;align-items:center;gap:8px;background:#23d5ab;">🖨️ Print Report</button>
                </div>
            </section>

            <!-- analytics tab -->
            <section id="analytics" class="tab-content">
                <h2 style="color: white">Analytics & Reports</h2>
                <div class="chart-grid">
                    <div class="chart-panel"><h3>📊 Student Final Scores</h3><canvas id="analyticsScoreChart"></canvas></div>
                    <div class="chart-panel"><h3>🕸️ Average Criteria Breakdown</h3><canvas id="analyticsRadarChart"></canvas></div>
                    <div class="chart-panel"><h3>👨‍🏫 Assessor Workload</h3><canvas id="analyticsWorkloadChart"></canvas></div>
                    <div class="chart-panel"><h3>🎓 Programme Distribution</h3><canvas id="analyticsProgrammeChart"></canvas></div>
                </div>
            </section>

            <!-- profile tab -->
            <section id="profileTab" class="tab-content">
                <h2 style="color: white">My Profile</h2>
                <div class="profile-card">
                    <h3>👤 Account Information</h3>
                    <div class="profile-info">
                        <p><span>Username:</span> <?php echo htmlspecialchars($_SESSION['username']); ?></p>
                        <p><span>Role:</span> System Administrator</p>
                        <p><span>User ID:</span> <?php echo $_SESSION['user_id']; ?></p>
                    </div>
                    <h3>🔒 Change Password</h3>
                    <form id="changePasswordForm" class="grid-form" style="grid-template-columns: 1fr;">
                        <div class="input-group">
                            <label>Current Password</label>
                            <input type="password" id="currentPassword" placeholder="Enter current password" required>
                        </div>
                        <div class="input-group">
                            <label>New Password</label>
                            <input type="password" id="newPassword" placeholder="Enter new password (min 6 chars)" required>
                        </div>
                        <div class="input-group">
                            <label>Confirm New Password</label>
                            <input type="password" id="confirmPassword" placeholder="Repeat new password" required>
                        </div>
                        <button type="submit" class="login-btn">🔐 Update Password</button>
                    </form>
                </div>
            </section>

        </main>
    </div>
    <script src="JAVASCRIPT/script.js"></script>
</body>
</html>
