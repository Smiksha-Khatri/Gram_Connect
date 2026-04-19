# Gram Connect

A full-stack e-commerce marketplace connecting rural farmers directly with urban consumers, eliminating middlemen and ensuring fair prices for authentic organic products.

## Features

### Core Features Implemented

#### Authentication & User Roles
- **Customer**: Browse products, add to cart, checkout with Razorpay, view order history
- **Seller**: Create store with farmer story, manage products and inventory, view orders
- JWT-based secure authentication with password hashing

#### Customer Features
- Browse and search products with filters (category, price, organic, village)
- View product details with complete farmer story
- Shopping cart management
- Secure checkout with Razorpay payment gateway
- Order history and tracking
- Bottom navigation for mobile users

#### Seller Features
- Personal store setup with unique URL
- Add farmer story (village, farming practices, family background)
- Product management (add, view, delete)
- Image uploads via Cloudinary
- Order management
- Revenue tracking

#### Homepage
- Hero section with mission statement
- Featured farmers and products
- How it works section
- Impact metrics
- Mobile-first responsive design

## Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **MongoDB** - NoSQL database (Motor async driver)
- **JWT** - Secure authentication
- **Cloudinary** - Image storage and CDN
- **Razorpay** - Payment gateway integration
- **Resend** - Email notifications

### Frontend
- **React 19** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS
- **Shadcn UI** - Component library
- **Lucide React** - Icons
- **Sonner** - Toast notifications
- **react-razorpay** - Payment integration

## Design System

### Colors
- **Primary (Terracotta)**: `#E07A5F` - CTA buttons, emphasis
- **Secondary (Sage Green)**: `#81B29A` - Organic badges, trust signals
- **Background (Warm Sand)**: `#F4F1DE` - Main background
- **Text (Deep Charcoal)**: `#3D405B` - Primary text
- **Accent (Mustard)**: `#F2CC8F` - Highlights, warnings

### Typography
- **Headings**: Playfair Display (serif) - Storytelling feel
- **Body**: Nunito (sans-serif) - Friendly, readable
- **Accent**: Caveat (handwriting) - Decorative elements

## Test Accounts

**Seller Account (Ramesh Kumar)**
- Email: ramesh@village.com
- Password: seller123
- Has store and products pre-loaded

**Customer Account (Priya Sharma)**
- Email: customer@example.com
- Password: customer123

**Admin Account**
- Email: admin@gramconnect.com
- Password: admin123

## Database Collections

- **users**: User accounts (customer/seller/admin)
- **stores**: Seller store information with farmer stories
- **products**: Product listings
- **carts**: Customer shopping carts
- **orders**: Order history with payment info

---

**Built with ❤️ for Indian farmers**
