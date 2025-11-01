<?php
// Database connection
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get event data from POST request
    $title = $_POST['title'];
    $description = $_POST['description'];
    $date = $_POST['date'];
    $venue = $_POST['venue'];
    $coordinator = $_POST['coordinator'];

    // Validate input
    if (empty($title) || empty($date) || empty($venue) || empty($coordinator)) {
        echo json_encode(['status' => 'error', 'message' => 'All fields are required.']);
        exit;
    }

    // Prepare SQL statement
    $stmt = $conn->prepare("INSERT INTO events (title, description, date, venue, coordinator) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $title, $description, $date, $venue, $coordinator);

    // Execute and check for success
    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Event created successfully.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to create event.']);
    }

    // Close statement and connection
    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
?>