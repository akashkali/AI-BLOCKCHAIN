import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';

const SimulatorControl = () => {
  const [status, setStatus] = useState('unknown');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    normal: 0,
    anomalies: 0,
    lastActivity: 'No activity yet'
  });
  const [devices, setDevices] = useState([]);

  // Fetch all data
  const fetchAllData = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        fetchStatus(),
        fetchStats(),
        fetchDevices()
      ]);
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch status
  const fetchStatus = async () => {
    try {
      const res = await axios.get('/api/simulator/status');
      // Normalize status
      let backendStatus = res.data.status;
      if (backendStatus === 'started') backendStatus = 'running';
      if (backendStatus === 'stopped') backendStatus = 'stopped';
      setStatus(backendStatus);
    } catch (err) {
      console.error('Error fetching simulator status:', err);
      setStatus('unknown');
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/dashboard/statistics');
      setStats({
        normal: res.data.normal_count,
        anomalies: res.data.anomaly_count,
        lastActivity: new Date().toLocaleTimeString()
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Fetch devices
  const fetchDevices = async () => {
    try {
      const res = await axios.get('/api/dashboard/device_status');
      setDevices(res.data.slice(0, 3)); // Show top 3 devices
    } catch (err) {
      console.error('Error fetching devices:', err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAllData();

    // Set up polling
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSimulator = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/simulator/start');
      let backendStatus = res.data.status;
      if (backendStatus === 'started') backendStatus = 'running';
      setStatus(backendStatus);
      showAlert('success', 'Simulator started! Data generation has begun.');
      await fetchAllData(); // Refresh all data after starting
    } catch (err) {
      showAlert('danger', `Failed to start simulator: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const stopSimulator = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/simulator/stop');
      let backendStatus = res.data.status;
      if (backendStatus === 'stopped') backendStatus = 'stopped';
      setStatus(backendStatus);
      showAlert('info', 'Simulator stopped! Data generation has ended.');
      await fetchAllData(); // Refresh all data after stopping
    } catch (err) {
      showAlert('danger', `Failed to stop simulator: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    const icon = {
      success: 'bi-play-circle-fill',
      danger: 'bi-exclamation-triangle-fill',
      info: 'bi-stop-circle-fill'
    }[type];

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} fade-in`;
    alertDiv.innerHTML = `
      <i class="bi ${icon} me-2"></i>
      <strong>${message}</strong>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
  };

  const getStatusBadge = () => {
    const statusConfig = {
      running: {
        color: 'success',
        icon: 'bi-activity',
        text: 'Running'
      },
      stopped: {
        color: 'danger',
        icon: 'bi-power',
        text: 'Stopped'
      },
      unknown: {
        color: 'secondary',
        icon: 'bi-question-circle',
        text: 'Unknown'
      }
    };

    const config = statusConfig[status] || statusConfig.unknown;
    return (
      <span className={`badge bg-${config.color}`}>
        <i className={`bi ${config.icon} me-1`}></i>
        {config.text}
      </span>
    );
  };

  return (
    <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-light">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">
          <i className="bi bi-cpu me-2 text-primary"></i>
          IoT Simulator Control Panel
        </h5>
        <div className="d-flex align-items-center">
          {getStatusBadge()}
          <button 
            className="btn btn-sm btn-outline-secondary ms-2" 
            onClick={fetchAllData}
            disabled={refreshing}
            title="Refresh status"
          >
            <i className={`bi bi-arrow-repeat ${refreshing ? 'spin' : ''}`}></i>
          </button>
        </div>
      </div>
      
      <div className="d-flex gap-2 mb-3">
        <button 
          className="btn btn-success d-flex align-items-center" 
          onClick={startSimulator} 
          disabled={loading || status === 'running'}
        >
          {loading && status !== 'running' ? (
            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
          ) : (
            <i className="bi bi-play-fill me-2"></i>
          )}
          Start Simulator
        </button>
        <button 
          className="btn btn-danger d-flex align-items-center" 
          onClick={stopSimulator} 
          disabled={loading || status !== 'running'}
        >
          {loading && status === 'running' ? (
            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
          ) : (
            <i className="bi bi-stop-fill me-2"></i>
          )}
          Stop Simulator
        </button>
      </div>

      {loading && (
        <div className="mt-2 text-muted">
          <i className="bi bi-arrow-repeat me-2"></i>
          Processing...
        </div>
      )}

      {/* Stats Cards */}
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Normal Data</h6>
                  <h3 className="card-title text-success">
                    {refreshing ? <i className="bi bi-arrow-repeat spin"></i> : stats.normal}
                  </h3>
                </div>
                <i className="bi bi-check-circle-fill text-success fs-3"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Anomalies</h6>
                  <h3 className="card-title text-danger">
                    {refreshing ? <i className="bi bi-arrow-repeat spin"></i> : stats.anomalies}
                  </h3>
                </div>
                <i className="bi bi-exclamation-triangle-fill text-danger fs-3"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Last Activity</h6>
                  <h3 className="card-title text-primary">
                    {refreshing ? <i className="bi bi-arrow-repeat spin"></i> : stats.lastActivity}
                  </h3>
                </div>
                <i className="bi bi-clock-history text-primary fs-3"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Device Status */}
      {devices.length > 0 && (
        <div className="mt-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">
              <i className="bi bi-device-hdd me-2"></i>
              Active Devices
            </h6>
            <small className="text-muted">Last updated: {new Date().toLocaleTimeString()}</small>
          </div>
          <div className="list-group">
            {devices.map((device, index) => (
              <div key={index} className="list-group-item list-group-item-action">
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-1">
                    <i className="bi bi-router me-2"></i>
                    {device._id}
                  </h6>
                  <small className={`badge ${device.anomaly_count > 0 ? 'bg-warning' : 'bg-success'}`}>
                    {device.anomaly_count} {device.anomaly_count === 1 ? 'anomaly' : 'anomalies'}
                  </small>
                </div>
                <div className="d-flex justify-content-between">
                  <small className="text-muted">
                    Last seen: {new Date(device.last_seen * 1000).toLocaleString()}
                  </small>
                  <small className="text-muted">
                    {Math.round(device.anomaly_percentage)}% anomalies
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .fade-in {
          animation: fadeIn 0.3s;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SimulatorControl;