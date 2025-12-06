import React, { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { endpoints, fetchWithAuth } from '../../services/api';
import { useAuth } from '../../utils/auth';

const DeviceStatus = () => {
    const { user } = useAuth();
    const [devices, setDevices] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDeviceStatus();
        const interval = setInterval(fetchDeviceStatus, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchDeviceStatus = async () => {
        try {
            setLoading(true);
            const data = await fetchWithAuth(endpoints.deviceStatus);
            setDevices(data);
            setError(null);
        } catch (error) {
            setError(error);
            console.error('Error fetching device status:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (lastSeen) => {
        const now = new Date();
        const lastSeenDate = new Date(lastSeen);
        const diffMinutes = (now - lastSeenDate) / (1000 * 60);
        
        if (diffMinutes <= 5) return 'bg-green-100 text-green-800';
        if (diffMinutes <= 15) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    const getAnomalyCountColor = (count) => {
        if (count === 0) return 'bg-green-100 text-green-800';
        if (count <= 3) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    if (loading && devices.length === 0) return <div className="text-center p-4">Loading device status...</div>;
    if (error) return <div className="text-red-600 p-4">{error}</div>;
    if (devices.length === 0) return <div className="text-gray-600 p-4">No devices available</div>;

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Device Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {devices.map((device) => (
                    <div key={device.device_id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">{device.device_id}</h3>
                                <p className="text-sm text-gray-600">
                                    Last seen: {formatDistanceToNow(new Date(device.last_seen))} ago
                                </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(device.last_seen)}`}>
                                {formatDistanceToNow(new Date(device.last_seen))} ago
                            </span>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Temperature:</span>
                                <span className="font-medium">{device.latest_readings?.temperature || 'N/A'}°C</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Humidity:</span>
                                <span className="font-medium">{device.latest_readings?.humidity || 'N/A'}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Gas Level:</span>
                                <span className="font-medium">{device.latest_readings?.gas_level || 'N/A'} ppm</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Motion:</span>
                                <span className="font-medium">
                                    {device.latest_readings?.motion ? 'Detected' : 'No Motion'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Battery:</span>
                                <span className="font-medium">{device.latest_readings?.battery || 'N/A'}%</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Anomaly Count:</span>
                                <span className={`px-2 py-1 rounded-full text-sm ${getAnomalyCountColor(device.anomaly_count || 0)}`}>
                                    {device.anomaly_count || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DeviceStatus; 