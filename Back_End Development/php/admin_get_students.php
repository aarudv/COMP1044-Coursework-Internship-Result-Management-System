<?php
// fetches all students for the admin table
header('Content-Type: application/json');
require_once 'db_connect.php';
require_once 'check_session.php';

$result = $conn->query("SELECT student_id, student_name, programme FROM students ORDER BY student_id ASC");
$students = [];
while ($row = $result->fetch_assoc()) {
    $students[] = $row;
}

echo json_encode(["success" => true, "students" => $students]);
$conn->close();
?>
