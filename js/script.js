// This file contains the main JavaScript functionality for the application, handling user interactions and AJAX requests.

$(document).ready(function() {
    // Handle student login
    $('#studentLoginForm').on('submit', function(e) {
        e.preventDefault();
        const email = $('#studentEmail').val();
        if (validateEmail(email)) {
            $.ajax({
                type: 'POST',
                url: 'backend/php/login.php',
                data: $(this).serialize(),
                success: function(response) {
                    if (response.success) {
                        window.location.href = 'student/home.html';
                    } else {
                        alert(response.message);
                    }
                }
            });
        } else {
            alert('Please enter a valid MLRIT email address.');
        }
    });

    // Handle admin login
    $('#adminLoginForm').on('submit', function(e) {
        e.preventDefault();
        $.ajax({
            type: 'POST',
            url: 'backend/php/login.php',
            data: $(this).serialize(),
            success: function(response) {
                if (response.success) {
                    window.location.href = 'admin/dashboard.html';
                } else {
                    alert(response.message);
                }
            }
        });
    });

    // Event registration
    $('.register-button').on('click', function() {
        const eventId = $(this).data('event-id');
        $.ajax({
            type: 'POST',
            url: 'backend/php/register_event.php',
            data: { event_id: eventId },
            success: function(response) {
                if (response.success) {
                    alert('Successfully registered for the event!');
                } else {
                    alert(response.message);
                }
            }
        });
    });

    // Validate email function
    function validateEmail(email) {
        const regex = /^[a-zA-Z0-9._%+-]+@mlrit\.ac\.in$/;
        return regex.test(email);
    }
});