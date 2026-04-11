<?php
// gets students assigned to this assessor that havent been graded yet
header('Content-Type: application/json');
require_once 'db_connect.php';
require_once 'check_session.php';

$assessor_id = $_SESSION['assessor_id'] ?? 0;

if ($assessor_id <= 0) {
    echo json_encode(["success" => false, "message" => "Assessor not found."]);
    exit;
}

$stmt = $conn->prepare("
    SELECT s.student_id, s.student_name, i.internship_id, i.company_name
    FROM internships i
    JOIN students s ON i.student_id = s.student_id
    LEFT JOIN assessments a ON i.internship_id = a.internship_id
    WHERE i.assessor_id = ? AND a.assessment_id IS NULL
    ORDER BY s.student_name ASC
");
$stmt->bind_param("i", $assessor_id);
$stmt->execute();
$result = $stmt->get_result();

$students = [];
while ($row = $result->fetch_assoc()) $students[] = $row;

echo json_encode(["success" => true, "students" => $students]);
$stmt->close();
$conn->close();
?>
