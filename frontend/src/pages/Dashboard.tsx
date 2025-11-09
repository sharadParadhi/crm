import { useEffect, useState } from 'react';
import { dashboardApi, DashboardStats } from '../api/dashboardApi';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await dashboardApi.getStats();
      setStats(response.data);
    } catch (error: any) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!stats) {
    return <div>No data available</div>;
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div>
      <h2 style={{ marginBottom: '30px' }}>Dashboard</h2>

      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}
      >
        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Total Leads</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.stats.totalLeads}</div>
        </div>
        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>New Leads</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3498db' }}>{stats.stats.newLeads}</div>
        </div>
        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Qualified</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2ecc71' }}>{stats.stats.qualifiedLeads}</div>
        </div>
        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Won</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#27ae60' }}>{stats.stats.wonLeads}</div>
        </div>
        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Lost</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e74c3c' }}>{stats.stats.lostLeads}</div>
        </div>
        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Total Activities</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.stats.totalActivities}</div>
        </div>
      </div>

      {/* Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}
      >
        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ marginBottom: '20px' }}>Leads by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.charts.leadsByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ marginBottom: '20px' }}>Activities by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.charts.activitiesByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, count }) => `${type}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {stats.charts.activitiesByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Leads and Activities */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px',
        }}
      >
        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ marginBottom: '20px' }}>Recent Leads</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats.recentLeads.map((lead: any) => (
              <div
                key={lead.id}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{lead.title}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Status: {lead.status} | Owner: {lead.owner?.name || 'Unassigned'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ marginBottom: '20px' }}>Recent Activities</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats.recentActivities.map((activity: any) => (
              <div
                key={activity.id}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{activity.type}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Lead: {activity.lead?.title} | By: {activity.creator?.name}
                </div>
                {activity.note && (
                  <div style={{ fontSize: '12px', marginTop: '5px' }}>{activity.note}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
