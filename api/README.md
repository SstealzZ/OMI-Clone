# Message Database API

A FastAPI-based RESTful API for interacting with a message database. This API allows you to perform CRUD operations on message entries.

## Requirements

- Python 3.8+
- MongoDB 4.0+

## Installation

1. Clone this repository
2. Install the required dependencies:

```bash
pip install -r requirements.txt
```

3. Configure your MongoDB connection in the `.env` file (default: `mongodb://localhost:27017`)

## Running the API

```bash
cd api
uvicorn api:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- Interactive API documentation: `http://localhost:8000/docs`
- Alternative documentation: `http://localhost:8000/redoc`

## API Endpoints

### GET /messages

Get a list of messages with optional filtering.

**Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Maximum number of records to return (default: 10)
- `type` (optional): Filter messages by type

### GET /messages/{message_id}

Get a specific message by ID.

### POST /messages

Create a new message.

**Request Body:**
```json
{
  "date": "2023-03-08",
  "message": "Monsieur Dubois discute avec un collègue d'un problème de délai sur le...",
  "type": "Réunion"
}
```

### PUT /messages/{message_id}

Update an existing message.

**Request Body (all fields optional):**
```json
{
  "date": "2023-03-09",
  "message": "Updated message content",
  "type": "Updated type"
}
```

### DELETE /messages/{message_id}

Delete a message by ID.

## Example Usage

```python
import requests

# Get all messages
response = requests.get("http://localhost:8000/messages")
messages = response.json()

# Create a new message
new_message = {
    "date": "2023-03-08",
    "message": "Monsieur Dubois discute avec un collègue d'un problème de délai sur le projet.",
    "type": "Réunion"
}
response = requests.post("http://localhost:8000/messages", json=new_message)
created_message = response.json()
```

## Notes

This API is intended for educational purposes. In a production environment, you would want to add:
- Authentication and authorization
- Rate limiting
- More robust error handling
- Logging
- Input validation 