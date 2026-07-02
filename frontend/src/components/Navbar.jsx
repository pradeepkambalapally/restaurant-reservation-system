import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav style={{ padding: '12px 20px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <strong>Restaurant Reservations</strong>
        {user?.role === 'admin' && (
          <span style={{ marginLeft: 10, padding: '2px 8px', background: '#333', color: '#fff', borderRadius: 4, fontSize: 12 }}>
            ADMIN
          </span>
        )}
      </div>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: 12 }}>{user.name} ({user.role})</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: 10 }}>Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;