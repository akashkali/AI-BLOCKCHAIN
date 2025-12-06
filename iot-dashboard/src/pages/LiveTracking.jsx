import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import { FaChartLine, FaRobot } from 'react-icons/fa';

const ANOMALY_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'TEMPERATURE_ATTACK', label: 'Temperature Attack' },
  { value: 'GAS_ATTACK', label: 'Gas Attack' },
  { value: 'MOTION_ATTACK', label: 'Motion Attack' },
  { value: 'BATTERY_ATTACK', label: 'Battery Attack' },
];

const LiveTracking = () => {
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [anomalyType, setAnomalyType] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    anomalies: 0,
    devices: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Enhanced fetch function with detailed error handling
  const fetchLogs = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      let endpoint;
      if (activeTab === 'anomalies') {
        endpoint = '/api/dashboard/attack_logs';
        if (anomalyType) {
          endpoint += `?anomalyType=${encodeURIComponent(anomalyType)}`;
        }
      } else {
        endpoint = '/api/dashboard/live_data';
      }
      
      // Add cache-busting timestamp
      const timestamp = forceRefresh ? Date.now() : undefined;
      const params = timestamp ? { _t: timestamp } : {};
      
      console.log(`Fetching logs from: ${endpoint}`, forceRefresh ? '(Force refresh)' : '');
      
      const res = await axios.get(endpoint, { params });
      
      console.log('API Response:', res);
      
      if (res.data && Array.isArray(res.data)) {
        // For anomalies tab, we only want anomaly logs
        if (activeTab === 'anomalies') {
          setLogs(res.data.slice(0, 20));
        } else {
          // For all logs tab, show all logs
          setLogs(res.data.slice(0, 20));
        }
      } else {
        throw new Error('Invalid response format: Expected array');
      }
    } catch (error) {
      console.error('Detailed fetch error:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      
      setError({
        message: 'Failed to load logs. Please try again.',
        details: error.response?.data?.message || error.message
      });
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Poll simulator logs
  useEffect(() => {
    fetchLogs(); // Initial fetch
    
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, anomalyType]);

  // Fetch stats with error handling
  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/dashboard/statistics');
      const deviceRes = await axios.get('/api/dashboard/device_status');
      setStats({
        total: res.data.total_records,
        anomalies: res.data.anomaly_count,
        devices: deviceRes.data.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const getLogClass = (log) => {
    if (log?.isAnomaly) {
      return 'bg-danger bg-opacity-10 border-start border-danger border-3';
    }
    return '';
  };

  const formatLogMessage = (log) => {
    if (!log) return 'Invalid log data';
    
    if (log.isAnomaly) {
      return (
        <span>
          <span className="badge bg-danger me-2">ANOMALY</span>
          <strong>{log.anomalyType || 'Unknown anomaly'}:</strong> {log.deviceId || 'Unknown device'} - {log.timestamp_human || 'No timestamp'}
        </span>
      );
    }
    return `${log.deviceId || 'Unknown device'} - ${log.timestamp_human || 'No timestamp'}: Normal data received`;
  };

  const renderLogsContent = () => {
    if (loading) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center h-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading {activeTab === 'anomalies' ? 'anomalies' : 'logs'}...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center h-100 text-danger">
          <i className="bi bi-exclamation-triangle-fill fs-1 mb-2"></i>
          <p className="text-center">
            <strong>{error.message}</strong>
            {error.details && <><br /><small>{error.details}</small></>}
          </p>
          <div className="d-flex gap-2 mt-2">
            <button 
              className="btn btn-sm btn-outline-primary"
              onClick={fetchLogs}
            >
              <i className="bi bi-arrow-repeat me-1"></i>
              Retry
            </button>
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={() => window.location.reload()}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    if (logs.length === 0) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
          <i className="bi bi-inbox fs-1 mb-2"></i>
          <p>No {activeTab === 'anomalies' ? 'anomalies' : 'logs'} available</p>
          {activeTab === 'anomalies' && stats.anomalies > 0 && (
            <small className="text-warning text-center">
              <i className="bi bi-exclamation-circle me-1"></i>
              There are {stats.anomalies} anomalies in the system but none in recent logs
            </small>
          )}
        </div>
      );
    }

    return (
      <div className="list-group">
        {logs.map((log, index) => (
          <div 
            key={index} 
            className={`list-group-item ${getLogClass(log)} mb-2 rounded`}
          >
            <div className="d-flex w-100 justify-content-between">
              <div className="mb-1">
                {formatLogMessage(log)}
              </div>
              <small className="text-muted">
                {log.timestamp ? new Date(log.timestamp * 1000).toLocaleTimeString() : 'No time'}
              </small>
            </div>
            {log?.isAnomaly && (
              <div className="mt-2">
                <small className="d-block">
                  <strong>Details:</strong> {log.anomalyType || 'Unknown anomaly type'} detected
                </small>
                {log.tx_hash && (
                  <small className="d-block">
                    <strong>TX Hash:</strong> {log.tx_hash.substring(0, 20)}...
                  </small>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      {/* Navigation Buttons */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Live Tracking</h2>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            onClick={() => fetchLogs(true)}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise"></i>
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button 
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => navigate('/user-dashboard')}
          >
            <FaChartLine />
            <span>Dashboard</span>
          </button>
          <button 
            className="btn btn-secondary d-flex align-items-center gap-2"
            onClick={() => navigate('/simulator')}
          >
            <FaRobot />
            <span>Simulator</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Total Logs</h5>
              <p className="card-text display-6">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <h5 className="card-title">Anomalies</h5>
              <p className="card-text display-6">{stats.anomalies}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Active Devices</h5>
              <p className="card-text display-6">{stats.devices}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Section */}
      <div className="mb-3">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
              disabled={loading}
            >
              <i className="bi bi-list-ul me-1"></i>
              All Logs
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'anomalies' ? 'active' : ''}`}
              onClick={() => setActiveTab('anomalies')}
              disabled={loading}
            >
              <i className="bi bi-exclamation-triangle me-1"></i>
              Anomalies
            </button>
          </li>
        </ul>
        {/* Anomaly type filter dropdown */}
        {activeTab === 'anomalies' && (
          <div className="mt-3 mb-2">
            <label htmlFor="anomalyTypeSelect" className="form-label me-2">Filter by Type:</label>
            <select
              id="anomalyTypeSelect"
              className="form-select w-auto d-inline-block"
              value={anomalyType}
              onChange={e => setAnomalyType(e.target.value)}
              disabled={loading}
            >
              {ANOMALY_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="bg-light p-3 rounded" style={{ height: '400px', overflowY: 'auto' }}>
        {renderLogsContent()}
      </div>
    </div>
  );
};

export default LiveTracking;