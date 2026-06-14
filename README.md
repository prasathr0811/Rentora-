# Rentora – Unified Buy & Rental Marketplace

Rentora is a premium, full-stack MERN application that merges e-commerce purchasing and daily rental leasing within a single unified platform. Users can buy products outright or lease them on daily budgets with automatic refundable security deposit calculations.

---

## 🚀 Key Features

* **Unified Catalog**: Each product listing supports both a **Purchase Price** and a **Daily Rental Rate** with an associated **Security Deposit**.
* **Smart Filter & Search**: Interactive sidebar filters for categories, subcategories, price types (buying/renting), price ranges, sorting, and live text search.
* **Simulated Checkout Gateway**: Captures recipient details, aggregates total buy amounts, lease charges, and deposits, and triggers a multi-phase 3-second secure payment authorization simulation.
* **Invoice System**: 
  * **On-the-fly PDF Generation**: Generates styled PDF invoices using `pdfkit` on the backend.
  * **Email Receipt**: Delivers payment confirmations with receipt attachments using `nodemailer` (or fallback logs).
  * **Interactive Receipt Page**: Renders beautiful web invoices, supporting browser printing and direct PDF downloads.
* **User Dashboards**: Dedicated history hubs for tracking outright purchases (`Orders`) and leasing periods (`Rentals`).

---

## 🛠️ Tech Stack

### Frontend
* **Core**: React.js, React Router DOM (v7)
* **Styling**: Tailwind CSS
* **State & Networking**: Context API (Auth, Cart), Axios, React Hot Toast

### Backend
* **Server**: Node.js, Express.js
* **Database**: MongoDB & Mongoose (schemas, aggregates)
* **Services**: PDFKit (PDF generation), Nodemailer (email notifications)
* **Auth**: JSON Web Tokens (JWT), bcryptjs hashing

---

## 📂 Project Structure

```text
Rentora/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # API request handlers
│   ├── middleware/      # Auth, error boundaries
│   ├── models/          # Mongoose schemas (User, Product, Order, Rental, Payment)
│   ├── routes/          # Express routing mounts
│   ├── seeders/         # 250+ products seeder script
│   ├── services/        # Nodemailer and PDFKit generators
│   └── server.js        # Entry point
└── frontend/
    ├── src/
    │   ├── components/  # Cards, Protected routes, Loading loaders
    │   ├── context/     # Auth and Shopping Cart contexts
    │   ├── layouts/     # Base UI main wrap
    │   ├── pages/       # Home, Catalog, Checkout, History, Receipt
    │   ├── services/    # Axios client
    │   └── App.jsx      # Client-side router configuration
```

---

## 🔧 Installation & Setup

### Prerequisites
* **Node.js** (v18+)
* **MongoDB** (running locally on port 27017)

### 1. Database Seeding & Startup
Open a terminal in the `backend` folder:
```bash
# Install dependencies
npm install

# Seed the database (Populates 250+ products & test accounts)
npm run seed

# Start the Express server
npm start
```
The API server runs on [http://localhost:5000](http://localhost:5000).

### 2. Frontend Development Server
Open a terminal in the `frontend` folder:
```bash
# Install dependencies
npm install

# Build & launch client
npm run dev
```
The React interface runs on [http://localhost:5173](http://localhost:5173).

---

## 🔑 Demo Account Credentials

You can log in and test all protected workflows using these pre-seeded accounts:

* **Demo User**:
  * Email: `demo@rentora.com`
  * Password: `123456`
* **Admin User**:
  * Email: `admin@rentora.com`
  * Password: `adminpassword`
