# Home Assistant - Family Edition

A mobile-friendly, persistent Home Assistant application for families.

## Features

- **Family Login:** Enter your family name to access your personal dashboard.
- **Persistent Inventory:** Keep track of household items (Groceries, Electronics, etc.). Data is saved per family.
- **Control Panel:** Manage lights and modes (Home/Away/Night).
- **Mobile First:** Designed for mobile usage.

## Setup

### Backend

1. Navigate to `backend`:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
3. Run the server:
   ```sh
   python main.py
   ```
   The API will be available at `http://localhost:8000`.

### Frontend

1. Navigate to `frontend`:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Run the development server:
   ```sh
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

## Tech Stack

- **Backend:** FastAPI, SQLite, SQLAlchemy
- **Frontend:** React, React Router, Axios, Lucide Icons
- **Styling:** CSS (Mobile-first)
