# DineFlow - QR Based Restaurant Ordering System 🍽️

DineFlow is a modern, full-stack restaurant management system that enables seamless QR-based ordering for customers and comprehensive management tools for restaurant owners.

## 🚀 Features

### **For Customers**
- **Scan & Order**: Scan unique table QR codes to access the digital menu.
- **Smart Menu**: Browse by category (Veg, Non-Veg, Drinks, etc.), search for dishes, and view high-quality images.
- **Real-Time Order Tracking**: Place orders and track their status live (Accepted -> Preparing -> Ready -> Completed).
- **Offers & Discounts**: View and apply active offers directly from the menu.
- **Bill Summary**: View past orders and total bill amount for the current session.
- **Dark/Light Mode**: Fully responsive UI with theme toggle.

### **For Admins**
- **Dashboard Overview**: Real-time stats on total orders, revenue, and active tables.
- **Order Management**: Kanban-style view to manage order workflow (Pending -> Preparing -> Ready -> Completed).
- **Menu Management**: Add, edit, delete dishes with image upload (Cloudinary integrated).
- **Offer Management**: Create discount coupons (Percentage/Flat) with validation rules.
- **QR Code Generator**: Generate and download unique QR codes for each table.
- **Responsive Interface**: Manage your restaurant from desktop or mobile.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **Real-Time**: Polling (Socket.IO planned)
- **Cloud Storage**: Cloudinary (for menu images)
- **Icons**: Lucide React

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dineflow.git
   cd dineflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file in the root directory and add the following:

   ```env
   # Database Connection
   MONGODB_URI=mongodb://localhost:27017/qr-restaurant  # Or your MongoDB Atlas URI

   # Authentication Secret (Generate a strong random string)
   JWT_SECRET=your_jwt_secret_key_here

   # App URL (For QR Code generation)
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Cloudinary Configuration (For image uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Seed the Admin User**
   Run the seed script to create the first admin account:
   ```bash
   # Visit this API route in your browser or use curl/Postman
   GET http://localhost:3000/api/auth/seed
   ```
   *Default Credentials:*
   - Email: `admin@dineflow.com`
   - Password: `admin123`

5. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📱 Usage Guide

### **Customer Flow**
1. Visit `/table/1` (simulates scanning Table 1 QR code).
2. Browse menu, add items to cart.
3. Place order.
4. Watch the status screen for updates.
5. When order is "Ready", a notification popup appears.

### **Admin Flow**
1. Visit `/admin/login`.
2. Log in with admin credentials.
3. Monitor incoming orders on the dashboard.
4. Update order status as they are prepared.
5. Manage menu items and offers from the sidebar.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the MIT License.
