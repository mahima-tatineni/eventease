$(document).ready(function() {
    // Load user data
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

        if (target === 'events') {
            loadEvents();
        } else if (target === 'registered') {
            loadRegisteredEvents();
        } else if (target === 'profile') {
            loadProfile();
        }
    });

    // Load available events
    function loadEvents() {
        $.ajax({
            url: '/api/events',
            headers: { 'Authorization': `Bearer ${token}` },
            success: function(events) {
                const grid = $('.events-grid');
                grid.empty();

                events.forEach(event => {
                    const card = $(`
                        <div class="event-card">
                            <h3>${event.title}</h3>
                            <p>${event.description}</p>
                            <p>Date: ${new Date(event.date).toLocaleDateString()}</p>
                            <p>Venue: ${event.venue}</p>
                            <button class="register-btn" data-id="${event._id}">Register</button>
                        </div>
                    `);
                    grid.append(card);
                });
            }
        });
    }

    // Initial load
    loadEvents();
});