$(document).ready(function() {
    // Tab switching
    $('.tab-btn').click(function() {
        $('.tab-btn').removeClass('active');
        $(this).addClass('active');
        
        const tabId = $(this).data('tab');
        $('.login-form').addClass('hidden');
        $(`#${tabId}Login`).removeClass('hidden');
    });

    // Student login form
    $('#studentForm').submit(function(e) {
        e.preventDefault();
        const email = $(this).find('input[type="email"]').val();
        
        // Validate MLRIT domain
        if (!email.endsWith('@mlrit.ac.in')) {
            alert('Please use your MLRIT email address');
            return;
        }

        // TODO: Add API call for login
        console.log('Student login:', email);
    });

    // Admin login form
    $('#adminForm').submit(function(e) {
        e.preventDefault();
        const username = $(this).find('input[type="text"]').val();
        
        // TODO: Add API call for admin login
        console.log('Admin login:', username);
    });
});