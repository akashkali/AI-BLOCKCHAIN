import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner, Card } from 'react-bootstrap';
import axios from '../utils/axiosInstance';

const defaultForm = {
  deviceId: '',
  anomalyType: 'TEMPERATURE_ATTACK',
  temperature: 100,
  humidity: 90,
  gasLevel: 100,
  co2Level: 1000,
  airQuality: 10,
  soundLevel: 80,
  motionDetected: 1,
  lightIntensity: 100,
  vibrationLevel: 10,
  deviceBattery: 50,
};

const anomalyTypes = [
  { value: 'TEMPERATURE_ATTACK', label: 'Temperature Attack' },
  { value: 'GAS_ATTACK', label: 'Gas Attack' },
  { value: 'MOTION_ATTACK', label: 'Motion Attack' },
  { value: 'BATTERY_ATTACK', label: 'Battery Attack' },
];

const AnomalyInjection = () => {
  const [form, setForm] = useState(defaultForm);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch device list for dropdown
    axios.get('/api/dashboard/devices')
      .then(res => setDevices(res.data.map(d => d.deviceId)))
      .catch(() => setDevices([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    setError('');
    try {
      await axios.post('/api/admin/inject-anomaly', form);
      setResult('Anomaly injected successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to inject anomaly');
    }
    setLoading(false);
  };

  return (
    <Card className="container mt-4 p-4">
      <h4>Inject Test Anomaly</h4>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-2">
          <Form.Label>Device</Form.Label>
          <Form.Select value={form.deviceId} onChange={e => setForm({ ...form, deviceId: e.target.value })} required>
            <option value="">Select Device</option>
            {devices.map(d => <option key={d} value={d}>{d}</option>)}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Anomaly Type</Form.Label>
          <Form.Select value={form.anomalyType} onChange={e => setForm({ ...form, anomalyType: e.target.value })}>
            {anomalyTypes.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Temperature</Form.Label>
          <Form.Control type="number" value={form.temperature} onChange={e => setForm({ ...form, temperature: e.target.value })} />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Humidity</Form.Label>
          <Form.Control type="number" value={form.humidity} onChange={e => setForm({ ...form, humidity: e.target.value })} />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Gas Level</Form.Label>
          <Form.Control type="number" value={form.gasLevel} onChange={e => setForm({ ...form, gasLevel: e.target.value })} />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>CO2 Level</Form.Label>
          <Form.Control type="number" value={form.co2Level} onChange={e => setForm({ ...form, co2Level: e.target.value })} />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Air Quality</Form.Label>
          <Form.Control type="number" value={form.airQuality} onChange={e => setForm({ ...form, airQuality: e.target.value })} />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Sound Level</Form.Label>
          <Form.Control type="number" value={form.soundLevel} onChange={e => setForm({ ...form, soundLevel: e.target.value })} />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Motion Detected</Form.Label>
          <Form.Select value={form.motionDetected} onChange={e => setForm({ ...form, motionDetected: e.target.value })}>
            <option value={1}>Yes</option>
            <option value={0}>No</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Light Intensity</Form.Label>
          <Form.Control type="number" value={form.lightIntensity} onChange={e => setForm({ ...form, lightIntensity: e.target.value })} />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Vibration Level</Form.Label>
          <Form.Control type="number" value={form.vibrationLevel} onChange={e => setForm({ ...form, vibrationLevel: e.target.value })} />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Device Battery</Form.Label>
          <Form.Control type="number" value={form.deviceBattery} onChange={e => setForm({ ...form, deviceBattery: e.target.value })} />
        </Form.Group>
        <Button type="submit" disabled={loading}>{loading ? <Spinner size="sm" /> : 'Inject Anomaly'}</Button>
      </Form>
      {result && <Alert variant="success" className="mt-3">{result}</Alert>}
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
    </Card>
  );
};

export default AnomalyInjection; 