import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import { useAuth } from '../../utils/auth';
import { endpoints, fetchWithAuth } from '../../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const Statistics = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatistics();
        const interval = setInterval(fetchStatistics, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const data = await fetchWithAuth(endpoints.statistics);
            setStats(data);
            setError(null);
        } catch (error) {
            setError(error);
            console.error('Error fetching statistics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !stats) return <div className="text-center p-4">Loading statistics...</div>;
    if (error) return <div className="text-red-600 p-4">{error}</div>;
    if (!stats) return <div className="text-gray-600 p-4">No statistics available</div>;

    const anomalyData = {
        labels: ['Normal', 'Anomalies'],
        datasets: [
            {
                data: [stats.normal_count || 0, stats.anomaly_count || 0],
                backgroundColor: ['#10B981', '#EF4444'],
                borderColor: ['#059669', '#DC2626'],
                borderWidth: 1,
            },
        ],
    };

    const anomalyTypeData = {
        labels: (stats.anomaly_types || []).map(type => type._id),
        datasets: [
            {
                data: (stats.anomaly_types || []).map(type => type.count),
                backgroundColor: [
                    '#EF4444', // Temperature
                    '#F59E0B', // Gas
                    '#8B5CF6', // Motion
                    '#EC4899', // Battery
                ],
                borderColor: [
                    '#DC2626',
                    '#D97706',
                    '#7C3AED',
                    '#DB2777',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Data Distribution</h3>
                    <div style={{ width: 300, height: 300, margin: '0 auto' }}>
                        <Doughnut data={anomalyData} />
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Anomaly Types</h3>
                    <div style={{ width: 300, height: 300, margin: '0 auto' }}>
                        <Doughnut data={anomalyTypeData} />
                    </div>
                </div>
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Records</p>
                    <p className="text-2xl font-bold">{stats.total_records || 0}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600">Anomalies</p>
                    <p className="text-2xl font-bold">{stats.anomaly_count || 0}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Normal Data</p>
                    <p className="text-2xl font-bold">{stats.normal_count || 0}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Anomaly Rate</p>
                    <p className="text-2xl font-bold">
                        {stats.total_records ? ((stats.anomaly_count / stats.total_records) * 100).toFixed(1) : 0}%
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Statistics; 