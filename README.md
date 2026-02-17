# Namita Suit Sansaar — Premium Ethnic Wear E-Commerce

A full-stack e-commerce website for women's ethnic wear, built with **Next.js 14**, **MongoDB**, and a premium dark + gold theme.

## 🚀 Quick Start (Local Setup)

### Prerequisites
- **Node.js** 18+ installed
- **MongoDB** running locally (or MongoDB Atlas URI)

### Steps

1. **Clone / Navigate to the project**
   ```bash
   cd namita-suit-sansaar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local`:
   ```
   MONGODB_URI=mongodb://localhost:27017/namita-suit-sansaar
   JWT_SECRET=your-secret-key-here
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Start the dev server**
   ```bash
   npm run dev
   ```

5. **Seed the database** — Open your browser and click the "Seed Sample Products" button on the homepage, or make a POST request:
   ```bash
   curl -X POST http://localhost:3000/api/seed
   ```

6. **Open** [http://localhost:3000](http://localhost:3000)

## 🔑 Default Admin Credentials

| Field    | Value                          |
|----------|--------------------------------|
| Email    | `admin@namitasuitsansaar.com`  |
| Password | `Admin@123`                    |

## 📁 Project Structure

```
namita-suit-sansaar/
├── app/
│   ├── layout.js              # Root layout
│   ├── page.js                # Landing page
│   ├── globals.css            # Design system
│   ├── login/page.js          # Login
│   ├── register/page.js       # Register
│   ├── products/
│   │   ├── page.js            # Product listing
│   │   └── [id]/page.js       # Product detail
│   ├── cart/page.js           # Cart
│   ├── checkout/page.js       # Checkout
│   ├── orders/page.js         # Order history
│   ├── admin/
│   │   ├── layout.js          # Admin layout + auth guard
│   │   ├── page.js            # Dashboard stats
│   │   ├── products/page.js   # Product CRUD
│   │   ├── orders/page.js     # Order management
│   │   └── customers/page.js  # Customer list
│   └── api/                   # REST API routes
│       ├── auth/              # register, login, logout, me
│       ├── products/          # CRUD + search/filter
│       ├── orders/            # create, list, update status
│       ├── users/             # admin: list users
│       ├── upload/            # image upload
│       ├── admin/stats/       # dashboard stats
│       └── seed/              # seed admin + products
├── components/                # React components
├── lib/                       # DB, auth, models
└── public/uploads/            # Uploaded images
```

## 🌐 Deployment

### Frontend + Backend (Vercel)
1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set environment variables:
   - `MONGODB_URI` → your MongoDB Atlas connection string
   - `JWT_SECRET` → a strong random string
   - `NEXT_PUBLIC_BASE_URL` → your Vercel URL
4. Deploy

### Database (MongoDB Atlas)
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user
3. Whitelist `0.0.0.0/0` for connections
4. Copy the connection string to `MONGODB_URI`

### Alternative Backend (Render/Railway)
1. Create a new Web Service
2. Set the build command: `npm run build`
3. Set the start command: `npm start`
4. Add environment variables

## 🎨 Design System

| Token        | Value                |
|-------------|----------------------|
| Background  | `#0f0f0f`           |
| Cards       | `#1a1a1a`           |
| Gold Accent | `#d4a853`           |
| Gold Hover  | `#e8c57a`           |
| Text        | `#f5f5f5`           |
| Font        | Inter + Playfair Display |

## 🔒 Security

- Passwords hashed with **bcrypt** (12 rounds)
- JWT tokens stored in **HTTP-only cookies**
- Role-based middleware for admin routes
- Input validation on all API endpoints
- Parameterized MongoDB queries (Mongoose)
