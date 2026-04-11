<?php
// fetches all assessors with their current workload (how many students they have)
header('Content-Type: application/json');
require_once 'db_connect.php';
require_once 'check_session.php';

$result = $conn->query("
    SELECT a.assessor_id, a.assessor_name, a.email, a.user_id,
           COUNT(i.internship_id) as workload
    FROM assessors a
    LEFT JOIN internships i ON a.assessor_id = i.assessor_id
    GROUP BY a.assessor_id
    ORDER BY a.assessor_id ASC
");

$assessors = [];
while ($row = $result->fetch_assoc()) {
    $assessors[] = $row;
}

echo json_encode(["success" => true, "assessors" => $assessors]);
$conn->close();
?>
