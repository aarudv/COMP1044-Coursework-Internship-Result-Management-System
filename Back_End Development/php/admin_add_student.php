<?php
// adds a new student to the database
header('Content-Type: application/json');
require_once 'db_connect.php';
require_once 'check_session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request."]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$student_name = trim($input['student_name'] ?? '');
$programme = trim($input['programme'] ?? '');

if (empty($student_name) || empty($programme)) {
    echo json_encode(["success" => false, "message" => "All fields are required."]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO students (student_name, programme) VALUES (?, ?)");
$stmt->bind_param("ss", $student_name, $programme);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Student added successfully!", "student_id" => $stmt->insert_id]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to add student."]);
}

$stmt->close();
$conn->close();
?>
