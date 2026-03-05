# Product List with Cart API

A Node.js/Express backend for managing a product catalog. This project provides a full CRUD (Create, Read, Update, Delete) API that interacts with a `data.json` file.

## Setup

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run the server**:
    - For production: `npm start`
    - For development (with auto-reload): `npm run dev`

The server will be running at `http://localhost:3000`.

## API Endpoints

### Products

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/products` | Retrieve all products. |
| **GET** | `/api/products/:name` | Retrieve a single product by name. |
| **POST** | `/api/products` | Add a new product. |
| **PUT** | `/api/products/:name` | Replace an existing product. |
| **PATCH** | `/api/products/:name` | Partially update a product. |
| **DELETE** | `/api/products/:name` | Remove a product. |

### Static Assets

The product images and icons are served statically at `/assets`.

Example image URL: `http://localhost:3000/assets/images/image-waffle-desktop.jpg`

## Project Structure (MVC Architecture)

The project follows a standard Model-View-Controller (MVC) pattern for better maintainability and scalability:

- `src/config/`: Database connection and configuration (file-based in this case).
- `src/models/`: Data access layer and business logic (Product model).
- `src/controllers/`: Request handling and response coordination.
- `src/routes/`: Route definitions and endpoint mapping.
- `src/app.js`: Express application configuration and middleware.
- `index.js`: Server entry point.
- `assets/`: Static visual assets (images, icons).
- `data.json`: Local JSON database.
