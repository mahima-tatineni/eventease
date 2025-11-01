$(function(){
  const token = localStorage.getItem('token');
  if (!token) { location.href = '/'; return; }
  $('#logout').click(function(e){ e.preventDefault(); localStorage.removeItem('token'); location.href='/'; });

  function api(url, method='GET', data){ return $.ajax({ url, method, contentType:'application/json', data: data?JSON.stringify(data):undefined, headers:{ Authorization:`Bearer ${token}` } }); }

  function escapeHtml(s){ return (s||'').toString().replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }

  function loadEvents(){
    api('/api/events').done(events=>{
      const table = $('<table>').addClass('events-table');
      table.append(`<thead><tr><th>Title</th><th>Date</th><th>Venue</th><th>Regs</th><th>Actions</th></tr></thead>`);
      const body = $('<tbody>');
      events.forEach(ev=>{
        const dateStr = new Date(ev.date).toLocaleString();
        const tr = $('<tr>');
        tr.append(`<td><strong>${escapeHtml(ev.title)}</strong><div class="muted">${escapeHtml(ev.coordinator||'')}</div></td>`);
        tr.append(`<td>${dateStr}</td>`);
        tr.append(`<td>${escapeHtml(ev.venue||'')}</td>`);
        tr.append(`<td>${(ev.registrations||[]).length}</td>`);
        const actions = $(`
          <td>
            <a class="btn small primary" href="/pages/admin/attendance.html?event=${ev._id}">Manage</a>
            <button class="btn small danger delete-ev" data-id="${ev._id}">Delete</button>
          </td>`);
        tr.append(actions);
        body.append(tr);
      });
      table.append(body);
      $('#eventsTable').empty().append(table);
    }).fail(err=>{ console.error(err); alert('Unable to load events'); });
  }

  $(document).on('click','.delete-ev', function(){
    if (!confirm('Delete this event?')) return;
    const id = $(this).data('id');
    api(`/api/events/${id}`,'DELETE').done(()=>{ alert('Deleted'); loadEvents(); }).fail(err=>{ console.error(err); alert('Delete failed'); });
  });

  loadEvents();
});