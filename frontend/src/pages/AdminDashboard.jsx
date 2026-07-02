import { useState, useEffect } from 'react';
import api from '../api/axios';

const AdminDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ date: '', timeSlot: '', guests: '' });

  const loadReservations = async (date = '') => {
    setError('');
    try {
      const { data } = await api.get('/reservations', {
        params: date ? { date } : {},
      });
      setReservations(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reservations.');
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadReservations();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    loadReservations(dateFilter);
  };

  const clearFilter = () => {
    setDateFilter('');
    loadReservations();
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;
    try {
      await api.delete(`/reservations/${id}/admin`);
      loadReservations(dateFilter);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel reservation.');
    }
  };

  const startEdit = (r) => {
    setEditingId(r._id);
    setEditForm({ date: r.date, timeSlot: r.timeSlot, guests: r.guests });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/reservations/${id}`, {
        date: editForm.date,
        timeSlot: editForm.timeSlot,
        guests: Number(editForm.guests),
      });
      setEditingId(null);
      loadReservations(dateFilter);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update reservation.');
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '30px auto', padding: 20 }}>
      <h2>All Reservations (Admin)</h2>

      <form onSubmit={handleFilter} style={{ marginBottom: 20, display: 'flex', gap: 8, alignItems: 'end' }}>
        <div>
          <label>Filter by date</label><br />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ padding: 8 }}
          />
        </div>
        <button type="submit" style={{ padding: '8px 16px' }}>Filter</button>
        <button type="button" onClick={clearFilter} style={{ padding: '8px 16px' }}>Clear</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {reservations.length === 0 ? (
        <p>No reservations found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ccc' }}>
              <th style={{ textAlign: 'left', padding: 8 }}>Customer</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Table</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Date</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Time</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Guests</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{r.user?.name}<br /><small>{r.user?.email}</small></td>
                <td style={{ padding: 8 }}>Table {r.table?.tableNumber} (seats {r.table?.capacity})</td>

                {editingId === r._id ? (
                  <>
                    <td style={{ padding: 8 }}>
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      />
                    </td>
                    <td style={{ padding: 8 }}>
                      <input
                        type="text"
                        value={editForm.timeSlot}
                        onChange={(e) => setEditForm({ ...editForm, timeSlot: e.target.value })}
                        placeholder="e.g. 19:00-20:00"
                      />
                    </td>
                    <td style={{ padding: 8 }}>
                      <input
                        type="number"
                        min="1"
                        value={editForm.guests}
                        onChange={(e) => setEditForm({ ...editForm, guests: e.target.value })}
                        style={{ width: 60 }}
                      />
                    </td>
                    <td style={{ padding: 8 }}>{r.status}</td>
                    <td style={{ padding: 8 }}>
                      <button onClick={() => saveEdit(r._id)}>Save</button>{' '}
                      <button onClick={cancelEdit}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: 8 }}>{r.date}</td>
                    <td style={{ padding: 8 }}>{r.timeSlot}</td>
                    <td style={{ padding: 8 }}>{r.guests}</td>
                    <td style={{ padding: 8 }}>{r.status}</td>
                    <td style={{ padding: 8 }}>
                      {r.status === 'confirmed' && (
                        <>
                          <button onClick={() => startEdit(r)}>Edit</button>{' '}
                          <button onClick={() => handleCancel(r._id)}>Cancel</button>
                        </>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;