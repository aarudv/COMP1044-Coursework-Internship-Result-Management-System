<?php
// lets the user change their password from the profile page
header('Content-Type: application/json');
require_once 'db_connect.php';
require_once 'check_session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request."]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$current_password = trim($input['current_password'] ?? '');
$new_password = trim($input['new_password'] ?? '');
$confirm_password = trim($input['confirm_password'] ?? '');
$user_id = $_SESSION['user_id'];

if (empty($current_password) || empty($new_password) || empty($confirm_password)) {
    echo json_encode(["success" => false, "message" => "All fields are required."]);
    exit;
}

if ($new_password !== $confirm_password) {
    echo json_encode(["success" => false, "message" => "New passwords do not match."]);
    exit;
}

if (strlen($new_password) < 6) {
    echo json_encode(["success" => false, "message" => "Password must be at least 6 characters."]);
    exit;
}

// check if their current password is right
$stmt = $conn->prepare("SELECT password FROM users WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

if ($row['password'] !== $current_password) {
    echo json_encode(["success" => false, "message" => "Current password is incorrect."]);
    exit;
}

// update it
$update = $conn->prepare("UPDATE users SET password = ? WHERE user_id = ?");
$update->bind_param("si", $new_password, $user_id);

if ($update->execute()) {
    echo json_encode(["success" => true, "message" => "Password changed successfully!"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to change password."]);
}

$update->close();
$conn->close();
?>
