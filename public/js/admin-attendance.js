$(function(){
  const token = localStorage.getItem('token');
  if (!token) { location.href = '/'; return; }

  $('#logout').click(function(e){ e.preventDefault(); localStorage.removeItem('token'); location.href='/'; });

  function api(url, method='GET', data){ return $.ajax({ url, method, contentType:'application/json', data: data?JSON.stringify(data):undefined, headers:{ Authorization:`Bearer ${token}` } }); }
  function escapeHtml(s){ return (s||'').toString().replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }

  function loadEventsList(){
    api('/api/events').done(events=>{
      const container = $('#attendanceList').empty();
      events.forEach(ev=>{
        const el = $(`
          <div class="panel" style="margin-bottom:12px; padding:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div><strong>${escapeHtml(ev.title)}</strong><div class="muted">${new Date(ev.date).toLocaleString()}</div></div>
              <div><a class="btn primary" href="/pages/admin/attendance.html?event=${ev._id}">Manage</a></div>
            </div>
          </div>`);
        container.append(el);
      });
    }).fail(()=>alert('Unable to load events'));
  }

  function loadRegistrations(eventId){
    api(`/api/events/${eventId}/registrations`).done(res=>{
      $('#eventsPanel').hide();
      $('#attendancePanel').show();
      $('#attendanceTitle').text(`Registrations for ${res.event.title}`);
      const area = $('#attendanceArea').empty();
      if (!res.registrations.length) { area.append('<p class="muted">No registrations yet.</p>'); return; }
      const list = $('<div>').addClass('attendance-list');
      res.registrations.forEach(r=>{
        const item = $(`
          <div class="attendance-item">
            <div class="meta"><div class="name">${escapeHtml(r.name||r.email)}</div><div class="muted">${escapeHtml(r.email)}</div></div>
            <div><select class="attendance-select" data-event="${eventId}" data-student="${r._id}">
              <option value="Present" ${r.attendance==='Present'?'selected':''}>Present</option>
              <option value="Absent" ${r.attendance==='Absent'?'selected':''}>Absent</option>
            </select></div>
          </div>`);
        list.append(item);
      });
      area.append(list);
    }).fail(err=>{ console.error(err); alert('Unable to load registrations'); });
  }

  // attendance change
  $(document).on('change','.attendance-select', function(){
    const eventId = $(this).data('event');
    const studentId = $(this).data('student');
    const status = $(this).val();
    api(`/api/events/${eventId}/attendance`,'POST',{ studentId, status }).done(()=>{ showTempMessage('Attendance updated',1200); }).fail(()=>alert('Failed to update'));
  });

  // show back button click hides panel
  // parse query param
  const params = new URLSearchParams(location.search);
  const eventId = params.get('event');
  if (eventId) {
    loadRegistrations(eventId);
  } else {
    loadEventsList();
  }

  function showTempMessage(m, ms=1200){ const el = $('<div>').text(m).css({position:'fixed',right:20,bottom:20,background:'rgba(0,0,0,0.6)',color:'#fff',padding:'10px 14px',borderRadius:8,zIndex:9999}).appendTo('body'); setTimeout(()=>el.fadeOut(300,()=>el.remove()),ms); }
});