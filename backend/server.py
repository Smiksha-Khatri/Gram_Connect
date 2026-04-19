from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import os
import logging
import uuid
import time
import cloudinary
import cloudinary.utils
import razorpay
import resend
import asyncio
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION_HOURS = int(os.environ.get('JWT_EXPIRATION_HOURS', 168))

# Cloudinary config
cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
    secure=True
)

# Razorpay client
razorpay_client = razorpay.Client(auth=(
    os.environ.get('RAZORPAY_KEY_ID'),
    os.environ.get('RAZORPAY_KEY_SECRET', 'dummy_secret')
))

# Resend config
resend.api_key = os.environ.get('RESEND_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL')

# Create the main app
app = FastAPI(title="Gram Connect API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
api_router = APIRouter(prefix="/api")
@app.get("/")
def root():
    return {"message": "Gram Connect Backend Running"}
# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserRole:
    CUSTOMER = "customer"
    SELLER = "seller"
    ADMIN = "admin"

class OrderStatus:
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

# Auth Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str
    phone: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Seller Models
class SellerStore(BaseModel):
    model_config = ConfigDict(extra="ignore")
    store_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    seller_id: str
    store_url: str
    village_name: str
    state: str
    farming_practices: str
    family_background: str
    story: str
    profile_image: Optional[str] = None
    farm_images: List[str] = []
    verified: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SellerStoreCreate(BaseModel):
    store_url: str
    village_name: str
    state: str
    farming_practices: str
    family_background: str
    story: str
    profile_image: Optional[str] = None
    farm_images: List[str] = []

# Product Models
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    product_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    seller_id: str
    name: str
    description: str
    category: str
    price: float
    quantity: int
    unit: str
    images: List[str] = []
    organic_certified: bool = False
    certification_image: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ProductCreate(BaseModel):
    name: str
    description: str
    category: str
    price: float
    quantity: int
    unit: str
    images: List[str] = []
    organic_certified: bool = False
    certification_image: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    unit: Optional[str] = None
    images: Optional[List[str]] = None
    organic_certified: Optional[bool] = None
    certification_image: Optional[str] = None

# Cart Models
class CartItem(BaseModel):
    product_id: str
    quantity: int

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    cart_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    items: List[CartItem] = []
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Order Models
class OrderItem(BaseModel):
    product_id: str
    product_name: str
    price: float
    quantity: int
    seller_id: str

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    order_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    customer_name: str
    customer_email: str
    customer_phone: str
    items: List[OrderItem]
    total_amount: float
    shipping_address: Dict[str, str]
    payment_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    status: str = OrderStatus.PENDING
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class OrderCreate(BaseModel):
    items: List[OrderItem]
    total_amount: float
    shipping_address: Dict[str, str]
    customer_phone: str

# Review Models
class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    review_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    customer_id: str
    customer_name: str
    rating: int
    comment: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ReviewCreate(BaseModel):
    product_id: str
    rating: int
    comment: str

# Wishlist Model
class Wishlist(BaseModel):
    model_config = ConfigDict(extra="ignore")
    wishlist_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    product_ids: List[str] = []
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Notification Model
class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    notification_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    message: str
    type: str
    read: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

def require_role(allowed_roles: List[str]):
    async def role_checker(current_user: Dict = Depends(get_current_user)):
        if current_user['role'] not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=Token)
async def register(user_input: UserRegister):
    existing_user = await db.users.find_one({"email": user_input.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_data = user_input.model_dump()
    password = user_data.pop('password')
    user_data['password_hash'] = hash_password(password)
    
    user_obj = User(**{k: v for k, v in user_data.items() if k != 'password_hash'})
    user_doc = user_obj.model_dump()
    user_doc['password_hash'] = user_data['password_hash']
    
    await db.users.insert_one(user_doc)
    
    token = create_access_token({"user_id": user_obj.user_id, "role": user_obj.role})
    
    return Token(
        access_token=token,
        token_type="bearer",
        user=user_obj.model_dump()
    )

@api_router.post("/auth/login", response_model=Token)
async def login(user_input: UserLogin):
    user = await db.users.find_one({"email": user_input.email}, {"_id": 0})
    if not user or not verify_password(user_input.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"user_id": user['user_id'], "role": user['role']})
    
    user_data = {k: v for k, v in user.items() if k != 'password_hash'}
    
    return Token(
        access_token=token,
        token_type="bearer",
        user=user_data
    )

@api_router.get("/auth/me")
async def get_me(current_user: Dict = Depends(get_current_user)):
    return current_user

# ==================== CLOUDINARY ROUTES ====================

@api_router.get("/cloudinary/signature")
async def generate_cloudinary_signature(
    resource_type: str = Query("image", regex="^(image|video)$"),
    folder: str = "products",
    current_user: Dict = Depends(get_current_user)
):
    ALLOWED_FOLDERS = ("products", "stores", "certifications", "profiles")
    if folder not in ALLOWED_FOLDERS:
        raise HTTPException(status_code=400, detail="Invalid folder path")
    
    timestamp = int(time.time())
    params = {
        "timestamp": timestamp,
        "folder": folder,
        "resource_type": resource_type
    }
    
    signature = cloudinary.utils.api_sign_request(params, os.environ.get("CLOUDINARY_API_SECRET"))
    
    return {
        "signature": signature,
        "timestamp": timestamp,
        "cloud_name": os.environ.get("CLOUDINARY_CLOUD_NAME"),
        "api_key": os.environ.get("CLOUDINARY_API_KEY"),
        "folder": folder,
        "resource_type": resource_type
    }

# ==================== SELLER ROUTES ====================

@api_router.post("/seller/store", response_model=SellerStore)
async def create_or_update_store(
    store_input: SellerStoreCreate,
    current_user: Dict = Depends(require_role([UserRole.SELLER]))
):
    existing_store = await db.stores.find_one({"seller_id": current_user['user_id']}, {"_id": 0})
    
    if existing_store:
        update_data = store_input.model_dump()
        update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        await db.stores.update_one(
            {"seller_id": current_user['user_id']},
            {"$set": update_data}
        )
        updated_store = await db.stores.find_one({"seller_id": current_user['user_id']}, {"_id": 0})
        return SellerStore(**updated_store)
    else:
        store_data = store_input.model_dump()
        store_data['seller_id'] = current_user['user_id']
        store_obj = SellerStore(**store_data)
        await db.stores.insert_one(store_obj.model_dump())
        return store_obj

@api_router.get("/seller/store/{seller_id}", response_model=SellerStore)
async def get_store_by_seller(seller_id: str):
    store = await db.stores.find_one({"seller_id": seller_id}, {"_id": 0})
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return SellerStore(**store)

@api_router.get("/seller/store-url/{store_url}", response_model=SellerStore)
async def get_store_by_url(store_url: str):
    store = await db.stores.find_one({"store_url": store_url}, {"_id": 0})
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return SellerStore(**store)

@api_router.get("/seller/my-store", response_model=SellerStore)
async def get_my_store(current_user: Dict = Depends(require_role([UserRole.SELLER]))):
    store = await db.stores.find_one({"seller_id": current_user['user_id']}, {"_id": 0})
    if not store:
        raise HTTPException(status_code=404, detail="Store not found. Please create your store first.")
    return SellerStore(**store)

# ==================== PRODUCT ROUTES ====================

@api_router.post("/products", response_model=Product)
async def create_product(
    product_input: ProductCreate,
    current_user: Dict = Depends(require_role([UserRole.SELLER]))
):
    product_data = product_input.model_dump()
    product_data['seller_id'] = current_user['user_id']
    product_obj = Product(**product_data)
    await db.products.insert_one(product_obj.model_dump())
    return product_obj

@api_router.get("/products", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    organic: Optional[bool] = None,
    village: Optional[str] = None,
    search: Optional[str] = None
):
    query = {}
    
    if category:
        query['category'] = category
    if min_price is not None:
        query['price'] = query.get('price', {})
        query['price']['$gte'] = min_price
    if max_price is not None:
        query['price'] = query.get('price', {})
        query['price']['$lte'] = max_price
    if organic is not None:
        query['organic_certified'] = organic
    if search:
        query['$or'] = [
            {'name': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}}
        ]
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    
    if village:
        seller_ids = []
        stores = await db.stores.find({"village_name": {"$regex": village, "$options": "i"}}, {"_id": 0}).to_list(1000)
        seller_ids = [store['seller_id'] for store in stores]
        products = [p for p in products if p['seller_id'] in seller_ids]
    
    return [Product(**p) for p in products]

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    product_input: ProductUpdate,
    current_user: Dict = Depends(require_role([UserRole.SELLER]))
):
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product['seller_id'] != current_user['user_id']:
        raise HTTPException(status_code=403, detail="Not authorized to update this product")
    
    update_data = {k: v for k, v in product_input.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.products.update_one({"product_id": product_id}, {"$set": update_data})
    updated_product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    return Product(**updated_product)

@api_router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    current_user: Dict = Depends(require_role([UserRole.SELLER]))
):
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product['seller_id'] != current_user['user_id']:
        raise HTTPException(status_code=403, detail="Not authorized to delete this product")
    
    await db.products.delete_one({"product_id": product_id})
    return {"message": "Product deleted successfully"}

@api_router.get("/seller/products", response_model=List[Product])
async def get_seller_products(current_user: Dict = Depends(require_role([UserRole.SELLER]))):
    products = await db.products.find({"seller_id": current_user['user_id']}, {"_id": 0}).to_list(1000)
    return [Product(**p) for p in products]

# ==================== CART ROUTES ====================

@api_router.post("/cart/add")
async def add_to_cart(
    item: CartItem,
    current_user: Dict = Depends(require_role([UserRole.CUSTOMER]))
):
    cart = await db.carts.find_one({"customer_id": current_user['user_id']}, {"_id": 0})
    
    if not cart:
        cart_obj = Cart(customer_id=current_user['user_id'], items=[item])
        await db.carts.insert_one(cart_obj.model_dump())
        return {"message": "Item added to cart"}
    
    items = cart.get('items', [])
    existing_item = next((i for i in items if i['product_id'] == item.product_id), None)
    
    if existing_item:
        existing_item['quantity'] += item.quantity
    else:
        items.append(item.model_dump())
    
    await db.carts.update_one(
        {"customer_id": current_user['user_id']},
        {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Item added to cart"}

@api_router.get("/cart")
async def get_cart(current_user: Dict = Depends(require_role([UserRole.CUSTOMER]))):
    cart = await db.carts.find_one({"customer_id": current_user['user_id']}, {"_id": 0})
    if not cart:
        return {"items": [], "total": 0}
    
    items_with_details = []
    total = 0
    
    for item in cart.get('items', []):
        product = await db.products.find_one({"product_id": item['product_id']}, {"_id": 0})
        if product:
            item_total = product['price'] * item['quantity']
            total += item_total
            items_with_details.append({
                **item,
                "product": product,
                "item_total": item_total
            })
    
    return {"items": items_with_details, "total": total}

@api_router.delete("/cart/{product_id}")
async def remove_from_cart(
    product_id: str,
    current_user: Dict = Depends(require_role([UserRole.CUSTOMER]))
):
    cart = await db.carts.find_one({"customer_id": current_user['user_id']}, {"_id": 0})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = [i for i in cart.get('items', []) if i['product_id'] != product_id]
    
    await db.carts.update_one(
        {"customer_id": current_user['user_id']},
        {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Item removed from cart"}

@api_router.delete("/cart")
async def clear_cart(current_user: Dict = Depends(require_role([UserRole.CUSTOMER]))):
    await db.carts.update_one(
        {"customer_id": current_user['user_id']},
        {"$set": {"items": [], "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Cart cleared"}

# ==================== ORDER ROUTES ====================

@api_router.post("/orders/create-razorpay-order")
async def create_razorpay_order(
    order_input: OrderCreate,
    current_user: Dict = Depends(require_role([UserRole.CUSTOMER]))
):
    try:
        amount_paise = int(order_input.total_amount * 100)
        
        razorpay_order = razorpay_client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "payment_capture": 1
        })
        
        order_data = order_input.model_dump()
        order_data['customer_id'] = current_user['user_id']
        order_data['customer_name'] = current_user['name']
        order_data['customer_email'] = current_user['email']
        order_data['razorpay_order_id'] = razorpay_order['id']
        
        order_obj = Order(**order_data)
        await db.orders.insert_one(order_obj.model_dump())
        
        return {
            "order_id": order_obj.order_id,
            "razorpay_order_id": razorpay_order['id'],
            "amount": amount_paise,
            "currency": "INR",
            "key_id": os.environ.get('RAZORPAY_KEY_ID')
        }
    except Exception as e:
        logger.error(f"Error creating Razorpay order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")

@api_router.post("/orders/verify-payment")
async def verify_payment(
    payment_data: Dict[str, str],
    current_user: Dict = Depends(require_role([UserRole.CUSTOMER]))
):
    try:
        order = await db.orders.find_one(
            {"razorpay_order_id": payment_data['razorpay_order_id']},
            {"_id": 0}
        )
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        await db.orders.update_one(
            {"order_id": order['order_id']},
            {
                "$set": {
                    "payment_id": payment_data['razorpay_payment_id'],
                    "status": OrderStatus.CONFIRMED,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        for item in order['items']:
            product = await db.products.find_one({"product_id": item['product_id']}, {"_id": 0})
            if product:
                new_quantity = max(0, product['quantity'] - item['quantity'])
                await db.products.update_one(
                    {"product_id": item['product_id']},
                    {"$set": {"quantity": new_quantity}}
                )
        
        await db.carts.update_one(
            {"customer_id": current_user['user_id']},
            {"$set": {"items": []}}
        )
        
        email_html = f"""
        <h2>Order Confirmed - Gram Connect</h2>
        <p>Dear {order['customer_name']},</p>
        <p>Your order has been confirmed!</p>
        <p><strong>Order ID:</strong> {order['order_id']}</p>
        <p><strong>Total Amount:</strong> ₹{order['total_amount']}</p>
        <p>Thank you for supporting our farmers!</p>
        """
        
        try:
            await asyncio.to_thread(
                resend.Emails.send,
                {
                    "from": SENDER_EMAIL,
                    "to": [order['customer_email']],
                    "subject": "Order Confirmed - Gram Connect",
                    "html": email_html
                }
            )
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
        
        return {"message": "Payment verified successfully", "order_id": order['order_id']}
    except Exception as e:
        logger.error(f"Error verifying payment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Payment verification failed: {str(e)}")

@api_router.get("/orders")
async def get_orders(current_user: Dict = Depends(get_current_user)):
    if current_user['role'] == UserRole.CUSTOMER:
        orders = await db.orders.find({"customer_id": current_user['user_id']}, {"_id": 0}).to_list(1000)
    elif current_user['role'] == UserRole.SELLER:
        all_orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
        orders = []
        for order in all_orders:
            seller_items = [item for item in order['items'] if item['seller_id'] == current_user['user_id']]
            if seller_items:
                order_copy = order.copy()
                order_copy['items'] = seller_items
                orders.append(order_copy)
    else:
        orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, current_user: Dict = Depends(get_current_user)):
    order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if current_user['role'] == UserRole.CUSTOMER and order['customer_id'] != current_user['user_id']:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
    
    return order

@api_router.get("/seller/earnings")
async def get_seller_earnings(current_user: Dict = Depends(require_role([UserRole.SELLER]))):
    all_orders = await db.orders.find({"status": {"$in": [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED]}}, {"_id": 0}).to_list(1000)
    
    total_earnings = 0
    total_orders = 0
    
    for order in all_orders:
        for item in order['items']:
            if item['seller_id'] == current_user['user_id']:
                total_earnings += item['price'] * item['quantity']
                total_orders += 1
    
    return {
        "total_earnings": total_earnings,
        "total_orders": total_orders,
        "currency": "INR"
    }

# ==================== WISHLIST ROUTES ====================

@api_router.post("/wishlist/add")
async def add_to_wishlist(
    product_id: str,
    current_user: Dict = Depends(require_role([UserRole.CUSTOMER]))
):
    wishlist = await db.wishlists.find_one({"customer_id": current_user['user_id']}, {"_id": 0})
    
    if not wishlist:
        wishlist_obj = Wishlist(customer_id=current_user['user_id'], product_ids=[product_id])
        await db.wishlists.insert_one(wishlist_obj.model_dump())
        return {"message": "Product added to wishlist"}
    
    product_ids = wishlist.get('product_ids', [])
    if product_id not in product_ids:
        product_ids.append(product_id)
        await db.wishlists.update_one(
            {"customer_id": current_user['user_id']},
            {"$set": {"product_ids": product_ids, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    return {"message": "Product added to wishlist"}

@api_router.get("/wishlist")
async def get_wishlist(current_user: Dict = Depends(require_role([UserRole.CUSTOMER]))):
    wishlist = await db.wishlists.find_one({"customer_id": current_user['user_id']}, {"_id": 0})
    if not wishlist:
        return {"products": []}
    
    products = []
    for product_id in wishlist.get('product_ids', []):
        product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
        if product:
            products.append(product)
    
    return {"products": products}

@api_router.delete("/wishlist/{product_id}")
async def remove_from_wishlist(
    product_id: str,
    current_user: Dict = Depends(require_role([UserRole.CUSTOMER]))
):
    wishlist = await db.wishlists.find_one({"customer_id": current_user['user_id']}, {"_id": 0})
    if not wishlist:
        raise HTTPException(status_code=404, detail="Wishlist not found")
    
    product_ids = [pid for pid in wishlist.get('product_ids', []) if pid != product_id]
    
    await db.wishlists.update_one(
        {"customer_id": current_user['user_id']},
        {"$set": {"product_ids": product_ids, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Product removed from wishlist"}

# ==================== REVIEW ROUTES ====================

@api_router.post("/reviews", response_model=Review)
async def create_review(
    review_input: ReviewCreate,
    current_user: Dict = Depends(require_role([UserRole.CUSTOMER]))
):
    existing_review = await db.reviews.find_one({
        "product_id": review_input.product_id,
        "customer_id": current_user['user_id']
    }, {"_id": 0})
    
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this product")
    
    review_data = review_input.model_dump()
    review_data['customer_id'] = current_user['user_id']
    review_data['customer_name'] = current_user['name']
    
    review_obj = Review(**review_data)
    await db.reviews.insert_one(review_obj.model_dump())
    return review_obj

@api_router.get("/reviews/{product_id}", response_model=List[Review])
async def get_product_reviews(product_id: str):
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0}).to_list(1000)
    return [Review(**r) for r in reviews]

# ==================== ADMIN ROUTES ====================

@api_router.get("/admin/users")
async def get_all_users(current_user: Dict = Depends(require_role([UserRole.ADMIN]))):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

@api_router.put("/admin/verify-seller/{seller_id}")
async def verify_seller(
    seller_id: str,
    verified: bool,
    current_user: Dict = Depends(require_role([UserRole.ADMIN]))
):
    result = await db.stores.update_one(
        {"seller_id": seller_id},
        {"$set": {"verified": verified}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Seller store not found")
    
    return {"message": f"Seller {'verified' if verified else 'unverified'} successfully"}

@api_router.get("/admin/analytics")
async def get_analytics(current_user: Dict = Depends(require_role([UserRole.ADMIN]))):
    total_users = await db.users.count_documents({})
    total_sellers = await db.users.count_documents({"role": UserRole.SELLER})
    total_customers = await db.users.count_documents({"role": UserRole.CUSTOMER})
    total_products = await db.products.count_documents({})
    total_orders = await db.orders.count_documents({})
    
    all_orders = await db.orders.find({"status": {"$in": [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED]}}, {"_id": 0}).to_list(1000)
    total_revenue = sum(order['total_amount'] for order in all_orders)
    
    return {
        "total_users": total_users,
        "total_sellers": total_sellers,
        "total_customers": total_customers,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": total_revenue
    }

# ==================== FEATURED CONTENT ====================

@api_router.get("/featured/farmers")
async def get_featured_farmers():
    stores = await db.stores.find({"verified": True}, {"_id": 0}).to_list(6)
    return stores

@api_router.get("/featured/products")
async def get_featured_products():
    products = await db.products.find({"organic_certified": True}, {"_id": 0}).limit(8).to_list(8)
    return [Product(**p) for p in products]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )