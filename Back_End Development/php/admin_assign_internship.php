<?php
// assigns a student to an assessor at a company
header('Content-Type: application/json');
require_once 'db_connect.php';
require_once 'check_session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request."]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$student_id = intval($input['student_id'] ?? 0);
$assessor_id = intval($input['assessor_id'] ?? 0);
$company_name = trim($input['company_name'] ?? '');

if ($student_id <= 0 || $assessor_id <= 0 || empty($company_name)) {
    echo json_encode(["success" => false, "message" => "All fields are required."]);
    exit;
}

// check if this student already has an internship
$check = $conn->prepare("SELECT internship_id FROM internships WHERE student_id = ?");
$check->bind_param("i", $student_id);
$check->execute();
if ($check->get_result()->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "This student already has an internship assigned."]);
    $check->close();
    exit;
}
$check->close();

$stmt = $conn->prepare("INSERT INTO internships (student_id, assessor_id, company_name) VALUES (?, ?, ?)");
$stmt->bind_param("iis", $student_id, $assessor_id, $company_name);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Internship assigned successfully!"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to assign internship."]);
}

$stmt->close();
$conn->close();
?>
