#!/usr/bin/env python3
"""
Script to verify MongoDB connection and check data
"""
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from datetime import datetime

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/IoTSecurityDB")

def verify_mongodb():
    print("=" * 60)
    print("MongoDB Connection Verification")
    print("=" * 60)
    print(f"\nMONGO_URI: {MONGO_URI.split('@')[1] if '@' in MONGO_URI else MONGO_URI}")
    print()
    
    try:
        # Connect to MongoDB
        print("1. Connecting to MongoDB...")
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
        
        # Test connection
        print("2. Testing connection...")
        client.admin.command('ping')
        print("   ✅ Connection successful!")
        
        # Get database
        print("3. Accessing database...")
        db = client['IoTSecurityDB']
        print(f"   ✅ Database: {db.name}")
        
        # List collections
        print("4. Checking collections...")
        collections = db.list_collection_names()
        print(f"   Found {len(collections)} collections:")
        for col in collections:
            count = db[col].count_documents({})
            print(f"   - {col}: {count} documents")
        
        # Check iot_data collection
        print("\n5. Checking iot_data collection...")
        iot_data = db['iot_data']
        total_count = iot_data.count_documents({})
        print(f"   Total documents: {total_count}")
        
        if total_count > 0:
            # Get latest document
            latest = iot_data.find_one(sort=[("timestamp", -1)])
            if latest:
                print(f"\n   Latest document:")
                print(f"   - Timestamp: {datetime.fromtimestamp(latest.get('timestamp', 0))}")
                print(f"   - Device ID: {latest.get('deviceId', 'N/A')}")
                print(f"   - Is Anomaly: {latest.get('isAnomaly', False)}")
                print(f"   - Anomaly Type: {latest.get('anomalyType', 'N/A')}")
            
            # Get count by anomaly status
            normal_count = iot_data.count_documents({"isAnomaly": False})
            anomaly_count = iot_data.count_documents({"isAnomaly": True})
            print(f"\n   Statistics:")
            print(f"   - Normal: {normal_count}")
            print(f"   - Anomalies: {anomaly_count}")
        else:
            print("   ⚠️  No documents found in iot_data collection")
        
        # Check anomalies collection
        if 'anomalies' in collections:
            print("\n6. Checking anomalies collection...")
            anomalies = db['anomalies']
            anomaly_count = anomalies.count_documents({})
            print(f"   Total anomalies: {anomaly_count}")
        
        print("\n" + "=" * 60)
        print("✅ All checks passed!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Check if MONGO_URI in .env file is correct")
        print("2. Verify MongoDB Atlas network access (IP whitelist)")
        print("3. Check MongoDB Atlas credentials")
        print("4. Ensure MongoDB Atlas cluster is running")
        return False
    
    finally:
        if 'client' in locals():
            client.close()
    
    return True

if __name__ == "__main__":
    verify_mongodb()



