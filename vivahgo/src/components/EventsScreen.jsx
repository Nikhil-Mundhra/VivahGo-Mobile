import { useState } from "react";
import { EVENT_COLORS } from "../constants";

function EventsScreen({ events, setEvents }) {
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", emoji: "✨", date: "", time: "", venue: "", status: "upcoming", note: "" });

  function save() {
    setEvents(evs=>evs.map(e=>e.id===editing.id?editing:e));
    setEditing(null);
  }

  function addEvent() {
    if (!form.name.trim()) {
      return;
    }

    setEvents(evs => [
      ...evs,
      {
        ...form,
        id: Date.now(),
        colorIdx: evs.length % EVENT_COLORS.length,
      },
    ]);
    setForm({ name: "", emoji: "✨", date: "", time: "", venue: "", status: "upcoming", note: "" });
    setShowAdd(false);
  }

  return (
    <div>
      <div className="section-head">
        <div className="section-title">Wedding Ceremonies</div>
        <button className="section-action" onClick={() => setShowAdd(true)}>+ Add</button>
      </div>
      {events.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "28px 20px" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📅</div>
          <div className="card-title" style={{ marginBottom: 8 }}>No ceremonies yet</div>
          <div className="card-sub" style={{ marginBottom: 16 }}>Add your first event to start building the wedding timeline.</div>
          <button className="btn-primary" style={{ width: "auto", padding: "10px 22px", marginTop: 0 }} onClick={() => setShowAdd(true)}>
            Add Ceremony
          </button>
        </div>
      ) : (
        <div className="event-grid">
          {events.map(ev=>(
            <div key={ev.id} className="event-card"
              style={{background:`linear-gradient(150deg, ${EVENT_COLORS[ev.colorIdx % EVENT_COLORS.length][0]}, ${EVENT_COLORS[ev.colorIdx % EVENT_COLORS.length][1]})`}}
              onClick={()=>setEditing({...ev})}>
              <div>
                <div className="event-emoji">{ev.emoji}</div>
                <div className="event-name">{ev.name}</div>
                <div className="event-date">{ev.date||"Date not set"}</div>
              </div>
              <div>
                <div className="event-status">{ev.status}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.65)",marginTop:4}}>{ev.venue||"Venue TBD"}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="fab" onClick={() => setShowAdd(true)}>+</button>

      {editing && (
        <div className="modal-overlay" onClick={()=>setEditing(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-handle"/>
            <div className="modal-title">{editing.emoji} {editing.name}</div>
            <div className="input-group">
              <div className="input-label">Date</div>
              <input className="input-field" value={editing.date} onChange={e=>setEditing({...editing,date:e.target.value})} placeholder="e.g. 25 Nov 2025"/>
            </div>
            <div className="input-group">
              <div className="input-label">Time</div>
              <input className="input-field" value={editing.time} onChange={e=>setEditing({...editing,time:e.target.value})} placeholder="e.g. 10:00 AM"/>
            </div>
            <div className="input-group">
              <div className="input-label">Venue</div>
              <input className="input-field" value={editing.venue} onChange={e=>setEditing({...editing,venue:e.target.value})} placeholder="Enter venue name"/>
            </div>
            <div className="input-group">
              <div className="input-label">Status</div>
              <select className="select-field" value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value})}>
                <option value="upcoming">Upcoming</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="input-group">
              <div className="input-label">Notes</div>
              <input className="input-field" value={editing.note} onChange={e=>setEditing({...editing,note:e.target.value})} placeholder="Any special notes..."/>
            </div>
            <button className="btn-primary" onClick={save}>Save Ceremony Details</button>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle"/>
            <div className="modal-title">Add Ceremony ✨</div>
            <div className="input-group">
              <div className="input-label">Name</div>
              <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Engagement" />
            </div>
            <div className="input-group">
              <div className="input-label">Emoji</div>
              <input className="input-field" value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value || '✨' })} placeholder="e.g. 💍" />
            </div>
            <div className="input-group">
              <div className="input-label">Date</div>
              <input className="input-field" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} placeholder="e.g. 24 Nov 2027" />
            </div>
            <div className="input-group">
              <div className="input-label">Time</div>
              <input className="input-field" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} placeholder="e.g. 6:00 PM" />
            </div>
            <div className="input-group">
              <div className="input-label">Venue</div>
              <input className="input-field" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="Enter venue" />
            </div>
            <div className="input-group">
              <div className="input-label">Status</div>
              <select className="select-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="upcoming">Upcoming</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="input-group">
              <div className="input-label">Notes</div>
              <input className="input-field" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Special notes" />
            </div>
            <button className="btn-primary" onClick={addEvent}>Add Ceremony</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventsScreen;