# ShakeItUp 🍸

A modern, responsive web app for discovering and creating cocktails. Built with **Vue 3**, **Tailwind CSS**, and a **Node.js + Express + MongoDB** backend.

---

## ✨ Features

### 🍇 Cocktails Explorer
- Live search by name or ingredients
- Filter by:
  - Alcohol type (Gin, Rum, Vodka...)
  - Flavor style (Fruity, Bitter, Sweet...)
  - Specific ingredients
  - Alcohol-free only
  - Official recipes only
- Responsive grid from mobile to wide screens (1 to 5 columns)
- Visual tags for alcoholic/non-alcoholic, style, and official status
- Image fallback if cocktail image fails to load

### 🔑 Authentication
- Login and register
- Session stored in localStorage
- Protected routes with redirect logic

### 🎪 My Creations
- Authenticated users can add their own cocktails
- Structured form with:
  - Name
  - Ingredients (line-by-line)
  - Instructions
  - Image URL
  - Alcoholic flag
  - (Upcoming) flavor style, official toggle

### 🍻 Ingredients View
- Browse a unique list of ingredients used in cocktails

---

## ⚡ Tech Stack

### Frontend
- Vue 3 (script setup)
- Tailwind CSS (custom theme + breakpoints)
- Vite
- Vue Router

### Backend
- Node.js
- Express
- MongoDB (Mongoose)

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB running locally or via Atlas

### 1. Clone & Install
```bash
git clone https://github.com/fgmcolas/ShakeItUp.git
cd shakeitup

# Backend
yarn install  # or npm install

# Frontend
cd frontend
yarn install  # or npm install
```

### 2. Run Development
```bash
# In root directory (for backend)
yarn dev

# In /frontend directory
cd frontend
yarn dev
```

### 3. Environment Variables
Create a `.env` file for backend:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/shakeitup
JWT_SECRET=your-secret-key
```

---

## 🌐 Deployment
- Frontend is built with `vite build`
- Backend is deployable to services like Render, Railway or DigitalOcean

---

## 🌐 Demo
_(Coming soon)_

---

## 📁 Project Structure
```
shakeitup/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── data/cocktails.json
├── frontend/
│   ├── src/
│   │   ├── views/
│   │   ├── components/
│   │   ├── composables/
│   │   └── assets/
│   └── public/default-cocktail.jpg
```

---

## 📊 Roadmap
- [x] Cocktail search + filters
- [x] Login/Register with session persistence
- [x] Custom sidebar + responsive layout
- [x] Add cocktail form
- [x] Backend API + MongoDB support
- [ ] Favoriting cocktails
- [ ] Editing/removing your creations

---

## 🙌 Credits
- UI Icons: Lucide
- Cocktail illustrations: Custom fallback
- Inspiration: Real bar menus & Vue Mastery

---

## ✊ License
[MIT](LICENSE)

---

Built with love and lemon by the ShakeItUp dev team ❤️

