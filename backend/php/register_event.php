<?php
// register_event.php

// Include database connection
include 'db.php';

// Start session
session_start();

// Check if the user is logged in
if (!isset($_SESSION['student_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized access']);
    exit();
}

// Get the event ID from the request
$event_id = isset($_POST['event_id']) ? intval($_POST['event_id']) : 0;
$student_id = $_SESSION['student_id'];

// Validate event ID
if ($event_id <= 0) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid event ID']);
    exit();
}

// Prepare SQL statement to register the student for the event
$stmt = $conn->prepare("INSERT INTO registrations (student_id, event_id) VALUES (?, ?)");
$stmt->bind_param("ii", $student_id, $event_id);

// Execute the statement
if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'Registration successful']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Registration failed']);
}

// Close the statement and connection
$stmt->close();
$conn->close();
?>