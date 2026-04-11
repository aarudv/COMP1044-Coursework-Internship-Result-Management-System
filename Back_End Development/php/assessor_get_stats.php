<?php
// gets the KPI numbers for the assessor dashboard
header('Content-Type: application/json');
require_once 'db_connect.php';
require_once 'check_session.php';

$assessor_id = $_SESSION['assessor_id'] ?? 0;

if ($assessor_id <= 0) {
    echo json_encode(["success" => false, "message" => "Assessor not found in session."]);
    exit;
}

// how many students are assigned to this assessor
$s1 = $conn->prepare("SELECT COUNT(*) as total FROM internships WHERE assessor_id = ?");
$s1->bind_param("i", $assessor_id);
$s1->execute();
$totalAssigned = $s1->get_result()->fetch_assoc()['total'];
$s1->close();

// how many have been graded already
$s2 = $conn->prepare("
    SELECT COUNT(*) as total FROM assessments ass
    JOIN internships i ON ass.internship_id = i.internship_id
    WHERE i.assessor_id = ?
");
$s2->bind_param("i", $assessor_id);
$s2->execute();
$completed = $s2->get_result()->fetch_assoc()['total'];
$s2->close();

$pending = $totalAssigned - $completed;

echo json_encode([
    "success" => true,
    "assessor_name" => $_SESSION['assessor_name'] ?? 'Assessor',
    "total_assigned" => $totalAssigned,
    "completed" => $completed,
    "pending" => $pending
]);
$conn->close();
?>
