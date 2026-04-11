<?php
// updates an existing student's name and programme
header('Content-Type: application/json');
require_once 'db_connect.php';
require_once 'check_session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request."]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$student_id = intval($input['student_id'] ?? 0);
$student_name = trim($input['student_name'] ?? '');
$programme = trim($input['programme'] ?? '');

if ($student_id <= 0 || empty($student_name) || empty($programme)) {
    echo json_encode(["success" => false, "message" => "All fields are required."]);
    exit;
}

$stmt = $conn->prepare("UPDATE students SET student_name = ?, programme = ? WHERE student_id = ?");
$stmt->bind_param("ssi", $student_name, $programme, $student_id);

if ($stmt->execute() && $stmt->affected_rows > 0) {
    echo json_encode(["success" => true, "message" => "Student updated successfully!"]);
} else {
    echo json_encode(["success" => false, "message" => "No changes made or student not found."]);
}

$stmt->close();
$conn->close();
?>
