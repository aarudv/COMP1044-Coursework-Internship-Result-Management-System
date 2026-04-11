<?php
// handles the login form - checks username and password against the database
header('Content-Type: application/json');
require_once 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$username = trim($input['username'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($username) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Please fill in both fields."]);
    exit;
}

// look up the user
$stmt = $conn->prepare("SELECT user_id, username, password, role FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    if ($password === $user['password']) {
        // save their info in the session
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['logged_in'] = true;

        // if theyre an assessor, grab their assessor details too
        if ($user['role'] === 'assessor') {
            $s2 = $conn->prepare("SELECT assessor_id, assessor_name FROM assessors WHERE user_id = ?");
            $s2->bind_param("i", $user['user_id']);
            $s2->execute();
            $aRow = $s2->get_result()->fetch_assoc();
            if ($aRow) {
                $_SESSION['assessor_id'] = $aRow['assessor_id'];
                $_SESSION['assessor_name'] = $aRow['assessor_name'];
            }
            $s2->close();
        }

        // send them to the right dashboard
        $redirect = ($user['role'] === 'admin') ? 'admin_dashboard.php' : 'assessor_dashboard.php';
        echo json_encode(["success" => true, "message" => "Login successful!", "role" => $user['role'], "redirect" => $redirect]);
    } else {
        echo json_encode(["success" => false, "message" => "Incorrect password."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "User not found."]);
}

$stmt->close();
$conn->close();
?>
