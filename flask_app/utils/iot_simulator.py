import requests
import random
import time
import json
from dotenv import load_dotenv
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
# Try to load from flask_app directory first, then current directory
env_paths = [
    os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'),  # flask_app/.env
    os.path.join(os.path.dirname(__file__), '.env'),  # flask_app/utils/.env
    '.env'  # Current directory
]

for env_path in env_paths:
    if os.path.exists(env_path):
        load_dotenv(env_path)
        logger.info(f"📄 Loaded .env from: {env_path}")
        break
else:
    load_dotenv()  # Try default location
    logger.warning("⚠️  No .env file found, using environment variables or defaults")

API_ENDPOINT = os.getenv('API_ENDPOINT', 'http://localhost:5000/predict_and_store')
API_KEY = os.getenv('API_KEY', 'your_api_key_here')

if not API_KEY or API_KEY == 'your_api_key_here':
    logger.error("❌ API_KEY not set in .env file!")
    logger.error("   Please set API_KEY in your .env file")
    raise Exception("❌ API_KEY not set in .env file!")

logger.info(f"🌐 Using API endpoint: {API_ENDPOINT}")
logger.info(f"🔐 API key configured: {'*' * (len(API_KEY) - 4) + API_KEY[-4:] if len(API_KEY) > 4 else '****'}")

# Device IDs
TRUSTED_DEVICES = [f"device{i}" for i in range(1, 6)]  # device1 to device5
UNTRUSTED_DEVICES = [f"device{i}" for i in range(6, 11)]  # device6 to device10
ALL_DEVICES = TRUSTED_DEVICES + UNTRUSTED_DEVICES

# Generate sensor data for a device
def generate_sensor_data(device_id):
    trusted = device_id in TRUSTED_DEVICES
    # Trusted devices always send normal data
    if trusted:
        data = {
            "deviceId": device_id,
            "temperature": random.uniform(20, 30),
            "humidity": random.uniform(30, 60),
            "gasLevel": random.uniform(200, 400),
            "co2Level": random.uniform(400, 600),
            "airQuality": random.uniform(20, 40),
            "soundLevel": random.uniform(40, 70),
            "motionDetected": random.choice([0, 0, 0, 1]),
            "lightIntensity": random.uniform(200, 800),
            "vibrationLevel": random.uniform(0, 10),
            "deviceBattery": random.uniform(50, 100),
            "anomalyType": "NORMAL",
            "store_on_blockchain": False,
            "trusted": True
        }
        return data
    # Untrusted devices: 30% normal, 70% anomaly
    attack_type = random.random()
    if attack_type < 0.3:  # 30% normal
        data = {
            "deviceId": device_id,
            "temperature": random.uniform(20, 30),
            "humidity": random.uniform(30, 60),
            "gasLevel": random.uniform(200, 400),
            "co2Level": random.uniform(400, 600),
            "airQuality": random.uniform(20, 40),
            "soundLevel": random.uniform(40, 70),
            "motionDetected": random.choice([0, 0, 0, 1]),
            "lightIntensity": random.uniform(200, 800),
            "vibrationLevel": random.uniform(0, 10),
            "deviceBattery": random.uniform(50, 100),
            "anomalyType": "NORMAL",
            "store_on_blockchain": False,
            "trusted": False
        }
    elif attack_type < 0.4:
        data = {
            "deviceId": device_id,
            "temperature": random.uniform(70, 100),
            "humidity": random.uniform(30, 60),
            "gasLevel": random.uniform(200, 400),
            "co2Level": random.uniform(400, 600),
            "airQuality": random.uniform(20, 40),
            "soundLevel": random.uniform(40, 70),
            "motionDetected": random.choice([0, 0, 0, 1]),
            "lightIntensity": random.uniform(200, 800),
            "vibrationLevel": random.uniform(0, 10),
            "deviceBattery": random.uniform(50, 100),
            "anomalyType": "TEMPERATURE_ATTACK",
            "store_on_blockchain": True,
            "trusted": False
        }
    elif attack_type < 0.6:
        data = {
            "deviceId": device_id,
            "temperature": random.uniform(20, 30),
            "humidity": random.uniform(30, 60),
            "gasLevel": random.uniform(700, 900),
            "co2Level": random.uniform(1500, 2000),
            "airQuality": random.uniform(80, 100),
            "soundLevel": random.uniform(40, 70),
            "motionDetected": random.choice([0, 0, 0, 1]),
            "lightIntensity": random.uniform(200, 800),
            "vibrationLevel": random.uniform(0, 10),
            "deviceBattery": random.uniform(50, 100),
            "anomalyType": "GAS_ATTACK",
            "store_on_blockchain": True,
            "trusted": False
        }
    elif attack_type < 0.85:
        data = {
            "deviceId": device_id,
            "temperature": random.uniform(20, 30),
            "humidity": random.uniform(30, 60),
            "gasLevel": random.uniform(200, 400),
            "co2Level": random.uniform(400, 600),
            "airQuality": random.uniform(20, 40),
            "soundLevel": random.uniform(90, 120),
            "motionDetected": 1,
            "lightIntensity": random.uniform(0, 50),
            "vibrationLevel": random.uniform(50, 100),
            "deviceBattery": random.uniform(50, 100),
            "anomalyType": "MOTION_ATTACK",
            "store_on_blockchain": True,
            "trusted": False
        }
    else:
        data = {
            "deviceId": device_id,
            "temperature": random.uniform(20, 30),
            "humidity": random.uniform(30, 60),
            "gasLevel": random.uniform(200, 400),
            "co2Level": random.uniform(400, 600),
            "airQuality": random.uniform(20, 40),
            "soundLevel": random.uniform(40, 70),
            "motionDetected": random.choice([0, 0, 0, 1]),
            "lightIntensity": random.uniform(200, 800),
            "vibrationLevel": random.uniform(0, 10),
            "deviceBattery": random.uniform(5, 20),
            "anomalyType": "BATTERY_ATTACK",
            "store_on_blockchain": True,
            "trusted": False
        }
    return data

# Infinite loop to send simulated data
while True:
    # Randomly pick a device
    device_id = random.choice(ALL_DEVICES)
    payload = generate_sensor_data(device_id)
    headers = {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    try:
        logger.info(f"📤 Sending data for {device_id} (trusted={payload['trusted']}, anomalyType={payload['anomalyType']}) to Flask API...")
        logger.debug(f"Headers: {headers}")
        logger.debug(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(API_ENDPOINT, json=payload, headers=headers, timeout=10)
        
        if response.status_code == 200:
            response_data = response.json()
            logger.info(f"✅ Data sent successfully. Response: {response_data.get('message', 'OK')}")
            if payload.get('anomalyType') != 'NORMAL':
                logger.info(f"   🚨 Anomaly detected: {payload['anomalyType']}")
        else:
            logger.error(f"❌ Error response: {response.status_code}")
            try:
                error_data = response.json()
                logger.error(f"Error details: {error_data}")
            except:
                logger.error(f"Response content: {response.text}")
            logger.error(f"Response headers: {dict(response.headers)}")
            
    except requests.exceptions.ConnectionError:
        logger.error("❌ Could not connect to the Flask server. Is it running?")
        logger.error(f"   Trying to connect to: {API_ENDPOINT}")
    except requests.exceptions.Timeout:
        logger.error("❌ Request timeout. The server took too long to respond.")
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Request exception: {str(e)}")
    except Exception as e:
        logger.error(f"❌ Exception while sending data: {str(e)}", exc_info=True)
    
    time.sleep(2)
