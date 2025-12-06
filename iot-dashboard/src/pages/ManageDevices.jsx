import React, { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import { Card, Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaStar, FaTrash, FaCheckCircle } from 'react-icons/fa';

const ManageDevices = () => {
  const [trustedDevices, setTrustedDevices] = useState([]);
  const [allDevices, setAllDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removing, setRemoving] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const [trustedRes, allRes] = await Promise.all([
        axios.get('/api/trusted_devices'),
        axios.get('/api/devices'),
      ]);
      setTrustedDevices(trustedRes.data);
      setAllDevices(allRes.data);
    } catch (err) {
      setError('Failed to fetch devices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleRemove = async (deviceId) => {
    setRemoving(deviceId);
    setSuccessMsg('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/devices/remove', { deviceId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMsg(`Device ${deviceId} removed successfully.`);
      fetchDevices();
    } catch (err) {
      setError('Failed to remove device.');
    } finally {
      setRemoving('');
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Device Management</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {successMsg && <Alert variant="success">{successMsg}</Alert>}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          <Card className="mb-4 shadow">
            <Card.Header className="bg-success text-white d-flex align-items-center">
              <FaStar className="me-2" /> Trusted Devices
            </Card.Header>
            <Card.Body>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Device ID</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trustedDevices.length === 0 && (
                    <tr><td colSpan={2} className="text-center">No trusted devices found.</td></tr>
                  )}
                  {trustedDevices.map((dev) => (
                    <tr key={dev.deviceId}>
                      <td><FaStar className="text-warning me-1" /> {dev.deviceId}</td>
                      <td><Badge bg="success">Trusted</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          <Card className="shadow">
            <Card.Header className="bg-primary text-white">All Devices</Card.Header>
            <Card.Body>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Device ID</th>
                    <th>Trust Status</th>
                    <th>Last Seen</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allDevices.length === 0 && (
                    <tr><td colSpan={4} className="text-center">No devices found.</td></tr>
                  )}
                  {allDevices.map((dev) => (
                    <tr key={dev.deviceId}>
                      <td>{dev.trusted ? <FaStar className="text-warning me-1" /> : null} {dev.deviceId}</td>
                      <td>
                        {dev.trusted ? (
                          <Badge bg="success">Trusted</Badge>
                        ) : (
                          <Badge bg="secondary">Untrusted</Badge>
                        )}
                      </td>
                      <td>{dev.last_seen ? new Date(dev.last_seen * 1000).toLocaleString() : 'Never'}</td>
                      <td>
                        {dev.trusted ? (
                          <FaCheckCircle className="text-success" title="Trusted device cannot be removed" />
                        ) : (
                          <Button
                            variant="danger"
                            size="sm"
                            disabled={removing === dev.deviceId}
                            onClick={() => handleRemove(dev.deviceId)}
                          >
                            {removing === dev.deviceId ? 'Removing...' : <><FaTrash className="me-1" /> Remove</>}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};

export default ManageDevices; 