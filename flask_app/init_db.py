from pymongo import MongoClient, ASCENDING, DESCENDING
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/IoTSecurityDB")

def init_database():
    try:
        # Connect to MongoDB
        print(f"Connecting to MongoDB at: {MONGO_URI}")
        client = MongoClient(MONGO_URI)
        db = client.get_database()
        print(f"\n✅ Connected to database: {db.name}")

        # Initialize collections
        collections = {
            'iot_data': [
                ('timestamp', DESCENDING),
                ('deviceId', ASCENDING),
                ('isAnomaly', ASCENDING)
            ],
            'anomalies': [
                ('timestamp', DESCENDING),
                ('deviceId', ASCENDING),
                ('anomalyType', ASCENDING)
            ],
            'users': [
                ('email', ASCENDING)
            ],
            'trusted_devices': [
                ('deviceId', ASCENDING)
            ],
            'devices': [
                ('deviceId', ASCENDING),
                ('last_seen', DESCENDING)
            ]
        }

        # Create collections and indexes
        for collection_name, indexes in collections.items():
            # Create collection if it doesn't exist
            if collection_name not in db.list_collection_names():
                print(f"\nCreating collection: {collection_name}")
                db.create_collection(collection_name)
            
            # Create indexes
            collection = db[collection_name]
            for field, direction in indexes:
                index_name = f"{field}_{direction}"
                print(f"Creating index {index_name} on {collection_name}")
                collection.create_index([(field, direction)], name=index_name)

        print("\n✅ Database initialization completed successfully!")
        
        # List all collections and their document counts
        print("\nCollections in database:")
        for collection_name in db.list_collection_names():
            count = db[collection_name].count_documents({})
            print(f"- {collection_name}: {count} documents")

    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    init_database() 