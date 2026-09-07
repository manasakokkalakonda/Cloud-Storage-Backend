# Cloud-Storage-Backend
A full-featured Google Drive clone backend with Node.js and Express backend service featuring REST APIs, JWT authentication, Multer file upload handling, and supabase integration for a cloud storage web application

### Backend Repository `README.md`
# Cloud Storage Web App - Backend API

The RESTful backend service for the cloud media files storage and sharing web application, handling secure authentication, file handling, and database operations[cite: 1].

## Tech Stack
* **Environment:** Node.js
* **Framework:** Express.js (REST)
* **Database:** PostgreSQL (via Supabase)
* **File Processing:** Multer for managing file uploads

## API Endpoints & Core Features
* **Authentication (`/api/auth`):** Secure session handling, registration, and login validation.
* **Folders (`/api/folders`):** Hierarchical folder CRUD operations (`create`, `rename`, `move`, `delete`).
* **Files (`/api/files`):** Secure upload processing via Multer, metadata storage, and status tracking.
* **Sharing & ACL (`/api/shares`, `/api/link-shares`):** Granular per-user access control lists and public link generation with expiration.
* **Search & Maintenance (`/api/search`, `/api/trash`):** Full-text search support, item starring, and soft-delete trash retention management.

## Environment Variables (`.env`)
Create a `.env` file in the root directory using the following template:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/drive
JWT_SECRET=your-jwt-secret-key
CORS_ORIGIN=http://localhost:5174

Getting Started
Install dependencies:
```powershell
npm install
node server.js
