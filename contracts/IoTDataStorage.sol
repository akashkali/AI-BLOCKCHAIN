// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract IoTDataStorage {
    struct IoTData {
        uint256 timestamp;
        string deviceId;
        uint256 temperature;
        uint256 humidity;
        uint256 gasLevel;
        uint256 co2Level;
        uint256 airQuality;
        uint256 soundLevel;
        uint256 motionDetected;
        uint256 lightIntensity;
        uint256 vibrationLevel;
        uint256 deviceBattery;
        bool isAnomaly;
    }

    mapping(uint256 => IoTData) public dataRecords;
    uint256 public dataCounter;

    event DataStored(
        uint256 indexed id,
        string deviceId,
        uint256 timestamp,
        uint256 temperature,
        uint256 humidity,
        uint256 gasLevel,
        uint256 co2Level,
        uint256 airQuality,
        uint256 soundLevel,
        uint256 motionDetected,
        uint256 lightIntensity,
        uint256 vibrationLevel,
        uint256 deviceBattery,
        bool isAnomaly
    );

    function storeData(
        string memory _deviceId,
        uint256 _temperature,
        uint256 _humidity,
        uint256 _gasLevel,
        uint256 _co2Level,
        uint256 _airQuality,
        uint256 _soundLevel,
        uint256 _motionDetected,
        uint256 _lightIntensity,
        uint256 _vibrationLevel,
        uint256 _deviceBattery,
        bool _isAnomaly
    ) public {
        dataCounter++;
        dataRecords[dataCounter] = IoTData(
            block.timestamp,
            _deviceId,
            _temperature,
            _humidity,
            _gasLevel,
            _co2Level,
            _airQuality,
            _soundLevel,
            _motionDetected,
            _lightIntensity,
            _vibrationLevel,
            _deviceBattery,
            _isAnomaly
        );

        emit DataStored(
            dataCounter,
            _deviceId,
            block.timestamp,
            _temperature,
            _humidity,
            _gasLevel,
            _co2Level,
            _airQuality,
            _soundLevel,
            _motionDetected,
            _lightIntensity,
            _vibrationLevel,
            _deviceBattery,
            _isAnomaly
        );
    }

    function getData(uint256 _id) public view returns (
        uint256 timestamp,
        string memory deviceId,
        uint256 temperature,
        uint256 humidity,
        uint256 gasLevel,
        uint256 co2Level,
        uint256 airQuality,
        uint256 soundLevel,
        uint256 motionDetected,
        uint256 lightIntensity,
        uint256 vibrationLevel,
        uint256 deviceBattery,
        bool isAnomaly
    ) {
        IoTData memory data = dataRecords[_id];
        return (
            data.timestamp,
            data.deviceId,
            data.temperature,
            data.humidity,
            data.gasLevel,
            data.co2Level,
            data.airQuality,
            data.soundLevel,
            data.motionDetected,
            data.lightIntensity,
            data.vibrationLevel,
            data.deviceBattery,
            data.isAnomaly
        );
    }
}
