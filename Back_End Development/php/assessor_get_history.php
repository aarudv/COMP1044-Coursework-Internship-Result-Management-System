<?php
// gets all assessments this assessor has already completed
header('Content-Type: application/json');
require_once 'db_connect.php';
require_once 'check_session.php';

$assessor_id = $_SESSION['assessor_id'] ?? 0;

if ($assessor_id <= 0) {
    echo json_encode(["success" => false, "message" => "Assessor not found."]);
    exit;
}

$stmt = $conn->prepare("
    SELECT s.student_id, s.student_name, i.company_name, a.final_score, a.comments
    FROM assessments a
    JOIN internships i ON a.internship_id = i.internship_id
    JOIN students s ON i.student_id = s.student_id
    WHERE i.assessor_id = ?
    ORDER BY a.assessment_id DESC
");
$stmt->bind_param("i", $assessor_id);
$stmt->execute();
$result = $stmt->get_result();

$history = [];
while ($row = $result->fetch_assoc()) $history[] = $row;

echo json_encode(["success" => true, "history" => $history]);
$stmt->close();
$conn->close();
?>
