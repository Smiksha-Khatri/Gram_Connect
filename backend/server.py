from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv, find_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from contextlib import asynccontextmanager
from passlib.context import CryptContext
from jose import JWTError, jwt
import os
import logging
import uuid
import time
import asyncio
import cloudinary
import cloudinary.utils
import razorpay
import resend

# ==================== ENV & LOGGING ====================
load_dotenv(find_dotenv(), override=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# ==================== CONFIG ====================
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "gram_connect")
JWT_SECRET = os.environ.get("JWT_SECRET")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_HOURS = int(os.environ.get("JWT_EXPIRATION_HOURS", 168))

if not MONGO_URL:
    raise RuntimeError("MONGO_URL environment variable is required")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET environment variable is required")

# CORS
_default_origins = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"
CORS_ORIGINS = [o.strip() for o in os.environ.get("CORS_ORIGINS", _default_origins).split(",") if o.strip()]

# ==================== MONGO ====================
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ==================== SECURITY ====================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# ==================== CLOUDINARY ====================
CLOUDINARY_CLOUD_NAME = os.environ.get("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.environ.get("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.environ.get("CLOUDINARY_API_SECRET")

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True,
)

# ==================== RAZORPAY ====================
RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET")
razorpay_client = None
if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
else:
    logger.warning("Razorpay credentials missing")

# ==================== RESEND ====================
RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY
SENDER_EMAIL = os.environ.get("SENDER_EMAIL")

# ==================== APP / LIFESPAN ====================
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Gram Connect API")
    yield
    logger.info("Shutting down Mongo client")
    client.close()

app = FastAPI(title="Gram Connect API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")

@app.get("/")
def root():
    return {"message": "Gram Connect Backend Running"}

@app.get("/health")
def health():
    return {"status": "ok"}

# ==================== CONSTANTS ====================
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

# ==================== MODELS ====================
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

class CartItem(BaseModel):
    product_id: str
    quantity: int

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    cart_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    items: List[CartItem] = []
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

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

class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: Optional[str] = None

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

class Wishlist(BaseModel):
    model_config = ConfigDict(extra="ignore")
    wishlist_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    product_ids: List[str] = []
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class WishlistAdd(BaseModel):
    product_id: str

class VerifySellerBody(BaseModel):
    verified: bool

# ==================== HELPERS ====================
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")

def require_role(roles: List[str]):
    async def checker(user=Depends(get_current_user)):
        if user["role"] not in roles:
            raise HTTPException(status_code=403, detail="Permission denied")
        return user
    return checker

# ==================== AUTH ====================
@api_router.post("/auth/register", response_model=Token)
async def register(user_input: UserRegister):
    if await db.users.find_one({"email": user_input.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    user_data = user_input.model_dump()
    password = user_data.pop("password")
    user_obj = User(**user_data)
    user_doc = user_obj.model_dump()
    user_doc["password_hash"] = hash_password(password)

    await db.users.insert_one(user_doc)
    token = create_access_token({"user_id": user_obj.user_id, "role": user_obj.role})
    return Token(access_token=token, token_type="bearer", user=user_obj.model_dump())

@api_router.post("/auth/login", response_model=Token)
async def login(user_input: UserLogin):
    user = await db.users.find_one({"email": user_input.email})
    if not user or not verify_password(user_input.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"user_id": user["user_id"], "role": user["role"]})
    user_data = {k: v for k, v in user.items() if k not in ("_id", "password_hash")}
    return Token(access_token=token, token_type="bearer", user=user_data)

@api_router.get("/auth/me")
async def get_me(current_user: Dict = Depends(get_current_user)):
    return current_user

# ==================== CLOUDINARY ====================
@api_router.get("/cloudinary/signature")
async def generate_cloudinary_signature(
    resource_type: str = Query("image", pattern="^(image|video)$"),
    folder: str = "products",
    current_user: Dict = Depends(get_current_user),
):
    ALLOWED_FOLDERS = ("products", "stores", "certifications", "profiles")
    if folder not in ALLOWED_FOLDERS:
        raise HTTPException(status_code=400, detail="Invalid folder path")

    timestamp = int(time.time())
    params = {"timestamp": timestamp, "folder": folder}
    # Important: api_sign_request does not take resource_type inside the signature params usually
    signature = cloudinary.utils.api_sign_request(params, CLOUDINARY_API_SECRET)

    return {
        "signature": signature,
        "timestamp": timestamp,
        "cloud_name": CLOUDINARY_CLOUD_NAME,
        "api_key": CLOUDINARY_API_KEY,
        "folder": folder,
        "resource_type": resource_type,
    }

# ==================== SELLER STORES ====================
@api_router.post("/seller/store", response_model=SellerStore)
async def create_or_update_store(
    store_input: SellerStoreCreate,
    current_user: Dict = Depends(require_role([UserRole.SELLER])),
):
    existing = await db.stores.find_one({"seller_id": current_user["user_id"]})
    if existing:
        update_data = store_input.model_dump()
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.stores.update_one({"seller_id": current_user["user_id"]}, {"$set": update_data})
        updated = await db.stores.find_one({"seller_id": current_user["user_id"]}, {"_id": 0})
        return SellerStore(**updated)
    
    store_data = store_input.model_dump()
    store_data["seller_id"] = current_user["user_id"]
    store_obj = SellerStore(**store_data)
    await db.stores.insert_one(store_obj.model_dump())
    return store_obj

@api_router.get("/seller/my-store", response_model=SellerStore)
async def get_my_store(current_user: Dict = Depends(require_role([UserRole.SELLER]))):
    store = await db.stores.find_one({"seller_id": current_user["user_id"]}, {"_id": 0})
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return SellerStore(**store)

@api_router.get("/seller/store/{seller_id}", response_model=SellerStore)
async def get_store_by_seller(seller_id: str):
    store = await db.stores.find_one({"seller_id": seller_id}, {"_id": 0})
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return SellerStore(**store)

# ==================== PRODUCTS ====================
@api_router.post("/products", response_model=Product)
async def create_product(
    product_input: ProductCreate,
    current_user: Dict = Depends(require_role([UserRole.SELLER])),
):
    product_data = product_input.model_dump()
    product_data["seller_id"] = current_user["user_id"]
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
    search: Optional[str] = None,
):
    query: Dict[str, Any] = {}
    if category:
        query["category"] = category
    
    price_filter = {}
    if min_price is not None:
        price_filter["$gte"] = min_price
    if max_price is not None:
        price_filter["$lte"] = max_price
    if price_filter:
        query["price"] = price_filter
        
    if organic is not None:
        query["organic_certified"] = organic
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]

    if village:
        stores = await db.stores.find(
            {"village_name": {"$regex": village, "$options": "i"}}
        ).to_list(1000)
        seller_ids = [s["seller_id"] for s in stores]
        query["seller_id"] = {"$in": seller_ids}

    products = await db.products.find(query, {"_id": 0}).to_list(1000)
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
    current_user: Dict = Depends(require_role([UserRole.SELLER])),
):
    product = await db.products.find_one({"product_id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product["seller_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = product_input.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.update_one({"product_id": product_id}, {"$set": update_data})
    updated = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    return Product(**updated)

@api_router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    current_user: Dict = Depends(require_role([UserRole.SELLER])),
):
    product = await db.products.find_one({"product_id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product["seller_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    await db.products.delete_one({"product_id": product_id})
    return {"message": "Product deleted successfully"}

# ==================== CART ====================
@api_router.post("/cart/add")
async def add_to_cart(
    item: CartItem,
    current_user: Dict = Depends(require_role([UserRole.CUSTOMER])),
):
    cart = await db.carts.find_one({"customer_id": current_user["user_id"]})
    if not cart:
        cart_obj = Cart(customer_id=current_user["user_id"], items=[item])
        await db.carts.insert_one(cart_obj.model_dump())
    else:
        items = cart.get("items", [])
        existing = next((i for i in items if i["product_id"] == item.product_id), None)
        if existing:
            existing["quantity"] += item.quantity
        else:
            items.append(item.model_dump())

        await db.carts.update_one(
            {"customer_id": current_user["user_id"]},
            {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}},
        )
    return {"message": "Item added to cart"}

@api_router.get("/cart")
async def get_cart(current_user: Dict = Depends(require_role([UserRole.CUSTOMER]))):
    cart = await db.carts.find_one({"customer_id": current_user["user_id"]})
    if not cart:
        return {"items": [], "total": 0}

    items_with_details = []
    total = 0
    for item in cart.get("items", []):
        product = await db.products.find_one({"product_id": item["product_id"]}, {"_id": 0})
        if product:
            item_total = product["price"] * item["quantity"]
            total += item_total
            items_with_details.append({**item, "product": product, "item_total": item_total})

    return {"items": items_with_details, "total": total}

# ==================== ORDERS & PAYMENTS ====================
@api_router.post("/orders/create-razorpay-order")
async def create_razorpay_order(
    order_input: OrderCreate,
    current_user: Dict = Depends(require_role([UserRole.CUSTOMER])),
):
    if razorpay_client is None:
        raise HTTPException(status_code=503, detail="Payments not configured")
    try:
        amount_paise = int(order_input.total_amount * 100)
        razorpay_order = razorpay_client.order.create({
            "amount": amount_paise,
            "currency": "INR",
        })

        order_data = order_input.model_dump()
        order_data["customer_id"] = current_user["user_id"]
        order_data["customer_name"] = current_user["name"]
        order_data["customer_email"] = current_user["email"]
        order_data["razorpay_order_id"] = razorpay_order["id"]

        order_obj = Order(**order_data)
        await db.orders.insert_one(order_obj.model_dump())

        return {
            "order_id": order_obj.order_id,
            "razorpay_order_id": razorpay_order["id"],
            "amount": amount_paise,
            "key_id": RAZORPAY_KEY_ID,
        }
    except Exception as e:
        logger.error(f"Razorpay Error: {e}")
        raise HTTPException(status_code=500, detail="Order creation failed")

@api_router.post("/orders/verify-payment")
async def verify_payment(
    payment_data: PaymentVerify,
    current_user: Dict = Depends(require_role([UserRole.CUSTOMER])),
):
    order = await db.orders.find_one({"razorpay_order_id": payment_data.razorpay_order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    await db.orders.update_one(
        {"order_id": order["order_id"]},
        {"$set": {
            "payment_id": payment_data.razorpay_payment_id,
            "status": OrderStatus.CONFIRMED,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }},
    )

    # Atomic stock decrement
    for item in order["items"]:
        await db.products.update_one(
            {"product_id": item["product_id"]},
            {"$inc": {"quantity": -item["quantity"]}}
        )

    await db.carts.update_one({"customer_id": current_user["user_id"]}, {"$set": {"items": []}})

    if SENDER_EMAIL and RESEND_API_KEY:
        email_html = f"<h2>Order Confirmed</h2><p>ID: {order['order_id']}</p>"
        try:
            # Fixed resend call (wrap in to_thread if using sync library in async route)
            await asyncio.to_thread(
                resend.Emails.send,
                {
                    "from": SENDER_EMAIL,
                    "to": [order["customer_email"]],
                    "subject": "Order Confirmed - Gram Connect",
                    "html": email_html,
                }
            )
        except Exception as e:
            logger.error(f"Email failed: {e}")

    return {"message": "Success", "order_id": order["order_id"]}

@api_router.get("/orders")
async def get_orders(current_user: Dict = Depends(get_current_user)):
    if current_user["role"] == UserRole.CUSTOMER:
        query = {"customer_id": current_user["user_id"]}
    elif current_user["role"] == UserRole.SELLER:
        query = {"items.seller_id": current_user["user_id"]}
    else:
        query = {}
    
    orders = await db.orders.find(query, {"_id": 0}).to_list(1000)
    return orders

# ==================== ADMIN & ANALYTICS ====================
@api_router.put("/admin/verify-seller/{seller_id}")
async def verify_seller(
    seller_id: str,
    body: VerifySellerBody,
    current_user: Dict = Depends(require_role([UserRole.ADMIN])),
):
    result = await db.stores.update_one(
        {"seller_id": seller_id}, {"$set": {"verified": body.verified}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Store not found")
    return {"message": "Updated"}

@api_router.get("/featured/farmers")
async def get_featured_farmers():
    return await db.stores.find({"verified": True}, {"_id": 0}).to_list(6)

@api_router.get("/featured/products")
async def get_featured_products():
    products = await db.products.find({"organic_certified": True}, {"_id": 0}).limit(8).to_list(8)
    return [Product(**p) for p in products]

# ==================== MOUNT ROUTER ====================
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), reload=True)