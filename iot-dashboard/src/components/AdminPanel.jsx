import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert, Table, Badge, Button, Modal } from 'react-bootstrap';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [deviceMetrics, setDeviceMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [summary, metrics] = await Promise.all([
          axios.get(`${API_URL}/api/admin/summary`),
          axios.get(`${API_URL}/api/admin/device_metrics`)
        ]);
        
        setStats(summary.data);
        setDeviceMetrics(metrics.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch admin data');
        console.error('Admin data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [API_URL]);

  // Quick Actions handlers
  const handleExportDevices = async () => {
    setDownloading(true);
    try {
      const res = await axios.get('/api/admin/export-devices', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'devices.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to export device data');
    }
    setDownloading(false);
  };

  const handleSystemReport = async () => {
    try {
      const res = await axios.get('/api/admin/system-report');
      setReport(res.data);
      setShowReport(true);
    } catch (err) {
      alert('Failed to fetch system report');
    }
  };

  const handleViewLogs = async () => {
    try {
      const res = await axios.get('/api/admin/logs');
      setLogs(res.data.logs || []);
      setShowLogs(true);
    } catch (err) {
      alert('Failed to fetch logs');
    }
  };

  if (loading) return (
    <div className="text-center p-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-2">Loading admin panel...</p>
    </div>
  );

  if (error) return (
    <Alert variant="danger" className="m-3">
      {error}
    </Alert>
  );

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Admin Panel</h2>
      <Row className="g-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>User Management</Card.Title>
              <Card.Text>View, add, and remove users from the system.</Card.Text>
              <Button variant="primary" onClick={() => navigate('/user-management')}>Go to User Management</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Anomaly Injection</Card.Title>
              <Card.Text>Inject test anomalies for simulator and alert testing.</Card.Text>
              <Button variant="warning" onClick={() => navigate('/anomaly-injection')}>Go to Anomaly Injection</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <h3>{stats?.mongo?.total ?? 0}</h3>
              <p className="mb-0">Total Records</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <h3>{stats?.mongo?.anomalies ?? 0}</h3>
              <p className="mb-0">Anomalies Detected</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <h3>{stats?.mongo?.devices ?? 0}</h3>
              <p className="mb-0">Active Devices</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <h3>{stats?.system_health?.last_updated ? new Date(stats.system_health.last_updated * 1000).toLocaleTimeString() : 'N/A'}</h3>
              <p className="mb-0">Last Update</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Device Performance Metrics</Card.Title>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Device ID</th>
                  <th>Readings</th>
                  <th>Anomaly Rate</th>
                  <th>Avg Temp</th>
                  <th>Avg Humidity</th>
                  <th>Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {deviceMetrics.map((device, index) => (
                  <tr key={index}>
                    <td>{device.deviceId}</td>
                    <td>{device.readings}</td>
                    <td>
                      <Badge bg={device.anomalyRate > 10 ? 'danger' : 'success'}>
                        {device.anomalyRate}%
                      </Badge>
                    </td>
                    <td>{device.avgTemp}°C</td>
                    <td>{device.avgHumidity}%</td>
                    <td>{device.lastSeen ? new Date(device.lastSeen * 1000).toLocaleString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>System Health</Card.Title>
              <div className="d-flex justify-content-between mb-3">
                <span>Database Status</span>
                <Badge bg="success">Connected</Badge>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Blockchain Status</span>
                <Badge bg="success">Connected</Badge>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>AI Model Status</span>
                <Badge bg="success">Active</Badge>
              </div>
              <div className="d-flex justify-content-between">
                <span>WebSocket Status</span>
                <Badge bg="success">Connected</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Quick Actions</Card.Title>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary" onClick={handleExportDevices} disabled={downloading}>
                  {downloading ? 'Exporting...' : 'Export Device Data'}
                </button>
                <button className="btn btn-outline-primary" onClick={handleSystemReport}>Generate System Report</button>
                <button className="btn btn-outline-primary" onClick={handleViewLogs}>View System Logs</button>
                <button className="btn btn-outline-primary" onClick={() => navigate('/user-management')}>Manage Users</button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Logs Modal */}
      <Modal show={showLogs} onHide={() => setShowLogs(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>System Logs</Modal.Title></Modal.Header>
        <Modal.Body style={{ maxHeight: 400, overflowY: 'auto', fontFamily: 'monospace', fontSize: 13 }}>
          <pre>{logs.join('')}</pre>
        </Modal.Body>
      </Modal>
      {/* System Report Modal */}
      <Modal show={showReport} onHide={() => setShowReport(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>System Report</Modal.Title></Modal.Header>
        <Modal.Body>
          <pre>{JSON.stringify(report, null, 2)}</pre>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminPanel;