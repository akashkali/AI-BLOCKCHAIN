from flask import Flask, request, jsonify, send_file
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash
from flask_cors import CORS
import jwt
from datetime import datetime, timedelta
from flask import Flask, jsonify, request
from flask import request, jsonify
from functools import wraps
from web3 import Web3
import json
import os
from dotenv import load_dotenv
from datetime import datetime
import joblib
import numpy as np
from pymongo import MongoClient
from bson import ObjectId
import logging
from bson.objectid import ObjectId
from flask_socketio import SocketIO
import subprocess
import time
from utils.notify import send_email, send_sms
import io
import csv


# Load environment variables
load_dotenv()
API_KEY = os.getenv("API_KEY")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
WALLET_ADDRESS = os.getenv("WALLET_ADDRESS")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/IoTSecurityDB")

# Initialize Flask app with CORS and SocketIO
app = Flask(__name__)

# CORS configuration - allow all origins in development, restrict in production
# Set ALLOWED_ORIGINS environment variable in production (comma-separated)
allowed_origins = os.getenv('ALLOWED_ORIGINS', '*').split(',')
CORS(app, origins=allowed_origins)  # Enable CORS

# SocketIO configuration for Render
# Use gevent for Python 3.13 compatibility (eventlet doesn't work with Python 3.13)
socketio = SocketIO(
    app, 
    cors_allowed_origins=allowed_origins,
    async_mode='gevent'  # Compatible with Python 3.13
)

# Set custom JSON encoder
class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime):
            return o.isoformat()
        if isinstance(o, bytes):
            return o.decode('utf-8')
        if isinstance(o, (np.int_, np.intc, np.intp, np.int8,
                         np.int16, np.int32, np.int64, np.uint8,
                         np.uint16, np.uint32, np.uint64)):
            return int(o)
        if isinstance(o, (np.float_, np.float16, np.float32, np.float64)):
            return float(o)
        if isinstance(o, (np.ndarray,)):
            return o.tolist()
        return super().default(o)

app.json_encoder = JSONEncoder

# Initialize logging
logging.basicConfig(level=logging.INFO, filename='flask_app.log', force=True)
logger = logging.getLogger(__name__)

# Connect to MongoDB
try:
    logger.info(f"Connecting to MongoDB: {MONGO_URI.split('@')[1] if '@' in MONGO_URI else 'MongoDB'}")  # Log without credentials
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Test the connection
    client.admin.command('ping')
    logger.info("✅ MongoDB connection successful")
    
    # Get or create database
    db = client['IoTSecurityDB']
    logger.info(f"Using database: {db.name}")
    
    collection = db['iot_data']
    users_collection = db["users"]
    trusted_devices_collection = db['trusted_devices']
    devices_collection = db['devices']
    
    # Verify collections exist
    collections = db.list_collection_names()
    logger.info(f"Available collections: {collections}")
    
except Exception as e:
    logger.error(f"❌ MongoDB connection failed: {str(e)}")
    logger.error(f"MONGO_URI: {MONGO_URI.split('@')[1] if '@' in MONGO_URI else MONGO_URI}")
    raise

# Connect to BSC Testnet
bsc_url = "https://data-seed-prebsc-1-s1.binance.org:8545/"
web3 = Web3(Web3.HTTPProvider(bsc_url))

# Load contract ABI
with open("flask-backend/contract_abi.json", "r") as f:
    abi = json.load(f)

# Create contract instance
contract = web3.eth.contract(address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=abi)

# ====== Load AI Models ======
iso_model = joblib.load('models/isolation_forest_model.pkl')
scaler = joblib.load('models/scaler.pkl')

# Middleware for API key
def require_api_key(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.headers.get('x-api-key') != API_KEY:
            return jsonify({'error': 'Invalid API Key'}), 403
        return f(*args, **kwargs)
    return decorated

# Helper function
def format_iot_data(data):
    return {
        "timestamp": data[0],
        "timestamp_human": datetime.utcfromtimestamp(data[0]).strftime('%Y-%m-%d %H:%M:%S'),
        "deviceId": data[1],
        "temperature": data[2],
        "humidity": data[3],
        "gasLevel": data[4],
        "co2Level": data[5],
        "airQuality": data[6],
        "soundLevel": data[7],
        "motionDetected": data[8],
        "lightIntensity": data[9],
        "vibrationLevel": data[10],
        "deviceBattery": data[11],
        "isAnomaly": data[12],
        "alert": "⚠️ Anomaly Detected!" if data[12] else "✅ Normal Data"
    }

# Helper to convert ObjectId to string
def convert_objectid(doc):
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])
    return doc

# 🆕 API to predict anomalies
@app.route('/predict', methods=['POST'])
@require_api_key
def predict_anomaly():
    try:
        input_data = request.get_json()
        features = [
            input_data['temperature'],
            input_data['humidity'],
            input_data['gasLevel'],
            input_data['co2Level'],
            input_data['airQuality'],
            input_data['soundLevel'],
            input_data['motionDetected'],
            input_data['lightIntensity'],
            input_data['vibrationLevel'],
            input_data['deviceBattery']
        ]
        features = np.array(features).reshape(1, -1)
        features_scaled = scaler.transform(features)
        iso_pred = iso_model.predict(features_scaled)
        iso_pred = np.where(iso_pred == -1, 1, 0)
        final_pred = int(iso_pred[0])
        return jsonify({
            "isolation_forest_prediction": int(iso_pred[0]),
            "final_prediction": final_pred,
            "message": "🚨 Anomaly Detected" if final_pred else "✅ Normal Data"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

simulator_process = None

@app.route('/api/simulator/start', methods=['POST'])
@require_api_key
def start_simulator():
    global simulator_process
    if simulator_process is None or simulator_process.poll() is not None:
        try:
            simulator_process = subprocess.Popen(
                ['python', 'utils/iot_simulator.py'],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            # Wait a moment and check for errors
            time.sleep(2)
            if simulator_process.poll() is not None:
                out, err = simulator_process.communicate()
                logger.error("Simulator failed to start.")
                logger.error("STDOUT: %s", out.decode())
                logger.error("STDERR: %s", err.decode())
                return jsonify({'status': 'failed', 'error': err.decode()})
            return jsonify({'status': 'started'})
        except Exception as e:
            logger.error("Error starting simulator: %s", str(e))
            return jsonify({'status': 'failed', 'error': str(e)})
    else:
        return jsonify({'status': 'already running'})

@app.route('/api/simulator/stop', methods=['POST'])
@require_api_key
def stop_simulator():
    global simulator_process
    if simulator_process and simulator_process.poll() is None:
        simulator_process.terminate()
        simulator_process.wait()
        simulator_process = None
        return jsonify({'status': 'stopped'})
    else:
        return jsonify({'status': 'not running'})

@app.route('/api/simulator/status', methods=['GET'])
@require_api_key
def simulator_status():
    global simulator_process
    if simulator_process and simulator_process.poll() is None:
        return jsonify({'status': 'running'})
    else:
        return jsonify({'status': 'stopped'})

# ✅ Predict anomaly and store on blockchain
@app.route('/predict_and_store', methods=['POST'])
@require_api_key
def predict_and_store():
    try:
        # Get request data
        data = request.get_json()
        if not data:
            logger.error("No JSON data received")
            return jsonify({"error": "No JSON data received"}), 400

        logger.info(f"Received data from device: {data.get('deviceId', 'unknown')}")

        # Required fields check
        required_fields = [
            'deviceId', 'temperature', 'humidity', 'gasLevel', 'co2Level',
            'airQuality', 'soundLevel', 'motionDetected', 'lightIntensity',
            'vibrationLevel', 'deviceBattery', 'anomalyType'
        ]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            logger.error(f"Missing required fields: {missing_fields}")
            return jsonify({"error": f"Missing required fields: {missing_fields}"}), 400

        # Prepare data for prediction
        input_features = [
            data['temperature'], data['humidity'], data['gasLevel'], data['co2Level'],
            data['airQuality'], data['soundLevel'], data['motionDetected'],
            data['lightIntensity'], data['vibrationLevel'], data['deviceBattery']
        ]
        input_scaled = scaler.transform([input_features])

        # Get model predictions for logging purposes
        isolation_pred = iso_model.predict(input_scaled)[0]
        isolation_pred = int(np.where(isolation_pred == -1, 1, 0))

        # Strictly follow simulator's anomaly type
        is_anomaly = data['anomalyType'] != 'NORMAL'

        logger.info(f"Prediction results - Isolation Forest: {isolation_pred}")
        logger.info(f"📏 Scaled Input: {input_scaled}")
        logger.info(f"🔍 IsolationForest Prediction: {isolation_pred}")

        # Prepare document for MongoDB
        iot_record = {
            "timestamp": int(datetime.utcnow().timestamp()),
            "deviceId": data['deviceId'],
            "temperature": float(data['temperature']),
            "humidity": float(data['humidity']),
            "gasLevel": float(data['gasLevel']),
            "co2Level": float(data['co2Level']),
            "airQuality": float(data['airQuality']),
            "soundLevel": float(data['soundLevel']),
            "motionDetected": int(data['motionDetected']),
            "lightIntensity": float(data['lightIntensity']),
            "vibrationLevel": float(data['vibrationLevel']),
            "deviceBattery": float(data['deviceBattery']),
            "isAnomaly": is_anomaly,
            "anomalyType": data['anomalyType'],
            "iso_pred": int(isolation_pred)
        }

        # Save to iot_data (always)
        result = collection.insert_one(iot_record)
        logger.info(f"Data stored in iot_data successfully with ID: {result.inserted_id}")

        # If anomaly, also save to anomalies collection
        if is_anomaly:
            anomalies_collection = db['anomalies']
            anomaly_doc = dict(iot_record)  # Copy
            # Add tx_hash if available later
            anomaly_doc['tx_hash'] = None
            anomalies_result = anomalies_collection.insert_one(anomaly_doc)
            logger.info(f"Anomaly data stored in anomalies collection with ID: {anomalies_result.inserted_id}")

            # Send notification to admin
            try:
                subject = f"Anomaly Detected: {data.get('anomalyType', 'Unknown')}"
                body = f"Device: {data.get('deviceId')}\nType: {data.get('anomalyType')}\nTime: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}\nTemperature: {data.get('temperature')}\nHumidity: {data.get('humidity')}\nGas Level: {data.get('gasLevel')}"
                send_email(subject, body)
                send_sms(f"Anomaly: {data.get('anomalyType')} on {data.get('deviceId')}")
                logger.info("Admin notified via email and SMS.")
            except Exception as notify_err:
                logger.error(f"Failed to send anomaly notification: {notify_err}")

        # Only store on blockchain if it's a real anomaly (not NORMAL)
        store_on_blockchain = data.get('store_on_blockchain', False)
        tx_hash = None
        blockchain_error = None
        if store_on_blockchain and is_anomaly and data['anomalyType'] != 'NORMAL':
            try:
                logger.info('Attempting to store anomaly on blockchain...')
                nonce = web3.eth.get_transaction_count(WALLET_ADDRESS)
                txn = contract.functions.storeData(
                    data['deviceId'],
                    int(data['temperature']),
                    int(data['humidity']),
                    int(data['gasLevel']),
                    int(data['co2Level']),
                    int(data['airQuality']),
                    int(data['soundLevel']),
                    int(data['motionDetected']),
                    int(data['lightIntensity']),
                    int(data['vibrationLevel']),
                    int(data['deviceBattery']),
                    True
                ).build_transaction({
                    'from': WALLET_ADDRESS,
                    'nonce': nonce,
                    'gas': 500000,
                    'gasPrice': web3.to_wei('10', 'gwei')
                })
                signed_txn = web3.eth.account.sign_transaction(txn, private_key=PRIVATE_KEY)
                tx_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)
                receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
                collection.update_one(
                    {"_id": result.inserted_id},
                    {"$set": {"tx_hash": tx_hash.hex(), "block": receipt.blockNumber}}
                )
                # Also update anomalies collection if anomaly
                if is_anomaly:
                    anomalies_collection.update_one(
                        {"_id": anomalies_result.inserted_id},
                        {"$set": {"tx_hash": tx_hash.hex(), "block": receipt.blockNumber}}
                    )
                logger.info(f"Anomaly data stored on blockchain with tx_hash: {tx_hash.hex()}")
            except Exception as e:
                blockchain_error = str(e)
                logger.error(f"Error storing anomaly on blockchain: {blockchain_error}")

        # Get the inserted document with _id
        inserted_doc = collection.find_one({"_id": result.inserted_id})
        if inserted_doc:
            logger.info(f"Retrieved document from iot_data: {inserted_doc}")
            inserted_doc = convert_objectid(inserted_doc)
            logger.info(f"Converted document with string _id: {inserted_doc}")

        # Prepare socket event data
        socket_data = {
            'timestamp': iot_record['timestamp'],
            'timestamp_human': datetime.utcfromtimestamp(iot_record['timestamp']).strftime('%Y-%m-%d %H:%M:%S'),
            'deviceId': iot_record['deviceId'],
            'temperature': iot_record['temperature'],
            'humidity': iot_record['humidity'],
            'gasLevel': iot_record['gasLevel'],
            'co2Level': iot_record['co2Level'],
            'airQuality': iot_record['airQuality'],
            'soundLevel': iot_record['soundLevel'],
            'motionDetected': iot_record['motionDetected'],
            'lightIntensity': iot_record['lightIntensity'],
            'vibrationLevel': iot_record['vibrationLevel'],
            'deviceBattery': iot_record['deviceBattery'],
            'isAnomaly': iot_record['isAnomaly'],
            'anomalyType': iot_record['anomalyType'],
            'iso_pred': iot_record['iso_pred'],
            'tx_hash': tx_hash.hex() if tx_hash else None
        }

        # Emit socket event
        socketio.emit('new_data', socket_data)

        # Return response with the complete document
        response = {
            "document": inserted_doc,
            "isAnomaly": is_anomaly,
            "anomalyType": data['anomalyType'],
            "iso_pred": int(isolation_pred),
            "tx_hash": tx_hash.hex() if tx_hash else None,
            "blockchain_error": blockchain_error,
            "message": f"🚨 Anomaly Detected - Type: {data['anomalyType']}" if is_anomaly else "✅ Normal Data"
        }

        logger.info(f"Sending response: {response}")

        # Update devices collection (upsert)
        device_id = data['deviceId']
        trusted = data.get('trusted', False)
        now_ts = int(datetime.utcnow().timestamp())

        devices_collection.update_one(
            {"deviceId": device_id},
            {"$set": {
                "deviceId": device_id,
                "trusted": trusted,
                "last_seen": now_ts
            }},
            upsert=True
        )
        # If trusted, ensure in trusted_devices collection
        if trusted:
            trusted_devices_collection.update_one(
                {"deviceId": device_id},
                {"$set": {"deviceId": device_id}},
                upsert=True
            )

        return jsonify(response)

    except Exception as e:
        logger.error(f"Error in predict_and_store: {str(e)}")
        logger.error(f"Error type: {type(e)}")
        logger.error(f"Error args: {e.args}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/mongo_data', methods=['GET'])
@require_api_key
def get_mongo_data():
    try:
        data = list(collection.find({}).sort("timestamp", -1))
        return JSONEncoder().encode(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/anomalies_mongo', methods=['GET'])
def get_only_anomalies():
    try:
        # Find only documents where isAnomaly is True
        anomalies = list(collection.find({"isAnomaly": True}).sort("timestamp", -1))
        return JSONEncoder().encode(anomalies), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/latest_data_mongo', methods=['GET'])
@require_api_key
def get_latest_data_mongo():
    try:
        latest = collection.find().sort("timestamp", -1).limit(1)
        result = [doc for doc in latest]
        for r in result:
            r['_id'] = str(r['_id'])
        return jsonify(result[0] if result else {"message": "No data found"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/count_mongo', methods=['GET'])
@require_api_key
def count_anomalies_mongo():
    try:
        count = collection.count_documents({"isAnomaly": True})
        return jsonify({"anomaly_count": count})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/all_data_mongo', methods=['GET'])
@require_api_key
def get_all_data_mongo():
    try:
        data = collection.find()
        result = []
        for doc in data:
            doc['_id'] = str(doc['_id'])
            result.append(doc)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_data_mongo/<id>', methods=['GET'])
@require_api_key
def get_data_mongo_by_id(id):
    try:
        data = collection.find_one({"_id": ObjectId(id)})
        if data:
            data['_id'] = str(data['_id'])
            return jsonify(data)
        else:
            return jsonify({"error": "Data not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/store_data', methods=['POST'])
@require_api_key
def store_data():
    try:
        data = request.get_json()
        required_fields = [
            'deviceId', 'temperature', 'humidity', 'gasLevel', 'co2Level',
            'airQuality', 'soundLevel', 'motionDetected', 'lightIntensity',
            'vibrationLevel', 'deviceBattery', 'isAnomaly'
        ]
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
        nonce = web3.eth.get_transaction_count(WALLET_ADDRESS)
        txn = contract.functions.storeData(
            data['deviceId'],
            int(data['temperature']),
            int(data['humidity']),
            int(data['gasLevel']),
            int(data['co2Level']),
            int(data['airQuality']),
            int(data['soundLevel']),
            int(data['motionDetected']),
            int(data['lightIntensity']),
            int(data['vibrationLevel']),
            int(data['deviceBattery']),
            bool(data['isAnomaly'])
        ).build_transaction({
            'from': WALLET_ADDRESS,
            'nonce': nonce,
            'gas': 500000,
            'gasPrice': web3.to_wei('10', 'gwei')
        })
        signed_txn = web3.eth.account.sign_transaction(txn, private_key=PRIVATE_KEY)
        tx_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        return jsonify({"message": "Data stored on blockchain", "tx_hash": tx_hash.hex()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/count', methods=['GET'])
def get_data_count():
    try:
        count = contract.functions.dataCounter().call()
        return jsonify({"data_count": count})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_data/<int:id>', methods=['GET'])
@require_api_key
def get_data(id):
    try:
        data = contract.functions.dataRecords(id).call()
        result = {
            "timestamp": data[0],
            "deviceId": data[1],
            "temperature": data[2],
            "humidity": data[3],
            "gasLevel": data[4],
            "co2Level": data[5],
            "airQuality": data[6],
            "soundLevel": data[7],
            "motionDetected": data[8],
            "lightIntensity": data[9],
            "vibrationLevel": data[10],
            "deviceBattery": data[11],
            "isAnomaly": data[12]
        }
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/latest_data', methods=['GET'])
@require_api_key
def get_latest_data():
    try:
        total = contract.functions.dataCounter().call()
        if total == 0:
            return jsonify({"error": "No data available yet"}), 404
        latest_data = contract.functions.getData(total - 1).call()
        return jsonify(format_iot_data(latest_data))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/all_data', methods=['GET'])
def get_all_data():
    try:
        count = contract.functions.dataCounter().call()
        all_data = []
        for i in range(count):
            data = contract.functions.getData(i).call()
            data_dict = {
                "id": i,
                "timestamp": data[0],
                "timestamp_human": datetime.fromtimestamp(data[0]).strftime('%Y-%m-%d %H:%M:%S'),
                "deviceId": data[1],
                "temperature": data[2],
                "humidity": data[3],
                "gasLevel": data[4],
                "co2Level": data[5],
                "airQuality": data[6],
                "soundLevel": data[7],
                "motionDetected": data[8],
                "lightIntensity": data[9],
                "vibrationLevel": data[10],
                "deviceBattery": data[11],
                "isAnomaly": data[12]
            }
            all_data.append(data_dict)
        return jsonify(all_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/anomalies', methods=['GET'])
def get_anomalies():
    try:
        count = contract.functions.dataCounter().call()
        anomalies = []
        for i in range(count):
            data = contract.functions.getData(i).call()
            if data[12]:
                anomalies.append({
                    "id": i,
                    "timestamp": data[0],
                    "timestamp_human": datetime.fromtimestamp(data[0]).strftime('%Y-%m-%d %H:%M:%S'),
                    "deviceId": data[1],
                    "temperature": data[2],
                    "humidity": data[3],
                    "gasLevel": data[4],
                    "co2Level": data[5],
                    "airQuality": data[6],
                    "soundLevel": data[7],
                    "motionDetected": data[8],
                    "lightIntensity": data[9],
                    "vibrationLevel": data[10],
                    "deviceBattery": data[11],
                    "isAnomaly": data[12],
                    "alert": "🚨 Anomaly Detected!"
                })
        return jsonify(anomalies)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# When new data comes in
@socketio.on('new_data')
def handle_new_data(data):
    socketio.emit('new_data', data)

# Secret key from .env
SECRET_KEY = os.getenv("SECRET_KEY")

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"message": "User not found"}), 404

    # Compare hashed password
    if not check_password_hash(user["password"], password):
        return jsonify({"message": "Invalid password"}), 401

    token = jwt.encode({
        "email": user["email"],
        "role": user["role"],
        "exp": datetime.utcnow() + timedelta(hours=1)
    }, SECRET_KEY, algorithm="HS256")

    return jsonify({
        "message": "Login successful",
        "role": user["role"],
        "token": token
    }), 200


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    name = data.get('name')
    password = data.get('password')
    role = data.get('role', 'user')

    if not email or not password or not name:
        return jsonify({"error": "Missing fields"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 409

    hashed_password = generate_password_hash(password)

    user_data = {
        "name": name,
        "email": email,
        "password": hashed_password,
        "role": role
    }

    users_collection.insert_one(user_data)
    return jsonify({"message": "User registered successfully"}), 201

# ====== Enhanced Dashboard Routes ======

@app.route('/api/dashboard/summary', methods=['GET'])
@require_api_key
def dashboard_summary():
    try:
        # Get total devices
        total_devices = collection.distinct('deviceId')
        total_devices = len(total_devices)

        # Get total records
        total_records = collection.count_documents({})

        # Get latest readings
        latest_readings = collection.find().sort('timestamp', -1).limit(1)
        latest_data = list(latest_readings)[0] if latest_readings else {}
        
        # Convert ObjectId to string
        if latest_data and '_id' in latest_data:
            latest_data['_id'] = str(latest_data['_id'])

        # Get anomaly count
        anomaly_count = collection.count_documents({'isAnomaly': True})

        response_data = {
            'total_devices': total_devices,
            'total_records': total_records,
            'latest_readings': latest_data,
            'anomaly_count': anomaly_count
        }
        
        return JSONEncoder().encode(response_data), 200, {'Content-Type': 'application/json'}
    except Exception as e:
        print(f"Error in dashboard_summary: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/dashboard/chart_data', methods=['GET'])
@require_api_key
def chart_data():
    try:
        twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
        pipeline = [
            {"$match": {"timestamp": {"$gte": twenty_four_hours_ago.timestamp()}}},
            {"$sort": {"timestamp": 1}},
            {"$limit": 100},
            {"$project": {
                "timestamp": 1,
                "temperature": 1,
                "humidity": 1,
                "isAnomaly": 1,
                "timestamp_human": {
                    "$dateToString": {
                        "format": "%H:%M",
                        "date": {"$toDate": {"$multiply": ["$timestamp", 1000]}}
                    }
                }
            }}
        ]
        chart_data = list(collection.aggregate(pipeline))
        return JSONEncoder().encode(chart_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/dashboard/devices', methods=['GET'])
@require_api_key
def device_list():
    try:
        devices = collection.distinct("deviceId")
        device_stats = []
        for device in devices:
            count = collection.count_documents({"deviceId": device})
            anomalies = collection.count_documents({"deviceId": device, "isAnomaly": True})
            device_stats.append({
                "deviceId": device,
                "total_readings": count,
                "anomaly_count": anomalies,
                "last_seen": collection.find_one(
                    {"deviceId": device},
                    {"timestamp": 1, "_id": 0},
                    sort=[("timestamp", -1)]
                )
            })
        return jsonify(device_stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ====== ADMIN DASHBOARD ROUTES ======

@app.route('/api/admin/summary', methods=['GET'])
@require_api_key
def admin_summary():
    try:
        # MongoDB stats
        total_records = collection.count_documents({})
        anomaly_count = collection.count_documents({"isAnomaly": True})
        device_ids = list(collection.distinct("deviceId"))
        unique_devices = len(device_ids)
        latest_record = collection.find_one(sort=[("timestamp", -1)])
        last_updated = latest_record["timestamp"] if latest_record else None
        # Blockchain stats (count records with tx_hash)
        blockchain_total = collection.count_documents({"tx_hash": {"$exists": True}})
        blockchain_anomalies = collection.count_documents({"tx_hash": {"$exists": True}, "isAnomaly": True})
        # System health
        system_health = {
            "last_updated": last_updated
        }
        response_data = {
            "mongo": {
                "total": total_records,
                "anomalies": anomaly_count,
                "devices": unique_devices
            },
            "blockchain": {
                "total": blockchain_total,
                "anomalies": blockchain_anomalies
            },
            "system_health": system_health
        }
        return jsonify(response_data)
    except Exception as e:
        print(f"Error in admin_summary: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/blockchain_records', methods=['GET'])
@require_api_key
def blockchain_records():
    try:
        # Get records from MongoDB that have blockchain transactions
        records = collection.find({"tx_hash": {"$exists": True}}).sort("timestamp", -1)
        result = []
        for idx, record in enumerate(records):
            record['_id'] = str(record['_id'])
            result.append({
                "id": idx + 1,
                "deviceId": record["deviceId"],
                "timestamp": record["timestamp"],
                "timestamp_human": datetime.utcfromtimestamp(record["timestamp"]).strftime('%Y-%m-%d %H:%M:%S'),
                "tx_hash": record["tx_hash"],
                "tx_details": {"block": record.get("block", "Pending")},
                "isAnomaly": record.get("isAnomaly", False)
            })
        return jsonify(result)
    except Exception as e:
        print(f"Error in blockchain_records: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/device_metrics', methods=['GET'])
@require_api_key
def device_metrics():
    try:
        devices = collection.distinct("deviceId")
        result = []
        for device in devices:
            device_records = list(collection.find({"deviceId": device}))
            readings = len(device_records)
            anomaly_count = sum(1 for r in device_records if r.get("isAnomaly"))
            avg_temp = round(sum(r.get("temperature", 0) for r in device_records) / readings, 2) if readings else 0
            avg_humidity = round(sum(r.get("humidity", 0) for r in device_records) / readings, 2) if readings else 0
            last_seen = max((r.get("timestamp", 0) for r in device_records), default=None)
            anomaly_rate = round((anomaly_count / readings) * 100, 2) if readings else 0
            result.append({
                "deviceId": device,
                "readings": readings,
                "anomalyRate": anomaly_rate,
                "avgTemp": avg_temp,
                "avgHumidity": avg_humidity,
                "lastSeen": last_seen
            })
        return jsonify(result)
    except Exception as e:
        print(f"Error in device_metrics: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/anomaly_report', methods=['GET'])
@require_api_key
def anomaly_report():
    try:
        # Get all anomalies
        anomalies = list(collection.find({"isAnomaly": True}).sort("timestamp", -1))
        # Time series (by day)
        time_series = {}
        by_type = {}
        for anomaly in anomalies:
            day = datetime.utcfromtimestamp(anomaly["timestamp"]).strftime('%Y-%m-%d')
            time_series[day] = time_series.get(day, 0) + 1
            atype = anomaly.get("anomalyType", "Unknown")
            by_type[atype] = by_type.get(atype, 0) + 1
        time_series_list = [{"_id": day, "count": count} for day, count in sorted(time_series.items())]
        # Map to expected keys
        by_type_map = {
            "high_temp": by_type.get("TEMPERATURE_ATTACK", 0),
            "high_gas": by_type.get("GAS_ATTACK", 0),
            "high_sound": by_type.get("MOTION_ATTACK", 0)
        }
        response = {
            "time_series": time_series_list,
            "by_type": by_type_map,
            "anomalies": [
                {
                    "timestamp": a["timestamp"],
                    "deviceId": a["deviceId"],
                    "anomalyType": a.get("anomalyType", "Unknown"),
                    "temperature": a.get("temperature"),
                    "humidity": a.get("humidity"),
                    "gasLevel": a.get("gasLevel"),
                    "co2Level": a.get("co2Level"),
                    "airQuality": a.get("airQuality"),
                    "soundLevel": a.get("soundLevel"),
                    "motionDetected": a.get("motionDetected"),
                    "lightIntensity": a.get("lightIntensity"),
                    "vibrationLevel": a.get("vibrationLevel"),
                    "deviceBattery": a.get("deviceBattery"),
                    "tx_hash": a.get("tx_hash"),
                } for a in anomalies
            ]
        }
        return jsonify(response)
    except Exception as e:
        print(f"Error in anomaly_report: {str(e)}")
        return jsonify({"error": str(e)}), 500

# ====== Dashboard and Monitoring Endpoints ======

@app.route('/api/dashboard/live_data', methods=['GET'])
@require_api_key
def get_live_data():
    try:
        # Get the latest 10 records
        latest_data = list(collection.find().sort("timestamp", -1).limit(10))
        for doc in latest_data:
            doc['_id'] = str(doc['_id'])
            ts = doc.get('timestamp')
            doc['timestamp_human'] = (
                datetime.utcfromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S') if ts else None
            )
        return jsonify(latest_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/dashboard/attack_logs', methods=['GET'])
@require_api_key
def get_attack_logs():
    try:
        anomaly_type = request.args.get('anomalyType')
        anomalies_collection = db['anomalies']
        # Filter out records with missing, null, or non-numeric timestamps
        match_stage = {"isAnomaly": True, "timestamp": {"$exists": True, "$ne": None, "$type": "number"}}
        if anomaly_type:
            match_stage["anomalyType"] = anomaly_type

        pipeline = [
            {"$match": match_stage},
            {"$sort": {"timestamp": -1}},
            {"$project": {
                "timestamp": {"$ifNull": ["$timestamp", 0]},
                "timestamp_human": {
                    "$dateToString": {
                        "format": "%Y-%m-%d %H:%M:%S",
                        "date": {"$toDate": {"$multiply": [
                            {"$ifNull": ["$timestamp", 0]}, 1000
                        ]}}
                    }
                },
                "deviceId": 1,
                "anomalyType": 1,
                "temperature": 1,
                "humidity": 1,
                "gasLevel": 1,
                "co2Level": 1,
                "airQuality": 1,
                "soundLevel": 1,
                "motionDetected": 1,
                "lightIntensity": 1,
                "vibrationLevel": 1,
                "deviceBattery": 1,
                "tx_hash": 1,
                "isAnomaly": {"$literal": True}
            }}
        ]
        attack_logs = list(anomalies_collection.aggregate(pipeline))
        attack_logs = [log for log in attack_logs if log.get('timestamp', 0) > 0]
        for log in attack_logs:
            if '_id' in log:
                log['_id'] = str(log['_id'])
        logger.info(f"Fetched {len(attack_logs)} attack logs for anomalyType={anomaly_type}")
        return jsonify(attack_logs)
    except Exception as e:
        import traceback
        logger.error('Error in get_attack_logs: %s', traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/dashboard/statistics', methods=['GET'])
@require_api_key
def get_statistics():
    try:
        # Get total records count
        total_records = collection.count_documents({})
        
        # Get anomaly count
        anomaly_count = collection.count_documents({"isAnomaly": True})
        
        # Get counts by anomaly type
        pipeline = [
            {"$match": {"isAnomaly": True}},
            {"$group": {
                "_id": "$anomalyType",
                "count": {"$sum": 1}
            }}
        ]
        anomaly_types = list(collection.aggregate(pipeline))
        
        # Get latest readings
        latest_normal = collection.find_one({"isAnomaly": False}, sort=[("timestamp", -1)])
        latest_anomaly = collection.find_one({"isAnomaly": True}, sort=[("timestamp", -1)])
        
        return jsonify({
            "total_records": total_records,
            "anomaly_count": anomaly_count,
            "normal_count": total_records - anomaly_count,
            "anomaly_types": anomaly_types,
            "latest_normal": convert_objectid(latest_normal) if latest_normal else None,
            "latest_anomaly": convert_objectid(latest_anomaly) if latest_anomaly else None
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/dashboard/device_status', methods=['GET'])
@require_api_key
def get_device_status():
    try:
        # Get status of all devices
        pipeline = [
            {"$group": {
                "_id": "$deviceId",
                "last_seen": {"$max": "$timestamp"},
                "total_readings": {"$sum": 1},
                "anomaly_count": {
                    "$sum": {"$cond": ["$isAnomaly", 1, 0]}
                },
                "latest_temperature": {"$last": "$temperature"},
                "latest_humidity": {"$last": "$humidity"},
                "latest_battery": {"$last": "$deviceBattery"}
            }},
            {"$sort": {"last_seen": -1}}
        ]
        device_status = list(collection.aggregate(pipeline))
        
        # Add human-readable timestamp
        for device in device_status:
            device["last_seen_human"] = datetime.fromtimestamp(device["last_seen"]).strftime('%Y-%m-%d %H:%M:%S')
            device["anomaly_percentage"] = (device["anomaly_count"] / device["total_readings"] * 100) if device["total_readings"] > 0 else 0
        
        return jsonify(device_status)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/dashboard/timeline', methods=['GET'])
@require_api_key
def get_timeline():
    try:
        # Get data for the last 1 hour instead of 24 hours
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)
        logger.info(f"Fetching timeline data from {one_hour_ago} to now")
        
        pipeline = [
            {"$match": {
                "timestamp": {"$gte": one_hour_ago.timestamp()}
            }},
            {"$sort": {"timestamp": 1}},
            {"$project": {
                "timestamp": 1,
                "timestamp_human": {
                    "$dateToString": {
                        "format": "%H:%M",
                        "date": {"$toDate": {"$multiply": ["$timestamp", 1000]}}
                    }
                },
                "isAnomaly": 1,
                "anomalyType": 1,
                "temperature": 1,
                "humidity": 1,
                "gasLevel": 1,
                "co2Level": 1,
                "airQuality": 1,
                "soundLevel": 1,
                "motionDetected": 1,
                "lightIntensity": 1,
                "vibrationLevel": 1,
                "deviceBattery": 1,
                "deviceId": 1
            }}
        ]
        
        # Get total count before aggregation
        total_count = collection.count_documents({"timestamp": {"$gte": one_hour_ago.timestamp()}})
        logger.info(f"Total documents found: {total_count}")
        
        timeline_data = list(collection.aggregate(pipeline))
        logger.info(f"Timeline data points returned: {len(timeline_data)}")
        
        if not timeline_data:
            logger.warning("No timeline data found in the last hour")
            # Try to get the most recent data point to check if we have any data at all
            latest_data = collection.find_one(sort=[("timestamp", -1)])
            if latest_data:
                logger.info(f"Latest data point found from: {datetime.fromtimestamp(latest_data['timestamp'])}")
            else:
                logger.warning("No data found in the collection at all")
        
        return jsonify(timeline_data)
    except Exception as e:
        logger.error(f"Error in get_timeline: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Socket.IO event handlers for real-time updates
@socketio.on('connect')
def handle_connect():
    logger.info('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    logger.info('Client disconnected')

# When new data comes in
@socketio.on('new_data')
def handle_new_data(data):
    # Emit to all connected clients
    socketio.emit('new_data', data)
    
    # If it's an anomaly, emit a specific alert
    if data.get('isAnomaly'):
        socketio.emit('anomaly_alert', {
            'timestamp': data['timestamp'],
            'timestamp_human': datetime.fromtimestamp(data['timestamp']).strftime('%Y-%m-%d %H:%M:%S'),
            'deviceId': data['deviceId'],
            'anomalyType': data['anomalyType'],
            'message': f"🚨 Anomaly Detected - Type: {data['anomalyType']}"
        })

# List all devices
@app.route('/api/devices', methods=['GET'])
@require_api_key
def list_devices():
    try:
        devices = list(devices_collection.find())
        for d in devices:
            d['_id'] = str(d['_id'])
        return jsonify(devices)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# List trusted devices
@app.route('/api/trusted_devices', methods=['GET'])
@require_api_key
def list_trusted_devices():
    try:
        trusted = list(trusted_devices_collection.find())
        for d in trusted:
            d['_id'] = str(d['_id'])
        return jsonify(trusted)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Remove device (admin only)
@app.route('/api/devices/remove', methods=['POST'])
@require_api_key
def remove_device():
    # Only allow admin (assume role in JWT or session)
    user = None
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if token:
            import jwt
            SECRET_KEY = os.getenv('SECRET_KEY')
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user = payload
        if not user or user.get('role') != 'admin':
            return jsonify({"error": "Admin only"}), 403
        data = request.get_json()
        device_id = data.get('deviceId')
        if not device_id:
            return jsonify({"error": "Missing deviceId"}), 400
        devices_collection.delete_one({"deviceId": device_id})
        trusted_devices_collection.delete_one({"deviceId": device_id})
        return jsonify({"message": f"Device {device_id} removed"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ====== Admin User Management Endpoints ======

@app.route('/api/admin/users', methods=['GET'])
@require_api_key
def list_users():
    users = list(users_collection.find({}, {'password': 0}))  # Don't return passwords!
    for user in users:
        user['_id'] = str(user['_id'])
    return jsonify(users)

@app.route('/api/admin/users', methods=['POST'])
@require_api_key
def add_user():
    data = request.json
    if not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400
    if users_collection.find_one({'email': data['email']}):
        return jsonify({'error': 'Email already exists'}), 400
    user = {
        'username': data['username'],
        'email': data['email'],
        'password': generate_password_hash(data['password']),
        'role': data.get('role', 'user')
    }
    result = users_collection.insert_one(user)
    user['_id'] = str(result.inserted_id)
    del user['password']
    return jsonify(user), 201

@app.route('/api/admin/users/<user_id>', methods=['DELETE'])
@require_api_key
def remove_user(user_id):
    result = users_collection.delete_one({'_id': ObjectId(user_id)})
    if result.deleted_count == 0:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'success': True})

@app.route('/api/admin/inject-anomaly', methods=['POST'])
@require_api_key
def inject_anomaly():
    data = request.json
    required_fields = [
        'deviceId', 'anomalyType', 'temperature', 'humidity', 'gasLevel', 'co2Level',
        'airQuality', 'soundLevel', 'motionDetected', 'lightIntensity',
        'vibrationLevel', 'deviceBattery'
    ]
    missing = [f for f in required_fields if f not in data]
    if missing:
        return jsonify({'error': f'Missing fields: {missing}'}), 400

    # Mark as anomaly and store
    data['isAnomaly'] = True
    collection.insert_one({
        "timestamp": int(datetime.utcnow().timestamp()),
        **data
    })
    return jsonify({'success': True, 'message': 'Anomaly injected'})

# ====== Audit Log Utility ======
audit_collection = db['audit_logs']

def log_audit(action, user=None, details=None):
    audit_doc = {
        'timestamp': int(datetime.utcnow().timestamp()),
        'action': action,
        'user': user,
        'details': details or {}
    }
    audit_collection.insert_one(audit_doc)

# ====== Quick Actions Endpoints ======

@app.route('/api/admin/export-devices', methods=['GET'])
@require_api_key
def export_devices():
    try:
        devices = list(devices_collection.find())
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['deviceId', 'trusted', 'last_seen'])
        for d in devices:
            writer.writerow([d.get('deviceId'), d.get('trusted'), d.get('last_seen')])
        output.seek(0)
        return send_file(io.BytesIO(output.getvalue().encode()), mimetype='text/csv', as_attachment=True, download_name='devices.csv')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/system-report', methods=['GET'])
@require_api_key
def system_report():
    try:
        # Simple JSON summary; extend as needed
        summary = {
            'total_records': collection.count_documents({}),
            'anomaly_count': collection.count_documents({'isAnomaly': True}),
            'devices': list(collection.distinct('deviceId')),
            'last_update': collection.find_one(sort=[('timestamp', -1)])
        }
        return jsonify(summary)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/logs', methods=['GET'])
@require_api_key
def get_logs():
    try:
        with open('flask_app.log', 'r') as f:
            lines = f.readlines()[-100:]
        return jsonify({'logs': lines})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ====== Audit Log Endpoints ======
@app.route('/api/admin/audit-logs', methods=['GET'])
@require_api_key
def get_audit_logs():
    try:
        logs = list(audit_collection.find().sort('timestamp', -1).limit(200))
        for log in logs:
            log['_id'] = str(log['_id'])
        return jsonify(logs)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ✅ Run app
if __name__ == '__main__':
    print("Starting Flask app with SocketIO support...")
    print(f"API Key: {API_KEY}")
    # Don't print full URI with credentials, just show the host
    mongo_display = MONGO_URI.split('@')[1] if '@' in MONGO_URI else MONGO_URI
    print(f"MongoDB: {mongo_display}")
    print(f"Database: IoTSecurityDB")
    
    # Verify MongoDB connection before starting
    try:
        client.admin.command('ping')
        print("✅ MongoDB connection verified")
    except Exception as e:
        print(f"❌ MongoDB connection error: {str(e)}")
        print("Please check your MONGO_URI in .env file")
    
    # Use PORT from environment (Render) or default to 5000
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    socketio.run(app, debug=debug, host='0.0.0.0', port=port, use_reloader=False)

@app.after_request
def add_no_cache_headers(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/api/admin/blockchain_explorer', methods=['GET'])
@require_api_key
def blockchain_explorer():
    try:
        # Reuse the logic from blockchain_records
        records = collection.find({"tx_hash": {"$exists": True}}).sort("timestamp", -1)
        result = []
        for idx, record in enumerate(records):
            record['_id'] = str(record['_id'])
            result.append({
                "id": idx + 1,
                "deviceId": record["deviceId"],
                "timestamp": record["timestamp"],
                "timestamp_human": datetime.utcfromtimestamp(record["timestamp"]).strftime('%Y-%m-%d %H:%M:%S'),
                "tx_hash": record["tx_hash"],
                "tx_details": {"block": record.get("block", "Pending")},
                "isAnomaly": record.get("isAnomaly", False)
            })
        return jsonify(result)
    except Exception as e:
        print(f"Error in blockchain_explorer: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Health check endpoint to verify MongoDB connection
@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        # Test MongoDB connection
        client.admin.command('ping')
        
        # Get database stats
        db_stats = {
            "database": db.name,
            "collections": db.list_collection_names(),
            "iot_data_count": collection.count_documents({}),
            "latest_record": None
        }
        
        # Get latest record timestamp
        latest = collection.find_one(sort=[("timestamp", -1)])
        if latest:
            db_stats["latest_record"] = {
                "timestamp": latest.get("timestamp"),
                "deviceId": latest.get("deviceId"),
                "isAnomaly": latest.get("isAnomaly")
            }
        
        return jsonify({
            "status": "healthy",
            "mongodb": {
                "connected": True,
                "uri": MONGO_URI.split('@')[1] if '@' in MONGO_URI else "connected",
                "database": db_stats
            }
        }), 200
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            "status": "unhealthy",
            "mongodb": {
                "connected": False,
                "error": str(e)
            }
        }), 500
