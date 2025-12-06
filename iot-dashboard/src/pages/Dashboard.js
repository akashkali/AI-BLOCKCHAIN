import React from 'react';
import LiveData from '../components/Dashboard/LiveData';
import AttackLogs from '../components/Dashboard/AttackLogs';
import Statistics from '../components/Dashboard/Statistics';
import DeviceStatus from '../components/Dashboard/DeviceStatus';
import Timeline from '../components/Dashboard/Timeline';

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">IoT Security Dashboard</h1>
                
                <div className="grid grid-cols-1 gap-8">
                    {/* Statistics Section */}
                    <Statistics />

                    {/* Timeline Section */}
                    <Timeline />

                    {/* Attack Logs Section */}
                    <AttackLogs />

                    {/* Live Data Section */}
                    <LiveData />

                    {/* Device Status Section */}
                    <DeviceStatus />
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 