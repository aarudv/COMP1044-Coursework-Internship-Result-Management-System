<?php
// updates an assessor's name and email
header('Content-Type: application/json');
require_once 'db_connect.php';
require_once 'check_session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request."]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$assessor_id = intval($input['assessor_id'] ?? 0);
$assessor_name = trim($input['assessor_name'] ?? '');
$email = trim($input['email'] ?? '');

if ($assessor_id <= 0 || empty($assessor_name) || empty($email)) {
    echo json_encode(["success" => false, "message" => "All fields are required."]);
    exit;
}

$stmt = $conn->prepare("UPDATE assessors SET assessor_name = ?, email = ? WHERE assessor_id = ?");
$stmt->bind_param("ssi", $assessor_name, $email, $assessor_id);

if ($stmt->execute() && $stmt->affected_rows > 0) {
    echo json_encode(["success" => true, "message" => "Assessor updated successfully!"]);
} else {
    echo json_encode(["success" => false, "message" => "No changes made or assessor not found."]);
}

$stmt->close();
$conn->close();
?>
