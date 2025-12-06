# IoT Security System with Blockchain Integration

A comprehensive IoT security monitoring system that detects anomalies in sensor data and stores critical events on the blockchain (BSC Testnet). Features a real-time dashboard, machine learning-based anomaly detection, and blockchain immutability.

## 🚀 Features

- **Real-time IoT Data Monitoring**: Live tracking of sensor data from multiple devices
- **Anomaly Detection**: Isolation Forest ML model for detecting security threats
- **Blockchain Integration**: Store critical anomalies on BSC Testnet for immutability
- **Real-time Dashboard**: React-based dashboard with live updates via WebSocket
- **Device Management**: Trusted/untrusted device classification
- **Multiple Attack Detection**: Temperature, Gas, Motion, and Battery attacks
- **Admin Panel**: Comprehensive admin dashboard with analytics

## 📋 Prerequisites

- Python 3.8+
- Node.js 14+
- MongoDB Atlas account (or local MongoDB)
- BSC Testnet wallet with test BNB
- MetaMask or similar Web3 wallet

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/akashkali/AI-BLOCKCHAIN.git
cd BEP20-Token
```

### 2. Backend Setup

```bash
cd flask_app
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd iot-dashboard
npm install
```

### 4. Environment Configuration

Create a `.env` file in the `flask_app` directory:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/IoTSecurityDB

# API Configuration
API_KEY=your_api_key_here
SECRET_KEY=your_secret_key_here

# Blockchain Configuration
PRIVATE_KEY=your_private_key_here
WALLET_ADDRESS=your_wallet_address_here
CONTRACT_ADDRESS=your_contract_address_here

# API Endpoint (for simulator)
API_ENDPOINT=http://localhost:5000/predict_and_store
```

See `.env.example` for template.

## 🚀 Running the Application

### 1. Start Backend Server

```bash
cd flask_app
python app.py
```

The server will start on `http://localhost:5000`

### 2. Start Frontend

```bash
cd iot-dashboard
npm start
```

The dashboard will open at `http://localhost:3000`

### 3. Run IoT Simulator (Optional)

```bash
cd flask_app
python utils/iot_simulator.py
```

This will start sending simulated IoT data to the backend.

## 📁 Project Structure

```
BEP20-Token/
├── flask_app/              # Backend Flask application
│   ├── app.py             # Main Flask app
│   ├── models/            # ML models (Isolation Forest)
│   ├── utils/             # Utilities (simulator, notifications)
│   └── requirements.txt   # Python dependencies
├── iot-dashboard/         # Frontend React application
│   ├── src/              # React source code
│   └── package.json      # Node dependencies
├── contracts/            # Smart contracts (Solidity)
└── README.md            # This file
```

## 🔧 Configuration

### MongoDB Setup

1. Create a MongoDB Atlas account
2. Create a cluster
3. Add your IP to network access
4. Create a database user
5. Update `MONGO_URI` in `.env`

See `flask_app/MONGODB_SETUP.md` for detailed instructions.

### Blockchain Setup

1. Get test BNB from BSC Testnet faucet
2. Deploy the smart contract (see `contracts/IoTDataStorage.sol`)
3. Update `CONTRACT_ADDRESS` in `.env`
4. Update `PRIVATE_KEY` and `WALLET_ADDRESS`

## 📊 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /register` - User registration

### Dashboard
- `GET /api/dashboard/summary` - Dashboard summary
- `GET /api/dashboard/live_data` - Live sensor data
- `GET /api/dashboard/attack_logs` - Anomaly logs
- `GET /api/dashboard/statistics` - Statistics
- `GET /api/dashboard/timeline` - Timeline data

### Data Management
- `POST /predict_and_store` - Predict anomaly and store
- `GET /api/health` - Health check

### Admin
- `GET /api/admin/summary` - Admin summary
- `GET /api/admin/blockchain_records` - Blockchain records
- `GET /api/admin/anomaly_report` - Anomaly report

## 🤖 Machine Learning

The system uses **Isolation Forest** for anomaly detection:
- Trained on normal IoT sensor data
- Detects deviations from normal patterns
- No TensorFlow dependency (Render-compatible)

Model files:
- `isolation_forest_model.pkl` - Trained model
- `scaler.pkl` - Feature scaler

## 🔐 Security Features

- API key authentication
- JWT token-based user authentication
- Device trust classification
- Blockchain immutability for critical events
- Real-time anomaly alerts

## 📝 License

[Add your license here]

## 👥 Contributors

[Add contributors here]

## 📞 Support

For issues and questions, please open an issue on GitHub.

## 🙏 Acknowledgments

- BSC Testnet for blockchain infrastructure
- MongoDB Atlas for database hosting
- React and Flask communities
