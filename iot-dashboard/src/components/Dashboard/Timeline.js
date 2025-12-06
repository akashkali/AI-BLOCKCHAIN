import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { useAuth } from '../../utils/auth';
import { endpoints, fetchWithAuth } from '../../services/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Timeline = () => {
    const { user } = useAuth();
    const [timelineData, setTimelineData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAllAnomalies, setShowAllAnomalies] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchTimelineData();
        const interval = setInterval(fetchTimelineData, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchTimelineData = async () => {
        try {
            setLoading(true);
            const data = await fetchWithAuth(endpoints.timeline);
            
            if (!data || !Array.isArray(data)) {
                throw new Error('Invalid data format received from API');
            }

            setTimelineData(data);
            setError(null);
        } catch (error) {
            setError(error.message || 'Failed to fetch timeline data');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !timelineData) return <div className="text-center p-4">Loading timeline data...</div>;
    if (error) {
        return (
            <div className="p-4">
                <div className="text-red-600 mb-4">{error}</div>
            </div>
        );
    }
    if (!timelineData || timelineData.length === 0) {
        return (
            <div className="p-4">
                <div className="text-gray-600 mb-4">No timeline data available for the last hour</div>
            </div>
        );
    }

    // Format time labels to show only minutes
    const formatTimeLabel = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const chartData = {
        labels: timelineData.map(item => formatTimeLabel(item.timestamp)),
        datasets: [
            {
                label: 'Temperature (°C)',
                data: timelineData.map(item => item.temperature || 0),
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 5,
            },
            {
                label: 'Humidity (%)',
                data: timelineData.map(item => item.humidity || 0),
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 5,
            },
            {
                label: 'Gas Level (ppm)',
                data: timelineData.map(item => item.gasLevel || 0),
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 5,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Sensor Readings - Last Hour',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        const timestamp = new Date(timelineData[context.dataIndex].timestamp * 1000).toLocaleString();
                        return `${label}: ${value} (${timestamp})`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
            },
            x: {
                ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                    callback: function(value, index) {
                        return index % Math.ceil(timelineData.length / 6) === 0 ? this.getLabelForValue(value) : '';
                    }
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
    };

    const anomalyData = timelineData.filter(item => item.isAnomaly) || [];
    const displayedAnomalies = anomalyData.slice(0, 2);

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Timeline</h2>
            <div className="h-[400px] mb-8">
                <Line data={chartData} options={chartOptions} />
            </div>
            
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Anomalies in Last Hour</h3>
                {anomalyData.length === 0 ? (
                    <div className="text-gray-600 p-4">No anomalies detected in the last hour</div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {displayedAnomalies.map((anomaly, index) => (
                                <div key={index} className="border rounded-lg p-4 bg-white">
                                    <div className="space-y-2">
                                        <p className="text-gray-600">
                                            {new Date(anomaly.timestamp * 1000).toLocaleString()}
                                        </p>
                                        <p className="font-semibold text-red-600">
                                            {anomaly.anomalyType}
                                        </p>
                                        <p className="text-gray-600">
                                            Device: {anomaly.deviceId}
                                        </p>
                                        <p className="text-red-500 font-medium">Anomaly</p>
                                        <div className="space-y-1">
                                            <p className="text-gray-600">Temperature</p>
                                            <p className="font-medium">{anomaly.temperature?.toFixed(2)}°C</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-gray-600">Humidity</p>
                                            <p className="font-medium">{anomaly.humidity?.toFixed(2)}%</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-gray-600">Gas Level</p>
                                            <p className="font-medium">{anomaly.gasLevel?.toFixed(2)} ppm</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-gray-600">Battery</p>
                                            <p className="font-medium">{anomaly.deviceBattery?.toFixed(2)}%</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {anomalyData.length > 2 && (
                            <div className="mt-4 text-center">
                                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                                    View More Details
                                </button>
                            </div>
                        )}
                        {showModal && (
                            <div className="modal-backdrop" style={{
                                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                                background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                            }}>
                                <div className="modal-content" style={{
                                    background: '#fff', padding: 24, borderRadius: 8, minWidth: 300, maxWidth: 500, maxHeight: '80vh', overflowY: 'auto'
                                }}>
                                    <h5>All Anomalies in Last Hour</h5>
                                    <div className="space-y-4">
                                        {anomalyData.map((anomaly, index) => (
                                            <div key={index} className="border rounded-lg p-4 bg-white mb-2">
                                                <div className="space-y-2">
                                                    <p className="text-gray-600">
                                                        {new Date(anomaly.timestamp * 1000).toLocaleString()}
                                                    </p>
                                                    <p className="font-semibold text-red-600">
                                                        {anomaly.anomalyType}
                                                    </p>
                                                    <p className="text-gray-600">
                                                        Device: {anomaly.deviceId}
                                                    </p>
                                                    <p className="text-red-500 font-medium">Anomaly</p>
                                                    <div className="space-y-1">
                                                        <p className="text-gray-600">Temperature</p>
                                                        <p className="font-medium">{anomaly.temperature?.toFixed(2)}°C</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-gray-600">Humidity</p>
                                                        <p className="font-medium">{anomaly.humidity?.toFixed(2)}%</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-gray-600">Gas Level</p>
                                                        <p className="font-medium">{anomaly.gasLevel?.toFixed(2)} ppm</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-gray-600">Battery</p>
                                                        <p className="font-medium">{anomaly.deviceBattery?.toFixed(2)}%</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 text-center">
                                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Timeline; 