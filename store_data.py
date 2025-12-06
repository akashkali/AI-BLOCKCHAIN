from web3 import Web3
from eth_account import Account

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

# Contract ABI
contract_abi = [
    {
        "inputs": [
            {"internalType": "uint256", "name": "_temperature", "type": "uint256"},
            {"internalType": "uint256", "name": "_humidity", "type": "uint256"},
            {"internalType": "uint256", "name": "_gas", "type": "uint256"}
        ],
        "name": "storeData",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

# Load contract
contract = w3.eth.contract(address=contract_address, abi=contract_abi)

# Your private key (Keep it secret!)
private_key = "7322a5004e3800100c29c1ef48162df33d944099739f1b1303f41e1fb99f8529"  # Replace with your private key
account = Account.from_key(private_key)
sender_address = account.address

# IoT Data
temperature = 30  # Example: 30°C
humidity = 55     # Example: 55%
gas = 250         # Example: 250 PPM

# Build transaction
txn = contract.functions.storeData(temperature, humidity, gas).build_transaction({
    "from": sender_address,
    "gas": 200000,  # Adjust as needed
    "gasPrice": w3.to_wei("10", "gwei"),
    "nonce": w3.eth.get_transaction_count(sender_address)
})

# Sign transaction
signed_txn = w3.eth.account.sign_transaction(txn, private_key)

# ✅ FIXED: Use 'raw_transaction' instead of 'rawTransaction'
tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)

print(f"✅ Data stored! Transaction Hash: {w3.to_hex(tx_hash)}")
