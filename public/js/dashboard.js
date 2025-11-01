$(function(){
  const token = localStorage.getItem('token');
  if (!token) { location.href = '/'; return; }

  // navigation
  $('.sidebar a').click(function(e){
    if ($(this).attr('id') === 'logout') { localStorage.removeItem('token'); location.href='/'; return; }
    e.preventDefault();
    const target = $(this).attr('href').substring(1);
    $('.sidebar li').removeClass('active');
    $(this).parent().addClass('active');
    $('.section').removeClass('active');
    $(`#${target}`).addClass('active');
    if (target === 'events') loadEvents();
    if (target === 'registered') loadRegistered();
    if (target === 'profile') loadProfile();
  });

  function api(url, method='GET', data) {
    return $.ajax({
      url,
      method,
      contentType: 'application/json',
      data: data ? JSON.stringify(data) : undefined,
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // load events
  function loadEvents(){
    api('/api/events').done(events => {
      const grid = $('.events-grid').empty();
      events.forEach(ev => {
        const isPast = new Date(ev.date) < new Date();
        const card = $(`
          <div class="event-card">
            <h3>${ev.title}</h3>
            <p class="muted">${ev.description}</p>
            <p><strong>Date:</strong> ${new Date(ev.date).toLocaleString()}</p>
            <p><strong>Venue:</strong> ${ev.venue}</p>
            <div class="card-actions"></div>
          </div>
        `);
        const actions = card.find('.card-actions');
        if (!isPast) {
          actions.append(`<button class="register-btn" data-id="${ev._id}">Register</button>`);
        } else {
          actions.append(`<button disabled>Event Passed</button>`);
        }
        grid.append(card);
      });
    }).fail(err => { console.error(err); alert('Unable to load events'); });
  }

  // register click
  $(document).on('click', '.register-btn', function(){
    const id = $(this).data('id');
    api(`/api/events/${id}/register`, 'POST').done(res => {
      alert(res.message || 'Registered');
      loadRegistered();
    }).fail(err => {
      const msg = err.responseJSON && err.responseJSON.message ? err.responseJSON.message : 'Registration failed';
      alert(msg);
    });
  });

  // load registrations (my events)
  function loadRegistered(){
    // fetch all events and filter ones where current user is registered (server returns events with registrations array of ids)
    $.when(api('/api/auth/me'), api('/api/events')).done((userRes, eventsRes) => {
      const user = userRes[0];
      const events = eventsRes[0];
      const list = $('.registered-events').empty();
      const items = events.filter(ev => (ev.registrations || []).map(String).includes(String(user._id)));
      if (!items.length) { list.append('<p>No registrations yet.</p>'); return; }
      items.forEach(ev => {
        const attendanceEntry = (ev.attendance||[]).find(a => String(a.student) === String(user._id));
        const status = attendanceEntry ? attendanceEntry.status : 'Not marked';
        const el = $(`
          <div class="event-card">
            <h3>${ev.title}</h3>
            <p>${ev.description}</p>
            <p><strong>Date:</strong> ${new Date(ev.date).toLocaleString()}</p>
            <p><strong>Attendance:</strong> ${status}</p>
          </div>
        `);
        list.append(el);
      });
    }).fail(err => { console.error(err); alert('Unable to load registrations'); });
  }

  // profile
  function loadProfile(){
    api('/api/auth/me').done(user => {
      const f = $('#profileForm');
      f.find('[name="name"]').val(user.name || '');
      f.find('[name="email"]').val(user.email || '');
      f.find('[name="department"]').val(user.department || '');
      f.find('[name="year"]').val(user.year || '');
      f.find('[name="semester"]').val(user.semester || '');
      f.find('[name="rollNumber"]').val(user.rollNumber || '');
      f.find('[name="phone"]').val(user.phone || '');
      f.find('[name="password"]').val('');
    }).fail(() => { alert('Unable to load profile'); });
  }

  // update profile (patch)
  $('#profileForm').submit(function(e){
    e.preventDefault();
    const name = $(this).find('[name="name"]').val().trim();
    const department = $(this).find('[name="department"]').val().trim();
    const year = $(this).find('[name="year"]').val();
    const semester = $(this).find('[name="semester"]').val();
    const rollNumber = $(this).find('[name="rollNumber"]').val().trim();
    const phone = $(this).find('[name="phone"]').val().trim();
    const password = $(this).find('[name="password"]').val();

    const payload = { name, department, year: year ? Number(year) : undefined, semester: semester ? Number(semester) : undefined, rollNumber, phone };
    if (password) payload.password = password;

    $.ajax({
      url: '/api/users/me',
      method: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${token}` }
    }).done(res => {
      alert('Profile updated');
      loadProfile();
    }).fail(err => {
      console.error(err);
      alert('Unable to update profile');
    });
  });

  // initial load
  loadEvents();
});