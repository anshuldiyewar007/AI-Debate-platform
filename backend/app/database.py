from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGODB_URI, DATABASE_NAME
import logging

client: AsyncIOMotorClient = None
db = None


async def connect_to_mongo():
    global client, db
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    logging.info("Connected to MongoDB")


async def close_mongo_connection():
    global client
    if client:
        client.close()
        logging.info("Closed MongoDB connection")

# TODO: Add helper functions for common DB operations
