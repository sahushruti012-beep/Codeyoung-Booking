import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, Globe2, GraduationCap, ShieldCheck, Users, CheckCircle2, AlertCircle, ArrowRight, Video, Sparkles } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
const zones = [
  ['America/New_York', 'United States — Eastern'],
  ['America/Chicago', 'United States — Central'],
  ['America/Denver', 'United States — Mountain'],
  ['America/Los_Angeles', 'United States — Pacific'],
  ['Europe/London', 'United Kingdom — London'],
  ['Asia/Kolkata', 'India — Kolkata']
];
const localDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
function prettyUtc(value, zone) {
  try { return new Intl.DateTimeFormat('en-US', { timeZone: zone, dateStyle: 'medium', timeStyle: 'short', timeZoneName: 'short' }).format(new Date(value)); }
  catch { return value; }
}
async function request(path, options) {
  const response = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || body.message || 'Something went wrong. Please try again.');
  return body;
}
function App() {
  const [page, setPage] = useState('book');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [zone, setZone] = useState('America/New_York');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [booking, setBooking] = useState(null);
  const [rows, setRows] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [mentorId, setMentorId] = useState('1');
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const minDate = localDate();
  useEffect(() => { request('/mentors').then(setMentors).catch(() => {}); }, []);
  useEffect(() => {
    if (!date) { setSlots([]); setSlot(''); return; }
    let alive = true;
    setLoadingSlots(true); setNotice(null); setSlot('');
    request(`/slots?date=${encodeURIComponent(date)}&timeZone=${encodeURIComponent(zone)}`)
      .then(data => { if (alive) setSlots(data.slots || []); })
      .catch(err => { if (alive) setNotice({ type: 'error', text: err.message }); })
      .finally(() => { if (alive) setLoadingSlots(false); });
    return () => { alive = false; };
  }, [date, zone]);

  const selectedSlot = useMemo(() => slots.find(s => s.value === slot), [slots, slot]);
  async function submitBooking(event) {
    event.preventDefault();
    if (!slot) { setNotice({ type: 'error', text: 'Please choose a time slot before continuing.' }); return; }
    setSubmitting(true); setNotice(null);
    try {
      const result = await request('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          parentName, parentEmail, parentTimeZone: zone, startAt: slot,
          durationMinutes: 30
        })
      });
      setBooking(result.booking);
      setNotice({ type: 'success', text: 'Your trial class is confirmed. We have prepared notifications for you and your mentor.' });
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    } finally { setSubmitting(false); }
  }

  async function loadDashboard(which) {
    setPage(which); setDashboardLoading(true); setNotice(null);
    try {
      const endpoint = which === 'admin' ? '/bookings?role=admin' : `/bookings?role=mentor&mentorId=${encodeURIComponent(mentorId)}`;
      setRows(await request(endpoint));
    } catch (err) { setNotice({ type: 'error', text: `${err.message} Check that the backend and MongoDB connection are working.` }); setRows([]); }
    finally { setDashboardLoading(false); }
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" onClick={e => { e.preventDefault(); setPage('book'); setBooking(null); }}>
        <span className="brand-mark"><GraduationCap size={23}/></span>
        <span>codeyoung<span className="brand-dot">.</span><small>TRIAL CLASS EXPERIENCE</small></span>
      </a>
      <nav className="nav-tabs">
        <button className={page==='book'?'active':''} onClick={() => setPage('book')}>Book a trial</button>
        <button className={page==='mentor'?'active':''} onClick={() => loadDashboard('mentor')}>Mentor view</button>
        <button className={page==='admin'?'active':''} onClick={() => loadDashboard('admin')}>Admin</button>
      </nav>
      <div className="secure-label"><ShieldCheck size={15}/> Safe & simple</div>
    </header>

    <main>
      {page === 'book' && !booking && <>
        <section className="hero">
          <div className="eyebrow"><Sparkles size={14}/> YOUR CHILD'S NEXT BIG DISCOVERY</div>
          <h1>Big ideas start<br/><span>with one class.</span></h1>
          <p>Meet an inspiring mentor and experience learning that feels personal, playful, and made for your child.</p>
          <div className="hero-points"><span><CheckCircle2 size={16}/> Free trial session</span><span><CheckCircle2 size={16}/> 1:1 with a mentor</span><span><CheckCircle2 size={16}/> 30 minutes</span></div>
          <div className="hero-orbit orbit-one"></div><div className="hero-orbit orbit-two"></div>
          <div className="hero-art"><div className="art-sun"></div><div className="art-card"><span>LET'S LEARN</span><div className="art-squiggle">↗</div><div className="art-lines"></div><div className="art-stars">✦ ✧ ✦</div></div><div className="art-planet">✳</div><div className="art-caption">Curiosity looks good on you.</div></div>
        </section>

        <section className="booking-layout">
          <div className="booking-intro"><div className="step-tag">YOUR FIRST STEP</div><h2>Find your child's<br/>perfect time.</h2><p>Choose a time that works for your family. We'll match you with an available mentor.</p>
            <div className="promise"><div className="promise-icon"><Clock3 size={19}/></div><div><strong>Fits your schedule</strong><span>Times shown in your local time zone.</span></div></div>
            <div className="promise"><div className="promise-icon"><Users size={19}/></div><div><strong>A mentor picked for you</strong><span>We find the next available mentor.</span></div></div>
            <div className="promise"><div className="promise-icon"><Video size={19}/></div><div><strong>Join from anywhere</strong><span>Your class link arrives after booking.</span></div></div>
          </div>

          <form className="booking-card" onSubmit={submitBooking}>
            <div className="card-heading"><div><span className="card-kicker">LET'S GET YOU BOOKED</span><h3>Book a free trial</h3></div><div className="calendar-icon"><CalendarDays size={22}/></div></div>
            <div className="field"><label htmlFor="parentName">Parent's full name</label><input id="parentName" value={parentName} onChange={e=>setParentName(e.target.value)} placeholder="e.g. Alex Johnson" minLength="2" maxLength="120" required/></div>
            <div className="field"><label htmlFor="parentEmail">Email address</label><input id="parentEmail" type="email" value={parentEmail} onChange={e=>setParentEmail(e.target.value)} placeholder="you@example.com" required/></div>
            <div className="field"><label htmlFor="zone">Your time zone</label><div className="input-icon"><Globe2 size={17}/><select id="zone" value={zone} onChange={e=>setZone(e.target.value)}>{zones.map(z=><option key={z[0]} value={z[0]}>{z[1]}</option>)}</select></div><small>We'll send all class times in your selected zone.</small></div>
            <div className="field"><label htmlFor="date">Choose a date</label><div className="input-icon"><CalendarDays size={17}/><input id="date" type="date" min={minDate} value={date} onChange={e=>setDate(e.target.value)} required/></div></div>
            <div className="field"><div className="label-row"><label>Available times</label>{date && <span className="timezone-note">{zone.split('/').pop().replaceAll('_',' ')}</span>}</div>
              {!date ? <div className="empty-slots">Choose a date to see available times.</div> : loadingSlots ? <div className="empty-slots">Finding times…</div> : slots.length===0 ? <div className="empty-slots">No future slots on this date. Try another date.</div> :
              <div className="slot-grid">{slots.map(s=><button type="button" key={s.value} className={`slot ${slot===s.value?'selected':''}`} onClick={()=>setSlot(s.value)}>{s.label}</button>)}</div>}
            </div>
            {notice && <div className={`notice ${notice.type}`}><AlertCircle size={17}/><span>{notice.text}</span></div>}
            <button className="submit-btn" type="submit" disabled={submitting || loadingSlots}>{submitting?'Confirming your class…':<>Confirm trial class <ArrowRight size={17}/></>}</button>
            <p className="form-footnote"><ShieldCheck size={14}/> No payment needed. Just bring your curiosity.</p>
          </form>
        </section>
      </>}

      {page==='book' && booking && <section className="confirmation">
        <div className="confirmation-icon"><CheckCircle2 size={34}/></div><div className="eyebrow">YOU'RE ALL SET</div><h1>Your trial class<br/><span>is confirmed!</span></h1><p>Thanks, {booking.parentName}. We've matched you with a mentor and prepared email notifications.</p>
        <div className="confirmation-card">
          <div className="confirm-row"><span>YOUR CLASS</span><strong>{prettyUtc(booking.startAtUtc, booking.parentTimeZone)}</strong></div>
          <div className="confirm-row"><span>YOUR MENTOR</span><strong>{booking.mentor.name}</strong></div>
          <div className="confirm-row"><span>MENTOR'S LOCAL TIME</span><strong>{prettyUtc(booking.startAtUtc, booking.mentor.timeZone)}</strong></div>
          <a className="class-link" href={booking.classLink} target="_blank" rel="noreferrer"><Video size={18}/> Open demo class link <ArrowRight size={16}/></a>
          <small>This is a dummy demo link for the assignment.</small>
        </div>
        <button className="submit-btn new-booking" onClick={()=>{setBooking(null);setNotice(null);setParentName('');setParentEmail('');setDate('');setSlot('');}}>Book another trial <ArrowRight size={17}/></button>
      </section>}

      {(page==='admin' || page==='mentor') && <section className="dashboard">
        <div className="dashboard-heading"><div><div className="step-tag">{page==='admin'?'OPERATIONS':'MENTOR SPACE'}</div><h1>{page==='admin'?'Booking overview':'Your trial classes'}</h1><p>{page==='admin'?'Monitor bookings and assigned mentors.':'Review the bookings assigned to a mentor.'}</p></div><div className="dashboard-icon">{page==='admin'?<ShieldCheck size={24}/>:<Users size={24}/>}</div></div>
        {page==='mentor' && <div className="mentor-filter"><label htmlFor="mentorId">Demo mentor</label><select id="mentorId" value={mentorId} onChange={e=>setMentorId(e.target.value)}>{mentors.map(m=><option key={m.id} value={m.id}>{m.name} — {m.timeZone}</option>)}</select><button onClick={()=>loadDashboard('mentor')}>Load bookings</button></div>}
        {notice && <div className={`notice ${notice.type}`}><AlertCircle size={17}/><span>{notice.text}</span></div>}
        <div className="dashboard-stats"><div><span>TOTAL BOOKINGS SHOWN</span><strong>{rows.length}</strong></div><div><span>ACTIVE MENTORS</span><strong>{mentors.length || 10}</strong></div><div><span>CLASS LENGTH</span><strong>30 min</strong></div></div>
        {dashboardLoading ? <div className="empty-dashboard">Loading bookings…</div> : rows.length===0 ? <div className="empty-dashboard"><CalendarDays size={28}/><strong>No bookings to show yet</strong><span>Confirmed trial classes will appear here.</span></div> :
          <div className="table-wrap"><table><thead><tr><th>Parent</th><th>Mentor</th><th>Parent local time</th><th>Mentor local time</th><th>Class link</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><strong>{r.parentName}</strong><small>{r.parentEmail}</small></td><td>{r.mentorName}</td><td>{prettyUtc(r.startAtUtc, r.parentTimeZone)}<small>{r.parentTimeZone}</small></td><td>{prettyUtc(r.startAtUtc, r.mentorTimeZone)}<small>{r.mentorTimeZone}</small></td><td><a href={r.classLink} target="_blank" rel="noreferrer">Open link ↗</a></td></tr>)}</tbody></table></div>}
      </section>}
    </main>
    <footer><div className="footer-brand"><GraduationCap size={18}/> codeyoung<span>.</span></div><span>Curiosity opens doors. One class at a time.</span><span>© 2026 Codeyoung Trial Experience</span></footer>
  </div>;
}
export default App;
