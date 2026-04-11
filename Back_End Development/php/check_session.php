<?php
// this file gets included at the top of every dashboard page
// if the user isnt logged in, kick them back to login

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    // if its an ajax request, send back json error
    if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
        header('Content-Type: application/json');
        echo json_encode(["success" => false, "message" => "Session expired. Please login again."]);
        exit;
    }
    header("Location: login.php");
    exit;
}
?>
