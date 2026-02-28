# Smart Home Assistant

A simple, mobile-responsive Home Assistant dashboard built with FastAPI and React.

## Project Structure
- `/backend`: FastAPI Python server
- `/frontend`: React + Vite dashboard

## Getting Started

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. `uvicorn main:app --reload`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Deployment to Render
1. Push this project to GitHub.
2. Connect your GitHub account to [Render](https://render.com).
3. Render will automatically detect the `render.yaml` file and deploy both services.
   - Note: You may need to update the `destination` URL in `render.yaml` under the frontend rewrite rule to match your actual backend URL after the first deployment.
