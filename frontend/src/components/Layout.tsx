import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { logout } from '../store/slices/authSlice';
import { fetchNotifications } from '../store/slices/notificationSlice';
import { useEffect } from 'react';
import { getSocket } from '../utils/socket';
import { addNotification } from '../store/slices/notificationSlice';

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications() as any);

      const socket = getSocket();
      if (socket) {
        socket.on('notification', (data: any) => {
          dispatch(addNotification(data));
        });
      }
    }
  }, [user, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside
        style={{
          width: '250px',
          background: '#2c3e50',
          color: 'white',
          padding: '20px',
        }}
      >
        <h2 style={{ marginBottom: '30px' }}>CRM Platform</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link
            to="/dashboard"
            style={{ color: 'white', textDecoration: 'none', padding: '10px' }}
          >
            Dashboard
          </Link>
          <Link
            to="/leads"
            style={{ color: 'white', textDecoration: 'none', padding: '10px' }}
          >
            Leads
          </Link>
          {user?.role === 'ADMIN' || user?.role === 'MANAGER' ? (
            <Link
              to="/users"
              style={{ color: 'white', textDecoration: 'none', padding: '10px' }}
            >
              Users
            </Link>
          ) : null}
          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
            <div style={{ padding: '10px' }}>
              <div>{user?.name}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>{user?.email}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>{user?.role}</div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '10px',
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                marginTop: '10px',
              }}
            >
              Logout
            </button>
          </div>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: '20px', background: '#f5f5f5' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>CRM Platform</h1>
          {unreadCount > 0 && (
            <div
              style={{
                background: '#e74c3c',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '20px',
                fontSize: '12px',
              }}
            >
              {unreadCount} unread notifications
            </div>
          )}
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
