# Barren - Simple Online Event Ticketing System

Barren is a Node.js based web application for managing event tickets. It uses Express.js for the backend framework and MongoDB for data persistence.

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)

## Features
- **User Authentication**: Register and Login functionality using JSON Web Tokens (JWT).
- **Static Page Serving**: Serves HTML pages for user interaction.
- **Database Integration**: Connects to a MongoDB Atlas cluster.

## Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)
- MongoDB Atlas Account (or local MongoDB instance)

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Barren
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
MONGO_USERNAME=<your_mongo_username>
MONGO_PASSWORD=<your_mongo_password>
MONGO_CLUSTER_URL=<your_cluster_url> (e.g., cluster0.xyz.mongodb.net)
MONGO_DB_NAME=<your_database_name>
MONGO_URI="mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_CLUSTER_URL}/${MONGO_DB_NAME}?retryWrites=true&w=majority"
```

## Usage

1. **Start the server:**
   ```bash
   npm start
   ```
   Or for development with nodemon:
   ```bash
   npm run dev
   ```

2. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`.

## Project Structure

The application follows a MVC (Model-View-Controller) pattern:

- **`app.js`**: The entry point of the application. It connects to the database, sets up middleware, and defines routes.
- **`config/`**: Contains configuration files.
  - `dbConfig.js`: Handles the connection to the MongoDB database.
- **`controllers/`**: Contains the logic for handling requests.
  - `authController.js`: Handles user registration (`register`), login (`login`), and logout (`logout`).
  - `pagesController.js`: Serves the HTML pages for registration and login.
- **`models/`**: Defines the database schemas.
  - `user.js`: Mongoose schema for the User entity (firstName, lastName, email, password).
- **`routes/`**: Defines the API and page routes.
  - `authRoute.js`: Routes for authentication (`/api/auth/register`, `/api/auth/login`).
  - `pagesRoutes.js`: Routes for serving pages (`/auth/register`, `/auth/login`).
- **`utils/`**: Utility functions.
  - `jwt.js`: Helper function to sign JWT tokens.
- **`pages/`**: Contains the static HTML files served by the application.

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint    | Description             | Request Body |
| :----- | :---------- | :---------------------- | :----------- |
| POST   | `/register` | Register a new user     | `{ firstName, lastName, email, password }` |
| POST   | `/login`    | Login an existing user  | `{ email, password }` |

### Pages

| Method | Endpoint          | Description             |
| :----- | :---------------- | :---------------------- |
| GET    | `/`               | Home page               |
| GET    | `/auth/register`  | Registration page       |
| GET    | `/auth/login`     | Login page              |

## Dependencies
- `express`: Web framework for Node.js.
- `mongoose`: MongoDB object modeling tool.
- `dotenv`: Loads environment variables.
- `jsonwebtoken`: Implementation of JSON Web Tokens.
- `nodemon`: Utility that monitors for changes and restarts the server.