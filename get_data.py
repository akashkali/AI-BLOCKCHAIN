from web3 import Web3

# BSC Testnet RPC URL
bsc_testnet_url = "https://data-seed-prebsc-1-s1.binance.org:8545/"
w3 = Web3(Web3.HTTPProvider(bsc_testnet_url))

# Check connection
if w3.is_connected():
    print("✅ Connected to BSC Testnet")
else:
    print("❌ Connection failed")
    exit()

# Your deployed contract address
contract_address = "0x60bca724FFF75f7de7E22D351bC7FfEFf3cB951d"

# Contract ABI (only for 'getData' function)
contract_abi = [
    {
        "inputs": [{"internalType": "uint256", "name": "_id", "type": "uint256"}],
        "name": "getData",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"},
            {"internalType": "uint256", "name": "", "type": "uint256"},
            {"internalType": "uint256", "name": "", "type": "uint256"},
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

# Load contract
contract = w3.eth.contract(address=contract_address, abi=contract_abi)

# Retrieve data
data_id = 1  # Replace with the ID of the data you stored
data = contract.functions.getData(data_id).call()

# Display retrieved data
print(f"✅ IoT Data Retrieved for ID {data_id}:")
print(f"📅 Timestamp: {data[0]}")
print(f"🌡️ Temperature: {data[1]}°C")
print(f"💧 Humidity: {data[2]}%")
print(f"🔥 Gas Level: {data[3]} PPM")
