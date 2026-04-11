<?php
// returns data for charts on the assessor dashboard (only their own students)
header('Content-Type: application/json');
require_once 'db_connect.php';
require_once 'check_session.php';

$assessor_id = $_SESSION['assessor_id'] ?? 0;

// individual student scores for the bar chart
$stmt = $conn->prepare("
    SELECT s.student_name, a.final_score,
           a.undertaking_tasks, a.health_safety, a.theoretical_knowledge,
           a.report_presentation, a.clarity_language, a.lifelong_learning,
           a.project_management, a.time_management
    FROM assessments a
    JOIN internships i ON a.internship_id = i.internship_id
    JOIN students s ON i.student_id = s.student_id
    WHERE i.assessor_id = ?
    ORDER BY s.student_name ASC
");
$stmt->bind_param("i", $assessor_id);
$stmt->execute();
$result = $stmt->get_result();

$studentScores = [];
while ($row = $result->fetch_assoc()) $studentScores[] = $row;
$stmt->close();

// average across all criteria for the radar chart
$stmt2 = $conn->prepare("
    SELECT ROUND(AVG(a.undertaking_tasks),1) as avg_tasks,
           ROUND(AVG(a.health_safety),1) as avg_health,
           ROUND(AVG(a.theoretical_knowledge),1) as avg_knowledge,
           ROUND(AVG(a.report_presentation),1) as avg_report,
           ROUND(AVG(a.clarity_language),1) as avg_clarity,
           ROUND(AVG(a.lifelong_learning),1) as avg_lifelong,
           ROUND(AVG(a.project_management),1) as avg_project,
           ROUND(AVG(a.time_management),1) as avg_time
    FROM assessments a
    JOIN internships i ON a.internship_id = i.internship_id
    WHERE i.assessor_id = ?
");
$stmt2->bind_param("i", $assessor_id);
$stmt2->execute();
$criteriaData = $stmt2->get_result()->fetch_assoc();
$stmt2->close();

echo json_encode([
    "success" => true,
    "student_scores" => $studentScores,
    "criteria" => $criteriaData
]);
$conn->close();
?>
