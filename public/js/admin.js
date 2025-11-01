$(function(){
  const token = localStorage.getItem('token');
  if (!token) { location.href = '/'; return; }

  // navigation handling
  $('.sidebar a').click(function(e){
    if ($(this).attr('id') === 'logout') {
      e.preventDefault();
      localStorage.removeItem('token');
      location.href = '/';
      return;
    }
    // allow anchors to be normal links but show/hide sections by href hash
    const href = $(this).attr('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = href.substring(1);
      $('.sidebar li').removeClass('active');
      $(this).parent().addClass('active');
      $('.panel').hide();
      $(`#${target}Panel`).show();
      if (target === 'manage') loadEvents();
      if (target === 'attendance') loadEventsForAttendance();
    }
  });

  function api(url, method='GET', data) {
    return $.ajax({
      url, method,
      contentType: 'application/json',
      data: data ? JSON.stringify(data) : undefined,
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // CREATE event
  $('#createEventForm').submit(function(e){
    e.preventDefault();
    const data = {
      title: this.title.value.trim(),
      description: this.description.value.trim(),
      date: this.date.value,
      venue: this.venue.value.trim(),
      coordinator: this.coordinator.value.trim()
    };
    if (!data.title || !data.date) { alert('Provide title and date'); return; }
    api('/api/events', 'POST', data).done(ev => {
      alert('Event created');
      this.reset();
      // switch to manage tab
      $('a[href="#manage"]').click();
    }).fail(err => {
      console.error(err);
      alert(err.responseJSON?.message || 'Create failed');
    });
  });

  // LOAD events for manage
  function loadEvents(){
    api('/api/events').done(events => {
      const table = $('<table>').addClass('events-table');
      table.append(`<thead><tr><th>Title</th><th>Date</th><th>Venue</th><th>Registrations</th><th>Actions</th></tr></thead>`);
      const body = $('<tbody>');
      events.forEach(ev => {
        const dateStr = new Date(ev.date).toLocaleString();
        const tr = $('<tr>');
        tr.append(`<td><strong>${escapeHtml(ev.title)}</strong><div class="muted">${escapeHtml(ev.coordinator || '')}</div></td>`);
        tr.append(`<td>${dateStr}</td>`);
        tr.append(`<td>${escapeHtml(ev.venue || '')}</td>`);
        tr.append(`<td>${(ev.registrations || []).length}</td>`);
        const actions = $(`
          <td>
            <button class="btn small primary view-regs" data-id="${ev._id}">View</button>
            <button class="btn small danger delete-ev" data-id="${ev._id}">Delete</button>
          </td>
        `);
        tr.append(actions);
        body.append(tr);
      });
      table.append(body);
      $('#eventsTable').empty().append(table);
    }).fail(err => {
      console.error(err);
      alert('Unable to load events');
    });
  }

  // load events for attendance panel (simple list)
  function loadEventsForAttendance(){
    api('/api/events').done(events => {
      const container = $('#attendanceList').empty();
      events.forEach(ev => {
        const el = $(`
          <div class="panel" style="margin-bottom:12px; padding:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong>${escapeHtml(ev.title)}</strong>
                <div class="muted">${new Date(ev.date).toLocaleString()}</div>
              </div>
              <div>
                <button class="btn primary view-regs" data-id="${ev._id}">Manage</button>
              </div>
            </div>
          </div>
        `);
        container.append(el);
      });
    }).fail(() => alert('Unable to load events'));
  }

  // view registrations (fills attendanceArea)
  $(document).on('click', '.view-regs', function(){
    const id = $(this).data('id');
    api(`/api/events/${id}/registrations`).done(res => {
      const area = $('#attendanceArea').empty();
      area.append(`<h3 class="h1">Registrations for ${escapeHtml(res.event.title)}</h3>`);
      if (!res.registrations || !res.registrations.length) {
        area.append('<p class="muted">No registrations yet.</p>');
        return;
      }
      const list = $('<div>').addClass('attendance-list');
      res.registrations.forEach(r => {
        const row = $(`
          <div class="attendance-item">
            <div class="meta">
              <div class="name">${escapeHtml(r.name || r.email)}</div>
              <div class="muted">${escapeHtml(r.email)}</div>
            </div>
            <div>
              <select class="attendance-select" data-event="${id}" data-student="${r._id}">
                <option value="Present" ${r.attendance==='Present'?'selected':''}>Present</option>
                <option value="Absent" ${r.attendance==='Absent'?'selected':''}>Absent</option>
              </select>
            </div>
          </div>
        `);
        list.append(row);
      });
      area.append(list);
    }).fail(err => { console.error(err); alert('Unable to load registrations'); });
  });

  // attendance select change
  $(document).on('change', '.attendance-select', function(){
    const eventId = $(this).data('event');
    const studentId = $(this).data('student');
    const status = $(this).val();
    api(`/api/events/${eventId}/attendance`, 'POST', { studentId, status }).done(() => {
      // small toast replacement
      showTempMessage('Attendance updated', 1500);
    }).fail(err => {
      console.error(err);
      alert(err.responseJSON?.message || 'Failed to update');
    });
  });

  // delete event
  $(document).on('click', '.delete-ev', function(){
    const id = $(this).data('id');
    if (!confirm('Delete this event? This cannot be undone.')) return;
    api(`/api/events/${id}`, 'DELETE').done(() => {
      showTempMessage('Event deleted', 1400);
      loadEvents();
    }).fail(err => {
      console.error(err);
      alert(err.responseJSON?.message || 'Delete failed');
    });
  });

  // util: small message
  function showTempMessage(msg, ms=1200){
    const el = $('<div>').text(msg).css({
      position:'fixed', right:20, bottom:20, background:'rgba(0,0,0,0.6)', color:'#fff',
      padding:'10px 14px', borderRadius:8, zIndex:9999, boxShadow:'0 8px 20px rgba(0,0,0,0.6)'
    }).appendTo('body');
    setTimeout(()=>el.fadeOut(300, ()=>el.remove()), ms);
  }

  // helper: basic escape
  function escapeHtml(s){ return (s||'').toString().replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }

  // initial: show create panel and ensure panels exist
  $('.panel').hide();
  $('#createPanel').show();

  // expose loadEvents to be called from nav
  loadEvents();
});