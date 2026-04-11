<?php
// saves the assessment marks into the database
header('Content-Type: application/json');
require_once 'db_connect.php';
require_once 'check_session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request."]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

$internship_id = intval($input['internship_id'] ?? 0);
$undertaking_tasks = intval($input['undertaking_tasks'] ?? 0);
$health_safety = intval($input['health_safety'] ?? 0);
$theoretical_knowledge = intval($input['theoretical_knowledge'] ?? 0);
$report_presentation = intval($input['report_presentation'] ?? 0);
$clarity_language = intval($input['clarity_language'] ?? 0);
$lifelong_learning = intval($input['lifelong_learning'] ?? 0);
$project_management = intval($input['project_management'] ?? 0);
$time_management = intval($input['time_management'] ?? 0);
$comments = trim($input['comments'] ?? '');

if ($internship_id <= 0) {
    echo json_encode(["success" => false, "message" => "Please select a student."]);
    exit;
}

// add up all the marks
$final_score = $undertaking_tasks + $health_safety + $theoretical_knowledge +
               $report_presentation + $clarity_language + $lifelong_learning +
               $project_management + $time_management;

// make sure this student hasnt already been assessed
$check = $conn->prepare("SELECT assessment_id FROM assessments WHERE internship_id = ?");
$check->bind_param("i", $internship_id);
$check->execute();
if ($check->get_result()->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Assessment already submitted for this student."]);
    $check->close();
    exit;
}
$check->close();

$stmt = $conn->prepare("
    INSERT INTO assessments
    (internship_id, undertaking_tasks, health_safety, theoretical_knowledge,
     report_presentation, clarity_language, lifelong_learning,
     project_management, time_management, comments, final_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");
$stmt->bind_param("iiiiiiiiiis",
    $internship_id, $undertaking_tasks, $health_safety, $theoretical_knowledge,
    $report_presentation, $clarity_language, $lifelong_learning,
    $project_management, $time_management, $comments, $final_score
);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Assessment submitted successfully!", "final_score" => $final_score]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to submit assessment."]);
}

$stmt->close();
$conn->close();
?>
