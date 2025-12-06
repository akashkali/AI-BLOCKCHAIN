import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Spinner, Badge, Button } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from '../utils/axiosInstance';
import io from 'socket.io-client';
import { useAuth } from '../utils/auth';         // ✅ Auth Hook
import { useNavigate } from 'react-router-dom';  // ✅ Redirect Hook
import './Dashboard.css';
import Statistics from '../components/Dashboard/Statistics';
import Timeline from '../components/Dashboard/Timeline';
import LiveData from '../components/Dashboard/LiveData';
import DeviceStatus from '../components/Dashboard/DeviceStatus';
import AttackLogs from '../components/Dashboard/AttackLogs';

Chart.register(...registerables);

const UserDashboard = () => {
  const { user } = useAuth();              // ✅ Access auth context
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'user') {
      navigate('/login');                 // ✅ Redirect if not a regular user
    }
  }, [user, navigate]);

  const [dashboardData, setDashboardData] = useState({
    summary: {},
    chartData: [],
    devices: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [realtimeData, setRealtimeData] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchDashboardData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...', forceRefresh ? '(Force refresh)' : '');
      
      // Add cache-busting timestamp
      const timestamp = forceRefresh ? Date.now() : undefined;
      const params = timestamp ? { _t: timestamp } : {};
      
      const [summaryRes, chartRes, devicesRes] = await Promise.all([
        axios.get('/api/dashboard/summary', { params }),
        axios.get('/api/dashboard/chart_data', { params }),
        axios.get('/api/dashboard/devices', { params })
      ]);

      console.log('Dashboard data received:', {
        summary: summaryRes.data,
        chartData: chartRes.data,
        devices: devicesRes.data
      });

      setDashboardData({
        summary: summaryRes.data,
        chartData: chartRes.data,
        devices: devicesRes.data
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleForceRefresh = () => {
    console.log('Force refreshing dashboard data...');
    fetchDashboardData(true);
  };

  useEffect(() => {
    fetchDashboardData();

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const socket = io(apiUrl, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });
    
    socket.on('connect', () => {
      console.log('WebSocket connected');
    });
    
    socket.on('new_data', (data) => {
      console.log('New data received:', data);
      setRealtimeData(data);
      // Refresh dashboard data when new readings arrive
      fetchDashboardData();
    });
    
    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
    
    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const prepareChartData = () => {
    const { chartData } = dashboardData;

    return {
      temperature: {
        labels: Array.isArray(chartData) ? chartData.map(d => d.timestamp_human || (d.timestamp ? new Date(d.timestamp * 1000).toLocaleTimeString() : '')) : [],
        datasets: [
          {
            label: 'Temperature (°C)',
            data: Array.isArray(chartData) ? chartData.map(d => d.temperature ?? null) : [],
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.1
          }
        ]
      }
    };
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  const charts = prepareChartData();

  return (
    <div className="dashboard-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">IoT Security Dashboard</h4>
        <Button 
          variant="outline-primary" 
          onClick={handleForceRefresh}
          disabled={loading}
          size="sm"
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="stat-card">
            <Card.Body>
              <Card.Title>Total Devices</Card.Title>
              <Card.Text className="display-4">{dashboardData.summary.total_devices || 0}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card">
            <Card.Body>
              <Card.Title>Readings</Card.Title>
              <Card.Text className="display-4">{dashboardData.summary.total_records || 0}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card">
            <Card.Body>
              <Card.Title>Last Updated</Card.Title>
              <Card.Text className="display-4">
                {new Date().toLocaleTimeString()}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col lg={12}>
          <Card className="chart-card">
            <Card.Header>
              <Card.Title>Temperature Trends</Card.Title>
            </Card.Header>
            <Card.Body>
              {charts.temperature.labels.length === 0 ? (
                <div className="text-center text-muted">No temperature data available for the last 24 hours.</div>
              ) : (
                <Line 
                  data={charts.temperature} 
                  options={{ 
                    responsive: true,
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (context) => `${context.dataset.label}: ${context.raw}°C`
                        }
                      }
                    }
                  }} 
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Device Status */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <Card.Title>Device Status</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                {dashboardData.devices.map(device => (
                  <Col md={4} key={device.deviceId} className="mb-3">
                    <Card>
                      <Card.Body>
                        <Card.Title>{device.deviceId}</Card.Title>
                        <Card.Text>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Readings:</span>
                            <span>{device.total_readings || 0}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Last Seen:</span>
                            <span>{new Date(device.last_seen?.timestamp * 1000).toLocaleString()}</span>
                          </div>
                          {device.latest_readings && (
                            <>
                              <div className="d-flex justify-content-between mb-2">
                                <span>Temperature:</span>
                                <span>{device.latest_readings.temperature || 'N/A'}°C</span>
                              </div>
                              <div className="d-flex justify-content-between mb-2">
                                <span>Humidity:</span>
                                <span>{device.latest_readings.humidity || 'N/A'}%</span>
                              </div>
                            </>
                          )}
                        </Card.Text>
                        <Button variant="outline-primary" size="sm" onClick={() => { setSelectedDevice(device); setShowModal(true); }}>
                          View Details
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Components in requested order */}
      <Statistics />
      <Timeline />
      <AttackLogs />
      <LiveData />
      {/* Modal for device details */}
      {showModal && selectedDevice && (
        <div className="modal-backdrop" style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div className="modal-content" style={{
            background: '#fff', padding: 24, borderRadius: 8, minWidth: 300, maxWidth: 400
          }}>
            <h5>Device Details: {selectedDevice.deviceId}</h5>
            <ul>
              <li><b>Total Readings:</b> {selectedDevice.total_readings}</li>
              <li><b>Anomaly Count:</b> {selectedDevice.anomaly_count}</li>
              <li><b>Last Seen:</b> {selectedDevice.last_seen?.timestamp ? new Date(selectedDevice.last_seen.timestamp * 1000).toLocaleString() : 'N/A'}</li>
              {/* Add more fields as needed */}
            </ul>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
