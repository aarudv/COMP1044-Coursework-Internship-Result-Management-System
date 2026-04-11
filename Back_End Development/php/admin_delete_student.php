<?php
// deletes a student but only if they dont have any internships assigned
header('Content-Type: application/json');
require_once 'db_connect.php';
require_once 'check_session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request."]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$student_id = intval($input['student_id'] ?? 0);

if ($student_id <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid student ID."]);
    exit;
}

// make sure they dont have internships first
$check = $conn->prepare("SELECT COUNT(*) as count FROM internships WHERE student_id = ?");
$check->bind_param("i", $student_id);
$check->execute();
$hasInternships = $check->get_result()->fetch_assoc()['count'];
$check->close();

if ($hasInternships > 0) {
    echo json_encode(["success" => false, "message" => "Cannot delete: student has internship assignments. Remove those first."]);
    exit;
}

$stmt = $conn->prepare("DELETE FROM students WHERE student_id = ?");
$stmt->bind_param("i", $student_id);

if ($stmt->execute() && $stmt->affected_rows > 0) {
    echo json_encode(["success" => true, "message" => "Student deleted successfully!"]);
} else {
    echo json_encode(["success" => false, "message" => "Student not found or already deleted."]);
}

$stmt->close();
$conn->close();
?>
