<?php
// returns the counts for the admin dashboard KPI cards
header('Content-Type: application/json');
require_once 'db_connect.php';
require_once 'check_session.php';

$studentCount = $conn->query("SELECT COUNT(*) as total FROM students")->fetch_assoc()['total'];
$assessorCount = $conn->query("SELECT COUNT(*) as total FROM assessors")->fetch_assoc()['total'];
$internshipCount = $conn->query("SELECT COUNT(*) as total FROM internships")->fetch_assoc()['total'];

echo json_encode([
    "success" => true,
    "students" => $studentCount,
    "assessors" => $assessorCount,
    "internships" => $internshipCount
]);
$conn->close();
?>
