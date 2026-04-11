<?php
// creates a new assessor - this also makes a login account for them in the users table
header('Content-Type: application/json');
require_once 'db_connect.php';
require_once 'check_session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request."]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$assessor_name = trim($input['assessor_name'] ?? '');
$email = trim($input['email'] ?? '');

if (empty($assessor_name) || empty($email)) {
    echo json_encode(["success" => false, "message" => "All fields are required."]);
    exit;
}

// check if this email is already taken
$checkUser = $conn->prepare("SELECT user_id FROM users WHERE username = ?");
$checkUser->bind_param("s", $email);
$checkUser->execute();
if ($checkUser->get_result()->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "An account with this email already exists."]);
    $checkUser->close();
    exit;
}
$checkUser->close();

// first create their login account
$defaultPassword = "pass123";
$stmt1 = $conn->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, 'assessor')");
$stmt1->bind_param("ss", $email, $defaultPassword);

if (!$stmt1->execute()) {
    echo json_encode(["success" => false, "message" => "Failed to create user account."]);
    exit;
}
$newUserId = $stmt1->insert_id;
$stmt1->close();

// then create their assessor profile linked to that account
$stmt2 = $conn->prepare("INSERT INTO assessors (assessor_name, email, user_id) VALUES (?, ?, ?)");
$stmt2->bind_param("ssi", $assessor_name, $email, $newUserId);

if ($stmt2->execute()) {
    echo json_encode(["success" => true, "message" => "Assessor account created! Default password: pass123", "assessor_id" => $stmt2->insert_id]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to create assessor profile."]);
}

$stmt2->close();
$conn->close();
?>
