<?php
// gets all internship assignments with student and assessor names joined in
header('Content-Type: application/json');
require_once 'db_connect.php';
require_once 'check_session.php';

$result = $conn->query("
    SELECT i.internship_id, s.student_id, s.student_name, a.assessor_name, i.company_name
    FROM internships i
    JOIN students s ON i.student_id = s.student_id
    JOIN assessors a ON i.assessor_id = a.assessor_id
    ORDER BY i.internship_id DESC
");

$internships = [];
while ($row = $result->fetch_assoc()) {
    $internships[] = $row;
}

echo json_encode(["success" => true, "internships" => $internships]);
$conn->close();
?>
