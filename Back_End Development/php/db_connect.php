<?php
// connects to the MySQL database using MAMP settings
$host = "localhost";
$username = "root";
$password = "root";
$database = "comp1044_database";

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]));
}

$conn->set_charset("utf8");

// start session so we can track who's logged in
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
