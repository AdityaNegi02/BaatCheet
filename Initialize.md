# BaatCheet Project Instructions

This project is a full-stack real-time chat application using React, Node.js, Express, MongoDB, and Socket.IO.

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Socket.IO Client, Axios
- **Backend:** Node.js, Express, Socket.IO, MongoDB (Mongoose), JWT
- **Other:** Multer & Cloudinary for potential file uploads (seen in server dependencies)

## Project Structure
- `./client`: React frontend
- `./server`: Node.js backend

## Development Workflows

### Backend
1. `cd server`
2. `npm install`
3. Ensure `.env` is configured (see README.md)
4. `npm run dev` (starts with nodemon)

### Frontend
1. `cd client`
2. `npm install`
3. `npm run dev` (starts Vite)

## Conventions
- **Code Style:** Follow existing patterns in the codebase.
- **Styling:** Use Tailwind CSS for the frontend.
- **State Management:** Uses React Context API (seen in README.md).
- **API Calls:** Use the configured Axios instance in `client/src/utils/api.js`.
