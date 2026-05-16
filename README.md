# Smart Leads Dashboard

This is my assignment for the MERN Smart Leads Dashboard. It is a full-stack app for managing leads with user roles, search, and a nice UI.

## Main Features
- Login and Register with JWT
- Admin can manage leads, Sales users can only view
- Search leads by name or email
- Filter leads by status and source
- Export leads to CSV
- Dark mode toggle

## Tech Stack
- Frontend: React, Vite, Tailwind CSS, React Query
- Backend: Node.js, Express, MongoDB, TypeScript

## Project Structure
- `client/`: React frontend
- `server/`: Express backend
- `docker-compose.yml`: Run everything together

## How to Run

### Option 1: Docker (Fastest)
Just run:
```bash
docker-compose up --build
```
Go to `http://localhost:80` for the app.

### Option 2: Local Development

1. **Backend**:
   ```bash
   cd server
   cp .env.example .env
   npm install
   npm run dev
   ```
   *Make sure you have MongoDB running.*

2. **Frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

## Test Accounts
You can register your own accounts. I tested it by creating one 'Admin' and one 'Sales User' to check the role permissions.
