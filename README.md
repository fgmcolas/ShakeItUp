![CocktailCard](https://i.ibb.co/jPnWNmX5/Shake-It-Up-logo.png)

ShakeItUp is a modern, responsive web app for discovering, creating, and rating cocktails. Built with **Vue 3**, **Tailwind CSS**, and a **Node.js + Express + MongoDB** backend, it lets you explore official and custom recipes based on your ingredients.

---

## 🌐 Live Demo

Try the app: [ShakeItUp](https://shake-it-up-neon.vercel.app) (opens in a new tab)


## ✨ Features

### 🎉 Welcome Dashboard
- Friendly introduction and quick navigation
- Links to all main sections: Cocktails, Ingredients, Creation, Favorites

![CocktailCard](https://i.ibb.co/XxKvBZYj/Dashboard.jpg)

### 🍹 Cocktail Cards

Browse colorful cocktail cards featuring ratings, badges (e.g. Alcoholic, Fruity, Official), and quick access to rate or favorite each recipe.

### 🍇 Cocktail Explorer
- Live search by name or ingredients
- Advanced filtering:
  - Alcohol type (Gin, Vodka, Rum…)
  - Flavor style (Fruity, Bitter, Sweet…)
  - Specific ingredients
  - Alcohol-free only
  - Official recipes only
- Fully responsive grid layout (1 to 5 columns)
- Visual tags: Alcoholic, Fruity, Official, etc.
- Star rating and user comments system

### 🧪 My Ingredients
- “Fridge” style interface to select available ingredients
- Instantly shows which cocktails you can make

### 🍸 Cocktail Creation
- Structured form including:
  - Cocktail name
  - Ingredients list
  - Instructions
  - Image upload
  - Alcoholic toggle
- Real-time preview of the cocktail card

### ❤️ Favorites
- Mark cocktails as favorites
- Quick access via dedicated view

### 🔒 Authentication
- User registration & login
- Sessions persisted via `localStorage`
- Protected routes for authenticated users

---

## ⚙️ Tech Stack

### Frontend
- Vue 3 (Composition API)
- Tailwind CSS (custom theme + responsive breakpoints)
- Vue Router
- Vite

### Backend
- Node.js + Express
- MongoDB (Mongoose)
- JWT Authentication

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account or local instance

### 1. Clone & Install
```bash
git clone https://github.com/fgmcolas/ShakeItUp.git
cd shakeitup

# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Run in Dev
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### 3. Environment Variables
Create a `.env` file in the backend folder:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@shakeitupcluster.dq5mhqm.mongodb.net
JWT_SECRET=your_jwt_secret_here
```
🔒 **Note**: Keep sensitive data out of version control.

---

## 📁 Project Structure
```
shakeitup/
├── backend/               # Node.js + Express API
│   ├── controllers/       # Business logic
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express routes
│   ├── middleware/        # Auth, validation, etc.
│   ├── scripts/           # Data seeding
│   ├── uploads/           # Uploaded cocktail images
│   └── index.js           # Entry point
│
├── frontend/              # Vue 3 SPA
│   ├── public/            # Static assets (logo, screenshots)
│   ├── src/
│   │   ├── components/     # Reusable UI
│   │   ├── views/          # Page views (Cocktails, Favorites…)
│   │   ├── router/         # Vue Router config
│   │   ├── stores/         # Pinia stores
│   │   └── main.js         # App entry point
│
└── README.md              # Project documentation
```

---

## 📊 Roadmap

- [x] Authentication with JWT
- [x] Cocktail search and filters
- [x] Cocktail creation form
- [x] Ingredient-based cocktail suggestions
- [x] Live preview when creating
- [x] Favorites system
- [x] Ratings & comments
- [x] Responsive sidebar
- [x] Deployment

---

## 🙌 Credits
- UI Icons: Lucide
- Illustrations: Custom fallback
- Inspiration: Real bar menus & Vue Mastery

---

## 📝 License
[MIT](LICENSE)

---

Built with love (and a splash of lime 🍋) by the ShakeItUp team.
