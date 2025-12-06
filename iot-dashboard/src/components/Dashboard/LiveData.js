import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';

const LiveData = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const [liveData, setLiveData] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);

    // Add new data with animation and limit to 10 items
    const addDataWithAnimation = useCallback((newData) => {
        setLiveData(prev => {
            const updatedData = [newData, ...prev].slice(0, 10);
            return updatedData;
        });
    }, []);

    useEffect(() => {
        const socket = io(apiUrl, {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ['websocket']
        });

        socket.on('connect', () => {
            setIsConnected(true);
            setError(null);
        });

        socket.on('new_data', addDataWithAnimation);

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('connect_error', (err) => {
            setError('Connection error. Attempting to reconnect...');
            console.error('Socket error:', err);
        });

        return () => socket.disconnect();
    }, [apiUrl, addDataWithAnimation]);

    const getStatusColors = (isAnomaly) => ({
        bg: isAnomaly ? 'bg-red-50' : 'bg-gray-50',
        border: isAnomaly ? 'border-red-100' : 'border-gray-100',
        badge: isAnomaly ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
    });

    return (
        <div className="bg-white rounded-xl shadow-md p-5 h-full flex flex-col" style={{ maxWidth: 500, margin: '0 auto' }}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Live Sensor Feed</h2>
                <div className="flex items-center space-x-2">
                    <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-xs font-medium text-gray-500">
                        {isConnected ? 'LIVE' : 'OFFLINE'}
                    </span>
                </div>
            </div>

            {/* Fixed height container with scrollable content */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {liveData.length > 0 ? (
                        liveData.map((reading) => {
                            const colors = getStatusColors(reading.isAnomaly);
                            return (
                                <motion.div
                                    key={reading.timestamp}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: 100 }}
                                    transition={{ duration: 0.3 }}
                                    className={`mb-3 p-4 rounded-lg border ${colors.bg} ${colors.border} shadow-xs`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">
                                                {format(new Date(reading.timestamp * 1000), 'HH:mm:ss')}
                                            </p>
                                            <p className="text-xs mt-1 text-gray-600">
                                                Device: {reading.deviceId || 'N/A'}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
                                            {reading.isAnomaly ? 'ALERT' : 'NORMAL'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-3">
                                        <div className="space-y-2">
                                            <DataItem label="Temp" value={`${reading.temperature}°C`} />
                                            <DataItem label="Humidity" value={`${reading.humidity}%`} />
                                            <DataItem label="CO₂" value={`${reading.co2Level}ppm`} />
                                        </div>
                                        <div className="space-y-2">
                                            <DataItem label="Gas" value={reading.gasLevel} />
                                            <DataItem label="Sound" value={`${reading.soundLevel}dB`} />
                                            <DataItem label="Air Quality" value={reading.airQuality} />
                                        </div>
                                    </div>

                                    {reading.isAnomaly && (
                                        <div className="mt-3 pt-2 border-t border-gray-100">
                                            <p className="text-xs font-medium text-red-600">
                                                {reading.anomalyType || 'Anomaly detected'}
                                            </p>
                                            {reading.tx_hash && (
                                                <p className="text-xs text-gray-500 mt-1 truncate">
                                                    TX: {reading.tx_hash.substring(0, 12)}...
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center h-full text-center py-8"
                        >
                            <div className="bg-gray-100 p-4 rounded-full mb-3">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                            </div>
                            <p className="text-gray-500 text-sm">
                                {isConnected ? 'Waiting for first data point...' : 'Connecting to data feed...'}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #a0aec0;
                }
                .shadow-xs {
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03);
                }
            `}</style>
        </div>
    );
};

// Reusable data item component
const DataItem = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium">{value}</p>
    </div>
);

export default LiveData;