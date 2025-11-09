import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchLeads, createLead } from '../store/slices/leadSlice';
import { RootState } from '../store/store';
import { Lead } from '../api/leadApi';
import toast from 'react-hot-toast';

const Leads = () => {
  const dispatch = useDispatch();
  const { leads, loading, pagination } = useSelector((state: RootState) => state.leads);
  const { user } = useSelector((state: RootState) => state.auth);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    email: '',
    phone: '',
    status: 'NEW' as Lead['status'],
    ownerId: user?.id,
  });

  useEffect(() => {
    dispatch(fetchLeads() as any);
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createLead(formData) as any);
      toast.success('Lead created successfully');
      setShowModal(false);
      setFormData({
        title: '',
        company: '',
        email: '',
        phone: '',
        status: 'NEW',
        ownerId: user?.id,
      });
      dispatch(fetchLeads() as any);
    } catch (error: any) {
      toast.error('Failed to create lead');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: '#3498db',
      CONTACTED: '#f39c12',
      QUALIFIED: '#2ecc71',
      WON: '#27ae60',
      LOST: '#e74c3c',
    };
    return colors[status] || '#95a5a6';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Leads</h2>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '10px 20px',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          + New Lead
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div
          style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Title</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Company</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Email</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Owner</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '15px' }}>
                    <Link
                      to={`/leads/${lead.id}`}
                      style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}
                    >
                      {lead.title}
                    </Link>
                  </td>
                  <td style={{ padding: '15px' }}>{lead.company || '-'}</td>
                  <td style={{ padding: '15px' }}>{lead.email || '-'}</td>
                  <td style={{ padding: '15px' }}>
                    <span
                      style={{
                        padding: '5px 10px',
                        borderRadius: '20px',
                        background: getStatusColor(lead.status),
                        color: 'white',
                        fontSize: '12px',
                      }}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>{lead.owner?.name || 'Unassigned'}</td>
                  <td style={{ padding: '15px' }}>
                    <Link
                      to={`/leads/${lead.id}`}
                      style={{
                        padding: '5px 10px',
                        background: '#3498db',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '5px',
                        fontSize: '12px',
                      }}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '500px',
            }}
          >
            <h3 style={{ marginBottom: '20px' }}>Create New Lead</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                  }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                  }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                  }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                  }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Lead['status'] })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                  }}
                >
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="QUALIFIED">QUALIFIED</option>
                  <option value="WON">WON</option>
                  <option value="LOST">LOST</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 20px',
                    background: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
