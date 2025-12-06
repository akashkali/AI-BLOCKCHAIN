from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://akash:uBHnSwm02oEEkyt7@cluster0.xdfnm6g.mongodb.net/")

def check_mongodb():
    try:
        # Connect to MongoDB
        print(f"Connecting to MongoDB at: {MONGO_URI}")
        client = MongoClient(MONGO_URI)
        
        # Get database and collections
        db = client.get_database()
        print(f"\n✅ Connected to database: {db.name}")
        
        # List all collections
        collections = db.list_collection_names()
        print("\nCollections in database:")
        for collection in collections:
            print(f"- {collection}")
        
        # Check iot_data collection
        if 'iot_data' in collections:
            iot_data = db['iot_data']
            count = iot_data.count_documents({})
            print(f"\n📊 iot_data collection has {count} documents")
            
            # Get latest document
            latest = iot_data.find_one(sort=[("timestamp", -1)])
            if latest:
                print("\nLatest document:")
                for key, value in latest.items():
                    print(f"{key}: {value}")
        
        # Check users collection
        if 'users' in collections:
            users = db['users']
            count = users.count_documents({})
            print(f"\n👥 users collection has {count} documents")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    check_mongodb() 