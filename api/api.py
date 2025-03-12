from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import os
from bson import ObjectId
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Message Database API",
    description="API for interacting with a message database",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For a student project, this is ok. In production, specify origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.SynapseOS
message_collection = db["POC-OMI"]
print(f"Utilisation de la base de données: {db.name}, collection: POC-OMI")

# Pydantic models
class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler):
        from pydantic_core import core_schema
        return core_schema.union_schema([
            core_schema.is_instance_schema(ObjectId),
            core_schema.chain_schema([
                core_schema.str_schema(),
                core_schema.no_info_plain_validator_function(cls.validate),
            ])
        ])

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, _schema_generator, _field_schema):
        return {"type": "string"}

class MessageModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    date: str
    message: str
    type: str

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class MessageCreateModel(BaseModel):
    date: str
    message: str
    type: str

class MessageUpdateModel(BaseModel):
    date: Optional[str] = None
    message: Optional[str] = None
    type: Optional[str] = None

# API routes
@app.get("/")
async def root():
    return {"message": "Welcome to the Message Database API"}

@app.get("/messages/types", response_model=List[str])
async def get_message_types():
    """
    Get a list of all unique message types in the database.
    """
    try:
        print("Tentative de récupération des types uniques...")
        types = await message_collection.distinct("type")
        print(f"Types récupérés: {types}")
        
        # Ne plus renvoyer de types par défaut
        return types
    except Exception as e:
        print(f"Erreur lors de la récupération des types: {e}")
        # Renvoyer un tableau vide en cas d'erreur
        return []

@app.get("/messages/dates", response_model=List[str])
async def get_message_dates():
    """
    Get a list of all unique message dates in the database.
    """
    try:
        print("Tentative de récupération des dates uniques...")
        dates = await message_collection.distinct("date")
        print(f"Dates récupérées: {dates}")
        
        # Ne plus renvoyer de dates par défaut
        return dates
    except Exception as e:
        print(f"Erreur lors de la récupération des dates: {e}")
        # Renvoyer un tableau vide en cas d'erreur
        return []

@app.get("/messages", response_model=List[MessageModel])
async def get_messages(skip: int = 0, limit: int = 10, type: Optional[str] = None, date: Optional[str] = None):
    """
    Get a list of messages with optional filtering by type and/or date.
    """
    try:
        print(f"Recherche de messages avec filtres - type: {type}, date: {date}")
        query = {}
        if type:
            query["type"] = type
        if date:
            query["date"] = date
            
        messages = await message_collection.find(query).skip(skip).limit(limit).to_list(limit)
        print(f"Nombre de messages trouvés: {len(messages)}")
        
        # Standardiser les noms de champs (convertir majuscules en minuscules)
        standardized_messages = []
        for msg in messages:
            standardized_msg = {}
            for key, value in msg.items():
                # Convertir les clés en minuscules sauf _id
                if key.lower() == "_id":
                    standardized_msg["_id"] = value
                else:
                    standardized_msg[key.lower()] = value
            
            # S'assurer que tous les champs requis sont présents
            if "date" in standardized_msg and "message" in standardized_msg and "type" in standardized_msg:
                standardized_messages.append(standardized_msg)
            else:
                print(f"Message ignoré car champs manquants: {standardized_msg}")
        
        print(f"Nombre de messages standardisés: {len(standardized_messages)}")
        return standardized_messages
        
    except Exception as e:
        print(f"Erreur lors de la récupération des messages: {e}")
        # Renvoyer un tableau vide en cas d'erreur
        return []

@app.get("/messages/{message_id}", response_model=MessageModel)
async def get_message(message_id: str):
    """
    Get a single message by its ID.
    """
    if not ObjectId.is_valid(message_id):
        raise HTTPException(status_code=400, detail="Invalid message ID format")
        
    message = await message_collection.find_one({"_id": ObjectId(message_id)})
    if message is None:
        raise HTTPException(status_code=404, detail=f"Message with ID {message_id} not found")
    
    # Standardiser les noms de champs (convertir majuscules en minuscules)
    standardized_msg = {}
    for key, value in message.items():
        # Convertir les clés en minuscules sauf _id
        if key.lower() == "_id":
            standardized_msg["_id"] = value
        else:
            standardized_msg[key.lower()] = value
    
    # S'assurer que tous les champs requis sont présents
    required_fields = ["date", "message", "type"]
    for field in required_fields:
        if field not in standardized_msg:
            # Si un champ majuscule existe, l'utiliser
            if field.capitalize() in message:
                standardized_msg[field] = message[field.capitalize()]
            else:
                raise HTTPException(status_code=422, detail=f"Message is missing required field: {field}")
        
    return standardized_msg

@app.post("/messages", response_model=MessageModel)
async def create_message(message: MessageCreateModel = Body(...)):
    """
    Create a new message.
    """
    new_message = message.model_dump()
    result = await message_collection.insert_one(new_message)
    created_message = await message_collection.find_one({"_id": result.inserted_id})
    return created_message

@app.put("/messages/{message_id}", response_model=MessageModel)
async def update_message(message_id: str, message_update: MessageUpdateModel = Body(...)):
    """
    Update an existing message.
    """
    if not ObjectId.is_valid(message_id):
        raise HTTPException(status_code=400, detail="Invalid message ID format")
        
    # Filter out None values
    update_data = {k: v for k, v in message_update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid update data provided")
    
    # Check if message exists
    message = await message_collection.find_one({"_id": ObjectId(message_id)})
    if message is None:
        raise HTTPException(status_code=404, detail=f"Message with ID {message_id} not found")
    
    # Update the message
    await message_collection.update_one(
        {"_id": ObjectId(message_id)}, {"$set": update_data}
    )
    
    updated_message = await message_collection.find_one({"_id": ObjectId(message_id)})
    return updated_message

@app.delete("/messages/{message_id}")
async def delete_message(message_id: str):
    """
    Delete a message.
    """
    if not ObjectId.is_valid(message_id):
        raise HTTPException(status_code=400, detail="Invalid message ID format")
        
    # Check if message exists
    message = await message_collection.find_one({"_id": ObjectId(message_id)})
    if message is None:
        raise HTTPException(status_code=404, detail=f"Message with ID {message_id} not found")
    
    # Delete the message
    await message_collection.delete_one({"_id": ObjectId(message_id)})
    return {"message": f"Message with ID {message_id} deleted successfully"}

@app.get("/setup-test-data")
async def setup_test_data():
    """
    Create test data in the database.
    """
    try:
        # Vérifier que nous utilisons la bonne collection
        print(f"Configuration de données de test dans la collection: POC-OMI")
        
        # Supprimer les données existantes
        delete_result = await message_collection.delete_many({})
        print(f"Suppression des données existantes: {delete_result.deleted_count} documents supprimés")
        
        # Dates pour les messages de test
        test_dates = ["2023-01-01", "2023-01-02", "2023-01-03", "2023-01-04", "2023-01-05"]
        # Types pour les messages de test
        test_types = ["INFO", "WARNING", "ERROR", "DEBUG"]
        
        # Créer des messages de test
        test_messages = []
        message_id = 1
        
        for d in test_dates:
            for t in test_types:
                test_messages.append({
                    "date": d,
                    "type": t,
                    "message": f"Message de test {message_id} de type {t} pour la date {d}"
                })
                message_id += 1
        
        # Insérer les messages de test dans la collection POC-OMI
        result = await message_collection.insert_many(test_messages)
        print(f"Insertion des données de test: {len(result.inserted_ids)} documents insérés dans POC-OMI")
        
        return {
            "message": f"Données de test créées avec succès: {len(result.inserted_ids)} messages dans la collection POC-OMI",
            "dates": test_dates,
            "types": test_types
        }
    except Exception as e:
        print(f"Erreur lors de la création des données de test: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création des données de test: {str(e)}")

@app.get("/db-config")
async def get_db_config():
    """
    Get information about the database configuration.
    """
    try:
        # Obtenir la liste des collections dans la base de données
        collections = await db.list_collection_names()
        
        # Obtenir des informations de base sur la collection utilisée
        collection_count = await message_collection.count_documents({})
        
        return {
            "database_name": db.name,
            "current_collection": "POC-OMI",
            "available_collections": collections,
            "document_count": collection_count
        }
    except Exception as e:
        print(f"Erreur lors de la récupération de la configuration de la base de données: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/repair-messages")
async def repair_messages():
    """
    Repair messages in the database by standardizing field names.
    """
    try:
        print("Récupération de tous les messages pour réparation...")
        messages = await message_collection.find({}).to_list(1000)
        print(f"Nombre total de messages trouvés: {len(messages)}")
        
        repaired_count = 0
        skipped_count = 0
        
        for msg in messages:
            # Vérifier si le message a besoin d'être réparé
            needs_repair = False
            standardized_fields = {}
            
            # Rechercher des champs avec des noms en majuscules
            for expected_field in ["date", "message", "type"]:
                capitalized_field = expected_field.capitalize()
                
                # Si le champ en minuscules n'existe pas mais celui en majuscules oui
                if expected_field not in msg and capitalized_field in msg:
                    needs_repair = True
                    standardized_fields[expected_field] = msg[capitalized_field]
            
            # Si une réparation est nécessaire, mettre à jour le document
            if needs_repair:
                update_result = await message_collection.update_one(
                    {"_id": msg["_id"]},
                    {"$set": standardized_fields}
                )
                
                if update_result.modified_count > 0:
                    repaired_count += 1
                    print(f"Message réparé: {msg['_id']}")
                else:
                    skipped_count += 1
                    print(f"Échec de la réparation du message: {msg['_id']}")
            else:
                skipped_count += 1
        
        return {
            "message": f"Réparation terminée. {repaired_count} messages réparés, {skipped_count} messages ignorés.",
            "repaired_count": repaired_count,
            "skipped_count": skipped_count,
            "total_messages": len(messages)
        }
    except Exception as e:
        print(f"Erreur lors de la réparation des messages: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la réparation des messages: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
