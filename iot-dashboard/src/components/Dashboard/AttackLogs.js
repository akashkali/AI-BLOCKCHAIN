import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import websocketService from '../../services/websocket';
import { endpoints, handleApiError } from '../../services/api';
import { useAuth } from '../../utils/auth';

const AttackLogs = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAttackLogs();

        // Subscribe to real-time updates
        websocketService.subscribe('anomaly_alert', (alert) => {
            setLogs(prevLogs => [alert, ...prevLogs]);
        });

        return () => {
            websocketService.unsubscribe('anomaly_alert');
        };
    }, []);

    const fetchAttackLogs = async () => {
        try {
            const response = await endpoints.dashboard.getAttackLogs();
            setLogs(response.data);
            setError(null);
        } catch (error) {
            const errorMessage = handleApiError(error);
            setError(errorMessage);
        }
    };

    const getAnomalyColor = (type) => {
        switch (type) {
            case 'TEMPERATURE_ATTACK':
                return 'badge bg-danger';
            case 'GAS_ATTACK':
                return 'badge bg-warning text-dark';
            case 'MOTION_ATTACK':
                return 'badge bg-secondary';
            case 'BATTERY_ATTACK':
                return 'badge bg-warning';
            default:
                return 'badge bg-light text-dark';
        }
    };

    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="card shadow mb-4">
            <div className="card-body">
                <h2 className="card-title h4 mb-4">Attack Logs</h2>
                <div className="table-responsive">
                    <table className="table table-striped table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Time</th>
                                <th>Device</th>
                                <th>Attack Type</th>
                                <th>Details</th>
                                <th>Blockchain TX</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log, index) => (
                                <tr key={index}>
                                    <td>{format(new Date(log.timestamp * 1000), 'yyyy-MM-dd HH:mm:ss')}</td>
                                    <td>{log.deviceId}</td>
                                    <td>
                                        <span className={getAnomalyColor(log.anomalyType)}>
                                            {log.anomalyType}
                                        </span>
                                    </td>
                                    <td>
                                        {log.anomalyType === 'TEMPERATURE_ATTACK' && `Temperature: ${log.temperature}°C`}
                                        {log.anomalyType === 'GAS_ATTACK' && `Gas: ${log.gasLevel}ppm, CO2: ${log.co2Level}ppm`}
                                        {log.anomalyType === 'MOTION_ATTACK' && `Motion: ${log.motionDetected}, Sound: ${log.soundLevel}dB`}
                                        {log.anomalyType === 'BATTERY_ATTACK' && `Battery: ${log.deviceBattery}%`}
                                    </td>
                                    <td>
                                        {log.tx_hash ? (
                                            <a 
                                                href={`https://testnet.bscscan.com/tx/${log.tx_hash.startsWith('0x') ? log.tx_hash : '0x' + log.tx_hash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="link-primary"
                                            >
                                                View TX
                                            </a>
                                        ) : (
                                            <span className="text-muted">Not stored</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AttackLogs; 