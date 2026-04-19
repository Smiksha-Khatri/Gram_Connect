import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_database():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("Seeding database...")
    
    # Create admin user
    admin_data = {
        "user_id": "admin-001",
        "email": "admin@gramconnect.com",
        "name": "Admin User",
        "role": "admin",
        "phone": "9876543210",
        "password_hash": pwd_context.hash("admin123"),
        "created_at": "2024-01-01T00:00:00"
    }
    
    # Create sample sellers
    sellers = [
        {
            "user_id": "seller-001",
            "email": "ramesh@village.com",
            "name": "Ramesh Kumar",
            "role": "seller",
            "phone": "9876543211",
            "password_hash": pwd_context.hash("seller123"),
            "created_at": "2024-01-02T00:00:00"
        },
        {
            "user_id": "seller-002",
            "email": "lakshmi@village.com",
            "name": "Lakshmi Devi",
            "role": "seller",
            "phone": "9876543212",
            "password_hash": pwd_context.hash("seller123"),
            "created_at": "2024-01-03T00:00:00"
        }
    ]
    
    # Create sample customer
    customer_data = {
        "user_id": "customer-001",
        "email": "customer@example.com",
        "name": "Priya Sharma",
        "role": "customer",
        "phone": "9876543213",
        "password_hash": pwd_context.hash("customer123"),
        "created_at": "2024-01-04T00:00:00"
    }
    
    await db.users.delete_many({})
    await db.users.insert_one(admin_data)
    await db.users.insert_many(sellers)
    await db.users.insert_one(customer_data)
    print("✓ Users created")
    
    # Create seller stores
    stores = [
        {
            "store_id": "store-001",
            "seller_id": "seller-001",
            "store_url": "ramesh-organic-farm",
            "village_name": "Khedi",
            "state": "Madhya Pradesh",
            "farming_practices": "Traditional organic farming with cow-based agriculture",
            "family_background": "Third-generation farmer, cultivating land for 50+ years",
            "story": "Our family has been practicing organic farming for three generations. We grow turmeric, wheat, and pulses using traditional methods passed down from my grandfather.",
            "profile_image": "https://images.unsplash.com/photo-1594179131702-112ff2a880e4?w=500",
            "farm_images": ["https://images.pexels.com/photos/31715061/pexels-photo-31715061.jpeg?w=500"],
            "verified": True,
            "created_at": "2024-01-02T00:00:00"
        },
        {
            "store_id": "store-002",
            "seller_id": "seller-002",
            "store_url": "lakshmi-spice-garden",
            "village_name": "Palani",
            "state": "Tamil Nadu",
            "farming_practices": "Chemical-free spice cultivation with natural composting",
            "family_background": "Women-led farming cooperative",
            "story": "We are a group of women farmers growing premium organic spices. Our cardamom and pepper gardens are certified organic and we use only natural pest control methods.",
            "profile_image": "https://images.pexels.com/photos/20445181/pexels-photo-20445181.jpeg?w=500",
            "farm_images": ["https://images.pexels.com/photos/35396160/pexels-photo-35396160.jpeg?w=500"],
            "verified": True,
            "created_at": "2024-01-03T00:00:00"
        }
    ]
    
    await db.stores.delete_many({})
    await db.stores.insert_many(stores)
    print("✓ Stores created")
    
    # Create sample products
    products = [
        {
            "product_id": "prod-001",
            "seller_id": "seller-001",
            "name": "Organic Turmeric Powder",
            "description": "Pure organic turmeric powder from our farm. High curcumin content, perfect for cooking and medicinal use.",
            "category": "Spices",
            "price": 250,
            "quantity": 100,
            "unit": "kg",
            "images": ["https://images.pexels.com/photos/6808985/pexels-photo-6808985.jpeg?w=500"],
            "organic_certified": True,
            "certification_image": None,
            "created_at": "2024-01-05T00:00:00",
            "updated_at": "2024-01-05T00:00:00"
        },
        {
            "product_id": "prod-002",
            "seller_id": "seller-001",
            "name": "Whole Wheat Flour",
            "description": "Stone-ground whole wheat flour from locally grown wheat. Rich in fiber and nutrients.",
            "category": "Grains",
            "price": 45,
            "quantity": 500,
            "unit": "kg",
            "images": ["https://images.pexels.com/photos/5656730/pexels-photo-5656730.jpeg?w=500"],
            "organic_certified": True,
            "certification_image": None,
            "created_at": "2024-01-06T00:00:00",
            "updated_at": "2024-01-06T00:00:00"
        },
        {
            "product_id": "prod-003",
            "seller_id": "seller-002",
            "name": "Green Cardamom",
            "description": "Premium quality green cardamom pods. Grown in shade, naturally dried, intense aroma.",
            "category": "Spices",
            "price": 1200,
            "quantity": 50,
            "unit": "kg",
            "images": ["https://images.pexels.com/photos/9110517/pexels-photo-9110517.jpeg?w=500"],
            "organic_certified": True,
            "certification_image": None,
            "created_at": "2024-01-07T00:00:00",
            "updated_at": "2024-01-07T00:00:00"
        },
        {
            "product_id": "prod-004",
            "seller_id": "seller-002",
            "name": "Black Pepper",
            "description": "Bold and aromatic black pepper from Kerala. Perfect for everyday cooking.",
            "category": "Spices",
            "price": 600,
            "quantity": 80,
            "unit": "kg",
            "images": ["https://images.pexels.com/photos/6808985/pexels-photo-6808985.jpeg?w=500"],
            "organic_certified": True,
            "certification_image": None,
            "created_at": "2024-01-08T00:00:00",
            "updated_at": "2024-01-08T00:00:00"
        },
        {
            "product_id": "prod-005",
            "seller_id": "seller-001",
            "name": "Toor Dal (Pigeon Peas)",
            "description": "High-protein organic toor dal. Perfect for traditional Indian dishes.",
            "category": "Pulses",
            "price": 120,
            "quantity": 200,
            "unit": "kg",
            "images": ["https://images.pexels.com/photos/5656730/pexels-photo-5656730.jpeg?w=500"],
            "organic_certified": True,
            "certification_image": None,
            "created_at": "2024-01-09T00:00:00",
            "updated_at": "2024-01-09T00:00:00"
        }
    ]
    
    await db.products.delete_many({})
    await db.products.insert_many(products)
    print("✓ Products created")
    
    print("\n" + "="*50)
    print("Database seeded successfully!")
    print("="*50)
    print("\nTest Accounts:")
    print("\nAdmin:")
    print("  Email: admin@gramconnect.com")
    print("  Password: admin123")
    print("\nSeller:")
    print("  Email: ramesh@village.com")
    print("  Password: seller123")
    print("\nCustomer:")
    print("  Email: customer@example.com")
    print("  Password: customer123")
    print("="*50)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
