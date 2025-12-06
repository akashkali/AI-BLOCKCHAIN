import React, { useState, useEffect } from 'react';
import { Card, Table, Spinner, Alert, Badge, Button, ButtonGroup, Dropdown } from 'react-bootstrap';
import axios from '../utils/axiosInstance';
import { io } from 'socket.io-client';
import { CSVLink } from 'react-csv';

const AttackLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL'); // 'ALL' or 'ANOMALIES'
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const socket = io(API_URL);
    
    socket.on('anomaly_alert', (data) => {
      setLogs(prevLogs => [data, ...prevLogs]);
    });

    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/dashboard/attack_logs`);
        setLogs(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch attack logs');
        console.error('Attack logs fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();

    return () => {
      socket.disconnect();
    };
  }, [API_URL]);

  const getAnomalyTypeBadge = (type) => {
    const variants = {
      'TEMPERATURE': 'danger',
      'HUMIDITY': 'warning',
      'GAS': 'danger',
      'CO2': 'warning',
      'AIR_QUALITY': 'info',
      'SOUND': 'secondary',
      'MOTION': 'primary',
      'LIGHT': 'info',
      'VIBRATION': 'warning',
      'BATTERY': 'danger',
      'NORMAL': 'success'
    };
    return <Badge bg={variants[type] || 'secondary'}>{type}</Badge>;
  };

  // Filter logs based on current filter
  const filteredLogs = logs.filter(log => 
    filter === 'ANOMALIES' ? log.isAnomaly : true
  );

  // Prepare CSV data
  const prepareCSVData = () => {
    return filteredLogs.map(log => ({
      'Timestamp': new Date(log.timestamp * 1000).toLocaleString(),
      'Device ID': log.deviceId,
      'Anomaly Type': log.anomalyType,
      'Temperature (°C)': log.temperature,
      'Humidity (%)': log.humidity,
      'Gas Level': log.gasLevel,
      'CO2 Level': log.co2Level,
      'Air Quality': log.airQuality,
      'Sound Level (dB)': log.soundLevel,
      'Motion Detected': log.motionDetected ? 'Yes' : 'No',
      'Light Intensity': log.lightIntensity,
      'Vibration Level': log.vibrationLevel,
      'Battery (%)': log.deviceBattery,
      'Blockchain TX': log.tx_hash || 'N/A',
      'Is Anomaly': log.isAnomaly ? 'Yes' : 'No'
    }));
  };

  if (loading) return (
    <div className="text-center p-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-2">Loading attack logs...</p>
    </div>
  );

  if (error) return (
    <Alert variant="danger" className="m-3">
      {error}
    </Alert>
  );

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Threat Logs</h2>
        <div>
                <CSVLink 
                  data={prepareCSVData()} 
                  filename={`threat-logs-${new Date().toISOString().split('T')[0]}.csv`}
            className="btn btn-success ms-2"
                >
            <i className="fas fa-download me-1"></i> Download CSV
                </CSVLink>
        </div>
      </div>

      <Card>
        <Card.Body>
          <div className="table-responsive">
            <Table hover striped bordered>
              <thead className="table-dark">
                <tr>
                  <th>Timestamp</th>
                  <th>Device ID</th>
                  <th>Anomaly Type</th>
                  <th>Temp (°C)</th>
                  <th>Humidity (%)</th>
                  <th>Gas</th>
                  <th>CO2</th>
                  <th>Air Quality</th>
                  <th>Sound (dB)</th>
                  <th>Motion</th>
                  <th>Light</th>
                  <th>Vibration</th>
                  <th>Battery (%)</th>
                  <th>Blockchain TX</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log, index) => (
                    <tr key={index} className={log.isAnomaly ? 'table-danger' : ''}>
                      <td>{new Date(log.timestamp * 1000).toLocaleString()}</td>
                      <td>{log.deviceId}</td>
                      <td>{getAnomalyTypeBadge(log.anomalyType)}</td>
                      <td>{log.temperature}°C</td>
                      <td>{log.humidity}%</td>
                      <td>{log.gasLevel}</td>
                      <td>{log.co2Level}</td>
                      <td>{log.airQuality}</td>
                      <td>{log.soundLevel}</td>
                      <td>{log.motionDetected ? 'Yes' : 'No'}</td>
                      <td>{log.lightIntensity}</td>
                      <td>{log.vibrationLevel}</td>
                      <td>{log.deviceBattery}%</td>
                      <td>
                        {log.tx_hash ? (
                          <a 
                            href={`https://testnet.bscscan.com/tx/${log.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary"
                          >
                            View TX
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="14" className="text-center py-4">
                      {filter === 'ANOMALIES' 
                        ? 'No anomalies found in the logs' 
                        : 'No logs available'}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AttackLogs;