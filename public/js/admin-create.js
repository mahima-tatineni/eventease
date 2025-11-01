// create-only script (keeps create logic separate)
$(function(){
  const token = localStorage.getItem('token');
  if (!token) { location.href = '/'; return; }

  $('#logout').click(function(e){ e.preventDefault(); localStorage.removeItem('token'); location.href='/'; });

  function api(url, method='GET', data){ return $.ajax({ url, method, contentType:'application/json', data: data?JSON.stringify(data):undefined, headers:{ Authorization:`Bearer ${token}` } }); }

  $('#createEventForm').submit(function(e){
    e.preventDefault();
    const data = { title: this.title.value.trim(), description: this.description.value.trim(), date: this.date.value, venue: this.venue.value.trim(), coordinator: this.coordinator.value.trim() };
    if (!data.title || !data.date) { alert('Provide title and date'); return; }
    api('/api/events','POST',data).done(()=>{ alert('Event created'); window.location.href = '/pages/admin/manage.html'; }).fail(err=>{ console.error(err); alert(err.responseJSON?.message || 'Create failed'); });
  });
});