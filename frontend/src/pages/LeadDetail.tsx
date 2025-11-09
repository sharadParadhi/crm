import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLead, updateLead, addActivity } from '../store/slices/leadSlice';
import { RootState } from '../store/store';
import { activityApi } from '../api/activityApi';
import { getSocket } from '../utils/socket';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const LeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentLead, loading } = useSelector(
    (state: RootState) => state.leads
  );
  const { user: _user } = useSelector((state: RootState) => state.auth);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityData, setActivityData] = useState({
    type: 'NOTE' as 'NOTE' | 'CALL' | 'MEETING' | 'EMAIL',
    note: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    company: '',
    email: '',
    phone: '',
    status: 'NEW' as any,
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchLead(parseInt(id)) as any);
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentLead) {
      setEditData({
        title: currentLead.title,
        company: currentLead.company || '',
        email: currentLead.email || '',
        phone: currentLead.phone || '',
        status: currentLead.status,
      });
    }
  }, [currentLead]);

  useEffect(() => {
    const socket = getSocket();
    if (socket && id) {
      socket.emit('join:lead', parseInt(id));

      socket.on('lead:updated', (data: any) => {
        dispatch(updateLead({ id: data.id, data }) as any);
      });

      socket.on('activity:created', (data: any) => {
        dispatch(addActivity(data));
        toast.success('New activity added');
      });

      return () => {
        socket.emit('leave:lead', parseInt(id));
        socket.off('lead:updated');
        socket.off('activity:created');
      };
    }
  }, [id, dispatch]);

  const handleUpdate = async () => {
    if (!id) return;
    try {
      await dispatch(updateLead({ id: parseInt(id), data: editData }) as any);
      toast.success('Lead updated successfully');
      setEditMode(false);
    } catch (error: any) {
      toast.error('Failed to update lead');
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await activityApi.createActivity({
        leadId: parseInt(id),
        type: activityData.type,
        note: activityData.note,
      });
      toast.success('Activity created successfully');
      setShowActivityModal(false);
      setActivityData({ type: 'NOTE', note: '' });
      dispatch(fetchLead(parseInt(id)) as any);
    } catch (error: any) {
      toast.error('Failed to create activity');
    }
  };

  if (loading || !currentLead) {
    return <div>Loading...</div>;
  }

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
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => navigate('/leads')}
          style={{
            padding: '10px 20px',
            background: '#95a5a6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '20px',
          }}
        >
          ← Back to Leads
        </button>
      </div>

      <div
        style={{
          background: 'white',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '20px',
          }}
        >
          <div>
            {editMode ? (
              <input
                type="text"
                value={editData.title}
                onChange={(e) =>
                  setEditData({ ...editData, title: e.target.value })
                }
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  width: '100%',
                }}
              />
            ) : (
              <h2 style={{ marginBottom: '10px' }}>{currentLead.title}</h2>
            )}
            <div
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                marginTop: '10px',
              }}
            >
              {editMode ? (
                <select
                  value={editData.status}
                  onChange={(e) =>
                    setEditData({ ...editData, status: e.target.value })
                  }
                  style={{
                    padding: '5px 10px',
                    borderRadius: '20px',
                    border: '1px solid #ddd',
                  }}
                >
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="QUALIFIED">QUALIFIED</option>
                  <option value="WON">WON</option>
                  <option value="LOST">LOST</option>
                </select>
              ) : (
                <span
                  style={{
                    padding: '5px 10px',
                    borderRadius: '20px',
                    background: getStatusColor(currentLead.status),
                    color: 'white',
                    fontSize: '12px',
                  }}
                >
                  {currentLead.status}
                </span>
              )}
              <span style={{ fontSize: '14px', color: '#666' }}>
                Owner: {currentLead.owner?.name || 'Unassigned'}
              </span>
            </div>
          </div>
          <div>
            {editMode ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleUpdate}
                  style={{
                    padding: '10px 20px',
                    background: '#2ecc71',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => setEditMode(false)}
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
              </div>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                style={{
                  padding: '10px 20px',
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Edit
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginTop: '20px',
          }}
        >
          <div>
            <label
              style={{
                fontSize: '12px',
                color: '#666',
                display: 'block',
                marginBottom: '5px',
              }}
            >
              Company
            </label>
            {editMode ? (
              <input
                type="text"
                value={editData.company}
                onChange={(e) =>
                  setEditData({ ...editData, company: e.target.value })
                }
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                }}
              />
            ) : (
              <div>{currentLead.company || '-'}</div>
            )}
          </div>
          <div>
            <label
              style={{
                fontSize: '12px',
                color: '#666',
                display: 'block',
                marginBottom: '5px',
              }}
            >
              Email
            </label>
            {editMode ? (
              <input
                type="email"
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                }}
              />
            ) : (
              <div>{currentLead.email || '-'}</div>
            )}
          </div>
          <div>
            <label
              style={{
                fontSize: '12px',
                color: '#666',
                display: 'block',
                marginBottom: '5px',
              }}
            >
              Phone
            </label>
            {editMode ? (
              <input
                type="tel"
                value={editData.phone}
                onChange={(e) =>
                  setEditData({ ...editData, phone: e.target.value })
                }
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                }}
              />
            ) : (
              <div>{currentLead.phone || '-'}</div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div
        style={{
          background: 'white',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h3>Activity Timeline</h3>
          <button
            onClick={() => setShowActivityModal(true)}
            style={{
              padding: '10px 20px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            + Add Activity
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {currentLead.activities && currentLead.activities.length > 0 ? (
            currentLead.activities.map((activity) => (
              <div
                key={activity.id}
                style={{
                  padding: '15px',
                  borderLeft: '4px solid #3498db',
                  background: '#f8f9fa',
                  borderRadius: '5px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{activity.type}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {format(new Date(activity.createdAt), 'PPp')}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '5px',
                  }}
                >
                  By: {activity.creator.name}
                </div>
                {activity.note && (
                  <div style={{ marginTop: '10px' }}>{activity.note}</div>
                )}
              </div>
            ))
          ) : (
            <div
              style={{ textAlign: 'center', padding: '20px', color: '#666' }}
            >
              No activities yet
            </div>
          )}
        </div>
      </div>

      {showActivityModal && (
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
            <h3 style={{ marginBottom: '20px' }}>Add Activity</h3>
            <form onSubmit={handleCreateActivity}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  Type
                </label>
                <select
                  value={activityData.type}
                  onChange={(e) =>
                    setActivityData({
                      ...activityData,
                      type: e.target.value as any,
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                  }}
                >
                  <option value="NOTE">Note</option>
                  <option value="CALL">Call</option>
                  <option value="MEETING">Meeting</option>
                  <option value="EMAIL">Email</option>
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  Note
                </label>
                <textarea
                  value={activityData.note}
                  onChange={(e) =>
                    setActivityData({ ...activityData, note: e.target.value })
                  }
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
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
                  Add Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetail;
