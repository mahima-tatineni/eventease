$(document).ready(function() {
    // Tab switching
    $('.tab-btn').click(function() {
        $('.tab-btn').removeClass('active');
        $(this).addClass('active');
        
        const tabId = $(this).data('tab');
        $('.login-form').addClass('hidden');
        if (tabId === 'student') {
            $('#studentLogin').removeClass('hidden');
        } else {
            $('#adminLogin').removeClass('hidden');
        }
    });

    // Switch login/signup
    $('#showSignup').click(function(e){ e.preventDefault(); $('#studentLogin').addClass('hidden'); $('#studentSignup').removeClass('hidden'); });
    $('#showLogin').click(function(e){ e.preventDefault(); $('#studentSignup').addClass('hidden'); $('#studentLogin').removeClass('hidden'); });

    // Helper: show server error
    function showError(jqXHR){
        const msg = jqXHR && jqXHR.responseJSON && jqXHR.responseJSON.message ? jqXHR.responseJSON.message : 'Request failed';
        alert(msg);
    }

    // Student login
    $('#studentForm').submit(function(e){
        e.preventDefault();
        const email = $('input[name="email"]').val().trim();
        const password = $('input[name="password"]').val();

        if (!email.endsWith('@mlrit.ac.in')) { alert('Please use your MLRIT email address'); return; }

        $.ajax({
            url: '/api/auth/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email, password }),
            success: function(res){
                localStorage.setItem('token', res.token);
                window.location.href = '/pages/student/dashboard.html';
            },
            error: function(err){ showError(err); console.error(err); }
        });
    });

    // Student signup -> auto-login on success
    $('#signupForm').submit(function(e){
        e.preventDefault();
        const name = $('input[name="name"]').val().trim();
        const email = $('input[name="email"]').val().trim();
        const password = $('input[name="password"]').val();
        const confirmPassword = $('input[name="confirmPassword"]').val();

        if (!email.endsWith('@mlrit.ac.in')) { alert('Use your MLRIT email'); return; }
        if (password !== confirmPassword) { alert('Passwords do not match'); return; }

        $.ajax({
            url: '/api/auth/signup',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ name, email, password }),
            success: function(res){
                // server returns token — store and redirect
                if (res.token) {
                    localStorage.setItem('token', res.token);
                    window.location.href = '/pages/student/dashboard.html';
                } else {
                    alert('Signup successful. Please login.');
                    $('#showLogin').click();
                }
            },
            error: function(err){ showError(err); console.error(err); }
        });
    });

    // Admin login (using same /login endpoint with admin email)
    $('#adminForm').submit(function(e){
        e.preventDefault();
        const username = $('input[name="username"]').val().trim();
        const password = $('input[name="password"]').val();

        // admin may login with email or username — try as email first
        let email = username;
        if (!username.includes('@')) {
            // if your admin users have username field stored, you can change endpoint; for now assume admin email
            alert('Admin login expects an email address. Use the admin email.');
            return;
        }

        $.ajax({
            url: '/api/auth/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email, password }),
            success: function(res){
                if (res.role !== 'admin') { alert('Admin access required'); return; }
                localStorage.setItem('token', res.token);
                window.location.href = '/pages/admin/dashboard.html';
            },
            error: function(err){ showError(err); console.error(err); }
        });
    });
});