# Restaurant Management System

A comprehensive Restaurant Management System featuring a modern React frontend and a robust Node.js/Express backend. This application provides tools for restaurant owners to manage their business, including dashboard analytics, menu management, authentication, and more.

## Features

- **Owner Dashboard:** Overview of restaurant performance, analytics, and quick actions.
- **Authentication:** Secure login, registration, password recovery, and Google OAuth integration.
- **Restaurant Management:** Setup and manage restaurant details and profiles.
- **Modern UI:** Built with React, Tailwind CSS, Material UI, and Framer Motion for a seamless and responsive user experience.
- **Secure Backend:** Protected API endpoints with JWT authentication, rate limiting, and data sanitization.
- **Integrations:** Cloudinary for image uploads, Nodemailer for emails, Twilio for SMS, and OpenAI integration.

## Tech Stack

### Frontend
- **Framework:** React 19 with Vite
- **Styling:** Tailwind CSS, Material UI (@mui/material), Emotion
- **Animations:** Framer Motion
- **Icons:** Heroicons, Lucide React
- **Charts:** Chart.js, react-chartjs-2
- **Routing:** React Router DOM
- **Network:** Axios
- **Auth:** Google OAuth (`@react-oauth/google`)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose)
- **Authentication:** JSON Web Tokens (JWT), bcryptjs for password hashing
- **Security:** Helmet, express-mongo-sanitize, xss-clean, express-rate-limit, hpp
- **File Uploads:** Multer, Cloudinary
- **Communication:** Nodemailer, Twilio
- **Other Services:** OpenAI

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)
- API Keys for third-party services (Cloudinary, Google OAuth, OpenAI, Twilio, etc.)

## Installation & Setup

Follow these steps to get the project up and running locally.

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Restaurant-Management-System
```

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and configure environment variables.

```bash
cd backend
npm install
```

**Environment Variables (Backend):**
Create a `.env` file in the `backend` directory and configure the following variables (add/adjust based on your actual setup):
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
# Add other keys like TWILIO, OPENAI, EMAIL SMTP as required by the backend
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, install dependencies, and configure environment variables.

```bash
cd frontend
npm install
```

**Environment Variables (Frontend):**
Create a `.env` file in the `frontend` directory based on the provided `.env.example`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
# Add any other required VITE_* variables
```

## Running the Application

To run both the frontend and backend servers simultaneously for development, you will need two terminal windows.

**Terminal 1: Start the Backend Server**
```bash
cd backend
npm run dev
```
*The backend will start on the port specified in your `.env` (default is usually 5000).*

**Terminal 2: Start the Frontend Development Server**
```bash
cd frontend
npm run dev
```
*The frontend will start and can be accessed at `http://localhost:5173` (or another port provided by Vite).*

## Project Structure

```
Restaurant-Management-System/
├── backend/                # Node.js Express backend server
│   ├── src/                # Backend source code (controllers, models, routes)
│   ├── package.json
│   └── server.js           # Entry point for the backend
└── frontend/               # React Vite frontend application
    ├── src/                # Frontend source code (components, pages, styles)
    ├── package.json
    └── vite.config.js
```
