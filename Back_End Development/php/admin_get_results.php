<?php
// pulls all student results - joins internships, students, assessors and assessments together
header('Content-Type: application/json');
require_once 'db_connect.php';
require_once 'check_session.php';

$result = $conn->query("
    SELECT s.student_id, s.student_name, i.company_name, a.assessor_name,
           ass.final_score, ass.comments
    FROM internships i
    JOIN students s ON i.student_id = s.student_id
    JOIN assessors a ON i.assessor_id = a.assessor_id
    LEFT JOIN assessments ass ON i.internship_id = ass.internship_id
    ORDER BY s.student_id ASC
");

$results = [];
while ($row = $result->fetch_assoc()) {
    $results[] = $row;
}

echo json_encode(["success" => true, "results" => $results]);
$conn->close();
?>
