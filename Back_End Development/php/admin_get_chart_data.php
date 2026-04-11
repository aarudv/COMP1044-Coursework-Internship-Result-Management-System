<?php
// returns all the data needed for the charts on the admin dashboard
header('Content-Type: application/json');
require_once 'db_connect.php';
require_once 'check_session.php';

// student scores for the bar chart
$scores = $conn->query("
    SELECT s.student_name, a.final_score
    FROM assessments a
    JOIN internships i ON a.internship_id = i.internship_id
    JOIN students s ON i.student_id = s.student_id
    ORDER BY s.student_name ASC
");
$scoreData = [];
while ($row = $scores->fetch_assoc()) $scoreData[] = $row;

// how many students in each programme for the pie chart
$programmes = $conn->query("SELECT programme, COUNT(*) as count FROM students GROUP BY programme");
$programmeData = [];
while ($row = $programmes->fetch_assoc()) $programmeData[] = $row;

// how many students each assessor has for the workload chart
$workload = $conn->query("
    SELECT a.assessor_name, COUNT(i.internship_id) as student_count
    FROM assessors a
    LEFT JOIN internships i ON a.assessor_id = i.assessor_id
    GROUP BY a.assessor_id
");
$workloadData = [];
while ($row = $workload->fetch_assoc()) $workloadData[] = $row;

// average marks across all criteria for the radar chart
$criteria = $conn->query("
    SELECT ROUND(AVG(undertaking_tasks),1) as avg_tasks,
           ROUND(AVG(health_safety),1) as avg_health,
           ROUND(AVG(theoretical_knowledge),1) as avg_knowledge,
           ROUND(AVG(report_presentation),1) as avg_report,
           ROUND(AVG(clarity_language),1) as avg_clarity,
           ROUND(AVG(lifelong_learning),1) as avg_lifelong,
           ROUND(AVG(project_management),1) as avg_project,
           ROUND(AVG(time_management),1) as avg_time
    FROM assessments
");
$criteriaData = $criteria->fetch_assoc();

echo json_encode([
    "success" => true,
    "scores" => $scoreData,
    "programmes" => $programmeData,
    "workload" => $workloadData,
    "criteria" => $criteriaData
]);
$conn->close();
?>
