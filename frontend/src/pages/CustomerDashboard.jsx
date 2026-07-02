import { useState, useEffect } from 'react';
import api from '../api/axios';

const TIME_SLOTS = [
  '12:00-13:00',
  '13:00-14:00',
  '14:00-15:00',
  '19:00-20:00',
  '20:00-21:00',
  '21:00-22:00',
];

const CustomerDashboard = () => {
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState({ table: '', date: '', timeSlot: TIME_SLOTS[0], guests: 1 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const loadTables = async () => {
    const { data } = await api.get('/tables');
    setTables(data);
  };

  const loadReservations = async () => {
    const { data } = await api.get('/reservations/mine');
    setReservations(data);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTables();
    loadReservations();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/reservations', {
        ...form,
        guests: Number(form.guests),
      });
      setSuccess('Reservation created successfully.');
      setForm({ table: '', date: '', timeSlot: TIME_SLOTS[0], guests: 1 });
      loadReservations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create reservation.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;
    try {
      await api.delete(`/reservations/${id}`);
      loadReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel reservation.');
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '30px auto', padding: 20 }}>
      <h2>Book a Table</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
        <div style={{ marginBottom: 10 }}>
          <label>Table</label><br />
          <select name="table" value={form.table} onChange={handleChange} required style={{ width: '100%', padding: 8 }}>
            <option value="">Select a table</option>
            {tables.map((t) => (
              <option key={t._id} value={t._id}>
                Table {t.tableNumber} (seats {t.capacity})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Date</label><br />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            min={new Date().toISOString().split('T')[0]}
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Time Slot</label><br />
          <select name="timeSlot" value={form.timeSlot} onChange={handleChange} style={{ width: '100%', padding: 8 }}>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Guests</label><br />
          <input
            type="number"
            name="guests"
            min="1"
            value={form.guests}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}

        <button type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
          {loading ? 'Booking...' : 'Reserve Table'}
        </button>
      </form>

      <h2>My Reservations</h2>
      {reservations.length === 0 ? (
        <p>You have no reservations yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ccc' }}>
              <th style={{ textAlign: 'left', padding: 8 }}>Table</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Date</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Time</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Guests</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
              <th style={{ textAlign: 'left', padding: 8 }}></th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>Table {r.table?.tableNumber}</td>
                <td style={{ padding: 8 }}>{r.date}</td>
                <td style={{ padding: 8 }}>{r.timeSlot}</td>
                <td style={{ padding: 8 }}>{r.guests}</td>
                <td style={{ padding: 8 }}>{r.status}</td>
                <td style={{ padding: 8 }}>
                  {r.status === 'confirmed' && (
                    <button onClick={() => handleCancel(r._id)}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CustomerDashboard;