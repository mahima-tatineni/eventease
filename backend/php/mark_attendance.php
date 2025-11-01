<?php
// mark_attendance.php

// Include database connection
include 'db.php';

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get the event ID and student ID from the POST request
    $event_id = $_POST['event_id'];
    $student_id = $_POST['student_id'];
    $attendance_status = $_POST['attendance']; // 'Present' or 'Absent'

    // Validate input
    if (!empty($event_id) && !empty($student_id) && in_array($attendance_status, ['Present', 'Absent'])) {
        // Prepare SQL statement to update attendance
        $stmt = $conn->prepare("UPDATE registrations SET attendance = ? WHERE event_id = ? AND student_id = ?");
        $stmt->bind_param("sii", $attendance_status, $event_id, $student_id);

        // Execute the statement
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Attendance marked successfully.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error marking attendance.']);
        }

        // Close the statement
        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid input.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}

// Close the database connection
$conn->close();
?>