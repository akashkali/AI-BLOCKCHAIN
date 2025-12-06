import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Alert, Spinner, Badge, Table, Button
} from 'react-bootstrap';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from '../utils/axiosInstance';
import io from 'socket.io-client';
import './Dashboard.css';
import Statistics from '../components/Dashboard/Statistics';
import Timeline from '../components/Dashboard/Timeline';
import LiveData from '../components/Dashboard/LiveData';
import AttackLogs from '../components/Dashboard/AttackLogs';

Chart.register(...registerables);

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    summary: null,
    blockchain: [],
    devices: [],
    anomalies: null,
    systemStatus: 'loading'
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, blockchainRes, devicesRes, anomaliesRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/summary`),
        axios.get(`${API_URL}/api/admin/blockchain_records`),
        axios.get(`${API_URL}/api/admin/device_metrics`),
        axios.get(`${API_URL}/api/admin/anomaly_report`)
      ]);

      setDashboardData({
        summary: summaryRes.data,
        blockchain: blockchainRes.data,
        devices: devicesRes.data,
        anomalies: anomaliesRes.data,
        systemStatus: 'operational'
      });
    } catch (err) {
      setError(err.message);
      setDashboardData(prev => ({ ...prev, systemStatus: 'degraded' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const socket = io(API_URL);
    socket.on('new_data', () => {
      fetchDashboardData();
    });

    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL]);

  const prepareChartData = () => {
    if (!dashboardData.summary || !dashboardData.anomalies) return null;

    return {
      systemHealth: {
        labels: ['MongoDB', 'Blockchain', 'Devices'],
        datasets: [{
          data: [
            dashboardData.summary.mongo?.total || 0,
            dashboardData.summary.blockchain?.total || 0,
            dashboardData.summary.mongo?.devices || 0
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)'
          ]
        }]
      },
      anomalyTrends: {
        labels: dashboardData.anomalies.time_series?.map(d => d._id) || [],
        datasets: [{
          label: 'Anomalies per day',
          data: dashboardData.anomalies.time_series?.map(d => d.count) || [],
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1
        }]
      },
      anomalyTypes: {
        labels: ['High Temp', 'High Gas', 'High Sound'],
        datasets: [{
          label: 'Anomaly Types',
          data: [
            dashboardData.anomalies.by_type?.high_temp || 0,
            dashboardData.anomalies.by_type?.high_gas || 0,
            dashboardData.anomalies.by_type?.high_sound || 0
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)'
          ]
        }]
      }
    };
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-4">
        <Alert.Heading>Dashboard Error</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={fetchDashboardData}>
          Retry
        </Button>
      </Alert>
    );
  }

  const charts = prepareChartData();

  return (
    <div className="dashboard-container">
      <h4 className="mb-4">
        Admin Security Dashboard
        <Badge bg={dashboardData.systemStatus === 'operational' ? 'success' : 'warning'} className="ms-2">
          {dashboardData.systemStatus === 'operational' ? 'OPERATIONAL' : 'DEGRADED'}
        </Badge>
      </h4>

      {/* System Overview Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <Card.Title>Total Data</Card.Title>
              <Card.Text className="display-4">
                {(dashboardData.summary?.mongo?.total || 0) +
                  (dashboardData.summary?.blockchain?.total || 0)}
              </Card.Text>
              <small>
                {(dashboardData.summary?.mongo?.total || 0)} in DB + {(dashboardData.summary?.blockchain?.total || 0)} on chain
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <Card.Title>Anomalies</Card.Title>
              <Card.Text className="display-4">
                {(dashboardData.summary?.mongo?.anomalies || 0) +
                  (dashboardData.summary?.blockchain?.anomalies || 0)}
              </Card.Text>
              <small>
                {(dashboardData.summary?.mongo?.anomalies || 0)} in DB + {(dashboardData.summary?.blockchain?.anomalies || 0)} on chain
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <Card.Title>Devices</Card.Title>
              <Card.Text className="display-4">
                {dashboardData.summary?.mongo?.devices || 0}
              </Card.Text>
              <small>Active monitoring</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <Card.Title>Last Updated</Card.Title>
              <Card.Text className="display-4">
                {dashboardData.summary?.system_health?.last_updated
                  ? new Date(dashboardData.summary.system_health.last_updated).toLocaleTimeString()
                  : 'N/A'}
              </Card.Text>
              <small>System status</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="mb-4">
        <Col lg={4}>
          <Card>
            <Card.Header>
              <Card.Title>Data Distribution</Card.Title>
            </Card.Header>
            <Card.Body>
              {charts ? <Pie data={charts.systemHealth} options={{ responsive: true }} /> : <Spinner animation="border" />}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card>
            <Card.Header>
              <Card.Title>Anomaly Trends</Card.Title>
            </Card.Header>
            <Card.Body>
              {charts ? <Line data={charts.anomalyTrends} options={{ responsive: true }} /> : <Spinner animation="border" />}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card>
            <Card.Header>
              <Card.Title>Anomaly Types</Card.Title>
            </Card.Header>
            <Card.Body>
              {charts ? <Bar data={charts.anomalyTypes} options={{ responsive: true }} /> : <Spinner animation="border" />}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Device Metrics */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <Card.Title>Device Metrics</Card.Title>
            </Card.Header>
            <Card.Body>
              <div style={{ overflowX: 'auto' }}>
                <Table striped bordered hover responsive style={{ minWidth: 900, width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Device ID</th>
                      <th>Readings</th>
                      <th>Anomaly Rate</th>
                      <th>Avg Temp</th>
                      <th>Avg Humidity</th>
                      <th>Last Seen</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.devices.map((device, index) => (
                      <tr key={index}>
                        <td>{device.deviceId}</td>
                        <td>{device.readings}</td>
                        <td>
                          <Badge bg={device.anomalyRate > 5 ? 'danger' : 'warning'}>
                            {device.anomalyRate}%
                          </Badge>
                        </td>
                        <td>{device.avgTemp}°C</td>
                        <td>{device.avgHumidity}%</td>
                        <td>{new Date(device.lastSeen * 1000).toLocaleString()}</td>
                        <td>
                          <Button variant="outline-primary" size="sm" onClick={() => { setSelectedDevice(device); setShowModal(true); }}>
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Device Details Modal */}
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
              <li><b>Readings:</b> {selectedDevice.readings}</li>
              <li><b>Anomaly Rate:</b> {selectedDevice.anomalyRate}%</li>
              <li><b>Avg Temp:</b> {selectedDevice.avgTemp}°C</li>
              <li><b>Avg Humidity:</b> {selectedDevice.avgHumidity}%</li>
              <li><b>Last Seen:</b> {selectedDevice.lastSeen ? new Date(selectedDevice.lastSeen * 1000).toLocaleString() : 'N/A'}</li>
            </ul>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          </div>
        </div>
      )}

      {/* Blockchain Records */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Card.Title>Recent Blockchain Records</Card.Title>
              <Badge bg="info" className="ms-2">Immutable</Badge>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Record ID</th>
                    <th>Device</th>
                    <th>Timestamp</th>
                    <th>Block</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.blockchain.slice(0, 5).map((record, index) => (
                    <tr key={index} className={record.isAnomaly ? 'table-danger' : ''}>
                      <td>{record.id}</td>
                      <td>{record.deviceId}</td>
                      <td>{new Date(record.timestamp * 1000).toLocaleString()}</td>
                      <td>{record.tx_details?.block || 'Pending'}</td>
                      <td>
                        {record.isAnomaly
                          ? <Badge bg="danger">Anomaly</Badge>
                          : <Badge bg="success">Normal</Badge>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add these widgets to the AdminDashboard return JSX, e.g. after the system overview cards: */}
      <Row className="mb-4">
        <Col md={6}><Statistics /></Col>
        <Col md={6}><Timeline /></Col>
      </Row>
      <Row className="mb-4">
        <Col><AttackLogs /></Col>
      </Row>
      <Row className="mb-4">
        <Col><LiveData /></Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
