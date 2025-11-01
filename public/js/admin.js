$(document).ready(function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }

    // Navigation
    $('.sidebar a').click(function(e) {
        if ($(this).attr('id') === 'logout') {
            localStorage.removeItem('token');
            window.location.href = '/';
            return;
        }

        e.preventDefault();
        const target = $(this).attr('href').substring(1);
        
        $('.sidebar li').removeClass('active');
        $(this).parent().addClass('active');
        
        $('.section').removeClass('active');
        $(`#${target}`).addClass('active');

        if (target === 'manage') {
            loadEvents();
        } else if (target === 'attendance') {
            loadAttendance();
        }
    });

    // Create Event Form
    $('#createEventForm').submit(function(e) {
        e.preventDefault();
        const formData = {
            title: $('[name="title"]').val(),
            description: $('[name="description"]').val(),
            date: $('[name="date"]').val(),
            venue: $('[name="venue"]').val(),
            coordinator: $('[name="coordinator"]').val()
        };

        $.ajax({
            url: '/api/events',
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            data: formData,
            success: function(response) {
                alert('Event created successfully!');
                $('#createEventForm')[0].reset();
            },
            error: function(err) {
                alert('Error creating event');
            }
        });
    });

    // Load Events
    function loadEvents() {
        $.ajax({
            url: '/api/events',
            headers: { 'Authorization': `Bearer ${token}` },
            success: function(events) {
                const table = $('<table>').addClass('events-table');
                table.html(`
                    <tr>
                        <th>Title</th>
                        <th>Date</th>
                        <th>Venue</th>
                        <th>Registrations</th>
                        <th>Actions</th>
                    </tr>
                `);

                events.forEach(event => {
                    table.append(`
                        <tr>
                            <td>${event.title}</td>
                            <td>${new Date(event.date).toLocaleDateString()}</td>
                            <td>${event.venue}</td>
                            <td>${event.registrations.length}</td>
                            <td>
                                <button onclick="viewRegistrations('${event._id}')">View</button>
                                <button onclick="deleteEvent('${event._id}')">Delete</button>
                            </td>
                        </tr>
                    `);
                });

                $('.events-table').html(table);
            }
        });
    }

    // Initial load
    loadEvents();
});