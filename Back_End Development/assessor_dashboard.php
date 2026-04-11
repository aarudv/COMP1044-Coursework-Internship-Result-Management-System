<?php
require_once 'php/check_session.php';
// only assessors allowed here
if ($_SESSION['role'] !== 'assessor') { header("Location: login.php"); exit; }
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Assessor Dashboard - Internship Management</title>
    <link rel="stylesheet" href="CSS/style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
</head>
<body class="dashboard-body">

    <nav class="top-nav">
        <div class="nav-logo">🎓 Assessor Portal</div>
        <button id="themeToggle" class="theme-btn dashboard-theme-btn">🌙 Dark Mode</button>
    </nav>

    <div class="dashboard-container">
        <aside class="sidebar">
            <button class="tab-btn active" onclick="openTab('assessorHome')">📊 My Dashboard</button>
            <button class="tab-btn" onclick="openTab('assessStudent')">✍️ Assess Student</button>
            <button class="tab-btn" onclick="openTab('viewHistory')">📁 Assessment History</button>
            <button class="tab-btn" onclick="openTab('assessorAnalytics')">📉 My Analytics</button>
            <button class="tab-btn" onclick="openTab('profileTab')">👤 My Profile</button>
            <button class="logout-btn sidebar-logout" onclick="window.location.href='php/logout.php'">🚪 Logout</button>
        </aside>

        <main class="content-area">

            <!-- my dashboard tab -->
            <section id="assessorHome" class="tab-content active-tab">
                <h2 style="color: white">Welcome, <span id="assessorWelcomeName"><?php echo htmlspecialchars($_SESSION['assessor_name'] ?? 'Assessor'); ?></span> 👋</h2>
                <div class="kpi-grid">
                    <div class="kpi-card">
                        <div class="kpi-icon">🎓</div>
                        <h3 id="statAssigned">--</h3>
                        <p>Assigned Students</p>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-icon">✅</div>
                        <h3 id="statCompleted">--</h3>
                        <p>Assessments Completed</p>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-icon">⏳</div>
                        <h3 id="statPending" style="color: #ff4d4d;">--</h3>
                        <p>Pending Assessments</p>
                    </div>
                </div>
                <div class="chart-grid">
                    <div class="chart-panel"><h3>📊 My Student Scores</h3><canvas id="assessorScoreChart"></canvas></div>
                    <div class="chart-panel"><h3>🕸️ Average Criteria Breakdown</h3><canvas id="assessorRadarChart"></canvas></div>
                </div>
            </section>

            <!-- assess student tab -->
            <section id="assessStudent" class="tab-content">
                <h2 style="color: white">Student Assessment Form</h2>
                <p style="color: var(--text-muted); margin-bottom: 15px;">Scores will calculate automatically. Maximum weightages are strictly enforced.</p>
                <div class="glass-panel">
                    <form id="gradingForm" class="grid-form">
                        <div class="input-group" style="grid-column: span 2;">
                            <label>Select Assigned Student</label>
                            <select id="studentSelect" style="width:100%;padding:12px;border-radius:6px;background:var(--input-bg);color:var(--text-main);border:1px solid var(--input-border);">
                                <option value="">-- Choose a student --</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label>Undertaking Tasks (10%)</label>
                            <input type="number" class="mark-input" id="mark_undertaking" data-max="10" min="0" max="10" placeholder="Max 10">
                        </div>
                        <div class="input-group">
                            <label>Health & Safety (10%)</label>
                            <input type="number" class="mark-input" id="mark_health" data-max="10" min="0" max="10" placeholder="Max 10">
                        </div>
                        <div class="input-group">
                            <label>Connectivity/Knowledge (10%)</label>
                            <input type="number" class="mark-input" id="mark_knowledge" data-max="10" min="0" max="10" placeholder="Max 10">
                        </div>
                        <div class="input-group">
                            <label>Report Presentation (15%)</label>
                            <input type="number" class="mark-input" id="mark_report" data-max="15" min="0" max="15" placeholder="Max 15">
                        </div>
                        <div class="input-group">
                            <label>Clarity of Language (10%)</label>
                            <input type="number" class="mark-input" id="mark_clarity" data-max="10" min="0" max="10" placeholder="Max 10">
                        </div>
                        <div class="input-group">
                            <label>Lifelong Learning (15%)</label>
                            <input type="number" class="mark-input" id="mark_lifelong" data-max="15" min="0" max="15" placeholder="Max 15">
                        </div>
                        <div class="input-group">
                            <label>Project Management (15%)</label>
                            <input type="number" class="mark-input" id="mark_project" data-max="15" min="0" max="15" placeholder="Max 15">
                        </div>
                        <div class="input-group">
                            <label>Time Management (15%)</label>
                            <input type="number" class="mark-input" id="mark_time" data-max="15" min="0" max="15" placeholder="Max 15">
                        </div>
                        <div class="input-group" style="grid-column: span 2;">
                            <label>Qualitative Comments & Feedback</label>
                            <textarea id="assessmentComments" rows="4" placeholder="Provide justification for the scores given..." style="width:100%;padding:12px;border-radius:6px;background:var(--input-bg);color:var(--text-main);border:1px solid var(--input-border);resize:vertical;"></textarea>
                            <div id="charCount" style="text-align: right; font-size: 12px; color: var(--text-muted); margin-top: 5px;">0 / 500</div>
                        </div>
                        <div class="score-display" style="grid-column: span 2; text-align: right; margin-top: 10px; margin-bottom: 20px;">
                            <h2 style="color: var(--text-main);">Live Total: <span id="liveTotal" style="color: var(--primary); font-size: 32px;">0</span> / 100</h2>
                            <p id="gradeStatus" style="font-weight: bold;"></p>
                        </div>
                        <button type="button" class="login-btn" id="submitMarksBtn">💾 Submit Final Assessment</button>
                    </form>
                </div>
            </section>

            <!-- assessment history tab -->
            <section id="viewHistory" class="tab-content">
                <h2 style="color: white">Completed Assessments</h2>
                <div class="glass-panel">
                    <table class="data-table" id="resultsTable">
                        <thead><tr><th>Student ID</th><th>Name</th><th>Company</th><th>Final Score</th><th>Status</th></tr></thead>
                        <tbody id="historyTableBody"></tbody>
                    </table>
                </div>
                <div style="margin-top: 20px; display: flex; gap: 10px;">
                    <button type="button" class="login-btn" id="exportCsvBtn" style="width:auto;padding:10px 20px;display:inline-flex;align-items:center;gap:8px;">📥 Export CSV</button>
                    <button type="button" class="login-btn" id="printReportBtn" style="width:auto;padding:10px 20px;display:inline-flex;align-items:center;gap:8px;background:#23d5ab;">🖨️ Print Report</button>
                </div>
            </section>

            <!-- my analytics tab -->
            <section id="assessorAnalytics" class="tab-content">
                <h2 style="color: white">My Analytics</h2>
                <div class="chart-grid">
                    <div class="chart-panel"><h3>📊 Student Final Scores</h3><canvas id="analyticsAssessorScoreChart"></canvas></div>
                    <div class="chart-panel"><h3>🕸️ Criteria Performance Radar</h3><canvas id="analyticsAssessorRadarChart"></canvas></div>
                </div>
            </section>

            <!-- profile tab -->
            <section id="profileTab" class="tab-content">
                <h2 style="color: white">My Profile</h2>
                <div class="profile-card">
                    <h3>👤 Account Information</h3>
                    <div class="profile-info">
                        <p><span>Name:</span> <?php echo htmlspecialchars($_SESSION['assessor_name'] ?? ''); ?></p>
                        <p><span>Username:</span> <?php echo htmlspecialchars($_SESSION['username']); ?></p>
                        <p><span>Role:</span> Assessor / Lecturer</p>
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
