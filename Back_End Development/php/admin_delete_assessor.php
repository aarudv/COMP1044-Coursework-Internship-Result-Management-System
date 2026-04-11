<?php
// deletes an assessor and their login account (only if they have no students assigned)
header('Content-Type: application/json');
require_once 'db_connect.php';
require_once 'check_session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request."]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$assessor_id = intval($input['assessor_id'] ?? 0);

if ($assessor_id <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid assessor ID."]);
    exit;
}

// cant delete if they still have students
$check = $conn->prepare("SELECT COUNT(*) as count FROM internships WHERE assessor_id = ?");
$check->bind_param("i", $assessor_id);
$check->execute();
$hasInternships = $check->get_result()->fetch_assoc()['count'];
$check->close();

if ($hasInternships > 0) {
    echo json_encode(["success" => false, "message" => "Cannot delete: assessor has internship assignments. Remove those first."]);
    exit;
}

// grab their user_id so we can delete that too
$getUserId = $conn->prepare("SELECT user_id FROM assessors WHERE assessor_id = ?");
$getUserId->bind_param("i", $assessor_id);
$getUserId->execute();
$userRow = $getUserId->get_result()->fetch_assoc();
$getUserId->close();

$stmt = $conn->prepare("DELETE FROM assessors WHERE assessor_id = ?");
$stmt->bind_param("i", $assessor_id);
$stmt->execute();
$stmt->close();

// also remove their login account
if ($userRow && $userRow['user_id']) {
    $stmt2 = $conn->prepare("DELETE FROM users WHERE user_id = ?");
    $stmt2->bind_param("i", $userRow['user_id']);
    $stmt2->execute();
    $stmt2->close();
}

echo json_encode(["success" => true, "message" => "Assessor deleted successfully!"]);
$conn->close();
?>
