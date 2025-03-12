import requests
import json
from datetime import datetime

# Base URL for the API
BASE_URL = "http://localhost:8000"

def test_api():
    print("Testing the Message Database API...")
    
    # Test 1: Get all messages (initially empty)
    print("\n1. Getting all messages...")
    response = requests.get(f"{BASE_URL}/messages")
    print(f"Status code: {response.status_code}")
    messages = response.json()
    print(f"Messages: {json.dumps(messages, indent=2)}")
    
    # Test 2: Create a new message
    print("\n2. Creating a new message...")
    new_message = {
        "date": "2023-03-08",
        "message": "Monsieur Dubois discute avec un collègue d'un problème de délai sur le projet.",
        "type": "Réunion"
    }
    response = requests.post(f"{BASE_URL}/messages", json=new_message)
    print(f"Status code: {response.status_code}")
    created_message = response.json()
    print(f"Created message: {json.dumps(created_message, indent=2)}")
    
    # Store message ID for later tests
    message_id = created_message["_id"]
    
    # Test A: Get all unique message types
    print("\nA. Getting all unique message types...")
    response = requests.get(f"{BASE_URL}/messages/types")
    print(f"Status code: {response.status_code}")
    types = response.json()
    print(f"Message types: {json.dumps(types, indent=2)}")
    
    # Test B: Get all unique message dates
    print("\nB. Getting all unique message dates...")
    response = requests.get(f"{BASE_URL}/messages/dates")
    print(f"Status code: {response.status_code}")
    dates = response.json()
    print(f"Message dates: {json.dumps(dates, indent=2)}")
    
    # Create a second message with a different date for testing
    print("\nCreating a second message with different date...")
    second_message = {
        "date": "2023-03-09",
        "message": "Suivi du projet en cours.",
        "type": "Réunion"
    }
    response = requests.post(f"{BASE_URL}/messages", json=second_message)
    second_message_id = response.json()["_id"]
    
    # Test C: Filter messages by date
    print("\nC. Filtering messages by date: '2023-03-08'...")
    response = requests.get(f"{BASE_URL}/messages?date=2023-03-08")
    print(f"Status code: {response.status_code}")
    date_filtered_messages = response.json()
    print(f"Messages filtered by date: {json.dumps(date_filtered_messages, indent=2)}")
    
    # Test 3: Get the specific message by ID
    print(f"\n3. Getting message with ID: {message_id}...")
    response = requests.get(f"{BASE_URL}/messages/{message_id}")
    print(f"Status code: {response.status_code}")
    message = response.json()
    print(f"Message: {json.dumps(message, indent=2)}")
    
    # Test 4: Update the message
    print(f"\n4. Updating message with ID: {message_id}...")
    update_data = {
        "message": "Monsieur Dubois discute avec un collègue d'un problème de délai sur le projet XYZ.",
        "type": "Discussion"
    }
    response = requests.put(f"{BASE_URL}/messages/{message_id}", json=update_data)
    print(f"Status code: {response.status_code}")
    updated_message = response.json()
    print(f"Updated message: {json.dumps(updated_message, indent=2)}")
    
    # Test 5: Filter messages by type
    print("\n5. Filtering messages by type: 'Discussion'...")
    response = requests.get(f"{BASE_URL}/messages?type=Discussion")
    print(f"Status code: {response.status_code}")
    filtered_messages = response.json()
    print(f"Filtered messages: {json.dumps(filtered_messages, indent=2)}")
    
    # Test 6: Delete the messages
    print(f"\n6. Deleting messages...")
    print(f"Deleting message with ID: {message_id}...")
    response = requests.delete(f"{BASE_URL}/messages/{message_id}")
    print(f"Status code: {response.status_code}")
    
    print(f"Deleting second message with ID: {second_message_id}...")
    response = requests.delete(f"{BASE_URL}/messages/{second_message_id}")
    print(f"Status code: {response.status_code}")
    
    print("\nAPI testing complete!")

if __name__ == "__main__":
    test_api() 